export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkBalance, recordUsage, calculateAnthropicCost } from '@/lib/usage-tracker';
import { buildChatContext, storeMessage } from '@/lib/king-mouse-context';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';

export async function POST(request: NextRequest) {
  try {
    const { message, messages: legacyMessages, userRole, userId, customerId } = await request.json();

    // Support both new format (single message) and legacy (messages array)
    const userMessage = message || legacyMessages?.[legacyMessages.length - 1]?.content;
    if (!userMessage) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI backend not configured. Set ANTHROPIC_API_KEY.' }, { status: 500 });
    }

    const portal = (userRole === 'reseller' ? 'reseller' : userRole === 'admin' ? 'admin' : 'customer') as 'customer' | 'reseller' | 'admin';
    const effectiveUserId = userId || customerId || 'anonymous';

    // --- BILLING: Check balance before API call (customers only) ---
    const isCustomer = portal === 'customer' && (customerId || userId);
    const billingId = customerId || userId;
    if (isCustomer && billingId) {
      const estimatedCost = 0.01;
      const balanceCheck = await checkBalance(billingId, 'chat_sonnet', estimatedCost);
      if (!balanceCheck.hasBalance) {
        return NextResponse.json({
          reply: "Your work hours have run out. Purchase more hours to continue chatting with King Mouse.",
          hoursRemaining: 0,
          depleted: true,
        });
      }
    }

    // --- BUILD CONTEXT: Load user data + conversation history ---
    const { systemPrompt, conversationHistory } = await buildChatContext(effectiveUserId, portal);

    // Store the user message
    await storeMessage(effectiveUserId, 'user', userMessage, portal);

    // Build messages array: history + new message
    const anthropicMessages = [
      ...conversationHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    // If legacy format sent full history but we already loaded from DB, use new message only
    // (conversationHistory from DB is the source of truth)
    const model = 'claude-sonnet-4-20250514';

    const response = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
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

    // Store the assistant reply
    await storeMessage(effectiveUserId, 'assistant', reply, portal);

    // --- BILLING: Record actual cost and deduct hours ---
    let usageInfo: { workHoursCharged?: number; newBalance?: number } = {};
    if (isCustomer && billingId) {
      const inputTokens = data.usage?.input_tokens || 0;
      const outputTokens = data.usage?.output_tokens || 0;
      const { vendorCost, eventType } = calculateAnthropicCost(model, inputTokens, outputTokens);

      const usageResult = await recordUsage(billingId, eventType, vendorCost, {
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        message_preview: userMessage.substring(0, 100),
      });

      if (usageResult.success) {
        usageInfo = {
          workHoursCharged: usageResult.workHoursCharged,
          newBalance: usageResult.newBalance,
        };
      }
    }

    return NextResponse.json({
      reply,
      ...usageInfo,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
