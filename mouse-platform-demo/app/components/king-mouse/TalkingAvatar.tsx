'use client';

import { useEffect, useState, useRef } from 'react';

interface TalkingAvatarProps {
  isSpeaking: boolean;
  isListening?: boolean;
  audioLevel?: number;
  size?: 'small' | 'normal' | 'large';
  showCrown?: boolean;
}

export default function TalkingAvatar({
  isSpeaking,
  isListening = false,
  audioLevel = 0,
  size = 'normal',
  showCrown = true,
}: TalkingAvatarProps) {
  const [mouthOpenness, setMouthOpenness] = useState(0.3);
  const [eyeBlink, setEyeBlink] = useState(false);
  const animationRef = useRef<number | null>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sizeClasses = {
    small: 'w-10 h-10',
    normal: 'w-14 h-14',
    large: 'w-20 h-20',
  };

  useEffect(() => {
    if (isSpeaking) {
      const animateMouth = () => {
        const baseOpenness = 0.3;
        const variation = Math.sin(Date.now() / 100) * 0.3 + (audioLevel / 255) * 0.4;
        const randomJitter = (Math.random() - 0.5) * 0.2;
        const newOpenness = Math.max(0.1, Math.min(0.9, baseOpenness + variation + randomJitter));
        setMouthOpenness(newOpenness);
        animationRef.current = requestAnimationFrame(animateMouth);
      };
      animationRef.current = requestAnimationFrame(animateMouth);
    } else {
      const breathe = () => {
        const openness = 0.3 + Math.sin(Date.now() / 2000) * 0.05;
        setMouthOpenness(openness);
        animationRef.current = requestAnimationFrame(breathe);
      };
      animationRef.current = requestAnimationFrame(breathe);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpeaking, audioLevel]);

  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      blinkTimeoutRef.current = setTimeout(() => {
        setEyeBlink(true);
        setTimeout(() => setEyeBlink(false), 150);
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();

    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, []);

  const getMouthPath = () => {
    const openAmount = mouthOpenness;
    const yControl = 58 + openAmount * 20;
    const yEnd = 58 + openAmount * 12;
    return `M38 ${yControl - 5} Q50 ${yControl} 62 ${yControl - 5}`;
  };

  const eyeScaleY = eyeBlink ? 0.1 : 1;

  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg`}>
      {(isSpeaking || isListening) && (
        <>
          <div className="absolute inset-0 bg-white/20 animate-ping rounded-full" style={{ animationDuration: '2s' }} />
          <div className={`absolute -inset-2 rounded-full ${isSpeaking ? 'bg-blue-400/30' : 'bg-green-400/30'} animate-pulse`} />
        </>
      )}

      <div className={`relative z-10 ${isSpeaking ? 'animate-bounce' : ''}`} style={{ animationDuration: '3s' }}>
        <svg 
          viewBox="0 0 100 100" 
          className={sizeClasses[size]} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E3A5F" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <circle cx="50" cy="50" r="50" fill="url(#avatarGrad)" />
          <path d="M10 85 Q50 65 90 85 L90 100 L10 100 Z" fill="url(#suitGrad)" />
          <path d="M35 75 L50 85 L65 75 L65 82 L50 92 L35 82 Z" fill="#FFFFFF" />
          <path d="M45 75 L55 75 L52 90 L48 90 Z" fill="#DC2626" />
          <ellipse cx="50" cy="45" rx="22" ry="25" fill="#FCD34D" />
          <path d="M28 40 Q28 15 50 15 Q72 15 72 40 Q72 30 65 25 Q50 20 35 25 Q28 30 28 40" fill="#1F2937" />

          <g transform={`translate(42, 45) scale(1, ${eyeScaleY})`}>
            <ellipse cx="0" cy="0" rx="3" ry={eyeBlink ? 0.5 : 4} fill="#1F2937" />
            <circle cx="1" cy="-1" r="1" fill="white" opacity="0.6" />
          </g>
          <g transform={`translate(58, 45) scale(1, ${eyeScaleY})`}>
            <ellipse cx="0" cy="0" rx="3" ry={eyeBlink ? 0.5 : 4} fill="#1F2937" />
            <circle cx="1" cy="-1" r="1" fill="white" opacity="0.6" />
          </g>

          <path 
            d={getMouthPath()} 
            stroke="#1F2937" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            fill={mouthOpenness > 0.4 ? "#991B1B" : "none"}
          />

          {showCrown && (
            <>
              <path d="M35 20 L40 8 L50 15 L60 8 L65 20 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
              <circle cx="40" cy="8" r="2" fill="#FEF3C7" filter="url(#glow)" />
              <circle cx="50" cy="15" r="2.5" fill="#FEF3C7" filter="url(#glow)" />
              <circle cx="60" cy="8" r="2" fill="#FEF3C7" filter="url(#glow)" />
            </>
          )}
        </svg>
      </div>

      {isSpeaking && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
          <div className="flex gap-0.5">
            <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" style={{ animationDuration: '0.5s' }} />
            <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.1s' }} />
            <span className="w-0.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.2s' }} />
          </div>
        </div>
      )}

      {isListening && !isSpeaking && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <div className="flex gap-0.5">
            <span 
              className="w-0.5 bg-white rounded-full transition-all duration-100"
              style={{ height: `${Math.max(4, Math.min(12, (audioLevel / 255) * 16))}px` }}
            />
            <span 
              className="w-0.5 bg-white rounded-full transition-all duration-100"
              style={{ height: `${Math.max(4, Math.min(14, (audioLevel / 255) * 20))}px`, transitionDelay: '0.05s' }}
            />
            <span 
              className="w-0.5 bg-white rounded-full transition-all duration-100"
              style={{ height: `${Math.max(4, Math.min(10, (audioLevel / 255) * 12))}px`, transitionDelay: '0.1s' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
