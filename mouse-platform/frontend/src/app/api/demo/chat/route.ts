/**
 * POST /api/demo/chat
 * Pre-auth demo chat with King Mouse. NOT connected to a VM.
 * Supports niche-specific prompts from pro_templates table.
 * Tracks message count for signup prompt trigger.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

const GENERIC_SYSTEM_PROMPT = `You are KingMouse, an AI employee demonstration. You're helping potential customers understand how KingMouse works. You are enthusiastic but not pushy.

KingMouse is an AI employee that runs your business operations. It can:
- Answer calls and handle customer inquiries (AI Receptionist)
- Manage inventory and reorder supplies
- Schedule appointments
- Send emails and follow-ups
- Research competitors and market prices
- Generate documents, invoices, and reports
- Track leads and nurture prospects
- Handle admin tasks

Pricing: Starting at $97/month (Pro plan, 20 hours). $4.98/hr.
That's vs $35/hr for a human employee.

First 2 hours free to try.

When asked about specific capabilities, give concrete examples.
When asked about pricing, be transparent.
Keep responses concise — 2-3 paragraphs max.`;

// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + 3600000 });
    return true;
  }

  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in an hour.' },
        { status: 429 }
      );
    }

    const { message, history, system_prompt, industry, niche, session_token } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    // Determine system prompt — niche-specific from pro_templates, or generic
    let activePrompt = system_prompt || GENERIC_SYSTEM_PROMPT;

    if (industry && niche && !system_prompt) {
      try {
        const templates = await supabaseQuery(
          'pro_templates',
          'GET',
          undefined,
          `industry=eq.${encodeURIComponent(industry)}&niche=eq.${encodeURIComponent(niche)}&active=eq.true&select=demo_prompt&limit=1`
        );
        if (templates && templates.length > 0 && templates[0].demo_prompt) {
          activePrompt = templates[0].demo_prompt;
        }
      } catch (err) {
        console.error('[DEMO_CHAT] Template lookup failed:', err);
        // Fall through to generic prompt
      }
    }

    // Track message count in demo_sessions
    let messageCount = (history?.length || 0) + 1; // +1 for current user message

    if (session_token && industry && niche) {
      try {
        // Check if session exists
        const sessions = await supabaseQuery(
          'demo_sessions',
          'GET',
          undefined,
          `session_token=eq.${encodeURIComponent(session_token)}&select=id,message_count`
        );

        if (sessions && sessions.length > 0) {
          // Update existing session
          const session = sessions[0];
          messageCount = session.message_count + 1;
          await supabaseQuery(
            'demo_sessions',
            'PATCH',
            {
              message_count: messageCount,
              messages: [...(history || []), { role: 'user', content: message }],
              last_message_at: new Date().toISOString(),
            },
            `id=eq.${session.id}`
          );
        } else {
          // Create new session
          messageCount = 1;
          await supabaseQuery(
            'demo_sessions',
            'POST',
            {
              session_token,
              industry,
              niche,
              messages: [{ role: 'user', content: message }],
              message_count: 1,
              ip_address: ip === 'unknown' ? null : ip,
            }
          );
        }
      } catch (err) {
        console.error('[DEMO_CHAT] Session tracking failed:', err);
        // Non-fatal — continue with chat
      }
    }

    // Build messages array
    const messages = [
      { role: 'system', content: activePrompt },
      ...(history || []).slice(-10),
      { role: 'user', content: message },
    ];

    // Try OpenAI first, fall back to Moonshot
    const apiKey = process.env.OPENAI_API_KEY || process.env.MOONSHOT_API_KEY;
    const isOpenAI = !!process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        response: "Hi! I'm KingMouse, your AI operations manager. I'd love to show you what I can do for your business. To get the full experience, let's get you set up!",
        messageCount,
        promptSignup: messageCount >= 4,
      });
    }

    const apiUrl = isOpenAI
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.moonshot.cn/v1/chat/completions';

    const model = isOpenAI ? 'gpt-4o-mini' : 'kimi-k2.5';

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.error('[DEMO_CHAT] API error:', res.status, await res.text());
      return NextResponse.json({
        response: "I'm having a brief technical moment! I'm KingMouse, your AI operations manager. I handle calls, inventory, scheduling, emails, and more. Let's get you set up to see me in action!",
        messageCount,
        promptSignup: messageCount >= 4,
      });
    }

    const data = await res.json();
    const responseText = data.choices?.[0]?.message?.content || "I'd be happy to tell you more! What would you like to know about how I can help your business?";

    // Update session with assistant response
    if (session_token && industry && niche) {
      try {
        const sessions = await supabaseQuery(
          'demo_sessions',
          'GET',
          undefined,
          `session_token=eq.${encodeURIComponent(session_token)}&select=id,messages`
        );
        if (sessions && sessions.length > 0) {
          const updatedMessages = [
            ...(sessions[0].messages || []),
            { role: 'assistant', content: responseText },
          ];
          await supabaseQuery(
            'demo_sessions',
            'PATCH',
            { messages: updatedMessages },
            `id=eq.${sessions[0].id}`
          );
        }
      } catch {
        // Non-fatal
      }
    }

    return NextResponse.json({
      response: responseText,
      messageCount,
      promptSignup: messageCount >= 4,
    });
  } catch (err: unknown) {
    console.error('[DEMO_CHAT]', err instanceof Error ? err.message : err);
    return NextResponse.json({
      response: "Hi! I'm KingMouse — your AI operations manager. I handle calls, inventory, scheduling, and more. Let me show you what I can do!",
      messageCount: 0,
      promptSignup: false,
    });
  }
}
