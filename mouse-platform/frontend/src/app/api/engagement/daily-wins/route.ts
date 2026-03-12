/**
 * GET /api/engagement/daily-wins?customer_id=xxx
 * Returns yesterday's metrics for the Daily Wins card.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const metrics = await supabaseQuery(
      'daily_metrics',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&date=eq.${dateStr}&select=*&limit=1`
    );

    if (metrics && metrics.length > 0) {
      const m = metrics[0];
      return NextResponse.json({
        date: dateStr,
        hours_worked: parseFloat(m.hours_worked) || 0,
        tasks_completed: m.tasks_completed || 0,
        calls_handled: m.calls_handled || 0,
        emails_handled: m.emails_handled || 0,
        estimated_hours_saved: parseFloat(m.estimated_hours_saved) || 0,
        has_data: true,
      });
    }

    // Fallback: compute from telemetry if daily_metrics not populated
    let hoursWorked = 0;
    try {
      const sessions = await supabaseQuery(
        'vm_telemetry',
        'GET',
        undefined,
        `customer_id=eq.${customerId}&started_at=gte.${dateStr}T00:00:00&started_at=lt.${dateStr}T23:59:59&select=billed_hours`
      );
      if (sessions) {
        hoursWorked = sessions.reduce(
          (sum: number, s: { billed_hours: number }) => sum + (parseFloat(String(s.billed_hours)) || 0),
          0
        );
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      date: dateStr,
      hours_worked: hoursWorked,
      tasks_completed: 0,
      calls_handled: 0,
      emails_handled: 0,
      estimated_hours_saved: hoursWorked * 1.5, // Estimate: each KM hour saves 1.5 human hours
      has_data: hoursWorked > 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[DAILY_WINS]', message);
    return NextResponse.json({ error: 'Failed to fetch daily wins' }, { status: 500 });
  }
}
