"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  DollarSign,
  Shield,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Overview",
    href: "/admin",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: <Users size={18} />,
  },
  {
    label: "Resellers",
    href: "/admin/resellers",
    icon: <Store size={18} />,
  },
  {
    label: "Revenue",
    href: "/admin/revenue",
    icon: <DollarSign size={18} />,
  },
  {
    label: "Security",
    href: "/admin/security",
    icon: <Shield size={18} />,
  },
  {
    label: "Logs",
    href: "/admin/logs",
    icon: <FileText size={18} />,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings size={18} />,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-mouse-navy flex flex-col z-10">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-white font-bold text-xl tracking-tight">Mouse</div>
        <div className="text-mouse-slate text-xs mt-1">Platform OS</div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
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
              <span className={active ? "text-mouse-teal" : "text-mouse-slate"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-white/10">
        <span className="text-mouse-slate text-xs">Platform Owner</span>
      </div>
    </aside>
  );
}
