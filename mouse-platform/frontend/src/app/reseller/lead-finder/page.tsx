'use client';

import { useEffect, useState } from 'react';
import {
  Search, Download, Plus, MapPin, Phone as PhoneIcon, Globe, Building2,
  Star, ChevronDown, ChevronUp, Copy, Target, Mic, Clock, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import type { SavedLead, LeadSearchResult, LeadIntel, OnlinePresence } from '@/types/reseller-dashboard';

type Tab = 'search' | 'saved' | 'sequences';

const QUICK_PICKS = [
  { label: 'Restaurant', icon: '\u{1F355}', query: 'restaurant' },
  { label: 'Auto Repair', icon: '\u{1F527}', query: 'auto repair' },
  { label: 'Hair Salon', icon: '\u{1F487}', query: 'hair salon' },
  { label: 'Plumber', icon: '\u{1F527}', query: 'plumber' },
  { label: 'Dentist', icon: '\u{1F9B7}', query: 'dentist' },
  { label: 'Gym', icon: '\u{1F4AA}', query: 'gym' },
  { label: 'Roofer', icon: '\u{1F3E0}', query: 'roofer' },
  { label: 'Cleaning', icon: '\u{1F9F9}', query: 'cleaning service' },
  { label: 'Electrician', icon: '\u{26A1}', query: 'electrician' },
  { label: 'Vet', icon: '\u{1F43E}', query: 'veterinarian' },
];

const PIPELINE_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacting', label: 'Contacting', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'pitched', label: 'Pitched', color: 'bg-purple-100 text-purple-800' },
  { value: 'demo_sent', label: 'Demo Sent', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-yellow-500">
      <Star className="w-3.5 h-3.5 fill-current" />
      <span className="text-sm font-medium text-gray-700">{rating?.toFixed(1) || '-'}</span>
    </span>
  );
}

export default function LeadFinderPage() {
  const [tab, setTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<LeadSearchResult[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [savedLeads, setSavedLeads] = useState<SavedLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [copiedPitch, setCopiedPitch] = useState<number | null>(null);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  useEffect(() => {
    if (!resellerId) { setLoadingLeads(false); return; }
    fetch(`/api/reseller/leads?reseller_id=${resellerId}`)
      .then((r) => r.json())
      .then((d) => setSavedLeads(d.leads || []))
      .catch(() => {})
      .finally(() => setLoadingLeads(false));
  }, [resellerId]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setExpandedIdx(null);
    try {
      const params = new URLSearchParams({ query: query.trim(), reseller_id: resellerId });
      if (location.trim()) params.set('location', location.trim());
      const res = await fetch(`/api/reseller/leads/search?${params}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch { setResults([]); }
    setSearching(false);
  };

  const handleQuickPick = (q: string) => {
    setQuery(q);
    setTimeout(() => {
      const btn = document.getElementById('searchBtn');
      btn?.click();
    }, 100);
  };

  const handleSaveLead = async (result: LeadSearchResult, index: number) => {
    setSavingId(index);
    try {
      const res = await fetch('/api/reseller/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reseller_id: resellerId,
          company_name: result.name,
          industry: result.industry,
          location: result.address,
          phone: result.phone,
          website: result.website,
          source: 'search',
          intel: result.intel,
          online_presence: result.online_presence,
          estimated_monthly_value: parseInt(result.intel?.estimated_value?.replace(/[^0-9]/g, '') || '0') * 100,
          place_id: result.place_id,
        }),
      });
      const data = await res.json();
      if (data.id) setSavedLeads((prev) => [data, ...prev]);
    } catch { /* ignore */ }
    setSavingId(null);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/reseller/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setSavedLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: status as SavedLead['status'] } : l));
    } catch { /* ignore */ }
  };

  const handleExport = () => {
    window.open(`/api/reseller/leads/export?reseller_id=${resellerId}`, '_blank');
  };

  const copyPitch = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(idx);
    setTimeout(() => setCopiedPitch(null), 2000);
  };

  const statusColorMap = Object.fromEntries(PIPELINE_STATUSES.map((s) => [s.value, s.color]));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Leads</h1>
          <p className="text-gray-500 text-sm mt-1">Search businesses, get sales intel, and build your pipeline.</p>
        </div>
        {tab === 'saved' && savedLeads.length > 0 && (
          <button onClick={handleExport} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {(['search', 'saved', 'sequences'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'search' && <><Search className="w-4 h-4 inline mr-1.5" />Search</>}
            {t === 'saved' && <>Saved ({savedLeads.length})</>}
            {t === 'sequences' && <>Sequences</>}
          </button>
        ))}
      </div>

      {/* SEARCH TAB */}
      {tab === 'search' && (
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Find Businesses to Pitch</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="What kind of business?" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
              </div>
              <div className="relative flex-1 sm:max-w-xs">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Wilmington, NC" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
              </div>
              <button id="searchBtn" onClick={handleSearch} disabled={searching || !query.trim()} className="bg-[#0F6B6E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#0B5456] whitespace-nowrap">
                {searching ? 'Searching & analyzing...' : 'Search'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PICKS.map((p) => (
                <button key={p.query} onClick={() => handleQuickPick(p.query)} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {searching && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Searching and analyzing businesses...</p>
              <p className="text-gray-400 text-xs mt-1">Scraping websites, generating sales intelligence...</p>
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-4">
              {results.map((r, i) => {
                const expanded = expandedIdx === i;
                const intel = r.intel;
                const presence = r.online_presence;
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Collapsed view */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{r.name}</h3>
                            {r.rating > 0 && <StarRating rating={r.rating} />}
                            {r.review_count > 0 && <span className="text-xs text-gray-400">({r.review_count})</span>}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                            {r.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{r.address}</span>}
                            {r.phone && <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-teal-700 hover:underline"><PhoneIcon className="w-3.5 h-3.5" />{r.phone}</a>}
                            {r.website && <a href={r.website.startsWith('http') ? r.website : `https://${r.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-teal-700 hover:underline"><Globe className="w-3.5 h-3.5" />{r.website.replace(/^https?:\/\//, '').slice(0, 30)}</a>}
                          </div>
                          {/* Quick intel preview */}
                          {intel?.sales_angles?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {intel.sales_angles.slice(0, 2).map((a, j) => (
                                <p key={j} className="text-sm text-gray-600 flex items-start gap-1.5">
                                  <span className="text-teal-600 shrink-0 mt-0.5">&#x2022;</span> {a}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button onClick={() => handleSaveLead(r, i)} disabled={savingId === i} className="flex items-center gap-1.5 px-3 py-1.5 border border-teal-600 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 disabled:opacity-50">
                            <Plus className="w-3.5 h-3.5" />{savingId === i ? 'Saving...' : 'Save Lead'}
                          </button>
                          {intel?.estimated_value && (
                            <span className="text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full">{intel.estimated_value}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setExpandedIdx(expanded ? null : i)} className="mt-2 text-xs text-teal-700 font-medium hover:underline flex items-center gap-1">
                        {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide Intel</> : <><ChevronDown className="w-3.5 h-3.5" />Show Full Intel</>}
                      </button>
                    </div>

                    {/* Expanded view */}
                    {expanded && intel && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                        {/* Owner / Decision Maker */}
                        {intel.owner_name && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Owner / Decision Maker</p>
                            <p className="text-sm text-gray-900 font-medium">{intel.owner_name}</p>
                            {intel.owner_source && <p className="text-xs text-gray-400">Found via: {intel.owner_source}</p>}
                          </div>
                        )}

                        {/* Business Intel */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Business Intel</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                            <div className="bg-white rounded-lg p-2 border border-gray-200">
                              <p className="text-xs text-gray-400">Employees</p>
                              <p className="font-medium text-gray-800">{intel.estimated_employees}</p>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-200">
                              <p className="text-xs text-gray-400">Revenue</p>
                              <p className="font-medium text-gray-800">{intel.estimated_revenue}</p>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-200">
                              <p className="text-xs text-gray-400">Website</p>
                              <p className="font-medium text-gray-800 capitalize">{presence?.website_quality || 'unknown'}</p>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-200">
                              <p className="text-xs text-gray-400">Social</p>
                              <p className="font-medium text-gray-800">{presence?.social_activity || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs">
                            {!presence?.has_online_booking && <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full">No booking</span>}
                            {!presence?.has_chat_widget && <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full">No chat widget</span>}
                            {presence?.has_contact_form && <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full">Has contact form</span>}
                            {intel.missing_tools?.map((t, j) => <span key={j} className="bg-orange-50 text-orange-600 px-2 py-1 rounded-full">Needs: {t}</span>)}
                          </div>
                        </div>

                        {/* Sales Angles */}
                        {intel.sales_angles?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sales Angles</p>
                            <div className="space-y-1.5">
                              {intel.sales_angles.map((a, j) => (
                                <p key={j} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-teal-600 font-bold shrink-0">{j + 1}.</span> {a}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Gatekeeper Strategy */}
                        {intel.gatekeeper_strategy && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gatekeeper Strategy</p>
                            <p className="text-sm text-gray-700">{intel.gatekeeper_strategy}</p>
                            {intel.best_call_time && <p className="text-xs text-gray-500 mt-1"><Clock className="w-3 h-3 inline mr-1" />Best call time: {intel.best_call_time}</p>}
                          </div>
                        )}

                        {/* Suggested Pitch */}
                        {intel.suggested_pitch && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggested Pitch</p>
                              <button onClick={() => copyPitch(intel.suggested_pitch, i)} className="text-xs text-teal-700 hover:underline flex items-center gap-1">
                                <Copy className="w-3 h-3" />{copiedPitch === i ? 'Copied!' : 'Copy Pitch'}
                              </button>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                              <p className="text-sm text-gray-700 italic leading-relaxed">&ldquo;{intel.suggested_pitch}&rdquo;</p>
                            </div>
                          </div>
                        )}

                        {/* Recommended Products */}
                        {intel.recommended_products?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommended Products</p>
                            <div className="flex flex-wrap gap-2">
                              {intel.recommended_products.map((p) => (
                                <span key={p} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                                  {p === 'receptionist' ? '\u{1F4DE} AI Receptionist' : p === 'lead_funnel' ? '\u{1F3AF} Lead Funnel' : '\u{1F42D} King Mouse'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                          <button onClick={() => handleSaveLead(r, i)} disabled={savingId === i} className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                            <Plus className="w-3.5 h-3.5" />{savingId === i ? 'Saving...' : 'Save Lead'}
                          </button>
                          <Link href={`/reseller/voice?business_name=${encodeURIComponent(r.name)}&phone=${encodeURIComponent(r.phone)}&website=${encodeURIComponent(r.website)}`} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Mic className="w-3.5 h-3.5" />Build Voice Agent
                          </Link>
                          <Link href={`/reseller/lead-funnels?business_name=${encodeURIComponent(r.name)}&website=${encodeURIComponent(r.website)}&industry=${encodeURIComponent(r.industry)}`} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Target className="w-3.5 h-3.5" />Create Funnel
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!searching && results.length === 0 && query && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No results found. Try a different search.</p>
            </div>
          )}
        </div>
      )}

      {/* SAVED LEADS TAB */}
      {tab === 'saved' && (
        <div>
          {loadingLeads ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
          ) : savedLeads.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No saved leads yet. Search for businesses to save them.</p>
            </div>
          ) : (
            <>
              {/* Pipeline summary */}
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {PIPELINE_STATUSES.map((s) => {
                  const count = savedLeads.filter((l) => l.status === s.value).length;
                  return (
                    <div key={s.value} className={`shrink-0 px-4 py-2 rounded-lg border ${s.color} border-current/20 text-center min-w-[100px]`}>
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-xs">{s.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                {savedLeads.map((lead) => {
                  const leadExpanded = expandedLeadId === lead.id;
                  const intel = lead.intel;
                  return (
                    <div key={lead.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-medium text-gray-900 text-sm">{lead.company_name}</h3>
                            {lead.industry && <span className="text-xs text-gray-400">{lead.industry}</span>}
                          </div>
                          <p className="text-xs text-gray-500">{lead.location || '-'}</p>
                          {intel?.estimated_value && <span className="text-xs text-green-700 font-medium">{intel.estimated_value}</span>}
                        </div>
                        <select value={lead.status} onChange={(e) => handleUpdateStatus(lead.id, e.target.value)} className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColorMap[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                          {PIPELINE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <button onClick={() => setExpandedLeadId(leadExpanded ? null : lead.id)} className="p-1 text-gray-400 hover:text-gray-600">
                          {leadExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                      {leadExpanded && intel && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {lead.phone && <div><span className="text-gray-400">Phone: </span><a href={`tel:${lead.phone}`} className="text-teal-700">{lead.phone}</a></div>}
                            {lead.website && <div><span className="text-gray-400">Website: </span><a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" className="text-teal-700">{lead.website}</a></div>}
                            {intel.owner_name && <div><span className="text-gray-400">Owner: </span><span className="text-gray-900">{intel.owner_name}</span></div>}
                            {intel.estimated_employees && <div><span className="text-gray-400">Size: </span><span className="text-gray-900">{intel.estimated_employees}</span></div>}
                          </div>
                          {intel.sales_angles?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Sales Angles</p>
                              {intel.sales_angles.slice(0, 3).map((a, j) => (
                                <p key={j} className="text-sm text-gray-700">{j + 1}. {a}</p>
                              ))}
                            </div>
                          )}
                          {intel.suggested_pitch && (
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                              <p className="text-sm text-gray-700 italic">&ldquo;{intel.suggested_pitch}&rdquo;</p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Link href={`/reseller/voice?business_name=${encodeURIComponent(lead.company_name)}&phone=${encodeURIComponent(lead.phone || '')}&website=${encodeURIComponent(lead.website || '')}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                              <Mic className="w-3 h-3" />Build Voice Agent
                            </Link>
                            <Link href={`/reseller/lead-funnels?business_name=${encodeURIComponent(lead.company_name)}&website=${encodeURIComponent(lead.website || '')}&industry=${encodeURIComponent(lead.industry || '')}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                              <Target className="w-3 h-3" />Create Funnel
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* SEQUENCES TAB */}
      {tab === 'sequences' && (
        <div className="max-w-xl mx-auto text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Outreach Sequences</h2>
          <p className="text-gray-500 text-sm mb-6">Automate your follow-up with saved leads. Coming soon.</p>
          <div className="text-left bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <p className="text-sm text-gray-600">Planned sequences:</p>
            <p className="text-sm text-gray-500">&bull; Cold Call &rarr; Voicemail &rarr; Text &rarr; Email (7-day)</p>
            <p className="text-sm text-gray-500">&bull; Demo Sent &rarr; Follow-up Call &rarr; Closing Call (5-day)</p>
            <p className="text-sm text-gray-500">&bull; Lost Lead Re-engage (30-day nurture)</p>
          </div>
        </div>
      )}
    </div>
  );
}
