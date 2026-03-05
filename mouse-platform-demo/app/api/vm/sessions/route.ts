export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { takeScreenshot } from '@/lib/orgo';

/**
 * VM Sessions (Work History) API
 *
 * Tracks work sessions for AI employees.
 * Each session = a period where the VM was active and working on a task.
 *
 * Table: vm_sessions (Supabase)
 *   id, employee_vm_id, employee_id, customer_id,
 *   task_description, status (active/completed/error),
 *   started_at, ended_at, screenshots (jsonb array),
 *   work_hours_charged, metadata
 */

// ─── GET: List sessions / get session detail ────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const employeeId = searchParams.get('employeeId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Single session with screenshots
    if (sessionId) {
      const { data } = await supabase
        .from('vm_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      return NextResponse.json({ success: true, session: data });
    }

    // List sessions for an employee
    let query = supabase
      .from('vm_sessions')
      .select('id, employee_id, employee_vm_id, customer_id, task_description, status, started_at, ended_at, work_hours_charged')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (customerId) query = query.eq('customer_id', customerId);
    if (employeeId) query = query.eq('employee_id', employeeId);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessions: data || [] });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── POST: Start session / capture screenshot / end session ──

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, customerId, employeeId, sessionId, taskDescription, computerId } = body;

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // ── START: Begin a new work session ──
    if (action === 'start') {
      if (!customerId || !employeeId) {
        return NextResponse.json({ error: 'customerId and employeeId required' }, { status: 400 });
      }

      // Get the employee's VM
      const { data: vm } = await supabase
        .from('employee_vms')
        .select('id, computer_id')
        .eq('employee_id', employeeId)
        .eq('customer_id', customerId)
        .not('status', 'eq', 'terminated')
        .single();

      if (!vm) {
        return NextResponse.json({ error: 'No active VM for this employee' }, { status: 404 });
      }

      // Capture initial screenshot
      let initialScreenshot = null;
      try {
        const image = await takeScreenshot(vm.computer_id);
        initialScreenshot = { timestamp: new Date().toISOString(), image };
      } catch (e) { /* VM may still be booting */ }

      const { data: session, error } = await supabase
        .from('vm_sessions')
        .insert({
          employee_vm_id: vm.id,
          employee_id: employeeId,
          customer_id: customerId,
          task_description: taskDescription || 'General work',
          status: 'active',
          started_at: new Date().toISOString(),
          screenshots: initialScreenshot ? [initialScreenshot] : [],
          work_hours_charged: 0,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, session });
    }

    // ── CAPTURE: Add screenshot to session ──
    if (action === 'capture') {
      if (!sessionId) {
        return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
      }

      const { data: session } = await supabase
        .from('vm_sessions')
        .select('id, screenshots, employee_vm_id')
        .eq('id', sessionId)
        .single();

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // Get computer_id from the VM record
      const { data: vm } = await supabase
        .from('employee_vms')
        .select('computer_id')
        .eq('id', session.employee_vm_id)
        .single();

      if (!vm) {
        return NextResponse.json({ error: 'VM not found' }, { status: 404 });
      }

      const image = await takeScreenshot(vm.computer_id);
      const screenshots = [...(session.screenshots || []), { timestamp: new Date().toISOString(), image }];

      // Keep last 50 screenshots per session
      const trimmed = screenshots.slice(-50);

      await supabase
        .from('vm_sessions')
        .update({ screenshots: trimmed })
        .eq('id', sessionId);

      return NextResponse.json({ success: true, screenshotCount: trimmed.length, image });
    }

    // ── END: Complete a work session ──
    if (action === 'end') {
      if (!sessionId) {
        return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
      }

      const { data: session } = await supabase
        .from('vm_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // Calculate duration
      const startedAt = new Date(session.started_at);
      const endedAt = new Date();
      const durationHours = (endedAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60);

      await supabase
        .from('vm_sessions')
        .update({
          status: 'completed',
          ended_at: endedAt.toISOString(),
          work_hours_charged: Math.round(durationHours * 100) / 100,
        })
        .eq('id', sessionId);

      return NextResponse.json({
        success: true,
        duration: durationHours,
        workHoursCharged: Math.round(durationHours * 100) / 100,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });

  } catch (error: any) {
    console.error('VM Sessions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
