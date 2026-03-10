"use client";

import { BarChart3 } from "lucide-react";

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  title?: string;
  data: DataPoint[];
  metricLabel?: string;
}

export default function AnalyticsChart({
  title = "Performance",
  data,
  metricLabel = "Value",
}: Props) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
      <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-mouse-teal" />
        {title}
      </h2>
      {data.length === 0 ? (
        <div className="text-center py-8 text-mouse-slate text-sm">
          No data yet
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-mouse-charcoal">{d.label}</span>
                <span className="text-mouse-slate">{d.value}</span>
              </div>
              <div className="h-2 bg-mouse-offwhite rounded-full overflow-hidden">
                <div
                  className="h-full bg-mouse-teal rounded-full transition-all"
                  style={{ width: `${(d.value / maxVal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
