'use client';

import { useEffect, useState } from 'react';
import { History, MessageSquare, Zap, Bell, Filter } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'chat' | 'task' | 'call' | 'notification';
  description: string;
  timestamp: string;
}

const TYPE_CONFIG = {
  chat: { icon: MessageSquare, color: 'bg-blue-100 text-blue-600', label: 'Chat' },
  task: { icon: Zap, color: 'bg-teal-100 text-teal-600', label: 'Task' },
  call: { icon: History, color: 'bg-purple-100 text-purple-600', label: 'Call' },
  notification: { icon: Bell, color: 'bg-yellow-100 text-yellow-600', label: 'Notification' },
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = sessionStorage.getItem('customer_id') || 'demo';

    Promise.all([
      fetch(`/api/vm/telemetry?customer_id=${customerId}&limit=50`).then((r) => r.json()).catch(() => ({ sessions: [] })),
    ]).then(([telemetry]) => {
      const items: ActivityItem[] = (telemetry.sessions || []).map((s: { id: string; started_at: string; billed_hours: number }) => ({
        id: s.id,
        type: 'task' as const,
        description: `Work session: ${(s.billed_hours || 0).toFixed(2)} hours`,
        timestamp: s.started_at,
      }));
      setActivities(items.sort((a: ActivityItem, b: ActivityItem) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'all' ? activities : activities.filter((a) => a.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3B]">Activity Log</h1>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="all">All</option>
            <option value="chat">Chat</option>
            <option value="task">Tasks</option>
            <option value="call">Calls</option>
            <option value="notification">Notifications</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <History className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No activity yet</p>
            <p className="text-sm mt-1">KingMouse will log everything here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((item) => {
              const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.task;
              const Icon = config.icon;
              return (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
