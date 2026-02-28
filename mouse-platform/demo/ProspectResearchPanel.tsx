"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Globe,
  Linkedin,
  Newspaper,
  Target,
  Bot,
  Mail,
  Send,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  Users,
  MapPin,
  DollarSign,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface PainPoint {
  category: string;
  description: string;
  severity: "high" | "medium" | "low";
  evidence: string;
}

interface AIEmployeeRecommendation {
  role: string;
  reason: string;
  estimated_impact: string;
  hourly_value: number;
}

interface NewsItem {
  title: string;
  link: string;
  published: string;
  summary: string;
}

interface CompanyResearch {
  domain: string;
  company_name: string;
  industry?: string;
  sub_industry?: string;
  employee_count?: number;
  revenue_range?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  description?: string;
  website_summary?: string;
  products_services: string[];
  value_proposition?: string;
  target_audience?: string;
  linkedin_url?: string;
  pain_points: PainPoint[];
  automation_opportunities: string[];
  tech_stack_gaps: string[];
  recommended_employees: AIEmployeeRecommendation[];
  email_subject?: string;
  personalized_email?: string;
  research_date: string;
  data_sources: string[];
  confidence_score: number;
  recent_news?: NewsItem[];
}

interface ProspectResearchPanelProps {
  onSendEmail?: (research: CompanyResearch, editedEmail?: string) => void;
  onSaveResearch?: (research: CompanyResearch) => void;
}

export default function ProspectResearchPanel({
  onSendEmail,
  onSaveResearch,
}: ProspectResearchPanelProps) {
  const [domain, setDomain] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [research, setResearch] = useState<CompanyResearch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "pain-points" | "email">("overview");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview", "recommendations"]));
  const [editedEmail, setEditedEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleResearch = async () => {
    if (!domain) return;
    
    setLoading(true);
    setError(null);
    setResearch(null);
    
    try {
      const response = await fetch("/api/research/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, company_name: companyName || undefined }),
      });
      
      if (!response.ok) {
        throw new Error("Research failed");
      }
      
      const data = await response.json();
      setResearch(data);
      setEditedEmail(data.personalized_email || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!research) return;
    
    setSendStatus("sending");
    
    try {
      if (onSendEmail) {
        await onSendEmail(research, isEditingEmail ? editedEmail : undefined);
      }
      setSendStatus("sent");
      setTimeout(() => setSendStatus("idle"), 3000);
    } catch {
      setSendStatus("error");
    }
  };

  const handleSaveResearch = () => {
    if (research && onSaveResearch) {
      onSaveResearch(research);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">Deep Research Personalization</h1>
        </div>
        <p className="text-purple-100">
          AI-powered prospect research that generates personalized emails with specific AI employee recommendations
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Domain *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name (optional)
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleResearch}
              disabled={loading || !domain}
              className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Research Company
                </>
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Research Results */}
      {research && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Overview Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("overview")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Company Overview</h3>
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                    {Math.round(research.confidence_score * 100)}% confidence
                  </span>
                </div>
                {expandedSections.has("overview") ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.has("overview") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{research.company_name}</h2>
                          <p className="text-gray-500">{research.domain}</p>
                        </div>
                        <div className="flex gap-2">
                          {research.linkedin_url && (
                            <a
                              href={research.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Linkedin className="w-5 h-5" />
                            </a>
                          )}
                          <a
                            href={`https://${research.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {research.industry && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Industry</p>
                            <p className="font-medium text-gray-900">{research.industry}</p>
                          </div>
                        )}
                        {research.employee_count && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Employees</p>
                            <p className="font-medium text-gray-900">{research.employee_count.toLocaleString()}</p>
                          </div>
                        )}
                        {research.revenue_range && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Revenue</p>
                            <p className="font-medium text-gray-900">{research.revenue_range}</p>
                          </div>
                        )}
                        {research.location?.city && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Location</p>
                            <p className="font-medium text-gray-900">
                              {research.location.city}, {research.location.state}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {research.website_summary && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
                          <p className="text-gray-600 text-sm">{research.website_summary}</p>
                        </div>
                      )}
                      
                      {research.products_services.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Products & Services</h4>
                          <div className="flex flex-wrap gap-2">
                            {research.products_services.map((product) => (
                              <span
                                key={product}
                                className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-full"
                              >
                                {product}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {research.value_proposition && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="text-sm font-medium text-green-800 mb-1">Value Proposition</h4>
                          <p className="text-sm text-green-700">{research.value_proposition}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pain Points Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("pain-points")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-gray-900">Pain Points & Opportunities</h3>
                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                    {research.pain_points.length} identified
                  </span>
                </div>
                {expandedSections.has("pain-points") ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.has("pain-points") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-4 space-y-4">
                      {/* Pain Points */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Identified Pain Points</h4>
                        <div className="space-y-3">
                          {research.pain_points.map((painPoint, idx) => (
                            <div
                              key={idx}
                              className={`p-3 border rounded-lg ${getSeverityColor(painPoint.severity)}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium uppercase tracking-wide">
                                  {painPoint.category}
                                </span>
                                <span className="text-xs opacity-75">• {painPoint.severity} severity</span>
                              </div>
                              <p className="font-medium mb-1">{painPoint.description}</p>
                              <p className="text-sm opacity-75">Evidence: {painPoint.evidence}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Automation Opportunities */}
                      {research.automation_opportunities.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Automation Opportunities</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {research.automation_opportunities.map((opp, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-lg text-sm"
                              >
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                {opp}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Tech Stack Gaps */}
                      {research.tech_stack_gaps.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Tech Stack Gaps</h4>
                          <div className="flex flex-wrap gap-2">
                            {research.tech_stack_gaps.map((gap, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full"
                              >
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Employee Recommendations */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("recommendations")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Recommended AI Employees</h3>
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {research.recommended_employees.length} roles
                  </span>
                </div>
                {expandedSections.has("recommendations") ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.has("recommendations") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {research.recommended_employees.map((employee, idx) => (
                          <div
                            key={idx}
                            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{employee.role}</h4>
                              <span className={`text-xs font-medium ${getImpactColor(employee.estimated_impact)}`}>
                                {employee.estimated_impact} impact
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{employee.reason}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-500">
                                Value: <span className="font-medium text-gray-900">${employee.hourly_value}/hr</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Email Preview & Actions */}
          <div className="space-y-6">
            {/* Email Preview Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Generated Email</h3>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                  <p className="text-sm font-medium text-gray-900">{research.email_subject}</p>
                </div>
                
                {/* Email Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500">Body</label>
                    <button
                      onClick={() => setIsEditingEmail(!isEditingEmail)}
                      className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      {isEditingEmail ? "Done" : "Edit"}
                    </button>
                  </div>
                  
                  {isEditingEmail ? (
                    <textarea
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="w-full h-64 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                      {editedEmail}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleSendEmail}
                    disabled={sendStatus === "sending"}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {sendStatus === "sending" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : sendStatus === "sent" ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Sent!
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Email
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleSaveResearch}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Research
                  </button>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Data Sources</h4>
              <div className="flex flex-wrap gap-2">
                {research.data_sources.map((source) => (
                  <span
                    key={source}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize"
                  >
                    {source.replace('_', ' ')}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Researched on {new Date(research.research_date).toLocaleDateString()}
              </p>
            </div>

            {/* Confidence Score */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-medium text-purple-900">Research Confidence</h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all"
                    style={{ width: `${research.confidence_score * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-purple-900">
                  {Math.round(research.confidence_score * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!research && !loading && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Research</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter a company domain above to generate deep research, identify pain points, 
            and create personalized outreach emails with AI employee recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
