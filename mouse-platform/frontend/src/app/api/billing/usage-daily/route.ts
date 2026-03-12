/**
 * GET /api/billing/usage-daily?customer_id=xxx
 * Returns daily hours for the current billing period: [{date, hours}]
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    // Current billing period = current calendar month
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodStartStr = periodStart.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    // Try daily_metrics first
    const metrics = await supabaseQuery(
      'daily_metrics',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&date=gte.${periodStartStr}&date=lte.${todayStr}&select=date,hours_worked&order=date.asc`
    );

    if (metrics && metrics.length > 0) {
      const daily = metrics.map((m: { date: string; hours_worked: string | number }) => ({
        date: m.date,
        hours: parseFloat(String(m.hours_worked)) || 0,
      }));
      return NextResponse.json({ daily });
    }

    // Fallback: compute from vm_telemetry
    const sessions = await supabaseQuery(
      'vm_telemetry',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&started_at=gte.${periodStartStr}T00:00:00&select=started_at,billed_hours&order=started_at.asc`
    );

    const dayMap: Record<string, number> = {};
    if (sessions) {
      for (const s of sessions) {
        const date = new Date(s.started_at).toISOString().split('T')[0];
        dayMap[date] = (dayMap[date] || 0) + (parseFloat(String(s.billed_hours)) || 0);
      }
    }

    // Fill in all days of the period
    const daily: { date: string; hours: number }[] = [];
    const cursor = new Date(periodStart);
    while (cursor <= now) {
      const d = cursor.toISOString().split('T')[0];
      daily.push({ date: d, hours: Math.round((dayMap[d] || 0) * 100) / 100 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return NextResponse.json({ daily });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[BILLING_USAGE_DAILY]', message);
    return NextResponse.json({ error: 'Failed to fetch daily usage' }, { status: 500 });
  }
}
