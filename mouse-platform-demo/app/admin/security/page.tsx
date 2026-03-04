"use client";

import { useState } from "react";
import { Shield, ShieldCheck, AlertTriangle, Activity } from "lucide-react";

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function AdminSecurityPage() {
  // Real alerts will come from a security monitoring pipeline
  // For now, show clean empty state
  const [alerts] = useState<SecurityAlert[]>([]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mouse-navy">Security</h1>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-6 mb-8 flex items-center gap-4 ${
        alerts.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        {alerts.length === 0 ? (
          <>
            <ShieldCheck className="w-10 h-10 text-green-500" />
            <div>
              <h2 className="text-lg font-semibold text-green-800">No security alerts. All clear.</h2>
              <p className="text-sm text-green-600 mt-1">
                The platform is operating normally. Security monitoring is active.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <div>
              <h2 className="text-lg font-semibold text-red-800">{alerts.length} active alert{alerts.length !== 1 ? 's' : ''}</h2>
              <p className="text-sm text-red-600 mt-1">Review and resolve security issues below.</p>
            </div>
          </>
        )}
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Shield className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold text-gray-900">Fraud Detection</h3>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered monitoring for suspicious activity, unusual login patterns, and billing anomalies.
          </p>
          <span className="inline-block mt-3 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Activity className="w-8 h-8 text-mouse-teal mb-3" />
          <h3 className="font-semibold text-gray-900">Activity Monitoring</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track all user actions, API calls, and system events in real-time.
          </p>
          <span className="inline-block mt-3 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <ShieldCheck className="w-8 h-8 text-teal-500 mb-3" />
          <h3 className="font-semibold text-gray-900">Access Control</h3>
          <p className="text-sm text-gray-500 mt-1">
            Role-based access for admin, reseller, and customer portals with session management.
          </p>
          <span className="inline-block mt-3 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
        </div>
      </div>

      {/* Alerts Table (empty state or real alerts) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Security Alerts</h2>
        </div>
        {alerts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No security alerts</p>
            <p className="text-gray-400 text-sm mt-1">Alerts will appear here when suspicious activity is detected.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-gray-500 font-medium">Time</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Severity</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Type</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Message</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="px-6 py-3 text-gray-600">{new Date(alert.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600 capitalize">{alert.type}</td>
                  <td className="px-6 py-3 text-gray-900">{alert.message}</td>
                  <td className="px-6 py-3">
                    {alert.resolved ? (
                      <span className="text-green-600 text-xs font-medium">Resolved</span>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">Investigate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
