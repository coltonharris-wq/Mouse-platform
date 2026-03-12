'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Users, TrendingUp, BarChart3 } from 'lucide-react';

interface RevenueSummary {
  total_revenue: number;
  total_profit: number;
  active_customers: number;
  avg_per_customer: number;
}

interface ProductRevenue {
  product: string;
  customers: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface MonthlyData {
  month: string;
  receptionist: number;
  lead_funnel: number;
  king_mouse: number;
}

interface CustomerRevenue {
  business_name: string;
  products: string[];
  revenue: number;
  hours: number;
  leads: number;
  profit: number;
}

const PRODUCT_LABELS: Record<string, string> = {
  receptionist: 'AI Receptionist',
  lead_funnel: 'Lead Gen Funnels',
  king_mouse: 'King Mouse',
};

const PRODUCT_ICONS: Record<string, string> = {
  receptionist: '\u{1F4DE}',
  lead_funnel: '\u{1F3AF}',
  king_mouse: '\u{1F42D}',
};

function formatCents(cents: number): string {
  return '$' + (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function RevenuePage() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [byProduct, setByProduct] = useState<ProductRevenue[]>([]);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [perCustomer, setPerCustomer] = useState<CustomerRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  useEffect(() => {
    if (!resellerId) { setLoading(false); return; }
    fetch(`/api/reseller/revenue?reseller_id=${resellerId}`)
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary);
        setByProduct(data.by_product || []);
        setMonthly(data.monthly || []);
        setPerCustomer(data.per_customer || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  const stats = summary ? [
    { label: 'Total Revenue (MTD)', value: formatCents(summary.total_revenue), icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Profit (MTD)', value: formatCents(summary.total_profit), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Active Customers', value: summary.active_customers, icon: Users, color: 'bg-teal-50 text-teal-600' },
    { label: 'Avg Revenue/Customer', value: formatCents(summary.avg_per_customer), icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
  ] : [];

  // Chart calculation
  const maxMonthly = Math.max(
    ...monthly.map((m) => m.receptionist + m.lead_funnel + m.king_mouse),
    1
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Revenue</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue by Product */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Revenue by Product</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-center">Customers</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Cost</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byProduct.map((p) => (
                <tr key={p.product} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    <span className="mr-2">{PRODUCT_ICONS[p.product] || ''}</span>
                    {PRODUCT_LABELS[p.product] || p.product}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{p.customers}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">{formatCents(p.revenue)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 hidden sm:table-cell">{formatCents(p.cost)}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-700 font-medium">{formatCents(p.profit)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 hidden sm:table-cell">{p.margin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Profit Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Profit</h2>
        <div className="flex items-end gap-3 h-48">
          {monthly.map((m) => {
            const total = m.receptionist + m.lead_funnel + m.king_mouse;
            const totalPct = Math.max((total / maxMonthly) * 100, 4);
            const recPct = total > 0 ? (m.receptionist / total) * totalPct : 0;
            const funPct = total > 0 ? (m.lead_funnel / total) * totalPct : 0;
            const kmPct = total > 0 ? (m.king_mouse / total) * totalPct : totalPct;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500">{formatCents(total)}</span>
                <div className="w-full flex flex-col-reverse" style={{ height: `${totalPct}%` }}>
                  {recPct > 0 && (
                    <div className="w-full rounded-b bg-blue-500" style={{ height: `${(recPct / totalPct) * 100}%` }} />
                  )}
                  {funPct > 0 && (
                    <div className="w-full bg-green-500" style={{ height: `${(funPct / totalPct) * 100}%` }} />
                  )}
                  <div
                    className={`w-full bg-purple-500 ${recPct === 0 && funPct === 0 ? 'rounded-t rounded-b' : 'rounded-t'}`}
                    style={{ height: `${(kmPct / totalPct) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{m.month.slice(5)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-500" /> Receptionist</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-green-500" /> Lead Gen</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-purple-500" /> King Mouse</div>
        </div>
      </div>

      {/* Per-Customer Revenue */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Per-Customer Revenue</h2>
        </div>
        {perCustomer.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No customer revenue data yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Products</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Hours</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Leads</th>
                  <th className="px-4 py-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {perCustomer.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{c.business_name}</td>
                    <td className="px-4 py-3 text-sm">
                      {c.products.map((p) => PRODUCT_ICONS[p] || '').join(' ') || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCents(c.revenue)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 hidden sm:table-cell">{c.hours || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 hidden sm:table-cell">{c.leads || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-700 font-medium">{formatCents(c.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
