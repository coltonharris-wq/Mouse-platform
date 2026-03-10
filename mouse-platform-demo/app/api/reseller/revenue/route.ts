export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/reseller/revenue
 * Reseller's own revenue, commissions, and earnings. Requires Bearer token.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: reseller } = await supabase
      .from('resellers')
      .select('id, total_earned, total_revenue, total_commissions, total_customers')
      .eq('user_id', user.id)
      .single();

    if (!reseller) {
      return NextResponse.json({ error: 'Reseller account required' }, { status: 403 });
    }

    // Get commission breakdown from reseller_commissions (table may not exist in all envs)
    let commissions: { commission_amount?: number; amount?: number; status?: string; created_at?: string }[] = [];
    const { data: commData, error: commError } = await supabase
      .from('reseller_commissions')
      .select('commission_amount, amount, status, created_at')
      .eq('reseller_id', reseller.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!commError && commData) commissions = commData;

    // total_earned may exist in some schemas; fall back to total_commissions
    const totalEarned = Number(reseller.total_earned ?? reseller.total_commissions ?? 0);
    const totalRevenue = Number(reseller.total_revenue || 0);
    const totalCommissions = Number(reseller.total_commissions || 0);

    return NextResponse.json({
      totalEarned,
      totalRevenue,
      totalCommissions,
      customerCount: reseller.total_customers || 0,
      recentCommissions: (commissions || []).map(c => ({
        amount: (Number(c.commission_amount || c.amount || 0)) / 100,
        status: c.status,
        createdAt: c.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Reseller revenue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
