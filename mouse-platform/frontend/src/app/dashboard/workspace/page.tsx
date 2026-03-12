'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail, Calendar, FileText, MessageSquare, Phone,
  ExternalLink, Plug
} from 'lucide-react';

interface WorkspaceApp {
  slug: string;
  name: string;
  icon: string;
  category: string;
  connected: boolean;
  url: string | null;
  comingSoon: boolean;
}

const DEFAULT_APPS: WorkspaceApp[] = [
  // Communication
  { slug: 'gmail', name: 'Gmail', icon: '\u{1F4E7}', category: 'Communication', connected: false, url: 'https://mail.google.com', comingSoon: false },
  { slug: 'outlook', name: 'Outlook', icon: '\u{1F4E8}', category: 'Communication', connected: false, url: 'https://outlook.live.com', comingSoon: true },
  { slug: 'slack', name: 'Slack', icon: '\u{1F4AC}', category: 'Communication', connected: false, url: null, comingSoon: true },

  // Social Media
  { slug: 'instagram', name: 'Instagram', icon: '\u{1F4F8}', category: 'Social Media', connected: false, url: 'https://instagram.com', comingSoon: true },
  { slug: 'facebook', name: 'Facebook', icon: '\u{1F4D8}', category: 'Social Media', connected: false, url: 'https://business.facebook.com', comingSoon: true },
  { slug: 'twitter', name: 'Twitter / X', icon: '\u{1F426}', category: 'Social Media', connected: false, url: 'https://x.com', comingSoon: true },
  { slug: 'linkedin', name: 'LinkedIn', icon: '\u{1F4BC}', category: 'Social Media', connected: false, url: 'https://linkedin.com', comingSoon: true },
  { slug: 'tiktok', name: 'TikTok', icon: '\u{1F3B5}', category: 'Social Media', connected: false, url: 'https://tiktok.com', comingSoon: true },
  { slug: 'google-business', name: 'Google Business', icon: '\u{1F4CD}', category: 'Social Media', connected: false, url: 'https://business.google.com', comingSoon: true },

  // Business Tools
  { slug: 'google-calendar', name: 'Google Calendar', icon: '\u{1F4C5}', category: 'Business Tools', connected: false, url: 'https://calendar.google.com', comingSoon: false },
  { slug: 'quickbooks', name: 'QuickBooks', icon: '\u{1F4CA}', category: 'Business Tools', connected: false, url: 'https://app.qbo.intuit.com', comingSoon: true },
  { slug: 'square', name: 'Square POS', icon: '\u{1F4B3}', category: 'Business Tools', connected: false, url: 'https://squareup.com/dashboard', comingSoon: true },
  { slug: 'stripe', name: 'Stripe', icon: '\u{1F4B0}', category: 'Business Tools', connected: false, url: 'https://dashboard.stripe.com', comingSoon: true },
  { slug: 'google-sheets', name: 'Google Sheets', icon: '\u{1F4CB}', category: 'Business Tools', connected: false, url: 'https://sheets.google.com', comingSoon: true },
  { slug: 'google-drive', name: 'Google Drive', icon: '\u{1F4C1}', category: 'Business Tools', connected: false, url: 'https://drive.google.com', comingSoon: true },

  // Your Files
  { slug: 'documents', name: 'Documents', icon: '\u{1F4C4}', category: 'Your Files', connected: true, url: null, comingSoon: false },
  { slug: 'reports', name: 'Reports', icon: '\u{1F4CA}', category: 'Your Files', connected: true, url: null, comingSoon: false },
  { slug: 'templates', name: 'Templates', icon: '\u{1F4DD}', category: 'Your Files', connected: true, url: null, comingSoon: false },
];

export default function WorkspacePage() {
  const [apps] = useState<WorkspaceApp[]>(DEFAULT_APPS);

  const categories = Array.from(new Set(apps.map((a) => a.category)));
  const grouped = categories.map((cat) => ({
    category: cat,
    items: apps.filter((a) => a.category === cat),
  }));

  const categoryIcons: Record<string, typeof Mail> = {
    'Communication': Mail,
    'Social Media': MessageSquare,
    'Business Tools': Calendar,
    'Your Files': FileText,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#0B1F3B]">Your Workspace</h1>
        <p className="text-xl text-gray-500 mt-2">Everything you need, in one place</p>
      </div>

      <div className="space-y-10">
        {grouped.map((group) => {
          const CatIcon = categoryIcons[group.category] || FileText;
          return (
            <div key={group.category}>
              <div className="flex items-center gap-2 mb-4">
                <CatIcon className="w-6 h-6 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800">{group.category}</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {group.items.map((app) => (
                  <AppTile key={app.slug} app={app} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AppTile({ app }: { app: WorkspaceApp }) {
  if (app.comingSoon) {
    return (
      <div className="bg-gray-50 rounded-xl border-2 border-gray-100 p-5 text-center opacity-60">
        <div className="text-3xl mb-2">{app.icon}</div>
        <h3 className="text-lg font-semibold text-gray-700">{app.name}</h3>
        <p className="text-base text-gray-400 mt-1">Coming Soon</p>
      </div>
    );
  }

  if (!app.connected && app.category !== 'Your Files') {
    return (
      <Link
        href="/dashboard/connections"
        className="bg-white rounded-xl border-2 border-gray-200 p-5 text-center hover:border-[#0F6B6E] hover:shadow-md transition-all group"
      >
        <div className="text-3xl mb-2">{app.icon}</div>
        <h3 className="text-lg font-semibold text-gray-700 group-hover:text-[#0F6B6E]">{app.name}</h3>
        <span className="inline-flex items-center gap-1 text-base text-gray-400 mt-2 group-hover:text-[#0F6B6E]">
          <Plug className="w-4 h-4" />
          Connect
        </span>
      </Link>
    );
  }

  // Connected or "Your Files" category
  const Wrapper = app.url ? 'a' : 'div';
  const linkProps = app.url
    ? { href: app.url, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="bg-white rounded-xl border-2 border-green-200 p-5 text-center hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="text-3xl mb-2">{app.icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
      {app.url ? (
        <span className="inline-flex items-center gap-1 text-base text-green-600 mt-2">
          <ExternalLink className="w-4 h-4" />
          Open
        </span>
      ) : (
        <span className="text-base text-green-600 mt-2 block">Available</span>
      )}
    </Wrapper>
  );
}
