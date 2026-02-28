'use client';

import { 
  Bot, 
  Play, 
  Pause, 
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Monitor,
  ListTodo,
  CreditCard,
  Zap,
  TrendingUp,
  DollarSign,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import EmployeeMarketplace from '../../components/EmployeeMarketplace';
import { useWorkHours } from '../../context/WorkHoursContext';
import { useSecurity } from '../../context/SecurityContext';

const TIME_SAVED_PER_TASK = 0.25; // 15 minutes per task
const COST_PER_HOUR = 25; // $25/hour for human equivalent

export default function CustomerDashboard() {
  const { balance, totalUsed, transactions, getHourlyRate, getCostBreakdown } = useWorkHours();
  const { events, isGuardrailsActive, threatsBlocked, lastScan } = useSecurity();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'hours' | 'security'>('overview');

  const tasksCompleted = 5595;
  const timeSaved = tasksCompleted * TIME_SAVED_PER_TASK;
  const moneySaved = timeSaved * COST_PER_HOUR;

  const recentTransactions = transactions.slice(0, 5);
  const recentEvents = events.slice(0, 5);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Customer Dashboard</h1>
            <p className="text-gray-600">Manage your AI employees and track performance</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Work Hours Balance</p>
              <p className="text-2xl font-bold text-[#1e3a5f]">{balance.toFixed(1)}h</p>
            </div>
            <Link 
              href="/dashboard/customer/billing"
              className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f]"
            >
              Buy Hours
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'employees', label: 'Employees', icon: Bot },
            { id: 'hours', label: 'Work Hours', icon: Clock },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#1e3a5f] border-b-2 border-[#1e3a5f]'
                  : 'text-gray-600 hover:text-[#1e3a5f]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* ROI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Time Saved</p>
                    <p className="text-2xl font-bold text-[#1e3a5f]">{timeSaved.toFixed(0)}h</p>
                  </div>
                  <div className="p-2 bg-[#1e3a5f]/10 rounded-lg">
                    <Clock className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">+12% from last month</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Money Saved</p>
                    <p className="text-2xl font-bold text-green-600">${moneySaved.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">+18% from last month</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasks Completed</p>
                    <p className="text-2xl font-bold text-[#1e3a5f]">{tasksCompleted.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-[#1e3a5f]/10 rounded-lg">
                    <ListTodo className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">+245 today</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="text-2xl font-bold text-[#1e3a5f]">94%</p>
                  </div>
                  <div className="p-2 bg-[#1e3a5f]/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">+2% from last month</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Work Hours Status */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">Work Hours Usage</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Current Balance</span>
                      <span className="font-semibold text-[#1e3a5f]">{balance.toFixed(1)}h</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1e3a5f] rounded-full"
                        style={{ width: `${(balance / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Used This Month</span>
                      <span className="font-semibold text-gray-900">{totalUsed.toFixed(1)}h</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min((totalUsed / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Cost per hour: <span className="font-semibold">${getHourlyRate()}</span>
                  </p>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">Security Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Guardrails</span>
                    <span className={`flex items-center gap-1 text-sm font-medium ${isGuardrailsActive ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${isGuardrailsActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      {isGuardrailsActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Threats Blocked</span>
                    <span className="font-semibold text-[#1e3a5f]">{threatsBlocked}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Scan</span>
                    <span className="text-sm text-gray-500">
                      {new Date(lastScan).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <Link 
                  href="#"
                  onClick={() => setActiveTab('security')}
                  className="mt-4 block text-center py-2 text-[#1e3a5f] hover:bg-[#1e3a5f]/5 rounded-lg transition-colors"
                >
                  View Security Details
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <EmployeeMarketplace />
        )}

        {/* Work Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">Recent Transactions</h3>
                <div className="divide-y divide-gray-100">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{tx.description}</p>
                        {tx.employeeName && (
                          <p className="text-sm text-gray-500">Employee: {tx.employeeName}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">Cost Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(getCostBreakdown()).map(([key, cost]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium">{cost}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">Security Events</h3>
                <div className="divide-y divide-gray-100">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            event.severity === 'critical' ? 'bg-red-500' :
                            event.severity === 'high' ? 'bg-orange-500' :
                            event.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <span className="font-medium text-gray-900">{event.message}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {event.user && (
                        <p className="text-sm text-gray-500 ml-4">User: {event.user}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">Protection Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Anti-Clone</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rate Limiting</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Audit Logging</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Guardrails</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
