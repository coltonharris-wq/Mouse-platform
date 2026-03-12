/**
 * GET  /api/conversations/[id]/messages — Get messages for a conversation
 * POST /api/conversations/[id]/messages — Send message, route to VM, return response
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { bashExec } from '@/lib/orgo';

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

    // Save user message
    const userMsg = await supabaseQuery('messages', 'POST', {
      conversation_id: conversationId,
      customer_id,
      role: 'user',
      content,
    });

    // Get customer's VM computer_id
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customer_id}&select=vm_computer_id,vm_status`
    );

    const customer = customers?.[0];
    let assistantContent: string;
    let metadata: Record<string, unknown> = {};
    const startTime = Date.now();

    if (customer?.vm_computer_id && customer?.vm_status === 'running') {
      // Route to KingMouse VM via bashExec
      try {
        const escapedContent = content.replace(/'/g, "'\\''");
        const result = await bashExec(
          customer.vm_computer_id,
          `cd /opt/kingmouse/workspace && echo '${escapedContent}' | openclaw chat 2>/dev/null`,
          120
        );

        if (result.success && result.data?.output) {
          assistantContent = result.data.output.trim();
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

    // Save assistant message
    const assistantMsg = await supabaseQuery('messages', 'POST', {
      conversation_id: conversationId,
      customer_id,
      role: 'assistant',
      content: assistantContent,
      metadata,
    });

    // Update conversation stats
    await supabaseQuery('conversations', 'PATCH', {
      last_message_at: new Date().toISOString(),
      message_count: (await supabaseQuery('messages', 'GET', undefined,
        `conversation_id=eq.${conversationId}&select=id`
      ))?.length || 0,
    }, `id=eq.${conversationId}`);

    // Auto-title from first message (if conversation is untitled)
    const convo = await supabaseQuery('conversations', 'GET', undefined,
      `id=eq.${conversationId}&select=title,message_count`
    );
    if (convo?.[0]?.title === 'New conversation') {
      const shortTitle = content.length > 40 ? content.substring(0, 40) + '...' : content;
      await supabaseQuery('conversations', 'PATCH',
        { title: shortTitle },
        `id=eq.${conversationId}`
      );
    }

    return NextResponse.json({
      user_message: userMsg?.[0] || null,
      assistant_message: assistantMsg?.[0] || { role: 'assistant', content: assistantContent, metadata },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[MESSAGES_POST]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
