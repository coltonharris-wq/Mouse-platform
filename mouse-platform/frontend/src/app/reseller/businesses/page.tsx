'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Copy, X, ChevronDown, ChevronUp, Send, Building2 } from 'lucide-react';
import type { ResellerBusiness } from '@/types/reseller-dashboard';

interface ProOption {
  slug: string;
  name: string;
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<ResellerBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pros, setPros] = useState<ProOption[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    business_name: '', business_email: '', contact_name: '',
    phone: '', pro_slug: '', custom_hourly_rate: 498,
  });
  const [creating, setCreating] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ link: string; code: string } | null>(null);

  // Detail edit
  const [editNotes, setEditNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  useEffect(() => {
    // Pre-select pro from URL params
    const params = new URLSearchParams(window.location.search);
    const proParam = params.get('pro');
    if (proParam) {
      setForm((f) => ({ ...f, pro_slug: proParam }));
      setShowForm(true);
    }

    // Load pros
    fetch('/api/pro-profiles')
      .then((r) => r.json())
      .then((d) => setPros((d.profiles || []).map((p: { slug: string; name: string }) => ({ slug: p.slug, name: p.name }))))
      .catch(() => {});

    // Load businesses
    if (!resellerId) { setLoading(false); return; }
    fetch(`/api/reseller/businesses?reseller_id=${resellerId}`)
      .then((r) => r.json())
      .then((d) => setBusinesses(d.businesses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resellerId]);

  const handleCreate = async () => {
    if (!form.business_name || !form.business_email || !resellerId) return;
    setCreating(true);
    try {
      const res = await fetch('/api/reseller/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reseller_id: resellerId,
          business_name: form.business_name,
          business_email: form.business_email,
          contact_name: form.contact_name || undefined,
          phone: form.phone || undefined,
          pro_slug: form.pro_slug || undefined,
          custom_hourly_rate_cents: form.custom_hourly_rate || undefined,
        }),
      });
      const data = await res.json();
      setInviteResult({ link: data.invite_link, code: data.invite_code });

      // Reload businesses
      const bizRes = await fetch(`/api/reseller/businesses?reseller_id=${resellerId}`);
      const bizData = await bizRes.json();
      setBusinesses(bizData.businesses || []);

      // Reset form
      setForm({ business_name: '', business_email: '', contact_name: '', phone: '', pro_slug: '', custom_hourly_rate: 498 });
    } catch {
      alert('Failed to create business.');
    }
    setCreating(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveNotes = async (bizId: string) => {
    setSavingNotes(true);
    try {
      await fetch(`/api/reseller/businesses/${bizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes }),
      });
      setBusinesses((prev) => prev.map((b) => b.id === bizId ? { ...b, notes: editNotes } : b));
    } catch { /* ignore */ }
    setSavingNotes(false);
  };

  const statusColors: Record<string, string> = {
    invited: 'bg-yellow-100 text-yellow-800',
    signed_up: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    churned: 'bg-red-100 text-red-800',
  };

  const proNameMap = Object.fromEntries(pros.map((p) => [p.slug, p.name]));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your customer businesses and invite links.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setInviteResult(null); }}
          className="flex items-center gap-2 bg-[#0F6B6E] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0B5456]"
        >
          <Plus className="w-4 h-4" />
          Add Business
        </button>
      </div>

      {/* Add Business Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          {inviteResult ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Invite Link Created!</h3>
              <div className="flex items-center gap-2 justify-center mb-4">
                <code className="bg-gray-100 px-3 py-1.5 rounded text-sm text-gray-700 max-w-md truncate">{inviteResult.link}</code>
                <button
                  onClick={() => handleCopy(inviteResult.link, 'invite')}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copied === 'invite' && <span className="text-xs text-green-600">Copied!</span>}
              </div>
              <button
                onClick={() => { setInviteResult(null); setShowForm(false); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Add New Business</h3>
                <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  placeholder="Business name *"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                />
                <input
                  value={form.business_email}
                  onChange={(e) => setForm({ ...form, business_email: e.target.value })}
                  placeholder="Business email *"
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                />
                <input
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  placeholder="Contact name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                />
                <select
                  value={form.pro_slug}
                  onChange={(e) => setForm({ ...form, pro_slug: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                >
                  <option value="">Select Pro</option>
                  {pros.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.name}</option>
                  ))}
                </select>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Hourly Rate: ${(form.custom_hourly_rate / 100).toFixed(2)}/hr
                    <span className="text-teal-600 ml-1">(profit: ${((form.custom_hourly_rate - 498) / 100).toFixed(2)}/hr)</span>
                  </label>
                  <input
                    type="range"
                    min={498}
                    max={898}
                    step={1}
                    value={form.custom_hourly_rate}
                    onChange={(e) => setForm({ ...form, custom_hourly_rate: Number(e.target.value) })}
                    className="w-full accent-teal-600"
                  />
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || !form.business_name || !form.business_email}
                className="bg-[#0F6B6E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#0B5456]"
              >
                {creating ? 'Creating...' : 'Create & Generate Invite'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Business Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {businesses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No businesses yet. Click &quot;Add Business&quot; to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Business</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Pro</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Revenue</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Added</th>
                  <th className="px-4 py-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {businesses.map((biz) => (
                  <React.Fragment key={biz.id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        if (expandedId === biz.id) {
                          setExpandedId(null);
                        } else {
                          setExpandedId(biz.id);
                          setEditNotes(biz.notes || '');
                        }
                      }}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{biz.business_name}</p>
                        <p className="text-xs text-gray-400">{biz.business_email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                        {proNameMap[biz.pro_slug || ''] || biz.pro_slug || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[biz.status] || 'bg-gray-100 text-gray-600'}`}>
                          {biz.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600 hidden sm:table-cell">
                        ${((biz.monthly_revenue_cents || 0) / 100).toFixed(0)}/mo
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-400 hidden sm:table-cell">
                        {biz.created_at ? new Date(biz.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {expandedId === biz.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </td>
                    </tr>
                    {expandedId === biz.id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Contact</p>
                              <p className="text-gray-900">{biz.contact_name || '-'}</p>
                              <p className="text-gray-600">{biz.phone || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Hourly Rate</p>
                              <p className="text-gray-900">
                                {biz.custom_hourly_rate_cents
                                  ? `$${(biz.custom_hourly_rate_cents / 100).toFixed(2)}/hr (profit: $${((biz.custom_hourly_rate_cents - 498) / 100).toFixed(2)}/hr)`
                                  : 'Default rate'}
                              </p>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-gray-500 mb-1">Notes</p>
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                rows={2}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                                placeholder="Add notes about this business..."
                              />
                              <button
                                onClick={() => handleSaveNotes(biz.id)}
                                disabled={savingNotes}
                                className="mt-1 text-sm text-[#0F6B6E] font-medium hover:underline disabled:opacity-50"
                              >
                                {savingNotes ? 'Saving...' : 'Save Notes'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
