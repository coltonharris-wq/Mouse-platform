/**
 * POST /api/webhooks/twilio/[customer_id]/respond
 * Core conversation handler — AI-powered turn-by-turn call handling.
 * Replaces VM-based approach with direct LLM + structured actions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { getCustomerUrl } from '@/lib/urls';
import { textToSpeechUrl, DEFAULT_VOICE_ID } from '@/lib/elevenlabs';
import {
  buildSystemPrompt,
  getAIResponse,
  compressHistory,
  decompressHistory,
  type AIResponse,
} from '@/lib/receptionist-ai';

function twimlResponse(twiml: string): NextResponse {
  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customer_id: string }> }
) {
  try {
    const { customer_id } = await params;
    const formData = await request.formData();
    const speechResult = formData.get('SpeechResult')?.toString() || '';

    // Parse query params
    const url = new URL(request.url);
    const callSid = url.searchParams.get('sid') || '';
    const turn = parseInt(url.searchParams.get('turn') || '1', 10);
    const callerNumber = url.searchParams.get('caller') || '';
    const historyEncoded = url.searchParams.get('h') || '';

    if (!speechResult) {
      const retryUrl = getCustomerUrl(
        `/api/webhooks/twilio/${customer_id}/respond?sid=${callSid}&turn=${turn}&caller=${encodeURIComponent(callerNumber)}&h=${historyEncoded}`
      );
      return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>I didn't catch that. Could you repeat?</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${escapeXml(retryUrl)}" method="POST">
    <Pause length="1"/>
  </Gather>
  <Say>Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`);
    }

    // Load config + customer info
    const [configs, customers] = await Promise.all([
      supabaseQuery('receptionist_config', 'GET', undefined,
        `user_id=eq.${customer_id}&select=*`
      ),
      supabaseQuery('customers', 'GET', undefined,
        `id=eq.${customer_id}&select=company_name`
      ),
    ]);
    const config = configs?.[0];
    const customer = customers?.[0];
    const businessName = config?.business_name || customer?.company_name || 'our business';
    const voiceId = config?.voice_id || DEFAULT_VOICE_ID;

    // Decompress conversation history
    const history = historyEncoded ? decompressHistory(historyEncoded) : [];

    // Build AI prompt and get response
    const systemPrompt = buildSystemPrompt({
      businessName,
      greeting: config?.greeting_text || '',
      voiceId,
    });

    const aiResponse: AIResponse = await getAIResponse(systemPrompt, history, speechResult);

    // Handle structured actions
    if (aiResponse.action && aiResponse.action_data) {
      await handleAction(customer_id, callSid, callerNumber, aiResponse);
    }

    // Update history with this turn
    const updatedHistory = [
      ...history,
      { role: 'caller' as const, text: speechResult },
      { role: 'receptionist' as const, text: aiResponse.response_text },
    ];
    const compressedHistory = compressHistory(updatedHistory);

    // End call if requested
    if (aiResponse.action === 'end_call' || turn >= 10) {
      const audioUrl = await textToSpeechUrl(aiResponse.response_text, voiceId);
      if (audioUrl) {
        return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${escapeXml(audioUrl)}</Play>
  <Hangup/>
</Response>`);
      }
      return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${escapeXml(aiResponse.response_text)}</Say>
  <Hangup/>
</Response>`);
    }

    // Build next turn URL
    const nextUrl = getCustomerUrl(
      `/api/webhooks/twilio/${customer_id}/respond?sid=${callSid}&turn=${turn + 1}&caller=${encodeURIComponent(callerNumber)}&h=${compressedHistory}`
    );

    // Generate ElevenLabs audio for response
    const audioUrl = await textToSpeechUrl(aiResponse.response_text, voiceId);

    if (audioUrl) {
      return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${escapeXml(audioUrl)}</Play>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${escapeXml(nextUrl)}" method="POST">
    <Pause length="1"/>
  </Gather>
  <Say>Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`);
    }

    // Fallback to Twilio TTS
    const cleanText = aiResponse.response_text.replace(/[*_#`]/g, '').replace(/\n+/g, ' ').trim();
    return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${escapeXml(cleanText)}</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${escapeXml(nextUrl)}" method="POST">
    <Pause length="1"/>
  </Gather>
  <Say>Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`);
  } catch (err) {
    console.error('[TWILIO_RESPOND]', err);
    return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>I'm sorry, I'm having trouble right now. Please try again later.</Say>
  <Hangup/>
</Response>`);
  }
}

/**
 * Handle structured AI actions — book appointments, take messages.
 */
async function handleAction(
  customerId: string,
  callSid: string,
  callerNumber: string,
  aiResponse: AIResponse
) {
  try {
    // Find the call log entry for this call
    const callLogs = await supabaseQuery('call_logs', 'GET', undefined,
      `twilio_call_sid=eq.${callSid}&select=id&limit=1`
    );
    const callLogId = callLogs?.[0]?.id || null;

    if (aiResponse.action === 'book_appointment' && aiResponse.action_data) {
      await supabaseQuery('appointments', 'POST', {
        customer_id: customerId,
        call_log_id: callLogId,
        caller_name: aiResponse.action_data.caller_name || 'Unknown',
        caller_phone: aiResponse.action_data.caller_phone || callerNumber,
        preferred_date: aiResponse.action_data.preferred_date,
        preferred_time: aiResponse.action_data.preferred_time,
        service_requested: aiResponse.action_data.service_requested,
        notes: aiResponse.action_data.notes,
        status: 'pending',
      });

      // Update call log with action
      if (callLogId) {
        await supabaseQuery('call_logs', 'PATCH',
          { action_taken: 'book_appointment' },
          `id=eq.${callLogId}`
        );
      }
    }

    if (aiResponse.action === 'take_message' && aiResponse.action_data) {
      await supabaseQuery('receptionist_messages', 'POST', {
        customer_id: customerId,
        call_log_id: callLogId,
        caller_name: aiResponse.action_data.caller_name || 'Unknown',
        caller_phone: aiResponse.action_data.caller_phone || callerNumber,
        message: aiResponse.action_data.message,
        urgency: aiResponse.action_data.urgency || 'normal',
        read: false,
      });

      if (callLogId) {
        await supabaseQuery('call_logs', 'PATCH',
          { action_taken: 'take_message' },
          `id=eq.${callLogId}`
        );
      }
    }
  } catch (err) {
    console.error('[RECEPTIONIST_ACTION]', err);
    // Non-fatal — don't interrupt the call
  }
}
