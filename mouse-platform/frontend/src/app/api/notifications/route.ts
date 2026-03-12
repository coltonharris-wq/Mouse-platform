/**
 * GET /api/notifications?customer_id=xxx&unread=true
 * List notifications for a customer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');
  const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true';

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    let filters = `customer_id=eq.${customerId}&order=created_at.desc&limit=20`;
    if (unreadOnly) {
      filters += '&read=eq.false';
    }

    const notifications = await supabaseQuery(
      'customer_notifications',
      'GET',
      undefined,
      filters
    );

    // Count unread
    let unreadCount = 0;
    try {
      const unread = await supabaseQuery(
        'customer_notifications',
        'GET',
        undefined,
        `customer_id=eq.${customerId}&read=eq.false&select=id`
      );
      unreadCount = unread?.length || 0;
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      notifications: notifications || [],
      unread_count: unreadCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[NOTIFICATIONS]', message);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications — mark single notification as read
 * Body: { id: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await supabaseQuery(
      'customer_notifications',
      'PATCH',
      { read: true },
      `id=eq.${id}`
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[NOTIFICATIONS_PATCH]', message);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
