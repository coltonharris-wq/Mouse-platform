"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bot,
  HeartPulse,
  DollarSign,
  Workflow,
  Search,
  Store,
  MonitorPlay,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "My Customers",
    href: "/dashboard/customers",
    icon: <Users size={20} />,
  },
  {
    label: "Employees",
    href: "/dashboard/employees",
    icon: <Bot size={20} />,
  },
  {
    label: "Health",
    href: "/dashboard/health",
    icon: <HeartPulse size={20} />,
  },
  {
    label: "Revenue",
    href: "/dashboard/revenue",
    icon: <DollarSign size={20} />,
  },
  {
    label: "Pipeline",
    href: "/dashboard/pipeline",
    icon: <Workflow size={20} />,
  },
  {
    label: "Lead Finder",
    href: "/dashboard/leads",
    icon: <Search size={20} />,
  },
  {
    label: "AI Marketplace",
    href: "/dashboard/marketplace",
    icon: <Store size={20} />,
  },
  {
    label: "King Mouse",
    href: "/dashboard/king-mouse",
    icon: <Bot size={20} />,
  },
  {
    label: "Screen Replays",
    href: "/dashboard/replays",
    icon: <MonitorPlay size={20} />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings size={20} />,
  },
];

export default function ResellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-[#0B1F3B] flex flex-col z-10">
      <div className="px-6 py-6 border-b border-white/20">
        <div className="text-white font-bold text-xl tracking-tight">Automio</div>
        <div className="text-gray-200 text-sm mt-2 font-medium">Powered by Mouse</div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium transition-colors relative min-h-[48px] ${
                isActive
                  ? "text-white bg-white/15"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
              style={
                isActive
                  ? {
                      borderLeft: "4px solid #0F6B6E",
                      paddingLeft: "calc(1rem - 4px)",
                    }
                  : {}
              }
            >
              <span className={`flex-shrink-0 ${isActive ? "text-[#14B8B6]" : "text-white/70"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-white/20">
        <span className="text-white text-sm font-medium">Reseller Account</span>
      </div>
    </aside>
  );
}
