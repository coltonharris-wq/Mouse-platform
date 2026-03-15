'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Search, LayoutGrid, Columns3, Wallet, UserPlus, Crown, Zap, ArrowRight } from 'lucide-react';

export default function ResellerLandingPage() {
  const [customers, setCustomers] = useState(10);
  const [hours, setHours] = useState(40);
  const [rate, setRate] = useState(7.48);
  const wholesale = 4.98;
  const monthlyProfit = customers * hours * (rate - wholesale);

  return (
    <div style={{ backgroundColor: '#0a0a14', color: '#fff', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-7 h-7" style={{ color: '#F07020' }} />
          <span className="text-xl font-bold">Mouse</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(240,112,32,0.2)', color: '#F07020' }}>
            Reseller
          </span>
        </div>
        <Link
          href="/reseller-signup"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          style={{ backgroundColor: '#F07020', color: '#fff' }}
        >
          Apply Now
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Sell AI employees.<br />
          <span style={{ color: '#F07020' }}>Keep the markup.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
          Buy at $4.98/hr. Sell for up to $8.98/hr. Keep every penny of the difference.
          Your own AI sales assistant finds leads, writes scripts, and closes deals for you.
        </p>

        {/* Earnings Calculator */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-lg mx-auto backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-6">Earnings Calculator</h3>

          <div className="space-y-5 text-left">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Customers</span>
                <span className="font-semibold">{customers}</span>
              </div>
              <input type="range" min={1} max={50} value={customers} onChange={(e) => setCustomers(Number(e.target.value))}
                className="w-full accent-orange-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Avg hours/customer/month</span>
                <span className="font-semibold">{hours}h</span>
              </div>
              <input type="range" min={10} max={160} step={5} value={hours} onChange={(e) => setHours(Number(e.target.value))}
                className="w-full accent-orange-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Your rate</span>
                <span className="font-semibold">${rate.toFixed(2)}/hr</span>
              </div>
              <input type="range" min={4.98} max={8.98} step={0.25} value={rate} onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-orange-500" />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-gray-400 mb-1">Your monthly profit</p>
            <p className="text-4xl font-extrabold" style={{ color: '#1D9E75' }}>
              ${monthlyProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ${(rate - wholesale).toFixed(2)} margin x {customers} customers x {hours}h
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Sign up free', desc: 'Create your reseller account in 2 minutes. No fees, no risk.' },
            { step: '2', title: 'Set your price', desc: 'Choose your hourly rate between $4.98 and $8.98. You keep the difference.' },
            { step: '3', title: 'Find customers', desc: 'Use King Mouse AI to find leads, write scripts, and close deals.' },
            { step: '4', title: 'Get paid instantly', desc: 'Commissions auto-calculated. Weekly payouts to your bank via Stripe.' },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
                style={{ backgroundColor: 'rgba(240,112,32,0.15)', color: '#F07020' }}>
                {s.step}
              </div>
              <h3 className="font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">What you get</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Crown, title: 'King Mouse AI', desc: 'Your personal sales assistant. Finds leads, writes cold call scripts, listens in on calls.' },
            { icon: Search, title: 'OP Lead Finder', desc: 'Revenue data, gatekeeper intel, pain points, word-for-word sales scripts for every lead.' },
            { icon: LayoutGrid, title: '150+ Niche Demos', desc: 'Show any prospect their exact dashboard on a live call. Pizza shop, dentist, roofer — all ready.' },
            { icon: Columns3, title: 'Pipeline Tracker', desc: 'Kanban board for your deals. King Mouse auto-follows up on stale ones.' },
            { icon: Wallet, title: 'Instant Payouts', desc: 'Weekly Stripe deposits every Friday. See your earnings in real time.' },
            { icon: UserPlus, title: '1-Click Invite', desc: 'Send a branded invite at YOUR price. Customer signs up, you earn the markup forever.' },
          ].map((card) => (
            <div key={card.title} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <card.icon className="w-8 h-8 mb-4" style={{ color: '#F07020' }} />
              <h3 className="font-bold mb-2">{card.title}</h3>
              <p className="text-sm text-gray-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="rounded-2xl p-12" style={{ backgroundColor: 'rgba(240,112,32,0.08)', border: '1px solid rgba(240,112,32,0.2)' }}>
          <h2 className="text-3xl font-bold mb-4">Ready to start selling?</h2>
          <p className="text-gray-400 mb-8">Free to join. No inventory. No risk. Just markup and profit.</p>
          <Link
            href="/reseller-signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F07020' }}
          >
            Apply to become a reseller
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-600">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-4 h-4" style={{ color: '#F07020' }} />
          <span>Mouse Platform</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Mouse Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
