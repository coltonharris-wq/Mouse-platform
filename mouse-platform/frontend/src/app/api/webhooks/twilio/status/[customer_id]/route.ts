/**
 * POST /api/webhooks/twilio/status/[customer_id]
 * Call status callback — log call with AI summary and duration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { deductHours, BILLING_RATES } from '@/lib/billing';

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
      // Check if call log already exists (created during conversation)
      const existing = await supabaseQuery('call_logs', 'GET', undefined,
        `twilio_call_sid=eq.${callSid}&select=id&limit=1`
      );

      // ── DEDUCT HOURS for completed calls with voice usage ──
      if (callStatus === 'completed' && duration > 0) {
        const minutesUsed = Math.ceil(duration / 60);
        const hoursToDeduct = minutesUsed * BILLING_RATES.VOICE_CALL_PER_MIN;

        try {
          await deductHours(
            customer_id,
            hoursToDeduct,
            'elevenlabs_voice',
            `Voice call: ${minutesUsed} min`
          );
        } catch (billErr) {
          console.error('[TWILIO_STATUS] Billing deduction failed:', billErr);
        }
      }

      if (existing && existing.length > 0) {
        // Update existing call log with final status
        await supabaseQuery('call_logs', 'PATCH', {
          duration_seconds: duration,
          status: callStatus,
          recording_url: recordingUrl,
        }, `id=eq.${existing[0].id}`);
      } else {
        // Create new call log
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
