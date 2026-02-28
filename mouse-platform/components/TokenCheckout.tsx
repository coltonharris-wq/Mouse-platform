'use client'

import { useState } from 'react'
import { Coins, Check, Loader2, AlertCircle, Sparkles } from 'lucide-react'

interface TokenPackage {
  slug: string
  name: string
  price: string
  priceCents: number
  tokens: number
  bonusTokens: number
  totalTokens: number
  estimatedHours: number
  description: string
  features: string[]
  popular: boolean
}

const TOKEN_PACKAGES: TokenPackage[] = [
  {
    slug: 'starter',
    name: 'Starter Pack',
    price: '$19',
    priceCents: 1900,
    tokens: 2000,
    bonusTokens: 0,
    totalTokens: 2000,
    estimatedHours: 20,
    description: 'Perfect for trying out AI employees',
    features: ['2,000 tokens', '~20 hours of AI work', 'All AI employee types', 'Email support'],
    popular: false
  },
  {
    slug: 'growth',
    name: 'Growth Pack',
    price: '$49',
    priceCents: 4900,
    tokens: 6000,
    bonusTokens: 500,
    totalTokens: 6500,
    estimatedHours: 65,
    description: 'Best value for growing teams',
    features: ['6,500 tokens (500 bonus)', '~65 hours of AI work', 'All AI employee types', 'Priority support', 'Custom AI training'],
    popular: true
  },
  {
    slug: 'pro',
    name: 'Pro Pack',
    price: '$99',
    priceCents: 9900,
    tokens: 15000,
    bonusTokens: 1500,
    totalTokens: 16500,
    estimatedHours: 165,
    description: 'Maximum value for power users',
    features: ['16,500 tokens (1,500 bonus)', '~165 hours of AI work', 'All AI employee types', 'Priority support', 'Custom AI training', 'API access'],
    popular: false
  }
]

interface TokenCheckoutProps {
  customerId: string
  apiBaseUrl: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function TokenCheckout({ customerId, apiBaseUrl, onSuccess, onCancel }: TokenCheckoutProps) {
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage>(TOKEN_PACKAGES[1])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select')

  const handlePurchase = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/customers/${customerId}/tokens/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_slug: selectedPackage.slug,
          success_url: `${window.location.origin}/tokens/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/tokens/cancel`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      
      // Redirect to Stripe checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-mouse-navy mb-2">Purchase Complete!</h2>
        <p className="text-gray-600 mb-6">
          Your {selectedPackage.totalTokens.toLocaleString()} tokens have been added to your account.
        </p>
        <button
          onClick={onSuccess}
          className="w-full py-3 bg-mouse-teal text-white rounded-lg font-semibold hover:bg-mouse-teal/90 transition-colors"
        >
          Continue to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-mouse-teal/10 text-mouse-teal px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Coins className="w-4 h-4" />
          Purchase Tokens
        </div>
        <h1 className="text-3xl font-bold text-mouse-navy mb-2">
          Choose Your Token Package
        </h1>
        <p className="text-gray-600">
          Tokens never expire. Use them anytime for AI employee work.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Package Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {TOKEN_PACKAGES.map((pkg) => (
          <div
            key={pkg.slug}
            onClick={() => setSelectedPackage(pkg)}
            className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
              selectedPackage.slug === pkg.slug
                ? 'border-mouse-teal bg-teal-50 ring-2 ring-mouse-teal ring-offset-2'
                : 'border-gray-200 hover:border-mouse-teal/50 bg-white'
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-mouse-teal text-white text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </span>
              </div>
            )}

            {/* Selection indicator */}
            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedPackage.slug === pkg.slug
                ? 'bg-mouse-teal border-mouse-teal'
                : 'border-gray-300'
            }`}>
              {selectedPackage.slug === pkg.slug && (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-mouse-navy mb-1">{pkg.name}</h3>
              <p className="text-sm text-gray-500">{pkg.description}</p>
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-mouse-navy">{pkg.price}</span>
              <span className="text-gray-500 ml-1">one-time</span>
              {pkg.bonusTokens > 0 && (
                <p className="text-sm text-mouse-teal font-medium mt-2">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  +{pkg.bonusTokens.toLocaleString()} bonus tokens!
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Tokens</span>
                <span className="text-lg font-bold text-mouse-navy">
                  {pkg.totalTokens.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Est. AI Hours</span>
                <span className="text-sm font-medium text-mouse-green">
                  ~{pkg.estimatedHours} hours
                </span>
              </div>
            </div>

            <ul className="space-y-2">
              {pkg.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-mouse-teal flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-mouse-offwhite rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-mouse-navy mb-4">Order Summary</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-gray-800">{selectedPackage.name}</p>
            <p className="text-sm text-gray-500">{selectedPackage.totalTokens.toLocaleString()} tokens</p>
          </div>
          <p className="text-xl font-bold text-mouse-navy">{selectedPackage.price}</p>
        </div>
        <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
          <p className="font-semibold text-gray-800">Total</p>
          <p className="text-2xl font-bold text-mouse-navy">{selectedPackage.price}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="flex-1 py-3 bg-mouse-teal text-white rounded-lg font-semibold hover:bg-mouse-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${selectedPackage.price}`
          )}
        </button>
      </div>

      {/* Security Note */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Secure payment processing by Stripe. Your card information is never stored on our servers.
      </p>
    </div>
  )
}
