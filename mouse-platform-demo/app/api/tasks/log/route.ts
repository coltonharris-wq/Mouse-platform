import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { user_id, category, action, status, duration_ms, metadata } = await request.json();

    const { data, error } = await supabase.from('task_logs').insert({
      user_id: user_id || 'system',
      category: category || 'general',
      action,
      status: status || 'completed',
      duration_ms: duration_ms || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, task: data });
  } catch (error: any) {
    console.error('Task log error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ success: true, tasks: [] });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    let query = supabase
      .from('task_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, tasks: data || [] });
  } catch (error: any) {
    return NextResponse.json({ success: true, tasks: [] });
  }
}
