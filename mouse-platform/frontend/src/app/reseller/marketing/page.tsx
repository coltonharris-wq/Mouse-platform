'use client';

import { Share2, Copy, Download, FileText } from 'lucide-react';

export default function MarketingPage() {
  const resources = [
    { name: 'Product Brochure', type: 'PDF', size: '2.4 MB' },
    { name: 'Sales Deck', type: 'PPTX', size: '5.1 MB' },
    { name: 'Email Templates', type: 'ZIP', size: '1.2 MB' },
    { name: 'Brand Guidelines', type: 'PDF', size: '3.8 MB' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Marketing Resources</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-6 h-6 text-mouse-teal" />
            <h3 className="text-lg font-semibold text-white">Your Referral Link</h3>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value="https://app.mouseplatform.com/?ref=RESELLER123"
              readOnly
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-300"
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white rounded-lg hover:bg-mouse-teal-dark transition-colors">
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <p className="text-sm text-gray-500">Share this link to earn 20% commission on all referred sales.</p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-accent-purple" />
            <h3 className="text-lg font-semibold text-white">Marketing Materials</h3>
          </div>
          <div className="space-y-3">
            {resources.map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-white font-medium">{resource.name}</p>
                    <p className="text-sm text-gray-500">{resource.type} • {resource.size}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-dark-bg-tertiary rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
