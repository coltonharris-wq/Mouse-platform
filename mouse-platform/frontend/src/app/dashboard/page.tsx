'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingCart, 
  AlertCircle,
  MessageSquare,
  Bot,
  History,
  Plus,
  Sparkles,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';
import { formatWorkHours, isLowBalance, WORK_HOURS_COSTS } from '@/lib/stripe';

interface WorkHoursTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number;
  balance_after: number;
  description: string;
  reference_type?: string;
  created_at: string;
}

interface WorkHoursBalance {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  last_updated: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId') || 'demo-customer';
  
  const [balance, setBalance] = useState<WorkHoursBalance | null>(null);
  const [transactions, setTransactions] = useState<WorkHoursTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkHoursData();
  }, [customerId]);

  const fetchWorkHoursData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch(`/api/tokens/balance?customerId=${customerId}`),
        fetch(`/api/v1/customers/${customerId}/tokens/transactions`)
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        // Convert token balance to hours (assuming 100 tokens = 1 hour)
        setBalance({
          ...balanceData,
          balance: Math.floor((balanceData.balance || 0) / 100),
          lifetime_earned: Math.floor((balanceData.lifetime_earned || 0) / 100),
          lifetime_spent: Math.floor((balanceData.lifetime_spent || 0) / 100),
        });
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        // Convert transaction amounts to hours
        const convertedTransactions = (transactionsData.transactions || []).map((tx: any) => ({
          ...tx,
          amount: Math.floor((tx.amount || 0) / 100),
          balance_after: Math.floor((tx.balance_after || 0) / 100),
        }));
        setTransactions(convertedTransactions);
      }
    } catch (error) {
      console.error('Error fetching work hours data:', error);
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
        return <ArrowUpRight className="w-5 h-5 text-green-400" />;
      case 'usage':
        return <ArrowDownRight className="w-5 h-5 text-rose-400" />;
      case 'bonus':
        return <Plus className="w-5 h-5 text-accent-cyan" />;
      default:
        return <History className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  const currentBalance = balance?.balance || 0;
  const lowBalance = isLowBalance(currentBalance);
  const estimatedTasks = Math.floor(currentBalance / 0.1);

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-mouse-teal/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-mouse-teal" />
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          </div>
          <p className="text-gray-400">
            Manage your AI employees and AI Work Hours balance
          </p>
        </div>

        {/* Work Hours Balance Card */}
        <div className={`relative overflow-hidden rounded-2xl p-8 mb-8 ${
          lowBalance 
            ? 'bg-gradient-to-br from-rose-500/20 via-dark-surface to-dark-surface border-2 border-rose-500/50' 
            : 'bg-gradient-to-br from-mouse-teal/20 via-dark-surface to-dark-surface border-2 border-mouse-teal/30'
        }`}>
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-shine bg-[length:200%_100%] animate-shimmer opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${lowBalance ? 'bg-rose-500/20' : 'bg-mouse-teal/20'}`}>
                <Clock className={`w-10 h-10 ${lowBalance ? 'text-rose-400' : 'text-mouse-teal'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  AI Work Hours Balance
                </p>
                <p className={`text-5xl font-bold ${lowBalance ? 'text-rose-400' : 'gradient-text'}`}>
                  {formatWorkHours(currentBalance)}
                </p>
                {lowBalance && (
                  <div className="flex items-center gap-2 mt-2 text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Low balance - Purchase more AI Work Hours
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center px-4 py-2 bg-dark-bg-tertiary/50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Est. Tasks</p>
                <p className="text-2xl font-bold text-white">~{estimatedTasks}</p>
              </div>
              <div className="w-px h-16 bg-dark-border"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lifetime Earned</p>
                <p className="text-xl font-semibold text-green-400">
                  {formatWorkHours(balance?.lifetime_earned || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lifetime Spent</p>
                <p className="text-xl font-semibold text-rose-400">
                  {formatWorkHours(balance?.lifetime_spent || 0)}
                </p>
              </div>
            </div>

            <Link
              href="/pricing"
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5 ${
                lowBalance
                  ? 'bg-rose-500 text-white hover:bg-rose-400 shadow-lg shadow-rose-500/25'
                  : 'btn-primary'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Buy AI Work Hours
            </Link>
          </div>

          {/* Progress bar */}
          <div className="relative mt-6">
            <div className="h-2 bg-dark-bg-tertiary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  lowBalance ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-mouse-teal to-accent-cyan'
                }`}
                style={{ width: `${Math.min((currentBalance / 165) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0</span>
              <span>82h</span>
              <span>165h+</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Active AI Employees</p>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
              <div className="p-3 bg-accent-purple/20 rounded-xl">
                <Bot className="w-6 h-6 text-accent-purple" />
              </div>
            </div>
            <Link href="/employees" className="mt-4 inline-flex items-center gap-2 text-mouse-teal hover:text-mouse-teal-light text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Deploy New Employee
            </Link>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Messages Sent</p>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
              <div className="p-3 bg-mouse-teal/20 rounded-xl">
                <MessageSquare className="w-6 h-6 text-mouse-teal" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              To King Mouse this month
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">VM Runtime</p>
                <p className="text-3xl font-bold text-white">0h</p>
              </div>
              <div className="p-3 bg-accent-cyan/20 rounded-xl">
                <Clock className="w-6 h-6 text-accent-cyan" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Total hours used this month
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Work Hours Costs */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-mouse-teal" />
                <h2 className="section-title mb-0">AI Work Hours Costs</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-dark-bg-tertiary/50 rounded-xl hover:bg-dark-bg-tertiary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-mouse-teal/10 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-mouse-teal" />
                    </div>
                    <span className="text-gray-300">Message King Mouse</span>
                  </div>
                  <span className="font-semibold text-white bg-dark-bg px-3 py-1 rounded-full text-sm">
                    {WORK_HOURS_COSTS.messageKingMouse.hours} hours
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-bg-tertiary/50 rounded-xl hover:bg-dark-bg-tertiary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-purple/10 rounded-lg">
                      <Bot className="w-5 h-5 text-accent-purple" />
                    </div>
                    <span className="text-gray-300">Deploy AI Employee</span>
                  </div>
                  <span className="font-semibold text-white bg-dark-bg px-3 py-1 rounded-full text-sm">
                    {WORK_HOURS_COSTS.deployAiEmployee.hours} hour
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-bg-tertiary/50 rounded-xl hover:bg-dark-bg-tertiary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-cyan/10 rounded-lg">
                      <Clock className="w-5 h-5 text-accent-cyan" />
                    </div>
                    <span className="text-gray-300">VM Runtime (1 hour)</span>
                  </div>
                  <span className="font-semibold text-white bg-dark-bg px-3 py-1 rounded-full text-sm">
                    {WORK_HOURS_COSTS.vmRuntime1h.hours} hour
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-bg-tertiary/50 rounded-xl hover:bg-dark-bg-tertiary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-gray-300">Process Email</span>
                  </div>
                  <span className="font-semibold text-white bg-dark-bg px-3 py-1 rounded-full text-sm">
                    {WORK_HOURS_COSTS.processEmail.hours} hours
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-bg-tertiary/50 rounded-xl hover:bg-dark-bg-tertiary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-amber/10 rounded-lg">
                      <ArrowUpRight className="w-5 h-5 text-accent-amber" />
                    </div>
                    <span className="text-gray-300">API Call</span>
                  </div>
                  <span className="font-semibold text-white bg-dark-bg px-3 py-1 rounded-full text-sm">
                    {WORK_HOURS_COSTS.apiCall.hours} hours
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-mouse-teal/10 border border-mouse-teal/20 rounded-xl">
                <p className="text-sm text-mouse-teal">
                  <strong>💡 Tip:</strong> Purchase AI Work Hours in bulk with the Growth or Pro packages for better value!
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-mouse-teal" />
                  <h2 className="section-title mb-0">Recent Activity</h2>
                </div>
                <button className="text-sm text-mouse-teal hover:text-mouse-teal-light transition-colors">
                  View All
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-dark-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-10 h-10 text-gray-600" />
                  </div>
                  <p className="text-gray-400 mb-2">No transactions yet</p>
                  <p className="text-sm text-gray-500">
                    Purchase AI Work Hours to get started
                  </p>
                  <Link 
                    href="/pricing" 
                    className="inline-flex items-center gap-2 mt-4 btn-primary text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buy AI Work Hours
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-dark-bg-tertiary/30 rounded-xl hover:bg-dark-bg-tertiary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-dark-surface rounded-xl">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {tx.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(tx.created_at)}
                          </p>
                          {tx.reference_type && (
                            <p className="text-xs text-gray-600 capitalize">
                              {tx.reference_type.replace('_', ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-lg ${
                          tx.amount > 0 ? 'text-green-400' : 'text-rose-400'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}{formatWorkHours(tx.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Bal: {formatWorkHours(tx.balance_after)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {transactions.length > 10 && (
                <div className="mt-4 text-center">
                  <button className="text-mouse-teal font-medium hover:text-mouse-teal-light transition-colors">
                    View All Transactions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="section-title mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/employees"
              className="group glass-card glass-card-hover p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-accent-purple/10 rounded-xl group-hover:bg-accent-purple/20 transition-colors">
                  <Bot className="w-7 h-7 text-accent-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Deploy Employee</h3>
                  <p className="text-sm text-gray-400">
                    Cost: {WORK_HOURS_COSTS.deployAiEmployee.hours} hour
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/chat"
              className="group glass-card glass-card-hover p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-mouse-teal/10 rounded-xl group-hover:bg-mouse-teal/20 transition-colors">
                  <MessageSquare className="w-7 h-7 text-mouse-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Chat with King Mouse</h3>
                  <p className="text-sm text-gray-400">
                    Cost: {WORK_HOURS_COSTS.messageKingMouse.hours} hours/message
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/vms"
              className="group glass-card glass-card-hover p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-accent-cyan/10 rounded-xl group-hover:bg-accent-cyan/20 transition-colors">
                  <Clock className="w-7 h-7 text-accent-cyan" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">View VMs</h3>
                  <p className="text-sm text-gray-400">
                    {WORK_HOURS_COSTS.vmRuntime1h.hours} hour/hour runtime
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
