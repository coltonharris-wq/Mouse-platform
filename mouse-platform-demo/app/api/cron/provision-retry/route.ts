export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/cron/provision-retry
 *
 * Called by Vercel Cron (or manually) to retry provisioning for VMs that were
 * created but never got the provision script (e.g. user closed onboard tab).
 * Finds employee_vms with status in (provisioning, starting) and created_at
 * older than 1 minute, then triggers provision for each.
 *
 * Secure with CRON_SECRET: Vercel sends Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

  const { data: vms, error: fetchErr } = await supabase
    .from('employee_vms')
    .select('computer_id, employee_id, created_at')
    .in('status', ['provisioning', 'starting'])
    .lt('created_at', oneMinuteAgo)
    .limit(10);

  if (fetchErr || !vms?.length) {
    return NextResponse.json({
      ok: true,
      triggered: 0,
      message: fetchErr ? fetchErr.message : 'No stale VMs to retry',
    });
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXTAUTH_URL || 'http://localhost:3000';

  let triggered = 0;
  for (const vm of vms) {
    try {
      const res = await fetch(`${baseUrl}/api/vm/provision-trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ computerId: vm.computer_id, employeeId: vm.employee_id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'provisioning' || data.status === 'pending') triggered++;
      }
    } catch (_) {
      // continue with next VM
    }
  }

  return NextResponse.json({
    ok: true,
    triggered,
    total: vms.length,
  });
}
