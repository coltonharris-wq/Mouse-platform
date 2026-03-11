'use client';

import { useEffect, useState } from 'react';
import { Users, DollarSign, Server, Clock } from 'lucide-react';

interface AdminStats {
  totalCustomers: number;
  totalRevenue: number;
  activeVMs: number;
  totalHours: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({ totalCustomers: 0, totalRevenue: 0, activeVMs: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((res) => res.json())
      .then((data) => {
        const customers = data.customers || [];
        setStats({
          totalCustomers: customers.length,
          totalRevenue: customers.length * 497, // Approximate
          activeVMs: customers.filter((c: { vm_status: string }) => c.vm_status === 'running').length,
          totalHours: customers.reduce((sum: number, c: { hours_used: number }) => sum + (c.hours_used || 0), 0),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Monthly Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Active VMs', value: stats.activeVMs, icon: Server, color: 'bg-purple-100 text-purple-600' },
    { label: 'Total Hours Used', value: stats.totalHours.toFixed(1), icon: Clock, color: 'bg-teal-100 text-teal-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
