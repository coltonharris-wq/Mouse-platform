'use client';

import { useEffect, useRef, useState } from 'react';

interface VoiceWaveformProps {
  isActive: boolean;
  audioLevel: number;
  isUserSpeaking?: boolean;
  barCount?: number;
  height?: number;
}

export default function VoiceWaveform({
  isActive,
  audioLevel,
  isUserSpeaking = true,
  barCount = 30,
  height = 60,
}: VoiceWaveformProps) {
  const animationRef = useRef<number | null>(null);
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(0.1));

  useEffect(() => {
    if (!isActive) {
      const idleAnimate = () => {
        setBars(prev => prev.map((_, i) => {
          const time = Date.now() / 1000;
          return 0.1 + Math.sin(time * 2 + i * 0.3) * 0.05;
        }));
        animationRef.current = requestAnimationFrame(idleAnimate);
      };
      animationRef.current = requestAnimationFrame(idleAnimate);
    } else {
      const activeAnimate = () => {
        setBars(prev => prev.map((_, i) => {
          const normalizedLevel = audioLevel / 255;
          const noise = Math.random() * 0.3;
          const wave = Math.sin(Date.now() / 100 + i * 0.5) * 0.2;
          const level = Math.max(0.1, Math.min(1, normalizedLevel * 0.8 + noise * 0.3 + wave * 0.2));
          return level;
        }));
        animationRef.current = requestAnimationFrame(activeAnimate);
      };
      animationRef.current = requestAnimationFrame(activeAnimate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, audioLevel, barCount]);

  const primaryColor = isUserSpeaking ? 'bg-blue-500' : 'bg-purple-500';
  const secondaryColor = isUserSpeaking ? 'bg-blue-400' : 'bg-purple-400';
  const glowColor = isUserSpeaking ? 'shadow-blue-500/50' : 'shadow-purple-500/50';

  return (
    <div 
      className="relative w-full flex items-center justify-center gap-1 overflow-hidden rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 p-4"
      style={{ height: height + 32 }}
    >
      {isActive && (
        <div className={`absolute inset-0 ${isUserSpeaking ? 'bg-blue-50' : 'bg-purple-50'} animate-pulse opacity-50`} />
      )}

      <div className="relative z-10 flex items-center justify-center gap-[2px] w-full">
        {bars.map((bar, i) => {
          const barHeight = Math.max(4, bar * (height - 10));
          const isCenter = i >= barCount * 0.4 && i <= barCount * 0.6;
          
          return (
            <div
              key={i}
              className={`
                w-1.5 rounded-full transition-all duration-75
                ${isCenter ? primaryColor : secondaryColor}
                ${bar > 0.5 ? `shadow-lg ${glowColor}` : ''}
              `}
              style={{
                height: `${barHeight}px`,
                opacity: isActive ? 0.8 + bar * 0.2 : 0.4,
                transform: `scaleY(${isActive ? 1 : 0.8})`,
              }}
            />
          );
        })}
      </div>

      <div className="absolute bottom-2 left-0 right-0 text-center">
        <p className={`text-xs font-medium ${isUserSpeaking ? 'text-blue-600' : 'text-purple-600'}`}>
          {isActive 
            ? (isUserSpeaking ? 'Listening...' : 'King is speaking...')
            : (isUserSpeaking ? 'Ready to listen' : 'Ready to speak')
          }
        </p>
      </div>
    </div>
  );
}

export function CompactVoiceWaveform({
  isActive,
  audioLevel,
  barCount = 5,
}: Omit<VoiceWaveformProps, 'height' | 'isUserSpeaking'>) {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(0.3));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(barCount).fill(0.3));
      return;
    }

    const animate = () => {
      setBars(prev => prev.map(() => {
        const normalizedLevel = audioLevel / 255;
        return Math.max(0.2, Math.min(1, normalizedLevel * 0.8 + Math.random() * 0.3));
      }));
    };

    const interval = setInterval(animate, 100);
    return () => clearInterval(interval);
  }, [isActive, audioLevel, barCount]);

  return (
    <div className="flex items-end gap-[2px] h-4">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-1 bg-current rounded-full transition-all duration-100"
          style={{
            height: `${Math.max(4, bar * 16)}px`,
            opacity: 0.6 + bar * 0.4,
          }}
        />
      ))}
    </div>
  );
}
