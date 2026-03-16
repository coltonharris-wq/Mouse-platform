import { NextRequest, NextResponse } from 'next/server';
import { purchaseNumber, configureWebhook } from '@/lib/twilio-client';
import { supabaseQuery } from '@/lib/supabase-server';
import { getCustomerUrl } from '@/lib/urls';
import { checkBalance, deductHours, BILLING_RATES } from '@/lib/billing';

export async function POST(request: NextRequest) {
  try {
    const { customer_id, phone_number } = await request.json();
    if (!customer_id || !phone_number) {
      return NextResponse.json({ error: 'customer_id and phone_number required' }, { status: 400 });
    }

    // ── HOUR ENFORCEMENT — phone provisioning costs ~$28 ──
    const balanceError = await checkBalance(customer_id, BILLING_RATES.PHONE_PROVISION);
    if (balanceError) {
      return NextResponse.json(
        { error: 'Insufficient hours to provision a phone number. You need at least 5.6 hours remaining ($28 value). Please purchase more hours first.', balance_error: true },
        { status: 402 }
      );
    }

    const result = await purchaseNumber(phone_number);

    await configureWebhook(
      result.sid,
      getCustomerUrl(`/api/webhooks/twilio/${customer_id}`),
      getCustomerUrl(`/api/webhooks/twilio/status/${customer_id}`)
    );

    // Save to DB
    await supabaseQuery('customer_phone_numbers', 'POST', {
      customer_id,
      phone_number: result.phone_number,
      twilio_sid: result.sid,
      friendly_name: result.friendly_name,
      area_code: phone_number.substring(2, 5),
      status: 'active',
    });

    // Resolve user_id for receptionist_config (table uses user_id)
    let userId = customer_id;
    try {
      const cust = await supabaseQuery('customers', 'GET', undefined,
        `id=eq.${customer_id}&select=user_id`
      );
      if (cust?.[0]?.user_id) userId = cust[0].user_id;
    } catch { /* use customer_id as fallback */ }

    // Create default receptionist config
    const existing = await supabaseQuery('receptionist_config', 'GET', undefined,
      `user_id=eq.${userId}&select=id`
    );
    if (!existing || existing.length === 0) {
      await supabaseQuery('receptionist_config', 'POST', {
        user_id: userId,
        enabled: true,
      });
    } else {
      await supabaseQuery('receptionist_config', 'PATCH',
        { enabled: true },
        `user_id=eq.${userId}`
      );
    }

    // Update customer
    await supabaseQuery('customers', 'PATCH',
      { receptionist_enabled: true },
      `id=eq.${customer_id}`
    );

    // ── DEDUCT HOURS for phone provisioning ──
    try {
      await deductHours(
        customer_id,
        BILLING_RATES.PHONE_PROVISION,
        'twilio_phone_number',
        `Phone provisioned: ${result.phone_number}`
      );
    } catch (billErr) {
      console.error('[PHONE_PURCHASE] Hour deduction failed:', billErr);
    }

    return NextResponse.json({ success: true, phone_number: result.phone_number, sid: result.sid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[PHONE_PURCHASE]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
