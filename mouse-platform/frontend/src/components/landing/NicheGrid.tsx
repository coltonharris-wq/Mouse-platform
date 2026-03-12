'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface NicheItem {
  niche: string;
  display_name: string;
}

interface NicheGridProps {
  industry: string;
  niches: NicheItem[];
}

export default function NicheGrid({ industry, niches }: NicheGridProps) {
  if (niches.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {niches.map((n) => (
        <Link
          key={n.niche}
          href={`/chat/${encodeURIComponent(industry)}/${encodeURIComponent(n.niche)}`}
          className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-white border-2 border-teal-100 text-sm font-medium text-gray-700 hover:border-[#0F6B6E] hover:text-[#0F6B6E] transition-all hover:shadow-md"
        >
          <span>{n.display_name}</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  );
}
