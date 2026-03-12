'use client';

import { useState } from 'react';
import { Plug, Check, X, Mail, Phone, Calendar, MessageSquare, FileText, Cloud, Camera, ShoppingBag, Briefcase } from 'lucide-react';

interface Connection {
  name: string;
  description: string;
  icon: typeof Mail;
  connected: boolean;
  comingSoon: boolean;
  category: string;
}

const CONNECTIONS: Connection[] = [
  // Communication
  { name: 'Gmail', description: 'Read and send emails', icon: Mail, connected: false, comingSoon: false, category: 'Communication' },
  { name: 'Outlook', description: 'Microsoft email integration', icon: Mail, connected: false, comingSoon: true, category: 'Communication' },

  // Social Media
  { name: 'Facebook', description: 'Manage posts and messages', icon: MessageSquare, connected: false, comingSoon: true, category: 'Social Media' },
  { name: 'Instagram', description: 'Post and respond to DMs', icon: Camera, connected: false, comingSoon: true, category: 'Social Media' },

  // Productivity
  { name: 'Google Calendar', description: 'Schedule and manage events', icon: Calendar, connected: false, comingSoon: false, category: 'Productivity' },
  { name: 'Google Drive', description: 'Store and access files', icon: Cloud, connected: false, comingSoon: true, category: 'Productivity' },

  // Business Tools
  { name: 'Square POS', description: 'Point of sale integration', icon: ShoppingBag, connected: false, comingSoon: true, category: 'Business Tools' },
  { name: 'Toast POS', description: 'Restaurant POS system', icon: ShoppingBag, connected: false, comingSoon: true, category: 'Business Tools' },
  { name: 'QuickBooks', description: 'Accounting and invoices', icon: FileText, connected: false, comingSoon: true, category: 'Business Tools' },
  { name: 'Jobber', description: 'Field service management', icon: Briefcase, connected: false, comingSoon: true, category: 'Business Tools' },

  // Phone/SMS
  { name: 'Twilio', description: 'Phone calls and SMS', icon: Phone, connected: false, comingSoon: false, category: 'Phone / SMS' },

  // Storage
  { name: 'Dropbox', description: 'Cloud file storage', icon: Cloud, connected: false, comingSoon: true, category: 'Storage' },
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState(CONNECTIONS);

  // Group by category
  const categories = Array.from(new Set(connections.map((c) => c.category)));
  const grouped = categories.map((cat) => ({
    category: cat,
    items: connections.filter((c) => c.category === cat),
  }));

  const handleConnect = (name: string) => {
    // For now, toggle connected state. Real implementation would trigger OAuth.
    setConnections((prev) =>
      prev.map((c) =>
        c.name === name && !c.comingSoon ? { ...c, connected: !c.connected } : c
      )
    );
  };

  const connectedCount = connections.filter((c) => c.connected).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-[#0B1F3B]">Connections</h1>
        <span className="text-lg text-gray-500">
          {connectedCount} of {connections.length} connected
        </span>
      </div>

      <div className="space-y-10">
        {grouped.map((group) => (
          <div key={group.category}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{group.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((conn) => {
                const Icon = conn.icon;
                return (
                  <div
                    key={conn.name}
                    className={`bg-white rounded-xl border-2 p-5 transition-all ${
                      conn.connected
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        conn.connected ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          conn.connected ? 'text-green-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900">{conn.name}</h3>
                        <p className="text-base text-gray-500 mt-0.5">{conn.description}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      {conn.comingSoon ? (
                        <span className="inline-flex items-center gap-1.5 text-base text-gray-400 font-medium">
                          <Clock className="w-4 h-4" />
                          Coming Soon
                        </span>
                      ) : conn.connected ? (
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-base text-green-600 font-semibold">
                            <Check className="w-5 h-5" />
                            Connected
                          </span>
                          <button
                            onClick={() => handleConnect(conn.name)}
                            className="text-base text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect(conn.name)}
                          className="w-full bg-[#0F6B6E] text-white py-2.5 rounded-lg text-base font-semibold hover:bg-[#0B5456] transition-colors flex items-center justify-center gap-2"
                        >
                          <Plug className="w-4 h-4" />
                          Connect
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

// Need this import for the Coming Soon badge
function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
