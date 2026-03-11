/**
 * POST /api/vm/chat
 * Send a message to the customer's KingMouse VM
 * NO cloud fallback — the VM IS the product
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { bashExec } from '@/lib/orgo';

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

    // Send message to VM via OpenClaw WebSocket/CLI
    const escapedMessage = message.replace(/'/g, "'\\''");
    const result = await bashExec(
      customer.vm_computer_id,
      `cd /opt/openclaw && echo '${escapedMessage}' | node cli.js chat 2>/dev/null || echo '{"error":"Agent unavailable"}'`
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
      response = parsed.response || parsed.message || result.data.output;
      actionsTaken = parsed.actions_taken || [];
    } catch {
      response = result.data.output;
    }

    // Log chat
    await supabaseQuery('chat_logs', 'POST', {
      customer_id,
      message,
      response,
      action_taken: actionsTaken.length > 0 ? JSON.stringify(actionsTaken) : null,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ response, actions_taken: actionsTaken });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_CHAT]', message);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
