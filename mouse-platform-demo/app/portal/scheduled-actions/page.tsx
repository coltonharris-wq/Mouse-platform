"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  Pause,
  Play,
  Trash2,
  Edit,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { ACTION_TYPES, getActionType } from "@/lib/scheduled-actions/types";

function getCustomerId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem("mouse_session");
    if (!s) return null;
    const parsed = JSON.parse(s);
    return parsed.customerId || parsed.userId || null;
  } catch {
    return null;
  }
}

interface Action {
  id: string;
  name: string;
  action_type: string;
  employee_id?: string;
  status: string;
  frequency: string;
  schedule_config?: { day?: string; time?: string };
  last_run_at?: string;
  last_run_result?: Record<string, unknown>;
  next_run_at?: string;
}

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const TIMES = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, "0")}:00`
);

export default function ScheduledActionsPage() {
  const customerId = getCustomerId();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [createStep, setCreateStep] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editAction, setEditAction] = useState<Action | null>(null);
  const [editTab, setEditTab] = useState<"schedule" | "settings" | "history">(
    "schedule"
  );
  const [runHistory, setRunHistory] = useState<Array<Record<string, unknown>>>(
    []
  );

  const [form, setForm] = useState({
    action_type: "",
    name: "",
    employee_id: "",
    frequency: "daily",
    schedule_config: { day: "monday", time: "16:00" },
    settings: {} as Record<string, unknown>,
  });

  useEffect(() => {
    if (!customerId) return;
    loadActions();
  }, [customerId]);

  async function loadActions() {
    if (!customerId) return;
    const res = await fetch(
      `/api/scheduled-actions?customerId=${customerId}`
    );
    const data = await res.json();
    setActions(data.actions || []);
    setLoading(false);
  }

  async function handleCreate() {
    if (!customerId || !form.action_type || !form.name) return;
    const type = getActionType(form.action_type);
    const res = await fetch("/api/scheduled-actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        name: form.name,
        action_type: form.action_type,
        capability_number: type?.capability,
        employee_id: form.employee_id || undefined,
        frequency: form.frequency,
        schedule_config: form.schedule_config,
        settings: form.settings,
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      setCreateStep(0);
      setForm({
        action_type: "",
        name: "",
        employee_id: "",
        frequency: "daily",
        schedule_config: { day: "monday", time: "16:00" },
        settings: {},
      });
      loadActions();
    }
  }

  async function handlePause(id: string) {
    await fetch(`/api/scheduled-actions/${id}/pause`, { method: "POST" });
    loadActions();
  }

  async function handleResume(id: string) {
    await fetch(`/api/scheduled-actions/${id}/resume`, { method: "POST" });
    loadActions();
  }

  async function handleRun(id: string) {
    await fetch(`/api/scheduled-actions/${id}/run`, { method: "POST" });
    loadActions();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this scheduled action?")) return;
    await fetch(`/api/scheduled-actions/${id}`, { method: "DELETE" });
    setEditAction(null);
    loadActions();
  }

  async function handleUpdate() {
    if (!editAction) return;
    const res = await fetch(`/api/scheduled-actions/${editAction.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frequency: form.frequency,
        schedule_config: form.schedule_config,
        settings: form.settings,
      }),
    });
    if (res.ok) {
      setEditAction(null);
      loadActions();
    }
  }

  useEffect(() => {
    if (editAction && editTab === "history") {
      fetch(`/api/scheduled-actions/${editAction.id}/history`)
        .then((r) => r.json())
        .then((d) => setRunHistory(d.runs || []));
    }
  }, [editAction, editTab]);

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const typeInfo = form.action_type
    ? getActionType(form.action_type)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-mouse-teal animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mouse-navy">
            Scheduled Actions
          </h1>
          <p className="text-mouse-slate mt-1">
            Your AI employees are working automatically
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90"
        >
          <Plus className="w-5 h-5" /> New
        </button>
      </div>

      {actions.length === 0 && !showCreate ? (
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-12 text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-mouse-charcoal mb-2">
            Your AI employees can work on autopilot
          </h3>
          <p className="text-mouse-slate mb-6 max-w-md mx-auto">
            Set up scheduled actions so your employees: follow up with leads
            automatically, test your business quality weekly, generate help
            content from conversations, and more.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90"
          >
            Create First Action
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((a) => {
            const type = getActionType(a.action_type);
            return (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-mouse-slate/20 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-mouse-charcoal flex items-center gap-2">
                      <span>{type?.icon || "⚡"}</span>
                      {a.name}
                    </h3>
                    <p className="text-sm text-mouse-slate mt-1">
                      Employee: {a.employee_id || "Any"} • Status:{" "}
                      <span
                        className={
                          a.status === "active"
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        ● {a.status}
                      </span>
                    </p>
                    <p className="text-sm text-mouse-slate mt-1">
                      Schedule: Every{" "}
                      {a.frequency === "daily"
                        ? "day"
                        : a.frequency === "weekly"
                        ? a.schedule_config?.day || "week"
                        : a.frequency}{" "}
                      at {a.schedule_config?.time || "4:00 PM"}
                    </p>
                    <p className="text-sm text-mouse-slate mt-1">
                      Last run: {formatDate(a.last_run_at)} • Next run:{" "}
                      {a.status === "paused"
                        ? "Paused"
                        : formatDate(a.next_run_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditAction(a);
                        setForm({
                          ...form,
                          frequency: a.frequency,
                          schedule_config:
                            a.schedule_config || form.schedule_config,
                        });
                        setEditTab("schedule");
                      }}
                      className="p-2 text-mouse-slate hover:text-mouse-teal hover:bg-mouse-offwhite rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {a.status === "active" ? (
                      <button
                        onClick={() => handlePause(a.id)}
                        className="p-2 text-mouse-slate hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResume(a.id)}
                        className="p-2 text-mouse-slate hover:text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRun(a.id)}
                      className="p-2 text-mouse-slate hover:text-mouse-teal hover:bg-mouse-teal/10 rounded-lg"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2 text-mouse-slate hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-mouse-slate/20">
              <h2 className="text-xl font-bold text-mouse-navy">
                Create Scheduled Action
              </h2>
              <p className="text-sm text-mouse-slate mt-1">
                Step {createStep + 1} of 3
              </p>
            </div>
            <div className="p-6">
              {createStep === 0 && (
                <div>
                  <h3 className="font-semibold text-mouse-charcoal mb-4">
                    Choose Action Type
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {ACTION_TYPES.slice(0, 6).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setForm((p) => ({
                            ...p,
                            action_type: t.id,
                            name: t.name,
                          }));
                        }}
                        className={`w-full p-4 rounded-xl border-2 text-left ${
                          form.action_type === t.id
                            ? "border-mouse-teal bg-mouse-teal/5"
                            : "border-mouse-slate/20 hover:border-mouse-teal/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{t.icon}</span>
                          <span className="font-semibold">{t.name}</span>
                        </div>
                        <p className="text-sm text-mouse-slate mt-1">
                          {t.description}
                        </p>
                        <p className="text-xs text-mouse-slate mt-1">
                          Best for: {t.bestFor}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {createStep === 1 && (
                <div>
                  <h3 className="font-semibold text-mouse-charcoal mb-4">
                    When should this run?
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-2">
                        Frequency
                      </label>
                      <select
                        value={form.frequency}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            frequency: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-mouse-slate/20 rounded-lg"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    {form.frequency === "weekly" && (
                      <div>
                        <label className="block text-sm font-medium text-mouse-charcoal mb-2">
                          Day
                        </label>
                        <select
                          value={form.schedule_config.day}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              schedule_config: {
                                ...p.schedule_config,
                                day: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-4 py-2 border border-mouse-slate/20 rounded-lg"
                        >
                          {DAYS.map((d) => (
                            <option key={d} value={d}>
                              {d.charAt(0).toUpperCase() + d.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-mouse-charcoal mb-2">
                        Time
                      </label>
                      <select
                        value={form.schedule_config.time}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            schedule_config: {
                              ...p.schedule_config,
                              time: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-4 py-2 border border-mouse-slate/20 rounded-lg"
                      >
                        {TIMES.map((t) => (
                          <option key={t} value={t}>
                            {parseInt(t, 10) === 0
                              ? "12:00 AM"
                              : parseInt(t, 10) < 12
                              ? `${parseInt(t, 10)}:00 AM`
                              : parseInt(t, 10) === 12
                              ? "12:00 PM"
                              : `${parseInt(t, 10) - 12}:00 PM`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {createStep === 2 && (
                <div>
                  <h3 className="font-semibold text-mouse-charcoal mb-4">
                    Review & Create
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Action:</strong> {typeInfo?.icon} {form.name}
                    </p>
                    <p>
                      <strong>Schedule:</strong> Every{" "}
                      {form.frequency === "daily"
                        ? "day"
                        : form.frequency === "weekly"
                        ? form.schedule_config.day
                        : form.frequency}{" "}
                      at {form.schedule_config.time}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-mouse-slate/20 flex justify-between">
              <button
                onClick={() =>
                  createStep === 0
                    ? setShowCreate(false)
                    : setCreateStep((s) => s - 1)
                }
                className="px-4 py-2 text-mouse-slate hover:underline flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {createStep < 2 ? (
                <button
                  onClick={() => setCreateStep((s) => s + 1)}
                  disabled={createStep === 0 && !form.action_type}
                  className="px-6 py-2 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90 disabled:opacity-50 flex items-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  className="px-6 py-2 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90 flex items-center gap-2"
                >
                  Create Action
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-mouse-slate/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-mouse-navy">
                Edit Action — {editAction.name}
              </h2>
              <button
                onClick={() => setEditAction(null)}
                className="p-2 hover:bg-mouse-offwhite rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-4">
                {(["schedule", "settings", "history"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setEditTab(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      editTab === t
                        ? "bg-mouse-teal text-white"
                        : "bg-mouse-offwhite text-mouse-slate hover:bg-mouse-slate/20"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              {editTab === "schedule" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Frequency
                    </label>
                    <select
                      value={form.frequency}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, frequency: e.target.value }))
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  {form.frequency === "weekly" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Day
                      </label>
                      <select
                        value={form.schedule_config.day}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            schedule_config: {
                              ...p.schedule_config,
                              day: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d.charAt(0).toUpperCase() + d.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time
                    </label>
                    <select
                      value={form.schedule_config.time}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          schedule_config: {
                            ...p.schedule_config,
                            time: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      {TIMES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {editTab === "settings" && (
                <p className="text-mouse-slate text-sm">
                  Action-specific settings can be configured here.
                </p>
              )}
              {editTab === "history" && (
                <div className="space-y-2">
                  {runHistory.length === 0 ? (
                    <p className="text-mouse-slate text-sm">
                      No runs yet
                    </p>
                  ) : (
                    runHistory.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-mouse-slate/10 text-sm"
                      >
                        {new Date(r.started_at as string).toLocaleString()} —{" "}
                        {String(r.status)}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-mouse-slate/20 flex justify-end gap-2">
              <button
                onClick={() => setEditAction(null)}
                className="px-4 py-2 text-mouse-slate hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
