'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Loader2, ArrowRight, Users, Zap, Shield } from 'lucide-react';

const PLAN_CONFIG = {
  starter: {
    name: 'Starter',
    price: '$97',
    amount: 9700,
    description: '160 work hours/month with 1 AI Employee',
    features: [
      '160 work hours per month',
      '1 AI Employee included',
      'Email + CRM automation',
      'ROI dashboard',
      'Standard compute',
      'Email support',
    ],
  },
  growth: {
    name: 'Growth',
    price: '$297',
    amount: 29700,
    description: '500 work hours/month with 3 AI Employees',
    features: [
      '500 work hours per month',
      '3 AI Employees included',
      'Sales + Ops + AR automation',
      'Priority compute',
      'Voice/Video calls included',
      'ROI dashboard & custom reports',
      'Monthly strategy call',
      'Priority support',
    ],
  },
  pro: {
    name: 'Pro',
    price: '$497',
    amount: 49700,
    description: 'Unlimited work hours with 5 AI Employees',
    features: [
      'Unlimited work hours',
      '5 AI Employees included',
      'Everything in Growth, plus:',
      'Custom workflow builds',
      'Advanced integrations',
      'API access',
      'Dedicated account manager',
      '24/7 priority support',
    ],
  },
};

function ResellerCustomerSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('ref');

  const [step, setStep] = useState<'validate' | 'info' | 'plan' | 'checkout'>('validate');
  const [reseller, setReseller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'pro'>('growth');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Validate invite code on load
  useEffect(() => {
    if (!inviteCode) {
      setError('Invalid signup link. Please contact your reseller for a valid invite.');
      setLoading(false);
      return;
    }

    validateInviteCode();
  }, [inviteCode]);

  async function validateInviteCode() {
    try {
      const res = await fetch(`/api/reseller/invite?code=${inviteCode}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid invite code');
        setLoading(false);
        return;
      }

      setReseller(data.reseller);
      setStep('info');
      setLoading(false);
    } catch (err) {
      setError('Failed to validate invite code');
      setLoading(false);
    }
  }

  function handleContinueToPlan() {
    if (!email || !password || !businessName) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setStep('plan');
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reseller/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          inviteCode,
          email,
          businessName,
          businessType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-mouse-teal animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Validating your invite...</p>
        </div>
      </div>
    );
  }

  if (error && step === 'validate') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invite Link</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/" className="text-mouse-teal hover:underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  const plan = PLAN_CONFIG[selectedPlan];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-xl">
            🖱️ Mouse
          </Link>
          {reseller && (
            <div className="text-sm text-gray-400">
              Partnered with <span className="text-mouse-teal">{reseller.companyName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className={step === 'info' ? 'text-mouse-teal' : ''}>Your Info</span>
            <span className={step === 'plan' ? 'text-mouse-teal' : ''}>Select Plan</span>
            <span>Payment</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-mouse-teal to-purple-500 transition-all duration-300"
              style={{ width: step === 'info' ? '33%' : step === 'plan' ? '66%' : '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-12">
        <div className="max-w-md mx-auto">
          {step === 'info' && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">
                Create Your Account
              </h1>
              <p className="text-gray-400 text-center mb-8">
                Get started with AI employees for your business
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Company Name"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mouse-teal"
                  >
                    <option value="">Select your industry</option>
                    <option value="agency">Marketing Agency</option>
                    <option value="consulting">Consulting</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="legal">Legal Services</option>
                    <option value="realestate">Real Estate</option>
                    <option value="saas">SaaS / Technology</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-mouse-teal"
                  />
                </div>

                <button
                  onClick={handleContinueToPlan}
                  className="w-full bg-gradient-to-r from-mouse-teal to-blue-500 text-white font-semibold py-4 rounded-xl mt-6 hover:opacity-90 flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}

          {step === 'plan' && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">
                Choose Your Plan
              </h1>
              <p className="text-gray-400 text-center mb-8">
                Select the plan that fits your business needs
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-8">
                {Object.entries(PLAN_CONFIG).map(([key, planConfig]) => (
                  <div
                    key={key}
                    onClick={() => setSelectedPlan(key as any)}
                    className={`cursor-pointer border rounded-xl p-5 transition-all ${
                      selectedPlan === key
                        ? 'border-mouse-teal bg-mouse-teal/10'
                        : 'border-gray-700 bg-[#1a1a2e] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{planConfig.name}</h3>
                        <p className="text-sm text-gray-400">{planConfig.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">{planConfig.price}</div>
                        <div className="text-xs text-gray-500">/month</div>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {planConfig.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-mouse-teal flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="bg-[#1a1a2e] border border-gray-700 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-white mb-4">Order Summary</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">{plan.name} Plan</span>
                  <span className="text-white">{plan.price}/mo</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Setup Fee</span>
                  <span className="text-green-400">Waived</span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-xl font-bold text-white">{plan.price}/mo</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-gradient-to-r from-mouse-teal to-blue-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Pay {plan.price} & Start
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('info')}
                className="w-full text-gray-400 text-sm py-3 hover:text-white transition-colors mt-2"
              >
                Back
              </button>

              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  SSL Secure
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Instant Setup
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function ResellerCustomerSignupPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-mouse-teal animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ResellerCustomerSignupPage />
    </Suspense>
  );
}
