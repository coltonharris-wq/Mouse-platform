export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { recordUsage, checkBalance } from '@/lib/usage-tracker';
import {
  createComputer,
  getComputer,
  startComputer,
  stopComputer,
  deleteComputer,
  takeScreenshot,
  executeBash,
  getVncPassword,
  estimateHourlyCost,
} from '@/lib/orgo';

/**
 * VM API — Full lifecycle for AI employee VMs
 *
 * POST actions: spawn, start, stop, terminate, screenshot, bash
 * GET: status of a VM or list all VMs for a customer
 *
 * Table: employee_vms (Supabase)
 *   id (uuid PK), customer_id, employee_id, employee_name,
 *   computer_id (Orgo), status, ram, cpu, gpu,
 *   orgo_url, vnc_password, last_screenshot_at,
 *   created_at, stopped_at, terminated_at
 */

// ─── POST ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, customerId, employeeId, employeeName, computerId, command, ram, cpu } = body;

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // ── SPAWN: Create a new VM for an employee ──
    if (action === 'spawn') {
      if (!customerId || !employeeId) {
        return NextResponse.json({ error: 'customerId and employeeId required' }, { status: 400 });
      }

      // Check if employee already has a VM
      const { data: existing } = await supabase
        .from('employee_vms')
        .select('id, computer_id, status')
        .eq('employee_id', employeeId)
        .eq('customer_id', customerId)
        .not('status', 'eq', 'terminated')
        .single();

      if (existing) {
        return NextResponse.json({
          error: 'Employee already has an active VM',
          vm: existing,
        }, { status: 409 });
      }

      // Check customer balance (estimate 1 hour of VM time)
      const vmRam = ram || 4;
      const vmCpu = cpu || 2;
      const hourlyCost = estimateHourlyCost(vmRam, vmCpu);
      const balanceCheck = await checkBalance(customerId, 'vm_orgo', hourlyCost);
      if (!balanceCheck.hasBalance) {
        return NextResponse.json({
          error: 'Insufficient work hours for VM. Purchase more hours.',
          balance: balanceCheck.currentBalance,
        }, { status: 402 });
      }

      // Create VM on Orgo
      const vmName = `mouse-${employeeName?.replace(/\s+/g, '-').toLowerCase() || employeeId}-${customerId.substring(0, 8)}`;
      const computer = await createComputer({ name: vmName, ram: vmRam, cpu: vmCpu });

      // Get VNC password
      let vncPassword = '';
      try {
        vncPassword = await getVncPassword(computer.id);
      } catch (e) {
        // VNC password may not be available immediately
      }

      // Store in Supabase
      const { data: vmRecord, error: insertErr } = await supabase
        .from('employee_vms')
        .insert({
          customer_id: customerId,
          employee_id: employeeId,
          employee_name: employeeName || 'AI Employee',
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

      if (insertErr) {
        console.error('Failed to store VM record:', insertErr);
        // Try to clean up the Orgo VM
        try { await deleteComputer(computer.id); } catch (e) { /* best effort */ }
        return NextResponse.json({ error: 'Failed to store VM record' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        vm: vmRecord,
        orgo: { id: computer.id, url: computer.url, status: computer.status },
      });
    }

    // ── START: Resume a stopped VM ──
    if (action === 'start') {
      const vm = await getVMRecord(supabase, computerId, employeeId, customerId);
      if (!vm) return NextResponse.json({ error: 'VM not found' }, { status: 404 });

      await startComputer(vm.computer_id);

      await supabase
        .from('employee_vms')
        .update({ status: 'running', stopped_at: null })
        .eq('id', vm.id);

      return NextResponse.json({ success: true, status: 'running' });
    }

    // ── STOP: Pause VM (saves costs) ──
    if (action === 'stop') {
      const vm = await getVMRecord(supabase, computerId, employeeId, customerId);
      if (!vm) return NextResponse.json({ error: 'VM not found' }, { status: 404 });

      await stopComputer(vm.computer_id);

      await supabase
        .from('employee_vms')
        .update({ status: 'stopped', stopped_at: new Date().toISOString() })
        .eq('id', vm.id);

      return NextResponse.json({ success: true, status: 'stopped' });
    }

    // ── TERMINATE: Delete VM permanently ──
    if (action === 'terminate') {
      const vm = await getVMRecord(supabase, computerId, employeeId, customerId);
      if (!vm) return NextResponse.json({ error: 'VM not found' }, { status: 404 });

      try {
        await deleteComputer(vm.computer_id);
      } catch (e) {
        console.error('Orgo delete failed (may already be gone):', e);
      }

      await supabase
        .from('employee_vms')
        .update({ status: 'terminated', terminated_at: new Date().toISOString() })
        .eq('id', vm.id);

      return NextResponse.json({ success: true, status: 'terminated' });
    }

    // ── SCREENSHOT: Capture current screen ──
    if (action === 'screenshot') {
      const vm = await getVMRecord(supabase, computerId, employeeId, customerId);
      if (!vm) return NextResponse.json({ error: 'VM not found' }, { status: 404 });

      const image = await takeScreenshot(vm.computer_id);

      await supabase
        .from('employee_vms')
        .update({ last_screenshot_at: new Date().toISOString() })
        .eq('id', vm.id);

      return NextResponse.json({ success: true, image });
    }

    // ── BASH: Execute command on VM ──
    if (action === 'bash') {
      if (!command) return NextResponse.json({ error: 'command required' }, { status: 400 });

      const vm = await getVMRecord(supabase, computerId, employeeId, customerId);
      if (!vm) return NextResponse.json({ error: 'VM not found' }, { status: 404 });

      const result = await executeBash(vm.computer_id, command);
      return NextResponse.json({ success: true, ...result });
    }

    // ── STATUS: Refresh VM status from Orgo ──
    if (action === 'status') {
      const vm = await getVMRecord(supabase, computerId, employeeId, customerId);
      if (!vm) return NextResponse.json({ error: 'VM not found' }, { status: 404 });

      try {
        const computer = await getComputer(vm.computer_id);
        // Sync status to Supabase
        if (computer.status !== vm.status) {
          await supabase
            .from('employee_vms')
            .update({ status: computer.status })
            .eq('id', vm.id);
        }
        return NextResponse.json({ success: true, vm: { ...vm, status: computer.status }, orgo: computer });
      } catch (e) {
        return NextResponse.json({ success: true, vm, orgoError: 'Could not reach Orgo API' });
      }
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });

  } catch (error: any) {
    console.error('VM API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// ─── GET ────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const employeeId = searchParams.get('employeeId');
    const computerId = searchParams.get('computerId');

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Single VM by computerId
    if (computerId) {
      const { data } = await supabase
        .from('employee_vms')
        .select('*')
        .eq('computer_id', computerId)
        .single();
      return NextResponse.json({ success: true, vm: data || null });
    }

    // Single VM by employeeId + customerId
    if (employeeId && customerId) {
      const { data } = await supabase
        .from('employee_vms')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('customer_id', customerId)
        .not('status', 'eq', 'terminated')
        .single();
      return NextResponse.json({ success: true, vm: data || null });
    }

    // All VMs for a customer
    if (customerId) {
      const { data } = await supabase
        .from('employee_vms')
        .select('*')
        .eq('customer_id', customerId)
        .not('status', 'eq', 'terminated')
        .order('created_at', { ascending: false });
      return NextResponse.json({ success: true, vms: data || [] });
    }

    return NextResponse.json({ error: 'customerId required' }, { status: 400 });
  } catch (error: any) {
    console.error('VM GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

// ─── Helpers ────────────────────────────────────────────────

async function getVMRecord(supabase: any, computerId?: string, employeeId?: string, customerId?: string) {
  if (computerId) {
    const { data } = await supabase
      .from('employee_vms')
      .select('*')
      .eq('computer_id', computerId)
      .not('status', 'eq', 'terminated')
      .single();
    return data;
  }
  if (employeeId && customerId) {
    const { data } = await supabase
      .from('employee_vms')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('customer_id', customerId)
      .not('status', 'eq', 'terminated')
      .single();
    return data;
  }
  return null;
}
