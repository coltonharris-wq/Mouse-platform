"use client";

import { useState } from "react";
import { 
  Shield, ShieldCheck, ShieldAlert, Lock, Eye, EyeOff, 
  Key, Fingerprint, Smartphone, History, AlertTriangle,
  CheckCircle2, XCircle, Clock
} from "lucide-react";

interface SecurityLog {
  id: string;
  event: string;
  user: string;
  ip: string;
  timestamp: string;
  status: "success" | "warning" | "blocked";
}

const mockLogs: SecurityLog[] = [
  { id: "1", event: "Login", user: "admin@mouse.ai", ip: "192.168.1.100", timestamp: "2026-02-28 16:45:22", status: "success" },
  { id: "2", event: "API Key Generated", user: "dev@mouse.ai", ip: "192.168.1.105", timestamp: "2026-02-28 15:30:10", status: "success" },
  { id: "3", event: "Failed Login Attempt", user: "unknown", ip: "45.123.45.67", timestamp: "2026-02-28 14:22:05", status: "blocked" },
  { id: "4", event: "Password Changed", user: "admin@mouse.ai", ip: "192.168.1.100", timestamp: "2026-02-28 12:15:33", status: "success" },
  { id: "5", event: "2FA Enabled", user: "sales@mouse.ai", ip: "192.168.1.110", timestamp: "2026-02-28 10:08:47", status: "success" },
  { id: "6", event: "Suspicious Activity", user: "admin@mouse.ai", ip: "203.0.113.45", timestamp: "2026-02-28 08:55:12", status: "warning" },
];

const securityFeatures = [
  { name: "Two-Factor Authentication", enabled: true, icon: Smartphone, description: "Require 2FA for all admin accounts" },
  { name: "IP Whitelisting", enabled: true, icon: Lock, description: "Restrict access to approved IP ranges" },
  { name: "API Key Rotation", enabled: true, icon: Key, description: "Auto-rotate keys every 90 days" },
  { name: "Biometric Login", enabled: false, icon: Fingerprint, description: "Enable fingerprint/face recognition" },
  { name: "Session Monitoring", enabled: true, icon: Eye, description: "Real-time session tracking" },
  { name: "Encrypted Storage", enabled: true, icon: ShieldCheck, description: "AES-256 encryption at rest" },
];

export default function SecurityDashboard() {
  const [showKeys, setShowKeys] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "settings">("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "blocked":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: "bg-green-100 text-green-700",
      warning: "bg-amber-100 text-amber-700",
      blocked: "bg-red-100 text-red-700",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <div className="bg-gradient-to-r from-mouse-navy to-mouse-teal rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Security Score</h3>
              <p className="text-white/70 text-sm">Your account security is strong</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-5xl font-bold">92</span>
            <span className="text-white/70 text-lg">/100</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(["overview", "logs", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-mouse-teal text-mouse-teal"
                  : "border-transparent text-mouse-slate hover:text-mouse-charcoal"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityFeatures.map((feature) => (
            <div
              key={feature.name}
              className={`p-4 rounded-xl border transition-colors ${
                feature.enabled 
                  ? "bg-green-50 border-green-200" 
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  feature.enabled ? "bg-green-100" : "bg-gray-200"
                }`}>
                  <feature.icon className={`w-5 h-5 ${feature.enabled ? "text-green-600" : "text-gray-500"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-mouse-charcoal text-sm">{feature.name}</h4>
                    {feature.enabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-mouse-slate mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-mouse-teal" />
              <h3 className="font-semibold text-mouse-charcoal">Security Logs</h3>
            </div>
            <button className="text-sm text-mouse-teal hover:underline">
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mouse-offwhite text-left">
                  <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Event</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">User</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">IP Address</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-3 text-mouse-charcoal">{log.event}</td>
                    <td className="px-6 py-3 text-mouse-charcoal">{log.user}</td>
                    <td className="px-6 py-3 text-mouse-slate font-mono text-xs">{log.ip}</td>
                    <td className="px-6 py-3 text-mouse-slate text-xs">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-mouse-charcoal mb-4">API Keys</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-mouse-charcoal text-sm">Production API Key</p>
                  <p className="text-xs text-mouse-slate">Created: Feb 15, 2026</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1 bg-gray-200 rounded text-xs font-mono">
                    {showKeys ? "sk_live_51MzQ9J..." : "••••••••••••••••"}
                  </code>
                  <button
                    onClick={() => setShowKeys(!showKeys)}
                    className="p-1.5 text-mouse-slate hover:text-mouse-charcoal"
                  >
                    {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Security Recommendation</p>
              <p className="text-sm text-amber-700 mt-1">
                Enable biometric login for additional security. This feature uses your device&apos;s 
                fingerprint or face recognition.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
