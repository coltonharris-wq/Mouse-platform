'use client';

import { Users, Search, Plus, Mail, Phone } from 'lucide-react';

export default function ClientsPage() {
  const clients = [
    { id: 1, name: 'Acme Corporation', email: 'contact@acme.com', status: 'Active', revenue: '$12,450' },
    { id: 2, name: 'TechStart Inc', email: 'info@techstart.com', status: 'Active', revenue: '$8,320' },
    { id: 3, name: 'Global Solutions', email: 'hello@global.com', status: 'Inactive', revenue: '$0' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Your Clients</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white rounded-lg hover:bg-mouse-teal-dark transition-colors">
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full bg-dark-surface border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500"
          />
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Client</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Revenue</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-dark-border last:border-0">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-white font-medium">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    client.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-white">{client.revenue}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-dark-bg-tertiary rounded-lg transition-colors">
                      <Mail className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-dark-bg-tertiary rounded-lg transition-colors">
                      <Phone className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
