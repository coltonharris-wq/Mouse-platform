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
    const { customerId, employeeType, employeeName, config, interviewAnswers, isOnboarding } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    }

    // If this is onboarding (new customer), employeeType defaults to 'king-mouse'
    const actualEmployeeType = employeeType || 'king-mouse';

    // Note: 2 free hours are already credited at signup. Do NOT credit again here (would double to 4).

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 1. Check balance — need at least 1 hour of VM time + chat
    // 32GB RAM for King Mouse (customer workloads need headroom)
    const vmRam = 32;
    const vmCpu = 4;
    const estimatedCost = estimateHourlyCost(vmRam, vmCpu);
    const balanceCheck = await checkBalance(customerId, 'vm_orgo', estimatedCost);

    if (!balanceCheck.hasBalance) {
      return NextResponse.json({
        error: 'Insufficient work hours. Purchase more hours to hire an AI employee.',
        balance: balanceCheck.currentBalance,
      }, { status: 402 });
    }

    // 2. Check plan employee limit (Starter: 1, Growth: 3, Enterprise: 10+)
    const { data: customer } = await supabase
      .from('customers')
      .select('plan_tier')
      .eq('id', customerId)
      .single();

    const planTier = (customer?.plan_tier || 'starter').toLowerCase();
    const maxEmployeesByPlan: Record<string, number> = {
      free: 1,
      starter: 1,
      growth: 3,
      pro: 5,
      enterprise: 10,
    };
    const maxEmployees = maxEmployeesByPlan[planTier] ?? 1;

    const { count } = await supabase
      .from('hired_employees')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId);

    if ((count ?? 0) >= maxEmployees) {
      return NextResponse.json({
        error: `Your ${planTier} plan allows up to ${maxEmployees} AI employee${maxEmployees === 1 ? '' : 's'}. Upgrade your plan to add more.`,
        maxEmployees,
        currentCount: count ?? 0,
      }, { status: 403 });
    }

    // 3. Create employee record
    const employeeId = `emp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const name = employeeName || generateEmployeeName(employeeType);

    const { data: employee, error: empErr } = await supabase
      .from('hired_employees')
      .insert({
        id: employeeId,
        customer_id: customerId,
        employee_type: actualEmployeeType,
        employee_name: name,
        status: 'deploying',
        config: {
          businessName: config?.businessName,
          businessType: config?.businessType,
          interviewAnswers: interviewAnswers || undefined,
        },
      })
      .select()
      .single();

    if (empErr) {
      console.error('Failed to create employee record:', empErr);
      return NextResponse.json({ error: `Failed to record hire: ${empErr.message}` }, { status: 500 });
    }

    // 4. Spawn Orgo VM
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
        .update({ status: 'provisioning' })
        .eq('computer_id', computer.id);

      // 🐭 Kick off Mouse OS provisioning — fast, non-blocking attempt.
      // If VM isn't ready yet (boot lag), the dashboard auto-retries via
      // POST /api/vm/provision-trigger every 15s until it sticks.
      // Provision downloads pre-built runtime tarball (~1 min total).
      const provisionConfig: ProvisionConfig = {
        customerId,
        employeeType: actualEmployeeType,
        employeeName: name,
        businessName: config?.businessName,
        businessType: config?.businessType,
        interviewAnswers, // Pass interview answers to provision script
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        moonshotApiKey: process.env.MOONSHOT_API_KEY || '',
        orgoApiKey: process.env.ORGO_API_KEY || '',
        orgoWorkspaceId: process.env.ORGO_WORKSPACE_ID || '',
      };

      try {
        const provision = await kickOffProvision(computer.id, provisionConfig);
        if (provision.started) {
          console.log(`[Mouse OS] ${name} provisioning started on VM ${computer.id}`);
        } else if (provision.retryable) {
          console.log(`[Mouse OS] ${name} VM not ready yet — dashboard will retry via /api/vm/provision-trigger`);
        } else {
          console.error(`[Mouse OS] Provision kickoff failed: ${provision.error}`);
        }
      } catch (provisionErr: any) {
        // Non-fatal — VM is created, provisioning can be retried via provision-trigger
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
