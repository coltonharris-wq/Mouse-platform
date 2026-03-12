/**
 * POST /api/webhooks/twilio/status/[customer_id]
 * Call status callback — log call to call_logs table.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customer_id: string }> }
) {
  try {
    const { customer_id } = await params;
    const formData = await request.formData();

    const callSid = formData.get('CallSid')?.toString() || '';
    const callStatus = formData.get('CallStatus')?.toString() || '';
    const callerNumber = formData.get('From')?.toString() || '';
    const duration = parseInt(formData.get('CallDuration')?.toString() || '0', 10);
    const recordingUrl = formData.get('RecordingUrl')?.toString() || null;

    if (callStatus === 'completed' || callStatus === 'no-answer' || callStatus === 'busy' || callStatus === 'failed') {
      // Find phone number ID
      const phones = await supabaseQuery('customer_phone_numbers', 'GET', undefined,
        `customer_id=eq.${customer_id}&status=eq.active&select=id&limit=1`
      );

      await supabaseQuery('call_logs', 'POST', {
        customer_id,
        phone_number_id: phones?.[0]?.id || null,
        caller_number: callerNumber,
        direction: 'inbound',
        duration_seconds: duration,
        status: callStatus,
        twilio_call_sid: callSid,
        recording_url: recordingUrl,
      });
    }

    return new NextResponse('<Response/>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (err) {
    console.error('[TWILIO_STATUS]', err);
    return new NextResponse('<Response/>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
