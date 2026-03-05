"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Target, MapPin, Mail, Phone, Globe, Star,
  Download, Settings2, Search, Filter, TrendingUp, Users,
  BarChart3, Zap, ChevronDown, ExternalLink, Clock, Magnet,
  CheckCircle, AlertCircle, UserCheck, ArrowUpRight,
} from "lucide-react";

type LeadStatus = "new" | "contacted" | "qualified" | "converted";

interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  score: number;
  status: LeadStatus;
  industry: string;
  location: string;
  foundDate: string;
  lastActivity: string;
  companySize: string;
  notes: string;
}

const STATUS_CONFIG: Record<LeadStatus, { bg: string; text: string; label: string; icon: React.ElementType }> = {
  new: { bg: "bg-blue-100", text: "text-blue-700", label: "New", icon: Zap },
  contacted: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Contacted", icon: Mail },
  qualified: { bg: "bg-green-100", text: "text-green-700", label: "Qualified", icon: UserCheck },
  converted: { bg: "bg-purple-100", text: "text-purple-700", label: "Converted", icon: CheckCircle },
};

function getScoreColor(score: number) {
  if (score >= 8) return { bg: "bg-green-100", text: "text-green-700", ring: "ring-green-300" };
  if (score >= 5) return { bg: "bg-yellow-100", text: "text-yellow-700", ring: "ring-yellow-300" };
  return { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-300" };
}

// Demo leads data
const DEMO_LEADS: Lead[] = [
  { id: "l1", businessName: "Summit Roofing Solutions", contactName: "Mike Thompson", phone: "(555) 234-5678", email: "mike@summitroofing.com", website: "summitroofing.com", score: 9, status: "qualified", industry: "Construction", location: "Denver, CO", foundDate: "2026-03-05", lastActivity: "2h ago", companySize: "11-50", notes: "No website chat, high review volume" },
  { id: "l2", businessName: "Bright Smile Dental", contactName: "Dr. Sarah Kim", phone: "(555) 345-6789", email: "info@brightsmile.com", website: "brightsmile.com", score: 8, status: "contacted", industry: "Healthcare", location: "Austin, TX", foundDate: "2026-03-05", lastActivity: "4h ago", companySize: "11-50", notes: "Expanding to 2nd location, needs automation" },
  { id: "l3", businessName: "Pinnacle Law Group", contactName: "James Rodriguez", phone: "(555) 456-7890", email: "jrodriguez@pinnaclelaw.com", website: "pinnaclelaw.com", score: 7, status: "new", industry: "Legal", location: "Miami, FL", foundDate: "2026-03-05", lastActivity: "1h ago", companySize: "11-50", notes: "Slow client intake process mentioned in reviews" },
  { id: "l4", businessName: "FastFix Plumbing", contactName: "Carlos Mendez", phone: "(555) 567-8901", email: "carlos@fastfixplumb.com", website: "fastfixplumb.com", score: 9, status: "converted", industry: "Home Services", location: "Phoenix, AZ", foundDate: "2026-03-04", lastActivity: "1d ago", companySize: "1-10", notes: "Signed up for Growth plan" },
  { id: "l5", businessName: "TechNova Solutions", contactName: "Priya Patel", phone: "(555) 678-9012", email: "priya@technova.io", website: "technova.io", score: 6, status: "contacted", industry: "Technology", location: "San Francisco, CA", foundDate: "2026-03-04", lastActivity: "6h ago", companySize: "51-200", notes: "Interested in AI support agent" },
  { id: "l6", businessName: "Greenfield Landscaping", contactName: "Tom Baker", phone: "(555) 789-0123", email: "tom@greenfieldland.com", website: "greenfieldland.com", score: 8, status: "new", industry: "Home Services", location: "Portland, OR", foundDate: "2026-03-05", lastActivity: "30m ago", companySize: "1-10", notes: "No online booking, phone only" },
  { id: "l7", businessName: "Heritage Real Estate", contactName: "Amanda Foster", phone: "(555) 890-1234", email: "amanda@heritagere.com", website: "heritagere.com", score: 10, status: "qualified", industry: "Real Estate", location: "Charlotte, NC", foundDate: "2026-03-03", lastActivity: "3h ago", companySize: "11-50", notes: "50+ agents, needs lead response automation" },
  { id: "l8", businessName: "Iron Mountain HVAC", contactName: "Bill Crawford", phone: "(555) 901-2345", email: "bill@ironmtnhvac.com", website: "ironmtnhvac.com", score: 7, status: "new", industry: "Home Services", location: "Nashville, TN", foundDate: "2026-03-05", lastActivity: "2h ago", companySize: "11-50", notes: "Seasonal overflow issues" },
  { id: "l9", businessName: "Coastal Auto Body", contactName: "Derek Nguyen", phone: "(555) 012-3456", email: "derek@coastalautobody.com", website: "coastalautobody.com", score: 5, status: "contacted", industry: "Auto/Repair", location: "San Diego, CA", foundDate: "2026-03-04", lastActivity: "1d ago", companySize: "1-10", notes: "Small shop, budget conscious" },
  { id: "l10", businessName: "Premier Accounting Group", contactName: "Lisa Chang", phone: "(555) 123-4567", email: "lisa@premieraccounting.com", website: "premieraccounting.com", score: 8, status: "qualified", industry: "Finance", location: "Seattle, WA", foundDate: "2026-03-03", lastActivity: "5h ago", companySize: "11-50", notes: "Tax season overload, needs data entry help" },
  { id: "l11", businessName: "Bella Vita Restaurant", contactName: "Marco Rossi", phone: "(555) 234-5679", email: "marco@bellavitadining.com", website: "bellavitadining.com", score: 4, status: "new", industry: "Restaurant", location: "Chicago, IL", foundDate: "2026-03-05", lastActivity: "1h ago", companySize: "11-50", notes: "No online ordering system" },
  { id: "l12", businessName: "Evergreen Dental Care", contactName: "Dr. Rachel Woods", phone: "(555) 345-6780", email: "rwoods@evergreendental.com", website: "evergreendental.com", score: 9, status: "contacted", industry: "Healthcare", location: "Atlanta, GA", foundDate: "2026-03-04", lastActivity: "8h ago", companySize: "11-50", notes: "High no-show rate, needs reminder automation" },
  { id: "l13", businessName: "Apex Construction Co", contactName: "Robert Miller", phone: "(555) 456-7891", email: "rmiller@apexconstruction.com", website: "apexconstruction.com", score: 8, status: "new", industry: "Construction", location: "Dallas, TX", foundDate: "2026-03-05", lastActivity: "45m ago", companySize: "51-200", notes: "Bid management pain point" },
  { id: "l14", businessName: "Swift Legal Services", contactName: "Jennifer Brooks", phone: "(555) 567-8902", email: "jbrooks@swiftlegal.com", website: "swiftlegal.com", score: 6, status: "new", industry: "Legal", location: "Boston, MA", foundDate: "2026-03-05", lastActivity: "3h ago", companySize: "1-10", notes: "Solo practice, needs client intake help" },
  { id: "l15", businessName: "Platinum Realty Group", contactName: "Kevin Walsh", phone: "(555) 678-9013", email: "kevin@platinumrealty.com", website: "platinumrealty.com", score: 7, status: "qualified", industry: "Real Estate", location: "Tampa, FL", foundDate: "2026-03-03", lastActivity: "12h ago", companySize: "11-50", notes: "Slow lead follow-up, losing to competitors" },
  { id: "l16", businessName: "Valley Veterinary Clinic", contactName: "Dr. Emily Hart", phone: "(555) 789-0124", email: "ehart@valleyvet.com", website: "valleyvet.com", score: 3, status: "new", industry: "Healthcare", location: "Scottsdale, AZ", foundDate: "2026-03-05", lastActivity: "5h ago", companySize: "1-10", notes: "Small practice, limited budget" },
  { id: "l17", businessName: "Redline Electric", contactName: "Chris Santos", phone: "(555) 890-1235", email: "chris@redlineelectric.com", website: "redlineelectric.com", score: 9, status: "converted", industry: "Home Services", location: "Las Vegas, NV", foundDate: "2026-03-02", lastActivity: "2d ago", companySize: "11-50", notes: "Signed Enterprise plan, 3 AI employees" },
  { id: "l18", businessName: "Oakridge Financial", contactName: "Samantha Davis", phone: "(555) 901-2346", email: "sdavis@oakridgefin.com", website: "oakridgefin.com", score: 7, status: "contacted", industry: "Finance", location: "Denver, CO", foundDate: "2026-03-04", lastActivity: "1d ago", companySize: "51-200", notes: "Interested in bookkeeping automation" },
];

export default function LeadFunnelDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [scoreFilter, setScoreFilter] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [leads] = useState<Lead[]>(DEMO_LEADS);

  // Stats
  const today = leads.filter(l => l.foundDate === "2026-03-05").length;
  const thisWeek = leads.filter(l => l.foundDate >= "2026-03-01").length;
  const thisMonth = leads.length;
  const converted = leads.filter(l => l.status === "converted").length;
  const conversionRate = ((converted / thisMonth) * 100).toFixed(1);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = !searchQuery ||
        lead.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = !statusFilter || lead.status === statusFilter;
      let matchScore = true;
      if (scoreFilter === "high") matchScore = lead.score >= 8;
      else if (scoreFilter === "medium") matchScore = lead.score >= 5 && lead.score <= 7;
      else if (scoreFilter === "low") matchScore = lead.score < 5;
      return matchSearch && matchStatus && matchScore;
    });
  }, [leads, searchQuery, statusFilter, scoreFilter]);

  const exportCSV = () => {
    const headers = ["Business Name", "Contact", "Phone", "Email", "Website", "Score", "Status", "Industry", "Location", "Found Date"];
    const rows = filteredLeads.map(l => [l.businessName, l.contactName, l.phone, l.email, l.website, l.score, l.status, l.industry, l.location, l.foundDate]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/portal/employees" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl">🧲</div>
            <div>
              <h1 className="text-2xl font-bold">Lead Funnel Pro</h1>
              <p className="text-violet-200 text-sm">Automated Lead Generation Dashboard</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <Settings2 className="w-5 h-5" />
              </button>
              <button onClick={exportCSV} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Today</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{today}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><ArrowUpRight className="w-3 h-3" />+3 from yesterday</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-sm text-gray-500">This Week</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{thisWeek}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><ArrowUpRight className="w-3 h-3" />+12 vs last week</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">This Month</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{thisMonth}</p>
            <p className="text-xs text-gray-500 mt-1">{converted} converted</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-500">Conversion</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><ArrowUpRight className="w-3 h-3" />+1.2% this month</p>
          </div>
        </div>

        {/* Active Config Banner */}
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Magnet className="w-5 h-5 text-violet-600" />
            <div className="text-sm">
              <span className="font-semibold text-violet-800">Active Funnel:</span>
              <span className="text-violet-700 ml-2">Construction • Denver, CO • 25mi radius • 11-50 employees</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-violet-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Last scan: 30 minutes ago</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-500" />
            </div>
            <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-500">
              <option value="">All Scores</option>
              <option value="high">High (8-10)</option>
              <option value="medium">Medium (5-7)</option>
              <option value="low">Low (1-4)</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-500">
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
            </select>
            <div className="text-sm text-gray-500 ml-auto">{filteredLeads.length} leads</div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Website</th>
                  <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Found</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => {
                  const sc = getScoreColor(lead.score);
                  const st = STATUS_CONFIG[lead.status];
                  const StIcon = st.icon;
                  return (
                    <tr key={lead.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{lead.businessName}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.location} • {lead.industry}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-700">{lead.contactName}</td>
                      <td className="py-3.5 px-4">
                        <a href={`tel:${lead.phone}`} className="text-sm text-gray-700 hover:text-violet-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />{lead.phone}
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <a href={`mailto:${lead.email}`} className="text-sm text-violet-600 hover:text-violet-800 truncate max-w-[180px] block">
                          {lead.email}
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-violet-600 flex items-center gap-1">
                          <Globe className="w-3 h-3" />{lead.website}<ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ring-2 ${sc.bg} ${sc.text} ${sc.ring}`}>
                          {lead.score}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                          <StIcon className="w-3 h-3" />{st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="text-xs text-gray-500">{lead.lastActivity}</p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No leads match your filters</p>
            </div>
          )}
        </div>

        {/* Work Hours Usage */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-violet-600" />Work Hours Consumed by Lead Funnel Pro</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Lead Searches</p>
              <p className="text-xl font-bold text-gray-900">4.2 hrs</p>
              <p className="text-xs text-gray-400">84 searches × 0.05 hrs</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Web Scraping</p>
              <p className="text-xl font-bold text-gray-900">0.8 hrs</p>
              <p className="text-xs text-gray-400">80 batches × 0.01 hrs</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Outreach Emails</p>
              <p className="text-xl font-bold text-gray-900">0.6 hrs</p>
              <p className="text-xs text-gray-400">30 emails × 0.02 hrs</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between bg-violet-50 rounded-xl p-3 border border-violet-200">
            <span className="text-sm font-semibold text-violet-800">Total This Month</span>
            <span className="text-lg font-bold text-violet-700">5.6 work hours ($27.89)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
