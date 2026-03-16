/**
 * ElevenLabs TTS + Supabase Storage upload for receptionist audio.
 * Falls back to null if ELEVENLABS_API_KEY is not set.
 */

const ELEVENLABS_API = 'https://api.elevenlabs.io/v1';

export const VOICE_OPTIONS = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', desc: 'Professional & warm, great for customer service', badge: 'Recommended' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', desc: 'Energetic & upbeat, perfect for retail', badge: null },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', desc: 'Southern charm, friendly and approachable', badge: null },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', desc: 'Clear & articulate, ideal for professional services', badge: null },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', desc: 'Casual & relaxed, great for laid-back brands', badge: null },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', desc: 'Deep & authoritative, perfect for formal businesses', badge: null },
] as const;

export const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

/**
 * Generate speech audio from text via ElevenLabs.
 * Returns MP3 buffer or null if API key is missing.
 */
export async function generateSpeech(text: string, voiceId: string): Promise<Buffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(`${ELEVENLABS_API}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!res.ok) {
    console.error('[ELEVENLABS] TTS failed:', res.status, await res.text());
    return null;
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Upload audio buffer to Supabase Storage and return the public URL.
 * Bucket: receptionist-audio (must be created as public in Supabase dashboard).
 */
export async function uploadAudioToStorage(audio: Buffer, filename: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const bucket = 'receptionist-audio';
  const path = `calls/${filename}`;

  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'audio/mpeg',
      'x-upsert': 'true',
    },
    body: audio,
  });

  if (!res.ok) {
    console.error('[STORAGE] Upload failed:', res.status, await res.text());
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Generate speech and upload to storage. Returns public URL or null.
 */
export async function textToSpeechUrl(text: string, voiceId: string): Promise<string | null> {
  const audio = await generateSpeech(text, voiceId);
  if (!audio) return null;

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
  return uploadAudioToStorage(audio, filename);
}
