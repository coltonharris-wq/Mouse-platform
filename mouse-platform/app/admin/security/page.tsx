"use client";

import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  Users,
  Ban,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  Settings,
  TrendingUp,
  Activity,
  Lock,
  FileText,
  Clock,
} from "lucide-react";
import SecurityAlertCard from "@/components/SecurityAlertCard";
import RiskScoreBadge, { RiskScoreCircular } from "@/components/RiskScoreBadge";
import {
  FraudAlert,
  ResellerRiskProfile,
  mockFraudAlerts,
  mockResellerRiskProfiles,
} from "@/lib/fraud-detection";

type TabType = "overview" | "alerts" | "resellers" | "investigations" | "settings";

export default function SecurityDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [alerts, setAlerts] = useState<FraudAlert[]>(mockFraudAlerts);
  const [profiles] = useState<ResellerRiskProfile[]>(mockResellerRiskProfiles);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const summary = {
    totalAlerts: alerts.length,
    openAlerts: alerts.filter((a) => a.status === "open").length,
    highRiskAlerts: alerts.filter((a) => a.riskLevel === "high").length,
    suspendedAccounts: profiles.filter(
      (p) => p.accountStatus === "suspended" || p.accountStatus === "banned"
    ).length,
    avgRiskScore: Math.round(
      profiles.reduce((sum, p) => sum + p.riskScore, 0) / profiles.length
    ),
    totalScans: 1247,
    scansToday: 43,
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      searchQuery === "" ||
      alert.resellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.evidence.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = filterRisk === "all" || alert.riskLevel === filterRisk;
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const filteredProfiles = profiles.filter(
    (profile) =>
      searchQuery === "" ||
      profile.resellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProfiles = [...filteredProfiles].sort((a, b) => b.riskScore - a.riskScore);

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "resolved" as const } : a))
    );
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "false_positive" as const } : a))
    );
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-mouse-navy flex items-center gap-2">
            <Shield className="w-7 h-7 text-mouse-teal" />
            Security Center
          </h1>
          <p className="text-mouse-slate mt-1">Fraud detection and reseller risk monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-mouse-charcoal bg-white border border-mouse-slate/30 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-mouse-navy rounded-lg hover:bg-mouse-navy/90 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<AlertTriangle className="w-5 h-5 text-red-600" />} label="High Risk Alerts" value={summary.highRiskAlerts} trend="+2 today" trendColor="red" />
        <StatCard icon={<Activity className="w-5 h-5 text-mouse-teal" />} label="Open Alerts" value={summary.openAlerts} trend={`of ${summary.totalAlerts} total`} trendColor="neutral" />
        <StatCard icon={<Ban className="w-5 h-5 text-mouse-red" />} label="Suspended Accounts" value={summary.suspendedAccounts} trend="Action required" trendColor="red" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-mouse-green" />} label="Scans Today" value={summary.scansToday} trend="All clear" trendColor="green" />
      </div>

      <div className="border-b border-mouse-slate/20">
        <nav className="flex gap-6">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<Activity className="w-4 h-4" />} label="Overview" />
          <TabButton active={activeTab === "alerts"} onClick={() => setActiveTab("alerts")} icon={<AlertTriangle className="w-4 h-4" />} label="Alerts" badge={summary.openAlerts} />
          <TabButton active={activeTab === "resellers"} onClick={() => setActiveTab("resellers")} icon={<Users className="w-4 h-4" />} label="Reseller Risk" />
          <TabButton active={activeTab === "investigations"} onClick={() => setActiveTab("investigations")} icon={<Eye className="w-4 h-4" />} label="Investigations" />
          <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Settings className="w-4 h-4" />} label="Settings" />
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "overview" && <OverviewTab summary={summary} alerts={alerts} profiles={profiles} onResolve={handleResolveAlert} onDismiss={handleDismissAlert} />}
        {activeTab === "alerts" && <AlertsTab alerts={filteredAlerts} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterRisk={filterRisk} setFilterRisk={setFilterRisk} filterStatus={filterStatus} setFilterStatus={setFilterStatus} onResolve={handleResolveAlert} onDismiss={handleDismissAlert} />}
        {activeTab === "resellers" && <ResellersTab profiles={sortedProfiles} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
        {activeTab === "investigations" && <InvestigationsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, trendColor }: { icon: React.ReactNode; label: string; value: number; trend: string; trendColor: "red" | "green" | "neutral" }) {
  const trendClasses = { red: "text-red-600", green: "text-green-600", neutral: "text-mouse-slate" };
  return (
    <div className="bg-white rounded-xl border border-mouse-slate/20 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className={`text-xs font-medium ${trendClasses[trendColor]}`}>{trend}</span>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-mouse-navy">{value}</p>
        <p className="text-sm text-mouse-slate">{label}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${active ? "border-mouse-teal text-mouse-teal" : "border-transparent text-mouse-slate hover:text-mouse-charcoal"}`}>
      {icon}
      {label}
      {badge !== undefined && badge > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">{badge}</span>}
    </button>
  );
}

function OverviewTab({ summary, alerts, profiles, onResolve, onDismiss }: { summary: any; alerts: FraudAlert[]; profiles: ResellerRiskProfile[]; onResolve: (id: string) => void; onDismiss: (id: string) => void }) {
  const recentAlerts = alerts.filter((a) => a.status === "open").sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()).slice(0, 3);
  const highRiskResellers = profiles.filter((p) => p.riskScore > 50).sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-6">
          <h3 className="font-semibold text-mouse-navy mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-mouse-orange" />
            Recent High-Risk Alerts
          </h3>
          {recentAlerts.length > 0 ? (
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <SecurityAlertCard key={alert.id} alert={alert} onResolve={onResolve} onDismiss={onDismiss} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-mouse-slate">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p>No open high-risk alerts</p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-6">
          <h3 className="font-semibold text-mouse-navy mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-mouse-teal" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            <ActivityItem time="2 hours ago" description="High-risk alert generated" detail="John Smith - Private invoice attempt detected" type="alert" />
            <ActivityItem time="5 hours ago" description="Reseller account suspended" detail="Lisa Thompson - Platform violations" type="action" />
            <ActivityItem time="12 hours ago" description="Alert marked as resolved" detail="Alex Rivera - False positive confirmed" type="success" />
            <ActivityItem time="1 day ago" description="Security scan completed" detail="43 communications scanned, 2 alerts generated" type="scan" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-6 text-center">
          <h3 className="font-semibold text-mouse-navy mb-4">Platform Risk Score</h3>
          <div className="flex justify-center">
            <RiskScoreCircular score={summary.avgRiskScore} size={120} strokeWidth={10} />
          </div>
          <p className="mt-4 text-sm text-mouse-slate">Average across {profiles.length} resellers</p>
        </div>
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-6">
          <h3 className="font-semibold text-mouse-navy mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-mouse-red" />
            Highest Risk Resellers
          </h3>
          <div className="space-y-3">
            {highRiskResellers.map((profile) => (
              <div key={profile.resellerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-mouse-charcoal truncate">{profile.resellerName}</p>
                  <p className="text-xs text-mouse-slate">{profile.alertCount} alerts • {profile.flaggedTransactions} flagged</p>
                </div>
                <RiskScoreBadge score={profile.riskScore} showLabel={false} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ time, description, detail, type }: { time: string; description: string; detail: string; type: "alert" | "action" | "success" | "scan" }) {
  const icons = { alert: <AlertTriangle className="w-4 h-4 text-red-500" />, action: <Ban className="w-4 h-4 text-mouse-orange" />, success: <CheckCircle className="w-4 h-4 text-green-500" />, scan: <Shield className="w-4 h-4 text-mouse-teal" /> };
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-50 rounded-lg">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-mouse-charcoal">{description}</p>
        <p className="text-xs text-mouse-slate">{detail}</p>
        <p className="text-xs text-mouse-slate mt-1">{time}</p>
      </div>
    </div>
  );
}

function AlertsTab({ alerts, searchQuery, setSearchQuery, filterRisk, setFilterRisk, filterStatus, setFilterStatus, onResolve, onDismiss }: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-mouse-slate/20">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
            <input type="text" placeholder="Search alerts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-mouse-slate/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-mouse-slate" />
          <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="px-3 py-2 text-sm border border-mouse-slate/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30">
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm border border-mouse-slate/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30">
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>
        </div>
      </div>
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert: FraudAlert) => <SecurityAlertCard key={alert.id} alert={alert} onResolve={onResolve} onDismiss={onDismiss} />)
        ) : (
          <div className="bg-white rounded-xl border border-mouse-slate/20 p-12 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium text-mouse-navy">No alerts found</h3>
            <p className="text-mouse-slate mt-1">{searchQuery || filterRisk !== "all" || filterStatus !== "all" ? "Try adjusting your filters" : "All clear! No fraud alerts detected."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResellersTab({ profiles, searchQuery, setSearchQuery }: { profiles: ResellerRiskProfile[]; searchQuery: string; setSearchQuery: (q: string) => void }) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { active: "bg-green-100 text-green-700", suspended: "bg-red-100 text-red-700", banned: "bg-gray-800 text-white", under_review: "bg-yellow-100 text-yellow-700" };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-mouse-slate/20">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
          <input type="text" placeholder="Search resellers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-mouse-slate/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-mouse-teal/30" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-mouse-slate/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite text-left">
                <th className="px-6 py-3 text-mouse-slate font-medium">Reseller</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Risk Score</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Alerts</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                <th className="px-6 py-3 text-mouse-slate font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {profiles.map((profile) => (
                <tr key={profile.resellerId} className="hover:bg-mouse-offwhite transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-mouse-charcoal">{profile.resellerName}</p>
                    <p className="text-xs text-mouse-slate">{profile.resellerId}</p>
                  </td>
                  <td className="px-6 py-4"><RiskScoreBadge score={profile.riskScore} size="sm" /></td>
                  <td className="px-6 py-4">
                    <span className="text-mouse-charcoal">{profile.alertCount}</span>
                    {profile.openAlerts > 0 && <span className="ml-2 text-xs text-red-600 font-medium">({profile.openAlerts} open)</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(profile.accountStatus)}`}>{profile.accountStatus.replace("_", " ")}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-mouse-slate hover:text-mouse-teal hover:bg-gray-100 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                      {profile.accountStatus === "active" && profile.riskScore > 70 && <button className="p-1.5 text-mouse-slate hover:text-mouse-red hover:bg-gray-100 rounded transition-colors"><Ban className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InvestigationsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-6">
        <h3 className="font-semibold text-mouse-navy mb-4">Investigation Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InvestigationCard icon={<FileText className="w-6 h-6 text-mouse-teal" />} title="Communication History" description="View all reseller-customer messages, emails, and notes" action="View Logs" />
          <InvestigationCard icon={<Clock className="w-6 h-6 text-mouse-orange" />} title="Edit History" description="Track changes to customer emails, invoices, and notes" action="View History" />
          <InvestigationCard icon={<Lock className="w-6 h-6 text-mouse-red" />} title="IP Analysis" description="Track multiple accounts from same IP addresses" action="Analyze IPs" />
          <InvestigationCard icon={<Download className="w-6 h-6 text-mouse-green" />} title="Evidence Export" description="Export all evidence for legal proceedings" action="Export" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-6">
        <h3 className="font-semibold text-mouse-navy mb-4">Open Investigations</h3>
        <div className="space-y-3">
          <InvestigationItem id="INV-001" reseller="John Smith" type="Private Invoice Attempts" status="In Progress" opened="2 days ago" />
          <InvestigationItem id="INV-002" reseller="Lisa Thompson" type="Platform Violations" status="Pending Evidence" opened="5 days ago" />
        </div>
      </div>
    </div>
  );
}

function InvestigationCard({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action: string }) {
  return (
    <div className="p-4 border border-mouse-slate/20 rounded-lg hover:border-mouse-teal/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <div className="flex-1">
          <h4 className="font-medium text-mouse-charcoal">{title}</h4>
          <p className="text-sm text-mouse-slate mt-1">{description}</p>
          <button className="mt-3 text-sm font-medium text-mouse-teal hover:underline">{action}</button>
        </div>
      </div>
    </div>
  );
}

function InvestigationItem({ id, reseller, type, status, opened }: { id: string; reseller: string; type: string; status: string; opened: string }) {
  const statusColors: Record<string, string> = { "In Progress": "bg-blue-100 text-blue-700", "Pending Evidence": "bg-yellow-100 text-yellow-700", Closed: "bg-green-100 text-green-700" };
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-mouse-charcoal">{id}</span>
          <span className="text-mouse-slate">•</span>
          <span className="text-mouse-charcoal">{reseller}</span>
        </div>
        <p className="text-sm text-mouse-slate mt-1">{type}</p>
      </div>
      <div className="text-right">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>{status}</span>
        <p className="text-xs text-mouse-slate mt-1">Opened {opened}</p>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-6">
        <h3 className="font-semibold text-mouse-navy mb-4">Detection Settings</h3>
        <div className="space-y-6">
          <SettingRow label="Scan all communications" description="Automatically scan chat, email, and notes for suspicious content" defaultChecked={true} />
          <SettingRow label="Email notifications" description="Send email alerts to colton.harris@automioapp.com for medium+ risk" defaultChecked={true} />
          <SettingRow label="Auto-freeze payouts" description="Automatically freeze reseller payouts for high-risk alerts" defaultChecked={true} />
          <SettingRow label="Require verification" description="Require additional verification for resellers with risk score >70" defaultChecked={false} />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-6">
        <h3 className="font-semibold text-mouse-navy mb-4">Risk Thresholds</h3>
        <div className="space-y-4">
          <ThresholdRow label="High Risk" threshold="71-100" color="red" />
          <ThresholdRow label="Medium Risk" threshold="31-70" color="orange" />
          <ThresholdRow label="Low Risk" threshold="1-30" color="yellow" />
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, description, defaultChecked }: { label: string; description: string; defaultChecked: boolean }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="font-medium text-mouse-charcoal">{label}</p>
        <p className="text-sm text-mouse-slate">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mouse-teal/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mouse-teal"></div>
      </label>
    </div>
  );
}

function ThresholdRow({ label, threshold, color }: { label: string; threshold: string; color: string }) {
  const colors: Record<string, string> = { red: "bg-red-500", orange: "bg-orange-500", yellow: "bg-yellow-500" };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${colors[color]}`}></div>
        <span className="font-medium text-mouse-charcoal">{label}</span>
      </div>
      <span className="text-sm text-mouse-slate">{threshold}</span>
    </div>
  );
}
