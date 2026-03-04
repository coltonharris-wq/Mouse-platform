'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, CreditCard, Calendar, CheckCircle, Clock } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  pdf_url: string;
  hosted_url: string;
  description: string;
  paid_at: string;
  created_at: string;
}

interface Payment {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState('');

  useEffect(() => {
    // Get customer ID from localStorage or context
    const cid = localStorage.getItem('customerId') || '';
    setCustomerId(cid);
    if (cid) {
      fetchBillingData(cid);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBillingData = async (cid: string) => {
    try {
      const response = await fetch(`/api/invoices?customerId=${cid}`);
      const data = await response.json();

      if (response.ok) {
        setInvoices(data.invoices || []);
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <FileText size={48} className="text-mouse-slate mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-mouse-navy">No Billing Information</h2>
          <p className="text-mouse-charcoal mt-2">Please log in to view your billing history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-mouse-navy mb-6">Billing & Invoices</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-mouse-slate">Total Payments</p>
              <p className="text-xl font-bold text-mouse-navy">{payments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-mouse-slate">Invoices</p>
              <p className="text-xl font-bold text-mouse-navy">{invoices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mouse-teal/10 rounded-full flex items-center justify-center">
              <CreditCard size={20} className="text-mouse-teal" />
            </div>
            <div>
              <p className="text-sm text-mouse-slate">Status</p>
              <p className="text-xl font-bold text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-mouse-navy">Payment History</h2>
        </div>
        
        {payments.length === 0 ? (
          <div className="px-6 py-8 text-center text-mouse-slate">
            <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
            <p>No payments found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-mouse-navy capitalize">{payment.plan} Plan</p>
                    <p className="text-sm text-mouse-slate">{formatDate(payment.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-mouse-navy">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle size={12} />
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-mouse-navy">Invoices</h2>
        </div>
        
        {invoices.length === 0 ? (
          <div className="px-6 py-8 text-center text-mouse-slate">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>No invoices found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-mouse-navy">
                      Invoice #{invoice.invoice_number || invoice.id.slice(0, 8)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-mouse-slate">
                      <Calendar size={12} />
                      {formatDate(invoice.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-mouse-navy">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs ${
                      invoice.status === 'paid' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {invoice.status === 'paid' ? (
                        <CheckCircle size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {invoice.pdf_url && (
                    <a
                      href={invoice.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-mouse-teal hover:bg-mouse-teal/10 rounded transition-colors"
                      title="Download Invoice"
                    >
                      <Download size={20} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing Support */}
      <div className="mt-8 p-6 bg-mouse-offwhite rounded-lg">
        <h3 className="font-semibold text-mouse-navy mb-2">Need Help?</h3>
        <p className="text-sm text-mouse-charcoal mb-4">
          If you have questions about your billing or need to update your payment method, contact our support team.
        </p>
        <div className="flex gap-4">
          <a
            href="mailto:support@mouseplatform.com"
            className="text-sm text-mouse-teal hover:underline"
          >
            Contact Support
          </a>
          <span className="text-mouse-slate">|</span>
          <a
            href="/pricing"
            className="text-sm text-mouse-teal hover:underline"
          >
            View Plans
          </a>
        </div>
      </div>
    </div>
  );
}
