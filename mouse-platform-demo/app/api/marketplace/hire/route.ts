export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { checkBalance } from '@/lib/usage-tracker';
import { createComputer, getVncPassword, estimateHourlyCost } from '@/lib/orgo';
import { kickOffProvision, ProvisionConfig } from '@/lib/mouse-os-provision';

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
    // Mouse OS needs 8GB RAM / 4CPU for OpenClaw build (4GB disk fills up)
    const vmRam = 8;
    const vmCpu = 4;
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

      // 🐭 Kick off Mouse OS provisioning on the VM
      // The script runs ON the VM (nohup), not in Vercel.
      // Avoids serverless function timeout. VM self-provisions in ~5 min.
      // Poll /api/vm/provision-status for completion.
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

      try {
        const provision = await kickOffProvision(computer.id, provisionConfig);
        if (!provision.started) {
          console.error(`[Mouse OS] Provision kickoff failed: ${provision.error}`);
        } else {
          console.log(`[Mouse OS] ${name} provisioning started on VM ${computer.id}`);
        }
      } catch (provisionErr: any) {
        // Non-fatal — VM is created, provisioning can be retried
        console.error(`[Mouse OS] ${name} provision kickoff error:`, provisionErr);
      }

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
