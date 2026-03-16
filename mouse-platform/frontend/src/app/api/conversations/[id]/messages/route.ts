/**
 * GET  /api/conversations/[id]/messages — Get messages for a conversation
 * POST /api/conversations/[id]/messages — Send message, route to VM, return response
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { bashExec } from '@/lib/orgo';
import { checkBalance, deductHours, BILLING_RATES } from '@/lib/billing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const limit = request.nextUrl.searchParams.get('limit') || '50';

    const messages = await supabaseQuery(
      'messages',
      'GET',
      undefined,
      `conversation_id=eq.${id}&order=created_at.asc&limit=${limit}&select=*`
    );

    return NextResponse.json({ messages: messages || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[MESSAGES_GET]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const { customer_id, content } = await request.json();

    if (!customer_id || !content) {
      return NextResponse.json({ error: 'customer_id and content required' }, { status: 400 });
    }

    // ── HOUR ENFORCEMENT ──
    const balanceError = await checkBalance(customer_id, BILLING_RATES.CHAT_MESSAGE);
    if (balanceError) {
      return NextResponse.json(
        { error: 'You have no remaining hours. Please purchase more hours to continue.', balance_error: true },
        { status: 402 }
      );
    }

    // Resolve customer → user_id for messages table
    let resolvedUserId = customer_id;
    let customers = await supabaseQuery(
      'customers', 'GET', undefined,
      `id=eq.${customer_id}&select=id,user_id,vm_computer_id,vm_status`
    );
    let customer = customers?.[0];

    if (!customer) {
      const byUserId = await supabaseQuery(
        'customers', 'GET', undefined,
        `user_id=eq.${customer_id}&select=id,user_id,vm_computer_id,vm_status`
      );
      customer = byUserId?.[0];
    }

    if (customer?.user_id) resolvedUserId = customer.user_id;

    // Save user message (messages table uses user_id)
    const userMsg = await supabaseQuery('messages', 'POST', {
      conversation_id: conversationId,
      user_id: resolvedUserId,
      role: 'user',
      content,
    });

    // Fallback: bridge from profiles table (retroactive for deployed signup users)
    if (!customer) {
      try {
        const profiles = await supabaseQuery(
          'profiles',
          'GET',
          undefined,
          `id=eq.${customer_id}&select=*`
        );
        const profile = profiles?.[0];

        if (profile) {
          // Auto-create customer from profile data
          const bridged = await supabaseQuery('customers', 'POST', {
            user_id: profile.id,
            email: profile.email || '',
            owner_name: profile.full_name || '',
            company_name: profile.company_name || '',
            business_name: profile.company_name || '',
            onboarding_answers: {
              business_description: profile.business_description || '',
              biggest_pain: profile.biggest_pain || '',
              tools_used: profile.tools_used || '',
              team_size: profile.team_size || '',
            },
            vm_status: 'pending',
            status: 'active',
          });
          customer = bridged?.[0];
        }
      } catch (bridgeErr) {
        console.error('[MESSAGES_POST] Profile bridge failed:', bridgeErr);
      }
    }

    // Check if provisioning completed (.provision-complete marker)
    if (customer?.vm_computer_id && customer?.vm_status === 'provisioning') {
      try {
        const checkComplete = await bashExec(
          customer.vm_computer_id,
          'cat /opt/king-mouse/.provision-complete 2>/dev/null || echo "NOT_DONE"',
          10
        );
        if (checkComplete.data?.output?.trim() === 'SUCCESS') {
          await supabaseQuery('customers', 'PATCH', {
            vm_status: 'ready',
            vm_provisioned_at: new Date().toISOString(),
          }, `id=eq.${customer.id}`);
          customer.vm_status = 'ready';
        }
      } catch {
        // Check failed — leave as provisioning
      }
    }

    let assistantContent: string;
    let metadata: Record<string, unknown> = {};
    const startTime = Date.now();

    if (customer?.vm_computer_id && (customer?.vm_status === 'ready' || customer?.vm_status === 'running')) {
      // Route to KingMouse VM via bashExec (openclaw agent, not chat — v2026.3.13)
      try {
        const escapedContent = content.replace(/'/g, "'\\''");
        const sessionId = `km-${customer_id}`;
        const result = await bashExec(
          customer.vm_computer_id,
          `cd /opt/king-mouse/workspace && source /etc/environment 2>/dev/null; timeout 45 openclaw agent --session-id '${sessionId}' --message '${escapedContent}' --json 2>&1`,
          50
        );

        if (result.success && result.data?.output) {
          // Parse OpenClaw v2026.3.13 agent --json format
          try {
            const parsed = JSON.parse(result.data.output);
            if (parsed.payloads) {
              assistantContent = parsed.payloads.map((p: { text?: string }) => p.text).filter(Boolean).join('\n');
            } else {
              assistantContent = result.data.output.trim();
            }
          } catch {
            assistantContent = result.data.output.trim();
          }
          metadata = {
            source: 'vm',
            duration_ms: Date.now() - startTime,
            exit_code: result.data.exit_code,
          };
        } else {
          assistantContent = "I'm having trouble processing that right now. Let me try again in a moment. Can you rephrase your request?";
          metadata = { source: 'fallback', error: result.error };
        }
      } catch (err) {
        assistantContent = "I encountered an issue connecting to my workspace. Please try again in a moment.";
        metadata = { source: 'error', error: err instanceof Error ? err.message : 'Unknown' };
      }
    } else {
      // VM not ready — provide helpful response
      assistantContent = customer?.vm_status === 'provisioning'
        ? "I'm still being set up! I'll be ready to help in about a minute. Please try again shortly."
        : "My workspace isn't available right now. Please contact support if this persists.";
      metadata = { source: 'no_vm', vm_status: customer?.vm_status || 'unknown' };
    }

    // ── DEDUCT HOURS (only if VM was actually used) ──
    if (metadata.source === 'vm') {
      try {
        await deductHours(
          customer_id,
          BILLING_RATES.CHAT_MESSAGE,
          'king_mouse_chat',
          `Chat: ${content.slice(0, 100)}`
        );
      } catch (billErr) {
        console.error('[MESSAGES_POST] Hour deduction failed:', billErr);
      }
    }

    // Save assistant message (messages table: user_id, no metadata column)
    const assistantMsg = await supabaseQuery('messages', 'POST', {
      conversation_id: conversationId,
      user_id: resolvedUserId,
      role: 'assistant',
      content: assistantContent,
    });

    // Update conversation timestamp
    try {
      await supabaseQuery('conversations', 'PATCH', {
        updated_at: new Date().toISOString(),
      }, `id=eq.${conversationId}`);
    } catch { /* non-fatal */ }

    // Auto-title from first message (if conversation is untitled)
    try {
      const convo = await supabaseQuery('conversations', 'GET', undefined,
        `id=eq.${conversationId}&select=title`
      );
      if (convo?.[0]?.title === 'New conversation') {
        const shortTitle = content.length > 40 ? content.substring(0, 40) + '...' : content;
        await supabaseQuery('conversations', 'PATCH',
          { title: shortTitle },
          `id=eq.${conversationId}`
        );
      }
    } catch { /* non-fatal */ }

    return NextResponse.json({
      user_message: userMsg?.[0] || null,
      assistant_message: assistantMsg?.[0] || { role: 'assistant', content: assistantContent },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[MESSAGES_POST]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
