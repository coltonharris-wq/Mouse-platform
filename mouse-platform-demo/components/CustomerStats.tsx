"use client";

interface DashboardStats {
  totalCustomers: number;
  pendingPayment: number;
  activeCustomers: number;
  cancelledCustomers: number;
  totalMrr: number;
  totalCommission: number;
}

interface CustomerStatsProps {
  stats: DashboardStats;
}

export default function CustomerStats({ stats }: CustomerStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Customers */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-mouse-slate text-xs font-medium mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-mouse-charcoal">{stats.totalCustomers}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-3 flex gap-2 text-xs">
          <span className="text-green-600 font-medium">{stats.activeCustomers} active</span>
          <span className="text-mouse-slate">•</span>
          <span className="text-yellow-600 font-medium">{stats.pendingPayment} pending</span>
        </div>
      </div>

      {/* Total MRR */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-mouse-slate text-xs font-medium mb-1">Total MRR</p>
            <p className="text-2xl font-bold text-mouse-green">
              ${stats.totalMrr.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-3 text-xs text-mouse-slate">
          Monthly Recurring Revenue
        </div>
      </div>

      {/* Commission Earned */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-mouse-slate text-xs font-medium mb-1">Commission Earned</p>
            <p className="text-2xl font-bold text-mouse-teal">
              ${stats.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-mouse-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-3 text-xs text-mouse-slate">
          Custom commission (you set price)
        </div>
      </div>

      {/* Pending Payment */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-mouse-slate text-xs font-medium mb-1">Pending Payment</p>
            <p className="text-2xl font-bold text-orange-500">{stats.pendingPayment}</p>
          </div>
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-3 text-xs text-mouse-slate">
          Potential MRR: ${(stats.pendingPayment * 997).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
