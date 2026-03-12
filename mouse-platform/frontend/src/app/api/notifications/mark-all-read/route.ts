/**
 * POST /api/notifications/mark-all-read?customer_id=xxx
 * Mark all notifications as read for a customer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    await supabaseQuery(
      'customer_notifications',
      'PATCH',
      { read: true },
      `customer_id=eq.${customerId}&read=eq.false`
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[NOTIFICATIONS_MARK_ALL]', message);
    return NextResponse.json({ error: 'Failed to mark all read' }, { status: 500 });
  }
}
