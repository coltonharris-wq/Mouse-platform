'use client';

import { useEffect, useState, useCallback } from 'react';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { TaskLogEntry } from '@/types/reseller-dashboard';

type TabType = 'scheduled' | 'in_progress' | 'completed';

export default function TaskLogPage() {
  const [tab, setTab] = useState<TabType>('completed');
  const [tasks, setTasks] = useState<TaskLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  const loadTasks = useCallback(async () => {
    if (!resellerId) { setLoading(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        reseller_id: resellerId,
        type: tab,
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (category) params.set('category', category);
      const res = await fetch(`/api/task-log?${params}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      setTasks([]);
    }
    setLoading(false);
  }, [resellerId, tab, category, page]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTabChange = (t: TabType) => {
    setTab(t);
    setPage(0);
  };

  const CATEGORIES = ['', 'inventory', 'email', 'scheduling', 'research', 'call', 'order'];

  const formatCron = (cron: string | null) => {
    if (!cron) return '-';
    // Simple cron humanizer
    if (cron === '0 9 * * *') return 'Daily at 9 AM';
    if (cron === '0 9 * * 1') return 'Weekly on Monday at 9 AM';
    if (cron === '0 */4 * * *') return 'Every 4 hours';
    return cron;
  };

  const formatDuration = (start: string | null) => {
    if (!start) return '-';
    const ms = Date.now() - new Date(start).getTime();
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ${secs % 60}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  const statusIcon = (type: string) => {
    switch (type) {
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const tabs = [
    { key: 'scheduled' as TabType, label: 'Scheduled', icon: Clock },
    { key: 'in_progress' as TabType, label: 'In Progress', icon: Loader2 },
    { key: 'completed' as TabType, label: 'Completed', icon: CheckCircle },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Task Log</h1>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(0); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No {tab.replace('_', ' ')} tasks found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Task</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Category</th>
                  {tab === 'scheduled' && <th className="px-4 py-3 text-left hidden sm:table-cell">Schedule</th>}
                  {tab === 'scheduled' && <th className="px-4 py-3 text-left">Next Run</th>}
                  {tab === 'in_progress' && <th className="px-4 py-3 text-left">Duration</th>}
                  {tab === 'completed' && <th className="px-4 py-3 text-left hidden sm:table-cell">Result</th>}
                  {tab === 'completed' && <th className="px-4 py-3 text-center">Status</th>}
                  <th className="px-4 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {statusIcon(task.type)}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                          {task.description && <p className="text-xs text-gray-400 truncate max-w-xs">{task.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {task.category && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                          {task.category}
                        </span>
                      )}
                    </td>
                    {tab === 'scheduled' && (
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                        {formatCron(task.schedule_cron)}
                      </td>
                    )}
                    {tab === 'scheduled' && (
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {task.next_run_at ? new Date(task.next_run_at).toLocaleString() : '-'}
                      </td>
                    )}
                    {tab === 'in_progress' && (
                      <td className="px-4 py-3 text-sm text-yellow-600 font-mono">
                        {formatDuration(task.started_at)}
                      </td>
                    )}
                    {tab === 'completed' && (
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                        <span className="truncate max-w-xs inline-block">{task.result || '-'}</span>
                      </td>
                    )}
                    {tab === 'completed' && (
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          task.type === 'failed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {task.type === 'failed' ? 'Failed' : 'Success'}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-sm text-gray-400">
                      {(task.completed_at || task.started_at || task.created_at) &&
                        new Date(task.completed_at || task.started_at || task.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between text-sm">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-gray-400">Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={tasks.length < PAGE_SIZE}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
