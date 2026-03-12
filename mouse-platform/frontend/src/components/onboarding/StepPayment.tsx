'use client';

import { useEffect, useState } from 'react';

interface Plan {
  slug: string;
  name: string;
  price_cents: number;
  hours_included: number;
  features: string[];
}

interface StepPaymentProps {
  selectedPlan: string;
  email: string;
  proSlug: string;
  sessionKey: string;
  resellerBrandSlug?: string;
  onChange: (planSlug: string) => void;
  onBack: () => void;
}

export default function StepPayment({ selectedPlan, email, proSlug, sessionKey, resellerBrandSlug, onChange, onBack }: StepPaymentProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    setPlans([
      { slug: 'pro', name: 'Pro', price_cents: 9700, hours_included: 20, features: ['20 hours/month', '1 AI employee', 'Full agent capabilities', 'Email support'] },
      { slug: 'growth', name: 'Growth', price_cents: 49700, hours_included: 125, features: ['125 hours/month', '1 AI employee', 'Full agent capabilities', 'Priority support', 'Custom workflows'] },
      { slug: 'enterprise', name: 'Enterprise', price_cents: 99700, hours_included: 300, features: ['300 hours/month', '1 AI employee', 'Full agent capabilities', 'Dedicated support', 'Custom integrations', 'API access'] },
    ]);
    setLoading(false);
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlan || !email) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          plan_slug: selectedPlan,
          pro_slug: proSlug,
          session_key: sessionKey || undefined,
          promo_code: promoCode || undefined,
          reseller_brand_slug: resellerBrandSlug || undefined,
          success_url: `${window.location.origin}/onboarding/success?session_id={CHECKOUT_SESSION_ID}${sessionKey ? `&sk=${sessionKey}` : ''}`,
          cancel_url: `${window.location.origin}/onboarding/cancel`,
        }),
      });

      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Failed to create checkout session.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your plan</h2>
      <p className="text-gray-600 mb-2">All plans include your first 2 hours free.</p>
      <p className="text-sm text-teal-700 font-medium mb-8">AI employees at $4.98/hr vs $35/hr for humans</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => (
          <button
            key={plan.slug}
            onClick={() => onChange(plan.slug)}
            className={`text-left p-6 rounded-xl border-2 transition-all ${
              selectedPlan === plan.slug
                ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${plan.slug === 'growth' ? 'relative' : ''}`}
          >
            {plan.slug === 'growth' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">${(plan.price_cents / 100).toFixed(0)}</span>
              <span className="text-gray-500">/mo</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{plan.hours_included} hours included</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Have a promo code?</label>
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase());
              setPromoApplied(false);
            }}
            placeholder="Enter promo code"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          {promoCode && !promoApplied && (
            <button
              type="button"
              onClick={() => setPromoApplied(true)}
              className="bg-teal-100 text-teal-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-200 transition-colors"
            >
              Apply
            </button>
          )}
        </div>
        {promoApplied && promoCode && (
          <p className="text-sm text-teal-600 mt-1 font-medium">
            Code &quot;{promoCode}&quot; will be applied at checkout
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubscribe}
          disabled={!selectedPlan || submitting}
          className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Redirecting to checkout...' : 'Start Subscription'}
        </button>
      </div>
    </div>
  );
}
