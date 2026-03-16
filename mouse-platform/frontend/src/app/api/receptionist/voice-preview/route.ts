/**
 * POST /api/receptionist/voice-preview
 * Generate a short audio sample for voice preview.
 * Returns audio/mpeg blob or error.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech, DEFAULT_VOICE_ID } from '@/lib/elevenlabs';
import { checkBalance, deductHours, BILLING_RATES } from '@/lib/billing';

export async function POST(request: NextRequest) {
  try {
    const { voice_id, text, customer_id } = await request.json();

    // ── HOUR ENFORCEMENT — prevent voice preview spam ──
    if (customer_id) {
      const balanceError = await checkBalance(customer_id, BILLING_RATES.VOICE_PREVIEW);
      if (balanceError) {
        return NextResponse.json(
          { error: 'Insufficient hours for voice preview.' },
          { status: 402 }
        );
      }
    }

    const sampleText = text || 'Hello! Thank you for calling. How can I help you today?';
    const audioBuffer = await generateSpeech(sampleText, voice_id || DEFAULT_VOICE_ID);

    if (!audioBuffer) {
      return NextResponse.json(
        { error: 'Voice preview unavailable. Please add ELEVENLABS_API_KEY to your environment.' },
        { status: 503 }
      );
    }

    // ── DEDUCT tiny amount for preview ──
    if (customer_id) {
      try {
        await deductHours(customer_id, BILLING_RATES.VOICE_PREVIEW, 'voice_preview', 'Voice preview');
      } catch {
        // Non-fatal
      }
    }

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.length),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VOICE_PREVIEW]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
