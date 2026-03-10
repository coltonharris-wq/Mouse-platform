export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/provision/status?customerId=xxx
 * Polls provisioning status for the deploying page.
 * Checks both hired_employees and employee_vms tables.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const computerId = searchParams.get('computer_id');

    if (!customerId && !computerId) {
      return NextResponse.json({ error: 'customerId or computer_id required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ status: 'provisioning', progress: 50, message: 'Setting up...' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check employee_vms table for VM status
    let query = supabase.from('employee_vms').select('*');
    if (computerId) {
      query = query.eq('computer_id', computerId);
    } else if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: vms } = await query.order('created_at', { ascending: false }).limit(1);
    const vm = vms?.[0];

    if (vm) {
      if (vm.status === 'ready' || vm.status === 'active' || vm.status === 'running') {
        return NextResponse.json({
          status: 'ready',
          progress: 100,
          message: 'King Mouse is ready!',
          vmId: vm.computer_id,
        });
      }
      if (vm.status === 'error') {
        return NextResponse.json({
          status: 'error',
          progress: 0,
          message: vm.error_message || 'Provisioning failed',
        });
      }
      return NextResponse.json({
        status: 'provisioning',
        progress: vm.status === 'provisioning' ? 60 : 30,
        message: vm.status === 'provisioning' ? 'Installing Mouse...' : 'Creating VM...',
      });
    }

    // Check customer status directly
    if (customerId) {
      const { data: customer } = await supabase
        .from('customers')
        .select('status')
        .eq('id', customerId)
        .single();

      if (customer?.status === 'active') {
        return NextResponse.json({
          status: 'ready',
          progress: 100,
          message: 'King Mouse is ready!',
        });
      }
    }

    return NextResponse.json({
      status: 'provisioning',
      progress: 20,
      message: 'Setting up your AI workspace...',
    });
  } catch (error) {
    console.error('Provision status error:', error);
    return NextResponse.json({
      status: 'provisioning',
      progress: 10,
      message: 'Checking status...',
    });
  }
}
