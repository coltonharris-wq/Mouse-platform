"use client";

import { Users } from "lucide-react";

interface Customer {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  tags?: string[];
  last_interaction?: string;
  note?: string;
  last_value?: number;
}

interface Props {
  customers: Customer[];
  title?: string;
  viewAllHref?: string;
}

export default function CustomerMemoryCard({
  customers,
  title = "Priority Customers",
  viewAllHref,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
      <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-mouse-teal" />
        {title}
      </h2>
      <div className="space-y-3">
        {customers.length === 0 ? (
          <div className="text-center py-8 text-mouse-slate text-sm">
            No customers yet
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-lg border border-mouse-slate/10 hover:bg-mouse-offwhite/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-mouse-charcoal">
                    {c.name || "Unknown"}
                  </p>
                  {(c.phone || c.email) && (
                    <p className="text-xs text-mouse-slate mt-0.5">
                      {c.phone || c.email}
                    </p>
                  )}
                </div>
                {c.tags && c.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-xs px-1.5 py-0.5 rounded bg-mouse-teal/10 text-mouse-teal"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {c.note && (
                <p className="text-xs text-mouse-slate mt-2 italic">
                  &quot;{c.note}&quot;
                </p>
              )}
              {c.last_value != null && c.last_value > 0 && (
                <p className="text-xs text-mouse-green font-medium mt-1">
                  Last: ${c.last_value.toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
      {viewAllHref && customers.length > 0 && (
        <a
          href={viewAllHref}
          className="block mt-3 text-sm text-mouse-teal hover:underline font-medium"
        >
          View all customers →
        </a>
      )}
    </div>
  );
}
