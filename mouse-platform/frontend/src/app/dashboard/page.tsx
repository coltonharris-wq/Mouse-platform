'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingCart, 
  AlertCircle,
  MessageSquare,
  Bot,
  Clock,
  History,
  Plus
} from 'lucide-react';
import { formatTokens, isLowBalance, TOKEN_COSTS } from '@/lib/stripe';

interface TokenTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number;
  balance_after: number;
  description: string;
  reference_type?: string;
  created_at: string;
}

interface TokenBalance {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  last_updated: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId') || 'demo-customer';
  
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokenData();
  }, [customerId]);

  const fetchTokenData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch(`/api/tokens/balance?customerId=${customerId}`),
        fetch(`/api/v1/customers/${customerId}/tokens/transactions`)
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case 'usage':
        return <ArrowDownRight className="w-5 h-5 text-red-500" />;
      case 'bonus':
        return <Plus className="w-5 h-5 text-blue-500" />;
      default:
        return <History className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const currentBalance = balance?.balance || 0;
  const lowBalance = isLowBalance(currentBalance);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your AI employees and token balance
          </p>
        </div>

        {/* Token Balance Card */}
        <div className={`bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 ${
          lowBalance ? 'border-red-500' : 'border-teal-500'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${lowBalance ? 'bg-red-100' : 'bg-teal-100'}`}>
                <Coins className={`w-8 h-8 ${lowBalance ? 'text-red-600' : 'text-teal-600'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Token Balance
                </p>
                <p className={`text-4xl font-bold ${lowBalance ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTokens(currentBalance)}
                </p>
                {lowBalance && (
                  <div className="flex items-center gap-2 mt-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Low balance - Purchase more tokens
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Lifetime Earned</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatTokens(balance?.lifetime_earned || 0)}
                </p>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Lifetime Spent</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatTokens(balance?.lifetime_spent || 0)}
                </p>
              </div>
            </div>

            <Link
              href="/pricing"
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                lowBalance
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Buy More Tokens
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Token Costs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Token Costs
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                    <span className="text-gray-700">Message King Mouse</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {TOKEN_COSTS.messageKingMouse.tokens} tokens
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Deploy AI Employee</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {TOKEN_COSTS.deployAiEmployee.tokens} tokens
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">VM Runtime (1 hour)</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {TOKEN_COSTS.vmRuntime1h.tokens} tokens
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Process Email</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {TOKEN_COSTS.processEmail.tokens} tokens
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ArrowUpRight className="w-5 h-5 text-orange-600" />
                    <span className="text-gray-700">API Call</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {TOKEN_COSTS.apiCall.tokens} token
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-teal-50 rounded-lg">
                <p className="text-sm text-teal-800">
                  <strong>Tip:</strong> Purchase tokens in bulk with the Growth or Pro 
                  packages for better value!
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Recent Activity
              </h2>

              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions yet</p>
                  <p className="text-sm mt-1">
                    Purchase tokens to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {tx.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(tx.created_at)}
                          </p>
                          {tx.reference_type && (
                            <p className="text-xs text-gray-400 capitalize">
                              {tx.reference_type.replace('_', ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}{formatTokens(tx.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Balance: {formatTokens(tx.balance_after)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {transactions.length > 10 && (
                <div className="mt-4 text-center">
                  <button className="text-teal-600 font-medium hover:text-teal-700">
                    View All Transactions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/employees"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Deploy Employee</h3>
                <p className="text-sm text-gray-500">
                  Cost: {TOKEN_COSTS.deployAiEmployee.tokens} tokens
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/chat"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Chat with King Mouse</h3>
                <p className="text-sm text-gray-500">
                  Cost: {TOKEN_COSTS.messageKingMouse.tokens} tokens/message
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/vms"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View VMs</h3>
                <p className="text-sm text-gray-500">
                  {TOKEN_COSTS.vmRuntime1h.tokens} tokens/hour runtime
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
