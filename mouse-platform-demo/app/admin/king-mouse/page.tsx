'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, 
  Activity, 
  Users, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Trash2
} from 'lucide-react';

interface KingMouseInstance {
  id: string;
  customerId: string;
  companyName: string;
  customerEmail: string;
  planTier: string;
  status: 'provisioning' | 'active' | 'error' | 'suspended';
  openclawStatus: string;
  totalInteractions: number;
  lastActiveAt: string | null;
  provisionedAt: string;
  botLink: string;
}

export default function KingMouseAdminPage() {
  const [instances, setInstances] = useState<KingMouseInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInstance, setSelectedInstance] = useState<KingMouseInstance | null>(null);

  useEffect(() => {
    fetchKingMouseInstances();
  }, []);

  const fetchKingMouseInstances = async () => {
    try {
      // In production, this would fetch from the API
      // For now, we'll use mock data
      const mockInstances: KingMouseInstance[] = [
        {
          id: 'km_abc123',
          customerId: 'cust_123',
          companyName: 'Acme Construction',
          customerEmail: 'john@acme.com',
          planTier: 'growth',
          status: 'active',
          openclawStatus: 'initialized',
          totalInteractions: 145,
          lastActiveAt: '2026-03-01T14:30:00Z',
          provisionedAt: '2026-02-28T10:00:00Z',
          botLink: 'https://t.me/mouse_king_abc123_bot',
        },
        {
          id: 'km_def456',
          customerId: 'cust_456',
          companyName: 'Smith Realty',
          customerEmail: 'sarah@smithrealty.com',
          planTier: 'starter',
          status: 'provisioning',
          openclawStatus: 'initializing',
          totalInteractions: 0,
          lastActiveAt: null,
          provisionedAt: '2026-03-01T16:00:00Z',
          botLink: 'https://t.me/mouse_king_def456_bot',
        },
      ];
      
      setInstances(mockInstances);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch King Mouse instances:', error);
      setLoading(false);
    }
  };

  const filteredInstances = instances.filter(instance => {
    const matchesSearch = 
      instance.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'provisioning':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'suspended':
        return <Pause className="w-5 h-5 text-gray-500" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'provisioning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const stats = {
    total: instances.length,
    active: instances.filter(i => i.status === 'active').length,
    provisioning: instances.filter(i => i.status === 'provisioning').length,
    error: instances.filter(i => i.status === 'error').length,
    totalInteractions: instances.reduce((sum, i) => sum + i.totalInteractions, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">King Mouse Admin</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage OpenClaw instances and Telegram bots for customers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchKingMouseInstances}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
              >
                <Bot className="w-4 h-4" />
                Provision New
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Instances</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Provisioning</p>
                <p className="text-2xl font-bold text-gray-900">{stats.provisioning}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-mouse-teal/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-mouse-teal" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Interactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInteractions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by company, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mouse-teal focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mouse-teal focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="provisioning">Provisioning</option>
                  <option value="error">Error</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-mouse-teal mx-auto" />
                      <p className="mt-2 text-gray-500">Loading instances...</p>
                    </td>
                  </tr>
                ) : filteredInstances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No King Mouse instances found
                    </td>
                  </tr>
                ) : (
                  filteredInstances.map((instance) => (
                    <tr key={instance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{instance.companyName}</p>
                          <p className="text-sm text-gray-500">{instance.customerEmail}</p>
                          <p className="text-xs text-gray-400 font-mono mt-1">{instance.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(instance.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(instance.status)}`}>
                            {instance.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">OpenClaw: {instance.openclawStatus}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-mouse-teal/10 text-mouse-teal rounded-full capitalize">
                          {instance.planTier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {instance.totalInteractions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {instance.lastActiveAt 
                          ? new Date(instance.lastActiveAt).toLocaleString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedInstance(instance)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="View Details"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          <a
                            href={instance.botLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-mouse-teal hover:text-teal-700"
                            title="Open Telegram Bot"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInstance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Instance Details</h2>
                <button
                  onClick={() => setSelectedInstance(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-sm font-mono text-gray-900">{selectedInstance.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer ID</label>
                  <p className="text-sm font-mono text-gray-900">{selectedInstance.customerId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedInstance.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedInstance.status)}`}>
                      {selectedInstance.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Plan Tier</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedInstance.planTier}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Bot Link</label>
                <a 
                  href={selectedInstance.botLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-mouse-teal hover:underline block mt-1"
                >
                  {selectedInstance.botLink}
                </a>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4" />
                    Restart
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Pause className="w-4 h-4" />
                    Suspend
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                    Deprovision
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
