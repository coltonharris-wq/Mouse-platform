/**
 * GET /api/engagement/report-card?customer_id=xxx&period=monthly
 * Returns monthly summary: hours saved, tasks completed, calls handled, money saved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');
  const period = request.nextUrl.searchParams.get('period') || 'monthly';

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    const now = new Date();
    let startDate: string;
    let endDate: string;
    let periodLabel: string;

    if (period === 'weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      startDate = weekStart.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
      periodLabel = 'This Week';
    } else {
      // Monthly
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      periodLabel = monthNames[now.getMonth()] + ' ' + now.getFullYear();
    }

    // Sum daily_metrics for the period
    const metrics = await supabaseQuery(
      'daily_metrics',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&date=gte.${startDate}&date=lte.${endDate}&select=hours_worked,tasks_completed,calls_handled,emails_handled,estimated_hours_saved`
    );

    let totalHoursWorked = 0;
    let totalTasksCompleted = 0;
    let totalCallsHandled = 0;
    let totalEmailsHandled = 0;
    let totalHoursSaved = 0;

    if (metrics && metrics.length > 0) {
      for (const m of metrics) {
        totalHoursWorked += parseFloat(String(m.hours_worked)) || 0;
        totalTasksCompleted += m.tasks_completed || 0;
        totalCallsHandled += m.calls_handled || 0;
        totalEmailsHandled += m.emails_handled || 0;
        totalHoursSaved += parseFloat(String(m.estimated_hours_saved)) || 0;
      }
    }

    // Fallback: if no daily_metrics, use telemetry
    if (!metrics || metrics.length === 0) {
      try {
        const sessions = await supabaseQuery(
          'vm_telemetry',
          'GET',
          undefined,
          `customer_id=eq.${customerId}&started_at=gte.${startDate}T00:00:00&select=billed_hours`
        );
        if (sessions) {
          for (const s of sessions) {
            totalHoursWorked += parseFloat(String(s.billed_hours)) || 0;
            totalTasksCompleted += 1;
          }
          totalHoursSaved = totalHoursWorked * 1.5;
        }
      } catch {
        // Non-fatal
      }
    }

    // Estimated money saved = hours saved x $35/hr human equivalent
    const estimatedMoneySaved = Math.round(totalHoursSaved * 35);

    // Get customer tenure
    let monthsActive = 1;
    try {
      const cust = await supabaseQuery(
        'customers',
        'GET',
        undefined,
        `id=eq.${customerId}&select=created_at`
      );
      if (cust && cust.length > 0) {
        const created = new Date(cust[0].created_at);
        monthsActive = Math.max(1, Math.floor((now.getTime() - created.getTime()) / (30 * 86400000)));
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      period: periodLabel,
      period_type: period,
      hours_worked: Math.round(totalHoursWorked * 100) / 100,
      tasks_completed: totalTasksCompleted,
      calls_handled: totalCallsHandled,
      emails_handled: totalEmailsHandled,
      hours_saved: Math.round(totalHoursSaved * 100) / 100,
      estimated_money_saved: estimatedMoneySaved,
      months_active: monthsActive,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ENGAGEMENT_REPORT_CARD]', message);
    return NextResponse.json({ error: 'Failed to fetch report card' }, { status: 500 });
  }
}
