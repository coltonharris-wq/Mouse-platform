/**
 * POST /api/vm/chat — Send a message to the customer's KingMouse VM
 * GET  /api/vm/chat?customer_id=xxx — Load chat history from chat_logs
 * NO cloud fallback — the VM IS the product
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { bashExec } from '@/lib/orgo';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');
  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    const logs = await supabaseQuery(
      'chat_logs',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&order=timestamp.desc&limit=50`
    );

    // Reverse to chronological order and flatten into user/assistant pairs
    const messages = (logs || []).reverse().flatMap((log: { message: string; response: string; timestamp: string; action_taken?: string }) => [
      { role: 'user', content: log.message, timestamp: log.timestamp },
      { role: 'assistant', content: log.response, timestamp: log.timestamp, actions_taken: log.action_taken ? JSON.parse(log.action_taken) : [] },
    ]);

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customer_id, message } = await request.json();

    if (!customer_id || !message) {
      return NextResponse.json(
        { error: 'customer_id and message required' },
        { status: 400 }
      );
    }

    // Look up customer and VM status
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customer_id}&select=vm_computer_id,vm_status`
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customers[0];

    // If VM is not running, return error — NO fallback
    if (customer.vm_status !== 'running') {
      return NextResponse.json(
        { error: 'Your AI employee is currently offline. Please contact support.' },
        { status: 503 }
      );
    }

    if (!customer.vm_computer_id) {
      return NextResponse.json(
        { error: 'No VM assigned to this customer' },
        { status: 503 }
      );
    }

    // Send message to VM via OpenClaw CLI on the VM
    const escapedMessage = message.replace(/'/g, "'\\''").replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
    const result = await bashExec(
      customer.vm_computer_id,
      `cd /opt/kingmouse/workspace && timeout 30 openclaw chat -m '${escapedMessage}' --json 2>/dev/null || echo '${escapedMessage}' | openclaw chat --json 2>/dev/null || echo '{"response":"I am having trouble right now. Please try again in a moment.","error":true}'`,
      35
    );

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: 'Failed to communicate with AI employee' },
        { status: 502 }
      );
    }

    let response: string;
    let actionsTaken: string[] = [];

    try {
      const parsed = JSON.parse(result.data.output);
      if (parsed.error === true) {
        response = parsed.response || 'I am having trouble right now. Please try again.';
      } else {
        response = parsed.response || parsed.message || result.data.output;
        actionsTaken = parsed.actions_taken || [];
      }
    } catch {
      response = result.data.output;
    }

    // Log chat to chat_logs
    try {
      await supabaseQuery('chat_logs', 'POST', {
        customer_id,
        message,
        response,
        action_taken: actionsTaken.length > 0 ? JSON.stringify(actionsTaken) : null,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Non-fatal — chat still works even if logging fails
    }

    return NextResponse.json({ response, actions_taken: actionsTaken });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_CHAT]', errMsg);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
