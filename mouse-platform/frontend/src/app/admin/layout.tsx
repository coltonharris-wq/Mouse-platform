'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, CreditCard, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/resellers', icon: UserCheck, label: 'Resellers' },
  { href: '/admin/plans', icon: CreditCard, label: 'Plans' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🐭</span>
            <span className="text-lg font-bold">KingMouse Admin</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* Breadcrumbs */}
        <div className="mt-auto p-4 border-t border-gray-800">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-300">
            &larr; Back to Dashboard
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
