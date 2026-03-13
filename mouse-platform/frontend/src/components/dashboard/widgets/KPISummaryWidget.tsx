'use client';

import { BarChart3 } from 'lucide-react';
import type { WidgetProps } from './index';

export default function KPISummaryWidget({ config }: WidgetProps) {
  const kpis = [
    { name: 'Calls', current: 14, target: 20, unit: '' },
    { name: 'Revenue', current: 1247, target: 1500, unit: '$' },
    { name: 'Rating', current: 4.6, target: 4.8, unit: '' },
    { name: 'Response', current: 3, target: 5, unit: 'min' },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || 'KPIs'}</h3>
        <BarChart3 className="w-4 h-4 text-teal-400" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => {
          const pct = Math.min((kpi.current / kpi.target) * 100, 100);
          return (
            <div key={kpi.name}>
              <p className="text-xs text-zinc-500 mb-1">{kpi.name}</p>
              <p className="text-sm font-bold text-white">
                {kpi.unit === '$' ? `$${kpi.current}` : `${kpi.current}${kpi.unit ? ` ${kpi.unit}` : ''}`}
              </p>
              <div className="h-1 bg-zinc-800 rounded-full mt-1">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
