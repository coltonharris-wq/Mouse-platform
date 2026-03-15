'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-browser';
import type { Connection } from '@/lib/types';

interface AppCard {
  id: string;
  name: string;
  oauthFlow: boolean;
}

interface Category {
  label: string;
  apps: AppCard[];
}

const CATEGORIES: Category[] = [
  {
    label: 'Email',
    apps: [
      { id: 'gmail', name: 'Gmail', oauthFlow: true },
      { id: 'outlook', name: 'Outlook', oauthFlow: false },
      { id: 'yahoo-mail', name: 'Yahoo Mail', oauthFlow: false },
    ],
  },
  {
    label: 'Accounting',
    apps: [
      { id: 'quickbooks', name: 'QuickBooks', oauthFlow: false },
      { id: 'freshbooks', name: 'FreshBooks', oauthFlow: false },
      { id: 'xero', name: 'Xero', oauthFlow: false },
      { id: 'wave', name: 'Wave', oauthFlow: false },
    ],
  },
  {
    label: 'CRM',
    apps: [
      { id: 'hubspot', name: 'HubSpot', oauthFlow: false },
      { id: 'salesforce', name: 'Salesforce', oauthFlow: false },
      { id: 'zoho-crm', name: 'Zoho CRM', oauthFlow: false },
    ],
  },
  {
    label: 'Social',
    apps: [
      { id: 'facebook', name: 'Facebook', oauthFlow: false },
      { id: 'instagram', name: 'Instagram', oauthFlow: false },
      { id: 'google-my-business', name: 'Google My Business', oauthFlow: false },
      { id: 'yelp', name: 'Yelp', oauthFlow: false },
      { id: 'tiktok', name: 'TikTok', oauthFlow: false },
    ],
  },
  {
    label: 'Communication',
    apps: [
      { id: 'slack', name: 'Slack', oauthFlow: false },
      { id: 'microsoft-teams', name: 'Microsoft Teams', oauthFlow: false },
      { id: 'twilio', name: 'Twilio', oauthFlow: false },
    ],
  },
  {
    label: 'Storage',
    apps: [
      { id: 'google-drive', name: 'Google Drive', oauthFlow: false },
      { id: 'dropbox', name: 'Dropbox', oauthFlow: false },
      { id: 'onedrive', name: 'OneDrive', oauthFlow: false },
    ],
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalApp, setModalApp] = useState<AppCard | null>(null);
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [search, setSearch] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function loadConnections() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('connections')
          .select('*')
          .eq('user_id', user.id);

        if (data) {
          setConnections(data as Connection[]);
        }
      } catch (err) {
        console.error('Failed to load connections:', err);
      } finally {
        setLoading(false);
      }
    }

    loadConnections();
  }, []);

  function isConnected(appId: string): boolean {
    return connections.some(
      (c) => c.provider === appId && c.status === 'connected'
    );
  }

  function handleConnect(app: AppCard) {
    if (app.oauthFlow) {
      window.location.href = `/api/connections/${app.id}/authorize`;
    } else {
      setModalApp(app);
      setCredEmail('');
      setCredPassword('');
    }
  }

  async function handleDisconnect(appId: string) {
    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('connections')
        .update({ status: 'disconnected' })
        .eq('user_id', user.id)
        .eq('provider', appId);

      setConnections((prev) =>
        prev.map((c) =>
          c.provider === appId ? { ...c, status: 'disconnected' } : c
        )
      );
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  }

  async function handleCredentialSubmit() {
    if (!modalApp) return;
    setConnecting(true);

    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('connections').upsert({
        user_id: user.id,
        provider: modalApp.id,
        status: 'connected',
        account_email: credEmail,
        connected_at: new Date().toISOString(),
      });

      setConnections((prev) => {
        const existing = prev.find((c) => c.provider === modalApp.id);
        if (existing) {
          return prev.map((c) =>
            c.provider === modalApp.id
              ? { ...c, status: 'connected', account_email: credEmail }
              : c
          );
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            user_id: user.id,
            provider: modalApp.id,
            status: 'connected',
            account_email: credEmail,
            connected_at: new Date().toISOString(),
            last_sync: null,
          },
        ];
      });

      setModalApp(null);
    } catch (err) {
      console.error('Failed to connect:', err);
    } finally {
      setConnecting(false);
    }
  }

  const lowerSearch = search.toLowerCase();

  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
    apps: cat.apps.filter((app) =>
      app.name.toLowerCase().includes(lowerSearch)
    ),
  })).filter((cat) => cat.apps.length > 0);

  if (loading) {
    return (
      <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ color: '#888', fontSize: 16 }}>Loading connections...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 960, marginLeft: 'auto', marginRight: 'auto' }}>
      {/* Header */}
      <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
        Connections
      </h1>
      <p style={{ fontSize: 13, color: '#888', margin: '6px 0 20px 0' }}>
        Connect your apps so King Mouse can work with your tools.
      </p>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <svg
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 14px 10px 36px',
            fontSize: 14,
            background: '#f6f6f4',
            border: '0.5px solid #e8e8e4',
            borderRadius: 10,
            outline: 'none',
            color: '#1a1a1a',
          }}
        />
      </div>

      {/* Categories */}
      {filteredCategories.map((cat) => (
        <div key={cat.label} style={{ marginBottom: 28 }}>
          {/* Category label */}
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            {cat.label}
          </div>

          {/* App cards grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {cat.apps.map((app) => {
              const connected = isConnected(app.id);
              const btnKey = app.id;
              const isHovered = hoveredBtn === btnKey;

              return (
                <div
                  key={app.id}
                  style={{
                    background: '#fff',
                    border: '0.5px solid #e8e8e4',
                    borderRadius: 10,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {/* App info row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Icon */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: '#f0f0ec',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#888',
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(app.name)}
                    </div>
                    {/* Name + connected status */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
                        {app.name}
                      </div>
                      {connected && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 2,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: '#1D9E75',
                              display: 'inline-block',
                            }}
                          />
                          <span style={{ fontSize: 11, color: '#1D9E75' }}>Connected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  {connected ? (
                    <button
                      onClick={() => handleDisconnect(app.id)}
                      style={{
                        width: '100%',
                        padding: '7px 0',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#e53e3e',
                        background: 'transparent',
                        border: '0.5px solid #e8e8e4',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(app)}
                      onMouseEnter={() => setHoveredBtn(btnKey)}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        width: '100%',
                        padding: '7px 0',
                        fontSize: 13,
                        fontWeight: 500,
                        color: isHovered ? '#F07020' : '#888',
                        background: 'transparent',
                        border: isHovered ? '0.5px solid #F07020' : '0.5px solid #e8e8e4',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'color 0.15s, border-color 0.15s',
                      }}
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Connect credential modal */}
      {modalApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              width: '100%',
              maxWidth: 380,
              padding: 24,
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
                Connect {modalApp.name}
              </h2>
              <button
                onClick={() => setModalApp(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: '#888',
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                &#x2715;
              </button>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#1a1a1a',
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    fontSize: 14,
                    border: '0.5px solid #e8e8e4',
                    borderRadius: 8,
                    outline: 'none',
                    color: '#1a1a1a',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#1a1a1a',
                    marginBottom: 6,
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  placeholder="Your password"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    fontSize: 14,
                    border: '0.5px solid #e8e8e4',
                    borderRadius: 8,
                    outline: 'none',
                    color: '#1a1a1a',
                  }}
                />
              </div>
            </div>

            {/* Modal buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setModalApp(null)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1a1a1a',
                  background: '#fff',
                  border: '0.5px solid #e8e8e4',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCredentialSubmit}
                disabled={connecting || !credEmail || !credPassword}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#fff',
                  background: connecting || !credEmail || !credPassword ? '#ccc' : '#F07020',
                  border: 'none',
                  borderRadius: 8,
                  cursor: connecting || !credEmail || !credPassword ? 'default' : 'pointer',
                }}
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
