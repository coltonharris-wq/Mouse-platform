"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Download,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Calendar,
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
  Phone,
  Hash,
  RefreshCw,
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

const HOURLY_RATE = 4.98;
const HUMAN_HOURLY_RATE = 35;

type EventType = 'chat_opus' | 'chat_sonnet' | 'chat_kimi' | 'voice_elevenlabs' | 'vm_orgo' | 'phone_twilio' | 'phone_number' | 'image_gen' | 'deployment';

const EVENT_COLORS: Record<EventType, string> = {
  chat_opus: '#0F6B6E',
  chat_sonnet: '#06B6D4',
  chat_kimi: '#8B5CF6',
  voice_elevenlabs: '#EC4899',
  vm_orgo: '#14B8A6',
  phone_twilio: '#F59E0B',
  phone_number: '#6366F1',
  image_gen: '#10B981',
  deployment: '#3B82F6',
};

const EVENT_LABELS: Record<EventType, string> = {
  chat_opus: 'Chat (Opus)',
  chat_sonnet: 'Chat (Sonnet)',
  chat_kimi: 'Chat (Kimi)',
  voice_elevenlabs: 'Voice (ElevenLabs)',
  vm_orgo: 'VM (Orgo)',
  phone_twilio: 'Phone (Twilio)',
  phone_number: 'Phone Numbers',
  image_gen: 'Image Generation',
  deployment: 'Deployments',
};

const EVENT_ICONS: Record<EventType, React.ElementType> = {
  chat_opus: MessageSquare,
  chat_sonnet: MessageSquare,
  chat_kimi: MessageSquare,
  voice_elevenlabs: Mic,
  vm_orgo: Server,
  phone_twilio: Phone,
  phone_number: Hash,
  image_gen: Image,
  deployment: Bot,
};

interface UsageSummary {
  event_type: EventType;
  event_count: number;
  total_vendor_cost: number;
  total_hours_charged: number;
}

interface UsageEvent {
  id: string;
  event_type: EventType;
  vendor_cost: number;
  work_hours_charged: number;
  margin_multiplier: number;
  created_at: string;
  metadata: Record<string, any>;
}

const purchaseOptions = [
  { id: "payg-10", hours: 10, price: 49.80, popular: false, label: "Pay As You Go" },
  { id: "payg-20", hours: 20, price: 99.60, popular: false, label: "Pay As You Go" },
  { id: "pack-50", hours: 50, price: 249.00, popular: true, label: "Value Pack" },
  { id: "pack-100", hours: 100, price: 498.00, popular: false, label: "Bulk Pack" },
];

export default function WorkHoursPage() {
  const [balance, setBalance] = useState(0);
  const [totalPurchased, setTotalPurchased] = useState(0);
  const [summary, setSummary] = useState<UsageSummary[]>([]);
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<EventType | 'all'>('all');
  const [showCheckout, setShowCheckout] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'purchase' | 'upgrade'>('purchase');

  const getCustomerId = () => {
    try {
      const session = localStorage.getItem('mouse_session');
      return session ? JSON.parse(session).customerId || JSON.parse(session).userId : null;
    } catch { return null; }
  };

  const fetchUsage = useCallback(async () => {
    const customerId = getCustomerId();
    if (!customerId) { setLoading(false); return; }

    try {
      const res = await fetch(`/api/usage-events?customerId=${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance || 0);
        setTotalPurchased(data.totalPurchased || 0);
        setSummary(data.summary || []);
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const totalUsed = summary.reduce((sum, s) => sum + Number(s.total_hours_charged), 0);
  const usagePercent = totalPurchased > 0 ? Math.round((totalUsed / totalPurchased) * 100) : 0;
  const savingsPercent = Math.round(((HUMAN_HOURLY_RATE - HOURLY_RATE) / HUMAN_HOURLY_RATE) * 100);
  const monthlySavings = Math.round(totalUsed * (HUMAN_HOURLY_RATE - HOURLY_RATE));

  const balanceStatus = balance < 2 ? 'critical' : balance < 10 ? 'warning' : 'healthy';

  const pieChartData = summary.map(s => ({
    name: EVENT_LABELS[s.event_type] || s.event_type,
    value: Number(s.total_hours_charged),
    color: EVENT_COLORS[s.event_type] || '#94A3B8',
    eventType: s.event_type,
  }));

  // Build daily usage from events
  const dailyMap = new Map<string, number>();
  events.forEach(e => {
    const day = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyMap.set(day, (dailyMap.get(day) || 0) + Number(e.work_hours_charged));
  });
  const dailyUsage = Array.from(dailyMap.entries())
    .map(([date, hours]) => ({ date, hours: Math.round(hours * 100) / 100 }))
    .reverse()
    .slice(0, 15);

  const filteredEvents = selectedFilter === 'all' ? events : events.filter(e => e.event_type === selectedFilter);

  const formatHours = (h: number) => {
    if (h < 0.1 && h > 0) return `${Math.round(h * 60)} min`;
    if (h < 1) return `${h.toFixed(2)} hr`;
    return `${h.toFixed(1)} hrs`;
  };

  const handlePurchase = async (optionId: string) => {
    setShowCheckout(optionId);
    const option = purchaseOptions.find(o => o.id === optionId);
    if (!option) return;

    const customerId = getCustomerId();
    if (!customerId) { setShowCheckout(null); return; }

    try {
      const res = await fetch('/api/work-hours', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, amount: option.hours, type: 'purchase' }),
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.newBalance || balance + option.hours);
        setTotalPurchased(prev => prev + option.hours);
      }
    } catch (err) {
      console.error('Purchase failed:', err);
    } finally {
      setShowCheckout(null);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsage();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-mouse-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-mouse-charcoal">Work Hours</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time billing — every API call tracked</p>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-mouse-teal transition-colors">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
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
              <p className="text-2xl font-bold">${HOURLY_RATE}/hr</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">vs Human</p>
              <p className="text-2xl font-bold">${HUMAN_HOURLY_RATE}/hr</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">You Save</p>
              <p className="text-2xl font-bold text-green-300">{savingsPercent}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-mouse-teal" />
            <span className="text-gray-500 text-sm font-medium">Current Balance</span>
          </div>
          <div className="text-4xl font-bold text-mouse-navy">{balance.toFixed(1)}</div>
          <div className="text-gray-400 text-xs mt-1">hours available</div>
          {balanceStatus === 'critical' && (
            <div className="mt-2 flex items-center gap-1 text-red-500 text-xs">
              <AlertTriangle size={12} />
              Critical — Purchase now!
            </div>
          )}
          {balanceStatus === 'warning' && (
            <div className="mt-2 flex items-center gap-1 text-orange-500 text-xs">
              <AlertTriangle size={12} />
              Running low
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-orange-500" />
            <span className="text-gray-500 text-sm font-medium">Used This Month</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">{totalUsed.toFixed(1)}</div>
          <div className="text-gray-400 text-xs mt-1">hours consumed</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-green-500" />
            <span className="text-gray-500 text-sm font-medium">Remaining</span>
          </div>
          <div className={`text-4xl font-bold ${balance < 10 ? 'text-orange-500' : 'text-green-500'}`}>
            {balance.toFixed(1)}
          </div>
          <div className="text-gray-400 text-xs mt-1">hours left</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-mouse-teal" />
            <span className="text-gray-500 text-sm font-medium">Total Purchased</span>
          </div>
          <div className="text-4xl font-bold text-mouse-navy">{totalPurchased.toFixed(0)}</div>
          <div className="text-gray-400 text-xs mt-1">hours total</div>
        </div>
      </div>

      {/* Usage Breakdown by Service */}
      {summary.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Usage by Service</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap size={16} className="text-mouse-teal" />
              Total: {formatHours(totalUsed)}
            </div>
          </div>

          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            {summary.map(s => {
              const pct = totalUsed > 0 ? (Number(s.total_hours_charged) / totalUsed) * 100 : 0;
              return (
                <div
                  key={s.event_type}
                  className="h-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: EVENT_COLORS[s.event_type] || '#94A3B8' }}
                  title={`${EVENT_LABELS[s.event_type]}: ${formatHours(Number(s.total_hours_charged))}`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {summary.map(s => {
              const Icon = EVENT_ICONS[s.event_type] || Zap;
              return (
                <div key={s.event_type} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: EVENT_COLORS[s.event_type] }} />
                  <Icon size={14} className="text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{EVENT_LABELS[s.event_type]}</p>
                    <p className="text-xs text-gray-500">{formatHours(Number(s.total_hours_charged))} · {s.event_count} calls</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {totalPurchased > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-800 font-medium">Monthly Usage</span>
            <span className="text-sm">
              <span className="font-bold text-gray-900">{totalUsed.toFixed(1)}</span>
              <span className="text-gray-500"> / {totalPurchased} hrs</span>
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercent > 80 ? "bg-red-500" : usagePercent > 60 ? "bg-orange-500" : "bg-mouse-teal"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-400 text-xs">{usagePercent}% used</span>
            {usagePercent > 80 && (
              <span className="text-red-500 text-xs font-medium flex items-center gap-1">
                <AlertTriangle size={12} />
                Approaching limit
              </span>
            )}
          </div>
        </div>
      )}

      {/* Charts */}
      {(dailyUsage.length > 0 || pieChartData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {dailyUsage.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Usage</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value: number) => [`${value} hrs`, 'Hours Used']} />
                    <Bar dataKey="hours" fill="#0F6B6E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {pieChartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieChartData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [formatHours(value), name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchase Options */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('purchase')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'purchase' ? 'text-mouse-teal border-b-2 border-mouse-teal' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Buy More Hours
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {purchaseOptions.map((option) => (
            <div
              key={option.id}
              className={`relative bg-white rounded-xl border shadow-sm p-6 transition-all ${
                option.popular ? "border-mouse-teal ring-2 ring-mouse-teal/20" : "border-gray-200 hover:border-mouse-teal/50"
              }`}
            >
              {option.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">{option.label}</div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-mouse-navy">{option.hours}</div>
                <div className="text-gray-400 text-sm mt-1">hours</div>
                <div className="text-mouse-teal font-semibold mt-2">${option.price.toFixed(2)}</div>
                <div className="text-gray-400 text-xs mt-0.5">${(option.price / option.hours).toFixed(2)}/hr</div>
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

      {/* Usage History (Real Events) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-base font-semibold text-gray-900">Usage History</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as EventType | 'all')}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-gray-800 focus:ring-2 focus:ring-mouse-teal"
              >
                <option value="all">All Services</option>
                {Object.entries(EVENT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => {
                const csv = [
                  ['Date', 'Service', 'Hours Used'],
                  ...filteredEvents.map(e => [
                    new Date(e.created_at).toISOString(),
                    EVENT_LABELS[e.event_type] || e.event_type,
                    Number(e.work_hours_charged).toFixed(4),
                  ]),
                ].map(r => r.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `work-hours-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-500 text-sm font-medium rounded-lg hover:border-mouse-teal hover:text-mouse-teal transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hours Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    No usage events yet. Send a message to King Mouse to see billing in action.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(event.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EVENT_COLORS[event.event_type] || '#94A3B8' }} />
                        <span className="text-gray-800 text-xs font-medium">{EVENT_LABELS[event.event_type] || event.event_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-orange-500">-{formatHours(Number(event.work_hours_charged))}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Depleted Banner */}
      {balance <= 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white px-6 py-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} />
            <div>
              <p className="font-bold">Your work hours are depleted</p>
              <p className="text-sm opacity-90">All AI employees have stopped. Purchase more hours to continue.</p>
            </div>
          </div>
          <button
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="px-6 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            Purchase Hours
          </button>
        </div>
      )}
    </div>
  );
}
