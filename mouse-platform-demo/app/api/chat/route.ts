export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';

function getSystemPrompt(userRole: string = 'admin') {
  const base = `You are King Mouse — the AI orchestrator for Automio's Mouse Platform.

Personality: Direct, confident, resourceful. You're not a chatbot — you're the platform's AI brain.

Context:
- Mouse Platform = AI Workforce-as-a-Service
- Pricing: Starter $97/20hrs, Growth $297/70hrs, Pro $497/125hrs
- FOUNDERS100 promo code: 100% off first month
- 30 AI employees across 10 categories
- Support: (877) 934-0395

Keep responses concise and actionable. No filler.`;

  if (userRole === 'admin') {
    return base + `\n\nYou are speaking to the platform admin/CEO. You can discuss revenue, costs, strategy, and technical operations.`;
  } else if (userRole === 'reseller') {
    return base + `\n\nYou are speaking to a reseller partner. Help them with sales strategies, lead research, campaign ideas, and managing their referred customers. 40% commission on all referrals.`;
  } else {
    return base + `\n\nYou are speaking to a customer. Help them manage their AI employees, check status, give deployment commands, and answer questions about their plan and usage.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, userRole, userId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI backend not configured. Set ANTHROPIC_API_KEY.' }, { status: 500 });
    }

    const anthropicMessages = messages.map((m: any) => ({
      role: m.role === 'system' ? 'user' : m.role,
      content: m.content,
    }));

    const response = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        system: getSystemPrompt(userRole || 'admin'),
        messages: anthropicMessages,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic error:', response.status, errText);
      return NextResponse.json({ error: `AI error: ${response.status}` }, { status: 502 });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'No response generated.';

    // Store chat in Supabase if userId provided
    if (userId) {
      const supabase = getSupabaseServer();
      if (supabase) {
        try {
          const lastUserMsg = messages[messages.length - 1];
          await supabase.from('chat_logs').insert([
            { user_id: userId, role: 'user', content: lastUserMsg?.content || '', portal: userRole || 'admin' },
            { user_id: userId, role: 'assistant', content: reply, portal: userRole || 'admin' },
          ]);
        } catch (e) {
          // Don't fail the response if logging fails
        }
      }
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
