'use client';

import Sidebar from '../components/layout/Sidebar';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import Link from 'next/link';

const pipelineStages = [
  { name: 'New Leads', count: 24, value: 125000, color: 'bg-gray-500' },
  { name: 'Contacted', count: 18, value: 210000, color: 'bg-blue-500' },
  { name: 'Qualified', count: 12, value: 340000, color: 'bg-indigo-500' },
  { name: 'Proposal', count: 8, value: 280000, color: 'bg-purple-500' },
  { name: 'Negotiation', count: 5, value: 195000, color: 'bg-orange-500' },
  { name: 'Closed Won', count: 3, value: 150000, color: 'bg-green-500' },
];

const recentLeads = [
  { id: '1', name: 'Acme Corp', contact: 'John Smith', value: 50000, status: 'qualified', lastActivity: '2 hours ago' },
  { id: '2', name: 'TechStart Inc', contact: 'Sarah Johnson', value: 75000, status: 'proposal', lastActivity: '5 hours ago' },
  { id: '3', name: 'Global Systems', contact: 'Mike Chen', value: 120000, status: 'negotiation', lastActivity: '1 day ago' },
  { id: '4', name: 'DataFlow Ltd', contact: 'Emily Davis', value: 35000, status: 'new', lastActivity: '2 days ago' },
  { id: '5', name: 'CloudNine', contact: 'Alex Wilson', value: 90000, status: 'contacted', lastActivity: '3 days ago' },
];

export default function SalesDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="sales" />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
              <p className="text-gray-600">Track and manage your sales opportunities</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <Link
                href="/sales/leads"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                New Lead
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { 
                label: 'Total Pipeline', 
                value: '$1.3M', 
                change: '+12.5%', 
                trend: 'up',
                icon: DollarSign 
              },
              { 
                label: 'Active Leads', 
                value: '70', 
                change: '+8.2%', 
                trend: 'up',
                icon: Users 
              },
              { 
                label: 'Win Rate', 
                value: '32%', 
                change: '+2.1%', 
                trend: 'up',
                icon: Target 
              },
              { 
                label: 'Avg Deal Size', 
                value: '$45K', 
                change: '-3.4%', 
                trend: 'down',
                icon: TrendingUp 
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <stat.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Pipeline Stages */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Overview</h2>
            <div className="grid grid-cols-6 gap-4">
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="text-center">
                  <div className={`${stage.color} rounded-lg p-4 mb-3 text-white`}>
                    <div className="text-2xl font-bold">{stage.count}</div>
                    <div className="text-sm opacity-90">{stage.name}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${(stage.value / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Link href="/sales/leads" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-600">{lead.contact}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-medium text-gray-900">${lead.value.toLocaleString()}</div>
                        <div className={`text-sm capitalize ${
                          lead.status === 'new' ? 'text-gray-600' :
                          lead.status === 'qualified' ? 'text-blue-600' :
                          lead.status === 'proposal' ? 'text-purple-600' :
                          lead.status === 'negotiation' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {lead.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Last activity</div>
                        <div className="text-sm text-gray-900">{lead.lastActivity}</div>
                      </div>
                      <Link
                        href={`/sales/leads/${lead.id}`}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
