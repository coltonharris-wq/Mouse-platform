import { resellers } from "@/lib/seed-data";

const PLATFORM_FEE_RATE = 0.12;

const totalGross = resellers.reduce((sum, r) => sum + r.mrr, 0);
const platformFees = Math.round(totalGross * PLATFORM_FEE_RATE);
const netRevenue = totalGross - platformFees;

function MetricCard({
  label,
  value,
  sub,
  valueClassName,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClassName?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 p-6 shadow-sm">
      <p className="text-sm text-mouse-slate font-medium mb-2">{label}</p>
      <p className={`text-2xl font-bold ${valueClassName ?? "text-mouse-charcoal"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-mouse-slate mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminRevenuePage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-mouse-navy mb-6">Revenue</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Total Gross"
          value={`$${totalGross.toLocaleString()}`}
          valueClassName="text-mouse-green"
        />
        <MetricCard
          label="Platform Fees (12%)"
          value={`$${platformFees.toLocaleString()}`}
          valueClassName="text-mouse-green"
        />
        <MetricCard
          label="Net Revenue"
          value={`$${netRevenue.toLocaleString()}`}
          valueClassName="text-mouse-green"
        />
      </div>

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6 mb-8">
        <h2 className="text-base font-semibold text-mouse-charcoal mb-4">
          Revenue Chart
        </h2>
        <div className="flex items-center justify-center h-40 rounded-lg bg-mouse-offwhite border border-mouse-slate/20">
          <p className="text-sm text-mouse-slate">
            Revenue Chart — Interactive charts coming soon
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <h2 className="text-base font-semibold text-mouse-charcoal">
            Breakdown by Reseller
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite text-left">
                <th className="px-6 py-3 text-mouse-slate font-medium">Reseller</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Gross MRR</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">
                  Platform Fee (12%)
                </th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {resellers.map((reseller) => {
                const fee = Math.round(reseller.mrr * PLATFORM_FEE_RATE);
                const net = reseller.mrr - fee;
                return (
                  <tr
                    key={reseller.id}
                    className="hover:bg-mouse-offwhite transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-mouse-charcoal">
                      {reseller.name}
                    </td>
                    <td className="px-6 py-4 text-mouse-green font-medium">
                      {reseller.mrr > 0 ? `$${reseller.mrr.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-mouse-charcoal">
                      {fee > 0 ? `$${fee.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-mouse-green font-medium">
                      {net > 0 ? `$${net.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-mouse-offwhite font-semibold">
                <td className="px-6 py-4 text-mouse-charcoal">Total</td>
                <td className="px-6 py-4 text-mouse-green">
                  ${totalGross.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-mouse-charcoal">
                  ${platformFees.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-mouse-green">
                  ${netRevenue.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
