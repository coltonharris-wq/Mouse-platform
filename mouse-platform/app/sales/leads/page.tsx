'use client';

import Sidebar from '../../components/layout/Sidebar';
import { Search, Filter, Plus, MoreHorizontal, Phone, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';

const leads = [
  { id: '1', name: 'John Smith', company: 'Acme Corp', email: 'john@acme.com', phone: '+1 (555) 123-4567', value: 50000, status: 'qualified', source: 'Website', lastContact: '2 hours ago' },
  { id: '2', name: 'Sarah Johnson', company: 'TechStart Inc', email: 'sarah@techstart.com', phone: '+1 (555) 234-5678', value: 75000, status: 'proposal', source: 'Referral', lastContact: '5 hours ago' },
  { id: '3', name: 'Mike Chen', company: 'Global Systems', email: 'mike@globalsys.com', phone: '+1 (555) 345-6789', value: 120000, status: 'negotiation', source: 'LinkedIn', lastContact: '1 day ago' },
  { id: '4', name: 'Emily Davis', company: 'DataFlow Ltd', email: 'emily@dataflow.com', phone: '+1 (555) 456-7890', value: 35000, status: 'new', source: 'Cold Call', lastContact: '2 days ago' },
  { id: '5', name: 'Alex Wilson', company: 'CloudNine', email: 'alex@cloudnine.com', phone: '+1 (555) 567-8901', value: 90000, status: 'contacted', source: 'Email Campaign', lastContact: '3 days ago' },
  { id: '6', name: 'Lisa Brown', company: 'InnovateCo', email: 'lisa@innovate.com', phone: '+1 (555) 678-9012', value: 65000, status: 'qualified', source: 'Trade Show', lastContact: '4 days ago' },
  { id: '7', name: 'David Lee', company: 'FutureTech', email: 'david@futuretech.com', phone: '+1 (555) 789-0123', value: 110000, status: 'proposal', source: 'Website', lastContact: '5 days ago' },
  { id: '8', name: 'Rachel Green', company: 'SmartBiz', email: 'rachel@smartbiz.com', phone: '+1 (555) 890-1234', value: 42000, status: 'new', source: 'Referral', lastContact: '1 week ago' },
];

const statusColors: Record<string, string> = {
  new: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  qualified: 'bg-indigo-100 text-indigo-800',
  proposal: 'bg-purple-100 text-purple-800',
  negotiation: 'bg-orange-100 text-orange-800',
  'closed-won': 'bg-green-100 text-green-800',
  'closed-lost': 'bg-red-100 text-red-800',
};

export default function LeadsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="sales" />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
              <p className="text-gray-600">Manage and track all your sales leads</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Lead
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads by name, company, or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Statuses</option>
                <option>New</option>
                <option>Contacted</option>
                <option>Qualified</option>
                <option>Proposal</option>
                <option>Negotiation</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Sources</option>
                <option>Website</option>
                <option>Referral</option>
                <option>LinkedIn</option>
                <option>Cold Call</option>
              </select>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Lead</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Value</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Source</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Last Contact</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-600">{lead.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{lead.email}</div>
                        <div className="text-gray-600">{lead.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">${lead.value.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.source}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.lastContact}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                          <Mail className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/sales/leads/${lead.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing 1 to 8 of 70 leads
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
