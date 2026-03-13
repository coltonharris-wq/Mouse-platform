import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await supabaseQuery(
      'lead_funnels', 'GET', undefined,
      `id=eq.${id}&select=*`
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Stringify JSON fields if present
    const update: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() };
    if (body.services) update.services = JSON.stringify(body.services);
    if (body.capture_fields) update.capture_fields = JSON.stringify(body.capture_fields);
    if (body.follow_up_config) update.follow_up_config = JSON.stringify(body.follow_up_config);
    if (body.ad_copy) update.ad_copy = JSON.stringify(body.ad_copy);

    await supabaseQuery('lead_funnels', 'PATCH', update, `id=eq.${id}`);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
