'use client';

import { useEffect, useState } from 'react';
import { Phone, Search, PhoneCall, Settings, Clock } from 'lucide-react';

interface PhoneNumber {
  phone_number: string;
  friendly_name: string;
  locality: string;
  region: string;
}

interface OwnedNumber {
  id: string;
  phone_number: string;
  friendly_name: string;
  status: string;
}

interface ReceptionistConfig {
  is_enabled: boolean;
  greeting_text: string;
  after_hours_message: string;
  voicemail_enabled: boolean;
  voicemail_email: string;
  voice_id: string;
}

interface CallLog {
  id: string;
  caller_number: string;
  duration_seconds: number;
  status: string;
  created_at: string;
}

export default function ReceptionistPage() {
  const [tab, setTab] = useState<'setup' | 'config' | 'calls' | 'port'>('setup');
  const [areaCode, setAreaCode] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState<PhoneNumber[]>([]);
  const [ownedNumbers, setOwnedNumbers] = useState<OwnedNumber[]>([]);
  const [config, setConfig] = useState<ReceptionistConfig | null>(null);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const customerId = typeof window !== 'undefined' ? sessionStorage.getItem('customer_id') || 'demo' : 'demo';

  useEffect(() => {
    // Load receptionist config and numbers
    fetch(`/api/receptionist/config?customer_id=${customerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config);
          setTab('config');
        }
        if (data.phone_numbers?.length > 0) {
          setOwnedNumbers(data.phone_numbers);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Load call logs
    fetch(`/api/receptionist/calls?customer_id=${customerId}`)
      .then((r) => r.json())
      .then((data) => setCalls(data.calls || []))
      .catch(() => {});
  }, [customerId]);

  const handleSearch = async () => {
    if (!areaCode || areaCode.length !== 3) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/receptionist/phone-numbers/search?area_code=${areaCode}`);
      const data = await res.json();
      setAvailableNumbers(data.numbers || []);
    } catch {
      // Ignore
    }
    setSearching(false);
  };

  const handlePurchase = async (phoneNumber: string) => {
    setPurchasing(true);
    try {
      const res = await fetch('/api/receptionist/phone-numbers/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, phone_number: phoneNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setOwnedNumbers([{ id: 'new', phone_number: data.phone_number, friendly_name: data.phone_number, status: 'active' }]);
        setTab('config');
        // Reload config
        const configRes = await fetch(`/api/receptionist/config?customer_id=${customerId}`);
        const configData = await configRes.json();
        if (configData.config) setConfig(configData.config);
      }
    } catch {
      alert('Failed to purchase number. Please try again.');
    }
    setPurchasing(false);
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await fetch('/api/receptionist/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, ...config }),
      });
    } catch {
      alert('Failed to save.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0B1F3B] mb-6">AI Receptionist</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: 'setup', label: 'Phone Number', icon: Phone },
          { key: 'config', label: 'Settings', icon: Settings },
          { key: 'calls', label: 'Call Log', icon: PhoneCall },
          { key: 'port', label: 'Port Number', icon: Clock },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? 'border-[#0F6B6E] text-[#0F6B6E]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Setup Tab - Search and buy numbers */}
      {tab === 'setup' && (
        <div className="space-y-6">
          {ownedNumbers.length > 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-bold text-green-900 mb-2">Your Phone Number</h3>
              {ownedNumbers.map((n) => (
                <p key={n.id} className="text-2xl font-bold text-green-700">{n.phone_number}</p>
              ))}
              <p className="text-sm text-green-600 mt-2">Active and receiving calls</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Search for a Number</h3>
                <div className="flex gap-3 max-w-md">
                  <input
                    type="text"
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="Area code (e.g., 910)"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching || areaCode.length !== 3}
                    className="flex items-center gap-2 bg-[#0F6B6E] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    <Search className="w-4 h-4" />
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {availableNumbers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableNumbers.map((n) => (
                    <div key={n.phone_number} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{n.friendly_name}</p>
                        <p className="text-sm text-gray-500">{n.locality}, {n.region}</p>
                      </div>
                      <button
                        onClick={() => handlePurchase(n.phone_number)}
                        disabled={purchasing}
                        className="bg-[#0F6B6E] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        {purchasing ? 'Activating...' : 'Activate'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Config Tab */}
      {tab === 'config' && config && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Greeting Message</label>
              <textarea
                value={config.greeting_text}
                onChange={(e) => setConfig({ ...config, greeting_text: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">After Hours Message</label>
              <textarea
                value={config.after_hours_message}
                onChange={(e) => setConfig({ ...config, after_hours_message: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voice</label>
              <select
                value={config.voice_id}
                onChange={(e) => setConfig({ ...config, voice_id: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
              >
                {['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].map((v) => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.voicemail_enabled}
                onChange={(e) => setConfig({ ...config, voicemail_enabled: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm text-gray-700">Enable voicemail</label>
            </div>

            {config.voicemail_enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voicemail notification email</label>
                <input
                  type="email"
                  value={config.voicemail_email || ''}
                  onChange={(e) => setConfig({ ...config, voicemail_email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6B6E]"
                />
              </div>
            )}

            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="bg-[#0F6B6E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* SMS card */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Want SMS?</h3>
            <p className="text-sm text-gray-600">Text or call <strong>910-515-8927</strong> to get set up.</p>
          </div>
        </div>
      )}

      {/* Calls Tab */}
      {tab === 'calls' && (
        <div className="bg-white rounded-xl border border-gray-200">
          {calls.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <PhoneCall className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No calls yet</p>
              <p className="text-sm mt-1">Call logs will appear here after your first call.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {calls.map((call) => (
                <div key={call.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PhoneCall className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{call.caller_number || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{new Date(call.created_at).toLocaleString()}</p>
                  </div>
                  <span className="text-sm text-gray-500">{call.duration_seconds}s</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    call.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{call.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Port Tab */}
      {tab === 'port' && (
        <div className="max-w-lg">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Port Your Existing Number</h3>
            <p className="text-sm text-gray-600 mb-6">Transfer your existing business number to KingMouse.</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await fetch('/api/receptionist/port-request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customer_id: customerId,
                    phone_number: fd.get('phone'),
                    carrier_name: fd.get('carrier'),
                    carrier_account_number: fd.get('account'),
                    carrier_pin: fd.get('pin'),
                    business_name: fd.get('business'),
                    business_address: fd.get('address'),
                    authorized_name: fd.get('name'),
                  }),
                });
                alert('Port request submitted! We\'ll be in touch.');
              } catch {
                alert('Failed to submit. Please try again.');
              }
            }} className="space-y-3">
              <input name="phone" placeholder="Phone number to port" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
              <input name="carrier" placeholder="Current carrier" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
              <input name="account" placeholder="Carrier account number" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
              <input name="pin" placeholder="Carrier PIN" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
              <input name="business" placeholder="Business name" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
              <input name="address" placeholder="Business address" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
              <input name="name" placeholder="Authorized person name" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
              <button type="submit" className="bg-[#0F6B6E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold w-full">
                Submit Port Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
