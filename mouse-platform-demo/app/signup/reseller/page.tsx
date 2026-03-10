"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, DollarSign, TrendingUp, CheckCircle, CreditCard, Tag } from "lucide-react";

const STORAGE_KEY = "reseller_signup_draft";

function ResellerSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    firstName: "",
    lastName: "",
    website: "",
    referralSource: "",
    promoCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [promoValid, setPromoValid] = useState<boolean | null>(null);

  useEffect(() => {
    const stepParam = searchParams.get("step");
    const canceled = searchParams.get("canceled");
    if (stepParam === "3" || canceled === "1") {
      try {
        const saved = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
      setStep(3);
    }
  }, [searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  }

  async function validatePromo() {
    if (!formData.promoCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reseller/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: formData.promoCode }),
      });
      const data = await res.json();
      setPromoValid(data.valid === true);
    } catch {
      setPromoValid(false);
    } finally {
      setLoading(false);
    }
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

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      if (promoValid) {
        await doSignup();
      } else {
        setError("Please pay $97 or enter a valid promo code to continue.");
      }
      return;
    }
  }

  async function doSignup() {
    setLoading(true);
    setError("");
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
      if (typeof window !== "undefined") {
        localStorage.setItem("mouse_token", data.token || "");
      }
      router.push("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  async function handlePay() {
    setError("");
    setLoading(true);
    try {
      const pendingRes = await fetch("/api/reseller/pending-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          company: formData.company,
          firstName: formData.firstName,
          lastName: formData.lastName,
          website: formData.website,
          referralSource: formData.referralSource,
        }),
      });
      const pendingData = await pendingRes.json();
      if (!pendingRes.ok) {
        throw new Error(pendingData.error || "Failed to create signup session");
      }

      const checkoutRes = await fetch("/api/reseller/signup-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken: pendingData.pendingToken }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || "Failed to create checkout");
      }
      if (checkoutData.url) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            email: formData.email,
            company: formData.company,
            firstName: formData.firstName,
            lastName: formData.lastName,
            website: formData.website,
            referralSource: formData.referralSource,
          }));
        } catch {}
        window.location.href = checkoutData.url;
      } else {
        throw new Error("No checkout URL");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
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
          <a href="https://mouse.is/signup" className="text-gray-400 text-sm font-medium hover:text-white">
            Customer Sign Up
          </a>
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
            <span>Business</span>
            <span>Pay</span>
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
                  Continue
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

          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Get started for $97
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                One-time fee to join the Reseller Program. Or enter a promo code for free access.
              </p>

              {searchParams.get("canceled") === "1" && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm rounded-lg px-4 py-3 mb-4">
                  Checkout was canceled. You can try again below.
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-teal-400" />
                  <label className="block text-gray-300 text-sm font-medium">
                    Promo code
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => {
                      setFormData({ ...formData, promoCode: e.target.value.toUpperCase() });
                      setPromoValid(null);
                    }}
                    placeholder="Enter code"
                    className="flex-1 bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={validatePromo}
                    disabled={loading || !formData.promoCode.trim()}
                    className="px-4 py-3.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50"
                  >
                    {loading ? "..." : "Apply"}
                  </button>
                </div>
                {promoValid === true && (
                  <p className="text-green-400 text-sm">✓ Promo code applied. You can create your account for free.</p>
                )}
                {promoValid === false && formData.promoCode && (
                  <p className="text-red-400 text-sm">Invalid promo code.</p>
                )}
              </div>

              <div className="border-t border-gray-700 pt-6">
                <p className="text-gray-400 text-sm mb-4">Or pay $97 to get started:</p>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Redirecting to checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay $97 — Get Started
                    </>
                  )}
                </button>
              </div>

              {promoValid && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 8 characters"
                      className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6">
                <button
                  type="submit"
                  disabled={loading || !promoValid || (promoValid && (!formData.password || formData.password.length < 8 || formData.password !== formData.confirmPassword))}
                  className="w-full bg-gray-700 text-white font-semibold py-4 rounded-xl hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {promoValid ? "Create Account (Free with promo)" : "Create Account"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full text-gray-400 text-sm py-2 hover:text-white transition-colors mt-2"
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

export default function ResellerSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    }>
      <ResellerSignupContent />
    </Suspense>
  );
}
