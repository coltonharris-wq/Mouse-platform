'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign, TrendingUp, CalendarCheck, Percent,
  Plus, ArrowRight, X, User, Building2, Briefcase,
  ChevronRight, Phone, Mail, StickyNote, Sparkles
} from 'lucide-react';

interface PipelineDeal {
  id: string;
  lead_name: string;
  business_name: string;
  niche: string;
  industry: string;
  phone: string;
  email: string;
  stage: 'prospecting' | 'contacted' | 'demo_done' | 'closed' | 'lost';
  estimated_monthly: number;
  notes: string;
  lead_score: number;
  source: string;
  created_at: string;
}

type ActiveStage = 'prospecting' | 'contacted' | 'demo_done' | 'closed';

const STAGES: { key: ActiveStage; label: string; color: string; bg: string; border: string }[] = [
  { key: 'prospecting', label: 'Prospecting', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'contacted', label: 'Contacted', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { key: 'demo_done', label: 'Demo Done', color: 'text-[#F07020]', bg: 'bg-orange-50', border: 'border-orange-200' },
  { key: 'closed', label: 'Closed', color: 'text-[#1D9E75]', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const STAGE_BADGE: Record<string, string> = {
  prospecting: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  demo_done: 'bg-orange-100 text-[#F07020]',
  closed: 'bg-emerald-100 text-[#1D9E75]',
  lost: 'bg-red-100 text-red-700',
};

const STAGE_ORDER: ActiveStage[] = ['prospecting', 'contacted', 'demo_done', 'closed'];

function getNextStage(current: string): ActiveStage | null {
  const idx = STAGE_ORDER.indexOf(current as ActiveStage);
  if (idx === -1 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
}

function getStageLabelByKey(key: string): string {
  return STAGES.find((s) => s.key === key)?.label || key;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function PipelineTrackerPage() {
  const [deals, setDeals] = useState<PipelineDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New deal form state
  const [formLeadName, setFormLeadName] = useState('');
  const [formBusinessName, setFormBusinessName] = useState('');
  const [formNiche, setFormNiche] = useState('');
  const [formEstimatedMonthly, setFormEstimatedMonthly] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  const fetchDeals = () => {
    if (!resellerId) { setLoading(false); return; }
    fetch(`/api/reseller/pipeline?reseller_id=${resellerId}`)
      .then((r) => r.json())
      .then((data) => setDeals(data.deals || data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resellerId]);

  const moveToStage = async (dealId: string, newStage: ActiveStage) => {
    setMovingId(dealId);
    try {
      await fetch(`/api/reseller/pipeline/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
      );
    } catch { /* ignore */ }
    setMovingId(null);
  };

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLeadName.trim() || !formBusinessName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reseller/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reseller_id: resellerId,
          lead_name: formLeadName.trim(),
          business_name: formBusinessName.trim(),
          niche: formNiche.trim(),
          estimated_monthly: Math.round(parseFloat(formEstimatedMonthly || '0') * 100),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          notes: formNotes.trim(),
          stage: 'prospecting',
        }),
      });
      const newDeal = await res.json();
      if (newDeal.id) {
        setDeals((prev) => [newDeal, ...prev]);
      }
      resetForm();
      setShowModal(false);
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const resetForm = () => {
    setFormLeadName('');
    setFormBusinessName('');
    setFormNiche('');
    setFormEstimatedMonthly('');
    setFormPhone('');
    setFormEmail('');
    setFormNotes('');
  };

  // ----- Metrics -----
  const activeDeals = deals.filter((d) => d.stage !== 'lost');
  const totalPipelineValue = activeDeals.reduce((s, d) => s + d.estimated_monthly, 0);
  const closedDeals = deals.filter((d) => d.stage === 'closed');
  const closedValue = closedDeals.reduce((s, d) => s + d.estimated_monthly, 0);

  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  const closingThisWeek = deals.filter((d) => d.stage === 'demo_done')
    .reduce((s, d) => s + d.estimated_monthly, 0);

  const closeRate = deals.length > 0
    ? Math.round((closedDeals.length / deals.filter((d) => d.stage !== 'lost').length) * 100) || 0
    : 0;

  const projectedMonthly = closedValue + Math.round(closingThisWeek * (closeRate / 100));

  const metrics = [
    { label: 'Total Pipeline', value: formatCurrency(totalPipelineValue), icon: DollarSign, accent: 'bg-blue-50 text-blue-600' },
    { label: 'Closing This Week', value: formatCurrency(closingThisWeek), icon: CalendarCheck, accent: 'bg-orange-50 text-[#F07020]' },
    { label: 'Close Rate', value: `${closeRate}%`, icon: Percent, accent: 'bg-emerald-50 text-[#1D9E75]' },
    { label: 'Projected Monthly', value: formatCurrency(projectedMonthly), icon: TrendingUp, accent: 'bg-purple-50 text-purple-600' },
  ];

  // ----- Render -----
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#F07020' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1e2a3a' }}>Pipeline Tracker</h1>
          <p className="text-sm mt-1" style={{ color: '#7a7568' }}>
            Track your deals from prospect to close.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#F07020' }}
        >
          <Plus className="w-4 h-4" /> Add Deal
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-xl p-5" style={{ border: '1px solid #e4e0da' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm" style={{ color: '#7a7568' }}>{m.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#1e2a3a' }}>{m.value}</p>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.key);
          const stageTotal = stageDeals.reduce((s, d) => s + d.estimated_monthly, 0);

          return (
            <div key={stage.key} className="flex flex-col">
              {/* Column Header */}
              <div
                className={`flex items-center justify-between rounded-t-xl px-4 py-3 ${stage.bg}`}
                style={{ borderBottom: '2px solid', borderColor: stage.key === 'closed' ? '#1D9E75' : stage.key === 'demo_done' ? '#F07020' : undefined }}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${stage.color}`}>{stage.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_BADGE[stage.key]}`}>
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-xs font-medium" style={{ color: '#7a7568' }}>
                  {formatCurrency(stageTotal)}
                </span>
              </div>

              {/* Column Body */}
              <div
                className="flex-1 rounded-b-xl p-3 space-y-3 min-h-[200px]"
                style={{ backgroundColor: '#f7f5f0', border: '1px solid #e4e0da', borderTop: 'none' }}
              >
                {stageDeals.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Briefcase className="w-8 h-8 mb-2" style={{ color: '#d1cdc5' }} />
                    <p className="text-xs" style={{ color: '#a39e94' }}>No deals in this stage</p>
                  </div>
                )}

                {stageDeals.map((deal) => {
                  const nextStage = getNextStage(deal.stage);
                  const isMoving = movingId === deal.id;

                  return (
                    <div
                      key={deal.id}
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                      style={{ border: '1px solid #e4e0da' }}
                    >
                      {/* Deal Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate" style={{ color: '#1e2a3a' }}>
                            {deal.lead_name}
                          </p>
                          <p className="text-xs truncate" style={{ color: '#7a7568' }}>
                            {deal.business_name}
                          </p>
                        </div>
                        {deal.lead_score > 0 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Sparkles className="w-3 h-3 text-[#F07020]" />
                            <span className="text-xs font-medium text-[#F07020]">{deal.lead_score}</span>
                          </div>
                        )}
                      </div>

                      {/* Niche tag */}
                      {deal.niche && (
                        <span
                          className="inline-block text-xs px-2 py-0.5 rounded-full mb-2"
                          style={{ backgroundColor: '#f0ece4', color: '#6b6560' }}
                        >
                          {deal.niche}
                        </span>
                      )}

                      {/* Contact info */}
                      <div className="space-y-1 mb-3">
                        {deal.phone && (
                          <a href={`tel:${deal.phone}`} className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: '#F07020' }}>
                            <Phone className="w-3 h-3" /> {deal.phone}
                          </a>
                        )}
                        {deal.email && (
                          <a href={`mailto:${deal.email}`} className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: '#F07020' }}>
                            <Mail className="w-3 h-3" /> {deal.email}
                          </a>
                        )}
                      </div>

                      {/* Estimated Value */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs" style={{ color: '#7a7568' }}>Est. Monthly</span>
                        <span className="text-sm font-bold" style={{ color: '#1D9E75' }}>
                          {formatCurrency(deal.estimated_monthly)}
                        </span>
                      </div>

                      {/* Notes preview */}
                      {deal.notes && (
                        <div className="flex items-start gap-1.5 mb-3 p-2 rounded" style={{ backgroundColor: '#faf8f4' }}>
                          <StickyNote className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#a39e94' }} />
                          <p className="text-xs line-clamp-2" style={{ color: '#7a7568' }}>{deal.notes}</p>
                        </div>
                      )}

                      {/* Move button */}
                      {nextStage && (
                        <button
                          onClick={() => moveToStage(deal.id, nextStage)}
                          disabled={isMoving}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          style={{
                            backgroundColor: isMoving ? '#e4e0da' : '#FFF3EB',
                            color: '#F07020',
                            border: '1px solid #F0702033',
                          }}
                        >
                          {isMoving ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#F07020]" />
                              Moving...
                            </>
                          ) : (
                            <>
                              Move to {getStageLabelByKey(nextStage)} <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}

                      {/* Closed badge */}
                      {deal.stage === 'closed' && (
                        <div
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: '#E8F8F2', color: '#1D9E75' }}
                        >
                          Won
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {deals.length === 0 && !loading && (
        <div className="text-center py-16 mt-4">
          <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: '#d1cdc5' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#1e2a3a' }}>
            Your pipeline is empty
          </h3>
          <p className="text-sm mb-6" style={{ color: '#7a7568' }}>
            Start by adding your first deal to track it through the sales process.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#F07020' }}
          >
            <Plus className="w-4 h-4" /> Add Your First Deal
          </button>
        </div>
      )}

      {/* Add Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { setShowModal(false); resetForm(); }}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ border: '1px solid #e4e0da' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e4e0da' }}>
              <h2 className="text-lg font-bold" style={{ color: '#1e2a3a' }}>Add New Deal</h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: '#7a7568' }} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddDeal} className="p-6 space-y-4">
              {/* Lead Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>
                  Lead Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a39e94' }} />
                  <input
                    type="text"
                    value={formLeadName}
                    onChange={(e) => setFormLeadName(e.target.value)}
                    placeholder="John Smith"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#F07020]/30"
                    style={{ border: '1px solid #e4e0da', color: '#1e2a3a' }}
                  />
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>
                  Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a39e94' }} />
                  <input
                    type="text"
                    value={formBusinessName}
                    onChange={(e) => setFormBusinessName(e.target.value)}
                    placeholder="Smith's Auto Repair"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#F07020]/30"
                    style={{ border: '1px solid #e4e0da', color: '#1e2a3a' }}
                  />
                </div>
              </div>

              {/* Niche */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>
                  Niche / Industry
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a39e94' }} />
                  <input
                    type="text"
                    value={formNiche}
                    onChange={(e) => setFormNiche(e.target.value)}
                    placeholder="Auto Repair, Dental, Restaurant..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#F07020]/30"
                    style={{ border: '1px solid #e4e0da', color: '#1e2a3a' }}
                  />
                </div>
              </div>

              {/* Phone & Email row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a39e94' }} />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="(555) 555-1234"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#F07020]/30"
                      style={{ border: '1px solid #e4e0da', color: '#1e2a3a' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a39e94' }} />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="john@business.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#F07020]/30"
                      style={{ border: '1px solid #e4e0da', color: '#1e2a3a' }}
                    />
                  </div>
                </div>
              </div>

              {/* Estimated Monthly Value */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>
                  Estimated Monthly Value ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a39e94' }} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formEstimatedMonthly}
                    onChange={(e) => setFormEstimatedMonthly(e.target.value)}
                    placeholder="500"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#F07020]/30"
                    style={{ border: '1px solid #e4e0da', color: '#1e2a3a' }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e2a3a' }}>Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  placeholder="Any initial notes about this deal..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#F07020]/30 resize-none"
                  style={{ border: '1px solid #e4e0da', color: '#1e2a3a' }}
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  style={{ color: '#7a7568', border: '1px solid #e4e0da' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formLeadName.trim() || !formBusinessName.trim()}
                  className="flex items-center gap-2 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#F07020' }}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add to Pipeline
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
