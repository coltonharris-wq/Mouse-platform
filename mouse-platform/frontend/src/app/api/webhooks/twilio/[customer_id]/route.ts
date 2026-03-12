/**
 * POST /api/webhooks/twilio/[customer_id]
 * Inbound call webhook — plays greeting, gathers speech, routes to KingMouse.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
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

    // Get receptionist config
    const configs = await supabaseQuery('receptionist_config', 'GET', undefined,
      `customer_id=eq.${customer_id}&select=*`
    );
    const config = configs?.[0];

    if (!config || !config.is_enabled) {
      return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>This number is not currently active. Please try again later.</Say>
  <Hangup/>
</Response>`);
    }

    // Check business hours
    const now = new Date();
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = dayNames[now.getDay()];
    const hours = config.business_hours?.[today];

    if (!hours) {
      // After hours
      const afterHoursMsg = config.after_hours_message || 'We are currently closed. Please leave a message.';
      if (config.voicemail_enabled) {
        return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${config.voice_id || 'alloy'}">${afterHoursMsg}</Say>
  <Say>Please leave a message after the beep.</Say>
  <Record maxLength="120" transcribe="true" />
</Response>`);
      }
      return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${config.voice_id || 'alloy'}">${afterHoursMsg}</Say>
  <Hangup/>
</Response>`);
    }

    // Play greeting and gather speech
    const greeting = config.greeting_text || 'Hello, thank you for calling. How can I help you today?';
    return twimlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${config.voice_id || 'alloy'}">${greeting}</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${getCustomerUrl(`/api/webhooks/twilio/${customer_id}/respond`)}" method="POST">
    <Say>I'm listening.</Say>
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
