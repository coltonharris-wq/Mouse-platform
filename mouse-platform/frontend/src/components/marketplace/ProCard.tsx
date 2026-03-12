'use client';

import Link from 'next/link';

interface ProCardProps {
  slug: string;
  name: string;
  description: string;
  category: string;
  tools: string[];
  hireUrl?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EMOJI_MAP: Record<string, string> = {
  appliance: '\u{1F527}', roofer: '\u{1F3E0}', dentist: '\u{1F9B7}',
  hvac: '\u{2744}\u{FE0F}', plumber: '\u{1F6BF}', electrician: '\u{26A1}',
  landscaper: '\u{1F333}', painter: '\u{1F3A8}', auto_repair: '\u{1F697}',
  auto_detailing: '\u{2728}', cleaning: '\u{1F9F9}', pest_control: '\u{1F41B}',
  moving: '\u{1F69A}', real_estate: '\u{1F3E2}', insurance: '\u{1F6E1}\u{FE0F}',
  accounting: '\u{1F4CA}', law_firm: '\u{2696}\u{FE0F}', chiropractic: '\u{1F9D1}\u{200D}\u{2695}\u{FE0F}',
  veterinary: '\u{1F43E}', med_spa: '\u{1F489}', fitness: '\u{1F4AA}',
  salon: '\u{1F487}', restaurant: '\u{1F37D}\u{FE0F}', catering: '\u{1F370}',
  photography: '\u{1F4F7}', construction: '\u{1F3D7}\u{FE0F}', property_mgmt: '\u{1F3E0}',
  towing: '\u{1F6FB}', flooring: '\u{1F9F1}', pool_service: '\u{1F3CA}',
};

export const CATEGORY_LABELS: Record<string, string> = {
  home_services: 'Home Services',
  trades: 'Trades',
  healthcare: 'Healthcare',
  professional: 'Professional',
  automotive: 'Automotive',
  food_service: 'Food Service',
  creative: 'Creative',
  personal_services: 'Personal Services',
  health_fitness: 'Health & Fitness',
  real_estate: 'Real Estate',
};

export default function ProCard({ slug, name, description, category, tools, hireUrl, actionLabel, onAction }: ProCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-teal-300 hover:shadow-xl transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
          {EMOJI_MAP[slug] || '\u{1F916}'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            {CATEGORY_LABELS[category] || category}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 text-sm">{description}</p>

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

      {onAction ? (
        <button
          onClick={onAction}
          className="block w-full text-center bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          {actionLabel || 'Select'}
        </button>
      ) : (
        <Link
          href={hireUrl || `/onboarding?pro=${slug}`}
          className="block w-full text-center bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          {actionLabel || 'Hire Now'}
        </Link>
      )}
    </div>
  );
}
