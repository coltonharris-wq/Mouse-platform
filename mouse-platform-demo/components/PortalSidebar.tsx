"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  CreditCard,
  HelpCircle,
  Store,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/portal",
    icon: <LayoutDashboard size={20} />,
    exact: true,
  },
  {
    label: "AI Marketplace",
    href: "/dashboard/marketplace",
    icon: <Store size={20} />,
  },
  {
    label: "My Employees",
    href: "/portal/employees",
    icon: <Users size={20} />,
  },
  {
    label: "Tasks",
    href: "/portal/tasks",
    icon: <ClipboardList size={20} />,
  },
  {
    label: "Usage",
    href: "/portal/work-hours",
    icon: <Clock size={20} />,
  },
  {
    label: "Billing",
    href: "/portal/billing",
    icon: <CreditCard size={20} />,
  },
  {
    label: "Support",
    href: "/portal/maintenance",
    icon: <HelpCircle size={20} />,
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
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#0B1F3B] flex flex-col z-30">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/20">
        <div className="text-white font-semibold text-lg leading-tight">
          Redwood Construction Co.
        </div>
        <div className="text-gray-200 text-sm mt-2 font-medium">Powered by Automio</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
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
              <span
                className={`flex-shrink-0 ${
                  active ? "text-[#14B8B6]" : "text-gray-300"
                }`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div className="px-6 py-4 border-t border-white/20">
        <span className="text-white text-sm font-medium">Growth Plan</span>
      </div>
    </aside>
  );
}
