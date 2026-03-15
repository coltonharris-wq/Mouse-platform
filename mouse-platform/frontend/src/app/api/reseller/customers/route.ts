import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    const customers = await supabaseQuery(
      'reseller_customers',
      'GET',
      undefined,
      `reseller_id=eq.${resellerId}&order=invited_at.desc`
    );

    const items = Array.isArray(customers) ? customers : [];

    const active = items.filter((c: Record<string, string>) => c.status === 'active');
    const totalMrr = active.reduce((sum: number, c: Record<string, number>) => {
      const rate = c.customer_rate || 7.48;
      const hours = c.total_hours_used || 0;
      return sum + (rate * hours);
    }, 0);
    const totalEarnings = items.reduce((sum: number, c: Record<string, number>) => sum + (c.total_commission || 0), 0);
    const avgHours = active.length > 0
      ? active.reduce((sum: number, c: Record<string, number>) => sum + (c.total_hours_used || 0), 0) / active.length
      : 0;

    return NextResponse.json({
      customers: items,
      summary: {
        totalMrr,
        totalEarnings,
        activeCount: active.length,
        avgHours,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
