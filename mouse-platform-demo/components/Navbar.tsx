"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-mouse-navy w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white text-xl font-bold tracking-tight">
              Mouse
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#features"
              className="text-white text-sm font-medium hover:text-mouse-slate transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-white text-sm font-medium hover:text-mouse-slate transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/for-resellers"
              className="text-white text-sm font-medium hover:text-mouse-slate transition-colors"
            >
              For Resellers
            </Link>
            <Link
              href="/#about"
              className="text-white text-sm font-medium hover:text-mouse-slate transition-colors"
            >
              About
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-mouse-teal text-sm font-medium hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/#get-started"
              className="bg-mouse-orange text-white text-sm font-semibold px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-mouse-teal"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-mouse-navy border-t border-white/10">
          <div className="px-4 pt-3 pb-4 space-y-1">
            <Link
              href="/#features"
              className="block text-white text-sm font-medium py-2 hover:text-mouse-slate transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block text-white text-sm font-medium py-2 hover:text-mouse-slate transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/for-resellers"
              className="block text-white text-sm font-medium py-2 hover:text-mouse-slate transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              For Resellers
            </Link>
            <Link
              href="/#about"
              className="block text-white text-sm font-medium py-2 hover:text-mouse-slate transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            <div className="pt-3 border-t border-white/10 space-y-2">
              <Link
                href="/login"
                className="block text-mouse-teal text-sm font-medium py-2 hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/#get-started"
                className="block bg-mouse-orange text-white text-sm font-semibold px-4 py-2 rounded text-center hover:bg-orange-600 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
