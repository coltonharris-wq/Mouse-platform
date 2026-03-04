"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const ADMIN_EMAIL = "colton.harris@automioapp.com";

interface Portal {
  key: string;
  label: string;
  icon: string;
  path: string;
  description: string;
}

const PORTALS: Portal[] = [
  {
    key: "admin",
    label: "Admin Console",
    icon: "⚙️",
    path: "/admin",
    description: "Full platform management",
  },
  {
    key: "reseller",
    label: "Reseller Portal",
    icon: "🤝",
    path: "/dashboard",
    description: "See what resellers see",
  },
  {
    key: "customer",
    label: "Customer Portal",
    icon: "👤",
    path: "/portal",
    description: "Demo view for prospects",
  },
];

export default function PortalSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine current portal from pathname
  const currentPortal = PORTALS.find((p) => pathname.startsWith(p.path)) || PORTALS[0];

  useEffect(() => {
    try {
      const session = localStorage.getItem("mouse_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (
          parsed.email?.toLowerCase() === ADMIN_EMAIL &&
          (parsed.canSwitchPortals || parsed.role === "platform_owner" || parsed.role === "admin")
        ) {
          setIsAdmin(true);
          return;
        }
      }
      // Always show portal switcher on admin routes (owner is always logged in as admin)
      if (window.location.pathname.startsWith("/admin")) {
        setIsAdmin(true);
      }
    } catch {
      // Fallback: show on admin routes regardless
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        setIsAdmin(true);
      }
    }
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isAdmin) return null;

  function switchPortal(portal: Portal) {
    setIsOpen(false);
    router.push(portal.path);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
        pathname.startsWith("/admin")
          ? "bg-white/10 hover:bg-white/20 text-white border-white/10"
          : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
      }`}
      >
        <span>{currentPortal.icon}</span>
        <span>{currentPortal.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Switch Portal
            </p>
          </div>
          {PORTALS.map((portal) => {
            const isCurrent = portal.key === currentPortal.key;
            return (
              <button
                key={portal.key}
                onClick={() => switchPortal(portal)}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  isCurrent ? "bg-blue-50" : ""
                }`}
              >
                <span className="text-lg">{portal.icon}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? "text-mouse-teal" : "text-gray-800"
                    }`}
                  >
                    {portal.label}
                  </p>
                  <p className="text-xs text-gray-400">{portal.description}</p>
                </div>
                {isCurrent && (
                  <span className="text-mouse-teal text-xs font-semibold">Active</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
