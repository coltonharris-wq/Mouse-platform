'use client'

import { useState, useEffect } from 'react'
import { 
  Coins, 
  Users, 
  Activity, 
  TrendingUp, 
  ShoppingCart,
  Plus,
  Clock,
  Zap,
  AlertCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

interface TokenPackage {
  slug: string
  name: string
  price: string
  totalTokens: number
  popular: boolean
}

interface Employee {
  id: string
  name: string
  role: string
  status: string
  current_task?: string
  vm_status?: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  balance_after: number
  description: string
  created_at: string
}

interface DashboardData {
  customer: {
    id: string
    company_name: string
    email: string
    status: string
  }
  tokens: {
    balance: number
    lifetime_earned: number
    lifetime_spent: number
  }
  recent_transactions: Transaction[]
  employees: Employee[]
  packages: TokenPackage[]
}

interface TokenDashboardProps {
  customerId: string
  apiBaseUrl: string
  onPurchaseTokens?: () => void
  onDeployEmployee?: () => void
}

export default function TokenDashboard({ 
  customerId, 
  apiBaseUrl, 
  onPurchaseTokens,
  onDeployEmployee 
}: TokenDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/customers/${customerId}/dashboard`)
      if (!response.ok) throw new Error('Failed to fetch dashboard')
      const dashboardData = await response.json()
      setData(dashboardData)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [customerId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mouse-teal" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="w-6 h-6" />
          <p>Error loading dashboard: {error}</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const { customer, tokens, recent_transactions, employees, packages } = data
  const estimatedHours = Math.floor(tokens.balance / 100)
  const lowBalanceThreshold = 500
  const isLowBalance = tokens.balance < lowBalanceThreshold

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-mouse-navy">
            Welcome back, {customer.company_name}
          </h1>
          <p className="text-gray-500">Here's your AI employee overview</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="p-2 text-gray-400 hover:text-mouse-teal transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* AI Work Hours Balance Card */}
      <div className={`rounded-xl p-6 ${
        isLowBalance 
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
          : 'bg-gradient-to-r from-mouse-teal to-mouse-navy text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isLowBalance ? 'bg-white/20' : 'bg-white/20'}`}>
              <Coins className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm opacity-80">Available AI Work Hours</p>
              <p className="text-4xl font-bold">{tokens.balance.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm opacity-80">Est. Hours Left</p>
              <p className="text-2xl font-bold">~{estimatedHours}h</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">Lifetime Earned</p>
              <p className="text-2xl font-bold">{tokens.lifetime_earned.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">Lifetime Spent</p>
              <p className="text-2xl font-bold">{tokens.lifetime_spent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Low Balance Warning */}
        {isLowBalance && (
          <div className="mt-4 p-3 bg-white/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              Your AI Work Hours balance is running low. Purchase more AI Work Hours to keep your AI employees working.
            </p>
          </div>
        )}

        {/* Quick Purchase Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {packages.slice(0, 2).map((pkg) => (
            <button
              key={pkg.slug}
              onClick={onPurchaseTokens}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              {pkg.name} - {pkg.price}
            </button>
          ))}
          <button
            onClick={onPurchaseTokens}
            className="px-4 py-2 bg-white text-mouse-navy rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 inline mr-1" />
            Purchase AI Work Hours
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active AI Employees</p>
              <p className="text-3xl font-bold text-mouse-navy">
                {employees.filter(e => e.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <button
            onClick={onDeployEmployee}
            className="mt-4 text-sm text-mouse-teal hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Deploy New Employee
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total AI Hours Used</p>
              <p className="text-3xl font-bold text-mouse-navy">
                {Math.floor(tokens.lifetime_spent / 100)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Lifetime AI work hours
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Tasks</p>
              <p className="text-3xl font-bold text-mouse-navy">
                {employees.filter(e => e.current_task).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Tasks in progress
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Employees */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-mouse-navy flex items-center gap-2">
              <Users className="w-5 h-5 text-mouse-teal" />
              AI Employees
            </h3>
            <button
              onClick={onDeployEmployee}
              className="text-sm text-mouse-teal hover:underline"
            >
              View All
            </button>
          </div>

          {employees.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No AI employees yet</p>
              <button
                onClick={onDeployEmployee}
                className="px-4 py-2 bg-mouse-teal text-white rounded-lg text-sm font-medium"
              >
                Deploy Your First Employee
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.slice(0, 5).map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      emp.status === 'active' ? 'bg-green-500' : 
                      emp.status === 'deploying' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      emp.status === 'active' ? 'bg-green-100 text-green-700' :
                      emp.status === 'deploying' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {emp.status}
                    </span>
                    {emp.current_task && (
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">
                        {emp.current_task}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-mouse-navy flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-mouse-teal" />
              AI Work Hours Activity
            </h3>
            <button
              onClick={onPurchaseTokens}
              className="text-sm text-mouse-teal hover:underline"
            >
              View All
            </button>
          </div>

          {recent_transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent_transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.amount > 0 ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <Coins className={`w-4 h-4 ${
                        tx.amount > 0 ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{tx.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.amount > 0 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </p>
                    <p className="text-xs text-gray-500">
                      Bal: {tx.balance_after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-mouse-offwhite rounded-xl p-6">
        <h3 className="font-semibold text-mouse-navy mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onDeployEmployee}
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <Plus className="w-6 h-6 text-mouse-teal mb-2" />
            <p className="font-medium text-gray-800">Deploy AI</p>
            <p className="text-xs text-gray-500">Start a new employee</p>
          </button>
          
          <button
            onClick={onPurchaseTokens}
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <Coins className="w-6 h-6 text-mouse-teal mb-2" />
            <p className="font-medium text-gray-800">Buy AI Work Hours</p>
            <p className="text-xs text-gray-500">Add to your balance</p>
          </button>
          
          <button
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left opacity-50 cursor-not-allowed"
          >
            <Activity className="w-6 h-6 text-gray-400 mb-2" />
            <p className="font-medium text-gray-800">Usage Report</p>
            <p className="text-xs text-gray-500">Coming soon</p>
          </button>
          
          <button
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left opacity-50 cursor-not-allowed"
          >
            <TrendingUp className="w-6 h-6 text-gray-400 mb-2" />
            <p className="font-medium text-gray-800">Analytics</p>
            <p className="text-xs text-gray-500">Coming soon</p>
          </button>
        </div>
      </div>
    </div>
  )
}
