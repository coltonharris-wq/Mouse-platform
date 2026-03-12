/**
 * POST /api/vm/notify
 *
 * mouse_notify — Sub-agents POST notifications here
 * Writes to Supabase notifications table, triggers dashboard "Ping" bell
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

interface NotifyRequest {
  customer_id: string;
  agent_type: string;     // 'receptionist' | 'lead_funnel' | 'king_mouse' etc.
  type: string;           // 'task_complete' | 'approval_needed' | 'alert' | 'info'
  message: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export async function POST(request: NextRequest) {
  try {
    const body: NotifyRequest = await request.json();
    const { customer_id, agent_type, type, message } = body;

    if (!customer_id || !message) {
      return NextResponse.json(
        { error: 'customer_id and message required' },
        { status: 400 }
      );
    }

    // Write notification
    const notification = await supabaseQuery('notifications', 'POST', {
      customer_id,
      agent_type: agent_type || 'king_mouse',
      type: type || 'info',
      message,
      metadata: body.metadata || {},
      priority: body.priority || 'normal',
      read: false,
      created_at: new Date().toISOString(),
    });

    // Also log as usage event for telemetry
    await supabaseQuery('usage_events', 'POST', {
      customer_id,
      event_type: 'notification',
      agent_type: agent_type || 'king_mouse',
      description: `[${type}] ${message}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      notification_id: notification?.[0]?.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET notifications for dashboard bell
export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');
  const unreadOnly = request.nextUrl.searchParams.get('unread') !== 'false';
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    let filters = `customer_id=eq.${customerId}&order=created_at.desc&limit=${limit}`;
    if (unreadOnly) {
      filters += '&read=eq.false';
    }

    const notifications = await supabaseQuery('notifications', 'GET', undefined, filters);

    return NextResponse.json({
      customer_id: customerId,
      notifications: notifications || [],
      unread_count: (notifications || []).filter((n: any) => !n.read).length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
