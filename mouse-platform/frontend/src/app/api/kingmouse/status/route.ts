import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customer_id');
    if (!customerId) {
      return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
    }

    // Check business hours (sleeping = 10pm-7am)
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 22 || hour < 7) {
      return NextResponse.json({
        status: 'sleeping',
        current_task: null,
        last_active: now.toISOString(),
      });
    }

    // Check for in-progress tasks
    const inProgressTasks = await supabaseQuery(
      'task_log', 'GET', undefined,
      `customer_id=eq.${customerId}&type=eq.in_progress&select=title,started_at&limit=5`
    ) || [];

    if (inProgressTasks.length > 1) {
      return NextResponse.json({
        status: 'orchestrating',
        current_task: `Running ${inProgressTasks.length} tasks`,
        last_active: now.toISOString(),
      });
    }

    if (inProgressTasks.length === 1) {
      return NextResponse.json({
        status: 'working',
        current_task: inProgressTasks[0].title,
        last_active: now.toISOString(),
      });
    }

    // Check for recent messages (thinking = last message < 30 seconds ago)
    const recentMessages = await supabaseQuery(
      'messages', 'GET', undefined,
      `customer_id=eq.${customerId}&role=eq.user&order=created_at.desc&limit=1&select=created_at`
    ) || [];

    if (recentMessages.length > 0) {
      const lastMsg = new Date(recentMessages[0].created_at);
      const diff = now.getTime() - lastMsg.getTime();
      if (diff < 30000) {
        return NextResponse.json({
          status: 'thinking',
          current_task: 'Processing your message...',
          last_active: now.toISOString(),
        });
      }
    }

    // Default: idle
    return NextResponse.json({
      status: 'idle',
      current_task: null,
      last_active: now.toISOString(),
    });
  } catch {
    // On error, return idle to avoid UI breakage
    return NextResponse.json({
      status: 'idle',
      current_task: null,
      last_active: new Date().toISOString(),
    });
  }
}
