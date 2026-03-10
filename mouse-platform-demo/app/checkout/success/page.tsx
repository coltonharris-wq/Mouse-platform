'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('');
  const [hours, setHours] = useState(0);
  const [customerId, setCustomerId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      // Fetch session details to get customerId, then redirect to deploying page
      fetch(`/api/stripe/session?sessionId=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          setPlan(data.plan || 'pro');
          setHours(data.workHours || 0);
          setCustomerId(data.customerId || '');

          // Redirect to deploying page to provision King Mouse
          setTimeout(() => {
            window.location.href = `/deploying?customerId=${data.customerId || ''}`;
          }, 2000);
        })
        .catch(() => {
          // Even if session fetch fails, try to redirect to deploying
          // The customerId might be in the URL or localStorage
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {loading ? (
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto" />
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              You&apos;re all set! 🎉
            </h1>

            <p className="text-gray-600 text-lg mb-2">
              Your payment was successful.
            </p>

            {hours > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold mb-6">
                <Clock size={18} />
                {hours} work hours credited to your account
              </div>
            )}

            {plan && (
              <p className="text-gray-500 mb-8">
                Plan: <span className="font-semibold capitalize">{plan}</span>
              </p>
            )}

            <div className="space-y-3">
              <Link
                href={customerId ? `/deploying?customerId=${customerId}` : '/deploying'}
                className="flex items-center justify-center gap-2 w-full py-3 bg-mouse-teal text-white rounded-xl font-semibold hover:bg-mouse-teal/90 transition-colors"
              >
                Deploy King Mouse <ArrowRight size={18} />
              </Link>

              <Link
                href="/login"
                className="block text-gray-400 text-sm hover:text-gray-600 mt-4"
              >
                Go to Login →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
