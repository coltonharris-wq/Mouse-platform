'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Loader2, Shield, Clock, Users, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PLAN_CONFIG = {
  starter: {
    name: 'Starter',
    price: '$97',
    description: '160 work hours/month with 1 AI Employee',
    features: [
      '160 work hours per month',
      '1 AI Employee included',
      'Email + CRM automation',
      'ROI dashboard',
      'Standard compute',
      'Email support',
      '14-day onboarding',
    ],
    amount: 9700,
  },
  growth: {
    name: 'Growth',
    price: '$297',
    description: '500 work hours/month with 3 AI Employees',
    features: [
      '500 work hours per month',
      '3 AI Employees included',
      'Sales + Ops + AR automation',
      'Priority compute',
      'Voice/Video calls included',
      'ROI dashboard & custom reports',
      'Monthly strategy call',
      'Priority support (4-hour response)',
    ],
    amount: 29700,
  },
  pro: {
    name: 'Pro',
    price: '$497',
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
    amount: 49700,
  },
  reseller: {
    name: 'Reseller',
    price: '$97',
    description: '20 work hours/month + 40% commission on referrals',
    features: [
      '20 work hours per month',
      '40% recurring commission on all referrals',
      'White-label reseller dashboard',
      'Custom invite links & tracking',
      'Dedicated partner support',
      'Marketing materials included',
      'Monthly commission payouts',
      'Priority onboarding',
    ],
    amount: 9700,
  },
};

export default function CheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    params.then(p => setPlan(p.plan));
  }, [params]);

  const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];

  useEffect(() => {
    // Get customer info from URL params or localStorage
    const cid = searchParams.get('customerId') || localStorage.getItem('customerId') || '';
    const userEmail = searchParams.get('email') || localStorage.getItem('userEmail') || '';
    setCustomerId(cid);
    setEmail(userEmail);
  }, [searchParams]);

  if (!plan || !planConfig) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-mouse-navy">Invalid Plan</h1>
            <p className="mt-2 text-mouse-charcoal">The plan you selected does not exist.</p>
            <Link href="/pricing" className="mt-4 inline-block text-mouse-teal hover:underline">
              View Pricing Plans
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan,
          customerId: customerId,
          email: email,
          promo_code: promoCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-mouse-offwhite py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Plan details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded">
                  {planConfig.name} Plan
                </span>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-mouse-navy">{planConfig.price}</span>
                  <span className="text-mouse-charcoal">/month</span>
                </div>
                <p className="text-mouse-slate mt-2">{planConfig.description}</p>
              </div>

              <div className="space-y-3">
                {planConfig.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check size={18} className="text-mouse-green mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-mouse-charcoal">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-mouse-slate">
                  <Shield size={16} />
                  <span>Secure SSL Encrypted Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-mouse-slate mt-2">
                  <Clock size={16} />
                  <span>Instant account activation after payment</span>
                </div>
              </div>
            </div>

            {/* Right side - Checkout form */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-mouse-teal p-6">
              <h2 className="text-xl font-bold text-mouse-navy mb-6">
                Complete Your Purchase
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-mouse-navy mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-mouse-teal focus:border-transparent outline-none"
                    required
                  />
                  <p className="text-xs text-mouse-slate mt-1">
                    We&apos;ll send your login credentials here
                  </p>
                </div>

                {customerId && (
                  <div className="p-3 bg-mouse-offwhite rounded">
                    <p className="text-sm text-mouse-charcoal">
                      Customer ID: <span className="font-mono">{customerId}</span>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-mouse-navy mb-1">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoApplied(false);
                      }}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-mouse-teal focus:border-transparent outline-none font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (promoCode.trim()) {
                          setPromoApplied(true);
                        }
                      }}
                      className="px-4 py-3 bg-mouse-navy text-white rounded hover:bg-[#2d4a6f] transition-colors text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-xs text-mouse-green mt-1 font-medium">
                      ✅ Promo code &quot;{promoCode}&quot; will be applied at checkout
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-mouse-charcoal">Subtotal</span>
                    <span className="font-semibold text-mouse-navy">{planConfig.price}</span>
                  </div>
                  {promoApplied && promoCode && (
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-mouse-green font-medium">Promo: {promoCode}</span>
                      <span className="text-mouse-green font-semibold">Applied at checkout</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-mouse-charcoal">Tax</span>
                    <span className="text-mouse-slate">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-semibold text-mouse-navy">Total</span>
                    <span className="text-2xl font-bold text-mouse-navy">{planConfig.price}/mo</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-orange-500 text-white font-semibold py-4 rounded hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Pay {planConfig.price} & Activate
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-mouse-slate mt-4">
                  By completing this purchase, you agree to our{' '}
                  <Link href="/terms" className="text-mouse-teal hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-mouse-teal hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-mouse-slate">
                    <Shield size={14} />
                    <span>PCI Compliant</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-mouse-slate">
                    <Users size={14} />
                    <span>256-bit SSL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
