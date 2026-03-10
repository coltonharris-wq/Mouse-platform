'use client';

import { useEffect, useState } from 'react';
import { getAuthHeaders } from '@/lib/admin-auth';
import Link from 'next/link';
import { Activity, Users, Store, DollarSign, Cpu, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface OverviewStats {
  totalCustomers: number;
  totalResellers: number;
  totalProfiles: number;
  activeEmployees: number;
  totalEmployeesHired: number;
  planDistribution: Record<string, number>;
  systemHealth: {
    supabase: string;
    anthropic: string;
    backend: string;
  };
  recentCustomers: any[];
  recentResellers: any[];
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    teal: 'bg-mouse-teal/10 border-mouse-teal/20 text-mouse-teal',
  };
  return (
    <div className={`rounded-xl border p-6 ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5" />
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function HealthIndicator({ label, status }: { label: string; status: string }) {
  const isGood = status === 'connected' || status === 'ok';
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        {isGood ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ${isGood ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/overview', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-medium">Failed to load overview</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <span className="text-sm text-gray-400">Live data from Supabase + Stripe</span>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Customers" value={stats.totalCustomers} icon={Users} color="blue" />
            <StatCard label="Total Resellers" value={stats.totalResellers} icon={Store} color="green" />
            <StatCard label="AI Employees Hired" value={stats.totalEmployeesHired} icon={Cpu} color="teal" />
            <StatCard label="Active Employees" value={stats.activeEmployees} icon={Activity} color="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* System Health */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                System Health
              </h2>
              <div className="divide-y">
                <HealthIndicator label="Supabase" status={stats.systemHealth.supabase} />
                <HealthIndicator label="Anthropic API" status={stats.systemHealth.anthropic} />
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h2>
              <div className="space-y-3">
                {Object.entries(stats.planDistribution).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{plan}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.max(5, (count / Math.max(stats.totalCustomers, 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(stats.planDistribution).length === 0 && (
                  <p className="text-gray-400 italic">No customers yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Customers */}
          {stats.recentCustomers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Customers</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-3 font-medium">Company</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Plan</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.recentCustomers.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">{c.company_name || '—'}</td>
                        <td className="py-3 text-gray-600">{c.email}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                            {c.plan_tier}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Resellers */}
          {stats.recentResellers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Resellers</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Stripe</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.recentResellers.map((r: any) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">{r.name}</td>
                        <td className="py-3 text-gray-600">{r.email}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            r.stripe_account_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {r.stripe_account_status || (r.stripe_account_id ? 'pending' : '—')}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/admin/customers" className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900">Customers</h3>
              <p className="text-sm text-gray-500 mt-1">View and manage customer accounts</p>
            </Link>
            <Link href="/admin/resellers" className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900">Resellers</h3>
              <p className="text-sm text-gray-500 mt-1">Manage reseller partners</p>
            </Link>
            <Link href="/admin/chat" className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900">King Mouse</h3>
              <p className="text-sm text-gray-500 mt-1">AI orchestrator chat</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
