export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * GET /api/usage-events?customerId=X — customer usage history
 * GET /api/usage-events?admin=true — admin overview (all customers)
 * GET /api/usage-events?resellerId=X — reseller aggregate
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');
  const admin = searchParams.get('admin');
  const resellerId = searchParams.get('resellerId');
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));

  if (admin === 'true') {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    // Admin overview
    if (admin === 'true') {
      const [overviewRes, customerRes] = await Promise.all([
        supabase.rpc('get_admin_usage_overview', { p_year: year, p_month: month }),
        supabase.rpc('get_admin_customer_breakdown', { p_year: year, p_month: month }),
      ]);

      // Get recent events for the activity feed
      const { data: recentEvents } = await supabase
        .from('usage_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      return NextResponse.json({
        success: true,
        overview: overviewRes.data || [],
        customers: customerRes.data || [],
        recentEvents: recentEvents || [],
      });
    }

    // Reseller aggregate
    if (resellerId) {
      const { data, error } = await supabase
        .from('reseller_usage_summary')
        .select('*')
        .eq('reseller_id', resellerId)
        .single();

      return NextResponse.json({
        success: true,
        reseller: data || { customer_count: 0, total_events: 0, total_vendor_cost: 0, total_hours_used: 0, total_revenue: 0 },
      });
    }

    // Customer usage
    if (customerId) {
      // Resolve UUID to cst_* format if needed
      let resolvedId = customerId;
      if (!customerId.startsWith('cst_')) {
        const { data: lookup } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', customerId)
          .single();
        if (lookup) resolvedId = lookup.id;
      }

      const [summaryRes, eventsRes, balanceRes] = await Promise.all([
        supabase.rpc('get_customer_usage_summary', {
          p_customer_id: resolvedId,
          p_year: year,
          p_month: month,
        }),
        supabase
          .from('usage_events')
          .select('*')
          .eq('customer_id', resolvedId)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('customers')
          .select('work_hours_balance, work_hours_purchased')
          .eq('id', resolvedId)
          .single(),
      ]);

      return NextResponse.json({
        success: true,
        summary: summaryRes.data || [],
        events: eventsRes.data || [],
        balance: balanceRes.data?.work_hours_balance || 0,
        totalPurchased: balanceRes.data?.work_hours_purchased || 0,
      });
    }

    return NextResponse.json({ error: 'Provide customerId, admin=true, or resellerId' }, { status: 400 });
  } catch (err: any) {
    console.error('[usage-events] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
