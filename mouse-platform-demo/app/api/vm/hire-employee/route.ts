export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { checkBalance } from '@/lib/usage-tracker';
import { createComputer, getVncPassword, estimateHourlyCost } from '@/lib/orgo';
import {
  EmployeeProvisionConfig,
  EmployeeRole,
  isValidRole,
  getRoleInfo,
  listRoles,
  kickOffEmployeeProvision,
} from '@/lib/employee-provision';

/**
 * POST /api/vm/hire-employee
 *
 * Spawns a role-specific AI employee VM. Called by:
 * - King Mouse (from within a VM, to spawn sub-employees)
 * - Dashboard (customer hiring from marketplace)
 *
 * Body:
 *   customerId: string (required)
 *   role: EmployeeRole (required) — customer-support | sales | admin | operations | marketing
 *   employeeName?: string (auto-generated if omitted)
 *   businessName: string (required)
 *   businessType?: string
 *   ownerName?: string
 *   parentVmId?: string (King Mouse's VM ID, if spawned by King Mouse)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, role, employeeName, businessName, businessType, ownerName, parentVmId } = body;

    // Validate required fields
    if (!customerId || !role || !businessName) {
      return NextResponse.json(
        { error: 'customerId, role, and businessName are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: `Invalid role "${role}". Valid roles: ${listRoles().map(r => r.role).join(', ')}` },
        { status: 400 }
      );
    }

    const roleInfo = getRoleInfo(role as EmployeeRole);
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 1. Check balance — need at least 1 hour of VM time
    const vmRam = 8;
    const vmCpu = 4;
    const estimatedCost = estimateHourlyCost(vmRam, vmCpu);
    const balanceCheck = await checkBalance(customerId, 'vm_orgo', estimatedCost);

    if (!balanceCheck.hasBalance) {
      return NextResponse.json({
        error: 'Insufficient work hours. Purchase more hours to hire an employee.',
        balance: balanceCheck.currentBalance,
      }, { status: 402 });
    }

    // 2. Generate employee name if not provided
    const name = employeeName || generateRoleName(role as EmployeeRole);

    // 3. Create employee record
    const employeeId = `emp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const { data: employee, error: empErr } = await supabase
      .from('hired_employees')
      .insert({
        id: employeeId,
        customer_id: customerId,
        employee_name: name,
        employee_type: role,
        status: 'deploying',
      })
      .select()
      .single();

    if (empErr) {
      console.error('Failed to create employee record:', empErr);
      return NextResponse.json({ error: `Failed to record hire: ${empErr.message}` }, { status: 500 });
    }

    // 4. Spawn Orgo VM
    let vmRecord = null;
    let provisionStatus = null;

    try {
      const vmName = `${role}-${name.toLowerCase().replace(/\s+/g, '-')}-${customerId.substring(0, 8)}`;
      const computer = await createComputer({ name: vmName, ram: vmRam, cpu: vmCpu });

      let vncPassword = '';
      try {
        vncPassword = await getVncPassword(computer.id);
      } catch (_) { /* VM may not be ready yet */ }

      // Store VM record
      const { data: vm } = await supabase
        .from('employee_vms')
        .insert({
          customer_id: customerId,
          employee_id: employeeId,
          employee_name: name,
          computer_id: computer.id,
          agent_type: role,
          status: 'starting',
          ram: vmRam,
          cpu: vmCpu,
          gpu: 'none',
          orgo_url: computer.url,
          vnc_password: vncPassword,
          vm_name: vmName,
        })
        .select()
        .single();

      vmRecord = vm;

      // Update employee with VM ID
      await supabase
        .from('hired_employees')
        .update({ vm_id: computer.id, status: 'provisioning' })
        .eq('id', employeeId);

      // 5. Kick off role-specific provisioning
      const provisionConfig: EmployeeProvisionConfig = {
        customerId,
        employeeRole: role as EmployeeRole,
        employeeName: name,
        businessName,
        businessType: businessType || '',
        ownerName: ownerName || '',
        parentVmId: parentVmId || '',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        moonshotApiKey: process.env.MOONSHOT_API_KEY || '',
        orgoApiKey: process.env.ORGO_API_KEY || '',
        orgoWorkspaceId: process.env.ORGO_WORKSPACE_ID || '',
      };

      try {
        provisionStatus = await kickOffEmployeeProvision(computer.id, provisionConfig);
        if (provisionStatus.started) {
          console.log(`[Employee] ${roleInfo.emoji} ${name} (${role}) provisioning started on VM ${computer.id}`);
          await supabase
            .from('employee_vms')
            .update({ status: 'provisioning' })
            .eq('computer_id', computer.id);
        } else if (provisionStatus.retryable) {
          console.log(`[Employee] ${name} VM not ready yet — will retry via provision-trigger`);
        }
      } catch (provErr: any) {
        console.error(`[Employee] ${name} provision error:`, provErr);
        provisionStatus = { started: false, retryable: true, error: provErr.message };
      }

    } catch (e: any) {
      console.error('Employee VM spawn failed:', e);
      await supabase
        .from('hired_employees')
        .update({ status: 'error', error_message: e.message })
        .eq('id', employeeId);

      return NextResponse.json({
        success: false,
        error: `VM creation failed: ${e.message}`,
        employee: { id: employeeId, name, role },
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      employee: {
        id: employeeId,
        name,
        role,
        displayName: roleInfo.displayName,
        emoji: roleInfo.emoji,
        status: provisionStatus?.started ? 'provisioning' : 'starting',
      },
      vm: vmRecord ? {
        computerId: vmRecord.computer_id,
        status: vmRecord.status,
        ram: vmRam,
        cpu: vmCpu,
      } : null,
      provision: provisionStatus,
      message: `${roleInfo.emoji} ${name} (${roleInfo.displayName}) is being deployed! Provisioning takes ~1 min.`,
    });

  } catch (error: any) {
    console.error('Hire employee API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/vm/hire-employee
 * Returns available employee roles.
 */
export async function GET() {
  return NextResponse.json({
    roles: listRoles(),
    description: 'Available AI employee roles. POST with customerId, role, and businessName to hire.',
  });
}

// Role-specific name generator
function generateRoleName(role: EmployeeRole): string {
  const names: Record<EmployeeRole, string[]> = {
    'customer-support': ['Atlas', 'Haven', 'Beacon', 'Echo', 'Sage'],
    'sales': ['Ace', 'Blaze', 'Dash', 'Maverick', 'Hunter'],
    'admin': ['Aria', 'Clover', 'Piper', 'Quinn', 'Riley'],
    'operations': ['Matrix', 'Nexus', 'Vector', 'Cipher', 'Forge'],
    'marketing': ['Pixel', 'Spark', 'Vibe', 'Hype', 'Buzz'],
  };
  const pool = names[role];
  return pool[Math.floor(Math.random() * pool.length)];
}
