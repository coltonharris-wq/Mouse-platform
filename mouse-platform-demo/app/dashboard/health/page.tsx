"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Cpu,
  HardDrive,
  Zap,
  TrendingUp,
  DollarSign,
  Clock,
  Settings,
  Bell,
  Mail,
  FileText,
  Play,
  Pause,
  RotateCcw,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Download,
} from "lucide-react";
import Link from "next/link";
import EmployeeHealthWidget from "@/components/EmployeeHealthWidget";
import type {
  HealthCheck,
  HealthAlert,
  HealthStatus,
} from "@/app/types/health";

// Status badge component
function StatusBadge({ status, size = "md" }: { status: HealthStatus; size?: "sm" | "md" | "lg" }) {
  const config = {
    healthy: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Healthy" },
    warning: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Warning" },
    down: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Down" },
    paused: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: "Paused" },
  };

  const { bg, text, dot, label } = config[status];
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${bg} ${text} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'healthy' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

// Metric card component
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-mouse-slate font-medium">{title}</p>
          <p className="text-2xl font-bold text-mouse-charcoal mt-1">{value}</p>
          {subtitle && <p className="text-xs text-mouse-slate mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <TrendingUp className={`w-4 h-4 ${trendUp ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
          <span className="text-sm text-mouse-slate">vs last 24h</span>
        </div>
      )}
    </div>
  );
}

// Employee table row
function EmployeeRow({ employee, onAction }: { employee: HealthCheck; onAction: (action: string) => void }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium ${
            employee.status === 'healthy' ? 'bg-green-500' :
            employee.status === 'warning' ? 'bg-amber-500' :
            employee.status === 'down' ? 'bg-red-500' : 'bg-gray-400'
          }`}>
            {employee.employeeName[0]}
          </div>
          <div>
            <p className="font-medium text-mouse-charcoal">{employee.employeeName}</p>
            <p className="text-xs text-mouse-slate">{employee.vmId}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={employee.status} size="sm" />
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <Cpu className="w-3 h-3 text-mouse-slate" />
            <span className={employee.metrics.cpu > 80 ? 'text-red-600 font-medium' : 'text-mouse-charcoal'}>
              {employee.metrics.cpu}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Activity className="w-3 h-3 text-mouse-slate" />
            <span className={employee.metrics.memory > 80 ? 'text-red-600 font-medium' : 'text-mouse-charcoal'}>
              {employee.metrics.memory}%
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <p className="text-mouse-charcoal">{employee.uptimePercentage}%</p>
          <p className="text-xs text-mouse-slate">24h uptime</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <p className="text-mouse-charcoal">{employee.apiMetrics.averageResponseTime}ms</p>
          <p className="text-xs text-mouse-slate">avg response</p>
        </div>
      </td>
      <td className="px-6 py-4">
        {employee.alerts.length > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            {employee.alerts.length} alert{employee.alerts.length > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            OK
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {employee.status === 'down' && (
            <button
              onClick={() => onAction('restart')}
              className="p-2 text-mouse-slate hover:text-mouse-teal hover:bg-mouse-teal/10 rounded-lg transition-colors"
              title="Restart VM"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          {employee.status === 'paused' && (
            <button
              onClick={() => onAction('resume')}
              className="p-2 text-mouse-slate hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Resume VM"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          {employee.status === 'healthy' && (
            <button
              onClick={() => onAction('pause')}
              className="p-2 text-mouse-slate hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Pause VM"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function HealthMonitoringPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "employees" | "alerts" | "reports">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/health?view=dashboard');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleEmployeeAction = async (employeeId: string, action: string) => {
    try {
      const response = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, employeeId }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error(`Failed to ${action} employee:`, error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-mouse-navy">Health Monitoring</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse h-32" />
          ))}
        </div>
      </div>
    );
  }

  const filteredEmployees = data?.employees?.filter((e: HealthCheck) =>
    e.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.vmId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mouse-navy">Health Monitoring</h1>
          <p className="text-mouse-slate mt-1">
            Monitor employee VM health, performance, and cost optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-mouse-slate hover:text-mouse-charcoal hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-mouse-navy text-white rounded-lg hover:bg-mouse-navy/90 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(["overview", "employees", "alerts", "reports"] as const).map((tab) => (
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
              {tab === "alerts" && data?.activeAlerts?.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                  {data.activeAlerts.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Employees"
              value={data?.totalEmployees || 0}
              subtitle={`${data?.healthy || 0} healthy, ${data?.warning || 0} warning`}
              icon={Server}
              color="bg-mouse-navy"
            />
            <MetricCard
              title="System Uptime"
              value={`${data?.uptimePercentage || 0}%`}
              subtitle="Last 24 hours"
              icon={Activity}
              color="bg-green-600"
              trend="+0.5%"
              trendUp={true}
            />
            <MetricCard
              title="Active Alerts"
              value={data?.activeAlerts?.length || 0}
              subtitle={data?.activeAlerts?.length > 0 ? 'Requires attention' : 'All clear'}
              icon={AlertCircle}
              color={data?.activeAlerts?.length > 0 ? "bg-red-600" : "bg-green-600"}
            />
            <MetricCard
              title="Cost Savings"
              value={`$${(data?.costSavingsTotal || 0).toFixed(2)}`}
              subtitle="Auto-pause optimization"
              icon={DollarSign}
              color="bg-mouse-teal"
              trend="+$12.50"
              trendUp={true}
            />
          </div>

          {/* Main Widget */}
          <EmployeeHealthWidget />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-mouse-charcoal">Alert Settings</h3>
                  <p className="text-sm text-mouse-slate">Configure notifications</p>
                </div>
              </div>
              <p className="text-sm text-mouse-slate mb-4">
                Get notified when employees go down or metrics exceed thresholds.
              </p>
              <button className="text-sm text-mouse-teal hover:underline font-medium">
                Configure Alerts →
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-mouse-teal/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-mouse-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-mouse-charcoal">Auto-Recovery</h3>
                  <p className="text-sm text-mouse-slate">Manage recovery settings</p>
                </div>
              </div>
              <p className="text-sm text-mouse-slate mb-4">
                Automatically restart failed VMs and services.
              </p>
              <button className="text-sm text-mouse-teal hover:underline font-medium">
                Configure Recovery →
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-mouse-charcoal">Cost Optimization</h3>
                  <p className="text-sm text-mouse-slate">Idle VM management</p>
                </div>
              </div>
              <p className="text-sm text-mouse-slate mb-4">
                Auto-pause idle employees after 2 hours to save costs.
              </p>
              <button className="text-sm text-mouse-teal hover:underline font-medium">
                View Savings →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mouse-slate" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mouse-teal/20 focus:border-mouse-teal w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-mouse-slate hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-mouse-slate">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page 1 of 1</span>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-mouse-slate">Employee</th>
                  <th className="px-6 py-3 font-medium text-mouse-slate">Status</th>
                  <th className="px-6 py-3 font-medium text-mouse-slate">Metrics</th>
                  <th className="px-6 py-3 font-medium text-mouse-slate">Uptime</th>
                  <th className="px-6 py-3 font-medium text-mouse-slate">API</th>
                  <th className="px-6 py-3 font-medium text-mouse-slate">Alerts</th>
                  <th className="px-6 py-3 font-medium text-mouse-slate">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees?.map((employee: HealthCheck) => (
                  <EmployeeRow
                    key={employee.employeeId}
                    employee={employee}
                    onAction={(action) => handleEmployeeAction(employee.employeeId, action)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees?.length === 0 && (
            <div className="text-center py-12 text-mouse-slate">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No employees found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          {data?.activeAlerts?.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold text-mouse-charcoal mb-2">All Clear!</h3>
              <p className="text-mouse-slate">No active alerts at this time.</p>
            </div>
          ) : (
            data?.activeAlerts?.map((alert: HealthAlert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border shadow-sm p-6 ${
                  alert.severity === 'critical' ? 'border-red-200' :
                  alert.severity === 'warning' ? 'border-amber-200' :
                  'border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alert.severity === 'critical' ? 'bg-red-100' :
                      alert.severity === 'warning' ? 'bg-amber-100' :
                      'bg-blue-100'
                    }`}>
                      <AlertCircle className={`w-5 h-5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'warning' ? 'text-amber-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-mouse-slate">
                          {alert.metric}
                        </span>
                      </div>
                      <p className="font-medium text-mouse-charcoal">{alert.message}</p>
                      <p className="text-sm text-mouse-slate mt-1">
                        Employee: {alert.employeeId} • {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEmployeeAction(alert.employeeId, 'restart')}
                      className="px-3 py-2 text-sm font-medium text-mouse-teal hover:bg-mouse-teal/10 rounded-lg transition-colors"
                    >
                      Restart VM
                    </button>
                    <button
                      onClick={() => handleEmployeeAction(alert.id, 'acknowledge-alert')}
                      className="px-3 py-2 text-sm font-medium text-mouse-slate hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-mouse-charcoal">Daily Health Report</h3>
                <p className="text-sm text-mouse-slate">Summary of system health and metrics</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-mouse-slate hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-mouse-navy">{data?.totalEmployees || 0}</p>
                <p className="text-xs text-mouse-slate">Total Employees</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{data?.uptimePercentage || 0}%</p>
                <p className="text-xs text-mouse-slate">Avg Uptime</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{data?.activeAlerts?.length || 0}</p>
                <p className="text-xs text-mouse-slate">Total Alerts</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-mouse-teal">${(data?.costSavingsTotal || 0).toFixed(2)}</p>
                <p className="text-xs text-mouse-slate">Cost Savings</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="font-medium text-mouse-charcoal mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-mouse-teal" />
                Email Report Settings
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300 text-mouse-teal focus:ring-mouse-teal" defaultChecked />
                  <span className="text-sm text-mouse-charcoal">Daily health summary</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300 text-mouse-teal focus:ring-mouse-teal" defaultChecked />
                  <span className="text-sm text-mouse-charcoal">Critical alert notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300 text-mouse-teal focus:ring-mouse-teal" />
                  <span className="text-sm text-mouse-charcoal">Weekly cost optimization report</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
