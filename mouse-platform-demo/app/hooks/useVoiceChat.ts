'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type VoiceMode = 'text' | 'voice';
export type VoiceGender = 'male' | 'female';
export type VoiceTone = 'professional' | 'friendly' | 'energetic' | 'calm';
export type InputMode = 'push-to-talk' | 'auto-detect';

export interface VoiceSettings {
  enabled: boolean;
  gender: VoiceGender;
  tone: VoiceTone;
  speed: number;
  autoReply: boolean;
  inputMode: InputMode;
  voiceId?: string;
}

export interface VoiceConversationState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  audioLevel: number;
  conversationMode: VoiceMode;
  isMuted: boolean;
  voiceMinutesUsed: number;
  currentSessionSeconds: number;
  speakingState: 'idle' | 'king-speaking' | 'user-speaking';
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: false,
  gender: 'male',
  tone: 'professional',
  speed: 1.0,
  autoReply: true,
  inputMode: 'auto-detect',
};

const VOICE_IDS: Record<VoiceGender, Record<VoiceTone, string>> = {
  male: {
    professional: 'pNInz6obpgDQGcFmaJgB',
    friendly: 'bVMeCyTHy58xNoL34h3p',
    energetic: 'cgSgspJ2msm6clMCkdW9',
    calm: 'iP95p4xoKVk53GoZ742B',
  },
  female: {
    professional: 'Xb7hH8MSUJpSbSDYk0k2',
    friendly: '21m00Tcm4TlvDq8ikWAM',
    energetic: 'MF3mGyEYCl7XYWbV9V6O',
    calm: 'XB0fDUnXU5powFXDhCwa',
  },
};

export function useVoiceChat(onTranscriptComplete?: (transcript: string) => void) {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [state, setState] = useState<VoiceConversationState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    transcript: '',
    interimTranscript: '',
    audioLevel: 0,
    conversationMode: 'text',
    isMuted: false,
    voiceMinutesUsed: 0,
    currentSessionSeconds: 0,
    speakingState: 'idle',
  });

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalTranscript) {
            setState(prev => ({ ...prev, transcript: prev.transcript + finalTranscript }));
          }
          if (interimTranscript) {
            setState(prev => ({ ...prev, interimTranscript }));
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'aborted' && event.error !== 'no-speech') {
            console.error('Speech recognition error:', event.error);
          }
        };

        recognitionRef.current.onend = () => {
          setState(prev => ({ ...prev, isListening: false, audioLevel: 0 }));
          const fullTranscript = state.transcript + state.interimTranscript;
          if (fullTranscript.trim() && onTranscriptComplete) {
            onTranscriptComplete(fullTranscript.trim());
            setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
          }
        };
      }
    }

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (state.isSpeaking || state.isListening) {
      sessionTimerRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          currentSessionSeconds: prev.currentSessionSeconds + 1,
          voiceMinutesUsed: prev.voiceMinutesUsed + (1/60),
        }));
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
      setState(prev => ({ ...prev, currentSessionSeconds: 0 }));
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [state.isSpeaking, state.isListening]);

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
  }, []);

  const visualizeAudio = useCallback(() => {
    if (!analyserRef.current) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      setState(prev => ({ ...prev, audioLevel: average }));

      if (state.isListening) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
    };

    updateLevel();
  }, [state.isListening]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not supported');
      return false;
    }

    if (state.isSpeaking) {
      stopSpeaking();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      if (currentAudioSourceRef.current) {
        currentAudioSourceRef.current.disconnect();
      }

      currentAudioSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      if (analyserRef.current) {
        currentAudioSourceRef.current.connect(analyserRef.current);
      }

      setState(prev => ({
        ...prev,
        isListening: true,
        transcript: '',
        interimTranscript: '',
        speakingState: 'user-speaking',
      }));

      recognitionRef.current.start();
      visualizeAudio();

      return true;
    } catch (err) {
      console.error('Microphone access error:', err);
      return false;
    }
  }, [state.isSpeaking, visualizeAudio]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.disconnect();
      currentAudioSourceRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isListening: false,
      audioLevel: 0,
      interimTranscript: '',
      speakingState: 'idle',
    }));
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const startPushToTalk = useCallback(async () => {
    await startListening();
  }, [startListening]);

  const endPushToTalk = useCallback(() => {
    stopListening();
  }, [stopListening]);

  const speak = useCallback(async (text: string, onComplete?: () => void) => {
    if (state.isMuted || !settings.enabled) {
      onComplete?.();
      return;
    }

    stopSpeaking();

    setState(prev => ({ ...prev, isSpeaking: true, isProcessing: true, speakingState: 'king-speaking' }));

    try {
      const voiceId = VOICE_IDS[settings.gender][settings.tone];
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

      if (!apiKey) {
        console.error('ElevenLabs API key not configured');
        setState(prev => ({ ...prev, isSpeaking: false, isProcessing: false }));
        onComplete?.();
        return;
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_v3',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
            speed: settings.speed,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setState(prev => ({ ...prev, isSpeaking: false, speakingState: 'idle' }));
        onComplete?.();

        // Auto-reply: Start listening after King finishes speaking
        if (settings.autoReply && !state.isMuted) {
          setTimeout(() => {
            startListening();
          }, 800);
        }
      };

      audioRef.current.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setState(prev => ({ ...prev, isSpeaking: false, speakingState: 'idle' }));
        onComplete?.();
      };

      setState(prev => ({ ...prev, isProcessing: false }));
      await audioRef.current.play();

    } catch (error) {
      console.error('TTS error:', error);
      setState(prev => ({ ...prev, isSpeaking: false, isProcessing: false, speakingState: 'idle' }));
      onComplete?.();
    }
  }, [settings, state.isMuted, state.conversationMode, startListening]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setState(prev => ({ ...prev, isSpeaking: false, isProcessing: false, speakingState: 'idle' }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    if (!state.isMuted) {
      stopSpeaking();
    }
  }, [state.isMuted, stopSpeaking]);

  const setConversationMode = useCallback((mode: VoiceMode) => {
    setState(prev => ({ ...prev, conversationMode: mode }));
    if (mode === 'voice') {
      setSettings(prev => ({ ...prev, enabled: true }));
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetVoiceMinutes = useCallback(() => {
    setState(prev => ({ ...prev, voiceMinutesUsed: 0 }));
  }, []);

  return {
    ...state,
    settings,
    startListening,
    stopListening,
    toggleListening,
    startPushToTalk,
    endPushToTalk,
    speak,
    stopSpeaking,
    toggleMute,
    setConversationMode,
    updateSettings,
    resetVoiceMinutes,
    isVoiceSupported: !!recognitionRef.current,
    voiceCostMultiplier: 2,
    estimatedVoiceCost: (state.voiceMinutesUsed / 60) * 2,
    speakingState: state.speakingState,
  };
}

export default useVoiceChat;
