"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = localStorage.getItem('mouse_session');
        if (session) {
          const parsed = JSON.parse(session);
          if (parsed.role === 'admin' || parsed.role === 'platform_owner') {
            router.push('/admin');
          } else if (parsed.role === 'reseller') {
            router.push('/dashboard');
          } else {
            router.push('/portal');
          }
        }
      } catch {
        // No session, stay on login
      }
    };
    checkSession();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Store session in localStorage
      localStorage.setItem('mouse_session', JSON.stringify({
        userId: data.userId,
        email: data.email,
        role: data.role,
        accountType: data.accountType,
        customerId: data.customerId,
        canSwitchPortals: data.canSwitchPortals,
        availablePortals: data.availablePortals,
      }));

      // Store auth token
      if (data.token) {
        localStorage.setItem('mouse_token', data.token);
      }

      // Redirect based on role
      if (data.role === 'platform_owner' || data.role === 'admin') {
        router.push('/admin');
      } else if (data.role === 'reseller') {
        router.push('/dashboard');
      } else {
        router.push('/portal');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
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
                  disabled={loading}
                  className="w-full border border-mouse-slate/50 rounded px-4 py-2.5 text-mouse-charcoal text-sm placeholder:text-mouse-slate/60 focus:outline-none focus:ring-2 focus:ring-mouse-teal focus:border-mouse-teal transition-colors disabled:bg-gray-100"
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
                  disabled={loading}
                  className="w-full border border-mouse-slate/50 rounded px-4 py-2.5 text-mouse-charcoal text-sm placeholder:text-mouse-slate/60 focus:outline-none focus:ring-2 focus:ring-mouse-teal focus:border-mouse-teal transition-colors disabled:bg-gray-100"
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
                className="w-full bg-mouse-orange text-white py-2.5 rounded font-semibold text-sm hover:bg-orange-600 disabled:opacity-60 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Sign up link */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-mouse-charcoal text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-mouse-teal font-medium hover:text-mouse-navy transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
