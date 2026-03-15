'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface Commission {
  id: string;
  customer_name?: string;
  period_start: string;
  period_end: string;
  hours_used: number;
  margin_per_hour: number;
  commission_amount: number;
  status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

function formatMoney(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}

function formatHours(hours: number): string {
  return hours.toFixed(1) + 'h';
}

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${s.toLocaleDateString(undefined, opts)} - ${e.toLocaleDateString(undefined, opts)}`;
}

const STATUS_STYLES: Record<Commission['status'], { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
  paid:    { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Paid' },
  failed:  { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed' },
};

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  useEffect(() => {
    if (!resellerId) { setLoading(false); return; }
    fetch(`/api/reseller/commissions?reseller_id=${resellerId}`)
      .then((r) => r.json())
      .then((data) => {
        setCommissions(Array.isArray(data) ? data : data.commissions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#F07020' }} />
      </div>
    );
  }

  // Compute summary metrics
  const totalEarned = commissions
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const now = new Date();
  const thisMonthEarned = commissions
    .filter((c) => {
      const d = new Date(c.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const pendingPayout = commissions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const commissionsWithMargin = commissions.filter((c) => c.margin_per_hour > 0);
  const avgMargin = commissionsWithMargin.length > 0
    ? commissionsWithMargin.reduce((sum, c) => sum + c.margin_per_hour, 0) / commissionsWithMargin.length
    : 0;

  const stats = [
    { label: 'Total Earned', value: formatMoney(totalEarned), icon: DollarSign, iconBg: 'bg-[#FFF3EB]', iconColor: 'text-[#F07020]' },
    { label: 'This Month', value: formatMoney(thisMonthEarned), icon: TrendingUp, iconBg: 'bg-[#E8F7F1]', iconColor: 'text-[#1D9E75]' },
    { label: 'Pending Payout', value: formatMoney(pendingPayout), icon: Clock, iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Avg Margin/hr', value: formatMoney(avgMargin), icon: TrendingUp, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#1e2a3a' }}>Commissions</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl p-5"
              style={{ border: '1px solid #e4e0da' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <span className="text-sm text-gray-500">{s.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#1e2a3a' }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Commission history table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e4e0da' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #e4e0da' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#1e2a3a' }}>Commission History</h2>
        </div>

        {commissions.length === 0 ? (
          <div className="text-center py-16 px-6">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              No commissions yet. Invite customers to start earning.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-right">Hours Used</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Margin/hr</th>
                  <th className="px-4 py-3 text-right">Earned</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {commissions.map((c) => {
                  const badge = STATUS_STYLES[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium" style={{ color: '#1e2a3a' }}>
                        {c.customer_name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatPeriod(c.period_start, c.period_end)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {formatHours(c.hours_used)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 hidden sm:table-cell">
                        {formatMoney(c.margin_per_hour)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#1D9E75' }}>
                        {formatMoney(c.commission_amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
