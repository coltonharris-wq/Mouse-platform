"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  brand: string;
  brandSub?: string;
}

export default function Sidebar({ items, brand, brandSub }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-mouse-navy flex flex-col flex-shrink-0">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-white font-bold text-xl tracking-tight">{brand}</div>
        {brandSub && (
          <div className="text-mouse-slate text-xs mt-1">{brandSub}</div>
        )}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-mouse-slate hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={isActive ? "text-white" : "text-mouse-teal"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-white/10">
        <Link
          href="/login"
          className="text-mouse-slate text-xs hover:text-white transition-colors"
        >
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
