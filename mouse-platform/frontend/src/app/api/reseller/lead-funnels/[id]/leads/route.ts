import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leads = await supabaseQuery(
      'funnel_leads', 'GET', undefined,
      `funnel_id=eq.${id}&order=created_at.desc&select=*`
    );
    return NextResponse.json({ leads: leads || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
