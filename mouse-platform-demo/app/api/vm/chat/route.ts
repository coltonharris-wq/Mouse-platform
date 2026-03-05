export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { executeBash } from '@/lib/orgo';
import { checkBalance, recordUsage } from '@/lib/usage-tracker';
import type { UsageEventType } from '@/lib/usage-tracker';

/**
 * POST /api/vm/chat — Web Chat Bridge
 * 
 * Proxies chat messages from the dashboard to a customer's King Mouse VM.
 * Uses Orgo bash API to run chat-bridge.mjs on the VM, which connects to
 * the local OpenClaw gateway via WebSocket for full agent pipeline
 * (SOUL.md, memory, tools, Owner Logic Engine).
 * 
 * Request: { message: string, customerId: string, sessionKey?: string }
 * Response: { reply: string, error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { message, customerId, sessionKey } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // --- BILLING: Check balance before sending to VM ---
    const estimatedCost = 0.002; // King Mouse chat (Kimi K2.5 on VM)
    const balanceCheck = await checkBalance(customerId, 'chat_kimi' as UsageEventType, estimatedCost);
    if (!balanceCheck.hasBalance) {
      return NextResponse.json({
        reply: "Your work hours have run out. Purchase more hours to continue chatting with King Mouse.",
        depleted: true,
      });
    }

    // --- FIND VM: Look up customer's active King Mouse VM ---
    const { data: vm, error: vmErr } = await supabase
      .from('employee_vms')
      .select('computer_id, status, employee_name')
      .eq('customer_id', customerId)
      .in('status', ['running', 'provisioning', 'provisioned', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (vmErr || !vm) {
      return NextResponse.json({
        error: 'No active King Mouse found. Hire one from the marketplace first.',
        fallback: true, // Signal frontend to fall back to /api/chat
      }, { status: 404 });
    }

    // --- SEND MESSAGE VIA ORGO BASH ---
    // Escape the message for bash (single-quote safe)
    const escapedMessage = message.replace(/'/g, "'\\''");
    const sessArg = sessionKey ? ` '${sessionKey.replace(/'/g, "'\\''")}'` : '';

    // Run chat-bridge.mjs on the VM via Orgo
    const command = `cd $HOME && node chat-bridge.mjs '${escapedMessage}'${sessArg}`;

    let result;
    try {
      result = await executeBash(vm.computer_id, command);
    } catch (err: any) {
      console.error(`[VM Chat] Orgo bash failed for ${vm.computer_id}:`, err);
      return NextResponse.json({
        error: 'King Mouse VM is not responding. It may be starting up — try again in a minute.',
        vmStatus: vm.status,
      }, { status: 502 });
    }

    if (!result.success) {
      console.error(`[VM Chat] chat-bridge failed on ${vm.computer_id}:`, result.output);
      
      // Check for common failure modes
      if (result.output?.includes('connection failed') || result.output?.includes('ECONNREFUSED')) {
        return NextResponse.json({
          error: 'King Mouse is still booting up. Give it a minute and try again.',
          vmStatus: 'starting',
        }, { status: 503 });
      }

      return NextResponse.json({
        error: 'King Mouse encountered an error processing your message.',
        details: result.output?.substring(0, 200),
      }, { status: 502 });
    }

    // --- PARSE RESPONSE ---
    let parsed;
    try {
      // chat-bridge.mjs outputs JSON on the last line
      const lines = result.output.trim().split('\n');
      const jsonLine = lines[lines.length - 1];
      parsed = JSON.parse(jsonLine);
    } catch {
      // If can't parse, try to use the raw output
      parsed = { reply: result.output?.trim() || 'No response from King Mouse.', error: null };
    }

    if (parsed.error) {
      return NextResponse.json({
        error: `King Mouse error: ${parsed.error}`,
      }, { status: 502 });
    }

    // --- BILLING: Record usage (flat rate per message for now) ---
    const vendorCost = 0.001; // Kimi K2.5 is cheap, estimate per message
    await recordUsage(customerId, 'chat_kimi' as UsageEventType, vendorCost, {
      model: 'kimi-k2-0711',
      provider: 'moonshot',
      via: 'vm-chat-bridge',
      vm_id: vm.computer_id,
      message_preview: message.substring(0, 100),
    });

    return NextResponse.json({
      reply: parsed.reply,
      via: 'king-mouse-vm',
      vmId: vm.computer_id,
    });

  } catch (error: any) {
    console.error('[VM Chat] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/vm/chat?customerId=xxx — Check if customer has VM chat available
 */
export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customerId');
  if (!customerId) {
    return NextResponse.json({ error: 'customerId required' }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ available: false });
  }

  const { data: vm } = await supabase
    .from('employee_vms')
    .select('computer_id, status, employee_name')
    .eq('customer_id', customerId)
    .in('status', ['running', 'provisioning', 'provisioned', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    available: !!vm,
    vmId: vm?.computer_id || null,
    vmStatus: vm?.status || null,
    employeeName: vm?.employee_name || null,
  });
}
