'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TOKEN_PACKAGES, TOKEN_COSTS, formatPrice, formatTokens } from '@/lib/stripe';
import { Check, Coins, MessageSquare, Bot, Clock, Mail, Zap, AlertCircle } from 'lucide-react';

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId') || undefined;
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageSlug: string) => {
    if (!customerId) {
      router.push('/login');
      return;
    }

    setLoading(packageSlug);
    try {
      const response = await fetch('/api/tokens/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId,
          packageSlug,
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: `${window.location.origin}/pricing?purchase=cancelled`
        })
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const packages = Object.values(TOKEN_PACKAGES);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Token Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pay only for what you use. Purchase tokens and spend them on AI employees, 
            VM runtime, and more.
          </p>
        </div>

        {/* Token Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <div
              key={pkg.slug}
              className={`relative rounded-2xl bg-white p-8 shadow-lg border-2 ${
                pkg.slug === 'growth' 
                  ? 'border-teal-500 ring-4 ring-teal-100' 
                  : 'border-gray-200'
              }`}
            >
              {pkg.slug === 'growth' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
                <p className="text-gray-500 mt-2">{pkg.description}</p>
              </div>

              <div className="text-center mb-8">
                <span className="text-5xl font-bold text-gray-900">
                  {formatPrice(pkg.priceCents)}
                </span>
                <div className="flex items-center justify-center gap-2 mt-2 text-teal-600">
                  <Coins className="w-5 h-5" />
                  <span className="font-semibold">
                    {formatTokens(pkg.tokenAmount)} tokens
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ${((pkg.priceCents / 100) / (pkg.tokenAmount / 1000)).toFixed(2)} per 1,000 tokens
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(pkg.slug)}
                disabled={loading === pkg.slug}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  pkg.slug === 'growth'
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === pkg.slug ? 'Loading...' : 'Buy Tokens'}
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="bg-gray-900 rounded-2xl p-8 text-center mb-16">
          <h2 className="text-2xl font-bold text-white mb-4">
            Need More?
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Enterprise plans with custom token amounts, volume discounts, and dedicated support.
          </p>
          <a
            href="mailto:sales@mouseplatform.com"
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Sales
          </a>
        </div>

        {/* Token Costs Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            What Can You Do With Tokens?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-teal-100 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Message King Mouse</h3>
                <p className="text-2xl font-bold text-teal-600">
                  {TOKEN_COSTS.messageKingMouse.tokens} tokens
                </p>
                <p className="text-sm text-gray-500">
                  Each message sent to your AI assistant
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Deploy AI Employee</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {TOKEN_COSTS.deployAiEmployee.tokens} tokens
                </p>
                <p className="text-sm text-gray-500">
                  One-time cost per AI employee deployment
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">VM Runtime</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {TOKEN_COSTS.vmRuntime1h.tokens} tokens/hour
                </p>
                <p className="text-sm text-gray-500">
                  Per hour of VM runtime for AI employees
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-green-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Process Email</h3>
                <p className="text-2xl font-bold text-green-600">
                  {TOKEN_COSTS.processEmail.tokens} tokens
                </p>
                <p className="text-sm text-gray-500">
                  Per email processed by AI employees
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">API Call</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {TOKEN_COSTS.apiCall.tokens} token
                </p>
                <p className="text-sm text-gray-500">
                  Per API request to the platform
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Low Balance Alert</h3>
                <p className="text-2xl font-bold text-red-600">
                  &lt; 500 tokens
                </p>
                <p className="text-sm text-gray-500">
                  We&apos;ll notify you when running low
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
