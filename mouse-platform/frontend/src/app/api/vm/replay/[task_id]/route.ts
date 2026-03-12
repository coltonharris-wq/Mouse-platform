/**
 * GET /api/vm/replay/{task_id}?customer_id=xxx
 * Returns ordered list of screenshots for task replay playback.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ task_id: string }> }
) {
  const { task_id } = await params;
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  if (!task_id) {
    return NextResponse.json({ error: 'task_id required' }, { status: 400 });
  }

  try {
    const screenshots = await supabaseQuery(
      'task_screenshots',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&task_id=eq.${task_id}&select=id,screenshot_url,captured_at&order=captured_at.asc`
    );

    return NextResponse.json({
      task_id,
      screenshots: screenshots || [],
      count: (screenshots || []).length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_REPLAY]', message);
    return NextResponse.json({ error: 'Failed to fetch replay' }, { status: 500 });
  }
}
