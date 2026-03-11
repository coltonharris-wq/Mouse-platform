'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, MessageSquare, Activity, Zap } from 'lucide-react';

interface UsageData {
  plan: string;
  hours_included: number;
  hours_used: number;
  hours_remaining: number;
}

export default function DashboardPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = sessionStorage.getItem('customer_id') || 'demo';

    fetch(`/api/billing/usage?customer_id=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setUsage(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const hoursPercent = usage ? Math.min(100, (usage.hours_used / Math.max(1, usage.hours_included)) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-sm text-gray-500">
            {usage?.plan ? `${usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)} Plan` : 'Active'}
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Hours used */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Hours Used</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {usage?.hours_used?.toFixed(1) || '0'} <span className="text-lg text-gray-400 font-normal">/ {usage?.hours_included || 0}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${hoursPercent > 80 ? 'bg-red-500' : 'bg-teal-500'}`}
              style={{ width: `${hoursPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{usage?.hours_remaining?.toFixed(1) || '0'} hours remaining</p>
        </div>

        {/* VM Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">AI Employee</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-lg font-semibold text-gray-900">Running</span>
          </div>
          <p className="text-sm text-gray-500">KingMouse is working for you</p>
        </div>

        {/* Quick Chat */}
        <Link href="/dashboard/chat" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-teal-300 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Chat with KingMouse</h3>
          </div>
          <p className="text-sm text-gray-500">Ask anything or give instructions</p>
          <span className="text-teal-600 text-sm font-medium mt-2 inline-block">Open Chat &rarr;</span>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            Recent Activity
          </h2>
          <Link href="/dashboard/activity" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            View All
          </Link>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No recent activity yet</p>
            <p className="text-sm mt-1">KingMouse will log all actions here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
