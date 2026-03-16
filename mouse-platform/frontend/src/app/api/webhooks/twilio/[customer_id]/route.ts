/**
 * POST /api/webhooks/twilio/[customer_id]
 * Inbound call webhook — generates ElevenLabs greeting, gathers speech.
 * Falls back to Twilio <Say> if ElevenLabs is unavailable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { getCustomerUrl } from '@/lib/urls';
import { textToSpeechUrl, DEFAULT_VOICE_ID } from '@/lib/elevenlabs';
import { getBalance, BILLING_RATES } from '@/lib/billing';

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
    const callSid = formData.get('CallSid')?.toString() || '';
    const callerNumber = formData.get('From')?.toString() || '';

    // Get receptionist config
    const configs = await supabaseQuery('receptionist_config', 'GET', undefined,
      `user_id=eq.${customer_id}&select=*`
    );
    const config = configs?.[0];

    if (!config || !config.enabled) {
      return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>This number is not currently active. Please try again later.</Say>
  <Hangup/>
</Response>`);
    }

    // ── HOUR ENFORCEMENT — reject calls if customer has no hours ──
    const balance = await getBalance(customer_id);
    if (!balance || balance.remaining < BILLING_RATES.VOICE_CALL_PER_MIN) {
      return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We're sorry, this service is temporarily unavailable. Please contact the business directly.</Say>
  <Hangup/>
</Response>`);
    }

    // Check business hours
    const now = new Date();
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = dayNames[now.getDay()];
    const hours = config.business_hours?.[today];

    if (hours === false) {
      // Explicitly closed (null/undefined means always open)
      const afterHoursMsg = config.after_hours_message || 'We are currently closed. Please leave a message.';
      if (config.voicemail_enabled) {
        return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${escapeXml(afterHoursMsg)}</Say>
  <Say>Please leave a message after the beep.</Say>
  <Record maxLength="120" transcribe="true" />
</Response>`);
      }
      return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${escapeXml(afterHoursMsg)}</Say>
  <Hangup/>
</Response>`);
    }

    // Generate greeting
    const greeting = config.greeting_text || `Hello, thank you for calling ${config.business_name || 'us'}. How can I help you today?`;
    const voiceId = config.voice_id || DEFAULT_VOICE_ID;

    // Build the respond URL with initial context
    const respondUrl = getCustomerUrl(
      `/api/webhooks/twilio/${customer_id}/respond?sid=${callSid}&turn=1&caller=${encodeURIComponent(callerNumber)}`
    );

    // Try ElevenLabs audio
    const audioUrl = await textToSpeechUrl(greeting, voiceId);

    if (audioUrl) {
      return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${escapeXml(audioUrl)}</Play>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${escapeXml(respondUrl)}" method="POST">
    <Pause length="1"/>
  </Gather>
  <Say>I didn't hear anything. Goodbye.</Say>
  <Hangup/>
</Response>`);
    }

    // Fallback to Twilio TTS
    return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${escapeXml(greeting)}</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${escapeXml(respondUrl)}" method="POST">
    <Pause length="1"/>
  </Gather>
  <Say>I didn't hear anything. Goodbye.</Say>
  <Hangup/>
</Response>`);
  } catch (err) {
    console.error('[TWILIO_INBOUND]', err);
    return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`);
  }
}
