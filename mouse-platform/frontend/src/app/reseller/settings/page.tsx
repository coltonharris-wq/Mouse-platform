'use client';

import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import Link from 'next/link';

export default function ResellerSettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [hourlyRate, setHourlyRate] = useState(498);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rateSaving, setRateSaving] = useState(false);
  const [rateSaved, setRateSaved] = useState(false);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  useEffect(() => {
    if (!resellerId) return;
    fetch(`/api/admin/resellers?id=${resellerId}`)
      .then((r) => r.json())
      .then((data) => {
        const r = Array.isArray(data) ? data[0] : data;
        if (r) {
          setDisplayName(r.brand_display_name || r.name || '');
          setEmail(r.email || '');
          setHourlyRate(r.default_markup_cents || 498);
        }
      })
      .catch(() => {});
  }, [resellerId]);

  const handleSaveAccount = async () => {
    if (!resellerId) return;
    setSaving(true);
    try {
      await fetch('/api/admin/resellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resellerId,
          name: displayName,
          email,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save account info.');
    }
    setSaving(false);
  };

  const handleRateSave = async () => {
    if (!resellerId) return;
    setRateSaving(true);
    try {
      const res = await fetch('/api/admin/resellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resellerId,
          default_markup_cents: hourlyRate,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setRateSaved(true);
        setTimeout(() => setRateSaved(false), 3000);
      }
    } catch {
      alert('Failed to save rate.');
    }
    setRateSaving(false);
  };

  const profitPerHour = ((hourlyRate - 498) / 100).toFixed(2);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Branding link */}
      <Link
        href="/reseller/branding"
        className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 hover:bg-teal-100 transition-colors"
      >
        <Palette className="w-5 h-5 text-teal-700" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-teal-800">Looking for branding?</p>
          <p className="text-xs text-teal-600">Brand slug, colors, logo, tagline, and QR code are on the Branding page.</p>
        </div>
        <span className="text-sm font-medium text-teal-700">Go to Branding Page &rarr;</span>
      </Link>

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
            placeholder="Your name"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSaved(false); }}
            placeholder="your@email.com"
            type="email"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAccount}
            disabled={saving}
            className="bg-[#0F6B6E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#0B5456]"
          >
            {saving ? 'Saving...' : 'Save Account'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Hourly Rate</h2>
        <p className="text-sm text-gray-500 mb-4">
          Set the rate you charge your customers per hour. Our base rate is $4.98/hr — you keep the difference.
        </p>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">${(hourlyRate / 100).toFixed(2)}/hr</span>
            <span className="text-sm font-semibold text-teal-600">Your profit: ${profitPerHour}/hr</span>
          </div>
          <input
            type="range"
            min={498}
            max={898}
            step={1}
            value={hourlyRate}
            onChange={(e) => { setHourlyRate(Number(e.target.value)); setRateSaved(false); }}
            className="w-full accent-teal-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>$4.98 (no markup)</span>
            <span>$8.98 (max)</span>
          </div>
        </div>

        {hourlyRate > 498 && (
          <div className="bg-teal-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-teal-800">
              At ${(hourlyRate / 100).toFixed(2)}/hr, you earn <strong>${profitPerHour}</strong> per customer work hour.
              {' '}With 10 customers averaging 20 hrs/mo each, that&apos;s <strong>${((hourlyRate - 498) / 100 * 200).toFixed(0)}/mo</strong> profit.
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleRateSave}
            disabled={rateSaving}
            className="bg-[#0F6B6E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#0B5456]"
          >
            {rateSaving ? 'Saving...' : 'Save Rate'}
          </button>
          {rateSaved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
        <p className="text-sm text-gray-500 mb-4">Configure how you receive notifications about your businesses.</p>
        <div className="space-y-3">
          {[
            { label: 'New customer sign-ups', defaultOn: true },
            { label: 'Voice agent calls', defaultOn: true },
            { label: 'Revenue milestones', defaultOn: false },
          ].map((n) => (
            <label key={n.label} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={n.defaultOn}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">{n.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
