/**
 * POST /api/webhooks/twilio/[customer_id]/respond
 * Handle speech input — route to KingMouse, return TwiML response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { bashExec } from '@/lib/orgo';
import { getCustomerUrl } from '@/lib/urls';

function twimlResponse(twiml: string): NextResponse {
  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customer_id: string }> }
) {
  try {
    const { customer_id } = await params;
    const formData = await request.formData();
    const speechResult = formData.get('SpeechResult')?.toString() || '';

    if (!speechResult) {
      return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>I didn't catch that. Could you repeat?</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${getCustomerUrl(`/api/webhooks/twilio/${customer_id}/respond`)}" method="POST">
    <Say>I'm listening.</Say>
  </Gather>
  <Say>Goodbye.</Say>
  <Hangup/>
</Response>`);
    }

    // Get customer's VM
    const customers = await supabaseQuery('customers', 'GET', undefined,
      `id=eq.${customer_id}&select=vm_computer_id,vm_status,company_name`
    );
    const customer = customers?.[0];

    let responseText: string;

    if (customer?.vm_computer_id && customer?.vm_status === 'running') {
      try {
        const escapedSpeech = speechResult.replace(/'/g, "'\\''");
        const result = await bashExec(
          customer.vm_computer_id,
          `cd /opt/kingmouse/workspace && echo 'Phone call from customer: ${escapedSpeech}' | openclaw chat 2>/dev/null`,
          30
        );
        responseText = result.success && result.data?.output
          ? result.data.output.trim().substring(0, 500)
          : `Thank you for calling ${customer.company_name || 'us'}. Let me help you with that. Could you provide more details?`;
      } catch {
        responseText = `Thank you for calling. I'll make sure your message is received. Is there anything else I can help with?`;
      }
    } else {
      responseText = `Thank you for calling. Our system is being set up. Please try again shortly or leave a message.`;
    }

    // Clean response for TwiML (remove markdown/emojis)
    responseText = responseText.replace(/[*_#`]/g, '').replace(/\n+/g, ' ').trim();

    return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${responseText}</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${getCustomerUrl(`/api/webhooks/twilio/${customer_id}/respond`)}" method="POST">
    <Say>Is there anything else I can help with?</Say>
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
