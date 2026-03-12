/**
 * POST /api/conversations — Create new conversation
 * GET  /api/conversations?customer_id=xxx — List conversations (newest first)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { customer_id } = await request.json();

    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
    }

    const rows = await supabaseQuery('conversations', 'POST', {
      customer_id,
      title: 'New conversation',
      is_active: true,
      message_count: 0,
    });

    const conversation = rows?.[0];
    return NextResponse.json(conversation || { error: 'Failed to create' }, { status: conversation ? 200 : 500 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[CONVERSATIONS_POST]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customer_id');

    if (!customerId) {
      return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
    }

    const conversations = await supabaseQuery(
      'conversations',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&is_active=eq.true&order=created_at.desc&select=*`
    );

    return NextResponse.json({ conversations: conversations || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[CONVERSATIONS_GET]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
