import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await supabaseQuery('lead_funnels', 'PATCH', {
      status: 'active',
      updated_at: new Date().toISOString(),
    }, `id=eq.${id}`);
    return NextResponse.json({ success: true, status: 'active' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
