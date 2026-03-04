"use client";

import { useState, useMemo, useEffect } from "react";
import { pipelineStages } from "@/lib/platform-data";
import { DollarSign, User, Mail, Clock, MoreHorizontal, Plus, Search, Filter, Loader2 } from "lucide-react";

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  probability: number;
  stage: string;
  contact: string;
  email: string;
  lastActivity: string;
  assignedTo: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch deals from backend
  useEffect(() => {
    async function loadDeals() {
      try {
        const res = await fetch(`${API_URL}/sales/deals`);
        const data = await res.json();
        if (data.deals && Array.isArray(data.deals)) {
          setDeals(data.deals.map((d: any) => ({
            id: d.id || d.deal_id,
            name: d.name || d.title || "Untitled Deal",
            company: d.company || d.company_name || "",
            value: d.value || d.amount || 0,
            probability: d.probability || 50,
            stage: d.stage || "New",
            contact: d.contact || d.contact_name || "",
            email: d.email || d.contact_email || "",
            lastActivity: d.last_activity || d.updated_at || "Just now",
            assignedTo: d.assigned_to || d.assignee || "Unassigned",
          })));
        }
      } catch (err) {
        console.error("Failed to load deals:", err);
        // Fall back to empty - the page will show "No deals" states
      } finally {
        setIsLoading(false);
      }
    }
    loadDeals();
  }, []);

  const filteredDeals = useMemo(() => {
    if (!searchQuery) return deals;
    return deals.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.contact.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deals, searchQuery]);

  const stageStats = useMemo(() => {
    return pipelineStages.map((stage) => {
      const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
      const total = stageDeals.reduce((sum, d) => sum + d.value, 0);
      const weighted = stageDeals.reduce(
        (sum, d) => sum + d.value * (d.probability / 100),
        0
      );
      return {
        ...stage,
        count: stageDeals.length,
        total,
        weighted,
      };
    });
  }, [filteredDeals]);

  const totalPipeline = stageStats.reduce((sum, s) => sum + s.total, 0);
  const totalWeighted = stageStats.reduce((sum, s) => sum + s.weighted, 0);

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== stageId) {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === draggedDeal.id ? { ...d, stage: stageId } : d
        )
      );
      setDraggedDeal(null);
    }
  };

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString()}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">Sales Pipeline</h1>
          <p className="text-sm text-mouse-slate mt-1">
            Track deals through your sales process
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Deal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-5">
          <p className="text-sm text-mouse-slate font-medium mb-1">Total Pipeline</p>
          <p className="text-2xl font-bold text-mouse-charcoal">
            {formatCurrency(totalPipeline)}
          </p>
          <p className="text-xs text-mouse-slate mt-1">{deals.length} deals</p>
        </div>
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-5">
          <p className="text-sm text-mouse-slate font-medium mb-1">Weighted Pipeline</p>
          <p className="text-2xl font-bold text-mouse-teal">
            {formatCurrency(totalWeighted)}
          </p>
          <p className="text-xs text-mouse-slate mt-1">
            {Math.round((totalWeighted / totalPipeline) * 100)}% probability weighted
          </p>
        </div>
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-5">
          <p className="text-sm text-mouse-slate font-medium mb-1">Avg Deal Size</p>
          <p className="text-2xl font-bold text-mouse-green">
            {deals.length > 0 ? formatCurrency(Math.round(totalPipeline / deals.length)) : '$0'}
          </p>
          <p className="text-xs text-mouse-slate mt-1">Across all stages</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
          <input
            type="text"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-mouse-slate/20 rounded-lg text-sm text-mouse-charcoal hover:bg-mouse-offwhite transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stageStats.map((stage) => (
          <div
            key={stage.id}
            className="bg-mouse-offwhite rounded-xl border border-mouse-slate/20 flex flex-col min-h-[500px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div className="px-4 py-3 border-b border-mouse-slate/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <h3 className="font-semibold text-mouse-charcoal text-sm">
                    {stage.name}
                  </h3>
                </div>
                <span className="text-xs font-medium text-mouse-slate bg-white px-2 py-0.5 rounded-full">
                  {stage.count}
                </span>
              </div>
              <div className="text-xs text-mouse-slate">
                <span className="font-medium text-mouse-charcoal">
                  {formatCurrency(stage.total)}
                </span>{" "}
                ({formatCurrency(stage.weighted)} weighted)
              </div>
            </div>

            {/* Deals */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {filteredDeals
                .filter((d) => d.stage === stage.id)
                .map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    className="bg-white rounded-lg border border-mouse-slate/20 p-4 cursor-move hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-mouse-charcoal text-sm line-clamp-2 flex-1">
                        {deal.name}
                      </h4>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-mouse-slate" />
                      </button>
                    </div>

                    <p className="text-xs text-mouse-slate mb-3">{deal.company}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-mouse-green" />
                        <span className="text-sm font-semibold text-mouse-charcoal">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                      <span className="text-xs text-mouse-slate">
                        {deal.probability}% prob
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-mouse-slate mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{deal.contact}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-mouse-slate/10">
                      <div className="flex items-center gap-1 text-xs text-mouse-slate">
                        <Clock className="w-3 h-3" />
                        <span>{deal.lastActivity}</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-mouse-teal/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-mouse-teal">
                          {deal.assignedTo.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {filteredDeals.filter((d) => d.stage === stage.id).length === 0 && (
                <div className="text-center py-8 text-mouse-slate text-sm">
                  No deals in this stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-mouse-charcoal mb-4">
              Add New Deal
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1">
                  Deal Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
                  placeholder="e.g., Enterprise Upgrade"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1">
                  Company
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
                  placeholder="Company name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-mouse-charcoal mb-1">
                    Value ($)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mouse-charcoal mb-1">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-mouse-slate hover:text-mouse-charcoal transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Add Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
