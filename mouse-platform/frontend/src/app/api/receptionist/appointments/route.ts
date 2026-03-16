/**
 * GET /api/receptionist/appointments?customer_id=...
 * Fetch appointments booked by the AI receptionist.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customer_id');
    if (!customerId) return NextResponse.json({ error: 'customer_id required' }, { status: 400 });

    const appointments = await supabaseQuery('appointments', 'GET', undefined,
      `customer_id=eq.${customerId}&select=*&order=created_at.desc&limit=20`
    );

    return NextResponse.json({ appointments: appointments || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
