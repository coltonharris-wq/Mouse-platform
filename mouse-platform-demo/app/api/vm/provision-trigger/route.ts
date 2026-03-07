export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { kickOffProvision, ProvisionConfig } from '@/lib/mouse-os-provision';

/**
 * POST /api/vm/provision-trigger
 * 
 * Triggers provisioning on a VM that was created but not yet provisioned.
 * Designed to be called by:
 * - Dashboard polling (employee status page retries every 15s)
 * - Vercel Cron (every 1 min, checks for 'provisioning' VMs)
 * 
 * Fast: single readiness check, upload script, return. Total <5s.
 * Idempotent: won't re-provision if already running.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { computerId, employeeId } = body;

    if (!computerId) {
      return NextResponse.json({ error: 'computerId required' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get employee + VM config from Supabase
    const { data: vm } = await supabase
      .from('employee_vms')
      .select('*')
      .eq('computer_id', computerId)
      .single();

    if (!vm) {
      return NextResponse.json({ error: 'VM not found' }, { status: 404 });
    }

    // Skip if already active
    if (vm.status === 'active') {
      return NextResponse.json({ status: 'already_active' });
    }

    // Get employee details for config
    const { data: employee } = await supabase
      .from('hired_employees')
      .select('*')
      .eq('id', vm.employee_id || employeeId)
      .single();

    const provisionConfig: ProvisionConfig = {
      customerId: vm.customer_id,
      employeeType: employee?.employee_type || 'king-mouse',
      employeeName: vm.employee_name || employee?.employee_name || 'King Mouse',
      businessName: employee?.config?.businessName,
      businessType: employee?.config?.businessType,
      interviewAnswers: employee?.config?.interviewAnswers,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      moonshotApiKey: process.env.MOONSHOT_API_KEY || '',
      orgoApiKey: process.env.ORGO_API_KEY || '',
      orgoWorkspaceId: process.env.ORGO_WORKSPACE_ID || '',
    };

    const result = await kickOffProvision(computerId, provisionConfig);

    if (result.started) {
      // Update status
      await supabase
        .from('employee_vms')
        .update({ status: 'provisioning', last_heartbeat: new Date().toISOString() })
        .eq('computer_id', computerId);

      return NextResponse.json({ status: 'provisioning', message: 'Provision script uploaded and running' });
    }

    if (result.retryable) {
      return NextResponse.json({ 
        status: 'pending', 
        retryable: true, 
        message: result.error,
      });
    }

    return NextResponse.json({ status: 'error', message: result.error }, { status: 500 });

  } catch (error: any) {
    console.error('Provision trigger error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
