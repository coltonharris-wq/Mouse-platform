'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Check, X, Copy, ExternalLink } from 'lucide-react';

export default function BrandingPage() {
  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [color, setColor] = useState('#0F6B6E');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [slugError, setSlugError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentSlug, setCurrentSlug] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          setSlug(r.brand_slug || '');
          setCurrentSlug(r.brand_slug || '');
          setDisplayName(r.brand_display_name || '');
          setColor(r.brand_color || '#0F6B6E');
          setTagline(r.brand_tagline || '');
          setLogoUrl(r.brand_logo_url || '');
        }
      })
      .catch(() => {});
  }, [resellerId]);

  const checkSlug = useCallback(async (s: string) => {
    if (!s || s.length < 3) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    try {
      const res = await fetch(`/api/reseller/brand?slug=${encodeURIComponent(s)}`);
      const data = await res.json();
      if (data.available || s === currentSlug) {
        setSlugStatus('available');
        setSlugError('');
      } else {
        setSlugStatus(data.reason?.includes('reserved') || data.reason?.includes('character') ? 'invalid' : 'taken');
        setSlugError(data.reason || 'Not available');
      }
    } catch {
      setSlugStatus('idle');
    }
  }, [currentSlug]);

  const handleSlugChange = (val: string) => {
    const normalized = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(normalized);
    setSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkSlug(normalized), 500);
  };

  const handleSave = async () => {
    if (!resellerId || !slug) return;
    setSaving(true);
    try {
      const res = await fetch('/api/reseller/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reseller_id: resellerId,
          slug,
          display_name: displayName || undefined,
          logo_url: logoUrl || undefined,
          color: color || '#0F6B6E',
          tagline: tagline || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentSlug(slug);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch {
      alert('Failed to save branding settings.');
    }
    setSaving(false);
  };

  const handleCopy = () => {
    const domain = 'mouse.is';
    navigator.clipboard.writeText(`https://${domain}/${currentSlug || slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const brandUrl = `mouse.is/${currentSlug || slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`https://${brandUrl}`)}&size=200x200`;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Branding</h1>

      {/* Brand Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Brand</h2>

        {/* Brand Slug */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Slug</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mouse.is/</span>
              <input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="your-brand"
                maxLength={30}
                className="w-full pl-[5.5rem] pr-10 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {slugStatus === 'checking' && <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin" />}
                {slugStatus === 'available' && <Check className="w-4 h-4 text-green-500" />}
                {(slugStatus === 'taken' || slugStatus === 'invalid') && <X className="w-4 h-4 text-red-500" />}
              </div>
            </div>
          </div>
          {slugError && (slugStatus === 'taken' || slugStatus === 'invalid') && (
            <p className="text-xs text-red-500 mt-1">{slugError}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">3-30 characters, lowercase letters, numbers, and hyphens</p>
        </div>

        {/* Display Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
            placeholder="ACME AI Solutions"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Brand Color */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); setSaved(false); }}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              value={color}
              onChange={(e) => { setColor(e.target.value); setSaved(false); }}
              className="w-32 px-3 py-2 rounded-lg border border-gray-300 text-sm font-mono"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tagline <span className="text-gray-400 font-normal">(optional, max 100 chars)</span></label>
          <input
            value={tagline}
            onChange={(e) => { setTagline(e.target.value.slice(0, 100)); setSaved(false); }}
            placeholder="AI-powered operations for your business"
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Logo URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            value={logoUrl}
            onChange={(e) => { setLogoUrl(e.target.value); setSaved(false); }}
            placeholder="https://example.com/logo.png"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !slug || slugStatus === 'taken' || slugStatus === 'invalid'}
            className="bg-[#0F6B6E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#0B5456]"
          >
            {saving ? 'Saving...' : 'Save Brand Settings'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Your Link + QR */}
      {(currentSlug || slug) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Branded URL</h2>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3 mb-4">
            <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm font-medium text-gray-900 flex-1">{brandUrl}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">Share this link with potential customers. They&apos;ll see your branded landing page.</p>

          {/* Preview card */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Preview</p>
            <div className="flex items-center gap-2 mb-1">
              {logoUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoUrl} alt="" className="w-6 h-6 rounded object-cover" />
              )}
              {!logoUrl && <div className="w-6 h-6 rounded" style={{ backgroundColor: color }} />}
              <span className="font-semibold text-gray-900 text-sm">{displayName || slug}</span>
              <span className="text-xs text-gray-400">Powered by KingMouse</span>
            </div>
            {tagline && <p className="text-xs text-gray-500">{tagline}</p>}
          </div>

          {/* QR Code */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">QR Code</p>
            <div className="inline-block bg-white border border-gray-200 rounded-lg p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt={`QR code for ${brandUrl}`}
                width={200}
                height={200}
                className="rounded"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Print this QR code on business cards or flyers to share your branded page.</p>
          </div>
        </div>
      )}
    </div>
  );
}
