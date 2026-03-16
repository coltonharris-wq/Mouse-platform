/**
 * AI prompt builder + response parser for the King Mouse receptionist.
 * Uses OpenAI-compatible chat completions API.
 */

interface ReceptionistContext {
  businessName: string;
  greeting: string;
  voiceId: string;
  industry?: string;
}

interface ConversationTurn {
  role: 'caller' | 'receptionist';
  text: string;
}

export interface AIResponse {
  response_text: string;
  action?: 'book_appointment' | 'take_message' | 'answer_question' | 'end_call';
  action_data?: {
    caller_name?: string;
    caller_phone?: string;
    preferred_date?: string;
    preferred_time?: string;
    service_requested?: string;
    message?: string;
    urgency?: 'normal' | 'urgent';
    notes?: string;
  };
}

/**
 * Build the system prompt for the receptionist persona.
 */
export function buildSystemPrompt(ctx: ReceptionistContext): string {
  return `You are King Mouse, an AI receptionist for ${ctx.businessName}. You answer phone calls professionally, warmly, and helpfully.

BUSINESS: ${ctx.businessName}
GREETING STYLE: ${ctx.greeting}

YOUR CAPABILITIES:
1. **book_appointment** — Schedule appointments. Ask for: name, preferred date/time, service needed.
2. **take_message** — Take messages for the business owner. Ask for: name, callback number, message.
3. **answer_question** — Answer common questions about the business (hours, services, location).
4. **end_call** — End the call politely when the caller is done.

RULES:
- Be conversational and natural, like a real receptionist
- Keep responses SHORT (1-3 sentences max) — this is a phone call, not an essay
- If the caller wants to book, gather details one at a time naturally
- If you can't help, offer to take a message
- Always be polite and professional
- Never mention you are AI unless directly asked
- If asked about specific pricing or details you don't know, offer to take a message and have someone call back

RESPONSE FORMAT — You MUST respond with valid JSON only:
{
  "response_text": "What you say to the caller",
  "action": "book_appointment | take_message | answer_question | end_call" (optional),
  "action_data": { ... } (optional, include when action has collected enough info)
}

For book_appointment action_data: { "caller_name", "caller_phone", "preferred_date", "preferred_time", "service_requested", "notes" }
For take_message action_data: { "caller_name", "caller_phone", "message", "urgency" }

Only include "action" and "action_data" when you have enough information to complete the action. Keep gathering info conversationally until you have what you need.`;
}

/**
 * Call the AI API (OpenAI or Moonshot compatible) with the receptionist prompt.
 */
export async function getAIResponse(
  systemPrompt: string,
  history: ConversationTurn[],
  callerSpeech: string
): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.MOONSHOT_API_KEY;
  const isOpenAI = !!process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      response_text: "Thank you for calling. I'll make sure someone gets back to you. Is there anything else I can help with?",
    };
  }

  const apiUrl = isOpenAI
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://api.moonshot.cn/v1/chat/completions';
  const model = isOpenAI ? 'gpt-4o-mini' : 'kimi-k2.5';

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((t) => ({
      role: t.role === 'caller' ? 'user' : ('assistant' as string),
      content: t.role === 'caller' ? t.text : JSON.stringify({ response_text: t.text }),
    })),
    { role: 'user', content: callerSpeech },
  ];

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 300,
      temperature: 0.7,
      response_format: isOpenAI ? { type: 'json_object' } : undefined,
    }),
  });

  if (!res.ok) {
    console.error('[RECEPTIONIST_AI] API error:', res.status);
    return {
      response_text: "I'm sorry, I'm having a brief moment. Could you repeat that?",
    };
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  return parseAIResponse(raw);
}

/**
 * Parse AI response — extract JSON from potentially messy output.
 */
export function parseAIResponse(raw: string): AIResponse {
  try {
    // Try direct JSON parse
    const parsed = JSON.parse(raw);
    return {
      response_text: parsed.response_text || parsed.text || 'Thank you, how can I help?',
      action: parsed.action,
      action_data: parsed.action_data,
    };
  } catch {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          response_text: parsed.response_text || parsed.text || raw,
          action: parsed.action,
          action_data: parsed.action_data,
        };
      } catch {
        // Fall through
      }
    }
    // Last resort — use raw text as response
    return {
      response_text: raw.replace(/[{}"]/g, '').trim().substring(0, 300) || 'How can I help you?',
    };
  }
}

/**
 * Compress conversation history to fit in URL query params (~600 chars).
 * Keeps last 3 turns, truncates long messages.
 */
export function compressHistory(turns: ConversationTurn[]): string {
  const recent = turns.slice(-3);
  const compressed = recent.map((t) => ({
    r: t.role === 'caller' ? 'c' : 'r',
    t: t.text.substring(0, 150),
  }));
  return Buffer.from(JSON.stringify(compressed)).toString('base64url');
}

/**
 * Decompress history from URL query param.
 */
export function decompressHistory(encoded: string): ConversationTurn[] {
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    return parsed.map((t: { r: string; t: string }) => ({
      role: t.r === 'c' ? 'caller' : 'receptionist',
      text: t.t,
    }));
  } catch {
    return [];
  }
}
