"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  DollarSign,
  Phone,
  Loader2,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { LeadBusiness } from "@/types/lead-finder";

const STAGES = [
  { id: "new", name: "New", color: "bg-blue-500" },
  { id: "contacted", name: "Contacted", color: "bg-yellow-500" },
  { id: "pitched", name: "Pitched", color: "bg-orange-500" },
  { id: "demo", name: "Demo", color: "bg-purple-500" },
  { id: "negotiation", name: "Negotiation", color: "bg-amber-500" },
  { id: "closed", name: "Closed", color: "bg-green-500" },
  { id: "lost", name: "Lost", color: "bg-gray-400" },
];

export default function LeadPipelinePage() {
  const [businesses, setBusinesses] = useState<LeadBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/reseller/lead-finder/businesses");
      const data = await res.json();
      setBusinesses(data.businesses ?? []);
    } catch {
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetchWithAuth(
        `/api/reseller/lead-finder/pipeline/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, pipeline_status: status } : b
        )
      );
    } catch {
      // ignore
    }
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragEnd = () => setDraggedId(null);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedId) {
      updateStatus(draggedId, stageId);
      setDraggedId(null);
    }
  };

  const byStage = (stageId: string) =>
    businesses.filter((b) => (b.pipeline_status ?? "new") === stageId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/leads"
            className="flex items-center gap-2 text-mouse-slate hover:text-mouse-charcoal"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lead Finder
          </Link>
        </div>
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">Lead Pipeline</h1>
          <p className="text-sm text-mouse-slate mt-1">
            Drag leads through your sales process
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-mouse-teal animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className="bg-mouse-offwhite rounded-xl border border-mouse-slate/20 flex flex-col min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="px-4 py-3 border-b border-mouse-slate/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${stage.color}`}
                    />
                    <h3 className="font-semibold text-mouse-charcoal text-sm">
                      {stage.name}
                    </h3>
                  </div>
                  <span className="text-xs font-medium text-mouse-slate bg-white px-2 py-0.5 rounded-full">
                    {byStage(stage.id).length}
                  </span>
                </div>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {byStage(stage.id).map((b) => (
                  <div
                    key={b.id}
                    draggable
                    onDragStart={() => handleDragStart(b.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg border border-mouse-slate/20 p-4 cursor-move hover:shadow-md transition-shadow ${
                      draggedId === b.id ? "opacity-50" : ""
                    }`}
                  >
                    <h4 className="font-medium text-mouse-charcoal text-sm mb-1 line-clamp-2">
                      {b.name}
                    </h4>
                    {b.estimated_lost_revenue != null && (
                      <div className="flex items-center gap-1 text-xs text-mouse-green mb-2">
                        <DollarSign className="w-3 h-3" />
                        ${b.estimated_lost_revenue.toLocaleString()}/mo
                      </div>
                    )}
                    {b.phone && (
                      <a
                        href={`tel:${b.phone}`}
                        className="flex items-center gap-1 text-xs text-mouse-teal hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {b.phone}
                      </a>
                    )}
                    {(b.outreach_count ?? 0) > 0 && (
                      <div className="flex items-center gap-1 text-xs text-mouse-slate mt-1">
                        <MessageSquare className="w-3 h-3" />
                        {b.outreach_count} outreach
                      </div>
                    )}
                  </div>
                ))}
                {byStage(stage.id).length === 0 && (
                  <div className="text-center py-8 text-mouse-slate text-sm">
                    No leads
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && businesses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-mouse-slate/20">
          <Building2 className="w-12 h-12 text-mouse-slate mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mouse-charcoal mb-2">
            No leads in pipeline
          </h3>
          <p className="text-sm text-mouse-slate mb-4">
            Run a scan in Lead Finder to discover businesses
          </p>
          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
          >
            Go to Lead Finder
          </Link>
        </div>
      )}
    </div>
  );
}
