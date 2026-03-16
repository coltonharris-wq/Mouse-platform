/**
 * GET  /api/receptionist/messages?customer_id=...
 * PATCH /api/receptionist/messages  — mark messages as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customer_id');
    if (!customerId) return NextResponse.json({ error: 'customer_id required' }, { status: 400 });

    const messages = await supabaseQuery('receptionist_messages', 'GET', undefined,
      `customer_id=eq.${customerId}&select=*&order=created_at.desc&limit=20`
    );

    return NextResponse.json({ messages: messages || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { message_id } = await request.json();
    if (!message_id) return NextResponse.json({ error: 'message_id required' }, { status: 400 });

    await supabaseQuery('receptionist_messages', 'PATCH',
      { read: true },
      `id=eq.${message_id}`
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
