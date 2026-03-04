"use client";

import { useState } from "react";
import {
  Clock,
  Download,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Mail,
  Bell,
  CreditCard,
  ChevronDown,
  Mic,
  Image,
  Video,
  Monitor,
  MessageSquare,
  Zap,
  Bot,
  Server,
  Code,
  ArrowRight,
  DollarSign,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useWorkHours, FeatureType } from "@/app/context/WorkHoursContext";
import { getFeatureDisplayName, formatWorkHoursCost, HOURLY_RATE } from "@/lib/work-hours-costs";

// Mock data for usage chart
const usageData = [
  { date: "Feb 1", hours: 1.2 },
  { date: "Feb 2", hours: 0.8 },
  { date: "Feb 3", hours: 1.5 },
  { date: "Feb 4", hours: 1.0 },
  { date: "Feb 5", hours: 1.8 },
  { date: "Feb 6", hours: 0.6 },
  { date: "Feb 7", hours: 1.4 },
  { date: "Feb 8", hours: 1.1 },
  { date: "Feb 9", hours: 0.9 },
  { date: "Feb 10", hours: 1.6 },
  { date: "Feb 11", hours: 1.3 },
  { date: "Feb 12", hours: 2.0 },
  { date: "Feb 13", hours: 0.7 },
  { date: "Feb 14", hours: 1.5 },
  { date: "Feb 15", hours: 1.2 },
];

const FEATURE_COLORS: Record<FeatureType, string> = {
  text_chat: '#0F6B6E',
  voice_chat: '#8B5CF6',
  image_generation: '#EC4899',
  video_generation: '#F59E0B',
  screen_recording: '#10B981',
  api_call: '#3B82F6',
  employee_deployment: '#6366F1',
  vm_runtime: '#14B8A6',
};

const FEATURE_ICONS: Record<FeatureType, React.ElementType> = {
  text_chat: MessageSquare,
  voice_chat: Mic,
  image_generation: Image,
  video_generation: Video,
  screen_recording: Monitor,
  api_call: Code,
  employee_deployment: Bot,
  vm_runtime: Server,
};

const purchaseOptions = [
  { id: "payg-10", hours: 10, price: 49.80, popular: false, label: "Pay As You Go" },
  { id: "payg-20", hours: 20, price: 99.60, popular: false, label: "Pay As You Go" },
  { id: "pack-50", hours: 50, price: 249.00, popular: true, label: "Value Pack" },
  { id: "pack-100", hours: 100, price: 498.00, popular: false, label: "Bulk Pack" },
];

const upgradePlans = [
  { id: "starter", name: "Starter", hours: 160, monthlyPrice: 997, employees: 1 },
  { id: "growth", name: "Growth", hours: 500, monthlyPrice: 2997, employees: 3, current: true },
  { id: "enterprise", name: "Enterprise", hours: "Unlimited", monthlyPrice: 7500, employees: 10 },
];

export default function WorkHoursPage() {
  const { 
    balance, 
    totalUsed, 
    totalPurchased, 
    transactions,
    getFeatureBreakdown,
    getFormattedBreakdown,
    formatWorkHours,
    purchaseHours,
    getHourlyRate,
    getHumanHourlyRate,
    getSavings,
    getSavingsPercent,
    getBalanceStatus,
  } = useWorkHours();
  
  const [showCheckout, setShowCheckout] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FeatureType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'purchase' | 'upgrade'>('purchase');
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(10);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const remainingHours = balance;
  const usagePercent = Math.round((totalUsed / totalPurchased) * 100);
  const planName = "Growth";
  const hourlyRate = getHourlyRate();
  const savingsPercent = getSavingsPercent();
  const monthlySavings = getSavings(totalUsed);

  const featureBreakdown = getFeatureBreakdown();
  const pieChartData = featureBreakdown.map(({ feature, hours }) => ({
    name: getFeatureDisplayName(feature),
    value: hours,
    color: FEATURE_COLORS[feature],
    feature,
  }));

  const filteredTransactions = selectedFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.featureType === selectedFilter);

  const balanceStatus = getBalanceStatus();

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Feature", "Hours", "Description", "Employee"];
    const rows = filteredTransactions.map(t => [
      new Date(t.timestamp).toISOString(),
      t.type,
      t.featureType || 'N/A',
      t.amount,
      t.description,
      t.employeeName || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `work-hours-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handlePurchase = (optionId: string) => {
    setShowCheckout(optionId);
    const option = purchaseOptions.find(o => o.id === optionId);
    if (option) {
      setTimeout(() => {
        setShowCheckout(null);
        purchaseHours(option.hours, option.price);
        alert(`Purchase completed! Added ${option.hours} hours for $${option.price.toFixed(2)}`);
      }, 2000);
    }
  };

  const handleUpgrade = (planId: string) => {
    alert(`Redirecting to Stripe checkout...`);
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mouse-charcoal">Work Hours</h1>
        <p className="text-mouse-slate text-sm mt-1">
          Manage your AI employee work hour balance and usage
        </p>
      </div>

      {/* Savings Banner */}
      <div className="bg-gradient-to-r from-mouse-teal to-mouse-navy rounded-xl p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm opacity-80">Your Savings This Month</p>
              <p className="text-3xl font-bold">${monthlySavings.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm opacity-80">AI Rate</p>
              <p className="text-2xl font-bold">${hourlyRate}/hr</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">vs Human</p>
              <p className="text-2xl font-bold">${getHumanHourlyRate()}/hr</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">You Save</p>
              <p className="text-2xl font-bold text-mouse-green">{savingsPercent}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-mouse-teal" />
            <span className="text-mouse-slate text-sm font-medium">Current Balance</span>
          </div>
          <div className="text-4xl font-bold text-mouse-navy">{balance.toFixed(1)}</div>
          <div className="text-mouse-slate text-xs mt-1">hours available</div>
          {balanceStatus === 'critical' && (
            <div className="mt-2 flex items-center gap-1 text-mouse-red text-xs">
              <AlertTriangle size={12} />
              Critical - Purchase now!
            </div>
          )}
          {balanceStatus === 'warning' && (
            <div className="mt-2 flex items-center gap-1 text-mouse-orange text-xs">
              <AlertTriangle size={12} />
              Running low
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-mouse-orange" />
            <span className="text-mouse-slate text-sm font-medium">Used This Month</span>
          </div>
          <div className="text-4xl font-bold text-mouse-charcoal">{totalUsed.toFixed(1)}</div>
          <div className="text-mouse-slate text-xs mt-1">hours consumed</div>
        </div>

        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-mouse-green" />
            <span className="text-mouse-slate text-sm font-medium">Remaining</span>
          </div>
          <div className={`text-4xl font-bold ${remainingHours < 10 ? 'text-mouse-orange' : 'text-mouse-green'}`}>
            {remainingHours.toFixed(1)}
          </div>
          <div className="text-mouse-slate text-xs mt-1">hours left</div>
        </div>

        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-mouse-teal" />
            <span className="text-mouse-slate text-sm font-medium">Plan</span>
          </div>
          <div className="text-4xl font-bold text-mouse-navy">{planName}</div>
          <div className="text-mouse-slate text-xs mt-1">{totalPurchased} hrs/month</div>
        </div>
      </div>

      {/* Usage Breakdown */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-mouse-charcoal">Usage Breakdown</h2>
            <p className="text-mouse-slate text-sm">{getFormattedBreakdown()}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-mouse-slate">
            <Zap size={16} className="text-mouse-teal" />
            <span>Total: {formatWorkHours(totalUsed)}</span>
          </div>
        </div>
        
        <div className="h-4 bg-mouse-slate/10 rounded-full overflow-hidden flex">
          {featureBreakdown.map(({ feature, hours }) => {
            const percentage = totalUsed > 0 ? (hours / totalUsed) * 100 : 0;
            return (
              <div
                key={feature}
                className="h-full transition-all duration-500"
                style={{ width: `${percentage}%`, backgroundColor: FEATURE_COLORS[feature] }}
                title={`${getFeatureDisplayName(feature)}: ${formatWorkHours(hours)}`}
              />
            );
          })}
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4">
          {featureBreakdown.map(({ feature, hours }) => {
            const Icon = FEATURE_ICONS[feature];
            return (
              <div key={feature} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FEATURE_COLORS[feature] }} />
                <Icon size={12} className="text-mouse-slate" />
                <span className="text-mouse-charcoal font-medium">{getFeatureDisplayName(feature)}</span>
                <span className="text-mouse-slate">({formatWorkHours(hours)})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-mouse-charcoal font-medium">Monthly Usage</span>
          <span className="text-mouse-slate text-sm">
            <span className="font-bold text-mouse-charcoal">{totalUsed.toFixed(1)}</span>
            <span className="text-mouse-slate"> / {totalPurchased} hrs</span>
          </span>
        </div>
        <div className="h-3 bg-mouse-slate/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usagePercent > 80 ? "bg-mouse-red" : usagePercent > 60 ? "bg-mouse-orange" : "bg-mouse-teal"
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-mouse-slate text-xs">{usagePercent}% of monthly allocation used</span>
          {usagePercent > 80 && (
            <span className="text-mouse-red text-xs font-medium flex items-center gap-1">
              <AlertTriangle size={12} />
              Approaching limit
            </span>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-mouse-charcoal mb-4">Daily Usage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => [`${value} hrs`, 'Hours Used']} />
                <Bar dataKey="hours" fill="#0F6B6E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-mouse-charcoal mb-4">Feature Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [formatWorkHours(value), name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Pricing Info */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-mouse-charcoal">Feature Pricing</h2>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign size={16} className="text-mouse-teal" />
            <span className="text-mouse-charcoal font-medium">${HOURLY_RATE}/hour</span>
            <span className="text-mouse-slate">base rate</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { feature: 'text_chat', icon: MessageSquare, label: 'Text Chat', cost: '0.1 hrs/1K tokens' },
            { feature: 'voice_chat', icon: Mic, label: 'Voice Chat', cost: '0.2 hrs/1K tokens' },
            { feature: 'image_generation', icon: Image, label: 'Image Gen', cost: '0.5 hrs/image' },
            { feature: 'video_generation', icon: Video, label: 'Video Gen', cost: '2.0 hrs/video' },
            { feature: 'screen_recording', icon: Monitor, label: 'Screen Rec', cost: '0.5 hrs/hour' },
            { feature: 'api_call', icon: Code, label: 'API Calls', cost: '0.01 hrs/call' },
            { feature: 'employee_deployment', icon: Bot, label: 'Deploy', cost: '0.25 hrs each' },
            { feature: 'vm_runtime', icon: Server, label: 'VM Runtime', cost: '1.0 hrs/hour' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.feature} className="flex items-center gap-3 p-3 bg-mouse-offwhite rounded-lg">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${FEATURE_COLORS[item.feature as FeatureType]}20` }}>
                  <Icon size={20} style={{ color: FEATURE_COLORS[item.feature as FeatureType] }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-mouse-charcoal">{item.label}</p>
                  <p className="text-xs text-mouse-slate">{item.cost}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Purchase / Upgrade Tabs */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4 border-b border-mouse-slate/20">
          <button
            onClick={() => setActiveTab('purchase')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'purchase'
                ? 'text-mouse-teal border-b-2 border-mouse-teal'
                : 'text-mouse-slate hover:text-mouse-charcoal'
            }`}
          >
            Buy More Hours
          </button>
          <button
            onClick={() => setActiveTab('upgrade')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'upgrade'
                ? 'text-mouse-teal border-b-2 border-mouse-teal'
                : 'text-mouse-slate hover:text-mouse-charcoal'
            }`}
          >
            Upgrade Plan
          </button>
        </div>

        {activeTab === 'purchase' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-mouse-charcoal">Purchase Additional Hours</h2>
                <p className="text-mouse-slate text-sm">Fixed rate: ${HOURLY_RATE}/hour - Pay as you go</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {purchaseOptions.map((option) => (
                <div
                  key={option.id}
                  className={`relative bg-white rounded-xl border shadow-sm p-6 transition-all ${
                    option.popular 
                      ? "border-mouse-teal ring-2 ring-mouse-teal/20" 
                      : "border-mouse-slate/20 hover:border-mouse-teal/50"
                  }`}
                >
                  {option.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-mouse-slate uppercase tracking-wide mb-2">{option.label}</div>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-mouse-navy">{option.hours}</div>
                    <div className="text-mouse-slate text-sm mt-1">hours</div>
                    <div className="text-mouse-teal font-semibold mt-2">${option.price.toFixed(2)}</div>
                    <div className="text-mouse-slate text-xs mt-0.5">
                      ${(option.price / option.hours).toFixed(2)}/hr
                    </div>
                  </div>
                  <button
                    onClick={() => handlePurchase(option.id)}
                    disabled={showCheckout === option.id}
                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                      option.popular
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-mouse-navy text-white hover:bg-mouse-navy/90"
                    } disabled:opacity-50`}
                  >
                    {showCheckout === option.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        Buy Now
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'upgrade' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-mouse-charcoal">Upgrade Your Plan</h2>
                <p className="text-mouse-slate text-sm">Get more hours and employees with a monthly plan</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upgradePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl border shadow-sm p-6 transition-all ${
                    plan.current 
                      ? "border-mouse-teal ring-2 ring-mouse-teal/20 bg-mouse-teal/5" 
                      : "border-mouse-slate/20 hover:border-mouse-teal/50"
                  }`}
                >
                  {plan.current && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Current Plan
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <div className="text-lg font-semibold text-mouse-charcoal">{plan.name}</div>
                    <div className="text-3xl font-bold text-mouse-navy mt-2">${plan.monthlyPrice.toLocaleString()}</div>
                    <div className="text-mouse-slate text-xs mt-1">per month</div>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2">
                      <Clock size={14} className="text-mouse-teal" />
                      <span>{typeof plan.hours === 'number' ? plan.hours.toLocaleString() : plan.hours} hours/month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users size={14} className="text-mouse-teal" />
                      <span>{plan.employees} AI employees</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.current}
                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                      plan.current
                        ? "bg-mouse-slate/20 text-mouse-slate cursor-not-allowed"
                        : "bg-mouse-navy text-white hover:bg-mouse-navy/90"
                    }`}
                  >
                    {plan.current ? 'Current Plan' : (
                      <>
                        Upgrade
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Usage History Table */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-mouse-slate/20 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-base font-semibold text-mouse-charcoal">Usage History</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as FeatureType | 'all')}
                className="appearance-none bg-mouse-offwhite border border-mouse-slate/20 rounded-lg px-4 py-2 pr-10 text-sm text-mouse-charcoal focus:ring-2 focus:ring-mouse-teal focus:border-transparent"
              >
                <option value="all">All Features</option>
                {Object.keys(FEATURE_COLORS).map((feature) => (
                  <option key={feature} value={feature}>
                    {getFeatureDisplayName(feature as FeatureType)}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-mouse-slate pointer-events-none" />
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-mouse-slate/40 text-mouse-slate text-sm font-medium rounded-lg hover:border-mouse-teal hover:text-mouse-teal transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mouse-offwhite border-b border-mouse-slate/10">
                <th className="px-6 py-3 text-left text-xs font-semibold text-mouse-slate uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-mouse-slate uppercase tracking-wide">Feature</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-mouse-slate uppercase tracking-wide">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-mouse-slate uppercase tracking-wide">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mouse-slate/10">
              {filteredTransactions.map((record) => (
                <tr key={record.id} className="hover:bg-mouse-offwhite transition-colors">
                  <td className="px-6 py-4 text-mouse-slate">
                    {new Date(record.timestamp).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    {record.featureType ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FEATURE_COLORS[record.featureType] }} />
                        <span className="text-mouse-charcoal text-xs">
                          {getFeatureDisplayName(record.featureType)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-mouse-slate text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-mouse-charcoal">
                    {record.description}
                    {record.employeeName && (
                      <span className="text-mouse-slate text-xs ml-2">({record.employeeName})</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${record.type === 'purchase' ? 'text-mouse-green' : 'text-mouse-orange'}`}>
                      {record.type === 'purchase' ? '+' : ''}{Math.abs(record.amount).toFixed(2)} hrs
                    </span>
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
