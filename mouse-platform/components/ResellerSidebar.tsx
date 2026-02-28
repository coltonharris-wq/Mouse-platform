"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
  },
  {
    label: "Employees",
    href: "/dashboard/employees",
  },
  {
    label: "Revenue",
    href: "/dashboard/revenue",
  },
  {
    label: "Pipeline",
    href: "/dashboard/pipeline",
  },
  {
    label: "Lead Finder",
    href: "/dashboard/leads",
  },
  {
    label: "AI Marketplace",
    href: "/dashboard/marketplace",
  },
  {
    label: "Screen Replays",
    href: "/dashboard/replays",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
  },
];

export default function ResellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-mouse-navy flex flex-col z-10">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-white font-bold text-xl tracking-tight">Automio</div>
        <div className="text-mouse-slate text-xs mt-1">Powered by Mouse</div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                isActive
                  ? "text-white bg-white/10"
                  : "text-mouse-slate hover:bg-white/10 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-mouse-teal rounded-r-full" />
              )}
              <span className="pl-2">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-white/10">
        <span className="text-mouse-slate text-xs">Reseller Account</span>
      </div>
    </aside>
  );
}
