'use client';

import { 
  Users, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Phone,
  Mail,
  Calendar,
  Award,
  BarChart3
} from 'lucide-react';

export default function SalesPage() {
  const stats = [
    { label: 'New Leads', value: '24', icon: Users, color: 'text-blue-400', change: '+12%' },
    { label: 'Pipeline Value', value: '$125K', icon: DollarSign, color: 'text-green-400', change: '+8%' },
    { label: 'Deals Closed', value: '8', icon: Target, color: 'text-yellow-400', change: '+3' },
    { label: 'Conversion Rate', value: '32%', icon: TrendingUp, color: 'text-purple-400', change: '+5%' },
  ];

  const recentLeads = [
    { name: 'Acme Corp', status: 'New', value: '$15,000', source: 'Website' },
    { name: 'TechStart Inc', status: 'Contacted', value: '$8,500', source: 'Referral' },
    { name: 'Global Solutions', status: 'Qualified', value: '$25,000', source: 'LinkedIn' },
    { name: 'Innovation Labs', status: 'New', value: '$12,000', source: 'Webinar' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Sales Dashboard</h2>
        <p className="text-gray-400">Track leads, opportunities, and sales performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <p className="text-sm text-green-400">{stat.change} this week</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-mouse-teal" />
              <h3 className="text-lg font-semibold text-white">Recent Leads</h3>
            </div>
            <a href="/sales/leads" className="text-mouse-teal hover:text-mouse-teal-light text-sm">
              View All
            </a>
          </div>
          <div className="space-y-3">
            {recentLeads.map((lead, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                <div>
                  <p className="font-medium text-white">{lead.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lead.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                      lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {lead.status}
                    </span>
                    <span className="text-sm text-gray-500">via {lead.source}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{lead.value}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button className="p-1 hover:bg-dark-bg-tertiary rounded">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-dark-bg-tertiary rounded">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-accent-purple" />
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-mouse-teal/20 rounded-lg hover:bg-mouse-teal/30 transition-colors">
              <span className="text-mouse-teal font-medium">Add New Lead</span>
              <span className="text-mouse-teal">+</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
              <span className="text-gray-300">Schedule Demo</span>
              <Calendar className="w-4 h-4 text-gray-500" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
              <span className="text-gray-300">Send Proposal</span>
              <Mail className="w-4 h-4 text-gray-500" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
              <span className="text-gray-300">View Pipeline</span>
              <BarChart3 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
