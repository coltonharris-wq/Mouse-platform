import { platformStats, resellers } from "@/lib/seed-data";

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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    trial: "bg-yellow-100 text-yellow-700",
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

export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-mouse-navy mb-6">Platform Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Resellers" value={platformStats.totalResellers} />
        <StatCard
          label="Total Revenue"
          value={`$${platformStats.totalRevenue.toLocaleString()}`}
          valueClassName="text-mouse-green"
        />
        <StatCard label="Active Employees" value={platformStats.activeEmployees} />
        <StatCard
          label="System Health"
          value={platformStats.systemHealth}
          valueClassName="text-mouse-green"
        />
      </div>

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <h2 className="text-base font-semibold text-mouse-charcoal">Resellers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite text-left">
                <th className="px-6 py-3 text-mouse-slate font-medium">Name</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">MRR</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Customers</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Stripe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {resellers.map((reseller) => (
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
                  <td className="px-6 py-4">
                    <StripeStatusBadge status={reseller.stripeStatus} />
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
