'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard, Calendar, Clock, CheckCircle, ArrowUpRight,
  Download, FileText, Loader2, XCircle, Shield, Zap,
} from 'lucide-react';
import Link from 'next/link';

interface BillingInfo {
  plan: string;
  status: string;
  balance: number;
  purchased: number;
  stripeCustomerId?: string;
  nextBillingDate?: string;
}

interface Payment {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  metadata?: Record<string, any>;
}

const PLAN_DETAILS: Record<string, { name: string; price: number; hours: number }> = {
  pro: { name: 'Pro', price: 97, hours: 20 },
  growth: { name: 'Growth', price: 497, hours: 125 },
  enterprise: { name: 'Enterprise', price: 997, hours: 300 },
  free: { name: 'Free', price: 0, hours: 0 },
};

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  const getSession = () => {
    try {
      const s = localStorage.getItem('mouse_session');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    const session = getSession();
    const customerId = session.customerId || session.userId;
    if (!customerId) { setLoading(false); return; }

    try {
      // Fetch customer info
      const [customerRes, paymentsRes] = await Promise.all([
        fetch(`/api/usage-events?customerId=${customerId}`),
        fetch(`/api/billing?customerId=${customerId}`).catch(() => null),
      ]);

      if (customerRes.ok) {
        const data = await customerRes.json();
        setBilling({
          plan: session.plan || 'free',
          status: session.paymentStatus || 'active',
          balance: data.balance || 0,
          purchased: data.totalPurchased || 0,
        });
      }

      if (paymentsRes?.ok) {
        const pData = await paymentsRes.json();
        setPayments(pData.payments || []);
      }
    } catch (err) {
      console.error('Billing fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-mouse-teal" />
      </div>
    );
  }

  const plan = PLAN_DETAILS[billing?.plan || 'free'] || PLAN_DETAILS.free;
  const isActive = billing?.status === 'active' && plan.price > 0;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-mouse-navy mb-6">Billing</h1>

      {/* Current Plan Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-mouse-navy to-mouse-teal p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Current Plan</p>
              <h2 className="text-3xl font-bold mt-1">{plan.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">${plan.price}</p>
              <p className="text-white/80 text-sm">/month</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock size={20} className="text-mouse-teal" />
              <div>
                <p className="text-xs text-gray-500">Hours Included</p>
                <p className="font-bold text-gray-900">{plan.hours}/month</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CreditCard size={20} className="text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className={`font-bold ${isActive ? 'text-green-500' : 'text-gray-400'}`}>
                  {isActive ? 'Active' : plan.price === 0 ? 'Free Tier' : 'Inactive'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar size={20} className="text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Current Balance</p>
                <p className="font-bold text-gray-900">{billing?.balance?.toFixed(1) || '0'} hrs</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/portal/plans"
              className="flex items-center gap-2 px-6 py-2.5 bg-mouse-teal text-white rounded-lg font-medium text-sm hover:bg-mouse-teal/90 transition-colors"
            >
              <ArrowUpRight size={16} />
              {plan.price === 0 ? 'Choose a Plan' : 'Upgrade Plan'}
            </Link>

            <Link
              href="/portal/work-hours"
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:border-mouse-teal hover:text-mouse-teal transition-colors"
            >
              <Zap size={16} />
              Buy More Hours
            </Link>

            {isActive && (
              <button
                onClick={() => setCanceling(true)}
                className="flex items-center gap-2 px-6 py-2.5 border border-red-200 text-red-500 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors ml-auto"
              >
                <XCircle size={16} />
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation */}
      {canceling && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-red-800 mb-2">Are you sure?</h3>
          <p className="text-red-600 text-sm mb-4">
            Canceling will stop all AI employees at the end of your billing period. Your remaining hours will be forfeited.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setCanceling(false)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium"
            >
              Keep My Plan
            </button>
            <button
              onClick={async () => {
                // TODO: Call Stripe cancellation API
                alert('Contact support at (877) 934-0395 to cancel.');
                setCanceling(false);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          <Shield size={16} className="text-gray-300" />
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No payments yet</p>
            <Link href="/portal/plans" className="text-mouse-teal text-sm hover:underline mt-2 inline-block">
              View plans →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 capitalize">{p.plan}</td>
                    <td className="px-6 py-4 text-gray-800">${(p.amount / 100).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.status === 'completed' ? <CheckCircle size={12} /> : null}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-mouse-teal text-xs hover:underline flex items-center gap-1">
                        <Download size={12} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
