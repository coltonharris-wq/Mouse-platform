"use client";

import { Lightbulb, AlertTriangle } from "lucide-react";

interface Insight {
  type: "recommendation" | "alert";
  title: string;
  description: string;
}

interface Props {
  insights: Insight[];
}

export default function InsightsSection({ insights }: Props) {
  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
        <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-mouse-teal" />
          Insights & Alerts
        </h2>
        <div className="text-center py-6 text-mouse-slate text-sm">
          No insights yet. Activity will generate smart recommendations.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
      <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-mouse-teal" />
        Insights & Alerts
      </h2>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`flex gap-3 p-3 rounded-lg border ${
              insight.type === "alert"
                ? "bg-amber-50 border-amber-200"
                : "bg-mouse-teal/5 border-mouse-teal/20"
            }`}
          >
            {insight.type === "alert" ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Lightbulb className="w-5 h-5 text-mouse-teal flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-mouse-charcoal">
                {insight.title}
              </p>
              <p className="text-xs text-mouse-slate mt-0.5">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
