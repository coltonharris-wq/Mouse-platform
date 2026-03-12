/**
 * DELETE /api/conversations/[id] — Soft-delete a conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await supabaseQuery('conversations', 'PATCH',
      { is_active: false },
      `id=eq.${id}`
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[CONVERSATION_DELETE]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
