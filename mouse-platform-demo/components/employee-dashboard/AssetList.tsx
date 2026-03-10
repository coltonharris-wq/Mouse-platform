"use client";

import { Package } from "lucide-react";

interface Asset {
  id: string;
  name?: string;
  type?: string;
  url?: string;
  created_at?: string;
}

interface Props {
  assets: Asset[];
}

export default function AssetList({ assets }: Props) {
  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
      <h2 className="text-base font-semibold text-mouse-charcoal flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-mouse-teal" />
        Assets
      </h2>
      <div className="space-y-2">
        {assets.length === 0 ? (
          <div className="text-center py-8 text-mouse-slate text-sm">
            No assets yet
          </div>
        ) : (
          assets.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-mouse-slate/10 hover:bg-mouse-offwhite/30"
            >
              <div className="w-10 h-10 rounded-lg bg-mouse-teal/10 flex items-center justify-center text-lg">
                {a.type === "script" ? "📜" : a.type === "template" ? "📄" : "📁"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-mouse-charcoal truncate">
                  {a.name || "Untitled"}
                </p>
                <p className="text-xs text-mouse-slate">
                  {a.type || "Unknown"} •{" "}
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              {a.url && (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-mouse-teal hover:underline"
                >
                  →
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
