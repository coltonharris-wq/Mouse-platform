'use client';

import { Users, Search, Plus, Filter, Phone, Mail } from 'lucide-react';

export default function LeadsPage() {
  const leads = [
    { id: 1, name: 'Sarah Johnson', company: 'Tech Solutions', email: 'sarah@techsol.com', status: 'New', source: 'Website' },
    { id: 2, name: 'Mike Chen', company: 'StartUp Inc', email: 'mike@startup.com', status: 'Contacted', source: 'LinkedIn' },
    { id: 3, name: 'Emily Davis', company: 'Global Corp', email: 'emily@global.com', status: 'Qualified', source: 'Referral' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Leads</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white rounded-lg hover:bg-mouse-teal-dark transition-colors">
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full bg-dark-surface border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border text-gray-300 rounded-lg hover:bg-dark-bg-tertiary transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Lead</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Source</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-dark-border last:border-0">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-white font-medium">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.company}</p>
                    <p className="text-sm text-gray-600">{lead.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    lead.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                    lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{lead.source}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-dark-bg-tertiary rounded-lg transition-colors">
                      <Phone className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-dark-bg-tertiary rounded-lg transition-colors">
                      <Mail className="w-4 h-4 text-gray-500" />
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
