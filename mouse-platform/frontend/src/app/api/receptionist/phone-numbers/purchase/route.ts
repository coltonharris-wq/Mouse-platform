import { NextRequest, NextResponse } from 'next/server';
import { purchaseNumber, configureWebhook } from '@/lib/twilio-client';
import { supabaseQuery } from '@/lib/supabase-server';
import { getCustomerUrl } from '@/lib/urls';

export async function POST(request: NextRequest) {
  try {
    const { customer_id, phone_number } = await request.json();
    if (!customer_id || !phone_number) {
      return NextResponse.json({ error: 'customer_id and phone_number required' }, { status: 400 });
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

    // Create default receptionist config
    const existing = await supabaseQuery('receptionist_config', 'GET', undefined,
      `customer_id=eq.${customer_id}&select=id`
    );
    if (!existing || existing.length === 0) {
      await supabaseQuery('receptionist_config', 'POST', {
        customer_id,
        is_enabled: true,
      });
    } else {
      await supabaseQuery('receptionist_config', 'PATCH',
        { is_enabled: true },
        `customer_id=eq.${customer_id}`
      );
    }

    // Update customer
    await supabaseQuery('customers', 'PATCH',
      { receptionist_enabled: true },
      `id=eq.${customer_id}`
    );

    return NextResponse.json({ success: true, phone_number: result.phone_number, sid: result.sid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[PHONE_PURCHASE]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
