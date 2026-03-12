'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, DollarSign, TrendingUp } from 'lucide-react';

interface Analytics {
  total_customers: number;
  active_customers: number;
  avg_hourly_rate_cents: number;
  avg_profit_per_hour_cents: number;
  total_customer_hours_this_month: number;
  estimated_monthly_profit_cents: number;
  base_rate_cents: number;
  customers_by_status: Record<string, number>;
  profit_by_month: { month: string; profit_cents: number }[];
}

export default function ResellerDashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  useEffect(() => {
    if (!resellerId) { setLoading(false); return; }
    fetch(`/api/reseller/analytics?reseller_id=${resellerId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>No analytics data available yet.</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Customers', value: data.total_customers, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Customers', value: data.active_customers, icon: UserCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Avg Rate', value: `$${(data.avg_hourly_rate_cents / 100).toFixed(2)}/hr`, icon: DollarSign, color: 'bg-teal-50 text-teal-600' },
    { label: 'Monthly Profit', value: `$${(data.estimated_monthly_profit_cents / 100).toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  ];

  const maxProfit = Math.max(...data.profit_by_month.map((m) => m.profit_cents), 1);
  const statusEntries = Object.entries(data.customers_by_status);
  const totalForDonut = statusEntries.reduce((s, [, v]) => s + v, 0) || 1;
  const donutColors = ['#0F6B6E', '#6366f1', '#f59e0b', '#ef4444'];

  // Build donut segments
  let donutOffset = 0;
  const donutSegments = statusEntries.map(([, count], i) => {
    const pct = (count / totalForDonut) * 100;
    const segment = { offset: donutOffset, pct, color: donutColors[i % donutColors.length] };
    donutOffset += pct;
    return segment;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profit bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profit Over Time</h2>
          <div className="flex items-end gap-2 h-48">
            {data.profit_by_month.map((m) => {
              const heightPct = Math.max((m.profit_cents / maxProfit) * 100, 4);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500">${(m.profit_cents / 100).toLocaleString()}</span>
                  <div
                    className="w-full rounded-t bg-[#0F6B6E] transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-gray-400">{m.month.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">By Status</h2>
          <div className="flex items-center justify-center mb-4">
            <svg width="120" height="120" viewBox="0 0 36 36">
              {donutSegments.map((seg, i) => (
                <circle
                  key={i}
                  cx="18" cy="18" r="15.9155"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="3"
                  strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                  strokeDashoffset={-seg.offset}
                  transform="rotate(-90 18 18)"
                />
              ))}
            </svg>
          </div>
          <div className="space-y-2">
            {statusEntries.map(([status, count], i) => (
              <div key={status} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: donutColors[i % donutColors.length] }} />
                <span className="text-gray-600 capitalize">{status}</span>
                <span className="ml-auto font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
