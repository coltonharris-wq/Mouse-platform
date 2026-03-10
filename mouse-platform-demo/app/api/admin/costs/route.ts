export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
  }

  try {
    // Get all usage logs
    const { data: logs, error } = await supabase
      .from('usage_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const usageLogs = logs || [];

    // Aggregate by customer
    const customerCosts: Record<string, {
      customer_id: string;
      vendor_total: number;
      markup_total: number;
      margin_total: number;
      hours_used: number;
      by_service: Record<string, { vendor: number; markup: number; hours: number }>;
    }> = {};

    for (const log of usageLogs) {
      if (!customerCosts[log.customer_id]) {
        customerCosts[log.customer_id] = {
          customer_id: log.customer_id,
          vendor_total: 0,
          markup_total: 0,
          margin_total: 0,
          hours_used: 0,
          by_service: {},
        };
      }
      const c = customerCosts[log.customer_id];
      c.vendor_total += log.vendor_cost || 0;
      c.markup_total += log.marked_up_cost || 0;
      c.margin_total += log.margin || 0;
      c.hours_used += log.hours_deducted || 0;

      const svc = log.service || 'unknown';
      if (!c.by_service[svc]) c.by_service[svc] = { vendor: 0, markup: 0, hours: 0 };
      c.by_service[svc].vendor += log.vendor_cost || 0;
      c.by_service[svc].markup += log.marked_up_cost || 0;
      c.by_service[svc].hours += log.hours_deducted || 0;
    }

    // Platform totals
    const totalVendorCost = Object.values(customerCosts).reduce((s, c) => s + c.vendor_total, 0);
    const totalMarkup = Object.values(customerCosts).reduce((s, c) => s + c.markup_total, 0);
    const totalMargin = Object.values(customerCosts).reduce((s, c) => s + c.margin_total, 0);
    const totalHoursUsed = Object.values(customerCosts).reduce((s, c) => s + c.hours_used, 0);

    return NextResponse.json({
      success: true,
      data: {
        platform: {
          totalVendorCost: Math.round(totalVendorCost * 100) / 100,
          totalMarkup: Math.round(totalMarkup * 100) / 100,
          totalMargin: Math.round(totalMargin * 100) / 100,
          totalHoursUsed: Math.round(totalHoursUsed * 100) / 100,
          marginPercent: totalMarkup > 0 ? Math.round((totalMargin / totalMarkup) * 100) : 0,
        },
        customers: Object.values(customerCosts),
        recentLogs: usageLogs.slice(0, 20),
      },
    });
  } catch (error: any) {
    console.error('Admin costs error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
