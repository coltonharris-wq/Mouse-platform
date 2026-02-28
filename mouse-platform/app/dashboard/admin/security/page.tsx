'use client';

import { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  UserCheck,
  Server,
  Globe,
  Key,
  Activity,
  FileWarning,
  Ban,
  Fingerprint,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface SecurityLayer {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'active' | 'warning' | 'critical';
  metrics: { label: string; value: string }[];
  lastChecked: string;
}

const securityLayers: SecurityLayer[] = [
  {
    id: 'auth',
    name: 'Authentication Layer',
    description: 'Multi-factor authentication and session management',
    icon: Key,
    status: 'active',
    metrics: [
      { label: 'Active Sessions', value: '1,247' },
      { label: 'MFA Enabled', value: '98.5%' },
      { label: 'Failed Logins (24h)', value: '23' },
    ],
    lastChecked: '2 min ago',
  },
  {
    id: 'rate',
    name: 'Rate Limiting Layer',
    description: 'Request throttling and abuse prevention',
    icon: Activity,
    status: 'active',
    metrics: [
      { label: 'Requests/min', value: '4,532' },
      { label: 'Throttled', value: '127' },
      { label: 'Blocked IPs', value: '8' },
    ],
    lastChecked: '1 min ago',
  },
  {
    id: 'access',
    name: 'Access Control Layer',
    description: 'Role-based access control and permissions',
    icon: UserCheck,
    status: 'active',
    metrics: [
      { label: 'Permission Checks', value: '89.2K' },
      { label: 'Violations', value: '0' },
      { label: 'Role Changes', value: '12' },
    ],
    lastChecked: '5 min ago',
  },
  {
    id: 'data',
    name: 'Data Protection Layer',
    description: 'Encryption and data privacy controls',
    icon: Lock,
    status: 'active',
    metrics: [
      { label: 'Encrypted Records', value: '2.4M' },
      { label: 'Data Transfer', value: '1.2 GB/hr' },
      { label: 'Privacy Flags', value: '0' },
    ],
    lastChecked: '3 min ago',
  },
  {
    id: 'vm',
    name: 'VM Isolation Layer',
    description: 'Virtual machine sandboxing and isolation',
    icon: Server,
    status: 'warning',
    metrics: [
      { label: 'Active VMs', value: '3,842' },
      { label: 'Isolated', value: '3,840' },
      { label: 'Alerts', value: '2' },
    ],
    lastChecked: '30 sec ago',
  },
  {
    id: 'network',
    name: 'Network Security Layer',
    description: 'Firewall and network traffic monitoring',
    icon: Globe,
    status: 'active',
    metrics: [
      { label: 'Connections', value: '15.7K' },
      { label: 'Blocked', value: '1,234' },
      { label: 'Anomalies', value: '0' },
    ],
    lastChecked: '1 min ago',
  },
];

interface SecurityLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'critical';
  event: string;
  user: string;
  ip: string;
  details: string;
}

const mockLogs: SecurityLog[] = [
  {
    id: '1',
    timestamp: '2026-02-28 16:20:15',
    level: 'info',
    event: 'User Login',
    user: 'admin@mouse.ai',
    ip: '192.168.1.100',
    details: 'Successful login with MFA',
  },
  {
    id: '2',
    timestamp: '2026-02-28 16:18:42',
    level: 'warning',
    event: 'Rate Limit Exceeded',
    user: 'api@customer.com',
    ip: '203.0.113.45',
    details: 'Request rate exceeded 1000/min threshold',
  },
  {
    id: '3',
    timestamp: '2026-02-28 16:15:33',
    level: 'info',
    event: 'VM Deployed',
    user: 'king-mouse',
    ip: 'internal',
    details: 'New AI employee VM deployed successfully',
  },
  {
    id: '4',
    timestamp: '2026-02-28 16:12:08',
    level: 'critical',
    event: 'Failed Authentication',
    user: 'unknown',
    ip: '198.51.100.23',
    details: 'Multiple failed login attempts blocked',
  },
  {
    id: '5',
    timestamp: '2026-02-28 16:10:55',
    level: 'info',
    event: 'Permission Granted',
    user: 'sales@mouse.ai',
    ip: '192.168.1.105',
    details: 'Access granted to customer data',
  },
  {
    id: '6',
    timestamp: '2026-02-28 16:08:21',
    level: 'warning',
    event: 'VM Resource Alert',
    user: 'system',
    ip: 'internal',
    details: 'High CPU usage detected on VM-3841',
  },
  {
    id: '7',
    timestamp: '2026-02-28 16:05:47',
    level: 'info',
    event: 'Data Export',
    user: 'admin@mouse.ai',
    ip: '192.168.1.100',
    details: 'Customer report exported',
  },
  {
    id: '8',
    timestamp: '2026-02-28 16:02:12',
    level: 'info',
    event: 'Session Extended',
    user: 'reseller@partner.com',
    ip: '192.168.1.110',
    details: 'Session timeout extended',
  },
];

export default function SecurityPage() {
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleLayer = (id: string) => {
    setExpandedLayer(expandedLayer === id ? null : id);
  };

  const filteredLogs = mockLogs.filter((log) => {
    const matchesFilter = logFilter === 'all' || log.level === logFilter;
    const matchesSearch = 
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Security Center</h1>
          <p className="text-gray-600">6-Layer Security Guardrails & Monitoring</p>
        </div>

        {/* Security Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-800">5/6</p>
                <p className="text-sm text-green-600">Layers Active</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-800">99.9%</p>
                <p className="text-sm text-blue-600">Uptime</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-800">2</p>
                <p className="text-sm text-yellow-600">Warnings</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-800">30s</p>
                <p className="text-sm text-purple-600">Last Check</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 6-Layer Guardrails */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e3a5f]">Security Layers</h2>
              <span className="text-sm text-gray-500">All systems monitored</span>
            </div>

            {securityLayers.map((layer) => {
              const Icon = layer.icon;
              const isExpanded = expandedLayer === layer.id;

              return (
                <div
                  key={layer.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleLayer(layer.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        layer.status === 'active' ? 'bg-green-100' :
                        layer.status === 'warning' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          layer.status === 'active' ? 'text-green-600' :
                          layer.status === 'warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{layer.name}</h3>
                        <p className="text-sm text-gray-600">{layer.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(layer.status)}`}>
                        {layer.status === 'active' ? 'Protected' : layer.status === 'warning' ? 'Warning' : 'Critical'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {layer.metrics.map((metric) => (
                          <div key={metric.label} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">{metric.label}</p>
                            <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        Last checked: {layer.lastChecked}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Auth Protection Indicators */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                Auth Protection
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">MFA Required</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Session Timeout</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">30 min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">IP Whitelist</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Password Policy</span>
                  </div>
                  <span className="text-xs text-yellow-600 font-medium">Review</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Rate Limits
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>API Requests</span>
                    <span className="text-gray-600">4.5K / 10K</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full w-[45%] bg-blue-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Login Attempts</span>
                    <span className="text-gray-600">23 / 100</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full w-[23%] bg-green-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>VM Deployments</span>
                    <span className="text-gray-600">842 / 1000</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full w-[84%] bg-yellow-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Logs */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-[#1e3a5f]">Security Logs</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]"
                />
              </div>
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{log.timestamp}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{log.event}</td>
                      <td className="px-4 py-3 text-gray-600">{log.user}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{log.ip}</td>
                      <td className="px-4 py-3 text-gray-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
