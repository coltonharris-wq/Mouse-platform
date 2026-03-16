/**
 * GET /api/vm/screenshot?customer_id=xxx
 * Returns live screenshot from the customer's VM via Orgo API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { takeScreenshot, getComputer } from '@/lib/orgo';
import { supabaseQuery } from '@/lib/supabase-server';
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
    // Get customer's VM info
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customerId}&select=vm_computer_id,vm_status`
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = customers[0];

    if (!customer.vm_computer_id) {
      return NextResponse.json({
        image: null,
        status: 'offline',
        current_task: null,
        last_active: null,
      });
    }

    // Check VM status
    const vm = await getComputer(customer.vm_computer_id);
    const vmStatus = vm.data?.status;

    if (vmStatus !== 'running') {
      return NextResponse.json({
        image: null,
        status: 'offline',
        current_task: null,
        last_active: null,
      });
    }

    // Take screenshot
    const screenshot = await takeScreenshot(customer.vm_computer_id);

    if (!screenshot.success || !screenshot.data?.url) {
      return NextResponse.json({
        image: null,
        status: 'idle',
        current_task: null,
        last_active: new Date().toISOString(),
      });
    }

    // Check for active tasks (latest telemetry session)
    let currentTask: string | null = null;
    try {
      const sessions = await supabaseQuery(
        'vm_telemetry',
        'GET',
        undefined,
        `customer_id=eq.${customerId}&ended_at=is.null&order=started_at.desc&limit=1&select=id,started_at`
      );
      if (sessions && sessions.length > 0) {
        currentTask = 'Working on a task';
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      image: screenshot.data.url,
      status: currentTask ? 'working' : 'idle',
      current_task: currentTask,
      last_active: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_SCREENSHOT]', message);
    return NextResponse.json({ error: 'Failed to capture screenshot' }, { status: 500 });
  }
}
