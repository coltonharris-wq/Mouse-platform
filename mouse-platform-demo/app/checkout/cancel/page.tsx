'use client';

import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-gray-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Checkout Cancelled</h1>
        <p className="text-gray-500 mb-8">No worries — you weren&apos;t charged. Come back anytime.</p>

        <div className="space-y-3">
          <Link
            href="/portal/plans"
            className="flex items-center justify-center gap-2 w-full py-3 bg-mouse-navy text-white rounded-xl font-semibold hover:bg-mouse-navy/90 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Plans
          </Link>

          <Link href="/portal" className="block text-gray-400 text-sm hover:text-gray-600 mt-4">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
