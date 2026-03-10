export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createComputer, getComputer } from '@/lib/orgo';
import { kickOffProvision, ProvisionConfig } from '@/lib/mouse-os-provision';

/**
 * POST /api/provision/start
 * Triggers King Mouse VM provisioning for a customer.
 * Called from the deploying page after Stripe payment succeeds.
 *
 * ARCHITECTURE: This endpoint waits synchronously for the VM to become
 * responsive (up to 45s), then kicks off provisioning BEFORE returning.
 * This is required because Vercel kills serverless functions after the
 * response is sent — fire-and-forget async blocks never execute.
 *
 * If called again with an existing VM still in "creating" status,
 * it retries kickOffProvision (idempotent — won't re-provision).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, accountType } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get customer details
    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (custErr || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Build provision config (used for both new and retry paths)
    const provisionConfig: ProvisionConfig = {
      customerId,
      employeeType: 'king-mouse',
      employeeName: 'King Mouse',
      businessName: customer.company_name,
      businessType: customer.industry,
      supabaseUrl,
      supabaseAnonKey: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
      supabaseServiceKey: supabaseKey,
      moonshotApiKey: (process.env.MOONSHOT_API_KEY || '').trim(),
      orgoApiKey: (process.env.ORGO_API_KEY || '').trim(),
      orgoWorkspaceId: (process.env.ORGO_WORKSPACE_ID || '').trim(),
      accountType: accountType === 'reseller' ? 'reseller' : 'customer',
    };

    // Check if VM already exists for this customer
    const { data: existingVMs } = await supabase
      .from('employee_vms')
      .select('computer_id, status')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingVMs?.[0]) {
      const existing = existingVMs[0];

      // If VM exists but stuck in "creating", retry provisioning
      if (existing.status === 'creating') {
        console.log(`[provision/start] Retrying provision for existing VM ${existing.computer_id}`);
        const result = await waitAndProvision(existing.computer_id, provisionConfig, supabase);
        return NextResponse.json({
          success: true,
          computerId: existing.computer_id,
          status: result.started ? 'provisioning' : 'creating',
          message: result.started ? 'Provisioning started' : `Waiting for VM: ${result.error}`,
        });
      }

      // Already provisioning or active — return current state
      return NextResponse.json({
        success: true,
        computerId: existing.computer_id,
        status: existing.status,
        message: existing.status === 'active' ? 'King Mouse is ready' : 'Provisioning in progress',
      });
    }

    // Create new VM
    const vmName = `king-mouse-${customerId.substring(0, 8)}`;
    const vmRam = 32;
    const vmCpu = 4;

    const computer = await createComputer({ name: vmName, ram: vmRam, cpu: vmCpu });
    console.log(`[provision/start] Created VM ${computer.id} for customer ${customerId}`);

    // Store VM record
    const employeeId = `emp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    await supabase.from('hired_employees').insert({
      id: employeeId,
      customer_id: customerId,
      employee_type: 'king-mouse',
      employee_name: 'King Mouse',
      status: 'deploying',
    });

    await supabase.from('employee_vms').insert({
      customer_id: customerId,
      employee_id: employeeId,
      employee_name: 'King Mouse',
      computer_id: computer.id,
      status: 'creating',
      ram: vmRam,
      cpu: vmCpu,
      gpu: 'none',
      orgo_url: computer.url,
    });

    // Wait for VM to boot and kick off provisioning SYNCHRONOUSLY
    // This must happen before returning — Vercel kills the function after response
    const result = await waitAndProvision(computer.id, provisionConfig, supabase);

    return NextResponse.json({
      success: true,
      computerId: computer.id,
      employeeId,
      status: result.started ? 'provisioning' : 'creating',
      message: result.started ? 'VM provisioning started' : `VM created, provisioning pending: ${result.error}`,
    });
  } catch (error: any) {
    console.error('Provision start error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start provisioning' },
      { status: 500 }
    );
  }
}

/**
 * Wait for VM to become responsive, then kick off provisioning.
 * Polls every 5s for up to 45s. Returns the kickOffProvision result.
 */
async function waitAndProvision(
  computerId: string,
  config: ProvisionConfig,
  supabase: ReturnType<typeof createClient>
): Promise<{ started: boolean; error?: string }> {
  const maxWaitMs = 45_000;
  const pollIntervalMs = 5_000;
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    const result = await kickOffProvision(computerId, config);

    if (result.started) {
      console.log(`[provision/start] Provision started for ${computerId} after ${Date.now() - start}ms`);
      await supabase
        .from('employee_vms')
        .update({ status: 'provisioning' })
        .eq('computer_id', computerId);
      return { started: true };
    }

    if (!result.retryable) {
      console.error(`[provision/start] Non-retryable error for ${computerId}: ${result.error}`);
      return { started: false, error: result.error };
    }

    console.log(`[provision/start] VM ${computerId} not ready yet (${Math.round((Date.now() - start) / 1000)}s): ${result.error}`);
    await new Promise(r => setTimeout(r, pollIntervalMs));
  }

  console.log(`[provision/start] Timed out waiting for VM ${computerId} after ${maxWaitMs}ms`);
  return { started: false, error: 'VM boot timeout — status endpoint will retry' };
}
