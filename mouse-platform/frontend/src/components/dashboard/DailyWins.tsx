'use client';

import { useEffect, useState } from 'react';
import { X, Clock, CheckCircle, Phone, Mail } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface DailyWinsData {
  hours_worked: number;
  tasks_completed: number;
  calls_handled: number;
  emails_handled: number;
  estimated_hours_saved: number;
  has_data: boolean;
}

export default function DailyWins() {
  const [data, setData] = useState<DailyWinsData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed today
    const dismissedDate = sessionStorage.getItem('daily_wins_dismissed');
    const today = new Date().toISOString().split('T')[0];
    if (dismissedDate === today) {
      setDismissed(true);
      return;
    }

    const customerId = sessionStorage.getItem('customer_id') || 'demo';
    apiFetch(`/api/engagement/daily-wins?customer_id=${customerId}`)
      .then((r) => r.json())
      .then((d) => { if (d.has_data) setData(d); })
      .catch(() => {});
  }, []);

  if (dismissed || !data) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('daily_wins_dismissed', new Date().toISOString().split('T')[0]);
  };

  const stats = [
    { icon: Clock, label: 'Hours saved', value: `${data.estimated_hours_saved.toFixed(1)}`, show: data.estimated_hours_saved > 0 },
    { icon: CheckCircle, label: 'Tasks completed', value: `${data.tasks_completed}`, show: data.tasks_completed > 0 },
    { icon: Phone, label: 'Calls handled', value: `${data.calls_handled}`, show: data.calls_handled > 0 },
    { icon: Mail, label: 'Emails handled', value: `${data.emails_handled}`, show: data.emails_handled > 0 },
  ].filter((s) => s.show);

  if (stats.length === 0 && data.hours_worked > 0) {
    stats.push({ icon: Clock, label: 'Hours worked', value: data.hours_worked.toFixed(1), show: true });
  }

  if (stats.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 rounded-xl p-5 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{'\u{1F42D}'}</span>
        <h3 className="text-xl font-bold text-gray-900">Yesterday&apos;s Wins</h3>
      </div>

      <div className="flex flex-wrap gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Icon className="w-5 h-5 text-[#0F6B6E]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-base text-gray-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
