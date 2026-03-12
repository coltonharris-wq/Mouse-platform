import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, phone_number, carrier_name, carrier_account_number, carrier_pin, business_name, business_address, authorized_name } = body;

    if (!customer_id || !phone_number || !carrier_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await supabaseQuery('port_requests', 'POST', {
      customer_id,
      phone_number,
      carrier_name,
      carrier_account_number,
      carrier_pin,
      business_name,
      business_address,
      authorized_name,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
