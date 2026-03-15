'use client';

import { useEffect, useState } from 'react';
import { Mail, UserPlus, Copy, Check, Send, Link2, ChevronDown } from 'lucide-react';

const INDUSTRIES = [
  'Restaurant',
  'Salon',
  'Plumber',
  'Dentist',
  'Attorney',
  'Contractor',
  'Auto Shop',
  'Gym',
  'Cleaning',
  'Vet',
  'Roofer',
  'Other',
];

const MOUSE_COST = 4.98;

interface Invite {
  id: string;
  name: string;
  email: string;
  industry: string;
  custom_rate: number;
  status: 'sent' | 'opened' | 'signed_up';
  created_at: string;
  invite_url?: string;
}

export default function InviteCustomerPage() {
  const [resellerId, setResellerId] = useState('');
  const [markupRate, setMarkupRate] = useState(7.48);

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [niche, setNiche] = useState('');

  // Submission state
  const [sending, setSending] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Recent invites
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  useEffect(() => {
    const rid = sessionStorage.getItem('reseller_id') || '';
    setResellerId(rid);

    const storedRate = sessionStorage.getItem('markup_rate');
    if (storedRate) {
      setMarkupRate(parseFloat(storedRate));
    }

    if (rid) {
      fetch(`/api/reseller/invite?reseller_id=${rid}`)
        .then((r) => r.json())
        .then((data) => setInvites(data.invites || []))
        .catch(() => {})
        .finally(() => setLoadingInvites(false));
    } else {
      setLoadingInvites(false);
    }
  }, []);

  const profit = markupRate - MOUSE_COST;

  const handleSendInvite = async () => {
    if (!email || !name || !resellerId) return;
    setSending(true);
    setInviteUrl('');
    setCopied(false);

    try {
      const res = await fetch('/api/reseller/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reseller_id: resellerId,
          email,
          name,
          industry,
          niche,
          custom_rate: markupRate,
        }),
      });
      const data = await res.json();
      if (data.invite_url) {
        setInviteUrl(data.invite_url);
      }

      // Reload invites
      const invitesRes = await fetch(`/api/reseller/invite?reseller_id=${resellerId}`);
      const invitesData = await invitesRes.json();
      setInvites(invitesData.invites || []);

      // Clear form
      setEmail('');
      setName('');
      setIndustry('');
      setNiche('');
    } catch {
      alert('Failed to send invite. Please try again.');
    }
    setSending(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      sent: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Sent' },
      opened: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Opened' },
      signed_up: { bg: 'bg-[#e8f5ef]', text: 'text-[#1D9E75]', label: 'Signed Up' },
    };
    const s = map[status] || map.sent;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
          <UserPlus className="w-5 h-5" style={{ color: '#F07020' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1e2a3a' }}>
            Invite Customer
          </h1>
          <p className="text-sm text-gray-500">
            Send a branded invite link to onboard new customers.
          </p>
        </div>
      </div>

      {/* Invite Form Card */}
      <div
        className="bg-white rounded-xl p-6 mb-6"
        style={{ border: '1px solid #e4e0da' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Customer Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>
              Customer Email <span style={{ color: '#F07020' }}>*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@business.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  border: '1px solid #e4e0da',
                  color: '#1e2a3a',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#F07020')}
                onBlur={(e) => (e.target.style.borderColor = '#e4e0da')}
              />
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>
              Customer Name <span style={{ color: '#F07020' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John's Plumbing"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                border: '1px solid #e4e0da',
                color: '#1e2a3a',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#F07020')}
              onBlur={(e) => (e.target.style.borderColor = '#e4e0da')}
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>
              Industry
            </label>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none appearance-none bg-white transition-colors"
                style={{
                  border: '1px solid #e4e0da',
                  color: industry ? '#1e2a3a' : '#9ca3af',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#F07020')}
                onBlur={(e) => (e.target.style.borderColor = '#e4e0da')}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Niche */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>
              Niche
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Emergency plumbing, Hair extensions"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                border: '1px solid #e4e0da',
                color: '#1e2a3a',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#F07020')}
              onBlur={(e) => (e.target.style.borderColor = '#e4e0da')}
            />
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div
          className="rounded-lg p-4 mb-6"
          style={{ backgroundColor: '#faf8f5', border: '1px solid #e4e0da' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#1e2a3a' }}>
            Pricing Breakdown
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">They pay</p>
              <p className="text-lg font-bold" style={{ color: '#1e2a3a' }}>
                ${markupRate.toFixed(2)}
                <span className="text-xs font-normal text-gray-400">/hr</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Mouse costs</p>
              <p className="text-lg font-bold text-gray-500">
                ${MOUSE_COST.toFixed(2)}
                <span className="text-xs font-normal text-gray-400">/hr</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Your profit</p>
              <p className="text-lg font-bold" style={{ color: '#1D9E75' }}>
                ${profit.toFixed(2)}
                <span className="text-xs font-normal text-gray-400">/hr</span>
              </p>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendInvite}
          disabled={sending || !email || !name}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#F07020' }}
          onMouseEnter={(e) => {
            if (!sending && email && name) e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Send className="w-4 h-4" />
          {sending ? 'Sending...' : 'Send Invite Link'}
        </button>

        {/* Invite URL Result */}
        {inviteUrl && (
          <div
            className="mt-5 rounded-lg p-4 flex items-center gap-3"
            style={{ backgroundColor: '#e8f5ef', border: '1px solid #b6e2cc' }}
          >
            <Link2 className="w-5 h-5 flex-shrink-0" style={{ color: '#1D9E75' }} />
            <code
              className="flex-1 text-sm truncate"
              style={{ color: '#1e2a3a' }}
            >
              {inviteUrl}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-shrink-0"
              style={{
                backgroundColor: copied ? '#1D9E75' : 'white',
                color: copied ? 'white' : '#1e2a3a',
                border: copied ? 'none' : '1px solid #e4e0da',
              }}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Recent Invites Table */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #e4e0da' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #e4e0da' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#1e2a3a' }}>
            Recent Invites
          </h2>
        </div>

        {loadingInvites ? (
          <div className="flex items-center justify-center h-32">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: '#F07020' }}
            />
          </div>
        ) : invites.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Mail className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No invites sent yet. Send your first invite above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#faf8f5' }}>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#1e2a3a' }}
                  >
                    Name
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#1e2a3a' }}
                  >
                    Email
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell"
                    style={{ color: '#1e2a3a' }}
                  >
                    Industry
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider hidden sm:table-cell"
                    style={{ color: '#1e2a3a' }}
                  >
                    Rate
                  </th>
                  <th
                    className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#1e2a3a' }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider hidden md:table-cell"
                    style={{ color: '#1e2a3a' }}
                  >
                    Sent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#e4e0da' }}>
                {invites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-medium" style={{ color: '#1e2a3a' }}>
                        {inv.name}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-gray-500">{inv.email}</span>
                    </td>
                    <td className="px-6 py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-gray-500">{inv.industry || '-'}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right hidden sm:table-cell">
                      <span className="text-sm font-medium" style={{ color: '#1e2a3a' }}>
                        ${(inv.custom_rate || markupRate).toFixed(2)}/hr
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      {statusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-3.5 text-right hidden md:table-cell">
                      <span className="text-sm text-gray-400">
                        {inv.created_at
                          ? new Date(inv.created_at).toLocaleDateString()
                          : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
