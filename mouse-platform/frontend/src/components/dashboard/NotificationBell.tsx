'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, Check, Zap, Phone, Mail, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  action_url: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, typeof Zap> = {
  task: Zap,
  call: Phone,
  email: Mail,
  alert: AlertCircle,
  default: Bell,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const customerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('customer_id') || 'demo'
    : 'demo';

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?customer_id=${customerId}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // Ignore
    }
  }, [customerId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignore
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`/api/notifications/mark-all-read?customer_id=${customerId}`, {
        method: 'POST',
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.action_url) {
      window.location.href = n.action_url;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[480px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-base text-[#0F6B6E] font-medium hover:underline flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || TYPE_ICONS.default;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !n.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      !n.read ? 'bg-[#0F6B6E]/10' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${!n.read ? 'text-[#0F6B6E]' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-base font-medium truncate ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 bg-[#0F6B6E] rounded-full shrink-0" />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">{n.body}</p>
                      )}
                      <p className="text-sm text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
