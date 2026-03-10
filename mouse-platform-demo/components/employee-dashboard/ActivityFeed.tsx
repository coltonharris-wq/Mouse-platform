"use client";

import { Clock } from "lucide-react";

interface Activity {
  id: string;
  activity_type?: string;
  title?: string;
  description?: string;
  customer_phone?: string;
  customer_email?: string;
  impact_value?: number;
  created_at: string;
}

interface Props {
  activities: Activity[];
  maxItems?: number;
}

export default function ActivityFeed({ activities, maxItems = 10 }: Props) {
  const items = activities.slice(0, maxItems);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
      <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-mouse-teal" />
        Recent Activity
      </h2>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 text-mouse-slate text-sm">
            No activity yet
          </div>
        ) : (
          items.map((a) => (
            <div
              key={a.id}
              className="flex gap-3 p-3 rounded-lg border border-mouse-slate/10 hover:bg-mouse-offwhite/30"
            >
              <div className="w-2 h-2 rounded-full bg-mouse-teal mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-mouse-charcoal">
                  {a.title || a.activity_type || "Activity"}
                </p>
                {a.description && (
                  <p className="text-xs text-mouse-slate mt-0.5">{a.description}</p>
                )}
                {(a.customer_phone || a.customer_email) && (
                  <p className="text-xs text-mouse-slate mt-1">
                    {a.customer_phone || a.customer_email}
                  </p>
                )}
                {a.impact_value != null && a.impact_value > 0 && (
                  <p className="text-xs text-mouse-green font-medium mt-1">
                    +${a.impact_value.toLocaleString()}
                  </p>
                )}
              </div>
              <span className="text-xs text-mouse-slate flex-shrink-0">
                {formatTime(a.created_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
