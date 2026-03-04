"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  RefreshCw,
  Server,
  Cpu,
  HardDrive,
  Zap,
  TrendingUp,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  Power,
  RotateCcw,
  ArrowRightLeft,
  Mail,
  Bell,
  Info,
} from "lucide-react";
import type {
  HealthCheck,
  HealthAlert,
  RecoveryAction,
  HealthStatus,
} from "@/app/types/health";
import {
  getDashboardData,
  performHealthCheck,
  restartVM,
  resumeEmployee,
  acknowledgeAlert,
  getRecentRecoveries,
  getCostMetrics,
  generateDailyReport,
} from "@/lib/health-monitor";

// Status badge component
function StatusBadge({ status }: { status: HealthStatus }) {
  const config = {
    healthy: {
      icon: CheckCircle2,
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-500",
      label: "Healthy",
    },
    warning: {
      icon: AlertCircle,
      bg: "bg-amber-100",
      text: "text-amber-700",
      dot: "bg-amber-500",
      label: "Warning",
    },
    down: {
      icon: XCircle,
      bg: "bg-red-100",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Down",
    },
    paused: {
      icon: PauseCircle,
      bg: "bg-gray-100",
      text: "text-gray-600",
      dot: "bg-gray-400",
      label: "Paused",
    },
  };

  const { icon: Icon, bg, text, dot, label } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'healthy' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

// Metric bar component
function MetricBar({
  label,
  value,
  unit = "%",
  warningThreshold = 70,
  criticalThreshold = 90,
}: {
  label: string;
  value: number;
  unit?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
}) {
  const getColor = () => {
    if (value >= criticalThreshold) return "bg-red-500";
    if (value >= warningThreshold) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-mouse-slate">{label}</span>
        <span className={`font-medium ${value >= criticalThreshold ? 'text-red-600' : value >= warningThreshold ? 'text-amber-600' : 'text-green-600'}`}>
          {value}{unit}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Alert card component
function AlertCard({ alert, onAcknowledge }: { alert: HealthAlert; onAcknowledge: () => void }) {
  const severityColors = {
    info: "border-blue-200 bg-blue-50",
    warning: "border-amber-200 bg-amber-50",
    critical: "border-red-200 bg-red-50",
  };

  const severityIcons = {
    info: Info,
    warning: AlertCircle,
    critical: XCircle,
  };

  const Icon = severityIcons[alert.severity];

  return (
    <div className={`p-3 rounded-lg border ${severityColors[alert.severity]} text-sm`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
          alert.severity === 'critical' ? 'text-red-600' : 
          alert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
        }`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-mouse-charcoal">{alert.message}</p>
          <p className="text-xs text-mouse-slate mt-1">
            {new Date(alert.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onAcknowledge}
          className="text-xs text-mouse-teal hover:underline flex-shrink-0"
        >
          Ack
        </button>
      </div>
    </div>
  );
}

// Employee detail modal
function EmployeeDetailModal({
  employee,
  onClose,
  onRefresh,
  onRestart,
  onResume,
  onAcknowledgeAlert,
}: {
  employee: HealthCheck;
  onClose: () => void;
  onRefresh: () => void;
  onRestart: () => void;
  onResume: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "alerts" | "history">("overview");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-mouse-navy to-mouse-teal">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{employee.employeeName}</h3>
              <p className="text-white/70 text-sm">{employee.vmId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={employee.status} />
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex gap-6">
            {(["overview", "alerts", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-mouse-teal text-mouse-teal"
                    : "border-transparent text-mouse-slate hover:text-mouse-charcoal"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "alerts" && employee.alerts.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                    {employee.alerts.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-mouse-navy">{employee.uptimePercentage}%</p>
                  <p className="text-xs text-mouse-slate mt-1">24h Uptime</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{employee.apiMetrics.successful}</p>
                  <p className="text-xs text-mouse-slate mt-1">API Calls</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-mouse-teal">{employee.apiMetrics.averageResponseTime}ms</p>
                  <p className="text-xs text-mouse-slate mt-1">Avg Response</p>
                </div>
              </div>

              {/* System Metrics */}
              <div>
                <h4 className="text-sm font-medium text-mouse-charcoal mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-mouse-teal" />
                  System Metrics
                </h4>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <MetricBar label="CPU Usage" value={employee.metrics.cpu} warningThreshold={70} criticalThreshold={90} />
                  <MetricBar label="Memory Usage" value={employee.metrics.memory} warningThreshold={80} criticalThreshold={90} />
                  <MetricBar label="Disk Usage" value={employee.metrics.disk} warningThreshold={80} criticalThreshold={90} />
                </div>
              </div>

              {/* API Metrics */}
              <div>
                <h4 className="text-sm font-medium text-mouse-charcoal mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-mouse-teal" />
                  API Performance
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-mouse-slate">Success Rate</p>
                    <p className="text-lg font-semibold text-green-600">
                      {((employee.apiMetrics.successful / employee.apiMetrics.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-mouse-slate">Failed Calls</p>
                    <p className="text-lg font-semibold text-mouse-charcoal">
                      {employee.apiMetrics.failed}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Ping */}
              <div className="flex items-center justify-between text-sm text-mouse-slate bg-gray-50 rounded-lg p-3">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last Check
                </span>
                <span>{new Date(employee.lastPing).toLocaleString()}</span>
              </div>
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="space-y-3">
              {employee.alerts.length === 0 ? (
                <div className="text-center py-8 text-mouse-slate">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>No active alerts</p>
                </div>
              ) : (
                employee.alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={() => onAcknowledgeAlert(alert.id)}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="text-center py-8 text-mouse-slate">
              <Clock className="w-12 h-12 mx-auto mb-3" />
              <p>Historical data visualization coming soon</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {employee.status === 'down' && (
              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-4 py-2 bg-mouse-navy text-white rounded-lg hover:bg-mouse-navy/90 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Wake Mouse Up 🐭
              </button>
            )}
            {employee.status === 'paused' && (
              <button
                onClick={onResume}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                End Coffee Break ☕
              </button>
            )}
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-mouse-slate hover:text-mouse-charcoal transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Widget Component
export default function EmployeeHealthWidget() {
  const [data, setData] = useState<ReturnType<typeof getDashboardData> | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<HealthCheck | null>(null);
  const [expandedView, setExpandedView] = useState(false);
  const [activeTab, setActiveTab] = useState<"status" | "alerts" | "recoveries" | "costs">("status");
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(() => {
    setRefreshing(true);
    const dashboardData = getDashboardData();
    setData(dashboardData);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleEmployeeClick = (employee: HealthCheck) => {
    setSelectedEmployee(employee);
  };

  const handleRefreshEmployee = async () => {
    if (selectedEmployee) {
      await performHealthCheck(selectedEmployee.employeeId);
      refreshData();
      const updated = getDashboardData().employees.find(
        e => e.employeeId === selectedEmployee.employeeId
      );
      if (updated) setSelectedEmployee(updated);
    }
  };

  const handleRestartVM = async () => {
    if (selectedEmployee) {
      await restartVM(selectedEmployee.employeeId);
      handleRefreshEmployee();
    }
  };

  const handleResumeVM = async () => {
    if (selectedEmployee) {
      await resumeEmployee(selectedEmployee.employeeId);
      handleRefreshEmployee();
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    await acknowledgeAlert(alertId);
    handleRefreshEmployee();
  };

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-6 shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              data.overallStatus === 'healthy' ? 'bg-green-100' :
              data.overallStatus === 'warning' ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              <Heart className={`w-5 h-5 ${
                data.overallStatus === 'healthy' ? 'text-green-600' :
                data.overallStatus === 'warning' ? 'text-amber-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-mouse-charcoal">Employee Health</h3>
              <p className="text-sm text-mouse-slate">
                {data.healthy} healthy, {data.warning} warning, {data.down} down
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpandedView(!expandedView)}
            className="p-2 text-mouse-slate hover:text-mouse-charcoal hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expandedView ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-px bg-gray-100">
          <div className="bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{data.healthy}</p>
            <p className="text-xs text-mouse-slate">Healthy</p>
          </div>
          <div className="bg-white p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{data.warning}</p>
            <p className="text-xs text-mouse-slate">Warning</p>
          </div>
          <div className="bg-white p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{data.down}</p>
            <p className="text-xs text-mouse-slate">Down</p>
          </div>
          <div className="bg-white p-4 text-center">
            <p className="text-2xl font-bold text-mouse-navy">{data.uptimePercentage}%</p>
            <p className="text-xs text-mouse-slate">Uptime</p>
          </div>
        </div>

        {/* Expanded View */}
        {expandedView && (
          <div className="border-t border-gray-100">
            {/* Tabs */}
            <div className="px-6 border-b border-gray-100">
              <nav className="flex gap-6">
                {(["status", "alerts", "recoveries", "costs"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-mouse-teal text-mouse-teal"
                        : "border-transparent text-mouse-slate hover:text-mouse-charcoal"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === "alerts" && data.activeAlerts.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                        {data.activeAlerts.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "status" && (
                <div className="space-y-3">
                  {data.employees.map((employee) => (
                    <button
                      key={employee.employeeId}
                      onClick={() => handleEmployeeClick(employee)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
                          employee.status === 'healthy' ? 'bg-green-500' :
                          employee.status === 'warning' ? 'bg-amber-500' :
                          employee.status === 'down' ? 'bg-red-500' : 'bg-gray-400'
                        }`}>
                          {employee.employeeName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-mouse-charcoal text-sm">{employee.employeeName}</p>
                          <p className="text-xs text-mouse-slate">{employee.vmId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-mouse-slate">CPU</p>
                          <p className={`text-sm font-medium ${employee.metrics.cpu > 80 ? 'text-red-600' : 'text-mouse-charcoal'}`}>
                            {employee.metrics.cpu}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-mouse-slate">Uptime</p>
                          <p className="text-sm font-medium text-mouse-charcoal">{employee.uptimePercentage}%</p>
                        </div>
                        <StatusBadge status={employee.status} />
                        <ChevronDown className="w-4 h-4 text-mouse-slate" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "alerts" && (
                <div className="space-y-3">
                  {data.activeAlerts.length === 0 ? (
                    <div className="text-center py-8 text-mouse-slate">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                      <p>No active alerts</p>
                    </div>
                  ) : (
                    data.activeAlerts.slice(0, 10).map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onAcknowledge={() => handleAcknowledgeAlert(alert.id)}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === "recoveries" && (
                <div className="space-y-3">
                  {data.recentRecoveries.length === 0 ? (
                    <div className="text-center py-8 text-mouse-slate">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                      <p>No recent recovery actions</p>
                    </div>
                  ) : (
                    data.recentRecoveries.map((recovery) => (
                      <div
                        key={recovery.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <RefreshCw className={`w-4 h-4 ${
                            recovery.status === 'completed' ? 'text-green-600' :
                            recovery.status === 'failed' ? 'text-red-600' : 'text-amber-600'
                          }`} />
                          <div>
                            <p className="font-medium text-mouse-charcoal capitalize">
                              {recovery.action.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-mouse-slate">{recovery.reason}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recovery.status === 'completed' ? 'bg-green-100 text-green-700' :
                          recovery.status === 'failed' ? 'bg-red-100 text-red-700' :
                          recovery.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {recovery.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "costs" && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-mouse-slate">Total Cost Savings</p>
                        <p className="text-2xl font-bold text-green-600">${data.costSavingsTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-mouse-navy">{data.paused}</p>
                      <p className="text-xs text-mouse-slate">Auto-Paused VMs</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-mouse-teal">
                        ${(data.costSavingsTotal / Math.max(data.totalEmployees, 1)).toFixed(2)}
                      </p>
                      <p className="text-xs text-mouse-slate">Avg Savings/Employee</p>
                    </div>
                  </div>

                  <div className="text-xs text-mouse-slate bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p>
                      Cost optimization automatically pauses idle VMs after 2 hours of inactivity.
                      VMs are automatically resumed when new tasks are received.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-mouse-slate">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Updated {new Date().toLocaleTimeString()}
            </span>
            {data.activeAlerts.length > 0 && (
              <span className="flex items-center gap-1.5 text-red-600">
                <AlertCircle className="w-4 h-4" />
                {data.activeAlerts.length} active alert{data.activeAlerts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 text-mouse-teal hover:text-mouse-navy transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onRefresh={handleRefreshEmployee}
          onRestart={handleRestartVM}
          onResume={handleResumeVM}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />
      )}
    </>
  );
}
