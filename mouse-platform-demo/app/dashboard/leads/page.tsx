"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building2,
  Star,
  Phone,
  Globe,
  Loader2,
  AlertCircle,
  Download,
  Target,
  MessageSquare,
  Workflow,
} from "lucide-react";
import OutreachGeneratorModal from "@/components/lead-finder/OutreachGeneratorModal";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { Vertical, LeadBusiness } from "@/types/lead-finder";

const VERTICALS: { value: Vertical; label: string }[] = [
  { value: "plumbing", label: "Plumbing" },
  { value: "dental", label: "Dental" },
  { value: "hvac", label: "HVAC" },
  { value: "electrical", label: "Electrical" },
  { value: "roofing", label: "Roofing" },
  { value: "landscaping", label: "Landscaping" },
  { value: "cleaning", label: "Cleaning" },
  { value: "real_estate", label: "Real Estate" },
  { value: "legal", label: "Legal" },
  { value: "accounting", label: "Accounting" },
  { value: "auto_repair", label: "Auto Repair" },
  { value: "restaurant", label: "Restaurant" },
  { value: "other", label: "Other" },
];

const RADIUS_OPTIONS = [5, 10, 25, 50];

const PAIN_SIGNAL_LABELS: Record<string, string> = {
  no_callback: "No callback",
  no_answer: "No answer",
  rude_staff: "Rude staff",
  poor_work: "Poor work",
  late_arrival: "Late/no-show",
  overpriced: "Overpriced",
  hidden_fees: "Hidden fees",
  no_website: "No website",
};

export default function LeadFinderPage() {
  const [vertical, setVertical] = useState<Vertical>("plumbing");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanResult, setScanResult] = useState<{
    id: string;
    status: string;
    vertical?: string;
    total_found: number;
    high_priority_count: number;
    businesses: LeadBusiness[];
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showOutreachModal, setShowOutreachModal] = useState(false);

  const runScan = useCallback(async () => {
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }

    setIsLoading(true);
    setError("");
    setScanResult(null);

    try {
      const res = await fetchWithAuth("/api/reseller/lead-finder/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vertical,
          location: location.trim(),
          radius,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || "Scan failed");
      }

      const scanId = data.scan_id;
      if (!scanId) {
        throw new Error("No scan ID returned");
      }

      const getRes = await fetchWithAuth(
        `/api/reseller/lead-finder/scans/${scanId}`
      );
      const getData = await getRes.json();

      if (!getRes.ok) {
        throw new Error(getData.error || "Failed to load results");
      }

      setScanResult({
        id: getData.id,
        status: getData.status,
        vertical: getData.vertical ?? vertical,
        total_found: getData.total_found ?? 0,
        high_priority_count: getData.high_priority_count ?? 0,
        businesses: (getData.businesses ?? []).map((b: LeadBusiness) => ({
          ...b,
          vertical: getData.vertical ?? vertical,
        })),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setScanResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [vertical, location, radius]);

  const getPainScoreColor = (score: number) => {
    if (score >= 7) return "bg-red-100 text-red-700";
    if (score >= 4) return "bg-amber-100 text-amber-700";
    return "bg-mouse-teal/10 text-mouse-teal";
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!scanResult?.businesses.length) return;
    if (selectedIds.size === scanResult.businesses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(scanResult.businesses.map((b) => b.id)));
    }
  };

  const updatePipelineStatus = async (businessId: string, status: string) => {
    try {
      await fetchWithAuth(
        `/api/reseller/lead-finder/pipeline/${businessId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      setScanResult((prev) =>
        prev
          ? {
              ...prev,
              businesses: prev.businesses.map((b) =>
                b.id === businessId ? { ...b, pipeline_status: status } : b
              ),
            }
          : null
      );
    } catch {
      // ignore
    }
  };

  const exportLeads = () => {
    if (!scanResult?.businesses.length) return;
    const data = scanResult.businesses.map((b) => ({
      name: b.name,
      phone: b.phone,
      website: b.website,
      address: b.address,
      rating: b.google_rating,
      reviews: b.google_review_count,
      pain_signals: b.pain_signals,
      pain_score: b.pain_score,
      estimated_lost_revenue: b.estimated_lost_revenue,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">Lead Finder</h1>
          <p className="text-sm text-mouse-slate mt-1">
            Find SMBs with pain signals — ready for AI employee outreach
          </p>
        </div>
        {scanResult && scanResult.businesses.length > 0 && (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/leads/pipeline"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-mouse-slate/20 text-mouse-charcoal rounded-lg text-sm font-medium hover:bg-mouse-offwhite transition-colors"
            >
              <Workflow className="w-4 h-4" />
              Pipeline
            </Link>
            <button
              onClick={() => setShowOutreachModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Generate Outreach
            </button>
            <button
              onClick={exportLeads}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-mouse-slate/20 text-mouse-charcoal rounded-lg text-sm font-medium hover:bg-mouse-offwhite transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        )}
      </div>

      {/* Scan Form */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-mouse-slate mb-1.5">
              Vertical
            </label>
            <select
              value={vertical}
              onChange={(e) => setVertical(e.target.value as Vertical)}
              className="w-full px-3 py-2.5 bg-mouse-offwhite border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
            >
              {VERTICALS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4 relative">
            <label className="block text-xs font-medium text-mouse-slate mb-1.5">
              Location
            </label>
            <MapPin className="absolute left-3 top-9 w-4 h-4 text-mouse-slate" />
            <input
              type="text"
              placeholder="City, state, or zip (e.g. Wilmington, NC)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runScan()}
              className="w-full pl-10 pr-4 py-2.5 bg-mouse-offwhite border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-mouse-slate mb-1.5">
              Radius: {radius} miles
            </label>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    radius === r
                      ? "bg-mouse-teal text-white"
                      : "bg-mouse-offwhite text-mouse-slate hover:bg-mouse-slate/20"
                  }`}
                >
                  {r} mi
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              onClick={runScan}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Scan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      {scanResult && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
            <p className="text-xs text-mouse-slate font-medium uppercase">
              Total Found
            </p>
            <p className="text-xl font-bold text-mouse-charcoal mt-1">
              {scanResult.total_found}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
            <p className="text-xs text-mouse-slate font-medium uppercase">
              High Priority
            </p>
            <p className="text-xl font-bold text-orange-600 mt-1">
              {scanResult.high_priority_count}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
            <p className="text-xs text-mouse-slate font-medium uppercase">
              Avg Pain Score
            </p>
            <p className="text-xl font-bold text-mouse-teal mt-1">
              {scanResult.businesses.length
                ? (
                    scanResult.businesses.reduce((s, b) => s + (b.pain_score ?? 0), 0) /
                    scanResult.businesses.length
                  ).toFixed(1)
                : "—"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
            <p className="text-xs text-mouse-slate font-medium uppercase">
              Est. Lost Revenue
            </p>
            <p className="text-xl font-bold text-mouse-green mt-1">
              $
              {scanResult.businesses.length
                ? scanResult.businesses
                    .reduce((s, b) => s + (b.estimated_lost_revenue ?? 0), 0)
                    .toLocaleString()
                : "0"}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!scanResult && !isLoading && (
        <div className="text-center py-16 bg-white rounded-xl border border-mouse-slate/20">
          <div className="w-16 h-16 bg-mouse-offwhite rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-mouse-slate" />
          </div>
          <h3 className="text-lg font-medium text-mouse-charcoal mb-2">
            Find Your Next Customer
          </h3>
          <p className="text-sm text-mouse-slate max-w-md mx-auto mb-6">
            Select a vertical, enter a location, and scan for businesses with pain
            signals. We analyze Google reviews to surface leads ready for outreach.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Wilmington, NC", "Charlotte, NC", "Raleigh, NC", "Atlanta, GA"].map(
              (loc) => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className="px-3 py-1.5 bg-mouse-offwhite text-mouse-slate rounded-full text-sm hover:bg-mouse-slate/20 transition-colors"
                >
                  {loc}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-16">
          <Loader2 className="w-12 h-12 text-mouse-teal animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mouse-charcoal mb-2">
            Scanning for leads...
          </h3>
          <p className="text-sm text-mouse-slate">
            Fetching businesses from Google Places and analyzing reviews
          </p>
        </div>
      )}

      {/* Results Table */}
      {scanResult && scanResult.businesses.length > 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-mouse-slate/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mouse-slate/20 bg-mouse-offwhite/50">
                  <th className="text-left px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        scanResult.businesses.length > 0 &&
                        selectedIds.size === scanResult.businesses.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-mouse-slate/30"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-mouse-charcoal">
                    Business
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-mouse-charcoal">
                    Rating
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-mouse-charcoal">
                    Pain Signals
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-mouse-charcoal">
                    Pain Score
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-mouse-charcoal">
                    Est. Lost Revenue
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-mouse-charcoal">
                    Pipeline
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-mouse-charcoal">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody>
                {scanResult.businesses.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-mouse-slate/10 hover:bg-mouse-offwhite/30"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(b.id)}
                        onChange={() => toggleSelect(b.id)}
                        className="rounded border-mouse-slate/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-mouse-navy/5 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-mouse-navy" />
                        </div>
                        <div>
                          <p className="font-medium text-mouse-charcoal">
                            {b.name}
                          </p>
                          {b.address && (
                            <p className="text-xs text-mouse-slate truncate max-w-[200px]">
                              {b.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {b.google_rating != null && (
                          <>
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{b.google_rating}</span>
                            {b.google_review_count != null && (
                              <span className="text-mouse-slate">
                                ({b.google_review_count})
                              </span>
                            )}
                          </>
                        )}
                        {b.google_rating == null && (
                          <span className="text-mouse-slate">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(b.pain_signals ?? []).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800"
                          >
                            {PAIN_SIGNAL_LABELS[s] ?? s}
                          </span>
                        ))}
                        {(b.pain_signals ?? []).length === 0 && (
                          <span className="text-mouse-slate">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPainScoreColor(
                          b.pain_score ?? 0
                        )}`}
                      >
                        {b.pain_score ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.estimated_lost_revenue != null ? (
                        <span className="font-medium text-mouse-green">
                          $
                          {b.estimated_lost_revenue.toLocaleString()}
                          <span className="text-mouse-slate font-normal text-xs">
                            /mo
                          </span>
                        </span>
                      ) : (
                        <span className="text-mouse-slate">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.pipeline_status ?? "new"}
                        onChange={(e) =>
                          updatePipelineStatus(b.id, e.target.value)
                        }
                        className="px-2 py-1 text-xs border border-mouse-slate/20 rounded-lg focus:outline-none focus:border-mouse-teal"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="pitched">Pitched</option>
                        <option value="demo">Demo</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="closed">Closed</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {b.phone && (
                          <a
                            href={`tel:${b.phone}`}
                            className="flex items-center gap-1 text-mouse-teal hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            {b.phone}
                          </a>
                        )}
                        {b.website && (
                          <a
                            href={b.website.startsWith("http") ? b.website : `https://${b.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-mouse-teal hover:underline truncate max-w-[180px]"
                          >
                            <Globe className="w-3 h-3 flex-shrink-0" />
                            {b.website.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                        {!b.phone && !b.website && (
                          <span className="text-mouse-slate">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {scanResult && scanResult.businesses.length === 0 && !isLoading && (
        <div className="text-center py-16 bg-white rounded-xl border border-mouse-slate/20">
          <Building2 className="w-12 h-12 text-mouse-slate mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mouse-charcoal mb-2">
            No businesses found
          </h3>
          <p className="text-sm text-mouse-slate mb-4">
            Try a different location or radius. Ensure GOOGLE_PLACES_API_KEY is set.
          </p>
        </div>
      )}

      {showOutreachModal && scanResult && (
        <OutreachGeneratorModal
          businesses={scanResult.businesses}
          selectedIds={
            selectedIds.size > 0
              ? Array.from(selectedIds)
              : scanResult.businesses.map((b) => b.id)
          }
          onClose={() => setShowOutreachModal(false)}
          onSent={() => {
            setScanResult((prev) =>
              prev
                ? {
                    ...prev,
                    businesses: prev.businesses.map((b) => ({
                      ...b,
                      outreach_count: (b.outreach_count ?? 0) + 1,
                    })),
                  }
                : null
            );
          }}
        />
      )}
    </div>
  );
}
