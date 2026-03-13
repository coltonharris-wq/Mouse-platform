'use client';

import { useEffect, useState } from 'react';
import { Phone, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { WidgetProps } from './index';

export default function CallsHandledWidget({ customerId, config }: WidgetProps) {
  const [data, setData] = useState<{ calls_today: number; calls_week: number; trend: string } | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/widgets/calls?customer_id=${customerId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ calls_today: 8, calls_week: 38, trend: 'stable' }));
  }, [customerId]);

  const calls = data?.calls_today ?? 8;
  const trend = data?.trend ?? 'stable';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-500';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || 'Calls Handled'}</h3>
        <Phone className="w-4 h-4 text-teal-400" />
      </div>
      <div className="text-3xl font-bold text-white">{calls}</div>
      <div className="flex items-center gap-1 mt-1">
        <TrendIcon className={`w-3 h-3 ${trendColor}`} />
        <p className="text-xs text-zinc-500">{data?.calls_week ?? 38} this week</p>
      </div>
    </div>
  );
}
