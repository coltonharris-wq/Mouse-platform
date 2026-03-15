'use client';

import { useEffect, useState } from 'react';
import { Wallet, Banknote, Calendar, CreditCard, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Payout {
  id: string;
  amount: number;
  customer_count: number;
  total_hours: number;
  status: 'processing' | 'deposited' | 'failed';
  payout_date: string;
  created_at: string;
}

function formatMoney(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}

function formatHours(hours: number): string {
  return hours.toFixed(1) + 'h';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getNextFriday(): string {
  const now = new Date();
  const day = now.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  const nextFri = new Date(now);
  nextFri.setDate(now.getDate() + daysUntilFriday);
  return nextFri.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const STATUS_STYLES: Record<Payout['status'], { bg: string; text: string; label: string }> = {
  processing: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Processing' },
  deposited:  { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Deposited' },
  failed:     { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed' },
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeConnected, setStripeConnected] = useState(true);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  useEffect(() => {
    if (!resellerId) { setLoading(false); return; }
    fetch(`/api/reseller/payouts?reseller_id=${resellerId}`)
      .then((r) => r.json())
      .then((data) => {
        setPayouts(Array.isArray(data) ? data : data.payouts || []);
        if (typeof data.stripe_connected === 'boolean') {
          setStripeConnected(data.stripe_connected);
        }
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

  // Compute summary
  const totalPaidOut = payouts
    .filter((p) => p.status === 'deposited')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: 'Total Paid Out', value: formatMoney(totalPaidOut), icon: Wallet, iconBg: 'bg-[#E8F7F1]', iconColor: 'text-[#1D9E75]' },
    { label: 'Next Payout', value: getNextFriday(), icon: Calendar, iconBg: 'bg-[#FFF3EB]', iconColor: 'text-[#F07020]' },
    { label: 'Payout Method', value: stripeConnected ? 'Stripe Connect' : 'Not set up', icon: CreditCard, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Frequency', value: 'Weekly', icon: Banknote, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#1e2a3a' }}>Payouts</h1>

      {/* Stripe Connect CTA */}
      {!stripeConnected && (
        <div
          className="rounded-xl p-5 mb-8 flex items-center justify-between"
          style={{ border: '1px solid #e4e0da', background: '#FFF8F3' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FFF3EB]">
              <Wallet className="w-5 h-5 text-[#F07020]" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1e2a3a' }}>
                Connect your bank account to receive payouts
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Set up Stripe Connect in your settings to start receiving weekly deposits.
              </p>
            </div>
          </div>
          <Link
            href="/reseller/settings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#F07020' }}
          >
            Set Up <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

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

      {/* Payout history table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e4e0da' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #e4e0da' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#1e2a3a' }}>Payout History</h2>
        </div>

        {payouts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              No payouts yet. Commissions will be paid out weekly once you have earnings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Customers</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Hours</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payouts.map((p) => {
                  const badge = STATUS_STYLES[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium" style={{ color: '#1e2a3a' }}>
                        {formatDate(p.payout_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#1D9E75' }}>
                        {formatMoney(p.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {p.customer_count}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 hidden sm:table-cell">
                        {formatHours(p.total_hours)}
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
