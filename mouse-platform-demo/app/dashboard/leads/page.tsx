"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  MapPin,
  Building2,
  Star,
  Phone,
  Globe,
  Users,
  DollarSign,
  Download,
  Filter,
  Bookmark,
  Target,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  industry: string;
  location: string;
  rating: number;
  reviews: number;
  phone: string;
  website: string;
  score: number;
  employees: string;
  revenue: string;
  saved: boolean;
  placeId?: string;
  types?: string[];
  status?: string;
}

const industries = [
  "All Industries",
  "Technology",
  "Manufacturing",
  "Finance",
  "Healthcare",
  "Construction",
  "Energy",
  "Retail",
  "Education",
  "Real Estate",
  "Business Services",
];

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [radius, setRadius] = useState(25);
  const [savedLeads, setSavedLeads] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [minScore, setMinScore] = useState(0);
  
  // API integration states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [apiWarning, setApiWarning] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  // Search function
  const searchLeads = useCallback(async () => {
    if (!searchQuery.trim() && !locationQuery.trim()) {
      setError("Please enter a search query or location");
      return;
    }

    setIsLoading(true);
    setError("");
    setApiWarning("");
    setDemoMode(false);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (locationQuery) params.append("location", locationQuery);
      params.append("radius", (radius * 1609).toString()); // Convert miles to meters

      const response = await fetch(`/api/leads/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok && !data.leads) {
        throw new Error(data.error || "Failed to search leads");
      }

      if (data.warning) {
        setApiWarning(data.warning);
      }

      if (data.demoMode) {
        setDemoMode(true);
      }

      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching");
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, locationQuery, radius]);

  // Initial load - show empty state
  useEffect(() => {
    // Don't auto-search on mount - wait for user input
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesIndustry =
        selectedIndustry === "All Industries" ||
        lead.industry === selectedIndustry;
      const matchesScore = lead.score >= minScore;
      return matchesIndustry && matchesScore;
    });
  }, [leads, selectedIndustry, minScore]);

  const toggleSave = (leadId: string) => {
    setSavedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  const exportLeads = () => {
    const data = filteredLeads.map((l) => ({
      name: l.name,
      industry: l.industry,
      location: l.location,
      phone: l.phone,
      website: l.website,
      score: l.score,
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 80) return "text-blue-600 bg-blue-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Hot";
    if (score >= 80) return "Warm";
    if (score >= 70) return "Qualified";
    return "Cold";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchLeads();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">Lead Finder</h1>
          <p className="text-sm text-mouse-slate mt-1">
            Discover and qualify new business opportunities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportLeads}
            disabled={filteredLeads.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-mouse-slate/20 text-mouse-charcoal rounded-lg text-sm font-medium hover:bg-mouse-offwhite transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
            <input
              type="text"
              placeholder="Search businesses (e.g., 'construction companies')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2.5 bg-mouse-offwhite border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
            />
          </div>
          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
            <input
              type="text"
              placeholder="Location (city, state, or zip)"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2.5 bg-mouse-offwhite border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
            />
          </div>
          <div className="md:col-span-2">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2.5 bg-mouse-offwhite border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full h-full flex items-center justify-center border rounded-lg transition-colors ${
                showFilters
                  ? "bg-orange-500 text-white border-mouse-teal"
                  : "bg-white text-mouse-slate border-mouse-slate/20 hover:bg-mouse-offwhite"
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={searchLeads}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search Leads
              </>
            )}
          </button>
          {(searchQuery || locationQuery) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setLocationQuery("");
                setLeads([]);
                setHasSearched(false);
                setError("");
                setApiWarning("");
                setDemoMode(false);
              }}
              className="px-4 py-2.5 text-sm text-mouse-slate hover:text-mouse-charcoal transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-mouse-slate/20 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-mouse-charcoal mb-2">
                Search Radius: {radius} miles
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-mouse-teal"
              />
              <div className="flex justify-between text-xs text-mouse-slate mt-1">
                <span>5 mi</span>
                <span>100 mi</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-mouse-charcoal mb-2">
                Min Lead Score: {minScore}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-mouse-teal"
              />
              <div className="flex justify-between text-xs text-mouse-slate mt-1">
                <span>0</span>
                <span>100</span>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setRadius(25);
                  setMinScore(0);
                  setSelectedIndustry("All Industries");
                }}
                className="text-sm text-mouse-teal hover:underline"
              >
                Reset filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* API Warning / Demo Mode Banner */}
      {apiWarning && (
        <div className={`mb-6 p-4 border rounded-lg flex items-start gap-3 ${
          demoMode 
            ? "bg-amber-50 border-amber-200" 
            : "bg-yellow-50 border-yellow-200"
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            demoMode ? "text-amber-600" : "text-yellow-600"
          }`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              demoMode ? "text-amber-800" : "text-yellow-800"
            }`}>
              {demoMode ? "🎯 Demo Mode Active" : "⚠️ Notice"}
            </p>
            <p className={`text-sm mt-1 ${
              demoMode ? "text-amber-700" : "text-yellow-700"
            }`}>
              {apiWarning}
            </p>
            {demoMode && (
              <div className="mt-3 text-xs text-amber-600 bg-amber-100/50 p-2 rounded">
                <strong>To get real business data:</strong>
                <ol className="list-decimal ml-4 mt-1 space-y-0.5">
                  <li>Get a Google Places API key from <a href="https://developers.google.com/maps/documentation/places/web-service/get-api-key" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                  <li>Add it to <code className="bg-amber-200/50 px-1 rounded">.env.local</code> as <code className="bg-amber-200/50 px-1 rounded">GOOGLE_PLACES_API_KEY=your_key</code></li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      {hasSearched && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
            <p className="text-xs text-mouse-slate font-medium uppercase">Total Leads</p>
            <p className="text-xl font-bold text-mouse-charcoal mt-1">
              {filteredLeads.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
            <p className="text-xs text-mouse-slate font-medium uppercase">Saved</p>
            <p className="text-xl font-bold text-mouse-teal mt-1">
              {savedLeads.size}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
            <p className="text-xs text-mouse-slate font-medium uppercase">Avg Score</p>
            <p className="text-xl font-bold text-mouse-green mt-1">
              {filteredLeads.length
                ? Math.round(
                    filteredLeads.reduce((sum, l) => sum + l.score, 0) /
                      filteredLeads.length
                  )
                : 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
            <p className="text-xs text-mouse-slate font-medium uppercase">Hot Leads</p>
            <p className="text-xl font-bold text-mouse-orange mt-1">
              {filteredLeads.filter((l) => l.score >= 90).length}
            </p>
          </div>
        </div>
      )}

      {/* Empty State - Before Search */}
      {!hasSearched && !isLoading && (
        <div className="text-center py-16 bg-white rounded-xl border border-mouse-slate/20">
          <div className="w-16 h-16 bg-mouse-offwhite rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-mouse-slate" />
          </div>
          <h3 className="text-lg font-medium text-mouse-charcoal mb-2">
            Find Your Next Customer
          </h3>
          <p className="text-sm text-mouse-slate max-w-md mx-auto mb-6">
            Search for businesses by keyword and location. We&apos;ll fetch real business data from Google Places to help you find qualified leads.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Construction", "Real Estate", "Healthcare", "Technology", "Finance"].map((industry) => (
              <button
                key={industry}
                onClick={() => {
                  setSearchQuery(industry);
                  setSelectedIndustry(industry);
                }}
                className="px-3 py-1.5 bg-mouse-offwhite text-mouse-slate rounded-full text-sm hover:bg-mouse-slate/20 transition-colors"
              >
                {industry}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <Loader2 className="w-12 h-12 text-mouse-teal animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mouse-charcoal mb-2">
            Searching for leads...
          </h3>
          <p className="text-sm text-mouse-slate">
            Fetching business data from Google Places
          </p>
          <p className="text-xs text-mouse-slate/60 mt-2">
            (Falls back to demo data if API is unavailable)
          </p>
        </div>
      )}

      {/* Leads Grid */}
      {!isLoading && filteredLeads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-xl border border-mouse-slate/20 p-5 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-mouse-navy/5 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-mouse-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-mouse-charcoal">
                      {lead.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-mouse-slate">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {lead.location.split(",").slice(0, 2).join(",")}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(lead.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    savedLeads.has(lead.id)
                      ? "bg-mouse-teal/10 text-mouse-teal"
                      : "bg-mouse-offwhite text-mouse-slate hover:text-mouse-teal"
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      savedLeads.has(lead.id) ? "fill-current" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Score Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getScoreColor(
                    lead.score
                  )}`}
                >
                  {lead.score} - {getScoreLabel(lead.score)}
                </span>
                <span className="text-xs text-mouse-slate bg-mouse-offwhite px-2.5 py-1 rounded-full">
                  {lead.industry}
                </span>
              </div>

              {/* Rating */}
              {lead.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(lead.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-mouse-charcoal">
                    {lead.rating}
                  </span>
                  {lead.reviews > 0 && (
                    <span className="text-xs text-mouse-slate">
                      ({lead.reviews} reviews)
                    </span>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-mouse-slate">
                  <Users className="w-4 h-4" />
                  <span>{lead.employees} employees</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-mouse-slate">
                  <DollarSign className="w-4 h-4" />
                  <span>{lead.revenue} revenue</span>
                </div>
                {lead.phone !== "N/A" && (
                  <div className="flex items-center gap-2 text-sm text-mouse-slate">
                    <Phone className="w-4 h-4" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                {lead.website !== "N/A" && (
                  <div className="flex items-center gap-2 text-sm text-mouse-slate">
                    <Globe className="w-4 h-4" />
                    <span className="text-mouse-teal truncate">{lead.website}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-mouse-slate/10">
                <button className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                  Add to Pipeline
                </button>
                <button className="px-3 py-2 bg-mouse-offwhite text-mouse-charcoal rounded-lg text-sm font-medium hover:bg-mouse-slate/20 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {hasSearched && !isLoading && filteredLeads.length === 0 && (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-mouse-slate mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mouse-charcoal mb-2">
            No leads found
          </h3>
          <p className="text-sm text-mouse-slate mb-4">
            Try adjusting your search terms, location, or filters
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setLocationQuery("");
              setSelectedIndustry("All Industries");
              setMinScore(0);
              setRadius(25);
              setApiWarning("");
              setDemoMode(false);
            }}
            className="text-sm text-mouse-teal hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
