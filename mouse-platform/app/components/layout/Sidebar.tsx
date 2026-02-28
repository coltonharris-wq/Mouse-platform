'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  LogOut
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'sales' | 'reseller' | 'customer';
}

const menuItems = {
  admin: [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Resellers', href: '/admin/resellers', icon: Briefcase },
    { name: 'Revenue Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Security Logs', href: '/admin/security', icon: Shield },
  ],
  sales: [
    { name: 'Pipeline', href: '/sales', icon: LayoutDashboard },
    { name: 'Leads', href: '/sales/leads', icon: Users },
    { name: 'Demo Mode', href: '/sales/demo', icon: Presentation },
  ],
  reseller: [
    { name: 'Dashboard', href: '/reseller', icon: LayoutDashboard },
    { name: 'Customers', href: '/reseller/customers', icon: Users },
    { name: 'Commissions', href: '/reseller/commissions', icon: DollarSign },
    { name: 'White Label', href: '/reseller/white-label', icon: Settings },
  ],
  customer: [
    { name: 'Dashboard', href: '/customer', icon: LayoutDashboard },
    { name: 'AI Employees', href: '/customer/employees', icon: Bot },
    { name: 'VM Viewer', href: '/customer/vm', icon: Monitor },
    { name: 'Task Queue', href: '/customer/tasks', icon: ListTodo },
    { name: 'Billing', href: '/customer/billing', icon: CreditCard },
    { name: 'Connections', href: '/customer/connections', icon: Plug },
  ],
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = menuItems[role];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Mouse</span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <div className="mb-4 px-4 text-xs font-semibold text-gray-400 uppercase">
          {role} Portal
        </div>
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
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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

      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
