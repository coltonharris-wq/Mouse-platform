"use client";

import { useState, useEffect } from "react";
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
  Crown,
  Handshake,
  Magnet,
  Monitor,
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
    icon: <LayoutDashboard size={22} />,
    exact: true,
  },
  {
    label: "AI Marketplace",
    href: "/portal/marketplace",
    icon: <Store size={22} />,
  },
  {
    label: "King Mouse",
    href: "/portal/king-mouse",
    icon: <Crown size={22} />,
  },
  {
    label: "My Employees",
    href: "/portal/employees",
    icon: <Users size={22} />,
  },
  {
    label: "Lead Funnel",
    href: "/portal/employees/lead-funnel",
    icon: <Magnet size={22} />,
  },
  {
    label: "Work History",
    href: "/portal/work-history",
    icon: <Monitor size={22} />,
  },
  {
    label: "Tasks",
    href: "/portal/tasks",
    icon: <ClipboardList size={22} />,
  },
  {
    label: "Work Hours",
    href: "/portal/work-hours",
    icon: <Clock size={22} />,
  },
  {
    label: "Billing",
    href: "/portal/billing",
    icon: <CreditCard size={22} />,
  },
  {
    label: "Support",
    href: "/portal/maintenance",
    icon: <HelpCircle size={22} />,
  },
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const [companyName, setCompanyName] = useState("My Business");

  useEffect(() => {
    try {
      const session = localStorage.getItem("mouse_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.company) setCompanyName(parsed.company);
        else if (parsed.companyName) setCompanyName(parsed.companyName);
        else if (parsed.email) setCompanyName(parsed.email.split("@")[0]);
      }
    } catch {}
  }, []);

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
        <div className="text-white font-bold text-xl leading-tight">
          {companyName}
        </div>
        <div className="text-gray-300 text-base mt-2 font-medium">Powered by Automio</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-lg font-semibold transition-colors relative min-h-[52px] ${
                active
                  ? "text-white bg-white/15"
                  : "text-gray-200 hover:text-white hover:bg-white/10"
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

      {/* Affiliate CTA */}
      <div className="px-3 pb-2">
        <Link
          href="/signup/reseller"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-teal-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Handshake size={20} className="flex-shrink-0" />
          <span>Become an Affiliate</span>
        </Link>
      </div>

      {/* Bottom badge */}
      <div className="px-6 py-4 border-t border-white/20">
        <span className="text-white text-base font-semibold">Growth Plan</span>
      </div>
    </aside>
  );
}
