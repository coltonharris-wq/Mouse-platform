// src/types/kingmouse-status.ts
export type KingMouseStatus = 'idle' | 'thinking' | 'working' | 'orchestrating' | 'sleeping';

export const STATUS_EMOJI: Record<KingMouseStatus, string> = {
  idle: '\u{1F42D}',
  thinking: '\u{1F4AD}',
  working: '\u{1F528}',
  orchestrating: '\u{1F3AD}',
  sleeping: '\u{1F634}',
};

export const STATUS_LABELS: Record<KingMouseStatus, string> = {
  idle: 'Ready',
  thinking: 'Thinking...',
  working: 'Working...',
  orchestrating: 'Orchestrating...',
  sleeping: 'Off hours',
};
