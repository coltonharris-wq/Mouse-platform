'use client';

import ProGrid from '@/components/marketplace/ProGrid';
import Link from 'next/link';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Employee Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose an AI employee specialized for your industry. Each Pro handles operations, scheduling, and customer communication autonomously.
          </p>
        </div>

        <ProGrid />

        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">All plans start at $97/month with first 2 hours free.</p>
          <Link href="/pricing" className="text-teal-600 font-semibold hover:text-teal-700">
            View Pricing &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
