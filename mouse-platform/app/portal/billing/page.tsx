import Link from "next/link";
import { Check } from "lucide-react";
import { invoices } from "@/lib/seed-data";

const PLAN_FEATURES = [
  "3 AI Employees included",
  "500 automation hours / month",
  "Sales follow-up & CRM sync",
  "Accounts receivable automation",
  "Data entry & admin tasks",
  "Priority email support",
  "Real-time activity feed",
];

const HOURS_USED = 388;
const HOURS_TOTAL = 500;

export default function BillingPage() {
  const usagePercent = Math.round((HOURS_USED / HOURS_TOTAL) * 100);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mouse-charcoal">Billing</h1>
        <p className="text-mouse-slate text-sm mt-1">
          Manage your plan and review invoice history
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-mouse-charcoal">
              Growth Plan
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-1">
              Active
            </span>
          </div>
          <div className="text-right">
            <div className="text-mouse-green text-3xl font-bold">$2,997</div>
            <div className="text-mouse-slate text-xs mt-0.5">per month</div>
          </div>
        </div>

        {/* Features list */}
        <ul className="space-y-2 mb-6">
          {PLAN_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5">
              <Check size={14} className="text-mouse-teal flex-shrink-0" />
              <span className="text-mouse-charcoal text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Usage stats */}
        <div className="pt-5 border-t border-mouse-slate/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-mouse-charcoal text-sm font-medium">
              Hours Used
            </span>
            <span className="text-mouse-charcoal text-sm">
              <span className="font-bold">{HOURS_USED}</span>
              <span className="text-mouse-slate"> / {HOURS_TOTAL} hrs</span>
            </span>
          </div>
          <div className="h-2.5 bg-mouse-slate/20 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-mouse-teal rounded-full"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-mouse-slate text-xs">
              {usagePercent}% of monthly allocation used
            </span>
            <Link
              href="#"
              className="text-mouse-teal text-xs hover:underline font-medium"
            >
              Upgrade to Enterprise
            </Link>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20">
          <h2 className="text-base font-semibold text-mouse-charcoal">
            Invoices
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite border-b border-mouse-slate/10">
                <th className="px-6 py-3 text-left text-xs font-semibold text-mouse-slate uppercase tracking-wide">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-mouse-slate uppercase tracking-wide">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-mouse-slate uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-mouse-slate uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-mouse-slate uppercase tracking-wide">
                  Download
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-mouse-offwhite transition-colors"
                >
                  <td className="px-6 py-4 text-mouse-charcoal font-medium">
                    {inv.plan}
                  </td>
                  <td className="px-6 py-4 text-mouse-slate">
                    {new Date(inv.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 font-bold text-mouse-green">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        inv.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1.5 border border-mouse-slate/40 text-mouse-slate text-xs font-medium rounded-md hover:border-mouse-teal hover:text-mouse-teal transition-colors">
                      Download
                    </button>
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
