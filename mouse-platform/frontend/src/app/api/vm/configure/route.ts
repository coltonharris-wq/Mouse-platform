/**
 * POST /api/vm/configure
 *
 * The Onboarding Bridge: Vercel -> Orgo VM
 * 1. Creates an Orgo VM
 * 2. Uploads provisioning script + customer config
 * 3. Runs provisioning (clone, rebrand, build, configure, launch)
 * 4. Records VM in Supabase
 * 5. Returns VM details for dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { createComputer, bashExec, uploadFile, getComputer } from '@/lib/orgo';
import { supabaseQuery } from '@/lib/supabase-server';

interface ConfigureRequest {
  customer_id: string;
  employee_type: string; // 'receptionist' | 'lead_funnel' | 'admin' | 'coordinator'
  employee_name: string;
  // Onboarding form data
  business_name?: string;
  business_type?: string;
  // Credentials (encrypted in transit, written to VM .env)
  credentials?: {
    google_email?: string;
    google_app_password?: string;
    slack_token?: string;
    crm_api_key?: string;
    twilio_sid?: string;
    twilio_token?: string;
    twilio_phone?: string;
    custom?: Record<string, string>;
  };
  // Optional overrides
  vm_ram?: number;
  vm_cpu?: number;
}

// Provision script (uploaded to VM, then executed)
const PROVISION_SCRIPT_URL =
  'https://raw.githubusercontent.com/coltonharris-wq/Mouse-platform/main/mouse-platform/scripts/provision-mouse-os.sh';

export async function POST(request: NextRequest) {
  try {
    const body: ConfigureRequest = await request.json();
    const { customer_id, employee_type, employee_name } = body;

    if (!customer_id || !employee_type || !employee_name) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, employee_type, employee_name' },
        { status: 400 }
      );
    }

    const workspaceId = process.env.ORGO_WORKSPACE_ID;
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'ORGO_WORKSPACE_ID not configured' },
        { status: 500 }
      );
    }

    // ── 1. Create VM ──
    const vmName = `mouse-${employee_type}-${customer_id.slice(0, 8)}`;
    const vm = await createComputer(
      workspaceId,
      vmName,
      body.vm_ram || 8,
      body.vm_cpu || 4
    );

    if (!vm.success || !vm.data) {
      return NextResponse.json(
        { error: `Failed to create VM: ${vm.error}` },
        { status: 500 }
      );
    }

    const computerId = vm.data.id;

    // ── 2. Wait for VM to boot ──
    let booted = false;
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const status = await getComputer(computerId);
      if (status.data?.status === 'running') {
        booted = true;
        break;
      }
    }

    if (!booted) {
      return NextResponse.json(
        { error: 'VM failed to boot within 60s', computer_id: computerId },
        { status: 504 }
      );
    }

    // ── 3. Build customer .env ──
    const envLines = [
      `CUSTOMER_ID=${customer_id}`,
      `EMPLOYEE_TYPE=${employee_type}`,
      `EMPLOYEE_NAME=${employee_name}`,
      `BUSINESS_NAME=${body.business_name || ''}`,
      `BUSINESS_TYPE=${body.business_type || ''}`,
      `SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
      `SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      `SUPABASE_SERVICE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    ];

    // Add credentials
    if (body.credentials) {
      for (const [key, value] of Object.entries(body.credentials)) {
        if (value && typeof value === 'string') {
          envLines.push(`${key.toUpperCase()}=${value}`);
        } else if (value && typeof value === 'object') {
          for (const [k, v] of Object.entries(value)) {
            envLines.push(`${k.toUpperCase()}=${v}`);
          }
        }
      }
    }

    // Write .env to VM
    await bashExec(computerId, `cat > /tmp/mouse-config.env << 'ENVEOF'\n${envLines.join('\n')}\nENVEOF`);

    // ── 4. Build customer config JSON ──
    const customerConfig = {
      customer_id,
      employee_type,
      employee_name,
      business_name: body.business_name,
      business_type: body.business_type,
      provisioned_at: new Date().toISOString(),
      skills: getSkillsForType(employee_type),
    };
    await bashExec(
      computerId,
      `cat > /tmp/mouse-config.json << 'JSONEOF'\n${JSON.stringify(customerConfig, null, 2)}\nJSONEOF`
    );

    // ── 5. Download and run provisioning script ──
    await bashExec(computerId, `curl -fsSL "${PROVISION_SCRIPT_URL}" -o /tmp/provision-mouse-os.sh && chmod +x /tmp/provision-mouse-os.sh`);

    // Run provisioning in background (it takes a while)
    await bashExec(computerId, `nohup /tmp/provision-mouse-os.sh > /var/log/mouse-provision.log 2>&1 &`);

    // ── 6. Record in Supabase ──
    await supabaseQuery('employee_vms', 'POST', {
      customer_id,
      computer_id: computerId,
      employee_type,
      employee_name,
      vm_name: vmName,
      status: 'provisioning',
      ram_gb: body.vm_ram || 8,
      cpu_cores: body.vm_cpu || 4,
      created_at: new Date().toISOString(),
    });

    // ── 7. Log usage event ──
    await supabaseQuery('usage_events', 'POST', {
      customer_id,
      event_type: 'vm_provision',
      agent_type: employee_type,
      description: `Provisioning ${employee_name} (${employee_type})`,
      created_at: new Date().toISOString(),
    });

    // ── 8. Create notification ──
    await supabaseQuery('notifications', 'POST', {
      customer_id,
      type: 'employee_hired',
      message: `${employee_name} is being set up and will be ready in ~2 minutes. 🐭`,
      read: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      computer_id: computerId,
      vm_name: vmName,
      status: 'provisioning',
      message: `${employee_name} is being provisioned. ETA: ~2 minutes.`,
    });
  } catch (err: any) {
    console.error('[VM Configure Error]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function getSkillsForType(type: string): string[] {
  const skillMap: Record<string, string[]> = {
    receptionist: ['phone_handling', 'scheduling', 'customer_intake', 'faq_response'],
    lead_funnel: ['lead_capture', 'lead_scoring', 'email_nurture', 'csv_export'],
    admin: ['invoicing', 'follow_ups', 'document_management', 'data_entry'],
    coordinator: ['supply_chain', 'vendor_comms', 'inventory_tracking', 'ordering'],
  };
  return skillMap[type] || ['general_ops'];
}
