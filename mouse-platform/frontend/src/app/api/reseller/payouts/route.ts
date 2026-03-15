import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    const payouts = await supabaseQuery(
      'reseller_payouts',
      'GET',
      undefined,
      `reseller_id=eq.${resellerId}&order=created_at.desc`
    );

    const items = Array.isArray(payouts) ? payouts : [];
    const totalPaid = items
      .filter((p: Record<string, string>) => p.status === 'deposited')
      .reduce((sum: number, p: Record<string, number>) => sum + (p.amount || 0), 0);

    // Next Friday
    const now = new Date();
    const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(now.getTime() + daysUntilFriday * 86400000);
    const nextPayoutDate = nextFriday.toISOString().split('T')[0];

    return NextResponse.json({
      payouts: items,
      summary: { totalPaid, nextPayoutDate, frequency: 'Weekly (Fridays)' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
