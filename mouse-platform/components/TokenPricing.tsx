'use client'

import { useState } from 'react'
import { Calculator, ChevronDown, ChevronUp, Coins, Zap, Crown, Sparkles } from 'lucide-react'

interface TokenPackage {
  slug: string
  name: string
  price: string
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
    tokens: 2000,
    bonusTokens: 0,
    totalTokens: 2000,
    estimatedHours: 20,
    description: 'Perfect for trying out AI employees',
    features: [
      '2,000 tokens',
      '~20 hours of AI work',
      'All AI employee types',
      'Email support'
    ],
    popular: false
  },
  {
    slug: 'growth',
    name: 'Growth Pack',
    price: '$49',
    tokens: 6000,
    bonusTokens: 500,
    totalTokens: 6500,
    estimatedHours: 65,
    description: 'Best value for growing teams',
    features: [
      '6,500 tokens (500 bonus)',
      '~65 hours of AI work',
      'All AI employee types',
      'Priority support',
      'Custom AI training'
    ],
    popular: true
  },
  {
    slug: 'pro',
    name: 'Pro Pack',
    price: '$99',
    tokens: 15000,
    bonusTokens: 1500,
    totalTokens: 16500,
    estimatedHours: 165,
    description: 'Maximum value for power users',
    features: [
      '16,500 tokens (1,500 bonus)',
      '~165 hours of AI work',
      'All AI employee types',
      'Priority support',
      'Custom AI training',
      'API access'
    ],
    popular: false
  }
]

const TOKEN_RATES = {
  vm_minute: 1,
  api_call: 0.1,
  screenshot: 0.5,
  ai_message: 0.2,
  file_upload_mb: 1
}

interface PricingCalculatorProps {
  onPurchase?: (packageSlug: string) => void
  currentBalance?: number
}

export default function TokenPricing({ onPurchase, currentBalance = 0 }: PricingCalculatorProps) {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage>(TOKEN_PACKAGES[1])
  const [vmHoursPerMonth, setVmHoursPerMonth] = useState(40)
  const [apiCallsPerMonth, setApiCallsPerMonth] = useState(500)
  const [screenshotsPerMonth, setScreenshotsPerMonth] = useState(200)

  // Calculate monthly usage
  const vmMinutes = vmHoursPerMonth * 60
  const vmCost = Math.ceil(vmMinutes * TOKEN_RATES.vm_minute)
  const apiCost = Math.ceil(apiCallsPerMonth * TOKEN_RATES.api_call)
  const screenshotCost = Math.ceil(screenshotsPerMonth * TOKEN_RATES.screenshot)
  const totalMonthlyCost = vmCost + apiCost + screenshotCost

  // Find recommended package
  const recommendedPackage = TOKEN_PACKAGES.find(p => p.totalTokens >= totalMonthlyCost * 3) || TOKEN_PACKAGES[2]

  // Calculate savings
  const hourlyRate = 35
  const humanCost = vmHoursPerMonth * hourlyRate * 4 // Assuming 4 weeks per month
  const aiCost = (recommendedPackage.totalTokens / totalMonthlyCost) * recommendedPackage.totalTokens * (19 / 2000) // Approximate cost
  const monthlySavings = humanCost - (recommendedPackage.totalTokens > 0 ? parseInt(recommendedPackage.price.replace('$', '')) : 0)

  return (
    <div className="space-y-8">
      {/* Token Balance Display */}
      {currentBalance > 0 && (
        <div className="bg-gradient-to-r from-mouse-teal to-mouse-navy rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">Your Token Balance</p>
                <p className="text-3xl font-bold">{currentBalance.toLocaleString()} tokens</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Estimated Hours Left</p>
              <p className="text-2xl font-bold">~{Math.floor(currentBalance / 100)} hours</p>
            </div>
          </div>
        </div>
      )}

      {/* Token Packages */}
      <div>
        <h2 className="text-2xl font-bold text-mouse-navy mb-2">Purchase Tokens</h2>
        <p className="text-mouse-charcoal mb-6">Choose the package that fits your needs. All tokens never expire.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOKEN_PACKAGES.map((pkg) => (
            <div
              key={pkg.slug}
              className={`relative rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                pkg.popular
                  ? 'border-mouse-teal bg-gradient-to-b from-teal-50 to-white'
                  : 'border-gray-200 hover:border-mouse-teal/50'
              } ${selectedPackage.slug === pkg.slug ? 'ring-2 ring-mouse-teal' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-mouse-teal text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-mouse-navy mb-1">{pkg.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-mouse-navy">{pkg.price}</span>
                </div>
                {pkg.bonusTokens > 0 && (
                  <p className="text-sm text-mouse-teal font-medium mt-1">
                    +{pkg.bonusTokens.toLocaleString()} bonus tokens!
                  </p>
                )}
              </div>

              <div className="bg-mouse-offwhite rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Tokens</span>
                  <span className="text-lg font-bold text-mouse-navy">{pkg.totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Est. AI Work Hours</span>
                  <span className="text-sm font-medium text-mouse-green">~{pkg.estimatedHours} hours</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-mouse-teal flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedPackage(pkg)
                  onPurchase?.(pkg.slug)
                }}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  pkg.popular
                    ? 'bg-mouse-teal text-white hover:bg-mouse-teal/90'
                    : 'bg-mouse-navy text-white hover:bg-mouse-navy/90'
                }`}
              >
                Purchase {pkg.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Token Usage Calculator */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
          className="w-full flex items-center justify-between p-6 bg-mouse-navy text-white hover:bg-opacity-90 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6" />
            <div className="text-left">
              <h3 className="text-lg font-semibold">Token Usage Calculator</h3>
              <p className="text-sm opacity-80">Estimate your monthly token needs</p>
            </div>
          </div>
          {isCalculatorOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {isCalculatorOpen && (
          <div className="p-6 space-y-6">
            {/* Usage Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VM Hours / Month
                </label>
                <input
                  type="number"
                  value={vmHoursPerMonth}
                  onChange={(e) => setVmHoursPerMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mouse-teal focus:border-transparent"
                  min={0}
                  max={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {TOKEN_RATES.vm_minute} token per minute
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Calls / Month
                </label>
                <input
                  type="number"
                  value={apiCallsPerMonth}
                  onChange={(e) => setApiCallsPerMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mouse-teal focus:border-transparent"
                  min={0}
                  max={100000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {TOKEN_RATES.api_call} tokens per call
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screenshots / Month
                </label>
                <input
                  type="number"
                  value={screenshotsPerMonth}
                  onChange={(e) => setScreenshotsPerMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mouse-teal focus:border-transparent"
                  min={0}
                  max={10000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {TOKEN_RATES.screenshot} tokens per screenshot
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="bg-mouse-offwhite rounded-lg p-6">
              <h4 className="text-lg font-semibold text-mouse-navy mb-4">Estimated Monthly Usage</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">VM Runtime</div>
                  <div className="text-xl font-bold text-mouse-navy">
                    {vmCost.toLocaleString()} tokens
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">API Calls</div>
                  <div className="text-xl font-bold text-mouse-navy">
                    {apiCost.toLocaleString()} tokens
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Screenshots</div>
                  <div className="text-xl font-bold text-mouse-navy">
                    {screenshotCost.toLocaleString()} tokens
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Total / Month</div>
                  <div className="text-xl font-bold text-mouse-teal">
                    {totalMonthlyCost.toLocaleString()} tokens
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Recommended Package</p>
                    <p className="text-lg font-semibold text-mouse-navy">
                      {recommendedPackage.name} - {recommendedPackage.price}
                    </p>
                    <p className="text-sm text-gray-500">
                      {recommendedPackage.totalTokens.toLocaleString()} tokens covers ~{Math.floor(recommendedPackage.totalTokens / (totalMonthlyCost || 1))} months
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">vs. Human Employee Cost</p>
                    <p className="text-2xl font-bold text-mouse-green">
                      Save ${monthlySavings.toLocaleString()}/mo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Token Usage Guide */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-mouse-navy mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-mouse-teal" />
          What Can You Do With Tokens?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-mouse-teal mb-1">1,000</div>
            <div className="text-sm text-gray-600">~16 hours of AI employee work</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-mouse-teal mb-1">5,000</div>
            <div className="text-sm text-gray-600">~83 hours of AI employee work</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-mouse-teal mb-1">10,000</div>
            <div className="text-sm text-gray-600">~166 hours of AI employee work</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-mouse-teal mb-1">∞</div>
            <div className="text-sm text-gray-600">Tokens never expire!</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple token balance component for dashboard
export function TokenBalanceCard({ balance, onPurchase }: { balance: number; onPurchase?: () => void }) {
  const estimatedHours = Math.floor(balance / 100)
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mouse-teal/10 rounded-lg">
            <Coins className="w-6 h-6 text-mouse-teal" />
          </div>
          <div>
            <h3 className="font-semibold text-mouse-navy">Token Balance</h3>
            <p className="text-2xl font-bold text-mouse-navy">{balance.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Est. Hours Left</p>
          <p className="text-xl font-semibold text-mouse-green">~{estimatedHours}h</p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-mouse-teal h-2 rounded-full transition-all"
          style={{ width: `${Math.min((balance / 16500) * 100, 100)}%` }}
        />
      </div>
      
      <button
        onClick={onPurchase}
        className="w-full py-2 bg-mouse-navy text-white rounded-lg font-medium hover:bg-mouse-navy/90 transition-colors"
      >
        Purchase More Tokens
      </button>
    </div>
  )
}

// Token transaction history component
export function TokenTransactionHistory({ transactions }: { transactions: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h3 className="font-semibold text-mouse-navy mb-4">Recent Transactions</h3>
      
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">{tx.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Balance: {tx.balance_after}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
