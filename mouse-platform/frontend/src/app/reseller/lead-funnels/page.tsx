'use client';

import { useEffect, useState } from 'react';
import { Target, Loader2, Pause, Play, Eye, Pencil } from 'lucide-react';
import FunnelBuilder from '@/components/reseller/FunnelBuilder';

interface Funnel {
  id: string;
  business_name: string;
  industry_template: string;
  status: 'draft' | 'active' | 'paused';
  leads_this_month: number;
  monthly_target: number;
  reseller_price_cents: number;
  base_cost_cents: number;
  landing_page_html: string;
  created_at: string;
}

type View = 'builder' | 'manage';

export default function LeadFunnelsPage() {
  const [view, setView] = useState<View>('builder');
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loadingFunnels, setLoadingFunnels] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Query params for pre-filling
  const [initBusinessId, setInitBusinessId] = useState('');
  const [initBusinessName, setInitBusinessName] = useState('');
  const [initWebsite, setInitWebsite] = useState('');
  const [initIndustry, setInitIndustry] = useState('');

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('business_id')) setInitBusinessId(params.get('business_id')!);
    if (params.get('business_name')) setInitBusinessName(params.get('business_name')!);
    if (params.get('website')) setInitWebsite(params.get('website')!);
    if (params.get('industry')) setInitIndustry(params.get('industry')!);
  }, []);

  const loadFunnels = async () => {
    if (!resellerId) return;
    setLoadingFunnels(true);
    try {
      const res = await fetch(`/api/reseller/lead-funnels?reseller_id=${resellerId}`);
      const data = await res.json();
      setFunnels(data.funnels || []);
    } catch { /* ignore */ }
    setLoadingFunnels(false);
  };

  useEffect(() => {
    if (view === 'manage') loadFunnels();
  }, [view, resellerId]);

  const handleToggle = async (funnel: Funnel) => {
    setTogglingId(funnel.id);
    try {
      await fetch(`/api/reseller/lead-funnels/${funnel.id}/pause`, { method: 'POST' });
      await loadFunnels();
    } catch { /* ignore */ }
    setTogglingId(null);
  };

  const handlePreview = (funnel: Funnel) => {
    if (funnel.landing_page_html) {
      const win = window.open('', '_blank');
      if (win) { win.document.write(funnel.landing_page_html); win.document.close(); }
    }
  };

  const formatCents = (c: number) => '$' + (c / 100).toFixed(0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Funnels</h1>
          <p className="text-gray-500 text-sm mt-1">Build and manage lead generation funnels for your customers</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setView('builder')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'builder' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Builder
          </button>
          <button onClick={() => setView('manage')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'manage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Manage
          </button>
        </div>
      </div>

      {view === 'builder' && (
        <FunnelBuilder
          resellerId={resellerId}
          businessId={initBusinessId}
          businessName={initBusinessName}
          businessWebsite={initWebsite}
          industry={initIndustry}
          onCreated={() => { setView('manage'); loadFunnels(); }}
        />
      )}

      {view === 'manage' && (
        <>
          {loadingFunnels ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : funnels.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Target className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="mb-4">No funnels created yet.</p>
              <button onClick={() => setView('builder')} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                Build Your First Funnel
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Business</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Template</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center hidden sm:table-cell">Leads</th>
                      <th className="px-4 py-3 text-right hidden sm:table-cell">Price</th>
                      <th className="px-4 py-3 text-right hidden sm:table-cell">Profit</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {funnels.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{f.business_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize hidden sm:table-cell">{f.industry_template}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                            f.status === 'active' ? 'bg-green-100 text-green-700'
                            : f.status === 'paused' ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${f.status === 'active' ? 'bg-green-500' : f.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                            {f.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm hidden sm:table-cell">
                          {f.leads_this_month}/{f.monthly_target}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600 hidden sm:table-cell">{formatCents(f.reseller_price_cents)}/mo</td>
                        <td className="px-4 py-3 text-right text-sm text-green-700 font-medium hidden sm:table-cell">{formatCents(f.reseller_price_cents - f.base_cost_cents)}/mo</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {f.landing_page_html && (
                              <button onClick={() => handlePreview(f)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Preview">
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleToggle(f)} disabled={togglingId === f.id} className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg disabled:opacity-50" title={f.status === 'active' ? 'Pause' : 'Resume'}>
                              {togglingId === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : f.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
