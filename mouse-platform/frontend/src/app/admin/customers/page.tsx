'use client';

import { useEffect, useState } from 'react';

interface Customer {
  id: string;
  company_name: string;
  email: string;
  pro_slug: string;
  plan: string;
  vm_status: string;
  hours_used: number;
  hours_included: number;
  created_at: string;
}

const VM_STATUS_COLORS: Record<string, string> = {
  running: 'bg-green-100 text-green-700',
  provisioning: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-600',
  stopped: 'bg-red-100 text-red-700',
  error: 'bg-red-100 text-red-700',
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <span className="text-sm text-gray-500">{customers.length} total</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pro</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">VM</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Hours</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">No customers yet</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.company_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                      {c.pro_slug || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{c.plan || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${VM_STATUS_COLORS[c.vm_status] || VM_STATUS_COLORS.pending}`}>
                      {c.vm_status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.hours_used?.toFixed(1) || '0'} / {c.hours_included || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
