'use client'

import { useState } from 'react'
import { Calculator, ChevronDown, ChevronUp, Clock, Zap, DollarSign } from 'lucide-react'

interface WorkHoursPackage {
  slug: string
  name: string
  price: string
  workHours: number
  bonusHours: number
  totalHours: number
  description: string
  features: string[]
  popular: boolean
}

// Work Hours packages at $4.98/hour
const WORK_HOURS_PACKAGES: WorkHoursPackage[] = [
  {
    slug: 'starter',
    name: '10 Hours',
    price: '$49.80',
    workHours: 10,
    bonusHours: 0,
    totalHours: 10,
    description: 'Perfect for trying out AI employees',
    features: ['10 AI Work Hours', 'All AI employee types', 'Email support'],
    popular: false
  },
  {
    slug: 'growth',
    name: '50 Hours',
    price: '$249.00',
    workHours: 50,
    bonusHours: 0,
    totalHours: 50,
    description: 'Best value for growing teams',
    features: ['50 AI Work Hours', 'All AI employee types', 'Priority support', 'Custom AI training'],
    popular: true
  },
  {
    slug: 'pro',
    name: '100 Hours',
    price: '$498.00',
    workHours: 100,
    bonusHours: 0,
    totalHours: 100,
    description: 'Maximum value for power users',
    features: ['100 AI Work Hours', 'All AI employee types', 'Priority support', 'Custom AI training', 'API access'],
    popular: false
  }
]

const HOURLY_RATE = 4.98
const HUMAN_HOURLY_RATE = 35

interface PricingCalculatorProps {
  onPurchase?: (packageSlug: string) => void
  currentBalance?: number
}

export default function WorkHoursPricing({ onPurchase, currentBalance = 0 }: PricingCalculatorProps) {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<WorkHoursPackage>(WORK_HOURS_PACKAGES[1])
  const [vmHoursPerMonth, setVmHoursPerMonth] = useState(40)
  const [textChatTokens, setTextChatTokens] = useState(50000)
  const [imagesPerMonth, setImagesPerMonth] = useState(20)

  // Calculate monthly usage (all in hours)
  const vmCost = vmHoursPerMonth * 1.0 // 1 hour per VM hour
  const textChatCost = (textChatTokens / 1000) * 0.1 // 0.1 hours per 1K tokens
  const imageCost = imagesPerMonth * 0.5 // 0.5 hours per image
  const totalMonthlyCost = vmCost + textChatCost + imageCost

  // Find recommended package
  const recommendedPackage = WORK_HOURS_PACKAGES.find(p => p.totalHours >= totalMonthlyCost * 3) || WORK_HOURS_PACKAGES[2]

  // Calculate savings
  const humanCost = vmHoursPerMonth * HUMAN_HOURLY_RATE * 4 // Assuming 4 weeks per month
  const aiCost = totalMonthlyCost * HOURLY_RATE * 4
  const monthlySavings = humanCost - aiCost

  return (
    <div className="space-y-8">
      {/* Work Hours Balance Display */}
      {currentBalance > 0 && (
        <div className="bg-gradient-to-r from-mouse-teal to-mouse-navy rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">Your Work Hours Balance</p>
                <p className="text-3xl font-bold">{currentBalance.toFixed(1)} hours</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">At $4.98/hour</p>
              <p className="text-2xl font-bold">${(currentBalance * HOURLY_RATE).toFixed(2)} value</p>
            </div>
          </div>
        </div>
      )}

      {/* Work Hours Packages */}
      <div>
        <h2 className="text-2xl font-bold text-mouse-navy mb-2">Purchase Work Hours</h2>
        <p className="text-mouse-charcoal mb-2">Choose the package that fits your needs. All Work Hours never expire.</p>
        <p className="text-mouse-teal font-medium mb-6">Fixed rate: $4.98/hour</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WORK_HOURS_PACKAGES.map((pkg) => (
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
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
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
              </div>

              <div className="bg-mouse-offwhite rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Work Hours</span>
                  <span className="text-lg font-bold text-mouse-navy">{pkg.totalHours}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hourly Rate</span>
                  <span className="text-sm font-medium text-mouse-green">$4.98/hour</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-mouse-teal flex-shrink-0" />
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
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-mouse-navy text-white hover:bg-mouse-navy/90'
                }`}
              >
                Purchase {pkg.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Work Hours Usage Calculator */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
          className="w-full flex items-center justify-between p-6 bg-mouse-navy text-white hover:bg-opacity-90 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6" />
            <div className="text-left">
              <h3 className="text-lg font-semibold">Work Hours Calculator</h3>
              <p className="text-sm opacity-80">Estimate your monthly Work Hours needs</p>
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
                  1 hour per VM hour
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Chat Tokens / Month
                </label>
                <input
                  type="number"
                  value={textChatTokens}
                  onChange={(e) => setTextChatTokens(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mouse-teal focus:border-transparent"
                  min={0}
                  max={1000000}
                  step={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  0.1 hours per 1K tokens
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images / Month
                </label>
                <input
                  type="number"
                  value={imagesPerMonth}
                  onChange={(e) => setImagesPerMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mouse-teal focus:border-transparent"
                  min={0}
                  max={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  0.5 hours per image
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
                    {vmCost.toFixed(1)} hrs
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Text Chat</div>
                  <div className="text-xl font-bold text-mouse-navy">
                    {textChatCost.toFixed(1)} hrs
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Images</div>
                  <div className="text-xl font-bold text-mouse-navy">
                    {imageCost.toFixed(1)} hrs
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Total / Month</div>
                  <div className="text-xl font-bold text-mouse-teal">
                    {totalMonthlyCost.toFixed(1)} hrs
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
                      {recommendedPackage.totalHours} hours covers ~{Math.floor(recommendedPackage.totalHours / (totalMonthlyCost || 1))} months
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">vs. Human Employee Cost</p>
                    <p className="text-2xl font-bold text-mouse-green">
                      Save ${monthlySavings.toLocaleString()}/mo
                    </p>
                    <p className="text-xs text-gray-500">
                      ${HUMAN_HOURLY_RATE}/hr vs $4.98/hr
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Work Hours Usage Guide */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-mouse-navy mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-mouse-teal" />
          What Can You Do With Work Hours?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-mouse-teal mb-1">10 hrs</div>
            <div className="text-sm text-gray-600">~10 hours of AI employee work</div>
            <div className="text-xs text-gray-400 mt-1">$49.80</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-mouse-teal mb-1">50 hrs</div>
            <div className="text-sm text-gray-600">~50 hours of AI employee work</div>
            <div className="text-xs text-gray-400 mt-1">$249.00</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-mouse-teal mb-1">100 hrs</div>
            <div className="text-sm text-gray-600">~100 hours of AI employee work</div>
            <div className="text-xs text-gray-400 mt-1">$498.00</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-mouse-teal mb-1">∞</div>
            <div className="text-sm text-gray-600">Work Hours never expire!</div>
            <div className="text-xs text-gray-400 mt-1">Use anytime</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple work hours balance component for dashboard
export function WorkHoursBalanceCard({ balance, onPurchase }: { balance: number; onPurchase?: () => void }) {
  const HOURLY_RATE = 4.98
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mouse-teal/10 rounded-lg">
            <Clock className="w-6 h-6 text-mouse-teal" />
          </div>
          <div>
            <h3 className="font-semibold text-mouse-navy">Work Hours Balance</h3>
            <p className="text-2xl font-bold text-mouse-navy">{balance.toFixed(1)} hours</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Value</p>
          <p className="text-xl font-semibold text-mouse-green">${(balance * HOURLY_RATE).toFixed(2)}</p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-mouse-teal h-2 rounded-full transition-all"
          style={{ width: `${Math.min((balance / 100) * 100, 100)}%` }}
        />
      </div>
      
      <button
        onClick={onPurchase}
        className="w-full py-2 bg-mouse-navy text-white rounded-lg font-medium hover:bg-mouse-navy/90 transition-colors"
      >
        Purchase More Work Hours
      </button>
    </div>
  )
}

// Work hours transaction history component
export function WorkHoursTransactionHistory({ transactions }: { transactions: any[] }) {
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
                  {tx.amount > 0 ? '+' : ''}{tx.amount}h
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">{tx.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Bal: {tx.balance_after}h</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
