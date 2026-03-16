/**
 * GET /api/cron/meta-agent — Cron job for scheduled tasks + VM health checks
 * Run via Vercel Cron or external cron service every 1-5 minutes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { bashExec } from '@/lib/orgo';
import { checkBalance, deductHours, BILLING_RATES } from '@/lib/billing';

const ORGO_BASE = process.env.ORGO_BASE_URL || 'https://www.orgo.ai/api';

export async function GET(request: NextRequest) {
  // Verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const results: { action: string; status: string; detail?: string }[] = [];

  // 1. Execute pending scheduled tasks that are due
  try {
    const pendingTasks = await supabaseQuery(
      'scheduled_tasks', 'GET', undefined,
      `status=eq.pending&run_at=lte.${new Date().toISOString()}&order=run_at.asc&limit=10`
    );

    for (const task of pendingTasks || []) {
      try {
        await executeTask(task);
        results.push({ action: 'execute_task', status: 'ok', detail: task.id });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ action: 'execute_task', status: 'error', detail: msg });
      }
    }
  } catch {
    // scheduled_tasks table may not exist — not fatal
    results.push({ action: 'check_scheduled', status: 'skipped', detail: 'table may not exist' });
  }

  // 2. Health check running VMs
  try {
    const vms = await supabaseQuery(
      'customers', 'GET', undefined,
      `vm_status=eq.ready&vm_computer_id=not.is.null&select=id,vm_computer_id`
    );

    for (const vm of (vms || []).slice(0, 20)) {
      try {
        const res = await fetch(`${ORGO_BASE}/computers/${vm.vm_computer_id}`, {
          headers: {
            'Authorization': `Bearer ${process.env.ORGO_API_KEY || ''}`,
          },
        });

        if (!res.ok) {
          await supabaseQuery('customers', 'PATCH',
            { vm_status: 'offline' },
            `id=eq.${vm.id}`
          );
          results.push({ action: 'vm_health', status: 'offline', detail: vm.id });
        } else {
          results.push({ action: 'vm_health', status: 'ok', detail: vm.id });
        }
      } catch {
        results.push({ action: 'vm_health', status: 'error', detail: vm.id });
      }
    }
  } catch {
    results.push({ action: 'vm_health_check', status: 'error' });
  }

  return NextResponse.json({ ok: true, results, timestamp: new Date().toISOString() });
}

async function executeTask(task: Record<string, unknown>) {
  const customerId = task.customer_id as string;
  const description = task.description as string;

  // ── HOUR ENFORCEMENT — skip task if customer has no hours ──
  const balanceError = await checkBalance(customerId, BILLING_RATES.TASK_EXECUTION);
  if (balanceError) {
    await supabaseQuery('scheduled_tasks', 'PATCH',
      { status: 'failed', result: 'Insufficient hours — task skipped' },
      `id=eq.${task.id}`
    );
    return;
  }

  // Mark as running
  await supabaseQuery('scheduled_tasks', 'PATCH',
    { status: 'running' },
    `id=eq.${task.id}`
  );

  // Get customer's VM
  const customers = await supabaseQuery(
    'customers', 'GET', undefined,
    `id=eq.${customerId}&select=vm_computer_id,vm_status`
  );

  if (!customers?.[0]?.vm_computer_id || customers[0].vm_status !== 'ready') {
    await supabaseQuery('scheduled_tasks', 'PATCH',
      { status: 'failed', result: 'VM not available' },
      `id=eq.${task.id}`
    );
    return;
  }

  const escapedDesc = description.replace(/'/g, "'\\''").replace(/\\/g, '\\\\');
  const result = await bashExec(
    customers[0].vm_computer_id,
    `cd /opt/king-mouse/workspace && timeout 60 openclaw chat -m 'Execute task: ${escapedDesc}' --json 2>/dev/null || echo '{"response":"Task execution timed out"}'`,
    65
  );

  let response = 'Task completed';
  try {
    const parsed = JSON.parse(result.data?.output || '{}');
    response = parsed.response || response;
  } catch {
    response = result.data?.output || response;
  }

  // Mark complete
  await supabaseQuery('scheduled_tasks', 'PATCH',
    { status: 'completed', result: response.slice(0, 1000) },
    `id=eq.${task.id}`
  );

  // ── DEDUCT HOURS ──
  try {
    await deductHours(
      customerId,
      BILLING_RATES.TASK_EXECUTION,
      'king_mouse_task',
      `Scheduled: ${(task.title as string) || description.slice(0, 200)}`
    );
  } catch (billErr) {
    console.error('[META_AGENT] Hour deduction failed:', billErr);
  }
}
