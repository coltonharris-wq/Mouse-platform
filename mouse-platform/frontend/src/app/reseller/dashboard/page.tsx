'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, DollarSign, TrendingUp, Phone, Target, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: 'voice' | 'lead' | 'business' | 'funnel';
}

const QUICK_ACTIONS = [
  {
    title: 'Build Voice Agent',
    description: 'Set up an AI receptionist in 60 seconds',
    icon: Phone,
    href: '/reseller/voice',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    iconBg: 'bg-teal-100',
    cta: 'Start',
  },
  {
    title: 'Create Funnel',
    description: 'Build a lead gen funnel for your customer',
    icon: Target,
    href: '/reseller/lead-funnels',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100',
    cta: 'Start',
  },
  {
    title: 'Find Leads',
    description: 'Search for new businesses to pitch',
    icon: Search,
    href: '/reseller/lead-finder',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    cta: 'Search',
  },
];

export default function ResellerDashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activity] = useState<ActivityItem[]>([]);

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

  const stats = data ? [
    { label: 'Total Revenue (MTD)', value: `$${(data.estimated_monthly_profit_cents / 100 * 2.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Profit (MTD)', value: `$${(data.estimated_monthly_profit_cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Active Customers', value: data.active_customers, icon: UserCheck, color: 'bg-teal-50 text-teal-600' },
    { label: 'New This Month', value: data.total_customers - data.active_customers, icon: Users, color: 'bg-purple-50 text-purple-600' },
  ] : [];

  const maxProfit = data ? Math.max(...data.profit_by_month.map((m) => m.profit_cents), 1) : 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`block rounded-xl border p-5 hover:shadow-md transition-shadow ${action.color}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.iconBg} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{action.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                {action.cta} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Revenue Snapshot */}
      {data && (
        <>
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

          {/* Mini Profit Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Profit Over Time</h2>
              <Link href="/reseller/revenue" className="text-sm text-[#0F6B6E] font-medium hover:underline">
                View Revenue Details &rarr;
              </Link>
            </div>
            <div className="flex items-end gap-2 h-36">
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
        </>
      )}

      {!data && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No analytics data available yet. Start by adding businesses and deploying voice agents.
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <span className="text-sm text-gray-400">View All</span>
        </div>
        {activity.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No recent activity yet. Deploy a voice agent or add a business to see events here.
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'voice' ? 'bg-teal-500' :
                  item.type === 'lead' ? 'bg-blue-500' :
                  item.type === 'funnel' ? 'bg-purple-500' :
                  'bg-gray-400'
                }`} />
                <span className="text-gray-700 flex-1">{item.text}</span>
                <span className="text-gray-400 text-xs">{item.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
