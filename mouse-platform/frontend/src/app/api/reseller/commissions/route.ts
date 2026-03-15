import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    const commissions = await supabaseQuery(
      'reseller_commissions',
      'GET',
      undefined,
      `reseller_id=eq.${resellerId}&order=created_at.desc`
    );

    const items = Array.isArray(commissions) ? commissions : [];

    // Calculate summary metrics
    const totalEarned = items.reduce((sum: number, c: Record<string, number>) => sum + (c.commission_amount || 0), 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const thisMonth = items
      .filter((c: Record<string, string>) => c.period_start >= monthStart)
      .reduce((sum: number, c: Record<string, number>) => sum + (c.commission_amount || 0), 0);
    const pending = items
      .filter((c: Record<string, string>) => c.status === 'pending')
      .reduce((sum: number, c: Record<string, number>) => sum + (c.commission_amount || 0), 0);
    const avgMargin = items.length > 0
      ? items.reduce((sum: number, c: Record<string, number>) => sum + (c.margin_per_hour || 0), 0) / items.length
      : 0;

    return NextResponse.json({
      commissions: items,
      summary: { totalEarned, thisMonth, pending, avgMargin },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
