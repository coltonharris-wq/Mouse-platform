'use client';

import Link from 'next/link';
import { Crown, CheckCircle2, Search, Columns3, UserPlus, LayoutGrid, DollarSign, Wallet } from 'lucide-react';

export default function ResellerWelcomePage() {
  const checklist = [
    { icon: Crown, label: 'King Mouse AI sales assistant', desc: 'Ready to find leads and write scripts' },
    { icon: Search, label: 'Lead Finder with intel', desc: 'Revenue data, gatekeeper info, pain points' },
    { icon: Columns3, label: 'Pipeline tracker', desc: 'Kanban board to manage your deals' },
    { icon: UserPlus, label: '1-click customer invites', desc: 'Send branded signup links at your price' },
    { icon: LayoutGrid, label: '150+ niche demos', desc: 'Show prospects their exact dashboard' },
    { icon: DollarSign, label: 'Commission tracking', desc: 'Real-time earnings for every customer' },
    { icon: Wallet, label: 'Weekly payouts', desc: 'Direct to your bank every Friday' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0a0a14' }}>
      <div className="w-full max-w-lg text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'rgba(240,112,32,0.15)' }}>
            <Crown className="w-10 h-10" style={{ color: '#F07020' }} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Welcome, Reseller!</h1>
          <p className="text-gray-400">Your portal is set up and ready to go. Here's what's waiting for you:</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
          <div className="space-y-4">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#1D9E75' }} />
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/reseller"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#F07020' }}
        >
          Open My Dashboard
        </Link>
      </div>
    </div>
  );
}
