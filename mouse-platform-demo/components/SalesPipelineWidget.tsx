"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Target, BarChart3, Loader2 } from "lucide-react";

interface PipelineStage {
  stage: string;
  count: number;
  revenue: number;
  color: string;
}

export default function SalesPipelineWidget() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPipeline() {
      try {
        // Try to load real pipeline data from Supabase
        const res = await fetch("/api/reseller/customers");
        if (res.ok) {
          const data = await res.json();
          const customers = data.customers || [];

          // Build pipeline from real customer data
          // For now, categorize by status/lifecycle stage
          const stageMap: Record<string, PipelineStage> = {
            lead: { stage: "Leads", count: 0, revenue: 0, color: "bg-blue-500" },
            contacted: { stage: "Contacted", count: 0, revenue: 0, color: "bg-mouse-teal" },
            qualified: { stage: "Qualified", count: 0, revenue: 0, color: "bg-[#14B8B6]" },
            proposal: { stage: "Proposal", count: 0, revenue: 0, color: "bg-pink-500" },
            active: { stage: "Active", count: 0, revenue: 0, color: "bg-green-500" },
          };

          for (const c of customers) {
            const stage = c.pipeline_stage || "active";
            if (stageMap[stage]) {
              stageMap[stage].count++;
              stageMap[stage].revenue += c.mrr || 0;
            } else {
              stageMap.active.count++;
              stageMap.active.revenue += c.mrr || 0;
            }
          }

          const result = Object.values(stageMap).filter((s) => s.count > 0);
          setStages(result);
        }
      } catch {
        // Ignore — will show empty state
      }
      setLoading(false);
    }
    loadPipeline();
  }, []);

  const maxCount = Math.max(...stages.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-mouse-teal/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-mouse-teal" />
        </div>
        <div>
          <h3 className="font-semibold text-mouse-navy">Sales Pipeline</h3>
          <p className="text-sm text-mouse-slate">Customer funnel from leads to active</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-mouse-slate animate-spin" />
        </div>
      ) : stages.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="w-10 h-10 text-mouse-slate/40 mx-auto mb-3" />
          <p className="text-sm text-mouse-slate font-medium">No pipeline data yet</p>
          <p className="text-xs text-mouse-slate/70 mt-1">
            Pipeline stages will populate as you add customers and leads.
          </p>
        </div>
      ) : (
        <>
          {/* Funnel */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-mouse-navy mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customer Pipeline
            </h4>
            <div className="space-y-3">
              {stages.map((stage) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-mouse-slate w-20">{stage.stage}</span>
                    <div className="flex-1 h-8 bg-mouse-offwhite rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stage.color} transition-all duration-500 rounded-full flex items-center justify-end pr-2`}
                        style={{ width: `${Math.max((stage.count / maxCount) * 100, 10)}%` }}
                      >
                        <span className="text-xs text-white font-medium">{stage.count}</span>
                      </div>
                    </div>
                    {stage.revenue > 0 && (
                      <span className="text-xs text-mouse-green font-medium w-16 text-right">
                        ${stage.revenue.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-mouse-slate/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-mouse-navy">
                {stages.reduce((s, st) => s + st.count, 0)}
              </p>
              <p className="text-xs text-mouse-slate">Total in Pipeline</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-mouse-green">
                ${stages.reduce((s, st) => s + st.revenue, 0).toLocaleString()}
              </p>
              <p className="text-xs text-mouse-slate">Pipeline MRR</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-mouse-teal">
                {stages.find((s) => s.stage === "Active")?.count || 0}
              </p>
              <p className="text-xs text-mouse-slate">Active Customers</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
