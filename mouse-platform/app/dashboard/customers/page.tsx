"use client";

import Link from "next/link";
import { useState } from "react";
import { customers } from "@/lib/seed-data";

function HealthBadge({ health }: { health: string }) {
  const styles: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    green: "Healthy",
    yellow: "Warning",
    red: "Critical",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[health] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          health === "green"
            ? "bg-green-500"
            : health === "yellow"
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
      />
      {labels[health] ?? health}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    Enterprise: "bg-purple-100 text-purple-700",
    Growth: "bg-blue-100 text-blue-700",
    Starter: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[plan] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {plan}
    </span>
  );
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) =>
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mouse-navy">Customers</h1>
        <button className="bg-mouse-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 text-sm border border-mouse-slate/30 rounded-lg text-mouse-charcoal placeholder-mouse-slate focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite text-left">
                <th className="px-6 py-3 text-mouse-slate font-medium">Company</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Plan</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">MRR</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Employees</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-mouse-slate">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-mouse-offwhite transition-colors">
                    <td className="px-6 py-4 font-medium text-mouse-charcoal">
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="hover:text-mouse-teal transition-colors"
                      >
                        {customer.company}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <PlanBadge plan={customer.plan} />
                    </td>
                    <td className="px-6 py-4 font-medium text-mouse-green">
                      ${customer.mrr.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-mouse-charcoal">{customer.employees}</td>
                    <td className="px-6 py-4">
                      <HealthBadge health={customer.health} />
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
