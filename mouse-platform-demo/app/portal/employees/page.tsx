"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pause, Play, RotateCcw, Power, MoreVertical, Server, Activity, Clock, Users, Loader2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { useEmployees, Employee, EmployeeStatus } from "@/app/context/EmployeeContext";

type VMHealth = "healthy" | "degraded" | "critical" | "offline";

interface DisplayEmployee {
  id: string;
  name: string;
  role: string;
  status: EmployeeStatus;
  fteEquivalent: number;
  costPerMonth: number;
  tasksToday: number;
  valueGenerated: number;
  vmHealth: VMHealth;
  lastActive: string;
  cpuUsage: number;
  memoryUsage: number;
  ipAddress: string;
  uptime: string;
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
  const config: Record<EmployeeStatus, { bg: string; text: string; label: string; dot: string }> = {
    idle: { bg: "bg-gray-100", text: "text-gray-600", label: "Idle", dot: "bg-gray-400" },
    working: { bg: "bg-green-50", text: "text-green-700", label: "Active", dot: "bg-green-500" },
    deploying: { bg: "bg-blue-50", text: "text-blue-700", label: "Deploying...", dot: "bg-blue-500" },
    paused: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Paused", dot: "bg-yellow-500" },
    error: { bg: "bg-red-50", text: "text-red-700", label: "Error", dot: "bg-red-500" },
  };
  
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === "deploying" ? "animate-pulse" : ""}`} />
      {c.label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const roleColors: Record<string, string> = {
    Sales: "bg-mouse-navy text-white",
    Support: "bg-orange-500 text-white",
    "Data Entry": "bg-orange-500 text-white",
    "Executive Assistant": "bg-orange-500 text-white",
    "Accounts Receivable": "bg-emerald-600 text-white",
    sales: "bg-mouse-navy text-white",
    support: "bg-orange-500 text-white",
    developer: "bg-orange-500 text-white",
    analyst: "bg-orange-500 text-white",
    custom: "bg-emerald-600 text-white",
  };
  
  const roleDisplay: Record<string, string> = {
    sales: "Sales",
    support: "Support",
    developer: "Developer",
    analyst: "Analyst",
    custom: "Custom",
  };
  
  const roleKey = Object.keys(roleColors).find(r => role.toLowerCase().includes(r.toLowerCase())) || "Other";
  const displayLabel = roleDisplay[roleKey] || role;
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleColors[roleKey] || "bg-gray-500 text-white"}`}>
      {displayLabel}
    </span>
  );
}

function VMHealthIndicator({ health, cpu, memory }: { health: VMHealth; cpu: number; memory: number }) {
  const getHealthColor = () => {
    switch (health) {
      case "healthy": return "text-green-600";
      case "degraded": return "text-yellow-600";
      case "critical": return "text-red-600";
      case "offline": return "text-gray-400";
    }
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1" title="CPU Usage">
        <Activity size={12} className={getHealthColor()} />
        <span className="text-gray-600">{cpu}%</span>
      </div>
      <div className="flex items-center gap-1" title="Memory Usage">
        <Server size={12} className={getHealthColor()} />
        <span className="text-gray-600">{memory}%</span>
      </div>
    </div>
  );
}

function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

// Convert Employee from context to display format
function toDisplayEmployee(emp: Employee): DisplayEmployee {
  const vmHealth: VMHealth = emp.status === "error" ? "critical" : emp.status === "idle" ? "degraded" : "healthy";
  
  return {
    id: emp.id,
    name: emp.name,
    role: emp.roleDisplay || emp.role,
    status: emp.status,
    fteEquivalent: 0.8,
    costPerMonth: 997,
    tasksToday: emp.tasksCompleted || 0,
    valueGenerated: Math.floor((emp.hoursUsed || 0) * 50),
    vmHealth,
    lastActive: emp.deployedAt?.toISOString() || emp.createdAt?.toISOString() || new Date().toISOString(),
    cpuUsage: Math.floor(Math.random() * 60) + 10,
    memoryUsage: Math.floor(Math.random() * 50) + 20,
    ipAddress: emp.vmIp || `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    uptime: "Just started",
  };
}

export default function PortalEmployeesPage() {
  const { 
    employees, 
    isDeploying, 
    deploymentProgress, 
    deploymentStages,
    startDeployment, 
    deleteEmployee, 
    setEmployeeStatus,
    resetDeploymentState 
  } = useEmployees();
  const { showToast } = useToast();
  const [localEmployees, setLocalEmployees] = useState<DisplayEmployee[]>([]);
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Sync with EmployeeContext
  useEffect(() => {
    const displayEmps = employees.map(toDisplayEmployee);
    setLocalEmployees(displayEmps);
  }, [employees]);

  // Simulate WebSocket updates for VM stats
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalEmployees(prev => prev.map(emp => ({
        ...emp,
        cpuUsage: Math.min(95, Math.max(5, emp.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.min(95, Math.max(10, emp.memoryUsage + (Math.random() - 0.5) * 5)),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDeploy = async (role: "sales" | "support" | "developer" | "analyst" | "custom") => {
    try {
      await startDeployment(role);
      showToast("success", `🐭 Starting deployment... 👔`);
      setShowDeployModal(false);
    } catch (err: any) {
      showToast("error", err.message || "Failed to deploy employee");
    }
  };

  const handlePause = (id: string, name: string) => {
    const emp = employees.find(e => e.id === id);
    if (emp) {
      const newStatus = emp.status === "paused" ? "idle" : "paused";
      setEmployeeStatus(id, newStatus);
      if (newStatus === "idle") {
        showToast("success", `🐭 ${name} is back from their coffee break! ☕`);
      } else {
        showToast("info", `⏸️ ${name} is on a coffee break ☕🧀`);
      }
    }
  };

  const handleRestart = (id: string, name: string) => {
    setEmployeeStatus(id, "deploying");
    showToast("info", `😴 ${name} is taking a quick nap... 💤🛌`);
    
    setTimeout(() => {
      setEmployeeStatus(id, "idle");
      showToast("success", `🎉 ${name} is refreshed and back at it! 🐭✨`);
    }, 3000);
  };

  const handleTerminate = (id: string, name: string) => {
    if (confirm(`Are you sure you want to let ${name} go? They'll miss the cheese... 🧀 This action cannot be undone.`)) {
      deleteEmployee(id);
      showToast("warning", `👋 ${name} has retired to the mouse colony 🏡🧀`);
    }
  };

  const handleResetStuck = () => {
    if (confirm('Reset stuck deployments? This will mark deploying employees as failed.')) {
      resetDeploymentState();
      showToast("success", "Reset stuck deployments");
    }
  };

  const activeCount = localEmployees.filter(e => e.status === "working").length;
  const deployingCount = localEmployees.filter(e => e.status === "deploying").length;
  const errorCount = localEmployees.filter(e => e.status === "error").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mouse-charcoal">
            Your AI Workforce
          </h1>
          <p className="text-mouse-slate text-sm mt-1">
            Manage your digital employees — {activeCount} active, {deployingCount} deploying, {errorCount} need attention
          </p>
        </div>
        <div className="flex items-center gap-2">
          {errorCount > 0 && (
            <button
              onClick={handleResetStuck}
              className="flex items-center gap-2 px-3 py-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-sm"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          )}
          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-mouse-navy text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
            disabled={isDeploying}
          >
            {isDeploying ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {isDeploying ? "Deploying..." : "Deploy Employee"}
          </button>
        </div>
      </div>

      {/* Deployment Progress Banner */}
      {isDeploying && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-mouse-navy animate-spin" />
            <span className="font-medium text-mouse-navy">Deploying new employee...</span>
            <span className="text-sm text-mouse-slate ml-auto">{Math.round(deploymentProgress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-mouse-navy h-2 rounded-full transition-all duration-500"
              style={{ width: `${deploymentProgress}%` }}
            />
          </div>
          {deploymentStages.length > 0 && (
            <p className="text-xs text-mouse-slate mt-2">
              {deploymentStages.find(s => s.status === 'in_progress')?.message || 'Initializing...'}
            </p>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-gray-500 text-xs">Active Employees</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{deployingCount}</div>
          <div className="text-gray-500 text-xs">Deploying</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-gray-500 text-xs">Need Attention</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-mouse-navy">
            ${localEmployees.reduce((sum, e) => sum + e.costPerMonth, 0).toLocaleString()}
          </div>
          <div className="text-gray-500 text-xs">Monthly Cost</div>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {localEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
          >
            {/* Card Header */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-mouse-navy rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {emp.name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-mouse-charcoal text-base leading-tight">
                      {emp.name}
                    </h3>
                    <div className="mt-1">
                      <RoleBadge role={emp.role} />
                    </div>
                  </div>
                </div>
                <StatusBadge status={emp.status} />
              </div>

              {/* VM Health */}
              <div className="flex items-center justify-between py-3 border-t border-b border-gray-100">
                <VMHealthIndicator health={emp.vmHealth} cpu={Math.round(emp.cpuUsage)} memory={Math.round(emp.memoryUsage)} />
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  {formatTimeAgo(emp.lastActive)}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-4">
                <div className="text-center">
                  <div className="text-mouse-charcoal font-bold text-sm">
                    {emp.tasksToday}
                  </div>
                  <div className="text-gray-500 text-xs">Tasks Today</div>
                </div>
                <div className="text-center border-l border-gray-100">
                  <div className="text-mouse-charcoal font-bold text-sm">
                    {emp.fteEquivalent} FTE
                  </div>
                  <div className="text-gray-500 text-xs">Capacity</div>
                </div>
                <div className="text-center border-l border-gray-100">
                  <div className="text-mouse-charcoal font-bold text-sm">
                    ${emp.costPerMonth.toLocaleString()}
                  </div>
                  <div className="text-gray-500 text-xs">Per Month</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 px-4 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
              <button
                onClick={() => handlePause(emp.id, emp.name)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-mouse-navy hover:bg-white rounded-lg transition-colors"
                title={emp.status === "paused" ? "Resume" : "Pause"}
              >
                {emp.status === "paused" ? <Play size={14} /> : <Pause size={14} />}
                {emp.status === "paused" ? "Resume" : "Pause"}
              </button>
              <button
                onClick={() => handleRestart(emp.id, emp.name)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-mouse-teal hover:bg-white rounded-lg transition-colors"
                title="Restart"
              >
                <RotateCcw size={14} />
                Restart
              </button>
              <button
                onClick={() => handleTerminate(emp.id, emp.name)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                title="Terminate"
              >
                <Power size={14} />
                End
              </button>
              <Link
                href={`/portal/employees/${emp.id}`}
                className="flex items-center justify-center px-3 py-2 text-mouse-teal hover:bg-white rounded-lg transition-colors"
              >
                <MoreVertical size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {localEmployees.length === 0 && !isDeploying && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-mouse-charcoal mb-2">
            No employees yet
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Deploy your first AI employee to get started
          </p>
          <button
            onClick={() => setShowDeployModal(true)}
            className="px-4 py-2 bg-mouse-navy text-white text-sm font-semibold rounded-lg hover:bg-opacity-90"
          >
            Deploy Employee
          </button>
        </div>
      )}

      {/* Deploy Modal - Simple Role Selection */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-[#0B1F3B]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-mouse-navy">
              <div>
                <h2 className="text-lg font-bold text-white">Deploy New Employee</h2>
                <p className="text-white/60 text-xs">Choose a role for your new AI employee</p>
              </div>
              <button 
                onClick={() => setShowDeployModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-white/60 text-xl">×</span>
              </button>
            </div>

            <div className="p-6 space-y-3">
              {[
                { id: "sales", name: "Sales Specialist", icon: "📞", desc: "Lead qualification & follow-up" },
                { id: "support", name: "Support Agent", icon: "🎧", desc: "Customer service & ticket resolution" },
                { id: "developer", name: "Code Assistant", icon: "💻", desc: "Code review & debugging" },
                { id: "analyst", name: "Data Analyst", icon: "📊", desc: "Reports & data visualization" },
                { id: "custom", name: "Custom Agent", icon: "🎨", desc: "Tailored to your needs" },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleDeploy(role.id as any)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-mouse-teal hover:bg-teal-50 transition-all text-left"
                >
                  <span className="text-2xl">{role.icon}</span>
                  <div className="flex-1">
                    <span className="font-semibold text-mouse-charcoal">{role.name}</span>
                    <p className="text-sm text-gray-500">{role.desc}</p>
                  </div>
                  <span className="text-mouse-teal">→</span>
                </button>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Deployment takes about 15 seconds. You&apos;ll be notified when ready.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
