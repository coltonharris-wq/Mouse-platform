'use client';

import Link from 'next/link';

interface ProCardProps {
  slug: string;
  name: string;
  description: string;
  category: string;
  tools: string[];
}

const EMOJI_MAP: Record<string, string> = {
  appliance: '🔧',
  roofer: '🏠',
  dentist: '🦷',
};

const CATEGORY_LABELS: Record<string, string> = {
  home_services: 'Home Services',
  trades: 'Trades',
  healthcare: 'Healthcare',
};

export default function ProCard({ slug, name, description, category, tools }: ProCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-teal-300 hover:shadow-xl transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
          {EMOJI_MAP[slug] || '🤖'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            {CATEGORY_LABELS[category] || category}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{description}</p>

      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">What it handles:</p>
        <div className="flex flex-wrap gap-1.5">
          {tools.slice(0, 5).map((tool) => (
            <span key={tool} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-100">
              {tool.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      <Link
        href={`/onboarding?pro=${slug}`}
        className="block w-full text-center bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
      >
        Hire Now
      </Link>
    </div>
  );
}
