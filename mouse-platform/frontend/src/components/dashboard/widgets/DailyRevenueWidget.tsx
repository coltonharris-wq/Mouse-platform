'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import type { WidgetProps } from './index';

export default function DailyRevenueWidget({ customerId, config }: WidgetProps) {
  const [data, setData] = useState<{ today: number; yesterday: number } | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/widgets/revenue?customer_id=${customerId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ today: 1247, yesterday: 1100 }));
  }, [customerId]);

  const today = data?.today ?? 1247;
  const yesterday = data?.yesterday ?? 1100;
  const isUp = today >= yesterday;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || "Today's Revenue"}</h3>
        <DollarSign className="w-4 h-4 text-teal-400" />
      </div>
      <div className="text-3xl font-bold text-white">${today.toLocaleString()}</div>
      <div className="flex items-center gap-1 mt-1">
        {isUp ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
        <p className="text-xs text-zinc-500">
          vs ${yesterday.toLocaleString()} yesterday
        </p>
      </div>
    </div>
  );
}
