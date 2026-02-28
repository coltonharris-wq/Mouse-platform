'use client';

import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  TrendingUp,
  Shield,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Total Revenue', value: '$2.4M', change: '+18.2%', icon: DollarSign, trend: 'up' },
  { label: 'Active Customers', value: '1,247', change: '+124', icon: Users, trend: 'up' },
  { label: 'Active Resellers', value: '86', change: '+12', icon: TrendingUp, trend: 'up' },
  { label: 'AI Employees', value: '3,842', change: '+456', icon: Activity, trend: 'up' },
];

const recentActivity = [
  { id: '1', event: 'New customer signup', user: 'TechFlow Inc', time: '2 min ago', type: 'success' },
  { id: '2', event: 'Reseller commission paid', user: 'Keyboard Partners', time: '15 min ago', type: 'info' },
  { id: '3', event: 'Security alert resolved', user: 'System', time: '1 hour ago', type: 'warning' },
  { id: '4', event: 'Enterprise plan upgrade', user: 'DataCore Labs', time: '2 hours ago', type: 'success' },
  { id: '5', event: 'New reseller approved', user: 'Cloud Solutions LLC', time: '3 hours ago', type: 'success' },
];

const topResellers = [
  { name: 'Keyboard Partners', customers: 45, revenue: '$145K', commission: '$58K' },
  { name: 'AI Consulting Group', customers: 32, revenue: '$98K', commission: '$39K' },
  { name: 'Tech Resellers Inc', customers: 28, revenue: '$87K', commission: '$35K' },
];

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of platform performance and metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-[#1e3a5f]/10 rounded-lg">
                  <stat.icon className="w-5 h-5 text-[#1e3a5f]" />
                </div>
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
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#1e3a5f]">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{activity.event}</div>
                        <div className="text-sm text-gray-600">{activity.user}</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link href="/dashboard/admin/customers" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Users className="w-5 h-5 text-[#1e3a5f]" />
                <div>
                  <div className="font-medium text-gray-900">Customers</div>
                  <div className="text-sm text-gray-600">Manage all customers</div>
                </div>
              </Link>
              <Link href="/dashboard/admin/resellers" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Resellers</div>
                  <div className="text-sm text-gray-600">Manage reseller network</div>
                </div>
              </Link>
              <Link href="/dashboard/admin/reports" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Revenue</div>
                  <div className="text-sm text-gray-600">View financial reports</div>
                </div>
              </Link>
              <Link href="/dashboard/admin/security" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Shield className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-gray-900">Security</div>
                  <div className="text-sm text-gray-600">View security logs</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Top Resellers */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#1e3a5f]">Top Resellers</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {topResellers.map((reseller, index) => (
              <div key={reseller.name} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{reseller.name}</div>
                    <div className="text-sm text-gray-600">{reseller.customers} customers</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{reseller.revenue}</div>
                  <div className="text-sm text-green-600">{reseller.commission} commission</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
