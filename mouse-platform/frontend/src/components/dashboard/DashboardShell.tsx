'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Clock, Settings, Menu, X,
  Phone, Plug, ListTodo, Briefcase, Monitor, LifeBuoy, AlertTriangle
} from 'lucide-react';
import KingMouseAvatar from '@/components/KingMouseAvatar';
import NotificationBell from '@/components/dashboard/NotificationBell';
import type { KingMouseStatus } from '@/types/kingmouse-status';

interface DashboardShellProps {
  children: React.ReactNode;
}

interface OverageInfo {
  percent: number;
  hoursUsed: number;
  hoursIncluded: number;
}

const NAV_ITEMS = [
  { slug: 'workspace', name: 'Your Workspace', icon: Briefcase, route: '/dashboard/workspace' },
  { slug: 'computer', name: "King Mouse's Computer", icon: Monitor, route: '/dashboard/computer' },
  { slug: 'receptionist', name: 'AI Receptionist', icon: Phone, route: '/dashboard/receptionist' },
  { slug: 'tasks', name: 'Tasks', icon: ListTodo, route: '/dashboard/tasks' },
  { slug: 'connections', name: 'Connections', icon: Plug, route: '/dashboard/connections' },
  { slug: 'billing', name: 'Billing & Hours', icon: Clock, route: '/dashboard/billing' },
  { slug: 'help', name: 'Help', icon: LifeBuoy, route: '/dashboard/help' },
  { slug: 'settings', name: 'Settings', icon: Settings, route: '/dashboard/settings' },
];

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proName, setProName] = useState('');
  const [businessEmoji, setBusinessEmoji] = useState('');
  const [businessDisplayName, setBusinessDisplayName] = useState('');
  const [kmStatus, setKmStatus] = useState<KingMouseStatus>('idle');
  const [overage, setOverage] = useState<OverageInfo | null>(null);
  const statusInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const customerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('customer_id') || 'demo'
    : 'demo';

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/kingmouse/status?customer_id=${customerId}`);
      const data = await res.json();
      if (data.status) setKmStatus(data.status as KingMouseStatus);
    } catch { /* ignore */ }
  }, [customerId]);

  useEffect(() => {
    fetchStatus();

    // Load pro name and template info
    fetch(`/api/dashboard/modules?customer_id=${customerId}`)
      .then((r) => r.json())
      .then((d) => setProName(d.pro_name || ''))
      .catch(() => {});

    // Load customer template for header display
    if (customerId !== 'demo') {
      fetch(`/api/customers/${customerId}`)
        .then((r) => r.json())
        .then((customer) => {
          if (customer.business_name) setBusinessDisplayName(customer.business_name);
          if (customer.pro_template_id) {
            fetch(`/api/templates/${customer.pro_template_id}`)
              .then((r) => r.json())
              .then((tmpl) => {
                if (tmpl.emoji) setBusinessEmoji(tmpl.emoji);
                if (!businessDisplayName && tmpl.display_name) setBusinessDisplayName(tmpl.display_name);
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }

    // Check billing overage for header banner
    fetch(`/api/billing/usage?customer_id=${customerId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.hours_included > 0) {
          const pct = (d.hours_used / d.hours_included) * 100;
          if (pct >= 80) {
            setOverage({ percent: pct, hoursUsed: d.hours_used, hoursIncluded: d.hours_included });
          }
        }
      })
      .catch(() => {});

    // Poll KingMouse status every 10 seconds
    statusInterval.current = setInterval(fetchStatus, 10000);
    return () => { if (statusInterval.current) clearInterval(statusInterval.current); };
  }, [customerId, fetchStatus]);

  // Expose status functions globally for child components
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__km_setStatus = setKmStatus;
    (window as unknown as Record<string, unknown>).__km_refreshStatus = fetchStatus;
  }, [fetchStatus]);

  const isChat = pathname === '/dashboard';

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-gray-900 text-gray-300 flex flex-col transform transition-transform md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <KingMouseAvatar status={kmStatus} size="sm" />
            <span className="text-xl font-bold text-white">KingMouse</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {(proName || businessDisplayName) && (
          <div className="px-4 pb-3">
            <span className="text-sm px-3 py-1 bg-teal-900/50 text-teal-400 rounded-full font-medium">
              {businessEmoji && <span className="mr-1">{businessEmoji}</span>}
              {businessDisplayName || proName}
            </span>
          </div>
        )}

        {/* Chat link */}
        <div className="px-3 pb-2">
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
              isChat
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <span className="text-lg">{'\u{1F42D}'}</span>
            Chat with King Mouse
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom nav */}
        <div className="border-t border-gray-800 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.slug}
                href={item.route}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Desktop header bar */}
        <header className="hidden md:flex sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 items-center justify-end">
          <NotificationBell />
        </header>

        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="w-7 h-7 text-gray-600" />
          </button>
          <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <KingMouseAvatar status={kmStatus} size="sm" /> KingMouse
          </span>
          <NotificationBell />
        </header>

        {/* Overage warning banner */}
        {overage && pathname !== '/dashboard/billing' && (
          <Link
            href="/dashboard/billing"
            className={`flex items-center gap-2 px-4 py-2 text-base font-medium ${
              overage.percent >= 100
                ? 'bg-red-50 text-red-800 border-b border-red-200'
                : 'bg-yellow-50 text-yellow-800 border-b border-yellow-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {overage.percent >= 100
              ? `Plan hours exceeded — overage charges apply.`
              : `${overage.hoursUsed.toFixed(1)} of ${overage.hoursIncluded} hours used (${Math.round(overage.percent)}%).`}
            <span className="underline ml-1">View billing &rarr;</span>
          </Link>
        )}

        <main className={`flex-1 ${isChat ? '' : 'p-6 lg:p-8 overflow-y-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
