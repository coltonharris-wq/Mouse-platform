"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CreditCard,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Workforce",
    href: "/portal",
    icon: <LayoutDashboard size={18} />,
    exact: true,
  },
  {
    label: "Employees",
    href: "/portal/employees",
    icon: <Users size={18} />,
  },
  {
    label: "Tasks",
    href: "/portal/tasks",
    icon: <ClipboardList size={18} />,
  },
  {
    label: "Billing",
    href: "/portal/billing",
    icon: <CreditCard size={18} />,
  },
];

export default function PortalSidebar() {
  const pathname = usePathname();

  function isActive(item: NavItem): boolean {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-mouse-navy flex flex-col z-30">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-white font-semibold text-sm leading-tight">
          Redwood Construction Co.
        </div>
        <div className="text-mouse-slate text-xs mt-1">Powered by Automio</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                active
                  ? "text-white"
                  : "text-mouse-slate hover:text-white hover:bg-white/5"
              }`}
              style={
                active
                  ? {
                      backgroundColor: "rgba(15,107,110,0.15)",
                      borderLeft: "4px solid #0F6B6E",
                      paddingLeft: "calc(0.75rem - 4px)",
                    }
                  : {}
              }
            >
              <span
                className={
                  active ? "text-mouse-teal" : "text-mouse-slate"
                }
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div className="px-6 py-4 border-t border-white/10">
        <span className="text-mouse-teal text-xs font-medium">Growth Plan</span>
      </div>
    </aside>
  );
}
