export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkBalance, recordUsage, calculateAnthropicCost } from '@/lib/usage-tracker';
import { buildChatContext, storeMessage } from '@/lib/king-mouse-context';
import type { UsageEventType } from '@/lib/usage-tracker';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';
const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY || '';
const MOONSHOT_BASE_URL = 'https://api.moonshot.cn/v1';

// --- MODEL ROUTING ---
// Admin (Colton) → Anthropic Opus (full power, no billing)
// Customers & Resellers → Moonshot Kimi K2.5 (cheap, 30x margin)
function getModelConfig(portal: 'customer' | 'reseller' | 'admin') {
  if (portal === 'admin') {
    return {
      provider: 'anthropic' as const,
      model: 'claude-opus-4-6',
      apiKey: ANTHROPIC_API_KEY,
      baseUrl: ANTHROPIC_BASE_URL,
      eventType: 'chat_opus' as UsageEventType,
    };
  }
  // Customers and resellers use Kimi K2.5
  return {
    provider: 'moonshot' as const,
    model: 'kimi-k2-0711',
    apiKey: MOONSHOT_API_KEY,
    baseUrl: MOONSHOT_BASE_URL,
    eventType: 'chat_kimi' as UsageEventType,
  };
}

// Calculate Kimi vendor cost from token usage
function calculateKimiCost(inputTokens: number, outputTokens: number): number {
  // Kimi K2.5 pricing: ~$0.55/1M input, ~$2.19/1M output (approximate)
  const inputCost = (inputTokens * 0.55) / 1_000_000;
  const outputCost = (outputTokens * 2.19) / 1_000_000;
  return inputCost + outputCost;
}

export async function POST(request: NextRequest) {
  try {
    const { message, messages: legacyMessages, userRole, userId, customerId } = await request.json();

    // Support both new format (single message) and legacy (messages array)
    const userMessage = message || legacyMessages?.[legacyMessages.length - 1]?.content;
    if (!userMessage) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const portal = (userRole === 'reseller' ? 'reseller' : userRole === 'admin' ? 'admin' : 'customer') as 'customer' | 'reseller' | 'admin';
    const modelConfig = getModelConfig(portal);

    if (!modelConfig.apiKey) {
      const provider = modelConfig.provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'MOONSHOT_API_KEY';
      return NextResponse.json({ error: `AI backend not configured. Set ${provider}.` }, { status: 500 });
    }

    const effectiveUserId = userId || customerId || 'anonymous';

    // --- BILLING: Check balance before API call (customers only) ---
    const isCustomer = portal === 'customer' && (customerId || userId);
    const billingId = customerId || userId;
    if (isCustomer && billingId) {
      const estimatedCost = 0.001; // Kimi is cheap — lower estimate
      const balanceCheck = await checkBalance(billingId, modelConfig.eventType, estimatedCost);
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
    const chatMessages = [
      ...conversationHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    let response: Response;
    if (modelConfig.provider === 'anthropic') {
      // --- ANTHROPIC (Admin only) ---
      response = await fetch(`${modelConfig.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': modelConfig.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelConfig.model,
          system: systemPrompt,
          messages: chatMessages,
          max_tokens: 4096,
        }),
      });
    } else {
      // --- MOONSHOT KIMI (Customers & Resellers) ---
      // Kimi uses OpenAI-compatible API format
      response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${modelConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatMessages,
          ],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`${modelConfig.provider} error:`, response.status, errText);
      return NextResponse.json({ error: `AI error: ${response.status}` }, { status: 502 });
    }

    const data = await response.json();

    // Parse reply based on provider format
    let reply: string;
    let inputTokens: number;
    let outputTokens: number;

    if (modelConfig.provider === 'anthropic') {
      reply = data.content?.[0]?.text || 'No response generated.';
      inputTokens = data.usage?.input_tokens || 0;
      outputTokens = data.usage?.output_tokens || 0;
    } else {
      // OpenAI-compatible format (Kimi)
      reply = data.choices?.[0]?.message?.content || 'No response generated.';
      inputTokens = data.usage?.prompt_tokens || 0;
      outputTokens = data.usage?.completion_tokens || 0;
    }

    // Store the assistant reply
    await storeMessage(effectiveUserId, 'assistant', reply, portal);

    // --- BILLING: Record actual cost and deduct hours ---
    let usageInfo: { workHoursCharged?: number; newBalance?: number } = {};
    if (isCustomer && billingId) {
      let vendorCost: number;
      let eventType: UsageEventType;

      if (modelConfig.provider === 'anthropic') {
        const calc = calculateAnthropicCost(modelConfig.model, inputTokens, outputTokens);
        vendorCost = calc.vendorCost;
        eventType = calc.eventType;
      } else {
        vendorCost = calculateKimiCost(inputTokens, outputTokens);
        eventType = 'chat_kimi';
      }

      const usageResult = await recordUsage(billingId, eventType, vendorCost, {
        model: modelConfig.model,
        provider: modelConfig.provider,
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
