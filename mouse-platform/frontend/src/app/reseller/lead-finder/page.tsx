'use client';

import { useEffect, useState } from 'react';
import { Search, Download, Plus, MapPin, Phone, Globe, Building2 } from 'lucide-react';
import type { SavedLead, LeadSearchResult } from '@/types/reseller-dashboard';

type Tab = 'search' | 'saved';

export default function LeadFinderPage() {
  const [tab, setTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<LeadSearchResult[]>([]);
  const [savedLeads, setSavedLeads] = useState<SavedLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

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
    try {
      const params = new URLSearchParams({ query: query.trim(), reseller_id: resellerId });
      if (location.trim()) params.set('location', location.trim());
      const res = await fetch(`/api/reseller/leads/search?${params}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setSearching(false);
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
        }),
      });
      const data = await res.json();
      if (data.id) {
        setSavedLeads((prev) => [data, ...prev]);
      }
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

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    interested: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Finder</h1>
          <p className="text-gray-500 text-sm mt-1">Search for businesses and save them as leads.</p>
        </div>
        {tab === 'saved' && savedLeads.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('search')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'search' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className="w-4 h-4 inline mr-1.5" />
          Search
        </button>
        <button
          onClick={() => setTab('saved')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Saved ({savedLeads.length})
        </button>
      </div>

      {tab === 'search' && (
        <div>
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Industry or business type (e.g., appliance repair)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="City, state (e.g., Wilmington, NC)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="bg-[#0F6B6E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#0B5456] whitespace-nowrap"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{r.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      {r.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {r.address}
                        </span>
                      )}
                      {r.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {r.phone}
                        </span>
                      )}
                      {r.website && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> {r.website}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveLead(r, i)}
                    disabled={savingId === i}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-teal-600 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 disabled:opacity-50 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {savingId === i ? 'Saving...' : 'Save Lead'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && !searching && query && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No results found. Try a different search.</p>
            </div>
          )}
        </div>
      )}

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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Company</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Location</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Phone</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right hidden sm:table-cell">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {savedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm">{lead.company_name}</p>
                          <p className="text-xs text-gray-400">{lead.industry || '-'}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{lead.location || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{lead.phone || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="interested">Interested</option>
                            <option value="converted">Converted</option>
                            <option value="lost">Lost</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-400 hidden sm:table-cell">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
