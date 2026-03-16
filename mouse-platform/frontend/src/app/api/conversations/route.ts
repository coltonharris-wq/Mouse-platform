/**
 * POST /api/conversations — Create new conversation
 * GET  /api/conversations?customer_id=xxx — List conversations (newest first)
 *
 * Schema: conversations(id, user_id, title, niche, created_at, updated_at)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

/** Resolve customer_id (may be customers.id or auth user_id) to auth user_id */
async function resolveUserId(customerId: string): Promise<string> {
  try {
    const byId = await supabaseQuery('customers', 'GET', undefined,
      `id=eq.${customerId}&select=user_id`
    );
    if (byId?.[0]?.user_id) return byId[0].user_id;
  } catch { /* fallback below */ }

  try {
    const byUid = await supabaseQuery('customers', 'GET', undefined,
      `user_id=eq.${customerId}&select=user_id`
    );
    if (byUid?.[0]?.user_id) return byUid[0].user_id;
  } catch { /* fallback below */ }

  return customerId; // use as-is
}

export async function POST(request: NextRequest) {
  try {
    const { customer_id } = await request.json();

    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
    }

    const userId = await resolveUserId(customer_id);

    const rows = await supabaseQuery('conversations', 'POST', {
      user_id: userId,
      title: 'New conversation',
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

    const userId = await resolveUserId(customerId);

    const conversations = await supabaseQuery(
      'conversations',
      'GET',
      undefined,
      `user_id=eq.${userId}&order=created_at.desc&select=*`
    );

    return NextResponse.json({ conversations: conversations || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[CONVERSATIONS_GET]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
