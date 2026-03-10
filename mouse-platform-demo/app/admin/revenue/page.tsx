"use client";

import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/lib/admin-auth";
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from "lucide-react";

interface RevenueData {
  mrr: number;
  totalGross: number;
  platformFees: number;
  activeSubscriptions: number;
  recentCharges: any[];
  balanceAvailable: number;
  message?: string;
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revenue", { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">Failed to load revenue data</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mouse-navy">Revenue</h1>
        <span className="text-sm text-gray-400">Live from Stripe</span>
      </div>

      {data.message && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">{data.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <p className="text-sm text-gray-500">MRR</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">${data.mrr.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-gray-500">Total Gross</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">${data.totalGross.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-mouse-teal" />
            <p className="text-sm text-gray-500">Active Subscriptions</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.activeSubscriptions || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-teal-500" />
            <p className="text-sm text-gray-500">Balance Available</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">${(data.balanceAvailable || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Charges */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Recent Charges</h2>
        </div>
        {(!data.recentCharges || data.recentCharges.length === 0) ? (
          <div className="px-6 py-12 text-center">
            <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No charges yet</p>
            <p className="text-gray-400 text-sm mt-1">Revenue will appear here as customers subscribe.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-gray-500 font-medium">Date</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Amount</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.recentCharges.map((charge: any) => (
                <tr key={charge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-600">{new Date(charge.created).toLocaleDateString()}</td>
                  <td className="px-6 py-3 font-medium text-green-600">${charge.amount.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      charge.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {charge.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{charge.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
