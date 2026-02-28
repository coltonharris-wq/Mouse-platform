"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // MOCK LOGIN - redirects based on email
    setTimeout(() => {
      if (!email || !password) {
        setError("Please enter your email and password.");
        setLoading(false);
        return;
      }

      // Role-based routing
      const lowerEmail = email.toLowerCase();
      if (lowerEmail.includes("admin") || lowerEmail.includes("owner")) {
        window.location.href = "/admin";
      } else if (lowerEmail.includes("reseller") || lowerEmail.includes("partner")) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/portal";
      }
    }, 500);
  }

  return (
    <div className="min-h-screen bg-mouse-navy flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <Link href="/" className="text-white font-bold text-2xl tracking-tight">
              Mouse
            </Link>
            <p className="text-mouse-slate mt-1.5 text-sm">AI Workforce Operating System</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <h1 className="text-xl font-bold text-mouse-navy mb-1">Sign In</h1>
            <p className="text-mouse-charcoal text-sm mb-7">
              Enter your credentials to access your account.
            </p>

            {error && (
              <div className="bg-red-50 border border-mouse-red/30 text-mouse-red text-sm rounded px-4 py-3 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block text-mouse-navy text-sm font-semibold mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full border border-mouse-slate/50 rounded px-4 py-2.5 text-mouse-charcoal text-sm placeholder:text-mouse-slate/60 focus:outline-none focus:ring-2 focus:ring-mouse-teal focus:border-mouse-teal transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-mouse-navy text-sm font-semibold mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full border border-mouse-slate/50 rounded px-4 py-2.5 text-mouse-charcoal text-sm placeholder:text-mouse-slate/60 focus:outline-none focus:ring-2 focus:ring-mouse-teal focus:border-mouse-teal transition-colors"
                />
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-mouse-teal text-xs font-medium hover:text-mouse-navy transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mouse-orange text-white py-2.5 rounded font-semibold text-sm hover:bg-orange-600 disabled:opacity-60 transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Contact link */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-mouse-charcoal text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="mailto:hello@mouseplatform.com"
                  className="text-mouse-teal font-medium hover:text-mouse-navy transition-colors"
                >
                  Contact us
                </Link>
              </p>
            </div>
          </div>

          {/* Role routing links */}
          <div className="mt-5 space-y-2 text-center">
            <p className="text-mouse-slate text-xs">
              Platform Owner?{" "}
              <Link
                href="/admin"
                className="text-white font-medium hover:text-mouse-teal transition-colors"
              >
                Admin Login
              </Link>{" "}
              &rarr;
            </p>
            <p className="text-mouse-slate text-xs">
              Reseller?{" "}
              <Link
                href="/dashboard"
                className="text-white font-medium hover:text-mouse-teal transition-colors"
              >
                Partner Login
              </Link>{" "}
              &rarr;
            </p>
          </div>

          {/* Role routing note */}
          <p className="mt-6 text-mouse-slate/60 text-xs text-center leading-relaxed px-4">
            After sign-in, platform owners are directed to /admin, resellers to /dashboard, and customers to /portal.
          </p>
        </div>
      </div>
    </div>
  );
}
