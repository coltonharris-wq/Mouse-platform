'use client';

import { useEffect, useState } from 'react';
import ProCard, { CATEGORY_LABELS } from './ProCard';
import { Search } from 'lucide-react';

interface ProProfile {
  slug: string;
  name: string;
  description: string;
  category: string;
  tools: string[];
}

interface ProGridProps {
  actionLabel?: string;
  onAction?: (slug: string) => void;
  hireUrl?: (slug: string) => string;
}

const CATEGORIES = [
  'all', 'home_services', 'trades', 'healthcare', 'professional',
  'automotive', 'food_service', 'creative', 'personal_services', 'health_fitness', 'real_estate'
];

export default function ProGrid({ actionLabel, onAction, hireUrl }: ProGridProps) {
  const [profiles, setProfiles] = useState<ProProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetch('/api/pro-profiles')
      .then((res) => res.json())
      .then((data) => {
        setProfiles(data.profiles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = profiles.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gray-200 rounded-xl" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            </div>
            <div className="h-12 bg-gray-100 rounded mb-4" />
            <div className="h-10 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-[#0F6B6E] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((profile) => (
          <ProCard
            key={profile.slug}
            {...profile}
            actionLabel={actionLabel}
            onAction={onAction ? () => onAction(profile.slug) : undefined}
            hireUrl={hireUrl ? hireUrl(profile.slug) : undefined}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>No Pros match your search.</p>
        </div>
      )}
    </div>
  );
}
