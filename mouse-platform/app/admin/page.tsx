'use client';

import Sidebar from '../../components/layout/Sidebar';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  Shield,
  Activity
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Total Revenue', value: '$2.4M', change: '+18.2%', icon: DollarSign },
  { label: 'Active Customers', value: '1,247', change: '+124', icon: Users },
  { label: 'Active Resellers', value: '86', change: '+12', icon: TrendingUp },
  { label: 'AI Employees', value: '3,842', change: '+456', icon: Activity },
];

const recentActivity = [
  { id: '1', event: 'New customer signup', user: 'TechFlow Inc', time: '2 min ago', type: 'success' },
  { id: '2', event: 'Reseller commission paid', user: 'Keyboard Partners', time: '15 min ago', type: 'info' },
  { id: '3', event: 'Security alert resolved', user: 'System', time: '1 hour ago', type: 'warning' },
  { id: '4', event: 'Enterprise plan upgrade', user: 'DataCore Labs', time: '2 hours ago', type: 'success' },
];

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="admin" />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">Overview of platform performance and metrics</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <stat.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-gray-900">{activity.event}</div>
                      <div className="text-sm text-gray-600">{activity.user}</div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/customers" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <Users className="w-6 h-6 text-blue-600 mb-2" />
                  <div className="font-medium text-gray-900">Customers</div>
                  <div className="text-sm text-gray-600">Manage all customers</div>
                </Link>
                <Link href="/admin/resellers" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                  <div className="font-medium text-gray-900">Resellers</div>
                  <div className="text-sm text-gray-600">Manage reseller network</div>
                </Link>
                <Link href="/admin/reports" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <DollarSign className="w-6 h-6 text-purple-600 mb-2" />
                  <div className="font-medium text-gray-900">Revenue</div>
                  <div className="text-sm text-gray-600">View financial reports</div>
                </Link>
                <Link href="/admin/security" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <Shield className="w-6 h-6 text-red-600 mb-2" />
                  <div className="font-medium text-gray-900">Security</div>
                  <div className="text-sm text-gray-600">View security logs</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
