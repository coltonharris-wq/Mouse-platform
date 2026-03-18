import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getVerticalConfig } from '@/lib/config-loader';

const ORGO_BASE = process.env.ORGO_BASE_URL || 'https://www.orgo.ai/api';

// Token-based pricing
const INPUT_COST_PER_MILLION = 6.00;   // $6.00 per 1M input tokens
const OUTPUT_COST_PER_MILLION = 30.00; // $30.00 per 1M output tokens
const DOLLARS_PER_HOUR = 4.98;         // 1 work hour = $4.98
const CHARS_PER_TOKEN = 4;             // estimation fallback when provider returns 0

// Allow up to 300s for agent CLI responses (complex tasks use tools)
export const maxDuration = 300;

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

    if (!workHours || workHours.remaining <= 0) {
      return NextResponse.json(
        { success: false, error: 'Insufficient work hours. Please purchase more hours.' },
        { status: 402 }
      );
    }

    // Get user's VM — prefer ready, fall back to provisioning/installing
    const { data: vm } = await supabase
      .from('vms')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'ready')
      .single();

    // If no ready VM, check for one still being set up
    // NOTE: Do NOT promote to "ready" here via exec checks — Orgo exec gives
    // false positives on fresh VMs. The ONLY path to "ready" is the
    // install-complete callback (POST /api/vm/install-complete).
    if (!vm) {
      const { data: pendingVm } = await supabase
        .from('vms')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['provisioning', 'installing'])
        .single();

      if (pendingVm) {
        return NextResponse.json({
          reply: null,
          conversation_id: conversation_id || null,
          error: 'vm_provisioning',
          support_message: 'Your AI employee is almost ready — still setting up. Check back in a moment.',
        }, { status: 503 });
      }
    }

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
    let hoursUsed = 0;
    let tokenUsage = { inputTokens: 0, outputTokens: 0, inputCost: 0, outputCost: 0 };

    if (vm?.orgo_vm_id) {
      // VM is ready — run agent CLI via Orgo exec (gateway is WebSocket-only)
      try {
        const lastUserMsg = message;

        // Build Python code that talks to OpenClaw gateway via HTTP API
        // Includes self-healing: if gateway is down, set up config + start it
        const msgB64 = Buffer.from(lastUserMsg).toString('base64');
        const vmConfig = vm as Record<string, unknown>;
        const vmApiKey = ((vmConfig.config_json as Record<string, unknown>)?.moonshot_api_key as string) || '';
        const keyB64 = Buffer.from(vmApiKey).toString('base64');
        const pythonCode = [
          'import subprocess,json,base64,os,time',
          '',
          '# Get API key from Supabase config (passed in) or local file',
          `_pk=base64.b64decode("${keyB64}").decode()`,
          'try:',
          '  _fk=open("/opt/king-mouse/.moonshot-key").read().strip()',
          '  api_key=_fk if _fk else _pk',
          'except:',
          '  api_key=_pk',
          'os.environ["MOONSHOT_API_KEY"]=api_key',
          '',
          '# Self-heal: if gateway is down, set up and start it',
          'cfg_path=os.path.expanduser("~/.openclaw/openclaw.json")',
          'try:',
          '  import urllib.request as _ur',
          '  _ur.urlopen("http://127.0.0.1:18789/health",timeout=3)',
          'except:',
          '  os.makedirs("/opt/king-mouse",exist_ok=True)',
          '  open("/opt/king-mouse/.moonshot-key","w").write(api_key)',
          '  os.makedirs(os.path.dirname(cfg_path),exist_ok=True)',
          '  if not os.path.exists(cfg_path) or os.path.getsize(cfg_path)<10:',
          '    json.dump({"gateway":{"port":18789,"bind":"lan","http":{"endpoints":{"chatCompletions":{"enabled":True}}}},"agents":{"defaults":{"timeoutSeconds":60}},"env":{"MOONSHOT_API_KEY":api_key}},open(cfg_path,"w"),indent=2)',
          '  subprocess.run(["openclaw","onboard","--non-interactive","--mode","local","--auth-choice","moonshot-api-key","--moonshot-api-key",api_key,"--gateway-port","18789","--gateway-bind","lan","--accept-risk"],capture_output=True,text=True,timeout=120)',
          '  try:',
          '    _c=json.load(open(cfg_path))',
          '    _c.setdefault("gateway",{}).setdefault("http",{}).setdefault("endpoints",{})["chatCompletions"]={"enabled":True}',
          '    _c.setdefault("agents",{}).setdefault("defaults",{})["timeoutSeconds"]=60',
          '    json.dump(_c,open(cfg_path,"w"),indent=2)',
          '  except: pass',
          '  _env=dict(os.environ)',
          '  _env["DISPLAY"]=":99"',
          '  subprocess.Popen(["openclaw","gateway","run","--port","18789"],stdout=open("/tmp/king-mouse.log","a"),stderr=subprocess.STDOUT,env=_env)',
          '  time.sleep(6)',
          '',
          '# Read config for gateway auth token',
          'gw_token=""',
          'try:',
          '  cfg=json.load(open(cfg_path))',
          '  gw_token=cfg.get("gateway",{}).get("auth",{}).get("token","")',
          '  eps=cfg.setdefault("gateway",{}).setdefault("http",{}).setdefault("endpoints",{})',
          '  if not eps.get("chatCompletions",{}).get("enabled"):',
          '    eps["chatCompletions"]={"enabled":True}',
          '    cfg.setdefault("agents",{}).setdefault("defaults",{})["timeoutSeconds"]=60',
          '    json.dump(cfg,open(cfg_path,"w"),indent=2)',
          '    time.sleep(3)',
          'except: pass',
          '',
          `msg=base64.b64decode("${msgB64}").decode()`,
          'ok=False',
          'http_err=""',
          '',
          '# Primary: HTTP API with rate-limit retry (stateless — no session accumulation)',
          'try:',
          '  import urllib.request,urllib.error',
          '  body=json.dumps({"model":"openclaw:main","messages":[{"role":"user","content":msg}]}).encode()',
          '  headers={"Content-Type":"application/json"}',
          '  if gw_token: headers["Authorization"]=f"Bearer {gw_token}"',
          '  for _retry in range(5):',
          '    try:',
          '      req=urllib.request.Request("http://127.0.0.1:18789/v1/chat/completions",data=body,headers=headers)',
          '      resp=urllib.request.urlopen(req,timeout=240)',
          '      data=json.loads(resp.read())',
          '      text=data["choices"][0]["message"]["content"]',
          '      usage=data.get("usage",{})',
          '      print(json.dumps({"response":text,"input_tokens":usage.get("prompt_tokens",0),"output_tokens":usage.get("completion_tokens",0),"system_prompt_chars":0,"response_chars":len(text),"via":"http","retries":_retry}))',
          '      ok=True',
          '      break',
          '    except urllib.error.HTTPError as e:',
          '      if e.code==429 and _retry<4:',
          '        time.sleep(3*(2**_retry))',
          '        continue',
          '      raise',
          'except Exception as e:',
          '  http_err=str(e)[:200]',
          '',
          '# Fallback: CLI with FRESH session and rate-limit retry',
          'if not ok:',
          '  subprocess.run("rm -rf $HOME/.openclaw/agents/main/sessions $HOME/.openclaw/sessions",shell=True,capture_output=True)',
          '  for attempt in range(5):',
          '    r=subprocess.run(["openclaw","agent","--agent","main","-m",msg,"--json","--timeout","240"],capture_output=True,text=True,timeout=250)',
          '    if r.returncode==0:',
          '      try:',
          '        data=json.loads(r.stdout)',
          '        payloads=data.get("result",{}).get("payloads",[])',
          '        text=payloads[0]["text"] if payloads else r.stdout.strip()',
          '        usage=data.get("result",{}).get("meta",{}).get("agentMeta",{}).get("usage",{})',
          '        print(json.dumps({"response":text,"input_tokens":usage.get("input",0),"output_tokens":usage.get("output",0),"system_prompt_chars":0,"response_chars":len(str(text)),"via":"cli","retries":attempt,"http_error":http_err}))',
          '      except:',
          '        text=r.stdout.strip()',
          '        print(json.dumps({"response":text,"input_tokens":0,"output_tokens":0,"system_prompt_chars":0,"response_chars":len(text),"via":"cli","retries":attempt,"http_error":http_err}))',
          '      break',
          '    elif attempt<4:',
          '      wait=3*(2**attempt) if "rate limit" in (r.stderr or "").lower() else 2',
          '      time.sleep(wait)',
          '      subprocess.run("rm -rf $HOME/.openclaw/agents/main/sessions $HOME/.openclaw/sessions",shell=True,capture_output=True)',
          '    else:',
          '      print(json.dumps({"error":r.stderr[-500:],"http_error":http_err}))',
          '',
          '# Last resort: Claude Code doctor — diagnose and fix, then retry',
          'if not ok:',
          '  _ak=""',
          '  try: _ak=open("/opt/king-mouse/.anthropic-key").read().strip()',
          '  except: pass',
          '  if _ak:',
          '    _env=dict(os.environ)',
          '    _env["ANTHROPIC_API_KEY"]=_ak',
          '    _env["DISPLAY"]=":99"',
          '    subprocess.run(["claude","-p",f"OpenClaw gateway error: {http_err}. Fix the gateway on port 18789. Check config, restart if needed. Verify with curl -sf http://127.0.0.1:18789/health","--allowedTools","Read,Edit,Bash","--model","haiku"],capture_output=True,text=True,timeout=120,env=_env)',
          '    time.sleep(3)',
          '    # Retry after doctor fix',
          '    try:',
          '      req=urllib.request.Request("http://127.0.0.1:18789/v1/chat/completions",data=body,headers=headers)',
          '      resp=urllib.request.urlopen(req,timeout=240)',
          '      data=json.loads(resp.read())',
          '      text=data["choices"][0]["message"]["content"]',
          '      usage=data.get("usage",{})',
          '      print(json.dumps({"response":text,"input_tokens":usage.get("prompt_tokens",0),"output_tokens":usage.get("completion_tokens",0),"system_prompt_chars":0,"response_chars":len(text),"via":"http_after_doctor"}))',
          '      ok=True',
          '    except: pass',
        ].join('\n');

        const execRes = await fetch(`${ORGO_BASE}/computers/${vm.orgo_vm_id}/exec`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.ORGO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: pythonCode }),
          signal: AbortSignal.timeout(270000),
        });

        if (!execRes.ok) {
          throw new Error(`Orgo exec (${execRes.status})`);
        }

        const execData = await execRes.json();
        console.log(`[Chat] Exec: success=${execData.success}, len=${execData.output?.length || 0}, preview=${execData.output?.slice(0, 400)}`);
        if (!execData.success) {
          throw new Error(`Orgo exec failed: ${execData.output?.slice(0, 200)}`);
        }

        // Extract JSON even if exec output has extra text around it
        const rawOutput = execData.output?.trim() || '';
        const jsonStart = rawOutput.indexOf('{');
        const jsonEnd = rawOutput.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error(`No JSON in exec output: ${rawOutput.slice(0, 200)}`);
        }
        const vmData = JSON.parse(rawOutput.slice(jsonStart, jsonEnd + 1));

        if (vmData.error) {
          throw new Error(`Agent error: ${vmData.error.slice(0, 200)}`);
        }
        assistantResponse = vmData.response;
        if (!assistantResponse || typeof assistantResponse !== 'string') {
          throw new Error(`Invalid agent response: ${JSON.stringify(vmData).slice(0, 200)}`);
        }

        // Extract token usage (estimate from chars if provider returns 0)
        let inputTokens = vmData.input_tokens || 0;
        let outputTokens = vmData.output_tokens || 0;

        if (inputTokens === 0) {
          const systemChars = vmData.system_prompt_chars || 0;
          inputTokens = Math.ceil((systemChars + message.length) / CHARS_PER_TOKEN);
        }
        if (outputTokens === 0) {
          const responseChars = vmData.response_chars || assistantResponse.length;
          outputTokens = Math.ceil(responseChars / CHARS_PER_TOKEN);
        }

        // Calculate cost in dollars then convert to work hours
        const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION;
        const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;
        hoursUsed = (inputCost + outputCost) / DOLLARS_PER_HOUR;
        tokenUsage = { inputTokens, outputTokens, inputCost, outputCost };
      } catch (vmErr) {
        const errMsg = vmErr instanceof Error ? vmErr.message : String(vmErr);
        console.error('VM chat failed:', errMsg);
        const isTimeout = /time.?out/i.test(errMsg);
        return NextResponse.json({
          reply: null,
          conversation_id: activeConversationId,
          error: isTimeout ? 'task_timeout' : 'king_mouse_down',
          support_message: isTimeout
            ? 'That task is taking longer than expected. Try breaking it into smaller steps.'
            : 'King Mouse is temporarily unavailable. Please call (910) 515-8927 for immediate human support to get this back online for you ASAP.',
          support_phone: isTimeout ? undefined : '9105158927',
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

    // Log usage event with token details
    await supabase
      .from('usage_events')
      .insert({
        user_id: user.id,
        service: 'king_mouse_chat',
        description: `Chat message in conversation ${activeConversationId} (${tokenUsage.inputTokens} in / ${tokenUsage.outputTokens} out tokens)`,
        hours_used: hoursUsed,
      });

    // Deduct work hours
    await supabase
      .from('work_hours')
      .update({
        total_used: workHours.total_used + hoursUsed,
        remaining: workHours.remaining - hoursUsed,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // Infer if King Mouse is doing computer work (browser, desktop, search, file ops)
    const computerKeywords = ['search', 'brows', 'website', 'click', 'open', 'navigat', 'download', 'file', 'screen', 'desktop', 'type', 'url', 'google', 'research'];
    const lowerResponse = assistantResponse.toLowerCase();
    const lowerMessage = message.toLowerCase();
    const computerActive = computerKeywords.some((kw) => lowerResponse.includes(kw) || lowerMessage.includes(kw));

    // Generate task steps from the response (parse numbered steps or infer from content)
    const steps: Array<{ name: string; status: string }> = [];
    const stepMatches = assistantResponse.match(/(?:^|\n)\s*(?:\d+[\.\)]\s*|[-*]\s+)(.+)/g);
    if (stepMatches) {
      stepMatches.slice(0, 8).forEach((match, i) => {
        const name = match.replace(/^\s*(?:\d+[\.\)]\s*|[-*]\s+)/, '').trim();
        if (name.length > 5 && name.length < 200) {
          steps.push({ name, status: i === 0 ? 'in_progress' : 'pending' });
        }
      });
    }

    return NextResponse.json({
      reply: assistantResponse,
      conversation_id: activeConversationId,
      hours_used: hoursUsed,
      hours_remaining: workHours.remaining - hoursUsed,
      computer_active: computerActive,
      steps: steps.length > 0 ? steps : undefined,
    });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

