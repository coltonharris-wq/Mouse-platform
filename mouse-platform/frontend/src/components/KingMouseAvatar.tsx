'use client';

import { KingMouseStatus, STATUS_EMOJI, STATUS_LABELS } from '@/types/kingmouse-status';

interface KingMouseAvatarProps {
  status: KingMouseStatus;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-10 h-10 text-xl',
  lg: 'w-14 h-14 text-3xl',
};

const OVERLAY_CLASSES = {
  sm: 'text-xs -top-1 -right-1',
  md: 'text-sm -top-1 -right-1',
  lg: 'text-base -top-1 -right-0',
};

export default function KingMouseAvatar({ status, size = 'md' }: KingMouseAvatarProps) {
  const emoji = STATUS_EMOJI[status];
  const label = STATUS_LABELS[status];

  const animationClass =
    status === 'thinking' ? 'animate-km-pulse' :
    status === 'working' ? 'animate-km-bounce' :
    status === 'orchestrating' ? 'animate-km-spin' :
    status === 'sleeping' ? 'opacity-50' :
    '';

  return (
    <div className="relative inline-flex items-center justify-center group" title={label}>
      <div className={`${SIZE_CLASSES[size]} flex items-center justify-center rounded-full bg-gray-800 ${animationClass}`}>
        <span>{emoji}</span>
      </div>
      {status !== 'idle' && (
        <span className={`absolute ${OVERLAY_CLASSES[size]} flex items-center justify-center`}>
          <span className={`inline-block ${animationClass}`}>
            {status === 'thinking' && '\u{1F4AD}'}
            {status === 'working' && '\u{1F528}'}
            {status === 'orchestrating' && '\u{1F3AD}'}
            {status === 'sleeping' && '\u{1F634}'}
          </span>
        </span>
      )}
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {label}
      </span>
      <style jsx>{`
        @keyframes km-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes km-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes km-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-km-pulse { animation: km-pulse 2s ease-in-out infinite; }
        .animate-km-bounce { animation: km-bounce 0.6s ease-in-out infinite; }
        .animate-km-spin { animation: km-spin 3s linear infinite; }
      `}</style>
    </div>
  );
}
