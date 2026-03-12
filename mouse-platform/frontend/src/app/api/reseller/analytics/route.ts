import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    // Get businesses for this reseller
    const businesses = await supabaseQuery(
      'reseller_businesses', 'GET', undefined,
      `reseller_id=eq.${resellerId}&select=*`
    ) || [];

    // Get reseller's default markup rate
    const resellers = await supabaseQuery(
      'resellers', 'GET', undefined,
      `id=eq.${resellerId}&select=default_markup_cents`
    );
    const defaultRate = resellers?.[0]?.default_markup_cents || 498;
    const BASE_RATE = 498;

    const totalCustomers = businesses.length;
    const activeCustomers = businesses.filter((b: { status: string }) => b.status === 'active').length;

    // Markup-based revenue: profit = (customer_rate - base_rate) per hour
    let totalCustomerHours = 0;
    let totalProfitCents = 0;
    let rateSum = 0;

    for (const b of businesses) {
      const biz = b as { status: string; custom_hourly_rate_cents?: number; hours_used?: number };
      const rate = biz.custom_hourly_rate_cents || defaultRate;
      const hours = biz.hours_used || 0;
      const profit = (rate - BASE_RATE) * hours;
      totalCustomerHours += hours;
      totalProfitCents += profit;
      rateSum += rate;
    }

    const avgHourlyRateCents = totalCustomers > 0 ? Math.round(rateSum / totalCustomers) : defaultRate;
    const avgProfitPerHourCents = avgHourlyRateCents - BASE_RATE;

    // Customers by status
    const customersByStatus: Record<string, number> = {};
    for (const b of businesses) {
      const s = (b as { status: string }).status || 'invited';
      customersByStatus[s] = (customersByStatus[s] || 0) + 1;
    }

    // Profit by month
    const profitByMonth: { month: string; profit_cents: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.toISOString().slice(0, 7);
      const activeBefore = businesses.filter((b: { status: string; activated_at: string | null }) =>
        b.status === 'active' && b.activated_at && new Date(b.activated_at) <= d
      );
      const profitEst = activeBefore.reduce((sum: number, b: { custom_hourly_rate_cents?: number; hours_used?: number }) => {
        const rate = b.custom_hourly_rate_cents || defaultRate;
        const hours = b.hours_used || 20; // estimate 20 hrs/mo per customer
        return sum + (rate - BASE_RATE) * hours;
      }, 0);
      profitByMonth.push({ month, profit_cents: profitEst || totalProfitCents });
    }

    return NextResponse.json({
      total_customers: totalCustomers,
      active_customers: activeCustomers,
      avg_hourly_rate_cents: avgHourlyRateCents,
      avg_profit_per_hour_cents: avgProfitPerHourCents,
      total_customer_hours_this_month: totalCustomerHours,
      estimated_monthly_profit_cents: totalProfitCents,
      base_rate_cents: BASE_RATE,
      customers_by_status: customersByStatus,
      profit_by_month: profitByMonth,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
