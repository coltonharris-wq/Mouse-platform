"use client";

import { Shield, ShieldAlert, ShieldCheck, Clock, AlertCircle } from "lucide-react";

interface SecurityBadgeProps {
  type: "guardrail" | "rate-limit" | "fraud" | "encryption";
  status: "active" | "warning" | "critical" | "inactive";
  label?: string;
  details?: string;
  showDetails?: boolean;
}

const statusConfig = {
  active: {
    icon: ShieldCheck,
    bgColor: "bg-mouse-green/10",
    textColor: "text-mouse-green",
    borderColor: "border-mouse-green/30",
    label: "Protected",
  },
  warning: {
    icon: ShieldAlert,
    bgColor: "bg-mouse-orange/10",
    textColor: "text-mouse-orange",
    borderColor: "border-mouse-orange/30",
    label: "Attention",
  },
  critical: {
    icon: ShieldAlert,
    bgColor: "bg-mouse-red/10",
    textColor: "text-mouse-red",
    borderColor: "border-mouse-red/30",
    label: "Critical",
  },
  inactive: {
    icon: Shield,
    bgColor: "bg-mouse-slate/10",
    textColor: "text-mouse-slate",
    borderColor: "border-mouse-slate/30",
    label: "Inactive",
  },
};

const typeConfig = {
  guardrail: {
    icon: ShieldCheck,
    defaultLabel: "AI Guardrails",
  },
  "rate-limit": {
    icon: Clock,
    defaultLabel: "Rate Limiting",
  },
  fraud: {
    icon: AlertCircle,
    defaultLabel: "Fraud Detection",
  },
  encryption: {
    icon: Shield,
    defaultLabel: "Encryption",
  },
};

export default function SecurityBadge({
  type,
  status,
  label,
  details,
  showDetails = false,
}: SecurityBadgeProps) {
  const config = statusConfig[status];
  const typeInfo = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      <Icon className={`w-4 h-4 ${config.textColor}`} />
      <span className={`text-xs font-medium ${config.textColor}`}>
        {label || typeInfo.defaultLabel}
      </span>
      {showDetails && details && (
        <span className={`text-xs ${config.textColor} opacity-75 ml-1`}>
          • {details}
        </span>
      )}
    </div>
  );
}

// Security Dashboard Widget
export function SecurityDashboardWidget() {
  const securityItems = [
    { type: "guardrail" as const, status: "active" as const, details: "12 rules active" },
    { type: "rate-limit" as const, status: "active" as const, details: "47 requests/min" },
    { type: "fraud" as const, status: "warning" as const, details: "2 alerts" },
    { type: "encryption" as const, status: "active" as const, details: "AES-256" },
  ];

  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-lg bg-mouse-green/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-mouse-green" />
        </div>
        <div>
          <h3 className="font-semibold text-mouse-charcoal">Security Status</h3>
          <p className="text-xs text-mouse-slate">System protection overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {securityItems.map((item) => (
          <SecurityBadge
            key={item.type}
            type={item.type}
            status={item.status}
            details={item.details}
            showDetails
          />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-mouse-slate/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-mouse-slate">Last scan</span>
          <span className="text-mouse-charcoal font-medium">2 minutes ago</span>
        </div>
      </div>
    </div>
  );
}
