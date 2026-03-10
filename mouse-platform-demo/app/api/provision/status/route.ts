export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getComputer } from '@/lib/orgo';
import { kickOffProvision, checkProvisionStatus, ProvisionConfig } from '@/lib/mouse-os-provision';

/**
 * GET /api/provision/status?customerId=xxx
 * Polls provisioning status for the deploying page.
 *
 * SELF-HEALING: If VM status is "creating" but the Orgo VM is running,
 * this endpoint will trigger kickOffProvision() automatically.
 * The deploying page polls every 5s, so provision gets triggered on the
 * first poll after the VM becomes responsive.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const computerId = searchParams.get('computer_id');

    if (!customerId && !computerId) {
      return NextResponse.json({ error: 'customerId or computer_id required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

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

      // SELF-HEALING: VM stuck in "creating" — check if Orgo VM is actually running
      // and trigger provisioning if so. This fixes the race condition where
      // kickOffProvision fires before the VM is responsive.
      if (vm.status === 'creating' && vm.computer_id) {
        try {
          const orgoVm = await getComputer(vm.computer_id);

          if (orgoVm.status === 'running') {
            console.log(`[provision/status] VM ${vm.computer_id} is running in Orgo but stuck in "creating" — triggering provision`);

            // Build provision config from customer data + env vars
            const { data: customer } = await supabase
              .from('customers')
              .select('company_name, industry')
              .eq('id', vm.customer_id)
              .single();

            const provisionConfig: ProvisionConfig = {
              customerId: vm.customer_id,
              employeeType: vm.employee_name === 'King Mouse' ? 'king-mouse' : 'employee',
              employeeName: vm.employee_name || 'King Mouse',
              businessName: customer?.company_name,
              businessType: customer?.industry,
              supabaseUrl,
              supabaseAnonKey: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
              supabaseServiceKey: supabaseKey || '',
              moonshotApiKey: (process.env.MOONSHOT_API_KEY || '').trim(),
              orgoApiKey: (process.env.ORGO_API_KEY || '').trim(),
              orgoWorkspaceId: (process.env.ORGO_WORKSPACE_ID || '').trim(),
            };

            const result = await kickOffProvision(vm.computer_id, provisionConfig);

            if (result.started) {
              console.log(`[provision/status] Provision started for VM ${vm.computer_id}`);
              // Update DB status to "provisioning"
              await supabase
                .from('employee_vms')
                .update({ status: 'provisioning' })
                .eq('computer_id', vm.computer_id);

              return NextResponse.json({
                status: 'provisioning',
                progress: 50,
                message: 'Installing Mouse...',
              });
            } else {
              console.log(`[provision/status] Provision not started: ${result.error} (retryable: ${result.retryable})`);
            }
          }
        } catch (orgoErr) {
          // Orgo API check failed — VM may still be booting. Don't block the response.
          console.log(`[provision/status] Orgo check for ${vm.computer_id} failed:`, orgoErr);
        }
      }

      // If VM status is "provisioning", also verify with Orgo that provision is progressing
      if (vm.status === 'provisioning' && vm.computer_id) {
        try {
          const provStatus = await checkProvisionStatus(vm.computer_id);
          if (provStatus.status === 'ready') {
            // Provision completed! Update DB and return ready.
            await supabase
              .from('employee_vms')
              .update({ status: 'active' })
              .eq('computer_id', vm.computer_id);

            return NextResponse.json({
              status: 'ready',
              progress: 100,
              message: 'King Mouse is ready!',
              vmId: vm.computer_id,
            });
          }
        } catch (_) {
          // Non-fatal — fall through to default provisioning response
        }
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
