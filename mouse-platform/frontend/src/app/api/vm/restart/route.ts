/**
 * POST /api/vm/restart?customer_id=xxx
 * Restart the customer's King Mouse VM (OpenClaw gateway).
 */

import { NextRequest, NextResponse } from 'next/server';
import { bashExec } from '@/lib/orgo';
import { supabaseQuery } from '@/lib/supabase-server';
import { verifyAuth, requireCustomerAccess } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  const auth = await verifyAuth(request);
  const accessError = requireCustomerAccess(auth, customerId);
  if (accessError) return accessError;

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

    // Restart OpenClaw gateway on the VM (source env for MOONSHOT_API_KEY)
    const result = await bashExec(
      customer.vm_computer_id,
      'pkill -f "openclaw gateway" 2>/dev/null; sleep 2 && source /etc/environment 2>/dev/null && cd /opt/king-mouse/workspace && DISPLAY=:99 nohup openclaw gateway run > /opt/king-mouse/gateway.log 2>&1 &',
      30
    );

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to restart' }, { status: 500 });
    }

    // Update status
    await supabaseQuery('customers', 'PATCH', { vm_status: 'ready' }, `id=eq.${customerId}`);

    return NextResponse.json({ success: true, message: 'King Mouse restarted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_RESTART]', message);
    return NextResponse.json({ error: 'Failed to restart' }, { status: 500 });
  }
}
