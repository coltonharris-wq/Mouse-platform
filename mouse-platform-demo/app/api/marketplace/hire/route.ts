export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { checkBalance } from '@/lib/usage-tracker';
import { createComputer, getVncPassword, estimateHourlyCost, waitForReady } from '@/lib/orgo';
import { provisionMouseOS, ProvisionConfig } from '@/lib/mouse-os-provision';

/**
 * POST /api/marketplace/hire
 *
 * When a customer hires an AI employee:
 * 1. Validate balance
 * 2. Record the hire in Supabase
 * 3. Spawn an Orgo VM for the employee
 * 4. Return VM details + connection info
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, employeeType, employeeName, config } = body;

    if (!customerId || !employeeType) {
      return NextResponse.json({ error: 'customerId and employeeType required' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 1. Check balance — need at least 1 hour of VM time + chat
    const vmRam = 4;
    const vmCpu = 2;
    const estimatedCost = estimateHourlyCost(vmRam, vmCpu);
    const balanceCheck = await checkBalance(customerId, 'vm_orgo', estimatedCost);

    if (!balanceCheck.hasBalance) {
      return NextResponse.json({
        error: 'Insufficient work hours. Purchase more hours to hire an AI employee.',
        balance: balanceCheck.currentBalance,
      }, { status: 402 });
    }

    // 2. Create employee record
    const employeeId = `emp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const name = employeeName || generateEmployeeName(employeeType);

    const { data: employee, error: empErr } = await supabase
      .from('hired_employees')
      .insert({
        id: employeeId,
        customer_id: customerId,
        employee_name: name,
        status: 'deploying',
      })
      .select()
      .single();

    if (empErr) {
      console.error('Failed to create employee record:', empErr);
      return NextResponse.json({ error: `Failed to record hire: ${empErr.message}` }, { status: 500 });
    }

    // 3. Spawn Orgo VM
    let vmRecord = null;
    let orgoError = null;

    try {
      const vmName = `mouse-${name.replace(/\s+/g, '-').toLowerCase()}-${customerId.substring(0, 8)}`;
      const computer = await createComputer({ name: vmName, ram: vmRam, cpu: vmCpu });

      let vncPassword = '';
      try {
        vncPassword = await getVncPassword(computer.id);
      } catch (e) { /* may not be ready yet */ }

      // Store VM record
      const { data: vm } = await supabase
        .from('employee_vms')
        .insert({
          customer_id: customerId,
          employee_id: employeeId,
          employee_name: name,
          computer_id: computer.id,
          status: computer.status || 'starting',
          ram: vmRam,
          cpu: vmCpu,
          gpu: 'none',
          orgo_url: computer.url,
          vnc_password: vncPassword,
        })
        .select()
        .single();

      vmRecord = vm;

      // Update employee with VM ID
      await supabase
        .from('hired_employees')
        .update({ vm_id: computer.id, status: 'provisioning' })
        .eq('id', employeeId);

      // Update VM status
      await supabase
        .from('employee_vms')
        .update({ status: 'provisioning', vm_name: vmName })
        .eq('computer_id', computer.id);

      // 🐭 FIRE AND FORGET: Provision Mouse OS in background
      // This takes ~5 minutes — don't block the response
      const provisionConfig: ProvisionConfig = {
        customerId,
        employeeType,
        employeeName: name,
        businessName: config?.businessName,
        businessType: config?.businessType,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      };

      // Don't await — runs in background
      (async () => {
        try {
          // Wait for VM to be fully running first
          await waitForReady(computer.id, 60_000);

          const result = await provisionMouseOS(computer.id, provisionConfig);

          // Update status based on result
          const finalStatus = result.success ? 'active' : 'error';
          await supabase
            .from('employee_vms')
            .update({
              status: finalStatus,
              last_heartbeat: new Date().toISOString(),
            })
            .eq('computer_id', computer.id);

          await supabase
            .from('hired_employees')
            .update({ status: finalStatus })
            .eq('id', employeeId);

          // Send notification
          await supabase
            .from('notifications')
            .insert({
              customer_id: customerId,
              agent_type: employeeType,
              type: result.success ? 'employee_ready' : 'employee_error',
              message: result.success
                ? `🐭 ${name} is ready! Mouse Platform installed and King Mouse is operational.`
                : `⚠️ ${name} provisioning failed: ${result.error}`,
              priority: result.success ? 'normal' : 'high',
              read: false,
            });

          console.log(`[Mouse OS] ${name} provisioning ${finalStatus}:`, result.log.slice(-3));
        } catch (provisionErr: any) {
          console.error(`[Mouse OS] ${name} provision error:`, provisionErr);
          await supabase
            .from('employee_vms')
            .update({ status: 'error' })
            .eq('computer_id', computer.id);
          await supabase
            .from('notifications')
            .insert({
              customer_id: customerId,
              type: 'employee_error',
              message: `⚠️ ${name} failed to provision: ${provisionErr.message}`,
              priority: 'high',
              read: false,
            });
        }
      })();

    } catch (e: any) {
      console.error('VM spawn failed:', e);
      orgoError = e.message;
      // Employee is hired but VM failed — they can retry
      await supabase
        .from('hired_employees')
        .update({ status: 'error', error_message: e.message })
        .eq('id', employeeId);
    }

    return NextResponse.json({
      success: true,
      employee: {
        id: employeeId,
        name,
        type: employeeType,
        status: vmRecord ? 'active' : 'error',
      },
      vm: vmRecord,
      orgoError,
      message: vmRecord
        ? `${name} hired! 🐭 Mouse Platform is being installed (~5 min). You'll get a notification when ready.`
        : `${name} hired but VM failed to start. You can retry from the employee page.`,
    });

  } catch (error: any) {
    console.error('Hire API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Name generator by role
function generateEmployeeName(type: string): string {
  const names: Record<string, string[]> = {
    'king-mouse': ['King Mouse'],
    'lead-funnel': ['Scout', 'Hunter', 'Ranger', 'Tracker'],
    'customer-support': ['Atlas', 'Haven', 'Beacon', 'Echo'],
    'operations': ['Matrix', 'Nexus', 'Cipher', 'Vector'],
    'sales': ['Ace', 'Blaze', 'Dash', 'Maverick'],
    'developer': ['Pixel', 'Binary', 'Stack', 'Logic'],
    'analyst': ['Prism', 'Sigma', 'Delta', 'Theta'],
    'default': ['Nova', 'Spark', 'Flux', 'Zenith'],
  };
  const pool = names[type] || names['default'];
  return pool[Math.floor(Math.random() * pool.length)];
}
