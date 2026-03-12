'use client';

import { useState, useEffect } from 'react';
import NicheGrid from './NicheGrid';

interface NicheItem {
  niche: string;
  display_name: string;
}

interface IndustryGroup {
  industry: string;
  industry_display: string;
  icon: string | null;
  niches: NicheItem[];
}

export default function IndustrySelector() {
  const [industries, setIndustries] = useState<IndustryGroup[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pro-profiles')
      .then((r) => r.json())
      .then((data) => {
        setIndustries(data.industries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#0F6B6E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (industries.length === 0) {
    return null;
  }

  const selectedIndustry = industries.find((i) => i.industry === selected);

  return (
    <div>
      {/* Industry Toggle Grid */}
      <div className="flex flex-wrap justify-center gap-3">
        {industries.map((ind) => {
          const isActive = selected === ind.industry;
          return (
            <button
              key={ind.industry}
              onClick={() => setSelected(isActive ? null : ind.industry)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#0F6B6E] text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#0F6B6E] hover:text-[#0F6B6E]'
              }`}
            >
              {ind.icon && <span className="text-lg">{ind.icon}</span>}
              <span>{ind.industry_display}</span>
            </button>
          );
        })}
      </div>

      {/* Niche Sub-options */}
      {selectedIndustry && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <NicheGrid
            industry={selectedIndustry.industry}
            niches={selectedIndustry.niches}
          />
        </div>
      )}
    </div>
  );
}
