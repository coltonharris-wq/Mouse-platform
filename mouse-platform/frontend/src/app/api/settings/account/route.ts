/**
 * GET /api/settings/account?customer_id=xxx
 * PATCH /api/settings/account — update account info
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customerId}&select=business_name,email,phone,owner_name`
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ account: customers[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[SETTINGS_ACCOUNT_GET]', message);
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, business_name, phone, owner_name } = body;

    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (business_name !== undefined) updates.business_name = business_name;
    if (phone !== undefined) updates.phone = phone;
    if (owner_name !== undefined) updates.owner_name = owner_name;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await supabaseQuery(
      'customers',
      'PATCH',
      updates,
      `id=eq.${customer_id}`
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[SETTINGS_ACCOUNT_PATCH]', message);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}
