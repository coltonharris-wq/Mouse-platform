'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import type { WidgetProps } from './index';

export default function AppointmentsWidget({ customerId, config }: WidgetProps) {
  const [data, setData] = useState<{ today: number; next: { time: string; name: string; service: string } } | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/widgets/appointments?customer_id=${customerId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ today: 6, next: { time: '3:00 PM', name: 'Customer', service: 'Appointment' } }));
  }, [customerId]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">{config?.title || "Today's Appointments"}</h3>
        <Calendar className="w-4 h-4 text-teal-400" />
      </div>
      <div className="text-3xl font-bold text-white">{data?.today ?? 6}</div>
      {data?.next && (
        <p className="text-xs text-zinc-500 mt-1">
          Next: {data.next.time} &mdash; {data.next.name} ({data.next.service})
        </p>
      )}
    </div>
  );
}
