'use client';

import Sidebar from '../../components/layout/Sidebar';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Percent,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const stats = [
  { 
    label: 'Total Earnings', 
    value: '$12,450', 
    change: '+23.5%', 
    trend: 'up',
    icon: DollarSign 
  },
  { 
    label: 'Active Customers', 
    value: '24', 
    change: '+5', 
    trend: 'up',
    icon: Users 
  },
  { 
    label: 'Commission Rate', 
    value: '40%', 
    change: 'Fixed', 
    trend: 'neutral',
    icon: Percent 
  },
  { 
    label: 'Pending Payout', 
    value: '$3,200', 
    change: 'Due Feb 28', 
    trend: 'neutral',
    icon: Wallet 
  },
];

const recentCustomers = [
  { id: '1', name: 'TechFlow Inc', plan: 'Pro', mrr: 299, commission: 119.60, status: 'active', joined: 'Jan 15' },
  { id: '2', name: 'DataCore Labs', plan: 'Enterprise', mrr: 999, commission: 399.60, status: 'active', joined: 'Jan 12' },
  { id: '3', name: 'CloudFirst', plan: 'Basic', mrr: 99, commission: 39.60, status: 'active', joined: 'Jan 8' },
  { id: '4', name: 'InnovateTech', plan: 'Pro', mrr: 299, commission: 119.60, status: 'trial', joined: 'Jan 5' },
];

const commissionHistory = [
  { month: 'January 2026', sales: 8450, commission: 3380, customers: 4 },
  { month: 'December 2025', sales: 6200, commission: 2480, customers: 3 },
  { month: 'November 2025', sales: 7800, commission: 3120, customers: 3 },
];

export default function ResellerDashboard() {
  const [copied, setCopied] = useState(false);
  const referralLink = 'https://mouse.ai/signup?ref=KEYBOARD2026';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="reseller" />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reseller Dashboard</h1>
              <p className="text-gray-600">Manage your customers and track commissions</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Commission Rate:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                40%
              </span>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Your Referral Link</h2>
                <p className="text-blue-100 text-sm">Share this link to earn 40% commission on all referred customers</p>
              </div>
              <div className="flex items-center gap-3">
                <code className="bg-white/20 px-4 py-2 rounded-lg text-sm">{referralLink}</code>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <stat.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  {stat.trend !== 'neutral' && (
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Recent Customers */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Customers</h2>
                  <Link href="/reseller/customers" className="text-blue-600 hover:text-blue-700 text-sm">
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {recentCustomers.map((customer) => (
                  <div key={customer.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.plan} Plan • Joined {customer.joined}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.status}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-sm">
                      <span className="text-gray-600">MRR: ${customer.mrr}</span>
                      <span className="text-green-600 font-medium">+${customer.commission.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commission History */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Commission History</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {commissionHistory.map((month) => (
                  <div key={month.month} className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{month.month}</span>
                      <span className="text-green-600 font-semibold">+${month.commission.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Sales: ${month.sales.toLocaleString()}</span>
                      <span>{month.customers} new customers</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Earned</span>
                  <span className="text-2xl font-bold text-green-600">$8,980</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
