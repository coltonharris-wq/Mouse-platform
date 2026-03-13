'use client';

import { Bell } from 'lucide-react';
import type { WidgetProps } from './index';

export default function RecallsDueWidget({ config }: WidgetProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || 'Recalls Due'}</h3>
        <Bell className="w-4 h-4 text-orange-400" />
      </div>
      <div className="text-3xl font-bold text-white">18</div>
      <p className="text-xs text-zinc-500 mt-1">Patients overdue for 6-month checkup</p>
    </div>
  );
}
