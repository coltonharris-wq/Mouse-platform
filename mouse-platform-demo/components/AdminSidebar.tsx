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
  Activity,
  MessageCircle,
} from "lucide-react";

const navItems = [
  {
    label: "Overview",
    href: "/admin",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "King Mouse",
    href: "/admin/chat",
    icon: <MessageCircle size={20} />,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: <Users size={20} />,
  },
  {
    label: "Resellers",
    href: "/admin/resellers",
    icon: <Store size={20} />,
  },
  {
    label: "Revenue",
    href: "/admin/revenue",
    icon: <DollarSign size={20} />,
  },
  {
    label: "Usage",
    href: "/admin/usage",
    icon: <Activity size={20} />,
  },
  {
    label: "Security",
    href: "/admin/security",
    icon: <Shield size={20} />,
  },
  {
    label: "Logs",
    href: "/admin/logs",
    icon: <FileText size={20} />,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings size={20} />,
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
    <aside className="fixed left-0 top-0 w-64 h-full bg-[#0B1F3B] flex flex-col z-10">
      <div className="px-6 py-6 border-b border-white/20">
        <div className="text-white font-bold text-xl tracking-tight">Mouse</div>
        <div className="text-gray-200 text-sm mt-2 font-medium">Platform OS</div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium transition-colors relative min-h-[48px] ${
                active
                  ? "text-white bg-white/15"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              style={
                active
                  ? {
                      borderLeft: "4px solid #0F6B6E",
                      paddingLeft: "calc(1rem - 4px)",
                    }
                  : {}
              }
            >
              <span className={`flex-shrink-0 ${active ? "text-[#14B8B6]" : "text-white/70"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-white/20">
        <span className="text-white text-sm font-medium">Platform Owner</span>
      </div>
    </aside>
  );
}
