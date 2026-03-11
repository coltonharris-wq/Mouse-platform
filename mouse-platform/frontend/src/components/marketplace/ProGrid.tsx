'use client';

import { useEffect, useState } from 'react';
import ProCard from './ProCard';

interface ProProfile {
  slug: string;
  name: string;
  description: string;
  category: string;
  tools: string[];
}

export default function ProGrid() {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <ProCard key={profile.slug} {...profile} />
      ))}
    </div>
  );
}
