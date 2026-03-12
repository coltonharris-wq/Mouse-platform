import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customer_id');
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    const type = request.nextUrl.searchParams.get('type');
    const category = request.nextUrl.searchParams.get('category');
    const limit = request.nextUrl.searchParams.get('limit') || '20';
    const offset = request.nextUrl.searchParams.get('offset') || '0';

    if (!customerId && !resellerId) {
      return NextResponse.json({ error: 'customer_id or reseller_id required' }, { status: 400 });
    }

    let filters = 'order=created_at.desc&select=*';
    if (customerId) filters += `&customer_id=eq.${customerId}`;
    if (resellerId) filters += `&reseller_id=eq.${resellerId}`;
    if (type) filters += `&type=eq.${type}`;
    if (category) filters += `&category=eq.${category}`;

    const limitNum = Math.min(parseInt(limit), 100);
    const offsetNum = parseInt(offset);

    const tasks = await supabaseQuery(
      'task_log', 'GET', undefined,
      `${filters}&limit=${limitNum}&offset=${offsetNum}`
    );

    return NextResponse.json({ tasks: tasks || [], limit: limitNum, offset: offsetNum });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
