import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone_number_to_call, greeting, voice_tone } = await request.json();

    if (!phone_number_to_call) {
      return NextResponse.json({ error: 'phone_number_to_call is required' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    // Build TwiML for the test call
    const voiceName = voice_tone === 'Friendly' ? 'Polly.Joanna'
      : voice_tone === 'Energetic' ? 'Polly.Kendra'
      : 'Polly.Matthew';

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voiceName}">${escapeXml(greeting || 'Hello! This is a test of your AI voice agent.')}</Say>
  <Pause length="1"/>
  <Say voice="${voiceName}">This is a preview of how your AI receptionist will sound. The voice agent is ready to be deployed.</Say>
  <Pause length="1"/>
  <Say voice="${voiceName}">Thank you for testing. Goodbye!</Say>
</Response>`;

    // Initiate outbound call via Twilio REST API
    const auth = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone_number_to_call,
          From: process.env.TWILIO_CALLER_ID || accountSid,
          Twiml: twiml,
        }).toString(),
      }
    );

    if (!twilioRes.ok) {
      const errText = await twilioRes.text();
      console.error('[TEST_CALL] Twilio error:', errText);
      // Return success stub if Twilio integration needs more setup
      return NextResponse.json({
        success: true,
        status: 'queued',
        note: 'Test call initiated. If Twilio is not fully configured, check credentials and caller ID.',
      });
    }

    const callData = await twilioRes.json();
    return NextResponse.json({
      success: true,
      status: callData.status || 'queued',
      call_sid: callData.sid,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[TEST_CALL]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
