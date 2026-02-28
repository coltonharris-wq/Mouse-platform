'use client';

import { 
  Bot, 
  Clock, 
  CreditCard, 
  MessageSquare, 
  Settings,
  TrendingUp,
  Shield,
  Zap,
  HeadphonesIcon
} from 'lucide-react';
import Link from 'next/link';

export default function PortalPage() {
  const stats = [
    { label: 'AI Work Hours', value: '45.5', icon: Clock, color: 'text-mouse-teal' },
    { label: 'Active Employees', value: '3', icon: Bot, color: 'text-accent-purple' },
    { label: 'Messages Sent', value: '128', icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Tasks Completed', value: '47', icon: Zap, color: 'text-yellow-400' },
  ];

  const employees = [
    { name: 'Sales Assistant', type: 'Sales', status: 'Active', hoursUsed: 12.5 },
    { name: 'Support Bot', type: 'Support', status: 'Active', hoursUsed: 8.3 },
    { name: 'Data Analyst', type: 'Analytics', status: 'Paused', hoursUsed: 5.2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Clean Eats</h2>
        <p className="text-gray-400">Manage your AI employees and track your usage</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Employees */}
        <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-mouse-teal" />
              <h3 className="text-lg font-semibold text-white">My AI Employees</h3>
            </div>
            <div className="flex gap-2">
              <Link href="/employees" className="text-mouse-teal hover:text-mouse-teal-light text-sm">
                View All
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/employees/new" className="text-mouse-teal hover:text-mouse-teal-light text-sm">
                Deploy New
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            {employees.map((employee, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-purple/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-accent-purple" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    employee.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {employee.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{employee.hoursUsed}h used</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-accent-purple" />
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Link href="/pricing" className="flex items-center justify-between p-3 bg-mouse-teal/20 rounded-lg hover:bg-mouse-teal/30 transition-colors">
                <span className="text-mouse-teal font-medium">Buy AI Work Hours</span>
                <CreditCard className="w-4 h-4 text-mouse-teal" />
              </Link>
              <Link href="/employees/new" className="flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
                <span className="text-gray-300">Deploy Employee</span>
                <Bot className="w-4 h-4 text-gray-500" />
              </Link>
              <Link href="/portal/support" className="flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
                <span className="text-gray-300">Get Support</span>
                <HeadphonesIcon className="w-4 h-4 text-gray-500" />
              </Link>
              <Link href="/portal/settings" className="flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
                <span className="text-gray-300">Account Settings</span>
                <Settings className="w-4 h-4 text-gray-500" />
              </Link>
            </div>
          </div>

          {/* Low Balance Warning */}
          <div className="bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/30 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-rose-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Running Low?</h4>
                <p className="text-sm text-gray-400 mb-3">You have 45.5 hours remaining. Consider purchasing more.</p>
                <Link href="/pricing" className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-medium">
                  Purchase Now
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
