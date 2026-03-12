'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare, BarChart3, Building2, Search,
  Phone, Settings, Menu, X, Plus, Trash2, Copy,
  Target, DollarSign, Palette
} from 'lucide-react';
import KingMouseAvatar from '@/components/KingMouseAvatar';
import type { KingMouseStatus } from '@/types/kingmouse-status';

interface Conversation {
  id: string;
  title: string;
  last_message_at: string | null;
  created_at: string;
}

interface ResellerShellProps {
  children: React.ReactNode;
}

function groupByDate(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Previous 7 Days', items: [] },
    { label: 'Older', items: [] },
  ];

  for (const c of conversations) {
    const d = new Date(c.last_message_at || c.created_at);
    if (d >= today) groups[0].items.push(c);
    else if (d >= yesterday) groups[1].items.push(c);
    else if (d >= weekAgo) groups[2].items.push(c);
    else groups[3].items.push(c);
  }

  return groups.filter((g) => g.items.length > 0);
}

const NAV_ITEMS = [
  { slug: 'dashboard', name: 'Dashboard', icon: BarChart3, route: '/reseller/dashboard' },
  { slug: 'businesses', name: 'Businesses', icon: Building2, route: '/reseller/businesses' },
  { slug: 'voice', name: 'Voice Builder', icon: Phone, route: '/reseller/voice' },
  { slug: 'lead-funnels', name: 'Lead Funnels', icon: Target, route: '/reseller/lead-funnels' },
  { slug: 'lead-finder', name: 'Find Leads', icon: Search, route: '/reseller/lead-finder' },
  { slug: 'revenue', name: 'Revenue', icon: DollarSign, route: '/reseller/revenue' },
  { slug: 'branding', name: 'Branding', icon: Palette, route: '/reseller/branding' },
  { slug: 'settings', name: 'Settings', icon: Settings, route: '/reseller/settings' },
];

export default function ResellerShell({ children }: ResellerShellProps) {
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [kmStatus, setKmStatus] = useState<KingMouseStatus>('idle');
  const [brandSlug, setBrandSlug] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const statusInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  const loadConversations = useCallback(async () => {
    if (!resellerId) return;
    try {
      const res = await fetch(`/api/conversations?customer_id=reseller_${resellerId}`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch { /* ignore */ }
  }, [resellerId]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/kingmouse/status?customer_id=reseller_${resellerId}`);
      const data = await res.json();
      if (data.status) setKmStatus(data.status as KingMouseStatus);
    } catch { /* ignore */ }
  }, [resellerId]);

  useEffect(() => {
    loadConversations();
    fetchStatus();
    statusInterval.current = setInterval(fetchStatus, 10000);

    // Load brand slug for share link
    if (resellerId) {
      fetch(`/api/admin/resellers?id=${resellerId}`)
        .then((r) => r.json())
        .then((d) => {
          const r = Array.isArray(d) ? d[0] : d;
          if (r?.brand_slug) setBrandSlug(r.brand_slug);
        })
        .catch(() => {});
    }

    return () => { if (statusInterval.current) clearInterval(statusInterval.current); };
  }, [resellerId, loadConversations, fetchStatus]);

  // Expose for child components
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__km_loadConversations = loadConversations;
    (window as unknown as Record<string, unknown>).__km_setActiveConversation = setActiveConversationId;
    (window as unknown as Record<string, unknown>).__km_activeConversationId = activeConversationId;
    (window as unknown as Record<string, unknown>).__km_setStatus = setKmStatus;
    (window as unknown as Record<string, unknown>).__km_refreshStatus = fetchStatus;
    (window as unknown as Record<string, unknown>).__km_resellerId = resellerId;
  }, [loadConversations, activeConversationId, setKmStatus, fetchStatus, resellerId]);

  const handleNewChat = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: `reseller_${resellerId}` }),
      });
      const data = await res.json();
      if (data.id) {
        setActiveConversationId(data.id);
        await loadConversations();
        setSidebarOpen(false);
        if (pathname !== '/reseller') {
          window.location.href = '/reseller';
        }
      }
    } catch { /* ignore */ }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (activeConversationId === id) setActiveConversationId(null);
      await loadConversations();
    } catch { /* ignore */ }
  };

  const groups = groupByDate(conversations);
  const isChat = pathname === '/reseller';

  return (
    <div className="h-screen flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-gray-900 text-gray-300 flex flex-col transform transition-transform md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <Link href="/reseller" className="flex items-center gap-2">
            <KingMouseAvatar status={kmStatus} size="sm" />
            <span className="text-lg font-bold text-white">KingMouse</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pb-3">
          <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded-full font-medium">
            Reseller
          </span>
        </div>

        {/* New Chat */}
        <div className="px-3 pb-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-2 mb-1">
                {group.label}
              </p>
              {group.items.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveConversationId(c.id);
                    setSidebarOpen(false);
                    if (pathname !== '/reseller') window.location.href = '/reseller';
                  }}
                  className={`group w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                    activeConversationId === c.id
                      ? 'bg-gray-700 text-white'
                      : 'hover:bg-gray-800 text-gray-400'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-50" />
                  <span className="truncate flex-1">{c.title}</span>
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              ))}
            </div>
          ))}

          {conversations.length === 0 && (
            <p className="text-xs text-gray-600 px-2 mt-4">No conversations yet. Click New Chat to start.</p>
          )}
        </div>

        {/* Share Your Link */}
        {brandSlug && (
          <div className="px-3 pb-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://mouse.is/${brandSlug}`);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-teal-900/30 text-teal-400 hover:bg-teal-900/50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{linkCopied ? 'Copied!' : `mouse.is/${brandSlug}`}</span>
            </button>
          </div>
        )}

        {/* Bottom nav */}
        <div className="border-t border-gray-800 p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.slug}
                href={item.route}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <span className="font-bold text-gray-900 flex items-center gap-2">
            <KingMouseAvatar status={kmStatus} size="sm" /> KingMouse
          </span>
          <div className="w-10" />
        </header>

        <main className={`flex-1 ${isChat ? '' : 'p-6 lg:p-8 overflow-y-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
