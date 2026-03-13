'use client';

import { Car } from 'lucide-react';
import type { WidgetProps } from './index';

export default function VehiclesWidget({ config }: WidgetProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || 'Vehicles in Shop'}</h3>
        <Car className="w-4 h-4 text-blue-400" />
      </div>
      <div className="text-3xl font-bold text-white">4</div>
      <p className="text-xs text-zinc-500 mt-1">2 in progress, 1 waiting parts, 1 ready</p>
    </div>
  );
}
