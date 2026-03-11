'use client';

import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function JobsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Jobs</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon</h2>
        <p className="text-gray-500 mb-6">KingMouse is managing this for you behind the scenes.</p>
        <Link
          href="/dashboard/chat"
          className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700"
        >
          Ask KingMouse about your jobs &rarr;
        </Link>
      </div>
    </div>
  );
}
