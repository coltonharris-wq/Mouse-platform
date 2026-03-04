"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import WorkHoursWidget from "@/components/WorkHoursWidget";
import { SecurityDashboardWidget } from "@/components/SecurityBadge";
import EmployeeHealthWidget from "@/components/EmployeeHealthWidget";
import SalesPipelineWidget from "@/components/SalesPipelineWidget";
import { Plus, Store, ArrowRight, Users, Loader2 } from "lucide-react";

function StatCard({
  label,
  value,
  valueClassName,
  loading,
}: {
  label: string;
  value: string | number;
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
        <p className={`text-2xl font-bold ${valueClassName ?? "text-mouse-charcoal"}`}>
          {value}
        </p>
      )}
    </div>
  );
}

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
    Enterprise: "bg-mouse-teal/10 text-mouse-teal",
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

interface DashboardStats {
  customerCount: number;
  mrr: number;
  activeEmployees: number;
  usageCost: number;
}

interface Customer {
  id: string;
  company: string;
  plan: string;
  mrr: number;
  employees: number;
  health: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch real customer data from Supabase via API
        const res = await fetch("/api/reseller/customers");
        if (res.ok) {
          const data = await res.json();
          const custs: Customer[] = (data.customers || []).map((c: any) => ({
            id: c.id,
            company: c.business_name || c.company_name || "Unknown",
            plan: c.plan || "Starter",
            mrr: c.mrr || 0,
            employees: c.employee_count || 0,
            health: c.health || "green",
          }));
          setCustomers(custs);
          setStats({
            customerCount: custs.length,
            mrr: custs.reduce((sum, c) => sum + c.mrr, 0),
            activeEmployees: custs.reduce((sum, c) => sum + c.employees, 0),
            usageCost: 0, // Will come from billing engine when available
          });
        } else {
          // No data yet — show empty
          setStats({ customerCount: 0, mrr: 0, activeEmployees: 0, usageCost: 0 });
        }
      } catch {
        setStats({ customerCount: 0, mrr: 0, activeEmployees: 0, usageCost: 0 });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const hasCustomers = customers.length > 0;

  return (
    <div>
      <h1 className="text-xl font-bold text-mouse-navy mb-6">Overview</h1>

      {/* Empty State CTA */}
      {!loading && !hasCustomers && (
        <div className="bg-gradient-to-r from-mouse-navy to-mouse-navy/90 rounded-xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">No customers yet</h2>
                <p className="text-white/70 text-sm">Onboard your first customer to see real data here.</p>
              </div>
            </div>
            <Link
              href="/dashboard/customers"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-mouse-orange text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Customer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Customers" value={stats?.customerCount ?? 0} loading={loading} />
        <StatCard
          label="MRR"
          value={stats ? `$${stats.mrr.toLocaleString()}` : "$0"}
          valueClassName="text-mouse-green"
          loading={loading}
        />
        <StatCard label="Active Employees" value={stats?.activeEmployees ?? 0} loading={loading} />
        <StatCard
          label="Usage Cost"
          value={stats ? `$${stats.usageCost.toLocaleString()}` : "$0"}
          loading={loading}
        />
      </div>

      {/* Sales Pipeline Widget */}
      <div className="mb-8">
        <SalesPipelineWidget />
      </div>

      {/* Health, Work Hours & Security Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EmployeeHealthWidget />
        <WorkHoursWidget />
      </div>
      <div className="mb-8">
        <SecurityDashboardWidget />
      </div>

      {/* Recent Customers */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20 flex items-center justify-between">
          <h2 className="text-base font-semibold text-mouse-charcoal">
            Recent Customers
          </h2>
          <Link
            href="/dashboard/customers"
            className="text-sm text-mouse-teal hover:underline font-medium"
          >
            View all
          </Link>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center">
            <Loader2 className="w-6 h-6 text-mouse-slate animate-spin mx-auto" />
          </div>
        ) : customers.length === 0 ? (
          <div className="px-6 py-12 text-center text-mouse-slate text-sm">
            No customers yet. Add your first customer to get started.
          </div>
        ) : (
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
                {customers.slice(0, 5).map((customer) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
