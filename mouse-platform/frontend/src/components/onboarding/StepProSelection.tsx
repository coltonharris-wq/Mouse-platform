'use client';

import { useEffect, useState } from 'react';

interface ProProfile {
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  category: string;
  tools: string[];
  dashboard_modules: string[];
}

interface StepProSelectionProps {
  selectedSlug: string;
  onChange: (slug: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepProSelection({ selectedSlug, onChange, onNext, onBack }: StepProSelectionProps) {
  const [profiles, setProfiles] = useState<ProProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pro-profiles')
      .then((res) => res.json())
      .then((data) => {
        setProfiles(data.profiles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your AI Employee</h2>
      <p className="text-gray-600 mb-8">Each Pro is specialized for your industry.</p>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <button
            key={profile.slug}
            onClick={() => onChange(profile.slug)}
            className={`text-left p-6 rounded-xl border-2 transition-all ${
              selectedSlug === profile.slug
                ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                {profile.slug === 'appliance' ? '🔧' : profile.slug === 'roofer' ? '🏠' : '🦷'}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
                <p className="text-gray-600 mt-1">{profile.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.tools.slice(0, 4).map((tool) => (
                    <span
                      key={tool}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {tool.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
              {selectedSlug === profile.slug && (
                <span className="text-teal-600 text-xl font-bold">&#10003;</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedSlug}
          className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
