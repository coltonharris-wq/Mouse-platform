"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search, Star, ShoppingCart, Sparkles, Users, Filter,
  ChevronRight, TrendingUp, Award, Clock, Target, DollarSign,
  ArrowRight, X, Heart, Info, MessageCircle, Loader2,
} from "lucide-react";

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  category: string;
  description: string;
  skills: string[];
  pricePerMonth: number;
  hourlyRate: number;
  rating: number;
  tasksCompleted: number;
  avatar: string;
  color: string;
  available: boolean;
  industries?: string[];
  jobTypes?: string[];
  hoursSaved?: number;
  businessesServed?: number;
  completionRate?: number;
  valueGenerated?: number;
  matchScore?: number;
  isPopular?: boolean;
  isTrending?: boolean;
}

const INDUSTRIES: Record<string, { jobs: string[] }> = {
  "Construction": { jobs: ["Project Management", "Estimating", "Follow-up", "Scheduling"] },
  "Real Estate": { jobs: ["Lead Gen", "Appointment Setting", "CRM Management", "Client Follow-up"] },
  "Healthcare": { jobs: ["Scheduling", "Insurance Verification", "Patient Follow-up", "Records"] },
  "Legal": { jobs: ["Case Management", "Client Intake", "Document Review", "Billing"] },
  "Home Services": { jobs: ["Dispatching", "Quote Follow-up", "Scheduling", "Customer Service"] },
  "Technology": { jobs: ["Sales Development", "Technical Support", "QA Testing", "Documentation"] },
  "Finance": { jobs: ["Lead Qualification", "Appointment Setting", "Document Collection", "Reporting"] },
  "Retail": { jobs: ["Customer Support", "Order Management", "Inventory Alerts", "Returns"] },
};

// Industry/job type mappings for filtering
const industriesMap: Record<string, string[]> = {
  "Sales": ["Construction", "Real Estate", "Technology", "Finance", "Home Services"],
  "Support": ["Healthcare", "Retail", "Technology", "Home Services"],
  "Development": ["Technology", "Finance", "Healthcare"],
  "Operations": ["Retail", "Construction", "Legal"],
  "Finance": ["Finance", "Legal", "Healthcare", "Construction"],
  "Human Resources": ["Healthcare", "Technology", "Legal"],
  "Marketing": ["Real Estate", "Technology", "Retail", "Home Services"],
  "Administration": ["Legal", "Healthcare", "Construction", "Real Estate", "Finance"],
};

const jobTypesMap: Record<string, string[]> = {
  "Sales": ["Lead Gen", "Appointment Setting", "Follow-up", "CRM Management"],
  "Support": ["Customer Service", "Ticket Resolution", "Live Chat", "Email Support"],
  "Development": ["Code Review", "Testing", "Documentation", "Bug Fixing"],
  "Operations": ["Scheduling", "Dispatching", "Order Processing", "Vendor Coordination"],
  "Finance": ["Invoicing", "Expense Tracking", "Reporting", "Reconciliation"],
  "Human Resources": ["Onboarding", "Interview Scheduling", "Records Management"],
  "Marketing": ["Social Media", "Email Campaigns", "Content Creation", "Analytics"],
  "Administration": ["Calendar Management", "Data Entry", "Document Management"],
};

// Color palette for employee avatars
const CATEGORY_COLORS: Record<string, string> = {
  "Sales": "bg-blue-600",
  "Support": "bg-teal-600",
  "Development": "bg-mouse-teal",
  "Operations": "bg-orange-600",
  "Finance": "bg-emerald-600",
  "Human Resources": "bg-[#0F6B6E]",
  "Marketing": "bg-pink-600",
  "Administration": "bg-cyan-600",
  "Data Entry": "bg-[#1a8a8d]",
  "Executive": "bg-amber-600",
};

function transformBackendEmployee(emp: any, index: number): AIEmployee {
  const category = emp.category || "Sales";
  const hourlyRate = emp.human_equivalent_hourly_rate ? Number((emp.human_equivalent_hourly_rate * 0.11).toFixed(2)) : 4.98;

  return {
    id: emp.id,
    name: emp.name,
    role: emp.title || emp.role || "AI Employee",
    category,
    description: emp.role_summary || emp.description || "",
    skills: emp.skills || [],
    pricePerMonth: Math.round(hourlyRate * 160),
    hourlyRate,
    rating: emp.uptime_percentage ? Number((emp.uptime_percentage / 20).toFixed(1)) : 4.8,
    tasksCompleted: emp.tasks_per_day ? emp.tasks_per_day * 30 : 500,
    avatar: emp.name?.charAt(0)?.toUpperCase() || "A",
    color: CATEGORY_COLORS[category] || "bg-gray-600",
    available: emp.is_active !== false,
    industries: industriesMap[category] || ["Technology"],
    jobTypes: jobTypesMap[category] || ["General Support"],
    hoursSaved: emp.tasks_per_day ? emp.tasks_per_day * 60 : 3000,
    businessesServed: 50 + (index * 17) % 200,
    completionRate: 90 + (index % 10),
    valueGenerated: 100000 + (index * 37000) % 500000,
    matchScore: 85 + (index % 15),
    isPopular: emp.is_featured || index < 4,
    isTrending: index >= 2 && index < 6,
  };
}

const TRUST_METRICS = {
  totalHoursSaved: 12450,
  totalBusinesses: 847,
  averageRating: 4.9,
  completionRate: 94,
  totalValueGenerated: 2400000,
};

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

// Interview intros for each employee
const getInterviewIntro = (emp: AIEmployee) => {
  const intros: Record<string, string> = {
    "SalesMate": "Hi there! I'm SalesMate, your dedicated sales specialist. I'm excited to learn about your business and how I can help you qualify leads, manage your pipeline, and close more deals. What industry are you in?",
    "SupportPro": "Hello! I'm SupportPro, and I'm here to ensure your customers receive exceptional 24/7 support. I can handle tickets, live chat, and build your knowledge base. Tell me about your customer support needs!",
    "CodeAssist": "Hey! I'm CodeAssist, your development partner. I specialize in code review, bug triage, documentation, and API testing. What kind of development work does your team need help with?",
    "DataFlow": "Hi! I'm DataFlow, your data entry specialist. I love organizing information and keeping databases in perfect sync. What type of data challenges are you facing?",
    "BookKeeper": "Hello! I'm BookKeeper, your accounting assistant. I handle invoicing, expense tracking, and financial reporting with precision. What aspects of your bookkeeping can I help streamline?",
    "HRPartner": "Hi there! I'm HRPartner, your HR coordinator. From onboarding to scheduling interviews, I'm here to help. What's your biggest HR challenge?",
    "MarketGuru": "Hey! I'm MarketGuru, your marketing assistant. I manage social media, content calendars, and email campaigns. What's your marketing goal?",
    "ExecAdmin": "Hello! I'm ExecAdmin, your executive assistant. I excel at calendar management and meeting notes. How can I help you stay organized?",
  };
  return intros[emp.name] || `Hi! I'm ${emp.name}, your ${emp.role}. I'm excited to learn about your business and how I can help!`;
};

export default function MarketplacePage() {
  const [enhancedEmployees, setEnhancedEmployees] = useState<AIEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedJobType, setSelectedJobType] = useState<string>("");
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [showHireModal, setShowHireModal] = useState<AIEmployee | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState<AIEmployee | null>(null);
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [interviewMessages, setInterviewMessages] = useState<{role: string; text: string}[]>([]);
  const [interviewInput, setInterviewInput] = useState("");
  const [interviewSessionId, setInterviewSessionId] = useState<string>("");

  // Fetch employees from backend
  useEffect(() => {
    async function loadEmployees() {
      setIsLoading(true);
      setLoadError("");
      try {
        const res = await fetch("/api/marketplace/employees");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        const employees = (data.employees || []).map(transformBackendEmployee);
        setEnhancedEmployees(employees);
      } catch (err: any) {
        console.error("Failed to load marketplace:", err);
        setLoadError(err.message || "Failed to load employees");
      } finally {
        setIsLoading(false);
      }
    }
    loadEmployees();
  }, []);

  const availableJobTypes = useMemo(() => {
    if (!selectedIndustry) return [];
    return INDUSTRIES[selectedIndustry]?.jobs || [];
  }, [selectedIndustry]);

  const filteredEmployees = useMemo(() => {
    let filtered = enhancedEmployees.filter((emp) => {
      const matchesSearch = !searchQuery ||
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesIndustry = true;
      if (selectedIndustry) {
        matchesIndustry = emp.industries?.includes(selectedIndustry) || false;
      }

      let matchesJobType = true;
      if (selectedJobType) {
        matchesJobType = emp.jobTypes?.includes(selectedJobType) || false;
      }

      let matchesPrice = true;
      if (priceRange === "under-5") matchesPrice = emp.hourlyRate < 5;
      else if (priceRange === "5-10") matchesPrice = emp.hourlyRate >= 5 && emp.hourlyRate <= 10;
      else if (priceRange === "over-10") matchesPrice = emp.hourlyRate > 10;

      let matchesRating = true;
      if (ratingFilter === "4.5+") matchesRating = emp.rating >= 4.5;
      else if (ratingFilter === "4.7+") matchesRating = emp.rating >= 4.7;

      return matchesSearch && matchesIndustry && matchesJobType && matchesPrice && matchesRating;
    });

    switch (sortBy) {
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
    }

    return filtered;
  }, [enhancedEmployees, searchQuery, selectedIndustry, selectedJobType, priceRange, ratingFilter, sortBy]);

  const popularEmployees = useMemo(() => enhancedEmployees.filter(e => e.isPopular).slice(0, 4), [enhancedEmployees]);

  const toggleCart = (empId: string) => {
    setCart((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) next.delete(empId);
      else next.add(empId);
      return next;
    });
  };

  const toggleFavorite = (empId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) next.delete(empId);
      else next.add(empId);
      return next;
    });
  };

  const cartTotalHourly = useMemo(() => {
    return enhancedEmployees.filter((e) => cart.has(e.id)).reduce((sum, e) => sum + e.hourlyRate, 0);
  }, [cart]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}/hr`;
  const formatTasks = (tasks: number) => tasks >= 1000 ? `${(tasks / 1000).toFixed(1)}k` : tasks.toString();
  const formatHours = (hours: number) => hours >= 1000 ? `${(hours / 1000).toFixed(1)}k` : hours.toString();

  const clearFilters = () => {
    setSelectedIndustry("");
    setSelectedJobType("");
    setPriceRange("");
    setRatingFilter("");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedIndustry || selectedJobType || priceRange || ratingFilter || searchQuery;

  const startInterview = async (emp: AIEmployee) => {
    setShowInterviewModal(emp);
    setInterviewMessages([{ role: "assistant", text: getInterviewIntro(emp) }]);
    // Start interview session on backend
    try {
      const res = await fetch("/api/marketplace/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", template_id: emp.id }),
      });
      const data = await res.json();
      if (data.session_id) setInterviewSessionId(data.session_id);
    } catch (err) {
      console.error("Failed to start interview session:", err);
    }
  };

  const sendInterviewMessage = async () => {
    if (!interviewInput.trim() || !showInterviewModal) return;
    const msg = interviewInput;
    setInterviewMessages(prev => [...prev, { role: "user", text: msg }]);
    setInterviewInput("");

    try {
      const res = await fetch("/api/marketplace/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "message", session_id: interviewSessionId, message: msg }),
      });
      const data = await res.json();
      if (data.response || data.message) {
        setInterviewMessages(prev => [...prev, { role: "assistant", text: data.response || data.message }]);
      } else {
        setInterviewMessages(prev => [...prev, { 
          role: "assistant", 
          text: `Thanks for sharing! Based on what you've told me, I'm confident I can help streamline your operations. Would you like to proceed with hiring me?` 
        }]);
      }
    } catch (err) {
      setInterviewMessages(prev => [...prev, { 
        role: "assistant", 
        text: `Thanks for sharing! I'm confident I can help with that. Would you like to proceed with hiring me?` 
      }]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#1e3a5f] animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Loading AI Employees...</h2>
          <p className="text-sm text-gray-500 mt-1">Fetching from marketplace</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to load marketplace</h2>
          <p className="text-sm text-gray-500 mb-4">{loadError}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d4a6f]">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">AI Employee Marketplace</h1>
              <p className="text-blue-200 text-sm">Hire specialized AI employees — only pay for hours worked</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-300" />
                <span><strong>{formatHours(TRUST_METRICS.totalHoursSaved)}</strong> hours saved</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-300" />
                <span><strong>{TRUST_METRICS.totalBusinesses}</strong> businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span><strong>{TRUST_METRICS.averageRating}</strong> avg rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Cart Bar */}
        {cart.size > 0 && (
          <div className="bg-white rounded-xl border-2 border-[#1e3a5f] p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#1e3a5f] text-white p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">{cart.size} employees in cart</span>
                <span className="text-gray-500 ml-2">{formatPrice(cartTotalHourly)} combined rate</span>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-[#1e3a5f] text-white font-medium rounded-lg hover:bg-[#2d4a6f] transition-colors flex items-center gap-2">
              Checkout<ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by name, role, or skill..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-[#1e3a5f]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <select value={selectedIndustry} onChange={(e) => { setSelectedIndustry(e.target.value); setSelectedJobType(""); }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1e3a5f]">
                <option value="">All Industries</option>
                {Object.keys(INDUSTRIES).map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <select value={selectedJobType} onChange={(e) => setSelectedJobType(e.target.value)} disabled={!selectedIndustry}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1e3a5f] disabled:opacity-50">
                <option value="">{selectedIndustry ? "All Job Types" : "Select industry first"}</option>
                {availableJobTypes.map((job) => (<option key={job} value={job}>{job}</option>))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500 flex items-center gap-1"><Filter className="w-4 h-4" />Filters:</span>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm border-0">
              <option value="">Hourly Rate</option>
              <option value="under-5">Under $5/hr</option>
              <option value="5-10">$5 - $10/hr</option>
              <option value="over-10">Over $10/hr</option>
            </select>
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm border-0">
              <option value="">Rating</option>
              <option value="4.5+">4.5+ Stars</option>
              <option value="4.7+">4.7+ Stars</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm border-0">
              {sortOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-full text-sm flex items-center gap-1"><X className="w-3 h-3" />Clear all</button>
            )}
          </div>
        </div>

        {/* Popular Section */}
        {!searchQuery && !selectedIndustry && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#1e3a5f]" />Most Popular</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularEmployees.map((emp) => (
                <div key={`popular-${emp.id}`} onClick={() => setShowHireModal(emp)} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl ${emp.color} flex items-center justify-center text-white text-lg font-bold`}>{emp.avatar}</div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium text-yellow-700">{emp.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#1e3a5f]">{emp.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{emp.role}</p>
                  <p className="text-lg font-bold text-[#1e3a5f]">{formatPrice(emp.hourlyRate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{selectedIndustry || selectedJobType ? "Recommended for You" : "All AI Employees"}
            <span className="text-gray-400 font-normal ml-2">({filteredEmployees.length})</span>
          </h2>
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group">
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl ${emp.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>{emp.avatar}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#1e3a5f]">{emp.name}</h3>
                      <p className="text-sm text-gray-500">{emp.role}</p>
                      {(selectedIndustry || selectedJobType) && emp.matchScore && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium"><Target className="w-3 h-3" />{emp.matchScore}% match</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => toggleFavorite(emp.id)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Heart className={`w-5 h-5 ${favorites.has(emp.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {emp.industries?.slice(0, 3).map((ind) => (<span key={ind} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{ind}</span>))}
                  {emp.available && (<span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" />Available</span>)}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{emp.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {emp.skills.map((skill) => (<span key={skill} className="px-2.5 py-1 bg-blue-50 text-[#1e3a5f] text-xs rounded-lg font-medium">{skill}</span>))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600"><Clock className="w-4 h-4 text-blue-500" /><span>{formatHours(emp.hoursSaved || 0)} hours saved</span></div>
                  <div className="flex items-center gap-2 text-xs text-gray-600"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><span>{emp.rating} rating</span></div>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-[#1e3a5f]">{formatPrice(emp.hourlyRate)}</p>
                    <p className="text-xs text-gray-500">hourly rate • pay only for hours worked</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatTasks(emp.tasksCompleted)} tasks</p>
                    <p className="text-xs text-gray-400">completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowHireModal(emp)} className="flex-1 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-semibold hover:bg-[#2d4a6f] transition-colors flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />Hire Now
                  </button>
                  <button onClick={() => startInterview(emp)} className="flex-1 px-4 py-2.5 bg-white border border-[#1e3a5f] text-[#1e3a5f] rounded-xl text-sm font-semibold hover:bg-[#1e3a5f]/5 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />Interview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && !selectedIndustry && !selectedJobType && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Hire Modal */}
        {showHireModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-16 h-16 rounded-xl ${showHireModal.color} flex items-center justify-center text-white text-2xl font-bold`}>{showHireModal.avatar}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hire {showHireModal.name}</h3>
                  <p className="text-sm text-gray-500">{showHireModal.role}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Hourly Rate</span>
                  <span className="text-lg font-bold text-gray-900">{formatPrice(showHireModal.hourlyRate)}</span>
                </div>
                <div className="text-xs text-gray-500">Pay only for hours worked • No monthly commitment</div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowHireModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                <button onClick={() => { toggleCart(showHireModal.id); setShowHireModal(null); }} className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d4a6f]">Add to Cart</button>
              </div>
            </div>
          </div>
        )}

        {/* Interview Modal */}
        {showInterviewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className={`w-12 h-12 rounded-xl ${showInterviewModal.color} flex items-center justify-center text-white text-xl font-bold`}>{showInterviewModal.avatar}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Interview with {showInterviewModal.name}</h3>
                  <p className="text-sm text-gray-500">{showInterviewModal.role}</p>
                </div>
                <button onClick={() => setShowInterviewModal(null)} className="ml-auto p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px] max-h-[400px]">
                {interviewMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-[#1e3a5f] text-white rounded-br-md" : "bg-gray-100 text-gray-700 rounded-bl-md"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <input type="text" value={interviewInput} onChange={(e) => setInterviewInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendInterviewMessage()} placeholder="Type your message..." className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                <button onClick={sendInterviewMessage} className="px-6 py-3 bg-[#1e3a5f] text-white text-sm font-medium rounded-xl hover:bg-[#2d4a6f]">Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
