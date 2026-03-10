"use client";

import { CAPABILITIES } from "@/lib/employee-dashboard/vertical-configs";

interface Capability {
  capability_number: number;
  capability_name?: string;
  enabled: boolean;
  times_used?: number;
  last_used_at?: string;
}

interface Props {
  capabilities: Capability[];
  onToggle?: (num: number, enabled: boolean) => void;
}

export default function CapabilityGrid({ capabilities, onToggle }: Props) {
  const byNum = new Map(capabilities.map((c) => [c.capability_number, c]));

  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
      <h2 className="text-base font-semibold text-mouse-charcoal mb-4">
        Capabilities Status
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {CAPABILITIES.map((cap) => {
          const data = byNum.get(cap.id);
          const enabled = data?.enabled ?? true;
          return (
            <div
              key={cap.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                enabled ? "bg-mouse-teal/5 border-mouse-teal/20" : "bg-mouse-offwhite/50 border-mouse-slate/10"
              }`}
            >
              <span className="text-xl">{cap.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-mouse-charcoal truncate">
                  {data?.capability_name || cap.name}
                </p>
                <p className="text-xs text-mouse-slate">
                  {enabled ? "● Active" : "○ Inactive"}
                  {(data?.times_used ?? 0) > 0 && (
                    <> • {data.times_used} uses</>
                  )}
                </p>
              </div>
              {onToggle && (
                <button
                  onClick={() => onToggle(cap.id, !enabled)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    enabled ? "bg-mouse-teal" : "bg-mouse-slate/30"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      enabled ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
