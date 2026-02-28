import Link from "next/link";
import { resellerStats, customers } from "@/lib/seed-data";
import WorkHoursWidget from "@/components/WorkHoursWidget";
import { SecurityDashboardWidget } from "@/components/SecurityBadge";

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 p-6 shadow-sm">
      <p className="text-sm text-mouse-slate font-medium mb-2">{label}</p>
      <p className={`text-2xl font-bold ${valueClassName ?? "text-mouse-charcoal"}`}>
        {value}
      </p>
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

export default function DashboardPage() {
  const recentCustomers = customers.slice(0, 5);

  return (
    <div>
      <h1 className="text-xl font-bold text-mouse-navy mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Customers" value={resellerStats.customerCount} />
        <StatCard
          label="MRR"
          value={`$${resellerStats.mrr.toLocaleString()}`}
          valueClassName="text-mouse-green"
        />
        <StatCard label="Active Employees" value={resellerStats.activeEmployees} />
        <StatCard
          label="Usage Cost"
          value={`$${resellerStats.usageCost.toLocaleString()}`}
        />
      </div>

      {/* Work Hours & Security Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WorkHoursWidget />
        <SecurityDashboardWidget />
      </div>

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
              {recentCustomers.map((customer) => (
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
      </div>
    </div>
  );
}
