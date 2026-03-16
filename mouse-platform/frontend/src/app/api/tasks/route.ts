/**
 * GET  /api/tasks?customer_id=xxx — List tasks (from usage_events + scheduled_tasks)
 * POST /api/tasks — Create a new task (immediate or scheduled)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { bashExec } from '@/lib/orgo';
import { checkBalance, deductHours, BILLING_RATES } from '@/lib/billing';
import { verifyAuth, requireCustomerAccess } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');
  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  const auth = await verifyAuth(request);
  const accessError = requireCustomerAccess(auth, customerId);
  if (accessError) return accessError;

  try {
    // Resolve customer's user_id for usage_events queries
    let userId = customerId;
    try {
      const cust = await supabaseQuery('customers', 'GET', undefined,
        `id=eq.${customerId}&select=user_id`
      );
      if (cust?.[0]?.user_id) userId = cust[0].user_id;
      else {
        const byUser = await supabaseQuery('customers', 'GET', undefined,
          `user_id=eq.${customerId}&select=user_id`
        );
        if (byUser?.[0]?.user_id) userId = byUser[0].user_id;
      }
    } catch { /* use customerId as fallback */ }

    // Fetch past tasks from usage_events (uses user_id column)
    const events = await supabaseQuery(
      'usage_events', 'GET', undefined,
      `user_id=eq.${userId}&service=in.(king_mouse_task,king_mouse_chat)&order=created_at.desc&limit=50`
    );

    // Fetch scheduled tasks
    let scheduled: Record<string, unknown>[] = [];
    try {
      scheduled = await supabaseQuery(
        'scheduled_tasks', 'GET', undefined,
        `customer_id=eq.${customerId}&order=run_at.asc`
      ) || [];
    } catch {
      // Table may not exist yet
    }

    const tasks = [
      ...(scheduled || []).map((s: Record<string, unknown>) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status,
        timestamp: s.run_at || s.created_at,
        type: 'scheduled',
      })),
      ...(events || []).map((e: Record<string, unknown>) => ({
        id: e.id,
        title: e.description || 'Task',
        description: e.description,
        status: 'completed',
        timestamp: e.created_at,
        type: 'event',
        billed_hours: e.hours_used,
      })),
    ];

    return NextResponse.json({ tasks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[TASKS_GET]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customer_id, title, description, schedule_at } = await request.json();

    if (!customer_id || !description) {
      return NextResponse.json({ error: 'customer_id and description required' }, { status: 400 });
    }

    const auth = await verifyAuth(request);
    const accessError = requireCustomerAccess(auth, customer_id);
    if (accessError) return accessError;

    // ── HOUR ENFORCEMENT ──
    const balanceError = await checkBalance(customer_id, BILLING_RATES.TASK_EXECUTION);
    if (balanceError) {
      return NextResponse.json(
        { error: 'You have no remaining hours. Please purchase more hours to create tasks.', balance_error: true },
        { status: 402 }
      );
    }

    // Scheduled task — insert and return
    if (schedule_at) {
      try {
        const result = await supabaseQuery('scheduled_tasks', 'POST', {
          customer_id,
          title: title || description.slice(0, 100),
          description,
          status: 'pending',
          run_at: schedule_at,
        });
        return NextResponse.json({ success: true, task_id: result?.[0]?.id || 'scheduled' });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // If table doesn't exist, tell user
        if (msg.includes('scheduled_tasks')) {
          return NextResponse.json({ error: 'Scheduled tasks table not configured yet' }, { status: 503 });
        }
        throw err;
      }
    }

    // Immediate task — execute on VM
    const customers = await supabaseQuery(
      'customers', 'GET', undefined,
      `id=eq.${customer_id}&select=vm_computer_id,vm_status`
    );

    if (!customers?.[0]?.vm_computer_id || customers[0].vm_status !== 'ready') {
      return NextResponse.json(
        { error: 'VM not available. Please ensure your AI employee is online.' },
        { status: 503 }
      );
    }

    const escapedDesc = description.replace(/'/g, "'\\''").replace(/\\/g, '\\\\');
    const result = await bashExec(
      customers[0].vm_computer_id,
      `cd /opt/king-mouse/workspace && timeout 30 openclaw chat -m 'Execute task: ${escapedDesc}' --json 2>/dev/null || echo '{"response":"Task queued but execution pending.","error":false}'`,
      35
    );

    let response = 'Task submitted';
    try {
      const parsed = JSON.parse(result.data?.output || '{}');
      response = parsed.response || response;
    } catch {
      // Use default
    }

    // ── DEDUCT HOURS ──
    try {
      await deductHours(
        customer_id,
        BILLING_RATES.TASK_EXECUTION,
        'king_mouse_task',
        title || description.slice(0, 200)
      );
    } catch (billErr) {
      console.error('[TASKS_POST] Hour deduction failed:', billErr);
    }

    return NextResponse.json({ success: true, task_id: `task-${Date.now()}`, response });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[TASKS_POST]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
