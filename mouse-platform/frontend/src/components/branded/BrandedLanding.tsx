'use client';

import Link from 'next/link';
import { ArrowRight, Check, Clock, Shield, Zap, Users } from 'lucide-react';
import ProGrid from '@/components/marketplace/ProGrid';
import DemoChat from '@/components/landing/DemoChat';
import { SUBSCRIPTION_PLANS } from '@/lib/plans';

interface BrandedLandingProps {
  brand: {
    slug: string;
    display_name: string;
    logo_url: string | null;
    color: string;
    tagline: string | null;
  };
  slug: string;
}

export default function BrandedLanding({ brand, slug }: BrandedLandingProps) {
  const accentColor = brand.color || '#0F6B6E';
  const ref = encodeURIComponent(slug);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brand.logo_url && (
              <img src={brand.logo_url} alt={brand.display_name} className="h-8 w-auto" />
            )}
            <div>
              <span className="text-xl font-bold" style={{ color: accentColor }}>{brand.display_name}</span>
              <span className="text-xs text-gray-400 ml-2">Powered by KingMouse</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/marketplace" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">Marketplace</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">Pricing</Link>
            <Link
              href={`/onboarding?ref=${ref}`}
              className="text-white px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: accentColor }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-[#0B1F3B] mb-6 leading-tight">
            Stop Hiring.<br />Start Deploying.
          </h1>
          {brand.tagline && (
            <p className="text-lg font-medium mb-4" style={{ color: accentColor }}>{brand.tagline}</p>
          )}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            {brand.display_name} and KingMouse handle operations, scheduling, inventory, and customer communication &mdash; so you don&apos;t have to.
          </p>
          <p className="text-3xl font-bold mb-8" style={{ color: accentColor }}>
            AI Employees at $4.98/hr
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/onboarding?ref=${ref}`}
              className="flex items-center gap-2 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              Hire Your AI Employee
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/pricing" className="text-gray-600 px-8 py-4 rounded-xl text-lg font-medium hover:text-gray-900">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Chat */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0B1F3B] text-center mb-4">See What KingMouse Can Do</h2>
          <p className="text-gray-600 text-center mb-8 max-w-xl mx-auto">
            Chat with KingMouse right now. Ask about capabilities, pricing, or how it works for your industry.
          </p>
          <DemoChat />
        </div>
      </section>

      {/* Marketplace */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0B1F3B] text-center mb-4">Choose Your AI Employee</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Each Pro is specialized for your industry. Pick one and it starts working immediately.
          </p>
          <ProGrid hireUrl={(proSlug) => `/onboarding?ref=${ref}&pro=${proSlug}`} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0B1F3B] text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: Users, title: 'Pick Your Pro', desc: 'Choose an AI employee specialized for your industry' },
              { step: '2', icon: Check, title: 'Answer Questions', desc: 'Tell us about your business in a few simple steps' },
              { step: '3', icon: Zap, title: 'Subscribe', desc: 'Choose a plan starting at $97/month' },
              { step: '4', icon: Clock, title: 'AI Starts Working', desc: 'Your AI employee begins in under 2 minutes' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accentColor}20` }}>
                  <span className="font-bold text-xl" style={{ color: accentColor }}>{item.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0B1F3B] text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-gray-500 mb-12">through {brand.display_name}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
              <div
                key={plan.slug}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 ${
                  plan.slug === 'growth' ? 'relative' : 'border-gray-200'
                }`}
                style={plan.slug === 'growth' ? { borderColor: accentColor } : undefined}
              >
                {plan.slug === 'growth' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: accentColor }}>
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-bold text-gray-900">${plan.priceCents / 100}</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{plan.hoursIncluded} hours included</p>
                <p className="text-sm font-medium mt-1" style={{ color: accentColor }}>
                  Overage: ${(plan.overageRateCents / 100).toFixed(2)}/hr
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="mt-0.5" style={{ color: accentColor }}>{'\u2713'}</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/onboarding?ref=${ref}`}
                  className="block mt-6 text-center text-white py-2.5 rounded-lg font-semibold transition-colors"
                  style={{ backgroundColor: accentColor }}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0B1F3B] text-center mb-12">What KingMouse Does</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: 'Works 24/7', desc: 'Never sleeps, never calls in sick. Your AI employee works around the clock.' },
              { icon: Shield, title: 'Sandboxed & Secure', desc: 'Each customer gets their own VM. Your data never touches other environments.' },
              { icon: Zap, title: 'Autonomous', desc: 'Handles scheduling, inventory, ordering, and customer comms. Only asks you for big decisions.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <div className="p-3 rounded-lg w-fit mb-4" style={{ backgroundColor: `${accentColor}20` }}>
                    <Icon className="w-6 h-6" style={{ color: accentColor }} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4" style={{ backgroundColor: '#0B1F3B' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to deploy your AI employee?</h2>
          <p className="text-gray-400 mb-8">First 2 hours free. No credit card required to browse.</p>
          <Link
            href={`/onboarding?ref=${ref}`}
            className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{'\u{1F42D}'}</span>
            <span className="font-bold text-gray-900">{brand.display_name}</span>
            <span className="text-xs text-gray-400">Powered by KingMouse</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/marketplace" className="hover:text-gray-900">Marketplace</Link>
            <Link href={`/onboarding?ref=${ref}`} className="hover:text-gray-900">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
