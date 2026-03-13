'use client';

import { Clock } from 'lucide-react';
import type { WidgetProps } from './index';

export default function OpenSlotsWidget({ config }: WidgetProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || 'Open Slots'}</h3>
        <Clock className="w-4 h-4 text-teal-400" />
      </div>
      <div className="text-3xl font-bold text-white">5</div>
      <p className="text-xs text-zinc-500 mt-1">2:00, 2:30, 3:00, 4:00, 4:30 PM</p>
    </div>
  );
}
