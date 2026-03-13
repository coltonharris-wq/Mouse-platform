'use client';

import { useState, useEffect } from 'react';
import {
  Globe, Loader2, Target, Copy, CheckCircle2, X, Sparkles
} from 'lucide-react';
import type { ResellerBusiness } from '@/types/reseller-dashboard';

interface FunnelBuilderProps {
  resellerId: string;
  businessId?: string;
  businessName?: string;
  businessWebsite?: string;
  industry?: string;
  onCreated?: (funnel: { id: string }) => void;
}

const INDUSTRY_TEMPLATES = [
  { id: 'plumber', label: 'Plumber', icon: '\u{1F527}' },
  { id: 'dentist', label: 'Dentist', icon: '\u{1F9B7}' },
  { id: 'roofer', label: 'Roofer', icon: '\u{1F3E0}' },
  { id: 'salon', label: 'Hair Salon', icon: '\u{1F487}' },
  { id: 'attorney', label: 'Attorney', icon: '\u{2696}\u{FE0F}' },
  { id: 'restaurant', label: 'Restaurant', icon: '\u{1F355}' },
  { id: 'contractor', label: 'Contractor', icon: '\u{1F528}' },
  { id: 'vet', label: 'Vet', icon: '\u{1F43E}' },
  { id: 'gym', label: 'Gym', icon: '\u{1F4AA}' },
  { id: 'cleaning', label: 'Cleaning', icon: '\u{1F9F9}' },
  { id: 'auto', label: 'Auto Repair', icon: '\u{1F697}' },
];

const TEMPLATE_DEFAULTS: Record<string, { headline: string; subheadline: string; cta: string; services: string[] }> = {
  plumber: { headline: 'Need a Plumber? Free Quote in 60 Seconds', subheadline: 'Licensed, insured, and trusted by local homeowners', cta: 'Get Your Free Quote', services: ['Drain cleaning', 'Water heater repair', 'Pipe repair', 'Emergency service', 'Bathroom remodeling'] },
  dentist: { headline: 'New Patient Special — Free Exam & X-Rays', subheadline: 'Gentle, modern dentistry for the whole family', cta: 'Book Your Free Exam', services: ['General dentistry', 'Teeth whitening', 'Invisalign', 'Emergency dental', 'Cosmetic dentistry'] },
  roofer: { headline: 'Free Roof Inspection — No Obligation', subheadline: 'Licensed roofers protecting your home since day one', cta: 'Schedule Free Inspection', services: ['Roof repair', 'Full replacement', 'Storm damage', 'Gutter installation', 'Free estimates'] },
  salon: { headline: 'Book Your Next Look — New Client Discount', subheadline: 'Expert stylists, relaxing atmosphere, stunning results', cta: 'Book Now', services: ['Haircuts & styling', 'Color & highlights', 'Blowouts', 'Extensions', 'Bridal services'] },
  restaurant: { headline: 'Order Online — Fresh, Fast, Delicious', subheadline: 'Local favorite serving the community with love', cta: 'Order Now', services: ['Dine-in', 'Takeout', 'Delivery', 'Catering', 'Private events'] },
  auto: { headline: 'Honest Auto Repair — Free Diagnostic Check', subheadline: 'ASE-certified mechanics you can trust', cta: 'Get Your Free Check', services: ['Oil changes', 'Brake repair', 'Engine diagnostics', 'Transmission', 'AC repair'] },
  attorney: { headline: 'Free Legal Consultation — Protect Your Rights', subheadline: 'Experienced attorneys fighting for you', cta: 'Schedule Free Consultation', services: ['Personal injury', 'Family law', 'Criminal defense', 'Estate planning', 'Business law'] },
  contractor: { headline: 'Free Project Estimate — Quality Guaranteed', subheadline: 'Licensed contractors building your dream', cta: 'Get Your Free Estimate', services: ['Home remodeling', 'Kitchen & bath', 'Additions', 'Decks & patios', 'Commercial buildout'] },
  gym: { headline: 'Start Your Fitness Journey — Free Trial Week', subheadline: 'State-of-the-art equipment, expert trainers', cta: 'Claim Free Trial', services: ['Personal training', 'Group classes', 'Weight training', 'Cardio', 'Nutrition coaching'] },
  cleaning: { headline: 'Spotless Home Guaranteed — Free Quote', subheadline: 'Trusted, insured, and background-checked cleaners', cta: 'Get Your Free Quote', services: ['Deep cleaning', 'Regular service', 'Move in/out', 'Office cleaning', 'Post-construction'] },
  vet: { headline: 'New Pet? First Visit Free', subheadline: 'Compassionate care for your furry family members', cta: 'Book Free Visit', services: ['Wellness exams', 'Vaccinations', 'Surgery', 'Dental care', 'Emergency care'] },
};

const LEAD_PLANS = [
  { id: 'starter', label: 'Starter', leads: 10, suggested: 49700, base: 19700 },
  { id: 'growth', label: 'Growth', leads: 25, suggested: 99700, base: 39700, popular: true },
  { id: 'scale', label: 'Scale', leads: 60, suggested: 199700, base: 79700 },
];

const CTA_OPTIONS = ['Get Your Free Quote', 'Book Now', 'Call Us Today', 'Schedule a Free Consultation', 'Get Started'];

export default function FunnelBuilder({ resellerId, businessId, businessName: initialBizName, businessWebsite: initialWebsite, industry: initialIndustry, onCreated }: FunnelBuilderProps) {
  const [businesses, setBusinesses] = useState<ResellerBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(businessId || '');
  const [businessName, setBusinessName] = useState(initialBizName || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsite || '');
  const [city, setCity] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const [template, setTemplate] = useState(initialIndustry || '');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('Get Your Free Quote');
  const [services, setServices] = useState('');
  const [testimonial, setTestimonial] = useState('');
  const [brandColor, setBrandColor] = useState('#0D9488');

  // Capture fields
  const [captureFields, setCaptureFields] = useState({ name: true, phone: true, email: true, address: false, budget: false, preferred_time: false });

  // Follow-up
  const [autoText, setAutoText] = useState(true);
  const [autoEmail, setAutoEmail] = useState(true);
  const [autoCall, setAutoCall] = useState(false);

  // Ad copy
  const [adCopy, setAdCopy] = useState<{ google?: { headlines: string[]; descriptions: string[] }; facebook?: string; instagram?: string } | null>(null);
  const [generatingAds, setGeneratingAds] = useState(false);
  const [adCopied, setAdCopied] = useState<string | null>(null);

  // Pricing
  const [leadPlan, setLeadPlan] = useState('growth');
  const [resellerPrice, setResellerPrice] = useState(99700);

  // Preview
  const [previewHtml, setPreviewHtml] = useState('');
  const [generatingPage, setGeneratingPage] = useState(false);

  // Submit
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    if (!resellerId) return;
    fetch(`/api/reseller/businesses?reseller_id=${resellerId}`)
      .then((r) => r.json())
      .then((d) => setBusinesses(d.businesses || []))
      .catch(() => {});
  }, [resellerId]);

  // Auto-fill from template
  useEffect(() => {
    if (template && TEMPLATE_DEFAULTS[template]) {
      const t = TEMPLATE_DEFAULTS[template];
      if (!headline) setHeadline(city ? t.headline.replace(/\?/, ` in ${city}?`) : t.headline);
      if (!subheadline) setSubheadline(t.subheadline);
      if (!ctaText || ctaText === 'Get Your Free Quote') setCtaText(t.cta);
      if (!services) setServices(t.services.join(', '));
    }
  }, [template]);

  const handleAnalyze = async () => {
    if (!websiteUrl) return;
    setAnalyzing(true);
    setError(null);
    try {
      let url = websiteUrl.trim();
      if (!url.startsWith('http')) url = 'https://' + url;
      const res = await fetch('/api/reseller/voice/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.business_name && !businessName) setBusinessName(data.business_name);
      if (data.services?.length) setServices(data.services.join(', '));
      if (data.suggested_greeting) setTestimonial('');
    } catch { setError('Failed to analyze website'); }
    setAnalyzing(false);
  };

  const handleGenerateAds = async () => {
    setGeneratingAds(true);
    try {
      const res = await fetch('/api/reseller/lead-funnels/generate-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          industry: template,
          city,
          services: services.split(',').map((s) => s.trim()).filter(Boolean),
          usps: [subheadline].filter(Boolean),
        }),
      });
      const data = await res.json();
      if (res.ok) setAdCopy(data);
      else setError(data.error || 'Ad generation failed');
    } catch { setError('Failed to generate ads'); }
    setGeneratingAds(false);
  };

  const handlePreview = async () => {
    setGeneratingPage(true);
    try {
      const res = await fetch('/api/reseller/lead-funnels/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline, subheadline, cta_text: ctaText,
          business_name: businessName,
          services: services.split(',').map((s) => s.trim()).filter(Boolean),
          testimonial, capture_fields: Object.entries(captureFields).filter(([, v]) => v).map(([k]) => k),
          brand_color: brandColor, industry_template: template,
        }),
      });
      const data = await res.json();
      if (data.html) {
        setPreviewHtml(data.html);
        const win = window.open('', '_blank');
        if (win) { win.document.write(data.html); win.document.close(); }
      }
    } catch { setError('Failed to generate preview'); }
    setGeneratingPage(false);
  };

  const handleLaunch = async () => {
    if (!headline || !template || !businessName) {
      setError('Please fill in business name, select a template, and write a headline.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      // Generate page HTML first
      const pageRes = await fetch('/api/reseller/lead-funnels/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline, subheadline, cta_text: ctaText, business_name: businessName,
          services: services.split(',').map((s) => s.trim()).filter(Boolean),
          testimonial, capture_fields: Object.entries(captureFields).filter(([, v]) => v).map(([k]) => k),
          brand_color: brandColor, industry_template: template,
        }),
      });
      const pageData = await pageRes.json();

      // Create funnel
      const res = await fetch('/api/reseller/lead-funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reseller_id: resellerId,
          business_id: selectedBusinessId || undefined,
          business_name: businessName,
          industry_template: template,
          headline, subheadline, cta_text: ctaText,
          services: services.split(',').map((s) => s.trim()).filter(Boolean),
          testimonial,
          capture_fields: Object.entries(captureFields).filter(([, v]) => v).map(([k]) => k),
          follow_up_config: { auto_text: autoText, auto_email: autoEmail, auto_call: autoCall },
          ad_copy: adCopy || undefined,
          lead_plan: leadPlan,
          monthly_target: LEAD_PLANS.find((p) => p.id === leadPlan)?.leads || 10,
          reseller_price_cents: resellerPrice,
          brand_color: brandColor,
          landing_page_html: pageData.html || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create funnel'); return; }

      // Launch it
      if (data.id) {
        await fetch(`/api/reseller/lead-funnels/${data.id}/launch`, { method: 'POST' });
      }
      setCreated(true);
      onCreated?.(data);
    } catch { setError('Failed to launch funnel'); }
    setCreating(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setAdCopied(id);
    setTimeout(() => setAdCopied(null), 2000);
  };

  const plan = LEAD_PLANS.find((p) => p.id === leadPlan) || LEAD_PLANS[1];
  const profitCents = resellerPrice - plan.base;

  if (created) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Funnel Launched!</h2>
        <p className="text-gray-500 mb-6">Your lead generation funnel for {businessName} is now active.</p>
        <button onClick={() => { setCreated(false); setHeadline(''); setTemplate(''); setBusinessName(''); }} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
          Build Another Funnel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Lead Gen Funnel Builder</h2>
              <p className="text-sm text-gray-500">Create a lead funnel that captures customers automatically</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Business Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Business</label>
            <select value={selectedBusinessId} onChange={(e) => { setSelectedBusinessId(e.target.value); if (e.target.value) { const b = businesses.find((bz) => bz.id === e.target.value); if (b) setBusinessName(b.business_name); } }} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
              <option value="">New business</option>
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.business_name}</option>)}
            </select>
          </div>

          {/* Industry Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry Template</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setTemplate(t.id)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${template === t.id ? 'bg-purple-50 border-purple-300 text-purple-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Business Info */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Website</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="www.example.com" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <button onClick={handleAnalyze} disabled={analyzing || !websiteUrl} className="px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shrink-0">
                  {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : 'Analyze'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Mike's Plumbing" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Service Area</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Wilmington, NC" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
          </div>

          {/* Landing Page Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Headline</label>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Need a Plumber in Wilmington? Free Quote in 60 Seconds" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subheadline</label>
            <input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} placeholder="Licensed, insured, trusted by 500+ local homes" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Call to Action</label>
              <select value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                {CTA_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
                <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Key Services (comma-separated)</label>
            <input value={services} onChange={(e) => setServices(e.target.value)} placeholder="Drain cleaning, Water heater repair, Pipe repair" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Testimonial (optional)</label>
            <textarea value={testimonial} onChange={(e) => setTestimonial(e.target.value)} rows={2} placeholder='"Mike fixed our leak in an hour. Best plumber in town!" — Sarah J.' className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>

          {/* Capture Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lead Capture Fields</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(captureFields).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={val} onChange={(e) => setCaptureFields({ ...captureFields, [key]: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Follow-up Automation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Follow-Up Automation</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={autoText} onChange={(e) => setAutoText(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" /><span className="text-sm text-gray-700">Auto-text lead within 60 seconds</span></label>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={autoEmail} onChange={(e) => setAutoEmail(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" /><span className="text-sm text-gray-700">Auto-email with business info</span></label>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={autoCall} onChange={(e) => setAutoCall(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" /><span className="text-sm text-gray-700">Auto-call to qualify (requires Voice Agent)</span></label>
            </div>
          </div>

          {/* Ad Copy Generator */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Ad Copy Generator</label>
              <button onClick={handleGenerateAds} disabled={generatingAds || !businessName || !template} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                {generatingAds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generatingAds ? 'Generating...' : 'Generate Ad Copy'}
              </button>
            </div>
            {adCopy && (
              <div className="space-y-3">
                {adCopy.google && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Google Ads</span>
                      <button onClick={() => copyToClipboard([...(adCopy.google?.headlines || []), ...(adCopy.google?.descriptions || [])].join('\n'), 'google')} className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                        <Copy className="w-3 h-3" />{adCopied === 'google' ? 'Copied!' : 'Copy All'}
                      </button>
                    </div>
                    {adCopy.google.headlines?.map((h, i) => <p key={i} className="text-sm text-gray-800 font-medium">{h}</p>)}
                    {adCopy.google.descriptions?.map((d, i) => <p key={i} className="text-sm text-gray-600 mt-1">{d}</p>)}
                  </div>
                )}
                {adCopy.facebook && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Facebook Ad</span>
                      <button onClick={() => copyToClipboard(adCopy.facebook || '', 'fb')} className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                        <Copy className="w-3 h-3" />{adCopied === 'fb' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{adCopy.facebook}</p>
                  </div>
                )}
                {adCopy.instagram && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Instagram Ad</span>
                      <button onClick={() => copyToClipboard(adCopy.instagram || '', 'ig')} className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                        <Copy className="w-3 h-3" />{adCopied === 'ig' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{adCopy.instagram}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lead Plan</label>
            <div className="grid grid-cols-3 gap-3">
              {LEAD_PLANS.map((p) => (
                <button key={p.id} onClick={() => { setLeadPlan(p.id); setResellerPrice(p.suggested); }} className={`relative p-4 rounded-lg border text-left transition-colors ${leadPlan === p.id ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                  {p.popular && <span className="absolute -top-2 right-2 text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">Popular</span>}
                  <p className="font-semibold text-gray-900 text-sm">{p.label}</p>
                  <p className="text-xs text-gray-500">{p.leads} leads/mo</p>
                  <p className="text-xs text-gray-400 mt-1">Suggested ${(p.suggested / 100).toFixed(0)}/mo</p>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Your Price to Customer</label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">$</span>
                  <input type="number" value={Math.round(resellerPrice / 100)} onChange={(e) => setResellerPrice(Number(e.target.value) * 100)} className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <span className="text-sm text-gray-500">/mo</span>
                </div>
              </div>
              <div className="text-sm text-green-700 font-medium mt-4">
                Your Profit: ${(profitCents / 100).toFixed(0)}/mo
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button onClick={handlePreview} disabled={generatingPage || !headline} className="px-5 py-2.5 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2">
            {generatingPage ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Preview Landing Page
          </button>
          <button onClick={handleLaunch} disabled={creating || !headline || !template || !businessName} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
            {creating ? <><Loader2 className="w-4 h-4 animate-spin" />Launching...</> : 'Launch Funnel'}
          </button>
        </div>
      </div>
    </div>
  );
}
