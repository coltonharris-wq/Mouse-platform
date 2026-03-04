'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
  Monitor,
  ListTodo,
  CreditCard,
  Plug,
  Bot,
  Presentation,
  ChevronRight,
  LogOut,
  Target,
  TrendingUp,
  FileText,
  ClipboardList,
  UserCircle,
  Mail,
  PlayIcon,
  Clock
} from 'lucide-react';

export type UserRole = 'admin' | 'sales' | 'reseller' | 'customer';

interface User {
  email: string;
  role: UserRole;
  name: string;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const menuItems: Record<UserRole, MenuItem[]> = {
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Customers', href: '/dashboard/admin/customers', icon: Users },
    { name: 'Resellers', href: '/dashboard/admin/resellers', icon: Briefcase },
    { name: 'Revenue Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    { name: 'Security Logs', href: '/dashboard/admin/security', icon: Shield },
    { name: 'System Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
  sales: [
    { name: 'Pipeline', href: '/dashboard/sales', icon: LayoutDashboard },
    { name: 'Leads', href: '/dashboard/sales/leads', icon: Target },
    { name: 'Opportunities', href: '/dashboard/sales/opportunities', icon: TrendingUp },
    { name: 'Forecast', href: '/dashboard/sales/forecast', icon: BarChart3 },
    { name: 'Demo Mode', href: '/dashboard/sales/demo', icon: Presentation },
  ],
  reseller: [
    { name: 'Dashboard', href: '/dashboard/reseller', icon: LayoutDashboard },
    { name: 'My Customers', href: '/dashboard/reseller/customers', icon: Users },
    { name: 'Commissions', href: '/dashboard/reseller/commissions', icon: DollarSign },
    { name: 'Referral Links', href: '/dashboard/reseller/links', icon: LinkIcon },
    { name: 'Marketing Materials', href: '/dashboard/reseller/marketing', icon: Mail },
    { name: 'White Label', href: '/dashboard/reseller/white-label', icon: Settings },
  ],
  customer: [
    { name: 'Dashboard', href: '/dashboard/customer', icon: LayoutDashboard },
    { name: 'AI Employees', href: '/dashboard/customer/employees', icon: Bot },
    { name: 'VM Viewer', href: '/dashboard/customer/vm', icon: Monitor },
    { name: 'Screen Replay', href: '/dashboard/customer/screen-replay', icon: PlayIcon },
    { name: 'Work Hours', href: '/dashboard/customer/work-hours', icon: Clock },
    { name: 'Task Queue', href: '/dashboard/customer/tasks', icon: ListTodo },
    { name: 'Billing', href: '/dashboard/customer/billing', icon: CreditCard },
    { name: 'Connections', href: '/dashboard/customer/connections', icon: Plug },
    { name: 'Account', href: '/dashboard/customer/account', icon: UserCircle },
  ],
};

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if no user
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!mounted || !user) {
    return (
      <aside className="w-64 bg-[#1e3a5f] text-white min-h-screen flex flex-col">
        <div className="p-6 border-b border-[#2d4a6f]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse" />
            <div className="w-16 h-6 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-white/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </aside>
    );
  }

  const items = menuItems[user.role];
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <aside className="w-64 bg-[#1e3a5f] text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#2d4a6f]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#1e3a5f]" />
          </div>
          <span className="text-xl font-bold">Mouse</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-[#2d4a6f]">
        <div className="text-xs font-semibold text-blue-200 uppercase mb-1">
          {roleLabel} Portal
        </div>
        <div className="text-sm text-white font-medium truncate">
          {user.name}
        </div>
        <div className="text-xs text-blue-200 truncate">
          {user.email}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-[#1e3a5f]'
                      : 'text-blue-100 hover:bg-[#2d4a6f] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#2d4a6f] space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 text-blue-100 hover:text-white hover:bg-[#2d4a6f] rounded-lg transition-colors"
        >
          <span className="text-sm">Back to Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-blue-100 hover:text-white hover:bg-[#2d4a6f] rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
