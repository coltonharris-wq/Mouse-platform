/**
 * GET /api/customers/[id]
 * Returns customer data (used by provisioning page to get full customer info)
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
