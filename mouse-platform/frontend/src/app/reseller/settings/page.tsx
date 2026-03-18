'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Phone, Mail } from 'lucide-react';

export default function ResellerSettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sellingPriceCents, setSellingPriceCents] = useState(498);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectingStripe, setConnectingStripe] = useState(false);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  const wholesaleRateCents = 498;

  useEffect(() => {
    if (!resellerId) return;
    fetch(`/api/admin/resellers?id=${resellerId}`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.resellers || data;
        const r = Array.isArray(list) ? list.find((x: Record<string, unknown>) => x.id === resellerId) || list[0] : list;
        if (r) {
          setDisplayName(r.brand_display_name || r.name || '');
          setEmail(r.email || '');
          setPhone(r.phone || '');
          setSellingPriceCents(r.default_markup_cents || 498);
          setStripeAccountId(r.stripe_account_id || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resellerId]);

  const handleSaveProfile = async () => {
    if (!resellerId) return;
    setSaving(true);
    try {
      await fetch('/api/admin/resellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reseller_id: resellerId,
          name: displayName,
          email,
          phone,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save profile.');
    }
    setSaving(false);
  };

  const handleConnectStripe = async () => {
    if (!resellerId) return;
    setConnectingStripe(true);
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reseller_id: resellerId }),
      });
      const data = await res.json();
      if (data.onboarding_url) {
        window.location.href = data.onboarding_url;
      } else {
        alert(data.error || 'Failed to start Stripe Connect onboarding.');
        setConnectingStripe(false);
      }
    } catch {
      alert('Failed to connect Stripe.');
      setConnectingStripe(false);
    }
  };

  const profitPerHour = ((sellingPriceCents - wholesaleRateCents) / 100).toFixed(2);

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-100 rounded-xl" />
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-[#e4e0da] p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
            placeholder="Your name"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#F07020] focus:ring-1 focus:ring-[#F07020]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSaved(false); }}
            placeholder="your@email.com"
            type="email"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#F07020] focus:ring-1 focus:ring-[#F07020]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setSaved(false); }}
            placeholder="(555) 123-4567"
            type="tel"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#F07020] focus:ring-1 focus:ring-[#F07020]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-[#F07020] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#d9641c] transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-[#e4e0da] p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Wholesale rate</span>
            <span className="text-sm font-medium text-gray-900">${(wholesaleRateCents / 100).toFixed(2)}/hr</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Your selling price</span>
            <span className="text-sm font-medium text-gray-900">${(sellingPriceCents / 100).toFixed(2)}/hr</span>
          </div>
          <div className="border-t border-[#e4e0da] pt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Profit per hour</span>
            <span className="text-sm font-semibold text-[#F07020]">${profitPerHour}/hr</span>
          </div>
        </div>

        <p className="text-xs text-gray-500">Contact support to change your rate.</p>
      </div>

      {/* Payout Method */}
      <div className="bg-white rounded-xl border border-[#e4e0da] p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Method</h2>

        {stripeAccountId ? (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-800">Bank account connected</span>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">Connect your bank account through Stripe to receive payouts.</p>
            <button
              onClick={handleConnectStripe}
              disabled={connectingStripe}
              className="bg-[#F07020] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#d9641c] transition-colors"
            >
              {connectingStripe ? 'Connecting...' : 'Connect with Stripe'}
            </button>
          </div>
        )}
      </div>

      {/* Talk to a Human */}
      <div className="bg-white rounded-xl border border-[#e4e0da] p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Talk to a Human</h2>
        <p className="text-sm text-gray-500 mb-4">Need help? Reach out to our support team directly.</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a href="tel:+19105158927" className="text-sm text-gray-800 hover:text-[#F07020] transition-colors">
              (910) 515-8927
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a href="mailto:colton.harris@automioapp.com" className="text-sm text-gray-800 hover:text-[#F07020] transition-colors">
              colton.harris@automioapp.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
