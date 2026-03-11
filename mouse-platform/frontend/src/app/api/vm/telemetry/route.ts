/**
 * POST /api/vm/telemetry
 * VM heartbeat — tracks work sessions for hourly billing
 * GET /api/vm/telemetry?customer_id=xxx — task history
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { computer_id, customer_id } = body;

    if (!computer_id) {
      return NextResponse.json(
        { error: 'computer_id required' },
        { status: 400 }
      );
    }

    // Look up customer by vm_computer_id if customer_id not provided
    let resolvedCustomerId = customer_id;

    if (!resolvedCustomerId) {
      const customers = await supabaseQuery(
        'customers',
        'GET',
        undefined,
        `vm_computer_id=eq.${computer_id}&select=id,hours_included,hours_used`
      );

      if (!customers || customers.length === 0) {
        return NextResponse.json(
          { error: 'No customer found for this VM' },
          { status: 404 }
        );
      }

      resolvedCustomerId = customers[0].id;
    }

    // Check for active work_session
    const activeSessions = await supabaseQuery(
      'work_sessions',
      'GET',
      undefined,
      `customer_id=eq.${resolvedCustomerId}&status=eq.active&order=started_at.desc&limit=1`
    );

    const now = new Date();

    if (activeSessions && activeSessions.length > 0) {
      // Update existing session
      const session = activeSessions[0];
      const startedAt = new Date(session.started_at);
      const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      const billedHours = Math.round((durationSeconds / 3600) * 100) / 100;

      await supabaseQuery('work_sessions', 'PATCH', {
        ended_at: now.toISOString(),
        duration_seconds: durationSeconds,
        billed_hours: billedHours,
      }, `id=eq.${session.id}`);

      // Update customer hours_used
      // Sum all completed + active sessions for current month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const sessions = await supabaseQuery(
        'work_sessions',
        'GET',
        undefined,
        `customer_id=eq.${resolvedCustomerId}&started_at=gte.${monthStart}&select=billed_hours`
      );

      const totalHours = (sessions || []).reduce(
        (sum: number, s: { billed_hours: number }) => sum + (parseFloat(String(s.billed_hours)) || 0),
        0
      );

      await supabaseQuery('customers', 'PATCH',
        { hours_used: Math.round(totalHours * 100) / 100 },
        `id=eq.${resolvedCustomerId}`
      );
    } else {
      // Create new work session
      await supabaseQuery('work_sessions', 'POST', {
        customer_id: resolvedCustomerId,
        vm_computer_id: computer_id,
        started_at: now.toISOString(),
        status: 'active',
        billing_rate: 4.98,
      });
    }

    // Update customer VM status to running (heartbeat confirms it's alive)
    await supabaseQuery('customers', 'PATCH',
      { vm_status: 'running' },
      `id=eq.${resolvedCustomerId}`
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_TELEMETRY]', message);
    return NextResponse.json(
      { error: 'Telemetry processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    const sessions = await supabaseQuery(
      'work_sessions',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&order=started_at.desc&limit=${limit}`
    );

    const totalHours = (sessions || []).reduce(
      (sum: number, s: { billed_hours: number }) => sum + (parseFloat(String(s.billed_hours)) || 0),
      0
    );

    return NextResponse.json({
      customer_id: customerId,
      sessions: sessions || [],
      summary: {
        total_sessions: (sessions || []).length,
        total_hours: Math.round(totalHours * 100) / 100,
        total_cost: Math.round(totalHours * 4.98 * 100) / 100,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_TELEMETRY_GET]', message);
    return NextResponse.json(
      { error: 'Failed to fetch telemetry data' },
      { status: 500 }
    );
  }
}
