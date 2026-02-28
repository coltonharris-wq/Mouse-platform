import { resellerStats, customers } from "@/lib/seed-data";

const marginPercent = Math.round(
  (resellerStats.estimatedMargin / resellerStats.grossProcessed) * 100
);

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

const months = [
  { month: "Jan 2024", gross: 18400, fee: 2208, usage: 2760, net: 13432 },
  { month: "Feb 2024", gross: 20100, fee: 2412, usage: 3015, net: 14673 },
  { month: "Mar 2024", gross: 21500, fee: 2580, usage: 3225, net: 15695 },
  { month: "Apr 2024", gross: 22300, fee: 2676, usage: 3345, net: 16279 },
  { month: "May 2024", gross: 23800, fee: 2856, usage: 3570, net: 17374 },
  { month: "Jun 2024", gross: 24739, fee: 2968, usage: 3840, net: 17931 },
];

export default function RevenuePage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-mouse-navy mb-6">Revenue</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Gross Processed"
          value={`$${resellerStats.grossProcessed.toLocaleString()}`}
          valueClassName="text-mouse-green"
        />
        <MetricCard
          label="Platform Fee (12%)"
          value={`$${resellerStats.platformFee.toLocaleString()}`}
        />
        <MetricCard
          label="Usage Billed"
          value={`$${resellerStats.usageBilled.toLocaleString()}`}
        />
        <MetricCard
          label="Estimated Margin"
          value={`$${resellerStats.estimatedMargin.toLocaleString()}`}
          sub={`${marginPercent}% margin`}
          valueClassName="text-mouse-green"
        />
      </div>

      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <h2 className="text-base font-semibold text-mouse-charcoal">
            Monthly Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite text-left">
                <th className="px-6 py-3 text-mouse-slate font-medium">Month</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Gross</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Platform Fee</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Usage</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {months.map((row) => (
                <tr key={row.month} className="hover:bg-mouse-offwhite transition-colors">
                  <td className="px-6 py-4 font-medium text-mouse-charcoal">
                    {row.month}
                  </td>
                  <td className="px-6 py-4 text-mouse-green font-medium">
                    ${row.gross.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-mouse-charcoal">
                    ${row.fee.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-mouse-charcoal">
                    ${row.usage.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-mouse-green font-medium">
                    ${row.net.toLocaleString()}
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
