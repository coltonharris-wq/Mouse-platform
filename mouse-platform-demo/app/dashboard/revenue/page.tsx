"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Loader2, BarChart3 } from "lucide-react";

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
  mrr: number;
  platformFee: number;
  usageCost: number;
  netMargin: number;
  charges: { date: string; amount: number; status: string; description: string }[];
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRevenue() {
      try {
        const res = await fetch("/api/admin/revenue");
        if (res.ok) {
          const json = await res.json();
          const mrr = json.mrr || 0;
          const platformFee = Math.round(mrr * 0.12); // 12% platform fee
          const usageCost = json.usage_cost || 0;
          const netMargin = mrr - platformFee - usageCost;

          setData({
            mrr,
            platformFee,
            usageCost,
            netMargin,
            charges: (json.recent_charges || []).map((c: any) => ({
              date: c.created ? new Date(c.created * 1000).toLocaleDateString() : "—",
              amount: (c.amount || 0) / 100,
              status: c.status || "unknown",
              description: c.description || "Payment",
            })),
          });
        } else {
          setData({ mrr: 0, platformFee: 0, usageCost: 0, netMargin: 0, charges: [] });
        }
      } catch {
        setData({ mrr: 0, platformFee: 0, usageCost: 0, netMargin: 0, charges: [] });
      }
      setLoading(false);
    }
    loadRevenue();
  }, []);

  const marginPercent = data && data.mrr > 0 ? Math.round((data.netMargin / data.mrr) * 100) : 0;

  return (
    <div>
      <h1 className="text-xl font-bold text-mouse-navy mb-6">Revenue</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Gross MRR"
          value={data ? `$${data.mrr.toLocaleString()}` : "$0"}
          valueClassName="text-mouse-green"
          loading={loading}
        />
        <MetricCard
          label="Platform Fee (12%)"
          value={data ? `$${data.platformFee.toLocaleString()}` : "$0"}
          loading={loading}
        />
        <MetricCard
          label="Usage Cost"
          value={data ? `$${data.usageCost.toLocaleString()}` : "$0"}
          loading={loading}
        />
        <MetricCard
          label="Net Margin"
          value={data ? `$${data.netMargin.toLocaleString()}` : "$0"}
          sub={data?.mrr ? `${marginPercent}% margin` : undefined}
          valueClassName="text-mouse-green"
          loading={loading}
        />
      </div>

      {/* Recent Charges */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <h2 className="text-base font-semibold text-mouse-charcoal">
            Recent Charges
          </h2>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center">
            <Loader2 className="w-6 h-6 text-mouse-slate animate-spin mx-auto" />
          </div>
        ) : !data?.charges.length ? (
          <div className="px-6 py-12 text-center">
            <BarChart3 className="w-10 h-10 text-mouse-slate/40 mx-auto mb-3" />
            <p className="text-sm text-mouse-slate">No charges yet</p>
            <p className="text-xs text-mouse-slate/70 mt-1">Revenue will appear here as customers are billed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mouse-offwhite text-left">
                  <th className="px-6 py-3 text-mouse-slate font-medium">Date</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Description</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Amount</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mouse-slate/10">
                {data.charges.map((charge, i) => (
                  <tr key={i} className="hover:bg-mouse-offwhite transition-colors">
                    <td className="px-6 py-4 text-mouse-charcoal">{charge.date}</td>
                    <td className="px-6 py-4 text-mouse-charcoal">{charge.description}</td>
                    <td className="px-6 py-4 font-medium text-mouse-green">
                      ${charge.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          charge.status === "succeeded"
                            ? "bg-green-100 text-green-700"
                            : charge.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {charge.status}
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
