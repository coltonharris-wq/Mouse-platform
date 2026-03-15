import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getVerticalConfig } from '@/lib/config-loader';
import { extractVmIp } from '@/lib/orgo';

const HOURS_PER_MESSAGE = 0.002;

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function authenticateUser(request: NextRequest) {
  const supabase = createServiceClient();
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return { supabase, user: null };
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  return { supabase, user };
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);

    // Config - return king mouse greeting/quick actions from vertical config
    if (url.searchParams.has('config')) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const nicheId = profile?.vertical_config_id || (profile?.niche ? slugify(profile.niche) : null);
      const config = nicheId ? getVerticalConfig(nicheId) : null;
      return NextResponse.json({ kingMouse: config?.kingMouse || null });
    }

    // Conversations list
    if (url.searchParams.has('conversations')) {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      return NextResponse.json({ conversations: conversations || [] });
    }

    // Messages for a conversation
    const conversationId = url.searchParams.get('conversation_id');
    if (conversationId) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();
      if (!conv) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      return NextResponse.json({ messages: messages || [] });
    }

    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  } catch (err) {
    console.error('Chat GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, conversation_id } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check user's remaining work hours
    const { data: workHours } = await supabase
      .from('work_hours')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!workHours || workHours.remaining < HOURS_PER_MESSAGE) {
      return NextResponse.json(
        { success: false, error: 'Insufficient work hours. Please purchase more hours.' },
        { status: 402 }
      );
    }

    // Get user's VM
    const { data: vm } = await supabase
      .from('vms')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'ready')
      .single();

    // Get user profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get or create conversation
    let activeConversationId = conversation_id;

    if (!activeConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: message.slice(0, 100),
          niche: profile?.niche || null,
        })
        .select()
        .single();

      if (convError) {
        console.error('Failed to create conversation:', convError);
        return NextResponse.json(
          { success: false, error: 'Failed to create conversation' },
          { status: 500 }
        );
      }

      activeConversationId = newConversation.id;
    }

    // Get conversation history for context
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(50);

    const messages = [
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    let assistantResponse: string;

    if (vm?.ip_address) {
      // VM is ready - proxy to VM
      try {
        const vmResponse = await fetch(`http://${extractVmIp(vm.ip_address)}:${vm.port}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            user_id: user.id,
            profile: {
              company_name: profile?.company_name,
              industry: profile?.industry,
              niche: profile?.niche,
            },
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (!vmResponse.ok) {
          throw new Error(`VM responded with status ${vmResponse.status}`);
        }

        const vmData = await vmResponse.json();
        assistantResponse = vmData.response || vmData.content || vmData.message;
      } catch (vmErr) {
        console.error('VM chat failed:', vmErr);
        return NextResponse.json({
          reply: null,
          conversation_id: activeConversationId,
          error: 'king_mouse_down',
          support_message: 'King Mouse is temporarily unavailable. Please call (910) 515-8927 for immediate human support to get this back online for you ASAP.',
          support_phone: '9105158927',
        }, { status: 503 });
      }
    } else {
      // No VM ready — do not fall back to any API
      return NextResponse.json({
        reply: null,
        conversation_id: activeConversationId,
        error: 'no_vm',
        support_message: 'Your AI employee is still being set up. If this persists, please call (910) 515-8927 for immediate human support.',
        support_phone: '9105158927',
      }, { status: 503 });
    }

    // Save user message
    await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        conversation_id: activeConversationId,
        role: 'user',
        content: message,
      });

    // Save assistant message
    await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        conversation_id: activeConversationId,
        role: 'assistant',
        content: assistantResponse,
      });

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeConversationId);

    // Log usage event
    await supabase
      .from('usage_events')
      .insert({
        user_id: user.id,
        service: 'king_mouse_chat',
        description: `Chat message in conversation ${activeConversationId}`,
        hours_used: HOURS_PER_MESSAGE,
      });

    // Deduct work hours
    await supabase
      .from('work_hours')
      .update({
        total_used: workHours.total_used + HOURS_PER_MESSAGE,
        remaining: workHours.remaining - HOURS_PER_MESSAGE,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({
      reply: assistantResponse,
      conversation_id: activeConversationId,
      hours_used: HOURS_PER_MESSAGE,
      hours_remaining: workHours.remaining - HOURS_PER_MESSAGE,
    });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

