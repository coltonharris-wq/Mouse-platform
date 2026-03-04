'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, Mail, ArrowRight, Download, Bot, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface PaymentDetails {
  plan: string;
  amount: number;
  customerEmail: string;
  invoiceUrl?: string;
  customerId?: string;
}

interface KingMouseDetails {
  id: string;
  botLink: string;
  botUsername: string;
  status: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [kingMouse, setKingMouse] = useState<KingMouseDetails | null>(null);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetchPaymentDetails();
    } else {
      setLoading(false);
      setError('No session ID found');
    }
  }, [sessionId]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/stripe/session?session_id=${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        setPaymentDetails(data);
        // Fetch King Mouse details if customer ID is available
        if (data.customerId) {
          fetchKingMouseDetails(data.customerId);
        }
      } else {
        setError(data.error || 'Failed to fetch payment details');
      }
    } catch (err) {
      setError('Failed to fetch payment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchKingMouseDetails = async (customerId: string) => {
    try {
      const response = await fetch(`/api/king-mouse/status?customerId=${customerId}`);
      const data = await response.json();

      if (response.ok && data.kingMouse) {
        setKingMouse({
          id: data.kingMouse.id,
          botLink: data.kingMouse.botLink,
          botUsername: data.kingMouse.botUsername || 'MouseKingBot',
          status: data.kingMouse.status,
        });
      }
    } catch (err) {
      console.error('Failed to fetch King Mouse details:', err);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-mouse-teal mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-mouse-navy">Processing your payment...</h2>
          <p className="text-mouse-charcoal mt-2">Please wait while we activate your account.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-mouse-navy">Something went wrong</h1>
          <p className="mt-2 text-mouse-charcoal">{error}</p>
          <Link
            href="/pricing"
            className="mt-6 inline-block bg-orange-500 text-white px-6 py-3 rounded hover:bg-teal-700 transition-colors"
          >
            Return to Pricing
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-mouse-offwhite py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-mouse-navy mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-mouse-charcoal text-lg mb-6">
            Thank you for your purchase. Your account has been activated and you can now start using Mouse Platform.
          </p>

          {paymentDetails && (
            <div className="bg-mouse-offwhite rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-mouse-navy mb-4">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mouse-slate">Plan:</span>
                  <span className="font-medium text-mouse-navy capitalize">{paymentDetails.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mouse-slate">Amount:</span>
                  <span className="font-medium text-mouse-navy">
                    ${(paymentDetails.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mouse-slate">Email:</span>
                  <span className="font-medium text-mouse-navy">{paymentDetails.customerEmail}</span>
                </div>
              </div>
            </div>
          )}

          {/* King Mouse Bot Card */}
          {kingMouse && (
            <div className="bg-gradient-to-br from-mouse-navy to-mouse-navy/90 rounded-lg p-6 mb-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-mouse-teal" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Your King Mouse is Ready!</h3>
                  <p className="text-mouse-slate text-sm">Your personal AI orchestrator</p>
                </div>
              </div>
              
              <p className="text-mouse-slate text-sm mb-4">
                Start chatting with your King Mouse on Telegram to deploy AI employees and manage your workforce.
              </p>
              
              <a
                href={kingMouse.botLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors"
              >
                <MessageSquare size={18} />
                Open @{kingMouse.botUsername}
              </a>
              
              <p className="text-center text-mouse-slate/60 text-xs mt-3">
                Status: <span className="capitalize">{kingMouse.status}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-mouse-charcoal">
              <Mail size={18} />
              <span>Check your email for login credentials</span>
            </div>

            {paymentDetails?.invoiceUrl && (
              <a
                href={paymentDetails.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-mouse-teal hover:underline"
              >
                <Download size={18} />
                Download Invoice
              </a>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded hover:bg-teal-700 transition-colors"
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/onboard"
                className="inline-flex items-center justify-center gap-2 border-2 border-mouse-teal text-mouse-teal px-6 py-3 rounded hover:bg-mouse-teal hover:text-white transition-colors"
              >
                Setup Your AI Employee
              </Link>
            </div>
          </div>

          <div className="mt-6 text-sm text-mouse-slate">
            <p>Questions? Contact us at{' '}
              <a href="mailto:support@mouseplatform.com" className="text-mouse-teal hover:underline">
                support@mouseplatform.com
              </a>
            </p>
          </div>
        </div>

        {/* Next steps */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="w-10 h-10 bg-mouse-teal/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-mouse-teal font-bold">1</span>
            </div>
            <h4 className="font-medium text-mouse-navy">Check Email</h4>
            <p className="text-xs text-mouse-slate mt-1">Login credentials sent</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="w-10 h-10 bg-mouse-teal/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-mouse-teal font-bold">2</span>
            </div>
            <h4 className="font-medium text-mouse-navy">Onboard</h4>
            <p className="text-xs text-mouse-slate mt-1">Setup your AI Employee</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="w-10 h-10 bg-mouse-teal/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-mouse-teal font-bold">3</span>
            </div>
            <h4 className="font-medium text-mouse-navy">Start Working</h4>
            <p className="text-xs text-mouse-slate mt-1">Deploy your AI workforce</p>
          </div>
        </div>
      </div>
    </main>
  );
}

import { useState, useEffect } from 'react';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Suspense fallback={
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-mouse-teal mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-mouse-navy">Loading...</h2>
          </div>
        </main>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
