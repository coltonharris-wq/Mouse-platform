'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-browser';

type FilterTab = 'all' | 'active' | 'completed' | 'scheduled';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  type: string;
  hours_used: number;
  created_at: string;
}

const TYPE_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  auto: { bg: '#E1F5EE', text: '#0F6E56' },
  manual: { bg: '#FAEEDA', text: '#854F0B' },
  urgent: { bg: '#FCEBEB', text: '#A32D2D' },
  scheduled: { bg: '#E8F0FE', text: '#2563EB' },
};

const STATUS_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  active: { bg: '#E8F0FE', text: '#2563EB' },
  completed: { bg: '#E1F5EE', text: '#0F6E56' },
  scheduled: { bg: '#FAEEDA', text: '#854F0B' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createBrowserClient();

    async function loadTasks() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: usageData } = await supabase
          .from('usage_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (usageData) {
          const taskList: Task[] = usageData.map((event) => ({
            id: event.id,
            title: event.service || 'Task',
            description: event.description,
            status: event.status || 'completed',
            type: event.type || event.service || 'auto',
            hours_used: event.hours_used || 0,
            created_at: event.created_at,
          }));
          setTasks(taskList);

          const alreadyCompleted = new Set(
            taskList.filter((t) => t.status === 'completed').map((t) => t.id)
          );
          setCompletedIds(alreadyCompleted);
        }
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getEffectiveStatus = (task: Task): string => {
    if (completedIds.has(task.id)) return 'completed';
    if (task.status === 'completed' && !completedIds.has(task.id)) return task.status;
    return task.status;
  };

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter((t) => {
        const effective = getEffectiveStatus(t);
        return effective === filter;
      });

  const totalCount = tasks.length;
  const activeCount = tasks.filter((t) => getEffectiveStatus(t) === 'active').length;
  const completedCount = tasks.filter((t) => getEffectiveStatus(t) === 'completed').length;
  const scheduledCount = tasks.filter((t) => getEffectiveStatus(t) === 'scheduled').length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'scheduled', label: 'Scheduled' },
  ];

  const statBoxStyle: React.CSSProperties = {
    background: '#fff',
    border: '0.5px solid #e8e8e4',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: 0,
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#888',
    margin: 0,
    lineHeight: 1.4,
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 500,
    color: '#1a1a1a',
    margin: 0,
    lineHeight: 1.3,
  };

  if (loading) {
    return (
      <div style={{
        padding: 20,
        background: '#f6f6f4',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ fontSize: 16, color: '#888' }}>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, background: '#f6f6f4', minHeight: '100vh' }}>
      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={statBoxStyle}>
          <p style={statLabelStyle}>Total tasks</p>
          <p style={statValueStyle}>{totalCount}</p>
        </div>
        <div style={statBoxStyle}>
          <p style={statLabelStyle}>Active</p>
          <p style={statValueStyle}>{activeCount}</p>
        </div>
        <div style={statBoxStyle}>
          <p style={statLabelStyle}>Completed</p>
          <p style={statValueStyle}>{completedCount}</p>
        </div>
        <div style={statBoxStyle}>
          <p style={statLabelStyle}>Scheduled</p>
          <p style={statValueStyle}>{scheduledCount}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {tabs.map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'background 0.15s, color 0.15s',
                background: isActive ? '#1e2a3a' : 'transparent',
                color: isActive ? '#fff' : '#888',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f0f0ec';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '0.5px solid #e8e8e4',
          borderRadius: 12,
          padding: 48,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
            {filter === 'all' ? 'No tasks yet.' : `No ${filter} tasks.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredTasks.map((task) => {
            const isCompleted = completedIds.has(task.id);
            const effectiveStatus = getEffectiveStatus(task);
            const typeLower = task.type.toLowerCase();
            const typeStyle = TYPE_BADGE_STYLES[typeLower] || TYPE_BADGE_STYLES.auto;
            const statusStyle = STATUS_BADGE_STYLES[effectiveStatus] || STATUS_BADGE_STYLES.active;

            return (
              <div
                key={task.id}
                style={{
                  background: '#fff',
                  border: '0.5px solid #e8e8e4',
                  borderRadius: 12,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  opacity: isCompleted ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Checkbox */}
                <div
                  onClick={() => toggleComplete(task.id)}
                  style={{
                    width: 18,
                    height: 18,
                    border: isCompleted ? 'none' : '0.5px solid #ccc',
                    borderRadius: 4,
                    background: isCompleted ? '#1D9E75' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                    transition: 'background 0.15s',
                  }}
                >
                  {isCompleted && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="#fff"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      textDecoration: isCompleted ? 'line-through' : 'none',
                    }}>
                      {task.title}
                    </span>

                    {/* Type badge */}
                    <span style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: typeStyle.bg,
                      color: typeStyle.text,
                      whiteSpace: 'nowrap',
                    }}>
                      {typeLower.charAt(0).toUpperCase() + typeLower.slice(1)}
                    </span>

                    {/* Status badge */}
                    <span style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: statusStyle.bg,
                      color: statusStyle.text,
                      whiteSpace: 'nowrap',
                    }}>
                      {effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1)}
                    </span>
                  </div>

                  {task.description && (
                    <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Right side: hours + date */}
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ fontSize: 13, color: '#888' }}>
                    {task.hours_used.toFixed(2)}h
                  </span>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                    {new Date(task.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
