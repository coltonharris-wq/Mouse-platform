'use client';

import { Users } from 'lucide-react';
import type { WidgetProps } from './index';

export default function PatientScheduleWidget({ config }: WidgetProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || "Today's Patients"}</h3>
        <Users className="w-4 h-4 text-blue-400" />
      </div>
      <div className="text-3xl font-bold text-white">12</div>
      <p className="text-xs text-zinc-500 mt-1">Next: 1:00 PM &mdash; John D. (Cleaning)</p>
    </div>
  );
}
