/**
 * GET /api/notifications/preferences?customer_id=xxx
 * PATCH /api/notifications/preferences — update preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    const prefs = await supabaseQuery(
      'notification_preferences',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&limit=1`
    );

    if (prefs && prefs.length > 0) {
      return NextResponse.json({ preferences: prefs[0] });
    }

    // Return defaults if no row exists
    return NextResponse.json({
      preferences: {
        customer_id: customerId,
        email_urgent: true,
        email_daily_summary: true,
        email_weekly_report: true,
        sms_critical: false,
        notification_email: null,
        notification_phone: null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[NOTIFICATION_PREFS_GET]', message);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, ...updates } = body;

    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
    }

    // Upsert — try update first, then insert
    const existing = await supabaseQuery(
      'notification_preferences',
      'GET',
      undefined,
      `customer_id=eq.${customer_id}&select=customer_id`
    );

    if (existing && existing.length > 0) {
      await supabaseQuery(
        'notification_preferences',
        'PATCH',
        { ...updates, updated_at: new Date().toISOString() },
        `customer_id=eq.${customer_id}`
      );
    } else {
      await supabaseQuery(
        'notification_preferences',
        'POST',
        { customer_id, ...updates, updated_at: new Date().toISOString() }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[NOTIFICATION_PREFS_PATCH]', message);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
