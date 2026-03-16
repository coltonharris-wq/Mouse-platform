'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plug, Check, X, Mail, Phone, Calendar, MessageSquare, FileText, Cloud, Camera, ShoppingBag, Briefcase, Loader2, ExternalLink } from 'lucide-react';

interface ConnectionDef {
  key: string;
  name: string;
  description: string;
  icon: typeof Mail;
  comingSoon: boolean;
  category: string;
}

const CONNECTIONS: ConnectionDef[] = [
  { key: 'gmail', name: 'Gmail', description: 'Read and send emails', icon: Mail, comingSoon: false, category: 'Communication' },
  { key: 'outlook', name: 'Outlook', description: 'Microsoft email integration', icon: Mail, comingSoon: true, category: 'Communication' },
  { key: 'facebook', name: 'Facebook', description: 'Manage posts and messages', icon: MessageSquare, comingSoon: true, category: 'Social Media' },
  { key: 'instagram', name: 'Instagram', description: 'Post and respond to DMs', icon: Camera, comingSoon: true, category: 'Social Media' },
  { key: 'google_calendar', name: 'Google Calendar', description: 'Schedule and manage events', icon: Calendar, comingSoon: false, category: 'Productivity' },
  { key: 'google_drive', name: 'Google Drive', description: 'Store and access files', icon: Cloud, comingSoon: true, category: 'Productivity' },
  { key: 'square_pos', name: 'Square POS', description: 'Point of sale integration', icon: ShoppingBag, comingSoon: true, category: 'Business Tools' },
  { key: 'toast_pos', name: 'Toast POS', description: 'Restaurant POS system', icon: ShoppingBag, comingSoon: true, category: 'Business Tools' },
  { key: 'quickbooks', name: 'QuickBooks', description: 'Accounting and invoices', icon: FileText, comingSoon: true, category: 'Business Tools' },
  { key: 'jobber', name: 'Jobber', description: 'Field service management', icon: Briefcase, comingSoon: true, category: 'Business Tools' },
  { key: 'twilio', name: 'Twilio', description: 'Phone calls and SMS', icon: Phone, comingSoon: false, category: 'Phone / SMS' },
  { key: 'dropbox', name: 'Dropbox', description: 'Cloud file storage', icon: Cloud, comingSoon: true, category: 'Storage' },
];

interface ConnectionStatus {
  connected: boolean;
  email?: string;
  connected_at?: string;
}

export default function ConnectionsPage() {
  const searchParams = useSearchParams();
  const [statuses, setStatuses] = useState<Record<string, ConnectionStatus>>({});
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const customerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('customer_id') || 'demo'
    : 'demo';

  const loadStatuses = useCallback(async () => {
    try {
      const res = await fetch(`/api/connections?customer_id=${customerId}`);
      const data = await res.json();
      if (data.connections) {
        setStatuses(data.connections);
      }
    } catch {
      // Keep existing state
    }
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  // Handle OAuth redirect results
  useEffect(() => {
    const connected = searchParams.get('connected');
    const err = searchParams.get('error');
    if (connected) {
      setSuccessMsg(`${connected.replace('_', ' ')} connected successfully!`);
      loadStatuses();
      setTimeout(() => setSuccessMsg(null), 5000);
    }
    if (err) {
      const msgs: Record<string, string> = {
        oauth_denied: 'You denied access. Try again when ready.',
        token_failed: 'Failed to complete authentication. Please try again.',
        missing_params: 'OAuth callback failed. Please try again.',
        invalid_state: 'Invalid OAuth state. Please try again.',
        internal: 'An error occurred. Please try again.',
      };
      setError(msgs[err] || 'Connection failed. Please try again.');
      setTimeout(() => setError(null), 8000);
    }
  }, [searchParams, loadStatuses]);

  const handleConnect = async (key: string) => {
    setConnecting(key);
    setError(null);

    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, service: key, action: 'connect' }),
      });
      const data = await res.json();

      if (data.oauth_url) {
        // Redirect to OAuth provider
        window.location.href = data.oauth_url;
        return;
      }

      if (data.success) {
        await loadStatuses();
        setSuccessMsg(`${key.replace('_', ' ')} connected!`);
        setTimeout(() => setSuccessMsg(null), 5000);
      } else if (data.redirect) {
        setError(data.error);
        setTimeout(() => {
          window.location.href = data.redirect;
        }, 2000);
      } else if (data.setup_required) {
        setError(data.error);
      } else {
        setError(data.error || 'Failed to connect');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }

    setConnecting(null);
  };

  const handleDisconnect = async (key: string) => {
    setConnecting(key);
    setError(null);

    try {
      await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, service: key, action: 'disconnect' }),
      });
      await loadStatuses();
    } catch {
      setError('Failed to disconnect. Please try again.');
    }

    setConnecting(null);
  };

  const categories = Array.from(new Set(CONNECTIONS.map((c) => c.category)));
  const grouped = categories.map((cat) => ({
    category: cat,
    items: CONNECTIONS.filter((c) => c.category === cat),
  }));

  const connectedCount = Object.values(statuses).filter((s) => s.connected).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#0F6B6E] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-[#0B1F3B]">Connections</h1>
        <span className="text-lg text-gray-500">
          {connectedCount} of {CONNECTIONS.filter((c) => !c.comingSoon).length} connected
        </span>
      </div>

      {/* Status banners */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <X className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-lg text-red-800">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-lg text-green-800">{successMsg}</p>
        </div>
      )}

      <div className="space-y-10">
        {grouped.map((group) => (
          <div key={group.category}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{group.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((conn) => {
                const Icon = conn.icon;
                const status = statuses[conn.key];
                const isConnected = status?.connected || false;
                const isLoading = connecting === conn.key;

                return (
                  <div
                    key={conn.key}
                    className={`bg-white rounded-xl border-2 p-5 transition-all ${
                      isConnected
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        isConnected ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isConnected ? 'text-green-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900">{conn.name}</h3>
                        <p className="text-base text-gray-500 mt-0.5">{conn.description}</p>
                        {isConnected && status?.email && (
                          <p className="text-sm text-green-600 mt-1 truncate">{status.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      {conn.comingSoon ? (
                        <span className="inline-flex items-center gap-1.5 text-base text-gray-400 font-medium">
                          <Clock className="w-4 h-4" />
                          Coming Soon
                        </span>
                      ) : isConnected ? (
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-base text-green-600 font-semibold">
                            <Check className="w-5 h-5" />
                            Connected
                          </span>
                          <button
                            onClick={() => handleDisconnect(conn.key)}
                            disabled={isLoading}
                            className="text-base text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect(conn.key)}
                          disabled={isLoading || connecting !== null}
                          className="w-full bg-[#0F6B6E] text-white py-2.5 rounded-lg text-base font-semibold hover:bg-[#0B5456] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
                          ) : conn.key === 'gmail' || conn.key === 'google_calendar' ? (
                            <><ExternalLink className="w-4 h-4" /> Connect with Google</>
                          ) : conn.key === 'twilio' ? (
                            <><Plug className="w-4 h-4" /> Connect</>
                          ) : (
                            <><Plug className="w-4 h-4" /> Connect</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
