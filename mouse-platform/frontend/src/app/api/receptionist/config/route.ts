import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customer_id');
    if (!customerId) return NextResponse.json({ error: 'customer_id required' }, { status: 400 });

    const rows = await supabaseQuery('receptionist_config', 'GET', undefined,
      `customer_id=eq.${customerId}&select=*`
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ config: null });
    }

    // Also get phone number
    const phones = await supabaseQuery('customer_phone_numbers', 'GET', undefined,
      `customer_id=eq.${customerId}&status=eq.active&select=*`
    );

    return NextResponse.json({ config: rows[0], phone_numbers: phones || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, ...updates } = body;
    if (!customer_id) return NextResponse.json({ error: 'customer_id required' }, { status: 400 });

    updates.updated_at = new Date().toISOString();
    await supabaseQuery('receptionist_config', 'PATCH', updates, `customer_id=eq.${customer_id}`);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
