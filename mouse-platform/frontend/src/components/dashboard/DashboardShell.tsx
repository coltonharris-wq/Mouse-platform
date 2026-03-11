'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare, Package, ShoppingCart, Calendar, Truck,
  UserPlus, FileText, Briefcase, Users, Heart, Bell,
  Shield, History, Clock, Settings, Menu, X, ChevronRight
} from 'lucide-react';

interface Module {
  slug: string;
  name: string;
  icon: string;
  route: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare, Package, ShoppingCart, Calendar, Truck,
  UserPlus, FileText, Briefcase, Users, Heart, Bell,
  Shield, History, Clock, Settings,
};

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [modules, setModules] = useState<Module[]>([]);
  const [proName, setProName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // For now, use a placeholder customer_id — will be replaced with auth
    const customerId = typeof window !== 'undefined'
      ? sessionStorage.getItem('customer_id') || 'demo'
      : 'demo';

    fetch(`/api/dashboard/modules?customer_id=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.modules) {
          setModules(data.modules);
          setProName(data.pro_name || '');
        }
      })
      .catch(() => {
        // Fallback modules for demo
        setModules([
          { slug: 'chat', name: 'Chat with KingMouse', icon: 'MessageSquare', route: '/dashboard/chat' },
          { slug: 'activity_log', name: 'Activity Log', icon: 'History', route: '/dashboard/activity' },
          { slug: 'billing', name: 'Billing & Hours', icon: 'Clock', route: '/dashboard/billing' },
        ]);
      });
  }, []);

  const renderIcon = (iconName: string, className: string) => {
    const Icon = ICON_MAP[iconName];
    return Icon ? <Icon className={className} /> : <ChevronRight className={className} />;
  };

  const settingsModule = { slug: 'settings', name: 'Settings', icon: 'Settings', route: '/dashboard/settings' };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🐭</span>
              <span className="text-xl font-bold text-gray-900">KingMouse</span>
            </Link>
            {proName && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">
                  {proName}
                </span>
                <span className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {modules.map((mod) => {
              const isActive = pathname === mod.route || pathname.startsWith(mod.route + '/');
              return (
                <Link
                  key={mod.slug}
                  href={mod.route}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {renderIcon(mod.icon, `w-5 h-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`)}
                  {mod.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom nav */}
          <div className="p-4 border-t border-gray-100 space-y-1">
            <Link
              href={settingsModule.route}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === settingsModule.route
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Settings className={`w-5 h-5 ${pathname === settingsModule.route ? 'text-teal-600' : 'text-gray-400'}`} />
              Settings
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <span className="font-bold text-gray-900 flex items-center gap-2">
            🐭 KingMouse
          </span>
          <div className="w-10" />
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
