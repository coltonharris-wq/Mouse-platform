"use client";

import { useState } from "react";
import { resellers } from "@/lib/seed-data";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    trial: "bg-teal-100 text-teal-700",
    pending: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function StripeStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    connected: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    disconnected: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function AdminResellersPage() {
  const [search, setSearch] = useState("");

  const filtered = resellers.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mouse-navy">Resellers</h1>
        <button className="bg-mouse-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          Add Reseller
        </button>
      </div>

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <input
            type="text"
            placeholder="Search resellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal placeholder-mouse-slate focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite text-left">
                <th className="px-6 py-3 text-mouse-slate font-medium">Reseller Name</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">MRR</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Customers</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Employees</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Stripe Status</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-mouse-slate">
                    No resellers found.
                  </td>
                </tr>
              ) : (
                filtered.map((reseller) => (
                  <tr key={reseller.id} className="hover:bg-mouse-offwhite transition-colors">
                    <td className="px-6 py-4 font-medium text-mouse-charcoal">
                      {reseller.name}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={reseller.status} />
                    </td>
                    <td className="px-6 py-4 font-medium text-mouse-green">
                      {reseller.mrr > 0 ? `$${reseller.mrr.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-mouse-charcoal">{reseller.customers}</td>
                    <td className="px-6 py-4 text-mouse-charcoal">—</td>
                    <td className="px-6 py-4">
                      <StripeStatusBadge status={reseller.stripeStatus} />
                    </td>
                    <td className="px-6 py-4 text-mouse-slate">
                      {new Date(reseller.joinedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
