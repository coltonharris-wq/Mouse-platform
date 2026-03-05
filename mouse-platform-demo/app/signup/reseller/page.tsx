"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

export default function ResellerSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    firstName: "",
    lastName: "",
    website: "",
    referralSource: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          company: formData.company,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: "reseller",
          website: formData.website,
          referralSource: formData.referralSource,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "mouse_session",
        JSON.stringify({
          userId: data.userId,
          email: formData.email,
          role: "reseller",
          customerId: data.customerId,
          company: formData.company || "",
          firstName: formData.firstName || "",
          lastName: formData.lastName || "",
        })
      );

      router.push("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
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
        <div className="flex items-center gap-4">
          <Link href="/signup" className="text-gray-400 text-sm font-medium hover:text-white">
            Customer Sign Up
          </Link>
          <Link href="/login" className="text-mouse-teal text-sm font-medium">
            Sign In
          </Link>
        </div>
      </div>

      {/* Affiliate Benefits Banner */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto bg-gradient-to-r from-[#0F6B6E]/20 to-[#1e3a5f]/20 border border-[#0F6B6E]/30 rounded-2xl p-5">
          <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            Affiliate Program Benefits
          </h2>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-sm">White-label dashboard — your brand, our AI workforce</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-sm">Dedicated affiliate portal with real-time earnings tracking</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-sm">Instant payouts — no minimum threshold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Account</span>
            <span>Business Info</span>
            <span>Done</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
              style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Become an Affiliate
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                Start earning by reselling AI employees to your clients
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
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
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
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
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
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-4 rounded-xl mt-6 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Continue
                </button>
              </form>

              <p className="text-gray-500 text-xs text-center mt-6">
                By continuing, you agree to our Affiliate Terms and Privacy Policy
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Tell us about your business
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                Help us set up your affiliate account
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
                      className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
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
                      className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Company / Agency Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Business Name"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yoursite.com"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    How did you hear about us?
                  </label>
                  <select
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-teal-500 transition-colors"
                  >
                    <option value="" className="bg-[#1a1a2e]">Select one</option>
                    <option value="social" className="bg-[#1a1a2e]">Social Media</option>
                    <option value="referral" className="bg-[#1a1a2e]">Friend / Referral</option>
                    <option value="search" className="bg-[#1a1a2e]">Google Search</option>
                    <option value="ad" className="bg-[#1a1a2e]">Online Ad</option>
                    <option value="event" className="bg-[#1a1a2e]">Event / Conference</option>
                    <option value="other" className="bg-[#1a1a2e]">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-4 rounded-xl mt-6 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating affiliate account...
                    </>
                  ) : (
                    "Create Affiliate Account"
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
            <DollarSign className="w-4 h-4" />
            20% Commission
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            847+ Businesses
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Instant Payouts
          </span>
        </div>
      </div>
    </div>
  );
}
