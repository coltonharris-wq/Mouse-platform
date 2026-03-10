"use client";

import { Settings } from "lucide-react";
import type { VerticalConfig } from "@/lib/employee-dashboard/vertical-configs";

interface Props {
  config: VerticalConfig;
  employee: {
    name?: string;
    status?: string;
    hours_worked?: number;
    conversations_handled?: number;
    last_active_at?: string;
    created_at?: string;
  };
  metrics: Record<string, number | string>;
}

export default function DashboardHeader({ config, employee, metrics }: Props) {
  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    working: "bg-green-100 text-green-700",
    idle: "bg-gray-100 text-gray-600",
    paused: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    deploying: "bg-blue-100 text-blue-700",
  };
  const status = (employee.status ?? "active").toLowerCase();
  const statusClass = statusColor[status] ?? "bg-gray-100 text-gray-600";

  const formatMetric = (val: number | string, format?: string) => {
    if (val == null) return "—";
    if (format === "currency") return `$${Number(val).toLocaleString()}`;
    if (format === "percent") return `${Number(val)}%`;
    return String(val);
  };

  const hiredDate = employee.created_at
    ? new Date(employee.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-mouse-teal/10 flex items-center justify-center text-3xl">
            {config.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-mouse-navy">
              {employee.name || config.name}
            </h1>
            <p className="text-sm text-mouse-slate mt-0.5">
              {config.name} • Hired: {hiredDate} • Hours:{" "}
              {employee.hours_worked ?? 0}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusClass}`}
              >
                {employee.status ?? "Active"}
              </span>
              {(employee.conversations_handled ?? 0) > 0 && (
                <span className="text-xs text-mouse-slate">
                  {employee.conversations_handled} conversations
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          className="p-2 text-mouse-slate hover:text-mouse-charcoal hover:bg-mouse-offwhite rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-mouse-slate/20">
        {config.metrics.slice(0, 4).map((m) => (
          <div key={m.key}>
            <p className="text-xs font-medium text-mouse-slate uppercase tracking-wide">
              {m.label}
            </p>
            <p className="text-lg font-bold text-mouse-charcoal mt-1">
              {formatMetric(metrics[m.key] ?? 0, m.format)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
