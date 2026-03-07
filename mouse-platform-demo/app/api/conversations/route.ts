export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getConversationHistory } from '@/lib/king-mouse-context';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const portal = searchParams.get('portal') as 'customer' | 'reseller' | 'admin' || 'customer';
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const history = await getConversationHistory(userId, portal, limit);

  return NextResponse.json({ messages: history });
}

/**
 * POST /api/conversations — Save/replace conversation for a user (Doctor Visit, New Session save).
 * Body: { userId: string, portal: 'customer' | 'reseller' | 'admin', messages: { role, content, timestamp }[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, portal, messages } = body as {
      userId?: string;
      portal?: 'customer' | 'reseller' | 'admin';
      messages?: { role: string; content: string; timestamp?: string }[];
    };

    if (!userId || !portal || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'userId, portal, and non-empty messages array required' },
        { status: 400 }
      );
    }

    const validPortal = ['customer', 'reseller', 'admin'].includes(portal) ? portal : 'customer';
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { error: deleteErr } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId)
      .eq('portal', validPortal);

    if (deleteErr) {
      console.error('[conversations] Delete failed:', deleteErr);
      return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 });
    }

    const rows = messages.map((m) => ({
      user_id: userId,
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: (m.content || '').slice(0, 100_000),
      portal: validPortal,
    }));

    const { error: insertErr } = await supabase.from('conversations').insert(rows);

    if (insertErr) {
      console.error('[conversations] Insert failed:', insertErr);
      return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[conversations] POST error:', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
