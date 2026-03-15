import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getVerticalConfig } from '@/lib/config-loader';

const ORGO_BASE = process.env.ORGO_BASE_URL || 'https://www.orgo.ai/api';
const HOURS_PER_MESSAGE = 0.002;

// Allow up to 60s for agent CLI responses
export const maxDuration = 60;

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

    let assistantResponse: string;

    if (vm?.orgo_vm_id) {
      // VM is ready — run agent CLI via Orgo exec (gateway is WebSocket-only)
      try {
        const lastUserMsg = message;
        const sessionId = activeConversationId || 'default';

        // Build Python code that reads the API key from the VM and runs the agent CLI
        const msgB64 = Buffer.from(lastUserMsg).toString('base64');
        const pythonCode = [
          'import subprocess,json,base64,os',
          'try:',
          '  os.environ["MOONSHOT_API_KEY"]=open("/opt/king-mouse/.moonshot-key").read().strip()',
          'except: pass',
          `msg=base64.b64decode("${msgB64}").decode()`,
          `r=subprocess.run(["node","/opt/king-mouse/openclaw.mjs","agent","--message",msg,"--json","--agent","main","--session-id","${sessionId}","--timeout","45"],capture_output=True,text=True,timeout=55,cwd="/opt/king-mouse")`,
          'if r.returncode==0:',
          '  data=json.loads(r.stdout)',
          '  text=data.get("payloads",[{}])[0].get("text","No response")',
          '  print(json.dumps({"response":text}))',
          'else:',
          '  print(json.dumps({"error":r.stderr[-500:]}))',
        ].join('\n');

        const execRes = await fetch(`${ORGO_BASE}/computers/${vm.orgo_vm_id}/exec`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.ORGO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: pythonCode }),
          signal: AbortSignal.timeout(90000),
        });

        if (!execRes.ok) {
          throw new Error(`Orgo exec (${execRes.status})`);
        }

        const execData = await execRes.json();
        if (!execData.success) {
          throw new Error(`Orgo exec failed: ${execData.output?.slice(0, 200)}`);
        }

        const vmData = JSON.parse(execData.output.trim());
        if (vmData.error) {
          throw new Error(`Agent error: ${vmData.error.slice(0, 200)}`);
        }
        assistantResponse = vmData.response;
      } catch (vmErr) {
        const errMsg = vmErr instanceof Error ? vmErr.message : String(vmErr);
        console.error('VM chat failed:', errMsg);
        return NextResponse.json({
          reply: null,
          conversation_id: activeConversationId,
          error: 'king_mouse_down',
          support_message: 'King Mouse is temporarily unavailable. Please call (910) 515-8927 for immediate human support to get this back online for you ASAP.',
          support_phone: '9105158927',
          debug: errMsg,
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

