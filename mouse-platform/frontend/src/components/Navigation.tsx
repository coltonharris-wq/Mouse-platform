"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employees", label: "Employees" },
  { href: "/vms", label: "VMs" },
  { href: "/tokens", label: "Tokens" },
  { href: "/pricing", label: "Pricing" },
];

const portalNavItems = [
  { href: "/portal", label: "Portal" },
  { href: "/admin", label: "Admin" },
  { href: "/reseller", label: "Reseller" },
  { href: "/sales", label: "Sales" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-dark-surface border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-mouse-teal">
            Mouse Platform
          </Link>
          
          <div className="flex items-center space-x-1">
            {/* Main Nav Items */}
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href || pathname?.startsWith(item.href + '/')
                    ? "bg-mouse-teal/20 text-mouse-teal"
                    : "text-gray-400 hover:text-white hover:bg-dark-bg-tertiary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Portal Divider */}
            <div className="w-px h-6 bg-dark-border mx-2"></div>
            
            {/* Portal Nav Items */}
            {portalNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href || pathname?.startsWith(item.href + '/')
                    ? "bg-accent-purple/20 text-accent-purple"
                    : "text-gray-400 hover:text-white hover:bg-dark-bg-tertiary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Clean Eats</span>
            <div className="w-8 h-8 bg-mouse-teal rounded-full flex items-center justify-center text-white text-sm font-medium">
              CE
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
