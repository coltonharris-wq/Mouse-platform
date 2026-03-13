/**
 * GET /api/customers/[id]
 * Returns customer data (used by provisioning page to get full customer info)
 *
 * PATCH /api/customers/[id]
 * Updates customer data (used by onboarding wizard to save answers)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${id}&select=*`
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customers[0]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[CUSTOMER_GET]', message);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = [
      'onboarding_answers',
      'onboarding_complete',
      'business_name',
      'owner_name',
      'phone',
      'location',
      'business_hours',
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await supabaseQuery('customers', 'PATCH', updates, `id=eq.${id}`);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[CUSTOMER_PATCH]', message);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
