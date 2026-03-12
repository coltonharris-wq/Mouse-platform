'use client';

import { useEffect, useState } from 'react';
import { Loader2, Zap, Clock, CheckCircle, ListTodo, PlayCircle } from 'lucide-react';
import ScreenReplay from '@/components/dashboard/ScreenReplay';

type TaskTab = 'working' | 'scheduled' | 'completed';

interface TaskItem {
  id: string;
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

  useEffect(() => {
    const customerId = sessionStorage.getItem('customer_id') || 'demo';

    fetch(`/api/vm/telemetry?customer_id=${customerId}&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        const items: TaskItem[] = (data.sessions || []).map(
          (s: { id: string; started_at: string; ended_at?: string; billed_hours: number; status?: string }) => ({
            id: s.id,
            type: 'task',
            description: `Work session: ${(s.billed_hours || 0).toFixed(2)} hours`,
            status: s.ended_at ? 'completed' : (s.status === 'scheduled' ? 'scheduled' : 'working'),
            timestamp: s.started_at,
            billed_hours: s.billed_hours,
          })
        );
        setTasks(items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
      <h1 className="text-4xl font-bold text-[#0B1F3B] mb-8">Tasks</h1>

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
                  <p className="text-lg text-gray-900">{task.description}</p>
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
