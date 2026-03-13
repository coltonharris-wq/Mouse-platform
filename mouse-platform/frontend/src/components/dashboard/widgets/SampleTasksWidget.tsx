'use client';

import { Zap } from 'lucide-react';
import type { WidgetProps } from './index';

export default function SampleTasksWidget({ config }: WidgetProps) {
  const tasks = [
    'Answer the next phone call',
    'Check today\'s schedule',
    'Send a follow-up message',
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || 'Quick Tasks'}</h3>
        <Zap className="w-4 h-4 text-teal-400" />
      </div>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <button
            key={i}
            className="w-full text-left text-sm text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg px-3 py-2 transition-colors"
          >
            {task}
          </button>
        ))}
      </div>
    </div>
  );
}
