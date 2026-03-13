'use client';

import { MessageSquare } from 'lucide-react';
import type { WidgetProps } from './index';

export default function QuickActionsWidget({ config }: WidgetProps) {
  const prompts = [
    'Check my messages',
    'Summarize today\'s activity',
    'What needs my attention?',
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || 'Ask King Mouse'}</h3>
        <MessageSquare className="w-4 h-4 text-teal-400" />
      </div>
      <div className="space-y-2">
        {prompts.map((prompt, i) => (
          <button
            key={i}
            className="w-full text-left text-sm text-teal-400 hover:text-teal-300 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg px-3 py-2 transition-colors"
          >
            &ldquo;{prompt}&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
}
