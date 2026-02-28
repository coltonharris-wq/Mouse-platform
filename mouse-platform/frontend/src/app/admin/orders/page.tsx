'use client';

import { ShoppingCart, Search, Download } from 'lucide-react';

export default function OrdersPage() {
  const orders = [
    { id: 'ORD-001', customer: 'Acme Corp', amount: '$299', status: 'Completed', date: '2024-02-28' },
    { id: 'ORD-002', customer: 'TechStart Inc', amount: '$149', status: 'Pending', date: '2024-02-27' },
    { id: 'ORD-003', customer: 'Global Solutions', amount: '$499', status: 'Completed', date: '2024-02-26' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border text-gray-300 rounded-lg hover:bg-dark-bg-tertiary transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full bg-dark-surface border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500"
          />
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Order ID</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Customer</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Amount</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-dark-border last:border-0">
                <td className="px-6 py-4 text-white font-medium">{order.id}</td>
                <td className="px-6 py-4 text-gray-300">{order.customer}</td>
                <td className="px-6 py-4 text-white">{order.amount}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
