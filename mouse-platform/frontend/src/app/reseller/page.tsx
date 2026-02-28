'use client';

import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Award,
  Copy,
  Share2,
  Package
} from 'lucide-react';

export default function ResellerPage() {
  const stats = [
    { label: 'Total Clients', value: '47', icon: Users, color: 'text-blue-400' },
    { label: 'Monthly Commission', value: '$3,456', icon: DollarSign, color: 'text-green-400' },
    { label: 'Active Referrals', value: '23', icon: TrendingUp, color: 'text-yellow-400' },
    { label: 'Total Earnings', value: '$28,901', icon: Award, color: 'text-purple-400' },
  ];

  const referralLink = 'https://app.mouseplatform.com/?ref=RESELLER123';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Reseller Dashboard</h2>
        <p className="text-gray-400">Manage your clients and track your commissions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="bg-gradient-to-r from-mouse-teal/20 to-accent-purple/20 border border-mouse-teal/30 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Your Referral Link</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-300"
          />
          <button className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white rounded-lg hover:bg-mouse-teal-dark transition-colors">
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg hover:bg-dark-bg-tertiary transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-mouse-teal" />
            <h3 className="text-lg font-semibold text-white">Client Management</h3>
          </div>
          <div className="space-y-3">
            <a href="/reseller/clients" className="block p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">View All Clients</span>
                <Users className="w-4 h-4 text-gray-500" />
              </div>
            </a>
            <a href="/reseller/clients/new" className="block p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Add New Client</span>
                <span className="text-mouse-teal">+</span>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-accent-purple" />
            <h3 className="text-lg font-semibold text-white">Commission Overview</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
              <span className="text-gray-400">Commission Rate</span>
              <span className="text-green-400 font-medium">20%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
              <span className="text-gray-400">This Month</span>
              <span className="text-white font-medium">$3,456</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
              <span className="text-gray-400">Pending Payout</span>
              <span className="text-yellow-400 font-medium">$890</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
