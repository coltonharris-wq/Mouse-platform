"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/lib/admin-auth";
import {
  Activity,
  AlertTriangle,
  DollarSign,
  Server,
  Zap,
  TrendingUp,
  Volume2,
  Phone,
  MessageSquare,
  RefreshCw,
  Users,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const HOURLY_RATE = 4.98;

interface ServiceOverview {
  event_type: string;
  event_count: number;
  total_vendor_cost: number;
  total_hours_billed: number;
  total_revenue: number;
  total_margin: number;
}

interface CustomerBreakdown {
  customer_id: string;
  customer_name: string;
  event_count: number;
  total_vendor_cost: number;
  total_hours_charged: number;
  current_balance: number;
}

interface RecentEvent {
  id: string;
  customer_id: string;
  event_type: string;
  vendor_cost: number;
  work_hours_charged: number;
  margin_multiplier: number;
  created_at: string;
  metadata: Record<string, any>;
}

const SERVICE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  chat_opus:         { label: 'Anthropic Opus',   icon: MessageSquare, color: '#0F6B6E' },
  chat_sonnet:       { label: 'Anthropic Sonnet', icon: MessageSquare, color: '#06B6D4' },
  chat_kimi:         { label: 'Kimi K2.5',        icon: MessageSquare, color: '#8B5CF6' },
  voice_elevenlabs:  { label: 'ElevenLabs',       icon: Volume2,      color: '#EC4899' },
  vm_orgo:           { label: 'Orgo VMs',         icon: Server,       color: '#14B8A6' },
  phone_twilio:      { label: 'Twilio',           icon: Phone,        color: '#F59E0B' },
  phone_number:      { label: 'Phone Numbers',    icon: Phone,        color: '#6366F1' },
  image_gen:         { label: 'Image Gen',        icon: Zap,          color: '#10B981' },
  deployment:        { label: 'Deployments',      icon: Activity,     color: '#3B82F6' },
};

export default function AdminUsagePage() {
  const [overview, setOverview] = useState<ServiceOverview[]>([]);
  const [customers, setCustomers] = useState<CustomerBreakdown[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/usage-events?admin=true', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOverview(data.overview || []);
        setCustomers(data.customers || []);
        setRecentEvents(data.recentEvents || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin usage:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalVendorCost = overview.reduce((s, o) => s + Number(o.total_vendor_cost), 0);
  const totalRevenue = overview.reduce((s, o) => s + Number(o.total_revenue), 0);
  const totalMargin = overview.reduce((s, o) => s + Number(o.total_margin), 0);
  const totalHoursBilled = overview.reduce((s, o) => s + Number(o.total_hours_billed), 0);
  const marginPercent = totalRevenue > 0 ? Math.round((totalMargin / totalRevenue) * 100) : 0;

  // Chart data for per-service vendor cost
  const chartData = overview.map(o => ({
    name: SERVICE_META[o.event_type]?.label || o.event_type,
    vendorCost: Number(o.total_vendor_cost).toFixed(2),
    revenue: Number(o.total_revenue).toFixed(2),
    margin: Number(o.total_margin).toFixed(2),
  }));

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
        <button onClick={() => { setRefreshing(true); fetchData(); }} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-mouse-teal transition-colors">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <p className="text-sm text-gray-500">Vendor Costs</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalVendorCost.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">What we pay this month</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-mouse-teal" />
            <p className="text-sm text-gray-500">Hours Billed</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalHoursBilled.toFixed(1)}</p>
          <p className="text-xs text-gray-400 mt-1">Work hours charged</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <p className="text-sm text-gray-500">Revenue</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{totalHoursBilled.toFixed(1)} hrs × ${HOURLY_RATE}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            <p className="text-sm text-gray-500">Margin</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">${totalMargin.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{marginPercent}% margin</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-gray-500">Active Customers</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{customers.filter(c => c.event_count > 0).length}</p>
          <p className="text-xs text-gray-400 mt-1">with usage this month</p>
        </div>
      </div>

      {/* Per-Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Cost per Service</h2>
          {overview.length > 0 ? (
            <div className="space-y-3">
              {overview.map(o => {
                const meta = SERVICE_META[o.event_type] || { label: o.event_type, color: '#94A3B8', icon: Zap };
                const Icon = meta.icon;
                return (
                  <div key={o.event_type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${meta.color}20` }}>
                        <Icon size={16} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{meta.label}</p>
                        <p className="text-xs text-gray-400">{o.event_count} calls</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${Number(o.total_vendor_cost).toFixed(2)}</p>
                      <p className="text-xs text-emerald-500">→ ${Number(o.total_revenue).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No usage data yet</p>
            </div>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Revenue vs Cost</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: any) => `$${v}`} />
                  <Bar dataKey="vendorCost" fill="#EF4444" name="Vendor Cost" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Per-Customer Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Customer Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Events</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vendor Cost</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hours Used</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No customers yet</td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.customer_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{c.customer_name}</td>
                    <td className="px-6 py-4 text-gray-500">{c.event_count}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">${Number(c.total_vendor_cost).toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">{Number(c.total_hours_charged).toFixed(1)} hrs</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${Number(c.current_balance) < 5 ? 'text-red-500' : Number(c.current_balance) < 20 ? 'text-orange-500' : 'text-green-500'}`}>
                        {Number(c.current_balance).toFixed(1)} hrs
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Feed */}
      {recentEvents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {recentEvents.slice(0, 20).map(e => {
              const meta = SERVICE_META[e.event_type] || { label: e.event_type, color: '#94A3B8', icon: Zap };
              const Icon = meta.icon;
              return (
                <div key={e.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${meta.color}20` }}>
                      <Icon size={12} style={{ color: meta.color }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{meta.label}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(e.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Cost: ${Number(e.vendor_cost).toFixed(4)}</p>
                    <p className="text-sm font-semibold text-orange-500">-{Number(e.work_hours_charged).toFixed(2)} hrs</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Integration Checklist */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Integration Status</h2>
        <div className="space-y-3">
          {[
            { label: 'Supabase usage_events table', done: true },
            { label: 'Billing middleware (usage-tracker)', done: true },
            { label: 'King Mouse chat billing', done: true },
            { label: 'Anthropic API cost tracking', done: true },
            { label: 'Auto-stop at zero balance', done: true },
            { label: 'ElevenLabs voice cost tracking', done: false },
            { label: 'Orgo VM cost tracking', done: false },
            { label: 'Twilio billing', done: false },
            { label: 'Stripe webhook → auto-credit hours', done: false },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 ${item.done ? '' : 'opacity-50'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.done ? 'border-green-500' : 'border-gray-300'}`}>
                {item.done && <div className="w-2 h-2 bg-green-500 rounded-full" />}
              </div>
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
