'use client';

import { 
  Users, 
  ShoppingCart, 
  Settings, 
  BarChart3, 
  Shield,
  Activity,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function AdminPage() {
  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'text-blue-400' },
    { label: 'Total Orders', value: '$45,678', icon: ShoppingCart, color: 'text-green-400' },
    { label: 'Active Sessions', value: '89', icon: Activity, color: 'text-yellow-400' },
    { label: 'Revenue', value: '$12,345', icon: DollarSign, color: 'text-purple-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h2>
        <p className="text-gray-400">Manage your platform and monitor key metrics</p>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-mouse-teal" />
            <h3 className="text-lg font-semibold text-white">Platform Management</h3>
          </div>
          <div className="space-y-3">
            <a href="/admin/users" className="block p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Manage Users</span>
                <Users className="w-4 h-4 text-gray-500" />
              </div>
            </a>
            <a href="/admin/orders" className="block p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">View Orders</span>
                <ShoppingCart className="w-4 h-4 text-gray-500" />
              </div>
            </a>
            <a href="/admin/settings" className="block p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Platform Settings</span>
                <Settings className="w-4 h-4 text-gray-500" />
              </div>
            </a>
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-accent-purple" />
            <h3 className="text-lg font-semibold text-white">Analytics Overview</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
              <span className="text-gray-400">Growth Rate</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">+23%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
              <span className="text-gray-400">User Retention</span>
              <span className="text-white font-medium">87%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
              <span className="text-gray-400">Avg. Session</span>
              <span className="text-white font-medium">12m 34s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
