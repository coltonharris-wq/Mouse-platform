"use client";

import { useState } from "react";
import Link from "next/link";

const TARGET_MARKETS = [
  "Restaurants & Food",
  "Storage & Warehousing",
  "Auto Repair & Dealers",
  "HVAC & Plumbing",
  "Real Estate",
  "Legal Services",
  "Healthcare & Dental",
  "Fitness & Wellness",
  "E-Commerce",
  "Professional Services",
  "Construction",
  "Multiple Industries",
  "Other",
];

const REFERRAL_SOURCES = [
  { id: "social", label: "Social Media" },
  { id: "referral", label: "Friend / Referral" },
  { id: "search", label: "Google Search" },
  { id: "ad", label: "Online Ad" },
  { id: "event", label: "Event / Conference" },
  { id: "other", label: "Other" },
];

export default function ResellerSignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    website: "",
    targetMarket: "",
    referralSource: "",
    salesExperience: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in name, email, and password");
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

    setLoading(true);

    try {
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName,
          lastName,
          company: formData.company || 'My Agency',
          role: 'reseller',
          industry: formData.targetMarket,
          customInstructions: formData.salesExperience,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed. Please try again.');
        setLoading(false);
        return;
      }

      // Store session so ResellerGuard and deploying page work
      localStorage.setItem('mouse_session', JSON.stringify({
        userId: data.userId,
        email: formData.email,
        role: 'reseller',
        accountType: 'reseller',
        customerId: data.customerId,
        name: formData.fullName,
        companyName: formData.company,
      }));
      if (data.token) {
        localStorage.setItem('mouse_token', data.token);
      }

      // Redirect to checkout — same flow as customer
      window.location.href = `/checkout/reseller?customerId=${data.customerId}&email=${encodeURIComponent(formData.email)}`;

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
          Mouse
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-mouse-teal text-sm font-medium">
            Sign In
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-8 flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
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
            {/* Full Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Smith"
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@agency.com"
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
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

            {/* Company / Agency Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Company / Agency Name</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your Agency Name"
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Website <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://youragency.com"
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>

            {/* Target Market */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">What industries do your clients operate in?</label>
              <select
                name="targetMarket"
                value={formData.targetMarket}
                onChange={handleChange}
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              >
                <option value="" className="text-gray-500">Select primary market</option>
                {TARGET_MARKETS.map(market => (
                  <option key={market} value={market} className="text-white">{market}</option>
                ))}
              </select>
            </div>

            {/* Referral Source */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">How did you hear about us?</label>
              <select
                name="referralSource"
                value={formData.referralSource}
                onChange={handleChange}
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              >
                <option value="" className="text-gray-500">Select one</option>
                {REFERRAL_SOURCES.map(source => (
                  <option key={source.id} value={source.id} className="text-white">{source.label}</option>
                ))}
              </select>
            </div>

            {/* Sales Experience */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Tell us about your business <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                name="salesExperience"
                value={formData.salesExperience}
                onChange={handleChange}
                placeholder="What services do you offer? How many clients do you serve? Any experience reselling SaaS?"
                rows={3}
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-4 rounded-xl mt-6 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                "Continue to Checkout"
              )}
            </button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-6">
            By continuing, you agree to our Affiliate Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
