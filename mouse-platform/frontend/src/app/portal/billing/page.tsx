'use client';

import { CreditCard, Download, FileText } from 'lucide-react';

export default function BillingPage() {
  const invoices = [
    { id: 'INV-001', date: '2024-02-01', amount: '$299.00', status: 'Paid', description: 'Growth Package' },
    { id: 'INV-002', date: '2024-01-01', amount: '$149.00', status: 'Paid', description: 'Starter Package' },
    { id: 'INV-003', date: '2023-12-01', amount: '$149.00', status: 'Paid', description: 'Starter Package' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Billing & Invoices</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
          <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-white font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-500">Expires 12/25</p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Default</span>
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Billing Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Current Plan</span>
              <span className="text-white">Growth</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Billing Cycle</span>
              <span className="text-white">Monthly</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Next Payment</span>
              <span className="text-white">Mar 1, 2024</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-border">
          <h3 className="text-lg font-semibold text-white">Invoice History</h3>
        </div>
        <table className="w-full">
          <thead className="bg-dark-bg">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Invoice</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Description</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Date</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Amount</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-dark-border last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-white font-medium">{invoice.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{invoice.description}</td>
                <td className="px-6 py-4 text-gray-400">{invoice.date}</td>
                <td className="px-6 py-4 text-white">{invoice.amount}</td>
                <td className="px-6 py-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-dark-bg-tertiary rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
