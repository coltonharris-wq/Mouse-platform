'use client';

import Link from 'next/link';
import { Check, Clock, Users, Zap } from 'lucide-react';
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/plans';

export default function PricingPage() {
  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#0B1F3B] mb-4">
            AI Employees Starting at $3.98/hr
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Subscription plans with included hours. Your KingMouse AI employee works around the clock for a fraction of human cost.
          </p>
        </div>

        {/* Comparison banner */}
        <div className="max-w-md mx-auto mb-12 bg-gray-900 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-gray-400 text-sm">Human Employee</p>
              <p className="text-2xl font-bold text-red-400 line-through">$35/hr</p>
            </div>
            <div className="text-gray-500 text-2xl">vs</div>
            <div>
              <p className="text-teal-400 text-sm">KingMouse AI</p>
              <p className="text-2xl font-bold text-teal-400">$3.98-4.98/hr</p>
            </div>
          </div>
        </div>

        {/* Free trial banner */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold">
            <Zap className="w-4 h-4" />
            First 2 hours free on every plan
          </span>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`relative rounded-2xl bg-white p-8 shadow-lg border-2 ${
                plan.slug === 'growth'
                  ? 'border-teal-500 ring-4 ring-teal-100'
                  : 'border-gray-200'
              }`}
            >
              {plan.slug === 'growth' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              </div>

              <div className="text-center mb-2">
                <span className="text-5xl font-bold text-gray-900">
                  {formatPrice(plan.priceCents)}
                </span>
                <span className="text-gray-500">/mo</span>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mt-2 text-teal-600">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">{plan.hoursIncluded} hours included</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ${(plan.priceCents / 100 / plan.hoursIncluded).toFixed(2)}/hr effective rate
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">${(plan.overageRateCents / 100).toFixed(2)}/hr overage</span>
                </li>
              </ul>

              <Link
                href={`/onboarding?plan=${plan.slug}`}
                className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition-colors ${
                  plan.slug === 'growth'
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: Users, title: 'Pick Your Pro', desc: 'Choose an AI employee specialized for your industry' },
              { step: '2', icon: Check, title: 'Answer Questions', desc: 'Tell us about your business in a few simple steps' },
              { step: '3', icon: Zap, title: 'Subscribe', desc: 'Choose a plan and start your subscription' },
              { step: '4', icon: Clock, title: 'AI Starts Working', desc: 'Your AI employee begins managing tasks immediately' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-700 font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">FAQ</h2>
          <div className="space-y-6">
            {[
              { q: 'What happens if I go over my hours?', a: 'You\'re billed at your plan\'s overage rate ($4.98/hr Pro, $4.48/hr Growth, $3.98/hr Enterprise). No surprise charges — you can set alerts.' },
              { q: 'Can I change plans?', a: 'Yes, upgrade or downgrade anytime. Changes take effect at the next billing cycle.' },
              { q: 'What does the AI employee actually do?', a: 'It handles scheduling, inventory, customer communication, ordering, and admin tasks specific to your industry. It works autonomously and only asks you for approval on big decisions.' },
              { q: 'Is my data secure?', a: 'Each customer gets their own sandboxed VM. Your data never touches other customers\' environments.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
