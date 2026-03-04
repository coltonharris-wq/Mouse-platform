"use client";

import { useState, useEffect } from "react";
import { Activity, AlertTriangle, DollarSign, Server, Zap, TrendingUp, ExternalLink } from "lucide-react";

interface UsageData {
  anthropicSpend: number;
  orgoSpend: number;
  twilioSpend: number;
  totalSpend: number;
  workHoursUsed: number;
  workHoursRemaining: number;
}

export default function AdminUsagePage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API billing integration coming in Part 5 (Work Hours Billing Engine)
    // For now, show placeholder with connection instructions
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mouse-navy">Usage & Costs</h1>
        <span className="text-sm text-gray-400">Part 5: Work Hours Billing Engine</span>
      </div>

      {/* Placeholder for real cost tracking */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <Zap className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-blue-900">Work Hours Billing Engine</h2>
            <p className="text-sm text-blue-700 mt-1">
              Real-time cost tracking per customer with margin calculations.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Vendor Costs</p>
                <p className="text-lg font-semibold text-blue-900">What we pay</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Marked Up</p>
                <p className="text-lg font-semibold text-blue-900">5-30x margin</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Work Hours</p>
                <p className="text-lg font-semibold text-blue-900">Customer sees</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-mouse-teal" />
            <p className="text-sm text-gray-500">Anthropic API</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-400 mt-1">Connect API key</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-gray-500">Orgo VMs</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-400 mt-1">Connect billing</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <p className="text-sm text-gray-500">Twilio</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-400 mt-1">Billing suspended</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <p className="text-sm text-gray-500">Total Margin</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-400 mt-1">Pending data</p>
        </div>
      </div>

      {/* Customer Usage Table Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Customer Usage</h2>
          <span className="text-xs text-gray-400">Real data coming in Part 5</span>
        </div>
        <div className="px-6 py-12 text-center">
          <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Usage tracking starting...</p>
          <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
            The Work Hours Billing Engine will track actual API costs per customer, 
            apply margin multipliers, and convert to work hours.
          </p>
        </div>
      </div>

      {/* Integration Checklist */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Integration Checklist</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <span className="text-sm text-gray-600">Supabase connection</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <span className="text-sm text-gray-600">Stripe billing</span>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            <span className="text-sm text-gray-600">Anthropic API cost tracking</span>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            <span className="text-sm text-gray-600">Orgo VM cost tracking</span>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            <span className="text-sm text-gray-600">Twilio billing (waiting on account)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
