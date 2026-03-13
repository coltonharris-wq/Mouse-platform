import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Toggle: if active → paused, if paused → active
    const rows = await supabaseQuery('lead_funnels', 'GET', undefined, `id=eq.${id}&select=status`);
    const currentStatus = rows?.[0]?.status;
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    await supabaseQuery('lead_funnels', 'PATCH', {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }, `id=eq.${id}`);
    return NextResponse.json({ success: true, status: newStatus });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
