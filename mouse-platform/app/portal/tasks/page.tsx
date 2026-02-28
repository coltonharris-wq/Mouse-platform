"use client";

import { useState } from "react";
import { taskQueue, employees } from "@/lib/seed-data";

interface NewTask {
  title: string;
  priority: string;
  assignTo: string;
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[priority] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    active: "bg-teal-100 text-teal-700",
    pending: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

const ESTIMATED_TIMES: Record<string, string> = {
  "task-001": "12 min",
  "task-002": "34 min",
  "task-003": "45 min",
  "task-004": "28 min",
  "task-005": "20 min",
};

export default function TasksPage() {
  const portalEmployees = employees.filter((e) => e.customerId === "cust-001");

  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({
    title: "",
    priority: "medium",
    assignTo: portalEmployees[0]?.id ?? "",
  });

  function handleCreate() {
    if (!newTask.title.trim()) return;
    setShowModal(false);
    setNewTask({
      title: "",
      priority: "medium",
      assignTo: portalEmployees[0]?.id ?? "",
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mouse-charcoal">
            Task Queue
          </h1>
          <p className="text-mouse-slate text-sm mt-1">
            All tasks across your AI workforce
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-mouse-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          Create New Task
        </button>
      </div>

      {/* Task list */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-mouse-slate/20 grid grid-cols-12 gap-4">
          <div className="col-span-6 text-xs font-semibold text-mouse-slate uppercase tracking-wide">
            Task Title
          </div>
          <div className="col-span-2 text-xs font-semibold text-mouse-slate uppercase tracking-wide">
            Priority
          </div>
          <div className="col-span-2 text-xs font-semibold text-mouse-slate uppercase tracking-wide">
            Status
          </div>
          <div className="col-span-2 text-xs font-semibold text-mouse-slate uppercase tracking-wide">
            Est. Time
          </div>
        </div>

        <div className="divide-y divide-mouse-slate/10">
          {taskQueue.map((task) => (
            <div
              key={task.id}
              className="px-5 py-4 grid grid-cols-12 gap-4 items-center hover:bg-mouse-offwhite transition-colors"
            >
              <div className="col-span-6">
                <p className="text-mouse-charcoal text-sm font-medium leading-snug">
                  {task.title}
                </p>
              </div>
              <div className="col-span-2">
                <PriorityBadge priority={task.priority} />
              </div>
              <div className="col-span-2">
                <StatusBadge status={task.status} />
              </div>
              <div className="col-span-2">
                <span className="text-mouse-slate text-sm">
                  {ESTIMATED_TIMES[task.id] ?? "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />

          {/* Modal card */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
            <h2 className="text-lg font-bold text-mouse-charcoal mb-5">
              Create New Task
            </h2>

            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Describe the task..."
                  className="w-full border border-mouse-slate/30 rounded-lg px-4 py-2.5 text-sm text-mouse-charcoal placeholder:text-mouse-slate focus:outline-none focus:border-mouse-teal"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="w-full border border-mouse-slate/30 rounded-lg px-4 py-2.5 text-sm text-mouse-charcoal focus:outline-none focus:border-mouse-teal bg-white"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1.5">
                  Assign To
                </label>
                <select
                  value={newTask.assignTo}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      assignTo: e.target.value,
                    }))
                  }
                  className="w-full border border-mouse-slate/30 rounded-lg px-4 py-2.5 text-sm text-mouse-charcoal focus:outline-none focus:border-mouse-teal bg-white"
                >
                  {portalEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-mouse-charcoal text-mouse-charcoal text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTask.title.trim()}
                className="px-5 py-2.5 bg-mouse-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-40 transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
