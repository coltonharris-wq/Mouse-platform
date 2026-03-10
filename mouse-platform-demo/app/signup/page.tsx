"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const INDUSTRIES = [
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
  "Other",
];

const NEEDS = [
  { id: "receptionist", label: "AI Receptionist (phone/chat)" },
  { id: "lead_gen", label: "Lead Generation" },
  { id: "bookkeeping", label: "Bookkeeping & Invoicing" },
  { id: "scheduling", label: "Appointment Scheduling" },
  { id: "social_media", label: "Social Media Management" },
  { id: "customer_support", label: "Customer Support" },
  { id: "data_entry", label: "Data Entry & Admin" },
  { id: "sales", label: "Sales Outreach" },
];

function ResellerRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      router.replace(`/signup/reseller-customer?ref=${refCode}`);
    }
  }, [searchParams, router]);

  return null;
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industry: "",
    needs: [] as string[],
    customInstructions: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  }

  function toggleNeed(needId: string) {
    setFormData(prev => ({
      ...prev,
      needs: prev.needs.includes(needId)
        ? prev.needs.filter(n => n !== needId)
        : [...prev.needs, needId],
    }));
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
          company: formData.companyName || 'My Business',
          industry: formData.industry,
          needs: formData.needs,
          customInstructions: formData.customInstructions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed. Please try again.');
        setLoading(false);
        return;
      }

      // Store session + token so PortalGuard works after deploying → portal redirect
      localStorage.setItem('mouse_session', JSON.stringify({
        userId: data.userId,
        email: formData.email,
        role: 'customer',
        accountType: 'customer',
        customerId: data.customerId,
        name: formData.fullName,
        companyName: formData.companyName,
      }));
      if (data.token) {
        localStorage.setItem('mouse_token', data.token);
      }

      // Redirect to checkout
      window.location.href = `/checkout/starter?customerId=${data.customerId}&email=${encodeURIComponent(formData.email)}`;

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

      {/* Main Content */}
      <div className="flex-1 px-4 pb-8 flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
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
            {/* Full Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Smith"
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal transition-colors"
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
                placeholder="you@company.com"
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal transition-colors"
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
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal transition-colors"
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
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal transition-colors"
                autoComplete="new-password"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Your Business Name"
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal transition-colors"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Industry</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal transition-colors"
              >
                <option value="" className="text-gray-500">Select your industry</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind} className="text-white">{ind}</option>
                ))}
              </select>
            </div>

            {/* Needs */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">What do you need? (select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {NEEDS.map(need => (
                  <button
                    key={need.id}
                    type="button"
                    onClick={() => toggleNeed(need.id)}
                    className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                      formData.needs.includes(need.id)
                        ? 'bg-mouse-teal/20 border-mouse-teal text-mouse-teal'
                        : 'bg-[#1a1a2e] border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {need.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Custom Instructions <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                name="customInstructions"
                value={formData.customInstructions}
                onChange={handleChange}
                placeholder="Tell us anything specific about how you want your AI employees to work..."
                rows={3}
                className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal focus:ring-1 focus:ring-mouse-teal transition-colors resize-none"
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
                "Continue to Checkout →"
              )}
            </button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-6">
            By continuing, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <ResellerRedirect />
      </Suspense>
    </div>
  );
}
