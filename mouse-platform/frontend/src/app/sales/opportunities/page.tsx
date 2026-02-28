'use client';

import { Target, Search, Plus, DollarSign, Calendar } from 'lucide-react';

export default function OpportunitiesPage() {
  const opportunities = [
    { id: 1, name: 'Acme Corp Expansion', value: '$45,000', stage: 'Proposal', probability: '70%', closeDate: '2024-03-15' },
    { id: 2, name: 'TechStart Annual', value: '$28,000', stage: 'Negotiation', probability: '85%', closeDate: '2024-03-10' },
    { id: 3, name: 'Global Solutions Pilot', value: '$15,000', stage: 'Discovery', probability: '40%', closeDate: '2024-03-30' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Opportunities</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white rounded-lg hover:bg-mouse-teal-dark transition-colors">
          <Plus className="w-4 h-4" />
          New Opportunity
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search opportunities..."
            className="w-full bg-dark-surface border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500"
          />
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Opportunity</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Value</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Stage</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Probability</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Close Date</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr key={opp.id} className="border-b border-dark-border last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-mouse-teal" />
                    <span className="text-white font-medium">{opp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-white">{opp.value}</td>
                <td className="px-6 py-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                    {opp.stage}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{opp.probability}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {opp.closeDate}
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
