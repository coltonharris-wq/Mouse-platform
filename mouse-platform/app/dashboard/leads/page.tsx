"use client";

import { useState, useMemo } from "react";
import { leads, industries } from "@/lib/platform-data";
import {
  Search,
  MapPin,
  Building2,
  Star,
  Phone,
  Globe,
  Users,
  DollarSign,
  Save,
  Download,
  Filter,
  ChevronDown,
  Bookmark,
  Target,
  TrendingUp,
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
}

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [radius, setRadius] = useState(25);
  const [savedLeads, setSavedLeads] = useState<Set<string>>(
    new Set(leads.filter((l) => l.saved).map((l) => l.id))
  );
  const [showFilters, setShowFilters] = useState(false);
  const [minScore, setMinScore] = useState(0);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !searchQuery ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation =
        !locationQuery ||
        lead.location.toLowerCase().includes(locationQuery.toLowerCase());
      const matchesIndustry =
        selectedIndustry === "All Industries" ||
        lead.industry === selectedIndustry;
      const matchesScore = lead.score >= minScore;
      return matchesSearch && matchesLocation && matchesIndustry && matchesScore;
    });
  }, [searchQuery, locationQuery, selectedIndustry, minScore]);

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
    a.download = "leads.json";
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
            className="flex items-center gap-2 px-4 py-2 bg-white border border-mouse-slate/20 text-mouse-charcoal rounded-lg text-sm font-medium hover:bg-mouse-offwhite transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white rounded-lg text-sm font-medium hover:bg-mouse-teal/90 transition-colors">
            <Target className="w-4 h-4" />
            Start Campaign
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
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-mouse-offwhite border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
            />
          </div>
          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
            <input
              type="text"
              placeholder="Location (city, state)"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
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
                  ? "bg-mouse-teal text-white border-mouse-teal"
                  : "bg-white text-mouse-slate border-mouse-slate/20 hover:bg-mouse-offwhite"
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
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

      {/* Stats */}
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

      {/* Leads Grid */}
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
                      {lead.location}
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
              <span className="text-xs text-mouse-slate">
                ({lead.reviews} reviews)
              </span>
            </div>

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
              <div className="flex items-center gap-2 text-sm text-mouse-slate">
                <Phone className="w-4 h-4" />
                <span>{lead.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-mouse-slate">
                <Globe className="w-4 h-4" />
                <span className="text-mouse-teal">{lead.website}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-mouse-slate/10">
              <button className="flex-1 px-3 py-2 bg-mouse-teal text-white rounded-lg text-sm font-medium hover:bg-mouse-teal/90 transition-colors">
                Add to Pipeline
              </button>
              <button className="px-3 py-2 bg-mouse-offwhite text-mouse-charcoal rounded-lg text-sm font-medium hover:bg-mouse-slate/20 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-mouse-slate mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mouse-charcoal mb-2">
            No leads found
          </h3>
          <p className="text-sm text-mouse-slate">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
