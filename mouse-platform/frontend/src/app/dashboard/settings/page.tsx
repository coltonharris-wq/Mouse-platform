'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0B1F3B] mb-6">Settings</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon</h2>
        <p className="text-gray-500 mb-6">KingMouse is managing this for you behind the scenes.</p>
        <Link
          href="/dashboard/chat"
          className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700"
        >
          Ask KingMouse about your settings &rarr;
        </Link>
      </div>
    </div>
  );
}
