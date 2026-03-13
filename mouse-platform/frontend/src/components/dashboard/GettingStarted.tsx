'use client';

import type { SampleTask } from '@/types/pro-template';

interface GettingStartedProps {
  tasks: SampleTask[];
  onTryTask: (text: string) => void;
}

export default function GettingStarted({ tasks, onTryTask }: GettingStartedProps) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 mt-6">
      <h3 className="text-lg font-medium text-white mb-3">
        {'\u{1F42D}'} Try asking King Mouse:
      </h3>
      <div className="space-y-2">
        {tasks.slice(0, 5).map((task, i) => (
          <button
            key={i}
            onClick={() => onTryTask(task.title)}
            className="w-full text-left p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group"
          >
            <span className="text-teal-400 group-hover:text-teal-300">
              &ldquo;{task.title}&rdquo;
            </span>
            <p className="text-xs text-zinc-500 mt-1">{task.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
