/**
 * POST /api/demo/chat
 * Landing page demo KingMouse. NOT connected to a VM.
 * Uses direct OpenAI API call with a sales-focused system prompt.
 */

import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are KingMouse, an AI employee demonstration. You're helping potential customers understand how KingMouse works. You are enthusiastic but not pushy.

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

Available Pros: Appliance Pro, Roofer Pro, Dentist Pro (more coming).

When asked about specific capabilities, give concrete examples.
When asked about pricing, be transparent.
When they seem interested, suggest they "Click Hire Now on any Pro above to get started."

Keep responses concise — 2-3 paragraphs max.`;

// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
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

    const { message, history, system_prompt } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    // Build messages array — allow system_prompt override for reseller context
    const messages = [
      { role: 'system', content: system_prompt || SYSTEM_PROMPT },
      ...(history || []).slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

    // Try OpenAI first, fall back to Moonshot
    const apiKey = process.env.OPENAI_API_KEY || process.env.MOONSHOT_API_KEY;
    const isOpenAI = !!process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback static response when no API key
      return NextResponse.json({
        response: "Hi! I'm KingMouse, your AI employee demo. I can help you understand how KingMouse works for your business. We handle everything from answering calls to managing inventory, scheduling, and more — starting at just $97/month. Click Hire Now on any Pro above to get started!",
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
        response: "I'm having a brief technical moment! KingMouse is an AI employee starting at $97/month that handles your business operations — calls, inventory, scheduling, emails, and more. Click Hire Now above to try it out!",
      });
    }

    const data = await res.json();
    const responseText = data.choices?.[0]?.message?.content || "I'd be happy to tell you more about KingMouse! What would you like to know?";

    return NextResponse.json({ response: responseText });
  } catch (err: unknown) {
    console.error('[DEMO_CHAT]', err instanceof Error ? err.message : err);
    return NextResponse.json({
      response: "Hi! I'm experiencing a brief hiccup, but I'm KingMouse — your AI employee starting at $97/month. I handle calls, inventory, scheduling, and more. Click Hire Now on any Pro above to get started!",
    });
  }
}
