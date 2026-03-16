/**
 * POST /api/vm/chat — Send a message to the customer's KingMouse VM
 * GET  /api/vm/chat?customer_id=xxx — Load chat history from chat_logs
 * NO cloud fallback — the VM IS the product
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { bashExec } from '@/lib/orgo';
import { checkBalance, deductHours, BILLING_RATES } from '@/lib/billing';
import { verifyAuth, requireCustomerAccess } from '@/lib/auth';

/**
 * Check if the VM has finished provisioning by looking for the
 * .provision-complete marker written by install.sh Phase 6.
 */
async function checkProvisionComplete(computerId: string): Promise<boolean> {
  try {
    const result = await bashExec(
      computerId,
      'cat /opt/king-mouse/.provision-complete 2>/dev/null',
      5
    );
    return result.success && result.data?.output?.trim() === 'SUCCESS';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');
  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  const auth = await verifyAuth(request);
  const accessError = requireCustomerAccess(auth, customerId);
  if (accessError) return accessError;

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

    const auth = await verifyAuth(request);
    const accessError = requireCustomerAccess(auth, customer_id);
    if (accessError) return accessError;

    // ── HOUR ENFORCEMENT ──
    const balanceError = await checkBalance(customer_id, BILLING_RATES.CHAT_MESSAGE);
    if (balanceError) {
      return NextResponse.json(
        { error: 'You have no remaining hours. Please purchase more hours to continue using King Mouse.', balance_error: true },
        { status: 402 }
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

    // If VM is not ready, check if provisioning just completed
    if (customer.vm_status !== 'ready' && customer.vm_status !== 'running') {
      if (
        (customer.vm_status === 'provisioning' || customer.vm_status === 'installing') &&
        customer.vm_computer_id
      ) {
        const complete = await checkProvisionComplete(customer.vm_computer_id);
        if (complete) {
          // Provisioning just finished — update status and proceed
          await supabaseQuery('customers', 'PATCH',
            { vm_status: 'ready' },
            `id=eq.${customer_id}`
          );
        } else {
          return NextResponse.json(
            { error: 'Your AI employee is still being set up. Please wait a few minutes.' },
            { status: 503 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Your AI employee is currently offline. Please contact support.' },
          { status: 503 }
        );
      }
    }

    if (!customer.vm_computer_id) {
      return NextResponse.json(
        { error: 'No VM assigned to this customer' },
        { status: 503 }
      );
    }

    // Send message to VM via OpenClaw agent CLI on the VM
    // v2026.3.13: 'openclaw chat' does not exist. Use 'openclaw agent --session-id --message --json'
    const escapedMessage = message.replace(/'/g, "'\\''").replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
    const sessionId = `km-${customer_id}`;
    const result = await bashExec(
      customer.vm_computer_id,
      `cd /opt/king-mouse/workspace && source /etc/environment 2>/dev/null; timeout 45 openclaw agent --session-id '${sessionId}' --message '${escapedMessage}' --json 2>&1 || echo '{"payloads":[{"text":"I am having trouble right now. Please try again in a moment."}],"error":true}'`,
      50
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
        // Fallback error response
        response = parsed.payloads?.[0]?.text || parsed.response || 'I am having trouble right now. Please try again.';
      } else if (parsed.payloads) {
        // OpenClaw v2026.3.13 agent --json format: { payloads: [{ text: "..." }], meta: {...} }
        response = parsed.payloads.map((p: { text?: string }) => p.text).filter(Boolean).join('\n');
        actionsTaken = parsed.meta?.agentMeta?.actions || [];
      } else {
        response = parsed.response || parsed.message || result.data.output;
        actionsTaken = parsed.actions_taken || [];
      }
    } catch {
      // Raw text output
      response = result.data.output;
    }

    // ── DEDUCT HOURS ──
    try {
      await deductHours(
        customer_id,
        BILLING_RATES.CHAT_MESSAGE,
        'king_mouse_chat',
        `Chat: ${message.slice(0, 100)}`
      );
    } catch (billErr) {
      console.error('[VM_CHAT] Hour deduction failed:', billErr);
      // Still return response — deduction failure is logged, not user-facing
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
