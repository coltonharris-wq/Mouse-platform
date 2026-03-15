import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

const HOURS_PER_MINUTE = 0.01;

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
    const { text, voice_id } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    const selectedVoiceId = voice_id || 'EXAVITQu4vr4xnSDxMaL'; // Default ElevenLabs voice

    // Call ElevenLabs API
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('ElevenLabs API error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to generate speech' },
        { status: 502 }
      );
    }

    // Estimate duration based on text length (approx 150 words per minute, 5 chars per word)
    const estimatedMinutes = Math.max(text.length / 750, 0.1);
    const hoursUsed = estimatedMinutes * HOURS_PER_MINUTE;

    // Log usage
    await supabase
      .from('usage_events')
      .insert({
        user_id: user.id,
        service: 'receptionist_tts',
        description: `TTS generation: ${text.slice(0, 100)}...`,
        hours_used: hoursUsed,
      });

    // Deduct work hours
    const { data: workHours } = await supabase
      .from('work_hours')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (workHours) {
      await supabase
        .from('work_hours')
        .update({
          total_used: workHours.total_used + hoursUsed,
          remaining: workHours.remaining - hoursUsed,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }

    // Stream audio response
    const audioBody = elevenLabsResponse.body;
    if (!audioBody) {
      return NextResponse.json(
        { success: false, error: 'No audio data received' },
        { status: 502 }
      );
    }

    return new NextResponse(audioBody, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'X-Hours-Used': hoursUsed.toFixed(4),
      },
    });
  } catch (err) {
    console.error('Voice TTS error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
