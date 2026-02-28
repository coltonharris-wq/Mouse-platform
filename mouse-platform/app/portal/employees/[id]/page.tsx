"use client";

import React, { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { employees, activityFeed, taskQueue } from "@/lib/seed-data";

type TabKey = "activity" | "tasks" | "chat" | "screen-replay" | "kpis";

const TABS: { key: TabKey; label: string }[] = [
  { key: "activity", label: "Activity Feed" },
  { key: "tasks", label: "Task Queue" },
  { key: "chat", label: "Chat" },
  { key: "screen-replay", label: "Screen Replay" },
  { key: "kpis", label: "KPIs" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-mouse-green text-white",
    working: "bg-mouse-teal text-white",
    idle: "bg-mouse-slate text-white",
    error: "bg-mouse-red text-white",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
        styles[status] ?? "bg-gray-400 text-white"
      }`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[priority] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {priority}
    </span>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    active: "bg-teal-100 text-teal-700",
    pending: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const employee = employees.find((e) => e.id === resolvedParams.id);

  if (!employee) {
    notFound();
  }

  const [activeTab, setActiveTab] = useState<TabKey>("activity");
  const [chatInput, setChatInput] = useState("");

  const employeeActivity = activityFeed.filter(
    (a) => a.employeeId === employee.id
  );
  const activityItems =
    employeeActivity.length > 0 ? employeeActivity : activityFeed;

  const employeeTasks = taskQueue.filter((t) => t.employeeId === employee.id);
  const tasks = employeeTasks.length > 0 ? employeeTasks : taskQueue;

  const hoursWorkedToday = +(employee.hoursSaved * 0.07).toFixed(1);

  return (
    <div>
      {/* Back link */}
      <div className="mb-5">
        <Link
          href="/portal/employees"
          className="text-mouse-teal text-sm hover:underline"
        >
          &larr; Back to Employees
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4 flex-wrap mb-5">
          <div className="w-14 h-14 bg-mouse-navy rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">
              {employee.name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-mouse-charcoal">
                {employee.name}
              </h1>
              <StatusBadge status={employee.status} />
            </div>
            <p className="text-mouse-slate text-sm mt-0.5">{employee.role}</p>
          </div>
        </div>

        {/* 3 KPI widgets */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-4">
            <div className="text-xl font-bold text-mouse-charcoal">
              {hoursWorkedToday}
            </div>
            <div className="text-mouse-slate text-xs mt-0.5">
              Hours Worked Today
            </div>
          </div>
          <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-4">
            <div className="text-xl font-bold text-mouse-charcoal">
              {employee.tasksToday}
            </div>
            <div className="text-mouse-slate text-xs mt-0.5">Tasks Today</div>
          </div>
          <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-4">
            <div className="text-xl font-bold text-mouse-green">
              {employee.valueGenerated > 0
                ? `$${employee.valueGenerated.toLocaleString()}`
                : "—"}
            </div>
            <div className="text-mouse-slate text-xs mt-0.5">
              Value Generated
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-mouse-slate/20 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "text-mouse-teal border-mouse-teal"
                  : "text-mouse-slate border-transparent hover:text-mouse-charcoal"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Activity Feed Tab */}
          {activeTab === "activity" && (
            <div className="divide-y divide-mouse-slate/10">
              {activityItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-3.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      item.status === "success"
                        ? "bg-mouse-green"
                        : "bg-mouse-red"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-mouse-charcoal text-sm">
                      {item.action}
                    </div>
                    <div className="text-mouse-slate text-xs mt-0.5">
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Task Queue Tab */}
          {activeTab === "tasks" && (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-mouse-slate/20 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-mouse-charcoal text-sm font-medium flex-1">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </div>
                  {task.status === "active" && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full bg-mouse-slate/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-mouse-teal rounded-full transition-all"
                          style={{ width: "45%" }}
                        />
                      </div>
                      <p className="text-mouse-slate text-xs mt-1">
                        In progress
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex flex-col" style={{ minHeight: "320px" }}>
              <div className="flex-1 flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 rounded-full bg-mouse-teal flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-2xl">
                    {employee.name[0]}
                  </span>
                </div>
                <p className="text-mouse-charcoal text-sm font-medium">
                  Send a message to your AI Employee
                </p>
                <p className="text-mouse-slate text-xs mt-1">
                  {employee.name} will respond based on current task context.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-mouse-slate/20">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Message ${employee.name}...`}
                  className="flex-1 border border-mouse-slate/30 rounded-lg px-4 py-2.5 text-sm text-mouse-charcoal placeholder:text-mouse-slate focus:outline-none focus:border-mouse-teal"
                />
                <button className="px-5 py-2.5 bg-mouse-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Screen Replay Tab */}
          {activeTab === "screen-replay" && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Lock
                size={48}
                className="text-mouse-slate mb-5"
                strokeWidth={1.5}
              />
              <h3 className="text-lg font-bold text-mouse-charcoal mb-2">
                Audit &amp; Compliance Logs
              </h3>
              <p className="text-mouse-slate text-sm max-w-sm leading-relaxed mb-6">
                Screen replay and audit logs are available on the Enterprise
                plan. Upgrade to access full compliance features.
              </p>
              <button className="px-6 py-3 bg-mouse-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                Upgrade to Enterprise
              </button>
              <div className="mt-5 inline-flex items-center gap-2 bg-mouse-navy/5 border border-mouse-navy/10 rounded-lg px-4 py-2">
                <span className="text-mouse-navy text-xs font-semibold">
                  Enterprise Feature
                </span>
              </div>
            </div>
          )}

          {/* KPIs Tab */}
          {activeTab === "kpis" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-mouse-offwhite rounded-xl border border-mouse-slate/20 p-6">
                <div className="text-3xl font-bold text-mouse-green mb-1">
                  {employee.hoursSaved}
                </div>
                <div className="text-mouse-charcoal text-sm font-medium">
                  Hours Worked This Month
                </div>
                <div className="text-mouse-slate text-xs mt-0.5">
                  Across all active sessions
                </div>
              </div>

              <div className="bg-mouse-offwhite rounded-xl border border-mouse-slate/20 p-6">
                <div className="text-3xl font-bold text-mouse-green mb-1">
                  {employee.tasksToday * 22}
                </div>
                <div className="text-mouse-charcoal text-sm font-medium">
                  Tasks Completed Total
                </div>
                <div className="text-mouse-slate text-xs mt-0.5">
                  Lifetime cumulative count
                </div>
              </div>

              <div className="bg-mouse-offwhite rounded-xl border border-mouse-slate/20 p-6">
                <div className="text-3xl font-bold text-mouse-green mb-1">
                  {employee.valueGenerated > 0
                    ? `$${employee.valueGenerated.toLocaleString()}`
                    : "—"}
                </div>
                <div className="text-mouse-charcoal text-sm font-medium">
                  Estimated Value Generated
                </div>
                <div className="text-mouse-slate text-xs mt-0.5">
                  Based on hourly rate model
                </div>
              </div>

              <div className="bg-mouse-offwhite rounded-xl border border-mouse-slate/20 p-6">
                <div className="text-3xl font-bold text-mouse-green mb-1">
                  {employee.fteEquivalent} FTE
                </div>
                <div className="text-mouse-charcoal text-sm font-medium">
                  FTE Equivalent
                </div>
                <div className="text-mouse-slate text-xs mt-0.5">
                  Equivalent full-time headcount
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
