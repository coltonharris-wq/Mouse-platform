'use client';

import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';

export default function CommissionsPage() {
  const commissions = [
    { id: 1, client: 'Acme Corporation', amount: '$245.00', rate: '20%', date: '2024-02-28', status: 'Paid' },
    { id: 2, client: 'TechStart Inc', amount: '$166.40', rate: '20%', date: '2024-02-27', status: 'Paid' },
    { id: 3, client: 'Innovation Labs', amount: '$89.80', rate: '20%', date: '2024-02-25', status: 'Pending' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Commission History</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border text-gray-300 rounded-lg hover:bg-dark-bg-tertiary transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-white">$3,456.00</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-white">$890.00</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Earned</p>
              <p className="text-2xl font-bold text-white">$28,901.00</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Client</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Amount</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Rate</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Date</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((commission) => (
              <tr key={commission.id} className="border-b border-dark-border last:border-0">
                <td className="px-6 py-4 text-white font-medium">{commission.client}</td>
                <td className="px-6 py-4 text-green-400">{commission.amount}</td>
                <td className="px-6 py-4 text-gray-300">{commission.rate}</td>
                <td className="px-6 py-4 text-gray-400">{commission.date}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    commission.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {commission.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
