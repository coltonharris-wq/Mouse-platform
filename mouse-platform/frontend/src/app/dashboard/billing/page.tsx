'use client';

import { useEffect, useState } from 'react';
import { Clock, TrendingUp, CreditCard, ArrowUpRight, FileText, Download, AlertTriangle, BarChart3 } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/plans';

interface UsageData {
  plan: string;
  hours_included: number;
  hours_used: number;
  hours_remaining: number;
  overage_hours: number;
  overage_cost_cents: number;
  billing_period_start: string;
  billing_period_end: string;
}

interface Invoice {
  id: string;
  date: string | null;
  amount_cents: number;
  status: string;
  pdf_url: string | null;
  hosted_url: string | null;
}

interface DailyUsage {
  date: string;
  hours: number;
}

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = sessionStorage.getItem('customer_id') || 'demo';

    // Fetch usage, invoices, and daily usage in parallel
    Promise.all([
      fetch(`/api/billing/usage?customer_id=${customerId}`).then((r) => r.json()).catch(() => null),
      fetch(`/api/billing/invoices?customer_id=${customerId}`).then((r) => r.json()).catch(() => ({ invoices: [] })),
      fetch(`/api/billing/usage-daily?customer_id=${customerId}`).then((r) => r.json()).catch(() => ({ daily: [] })),
    ]).then(([usageData, invoiceData, dailyData]) => {
      if (usageData) setUsage(usageData);
      setInvoices(invoiceData?.invoices || []);
      setDailyUsage(dailyData?.daily || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const hoursPercent = usage ? Math.min(100, (usage.hours_used / Math.max(1, usage.hours_included)) * 100) : 0;
  const planKey = (usage?.plan || 'pro') as keyof typeof SUBSCRIPTION_PLANS;
  const planConfig = SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.pro;
  const planPrice = planConfig.priceCents / 100;
  const overageRate = planConfig.overageRateCents / 100;

  return (
    <div>
      <h1 className="text-4xl font-bold text-[#0B1F3B] mb-8">Billing & Hours</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Plan info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-teal-600" />
            <h3 className="text-xl font-semibold text-gray-900">Subscription</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {usage?.plan ? usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1) : 'None'} Plan
          </p>
          <p className="text-xl text-gray-500 mt-2">${planPrice}/month</p>
          <p className="text-base text-gray-400 mt-4">
            Period: {usage?.billing_period_start ? new Date(usage.billing_period_start).toLocaleDateString() : '—'} - {usage?.billing_period_end ? new Date(usage.billing_period_end).toLocaleDateString() : '—'}
          </p>
        </div>

        {/* Hours usage */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-teal-600" />
            <h3 className="text-xl font-semibold text-gray-900">Hours This Period</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {usage?.hours_used?.toFixed(1) || '0'} <span className="text-2xl text-gray-400 font-normal">/ {usage?.hours_included || 0} hrs</span>
          </p>
          <div className="w-full bg-gray-100 rounded-full h-4 mt-4">
            <div
              className={`h-4 rounded-full transition-all ${hoursPercent > 80 ? 'bg-red-500' : 'bg-teal-500'}`}
              style={{ width: `${hoursPercent}%` }}
            />
          </div>
          <p className="text-lg text-gray-500 mt-3">{usage?.hours_remaining?.toFixed(1) || '0'} hours remaining</p>
        </div>
      </div>

      {/* Overage Warning Banners */}
      {usage && hoursPercent >= 100 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 flex items-start gap-4">
          <AlertTriangle className="w-7 h-7 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xl font-semibold text-red-900">Plan Hours Exceeded</h3>
            <p className="text-lg text-red-800 mt-1">
              You&apos;ve exceeded your plan hours. Overage charges of ${overageRate.toFixed(2)}/hr apply.
              {usage.overage_hours > 0 && (
                <> Current overage: {usage.overage_hours.toFixed(1)} hrs = <strong>${(usage.overage_cost_cents / 100).toFixed(2)}</strong></>
              )}
            </p>
            <a href="/pricing" className="inline-block mt-2 text-lg font-semibold text-red-700 hover:text-red-800 underline">
              Upgrade to save money &rarr;
            </a>
          </div>
        </div>
      )}
      {usage && hoursPercent >= 80 && hoursPercent < 100 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 flex items-start gap-4">
          <AlertTriangle className="w-7 h-7 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xl font-semibold text-yellow-900">Approaching Plan Limit</h3>
            <p className="text-lg text-yellow-800 mt-1">
              You&apos;ve used {usage.hours_used.toFixed(1)} of your {usage.hours_included} hours this month. Consider upgrading to avoid overage charges.
            </p>
            <a href="/pricing" className="inline-block mt-2 text-lg font-semibold text-yellow-700 hover:text-yellow-800 underline">
              Upgrade your plan &rarr;
            </a>
          </div>
        </div>
      )}

      {/* Overage (existing) */}
      {usage && usage.overage_hours > 0 && hoursPercent < 100 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-semibold text-yellow-900">Overage</h3>
          </div>
          <p className="text-lg text-gray-700">
            {usage.overage_hours.toFixed(1)} hours over limit at ${overageRate.toFixed(2)}/hr = <strong>${(usage.overage_cost_cents / 100).toFixed(2)}</strong>
          </p>
        </div>
      )}

      {/* Daily Usage Chart */}
      {dailyUsage.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            <h3 className="text-xl font-semibold text-gray-900">Daily Usage</h3>
          </div>
          <div className="flex items-end gap-1 h-48">
            {(() => {
              const maxHours = Math.max(...dailyUsage.map((d) => d.hours), 1);
              return dailyUsage.map((d) => {
                const heightPct = (d.hours / maxHours) * 100;
                const dayLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {d.hours.toFixed(1)}h
                    </div>
                    <div
                      className="w-full bg-[#0F6B6E] rounded-t-sm transition-all hover:bg-[#0d5c5f] min-h-[2px]"
                      style={{ height: `${Math.max(heightPct, 1)}%` }}
                    />
                    {dailyUsage.length <= 15 && (
                      <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">{dayLabel}</span>
                    )}
                  </div>
                );
              });
            })()}
          </div>
          {dailyUsage.length > 15 && (
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-400">
                {new Date(dailyUsage[0].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-sm text-gray-400">
                {new Date(dailyUsage[dailyUsage.length - 1].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Invoice History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center gap-3 p-6 border-b border-gray-100">
          <FileText className="w-6 h-6 text-teal-600" />
          <h3 className="text-xl font-semibold text-gray-900">Invoice History</h3>
        </div>
        {invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No invoices yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="px-6 py-4 text-lg font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-lg font-semibold text-gray-600">Amount</th>
                  <th className="px-6 py-4 text-lg font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-lg font-semibold text-gray-600 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-lg text-gray-900">
                      {inv.date ? new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-lg font-medium text-gray-900">
                      ${(inv.amount_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-base font-medium ${
                        inv.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : inv.status === 'open'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {inv.status === 'paid' ? '\u2705 Paid' : inv.status === 'open' ? '\u23F3 Pending' : inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.pdf_url ? (
                        <a
                          href={inv.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-lg text-[#0F6B6E] font-medium hover:underline"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-base text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upgrade CTA */}
      {usage?.plan !== 'enterprise' && (
        <div className="bg-gray-900 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-2xl">Need more hours?</h3>
              <p className="text-lg text-gray-400 mt-2">Upgrade your plan for more included hours and features.</p>
            </div>
            <a
              href="/pricing"
              className="flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-teal-400 transition-colors"
            >
              Upgrade Plan
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
