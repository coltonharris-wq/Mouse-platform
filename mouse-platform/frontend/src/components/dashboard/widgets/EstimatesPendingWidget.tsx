'use client';

import { FileText } from 'lucide-react';
import type { WidgetProps } from './index';

export default function EstimatesPendingWidget({ config }: WidgetProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || 'Estimates Pending'}</h3>
        <FileText className="w-4 h-4 text-orange-400" />
      </div>
      <div className="text-3xl font-bold text-white">3</div>
      <p className="text-xs text-zinc-500 mt-1">$2,450 total pending approval</p>
    </div>
  );
}
