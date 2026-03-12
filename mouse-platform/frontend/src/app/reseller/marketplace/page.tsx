'use client';

import ProGrid from '@/components/marketplace/ProGrid';

export default function ResellerMarketplacePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-500 mt-1">Browse 30 AI employee verticals to offer your clients.</p>
      </div>
      <ProGrid actionLabel="Add to My Offerings" onAction={(slug) => {
        window.location.href = `/reseller/businesses?pro=${slug}`;
      }} />
    </div>
  );
}
