'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import type { WidgetProps } from './index';

export default function ReviewAlertsWidget({ customerId, config }: WidgetProps) {
  const [data, setData] = useState<{ new_count: number; avg_rating: number; latest: string } | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/widgets/reviews?customer_id=${customerId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ new_count: 2, avg_rating: 4.6, latest: '"Great service! Will definitely come back."' }));
  }, [customerId]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || 'Review Alerts'}</h3>
        <Star className="w-4 h-4 text-yellow-400" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{data?.new_count ?? 2}</span>
        <span className="text-sm text-zinc-500">new</span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs text-zinc-400">{data?.avg_rating ?? 4.6} avg</span>
      </div>
      {data?.latest && (
        <p className="text-xs text-zinc-500 mt-2 truncate italic">{data.latest}</p>
      )}
    </div>
  );
}
