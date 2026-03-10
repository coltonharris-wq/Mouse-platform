"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Loader2, BarChart3 } from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

function MetricCard({
  label,
  value,
  sub,
  valueClassName,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClassName?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 p-6 shadow-sm">
      <p className="text-sm text-mouse-slate font-medium mb-2">{label}</p>
      {loading ? (
        <div className="h-8 flex items-center">
          <Loader2 className="w-5 h-5 text-mouse-slate animate-spin" />
        </div>
      ) : (
        <>
          <p className={`text-2xl font-bold ${valueClassName ?? "text-mouse-charcoal"}`}>
            {value}
          </p>
          {sub && <p className="text-xs text-mouse-slate mt-1">{sub}</p>}
        </>
      )}
    </div>
  );
}

interface RevenueData {
  totalEarned: number;
  totalRevenue: number;
  totalCommissions: number;
  customerCount: number;
  recentCommissions: { amount: number; status: string; createdAt: string }[];
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRevenue() {
      try {
        const res = await fetchWithAuth("/api/reseller/revenue");
        if (res.ok) {
          const json = await res.json();
          setData({
            totalEarned: json.totalEarned || 0,
            totalRevenue: json.totalRevenue || 0,
            totalCommissions: json.totalCommissions || 0,
            customerCount: json.customerCount || 0,
            recentCommissions: json.recentCommissions || [],
          });
        } else {
          setData({ totalEarned: 0, totalRevenue: 0, totalCommissions: 0, customerCount: 0, recentCommissions: [] });
        }
      } catch {
        setData({ totalEarned: 0, totalRevenue: 0, totalCommissions: 0, customerCount: 0, recentCommissions: [] });
      }
      setLoading(false);
    }
    loadRevenue();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-mouse-navy mb-6">Revenue</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Earned"
          value={data ? `$${data.totalEarned.toLocaleString()}` : "$0"}
          valueClassName="text-mouse-green"
          loading={loading}
        />
        <MetricCard
          label="Total Revenue"
          value={data ? `$${data.totalRevenue.toLocaleString()}` : "$0"}
          loading={loading}
        />
        <MetricCard
          label="Total Commissions"
          value={data ? `$${data.totalCommissions.toLocaleString()}` : "$0"}
          loading={loading}
        />
        <MetricCard
          label="Customers"
          value={data ? data.customerCount.toLocaleString() : "0"}
          loading={loading}
        />
      </div>

      {/* Recent Commissions */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <h2 className="text-base font-semibold text-mouse-charcoal">
            Recent Commissions
          </h2>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center">
            <Loader2 className="w-6 h-6 text-mouse-slate animate-spin mx-auto" />
          </div>
        ) : !data?.recentCommissions?.length ? (
          <div className="px-6 py-12 text-center">
            <BarChart3 className="w-10 h-10 text-mouse-slate/40 mx-auto mb-3" />
            <p className="text-sm text-mouse-slate">No commissions yet</p>
            <p className="text-xs text-mouse-slate/70 mt-1">Commissions will appear here as your customers pay.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mouse-offwhite text-left">
                  <th className="px-6 py-3 text-mouse-slate font-medium">Date</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Amount</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mouse-slate/10">
                {data.recentCommissions.map((c, i) => (
                  <tr key={i} className="hover:bg-mouse-offwhite transition-colors">
                    <td className="px-6 py-4 text-mouse-charcoal">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-mouse-green">
                      ${c.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          c.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : c.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
