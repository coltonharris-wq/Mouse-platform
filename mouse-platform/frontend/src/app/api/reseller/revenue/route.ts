import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    // Get all businesses for this reseller
    const businesses = await supabaseQuery(
      'reseller_businesses',
      'GET',
      undefined,
      `reseller_id=eq.${resellerId}&select=id,business_name,customer_id,status,monthly_revenue_cents,custom_hourly_rate_cents`
    );

    const bizList = businesses || [];
    const activeCount = bizList.filter((b: { status: string }) => b.status === 'active').length;

    // Aggregate revenue from businesses
    let totalRevenue = 0;
    const perCustomer: {
      business_name: string;
      products: string[];
      revenue: number;
      hours: number;
      leads: number;
      profit: number;
    }[] = [];

    let receptionistCustomers = 0;
    let receptionistRevenue = 0;

    for (const biz of bizList) {
      const rev = biz.monthly_revenue_cents || 0;
      totalRevenue += rev;

      const products: string[] = [];
      let bizReceptionistRev = 0;

      // Check if business has voice agent
      if (biz.customer_id) {
        try {
          const configs = await supabaseQuery(
            'receptionist_config',
            'GET',
            undefined,
            `customer_id=eq.${biz.customer_id}&select=id,is_enabled`
          );
          if (configs && configs.length > 0 && configs[0].is_enabled) {
            products.push('receptionist');
            receptionistCustomers++;
            // Estimate receptionist revenue as portion of total
            bizReceptionistRev = Math.round(rev * 0.4);
            receptionistRevenue += bizReceptionistRev;
          }
        } catch { /* skip */ }
      }

      const rate = biz.custom_hourly_rate_cents || 498;
      const baseRate = 498;
      const profitMargin = (rate - baseRate) / rate;
      const bizProfit = Math.round(rev * profitMargin);
      const hours = rate > 0 ? Math.round((rev / rate) * 10) / 10 : 0;

      perCustomer.push({
        business_name: biz.business_name,
        products,
        revenue: rev,
        hours,
        leads: 0,
        profit: bizProfit,
      });
    }

    const baseRate = 498;
    const avgRate = bizList.length > 0
      ? Math.round(bizList.reduce((s: number, b: { custom_hourly_rate_cents?: number }) => s + (b.custom_hourly_rate_cents || baseRate), 0) / bizList.length)
      : baseRate;
    const avgProfitMargin = (avgRate - baseRate) / (avgRate || 1);
    const totalProfit = Math.round(totalRevenue * avgProfitMargin);
    const avgPerCustomer = activeCount > 0 ? Math.round(totalRevenue / activeCount) : 0;

    const receptionistCost = Math.round(receptionistRevenue * 0.4);
    const receptionistProfit = receptionistRevenue - receptionistCost;
    const receptionistMargin = receptionistRevenue > 0 ? Math.round((receptionistProfit / receptionistRevenue) * 100) : 0;

    // Generate last 6 months for chart
    const monthly: { month: string; receptionist: number; lead_funnel: number; king_mouse: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toISOString().slice(0, 7);
      // Current month gets real-ish data, past months get zeros (no historical data yet)
      const isCurrent = i === 0;
      monthly.push({
        month: monthStr,
        receptionist: isCurrent ? receptionistProfit : 0,
        lead_funnel: 0,
        king_mouse: isCurrent ? (totalProfit - receptionistProfit) : 0,
      });
    }

    return NextResponse.json({
      summary: {
        total_revenue: totalRevenue,
        total_profit: totalProfit,
        active_customers: activeCount,
        avg_per_customer: avgPerCustomer,
      },
      by_product: [
        {
          product: 'receptionist',
          customers: receptionistCustomers,
          revenue: receptionistRevenue,
          cost: receptionistCost,
          profit: receptionistProfit,
          margin: receptionistMargin,
        },
        { product: 'lead_funnel', customers: 0, revenue: 0, cost: 0, profit: 0, margin: 0 },
        {
          product: 'king_mouse',
          customers: activeCount - receptionistCustomers,
          revenue: totalRevenue - receptionistRevenue,
          cost: Math.round((totalRevenue - receptionistRevenue) * 0.3),
          profit: totalProfit - receptionistProfit,
          margin: totalRevenue - receptionistRevenue > 0
            ? Math.round(((totalProfit - receptionistProfit) / (totalRevenue - receptionistRevenue)) * 100)
            : 0,
        },
      ],
      monthly,
      per_customer: perCustomer,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[REVENUE]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
