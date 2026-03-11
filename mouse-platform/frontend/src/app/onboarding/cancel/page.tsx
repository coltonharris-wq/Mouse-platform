'use client';

import Link from 'next/link';

export default function OnboardingCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">&#128533;</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          No worries — your information has been saved. You can come back anytime to complete your subscription.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/onboarding"
            className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
