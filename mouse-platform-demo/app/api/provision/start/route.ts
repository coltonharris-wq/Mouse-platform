export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createComputer, estimateHourlyCost } from '@/lib/orgo';
import { kickOffProvision, ProvisionConfig } from '@/lib/mouse-os-provision';

/**
 * POST /api/provision/start
 * Triggers King Mouse VM provisioning for a customer.
 * Called from the deploying page after Stripe payment succeeds.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    // Check if already provisioned
    const { data: existingVMs } = await supabase
      .from('employee_vms')
      .select('computer_id, status')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingVMs?.[0]) {
      return NextResponse.json({
        success: true,
        computerId: existingVMs[0].computer_id,
        status: existingVMs[0].status,
        message: 'Provisioning already in progress',
      });
    }

    // Create VM
    const vmName = `king-mouse-${customerId.substring(0, 8)}`;
    const vmRam = 32;
    const vmCpu = 4;

    const computer = await createComputer({ name: vmName, ram: vmRam, cpu: vmCpu });

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

    // Kick off Mouse OS provisioning (non-blocking)
    const provisionConfig: ProvisionConfig = {
      customerId,
      employeeType: 'king-mouse',
      employeeName: 'King Mouse',
      businessName: customer.company_name,
      businessType: customer.industry,
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      supabaseServiceKey: supabaseKey,
      moonshotApiKey: process.env.MOONSHOT_API_KEY || '',
      orgoApiKey: process.env.ORGO_API_KEY || '',
      orgoWorkspaceId: process.env.ORGO_WORKSPACE_ID || '',
    };

    kickOffProvision(computer.id, provisionConfig).catch(err => {
      console.error('[provision/start] Provision kickoff error:', err);
    });

    return NextResponse.json({
      success: true,
      computerId: computer.id,
      employeeId,
      message: 'VM provisioning started',
    });
  } catch (error: any) {
    console.error('Provision start error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start provisioning' },
      { status: 500 }
    );
  }
}
