'use client';

import { Target, Phone } from 'lucide-react';
import Link from 'next/link';

export default function LeadFunnelsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead Generation Funnels</h1>
        <p className="text-gray-500 text-sm mt-1">Build lead gen funnels for your customers</p>
      </div>

      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-purple-600" />
        </div>
        <span className="inline-block text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full mb-4">
          Coming in Phase 3
        </span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Lead Funnel Builder</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Create landing pages, ad copy, and automated follow-up sequences for your customers.
          Pick an industry template, analyze a website, and launch a funnel in minutes.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          This feature is being built. Voice Agent Builder is live now.
        </p>
        <Link
          href="/reseller/voice"
          className="inline-flex items-center gap-2 bg-[#0F6B6E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0B5456] transition-colors"
        >
          <Phone className="w-4 h-4" />
          Go to Voice Builder
        </Link>
      </div>
    </div>
  );
}
