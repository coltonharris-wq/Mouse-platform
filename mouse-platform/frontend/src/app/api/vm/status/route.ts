/**
 * GET /api/vm/status?customer_id=xxx
 * Check VM status for a customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getComputer } from '@/lib/orgo';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    // Get customer's VM info
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customerId}&select=vm_computer_id,vm_status,hours_used`
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = customers[0];

    if (!customer.vm_computer_id) {
      return NextResponse.json({
        status: customer.vm_status || 'pending',
        computer_id: null,
        uptime_hours: 0,
      });
    }

    // Check actual VM status from Orgo
    const vm = await getComputer(customer.vm_computer_id);

    // Update DB if status changed
    const actualStatus = vm.data?.status === 'running' ? 'running' : customer.vm_status;
    if (actualStatus !== customer.vm_status) {
      await supabaseQuery('customers', 'PATCH',
        { vm_status: actualStatus },
        `id=eq.${customerId}`
      );
    }

    return NextResponse.json({
      status: actualStatus,
      computer_id: customer.vm_computer_id,
      uptime_hours: parseFloat(customer.hours_used) || 0,
      last_heartbeat: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_STATUS]', message);
    return NextResponse.json({ error: 'Failed to check VM status' }, { status: 500 });
  }
}
