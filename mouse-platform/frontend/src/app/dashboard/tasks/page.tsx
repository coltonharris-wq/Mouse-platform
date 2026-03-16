'use client';

import { useEffect, useState } from 'react';
import { Loader2, Zap, Clock, CheckCircle, ListTodo, PlayCircle, Plus, X, Send } from 'lucide-react';
import ScreenReplay from '@/components/dashboard/ScreenReplay';

type TaskTab = 'working' | 'scheduled' | 'completed';

interface TaskItem {
  id: string;
  title?: string;
  type: string;
  description: string;
  status: string;
  timestamp: string;
  billed_hours?: number;
}

export default function TasksPage() {
  const [tab, setTab] = useState<TaskTab>('working');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replayTaskId, setReplayTaskId] = useState<string | null>(null);

  // New task form
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newScheduleAt, setNewScheduleAt] = useState('');
  const [creating, setCreating] = useState(false);

  const customerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('customer_id') || 'demo'
    : 'demo';

  const loadTasks = () => {
    setLoading(true);
    fetch(`/api/tasks?customer_id=${customerId}`)
      .then((r) => r.json())
      .then((data) => {
        const items: TaskItem[] = (data.tasks || []).map(
          (t: { id: string; title?: string; description: string; status: string; timestamp: string; type: string; billed_hours?: number }) => ({
            id: t.id,
            title: t.title,
            type: t.type || 'task',
            description: t.description || 'Task',
            status: t.status === 'pending' ? 'scheduled' : t.status === 'running' ? 'working' : t.status,
            timestamp: t.timestamp,
            billed_hours: t.billed_hours,
          })
        );
        setTasks(items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTask = async () => {
    if (!newDescription.trim()) return;
    setCreating(true);
    try {
      const body: Record<string, string> = {
        customer_id: customerId,
        title: newTitle.trim() || newDescription.trim().slice(0, 60),
        description: newDescription.trim(),
      };
      if (newScheduleAt) {
        body.schedule_at = new Date(newScheduleAt).toISOString();
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setShowNewTask(false);
        setNewTitle('');
        setNewDescription('');
        setNewScheduleAt('');
        loadTasks();
      } else {
        alert(data.error || 'Failed to create task');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setCreating(false);
  };

  const filtered = tasks.filter((t) => t.status === tab);

  const TABS: { key: TaskTab; label: string; icon: typeof Zap }[] = [
    { key: 'working', label: 'Working', icon: Zap },
    { key: 'scheduled', label: 'Scheduled', icon: Clock },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#0F6B6E] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-[#0B1F3B]">Tasks</h1>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 bg-[#0F6B6E] text-white px-5 py-3 rounded-xl text-lg font-semibold hover:bg-[#0B5456] transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowNewTask(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-[#0B1F3B] mb-6">Create a Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Send weekly report"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Tell King Mouse what to do..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={newScheduleAt}
                  onChange={(e) => setNewScheduleAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
                />
                <p className="text-base text-gray-400 mt-1">Leave empty to run immediately</p>
              </div>
              <button
                onClick={handleCreateTask}
                disabled={!newDescription.trim() || creating}
                className="w-full bg-[#0F6B6E] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#0B5456] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
                ) : (
                  <><Send className="w-5 h-5" /> {newScheduleAt ? 'Schedule Task' : 'Run Now'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Tabs */}
      <div className="flex gap-2 mb-8">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = tasks.filter((tk) => tk.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-lg font-semibold transition-all ${
                tab === t.key
                  ? 'bg-[#0F6B6E] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              {t.label}
              {count > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-sm ${
                  tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ListTodo className="w-14 h-14 mx-auto mb-4 text-gray-300" />
            <p className="text-xl">No {tab} tasks</p>
            <p className="text-lg mt-2">
              {tab === 'working'
                ? 'King Mouse will show active work here.'
                : tab === 'scheduled'
                ? 'Scheduled tasks will appear here.'
                : 'Completed tasks will be listed here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-5 hover:bg-gray-50">
                <div className={`p-3 rounded-lg ${
                  task.status === 'working'
                    ? 'bg-teal-100 text-teal-600'
                    : task.status === 'scheduled'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {task.status === 'working' ? <Zap className="w-5 h-5" /> :
                   task.status === 'scheduled' ? <Clock className="w-5 h-5" /> :
                   <CheckCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-900">{task.title || task.description}</p>
                  {task.title && task.description !== task.title && (
                    <p className="text-base text-gray-500 mt-0.5 truncate">{task.description}</p>
                  )}
                  <p className="text-base text-gray-400 mt-1">
                    {new Date(task.timestamp).toLocaleString()}
                  </p>
                </div>
                {task.status === 'completed' && (
                  <button
                    onClick={() => setReplayTaskId(task.id)}
                    className="flex items-center gap-1.5 text-base text-[#0F6B6E] font-medium hover:underline shrink-0"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Watch Replay
                  </button>
                )}
                <span className={`text-base px-3 py-1 rounded-full font-medium ${
                  task.status === 'working'
                    ? 'bg-teal-100 text-teal-700'
                    : task.status === 'scheduled'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screen Replay Overlay */}
      {replayTaskId && (
        <ScreenReplay taskId={replayTaskId} onClose={() => setReplayTaskId(null)} />
      )}
    </div>
  );
}
