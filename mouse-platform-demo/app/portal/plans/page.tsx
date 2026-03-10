'use client';

import { useState } from 'react';
import { Check, Zap, TrendingUp, Building2, ArrowRight, Loader2, Clock, Star, Shield } from 'lucide-react';

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    price: 97,
    hours: 20,
    perHour: '$4.85',
    description: 'Perfect for small teams getting started with AI',
    features: [
      '20 AI work hours/month',
      'King Mouse orchestrator',
      'Up to 5 AI employees',
      'Chat & voice support',
      'Basic analytics',
    ],
    icon: Zap,
    color: 'blue',
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 497,
    hours: 125,
    perHour: '$3.98',
    description: 'For growing businesses scaling their AI workforce',
    features: [
      '125 AI work hours/month',
      'King Mouse orchestrator',
      'Up to 15 AI employees',
      'Chat, voice & phone',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
    ],
    icon: TrendingUp,
    color: 'teal',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 997,
    hours: 300,
    perHour: '$3.32',
    description: 'Full AI workforce for large operations',
    features: [
      '300 AI work hours/month',
      'King Mouse orchestrator',
      'Unlimited AI employees',
      'All communication channels',
      'Full analytics suite',
      'Dedicated support',
      'Custom AI training',
      'API access',
    ],
    icon: Building2,
    color: 'purple',
    popular: false,
  },
];

const topups = [
  { id: 'topup_10', hours: 10, price: 49.80 },
  { id: 'topup_25', hours: 25, price: 124.50 },
  { id: 'topup_50', hours: 50, price: 249.00 },
];

export default function PlansPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');

  const getSession = () => {
    try {
      const s = localStorage.getItem('mouse_session');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  };

  const handleCheckout = async (plan: string) => {
    setLoading(plan);
    setError('');

    try {
      const session = getSession();
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          customerId: session.customerId || session.userId,
          customerEmail: session.email,
          promoCode: promoCode || undefined,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start checkout');
        setLoading(null);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-mouse-navy">Choose Your Plan</h1>
        <p className="text-gray-500 mt-2">AI employees at a fraction of human cost. Cancel anytime.</p>
      </div>

      {/* Promo Code */}
      <div className="max-w-md mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Promo code (e.g. FOUNDERS100)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-mouse-teal focus:border-mouse-teal"
          />
          {promoCode && (
            <span className="flex items-center px-3 py-2 bg-green-50 text-green-600 text-xs font-medium rounded-lg">
              <Check size={14} className="mr-1" /> Applied
            </span>
          )}
        </div>
        {promoCode === 'FOUNDERS100' && (
          <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
            <Star size={12} /> First month FREE — you&apos;ll only be charged starting month 2
          </p>
        )}
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 shadow-sm p-8 transition-all hover:shadow-lg ${
                plan.popular ? 'border-mouse-teal ring-4 ring-mouse-teal/10' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.popular ? 'bg-mouse-teal/10' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${plan.popular ? 'text-mouse-teal' : 'text-gray-500'}`} />
                </div>
                <h3 className="text-xl font-bold text-mouse-navy">{plan.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-mouse-navy">${plan.price}</span>
                  <span className="text-gray-400">/mo</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={14} className="text-mouse-teal" />
                  <span className="text-sm text-gray-600">{plan.hours} work hours · {plan.perHour}/hr</span>
                </div>
                {promoCode === 'FOUNDERS100' && (
                  <div className="mt-2 px-2 py-1 bg-green-50 rounded text-green-600 text-xs font-medium inline-block">
                    First month: $0.00
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-mouse-teal to-mouse-navy text-white hover:opacity-90 shadow-lg'
                    : 'bg-mouse-navy text-white hover:bg-mouse-navy/90'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Redirecting to checkout...
                  </>
                ) : (
                  <>
                    Get Started <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Top-Up Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-bold text-mouse-navy mb-2">Need More Hours?</h2>
        <p className="text-gray-500 text-sm mb-6">Buy additional work hours at $4.98/hr. No subscription needed.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topups.map((t) => (
            <div key={t.id} className="border border-gray-200 rounded-xl p-5 hover:border-mouse-teal transition-colors">
              <div className="text-center">
                <div className="text-2xl font-bold text-mouse-navy">{t.hours} hrs</div>
                <div className="text-mouse-teal font-semibold mt-1">${t.price.toFixed(2)}</div>
                <div className="text-xs text-gray-400 mt-0.5">${(t.price / t.hours).toFixed(2)}/hr</div>
              </div>
              <button
                onClick={() => handleCheckout(t.id)}
                disabled={loading !== null}
                className="w-full mt-4 py-2 border border-mouse-navy text-mouse-navy text-sm font-medium rounded-lg hover:bg-mouse-navy hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === t.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  'Buy Now'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Contact */}
      <div className="text-center py-6">
        <p className="text-gray-500">
          Need a custom plan? <a href="tel:+18779340395" className="text-mouse-teal font-medium hover:underline">Call (877) 934-0395</a> or{' '}
          <a href="mailto:hello@automio.com" className="text-mouse-teal font-medium hover:underline">email us</a>
        </p>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-8 py-6 text-gray-400 text-xs">
        <div className="flex items-center gap-1.5">
          <Shield size={14} /> Secure payments via Stripe
        </div>
        <div className="flex items-center gap-1.5">
          <Check size={14} /> Cancel anytime
        </div>
        <div className="flex items-center gap-1.5">
          <Star size={14} /> 30-day money back guarantee
        </div>
      </div>
    </div>
  );
}
