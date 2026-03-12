'use client';

import { useEffect, useState } from 'react';
import { Clock, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react';
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

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = sessionStorage.getItem('customer_id') || 'demo';
    fetch(`/api/billing/usage?customer_id=${customerId}`)
      .then((res) => res.json())
      .then(setUsage)
      .catch(() => {})
      .finally(() => setLoading(false));
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
      <h1 className="text-2xl font-bold text-[#0B1F3B] mb-6">Billing & Hours</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Plan info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Subscription</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {usage?.plan ? usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1) : 'None'} Plan
          </p>
          <p className="text-gray-500 mt-1">${planPrice}/month</p>
          <p className="text-sm text-gray-400 mt-3">
            Period: {usage?.billing_period_start ? new Date(usage.billing_period_start).toLocaleDateString() : '—'} - {usage?.billing_period_end ? new Date(usage.billing_period_end).toLocaleDateString() : '—'}
          </p>
        </div>

        {/* Hours usage */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Hours This Period</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {usage?.hours_used?.toFixed(1) || '0'} <span className="text-lg text-gray-400 font-normal">/ {usage?.hours_included || 0} hrs</span>
          </p>
          <div className="w-full bg-gray-100 rounded-full h-3 mt-3">
            <div
              className={`h-3 rounded-full transition-all ${hoursPercent > 80 ? 'bg-red-500' : 'bg-teal-500'}`}
              style={{ width: `${hoursPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{usage?.hours_remaining?.toFixed(1) || '0'} hours remaining</p>
        </div>
      </div>

      {/* Overage */}
      {usage && usage.overage_hours > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Overage</h3>
          </div>
          <p className="text-gray-700">
            {usage.overage_hours.toFixed(1)} hours over limit at ${overageRate.toFixed(2)}/hr = <strong>${(usage.overage_cost_cents / 100).toFixed(2)}</strong>
          </p>
        </div>
      )}

      {/* Upgrade CTA */}
      {usage?.plan !== 'enterprise' && (
        <div className="bg-gray-900 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Need more hours?</h3>
              <p className="text-gray-400 mt-1">Upgrade your plan for more included hours and features.</p>
            </div>
            <a
              href="/pricing"
              className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-400 transition-colors"
            >
              Upgrade Plan
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
