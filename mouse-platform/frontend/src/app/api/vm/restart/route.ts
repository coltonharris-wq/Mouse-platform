/**
 * POST /api/vm/restart?customer_id=xxx
 * Restart the customer's King Mouse VM (OpenClaw gateway).
 */

import { NextRequest, NextResponse } from 'next/server';
import { bashExec } from '@/lib/orgo';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    // Get customer's VM
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
      return NextResponse.json({ error: 'No VM provisioned' }, { status: 400 });
    }

    // Restart OpenClaw gateway on the VM
    const result = await bashExec(
      customer.vm_computer_id,
      'cd /root/openclaw && pkill -f "node.*gateway" 2>/dev/null; sleep 2 && nohup node gateway.js > /tmp/openclaw.log 2>&1 &',
      30
    );

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to restart' }, { status: 500 });
    }

    // Update status
    await supabaseQuery('customers', 'PATCH', { vm_status: 'running' }, `id=eq.${customerId}`);

    return NextResponse.json({ success: true, message: 'King Mouse restarted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_RESTART]', message);
    return NextResponse.json({ error: 'Failed to restart' }, { status: 500 });
  }
}
