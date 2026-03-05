"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          company: formData.company,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed. Please try again.');
        setLoading(false);
        return;
      }

      // Store session
      localStorage.setItem('mouse_session', JSON.stringify({
        userId: data.userId,
        email: formData.email,
        role: 'customer',
        customerId: data.customerId,
        company: formData.company || '',
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
      }));

      // Redirect to checkout or onboarding
      router.push('/onboard');

    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-xl">
          🖱️ Mouse
        </Link>
        <Link href="/login" className="text-mouse-teal text-sm font-medium">
          Sign In
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Account</span>
          <span>Profile</span>
          <span>Done</span>
        </div>
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-mouse-teal to-purple-500 transition-all duration-300"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Create your account
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                Start your AI workforce in minutes
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal transition-colors"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal transition-colors"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal transition-colors"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-mouse-teal to-blue-500 text-white font-semibold py-4 rounded-xl mt-6 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Continue
                </button>
              </form>

              <p className="text-gray-500 text-xs text-center mt-6">
                By continuing, you agree to our Terms and Privacy Policy
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Tell us about yourself
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                We'll customize your AI workforce setup
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Acme Inc."
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-mouse-teal to-blue-500 text-white font-semibold py-4 rounded-xl mt-6 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-gray-400 text-sm py-2 hover:text-white transition-colors"
                >
                  Back
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div className="px-4 py-6 border-t border-gray-800">
        <div className="flex items-center justify-center gap-6 text-gray-500 text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Secure
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Verified
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
            No credit card
          </span>
        </div>
      </div>
    </div>
  );
}
