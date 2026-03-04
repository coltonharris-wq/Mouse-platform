'use client';

import { useState } from 'react';
import { 
  Wrench, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Activity,
  Shield,
  Zap,
  Server,
  History,
  Play,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// Types
interface DoctorCheck {
  id: string;
  timestamp: string;
  vmId: string;
  employeeId: string;
  status: 'healthy' | 'warning' | 'critical';
  checks: CheckResult[];
  fixesApplied: FixResult[];
}

interface CheckResult {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  fixable: boolean;
}

interface FixResult {
  checkName: string;
  success: boolean;
  message: string;
  timestamp: string;
}

interface UpdateHistory {
  id: string;
  timestamp: string;
  fromVersion: string;
  toVersion: string;
  status: string;
  duration?: number;
  autoUpdate: boolean;
}

interface RestartLog {
  id: string;
  timestamp: string;
  type: string;
  success: boolean;
  triggeredBy: string;
}

interface DetectedIssue {
  id: string;
  timestamp: string;
  pattern: {
    category: string;
    severity: string;
    description: string;
  };
  status: string;
  fixAttempts: FixAttempt[];
}

interface FixAttempt {
  action: string;
  success: boolean;
  message: string;
}

interface SystemHealth {
  overallScore: number;
  doctorScore: number;
  updaterScore: number;
  restartScore: number;
  healingScore: number;
}

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'doctor' | 'updates' | 'restarts' | 'healing'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [health] = useState<SystemHealth>({
    overallScore: 95,
    doctorScore: 100,
    updaterScore: 100,
    restartScore: 98,
    healingScore: 92,
  });

  const [doctorRuns, setDoctorRuns] = useState<DoctorCheck[]>([
    {
      id: 'doc-001',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      vmId: 'vm-alex-001',
      employeeId: 'emp-001',
      status: 'healthy',
      checks: [
        { name: 'Dependencies Check', category: 'dependencies', status: 'pass', message: 'All dependencies satisfied', fixable: false },
        { name: 'Configuration Check', category: 'config', status: 'pass', message: 'Configuration valid', fixable: false },
        { name: 'Disk Space Check', category: 'disk', status: 'pass', message: 'Disk healthy: 45.2% used', fixable: false },
        { name: 'Gateway Health Check', category: 'health', status: 'pass', message: 'Gateway is responding', fixable: false },
      ],
      fixesApplied: [],
    },
  ]);

  const [updateHistory, setUpdateHistory] = useState<UpdateHistory[]>([
    {
      id: 'upd-001',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      fromVersion: '2.1.3',
      toVersion: '2.1.4',
      status: 'completed',
      duration: 45000,
      autoUpdate: true,
    },
  ]);

  const [restartLogs, setRestartLogs] = useState<RestartLog[]>([
    {
      id: 'rst-001',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      type: 'scheduled',
      success: true,
      triggeredBy: 'auto',
    },
  ]);

  const [issues, setIssues] = useState<DetectedIssue[]>([
    {
      id: 'heal-001',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      pattern: { category: 'network', severity: 'medium', description: 'Network request timed out' },
      status: 'fixed',
      fixAttempts: [
        { action: 'network_retry', success: true, message: 'Network recovered after 5000ms backoff' },
      ],
    },
  ]);

  const runDoctorNow = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newRun: DoctorCheck = {
      id: `doc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      vmId: 'vm-alex-001',
      employeeId: 'emp-001',
      status: 'healthy',
      checks: [
        { name: 'Dependencies Check', category: 'dependencies', status: 'pass', message: 'All dependencies satisfied', fixable: false },
        { name: 'Configuration Check', category: 'config', status: 'pass', message: 'Configuration valid', fixable: false },
        { name: 'Disk Space Check', category: 'disk', status: 'pass', message: 'Disk healthy: 42.1% used', fixable: false },
        { name: 'Gateway Health Check', category: 'health', status: 'pass', message: 'Gateway is responding', fixable: false },
      ],
      fixesApplied: [],
    };
    
    setDoctorRuns(prev => [newRun, ...prev]);
    setIsLoading(false);
  };

  const checkForUpdates = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert('🐭 Mouse checked for new training - already knows all the latest tricks! (v2.1.4)');
  };

  const restartService = async () => {
    if (!confirm('Are you sure you want to give your Mouse a quick nap? They\'ll wake up refreshed!')) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newLog: RestartLog = {
      id: `rst-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'manual',
      success: true,
      triggeredBy: 'manual',
    };

    setRestartLogs(prev => [newLog, ...prev]);
    setIsLoading(false);
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
      case 'completed':
      case 'fixed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
      case 'fail':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
      case 'completed':
      case 'fixed':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'fail':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-mouse-charcoal flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            🏥 Mouse Care Center
          </h1>
          <p className="text-mouse-slate text-sm mt-1">
            Keep your digital employees healthy and happy! 🐭🧀
          </p>
        </div>
        <button
          onClick={runDoctorNow}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-mouse-navy text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          🏥 Check Mouse Health
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <HealthCard title="Overall Health" score={health.overallScore} icon={<Activity className="w-5 h-5" />} color={health.overallScore >= 90 ? 'green' : health.overallScore >= 70 ? 'yellow' : 'red'} />
        <HealthCard title="Auto-Doctor" score={health.doctorScore} icon={<Shield className="w-5 h-5" />} lastRun={doctorRuns[0]?.timestamp} color={health.doctorScore >= 90 ? 'green' : health.doctorScore >= 70 ? 'yellow' : 'red'} />
        <HealthCard title="Auto-Updater" score={health.updaterScore} icon={<RefreshCw className="w-5 h-5" />} lastRun={updateHistory[0]?.timestamp} color={health.updaterScore >= 90 ? 'green' : health.updaterScore >= 70 ? 'yellow' : 'red'} />
        <HealthCard title="Auto-Restart" score={health.restartScore} icon={<Zap className="w-5 h-5" />} lastRun={restartLogs[0]?.timestamp} color={health.restartScore >= 90 ? 'green' : health.restartScore >= 70 ? 'yellow' : 'red'} />
        <HealthCard title="Self-Healing" score={health.healingScore} icon={<TrendingUp className="w-5 h-5" />} lastRun={issues[0]?.timestamp} color={health.healingScore >= 90 ? 'green' : health.healingScore >= 70 ? 'yellow' : 'red'} />
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'doctor', label: 'Auto-Doctor', icon: Shield },
            { id: 'updates', label: 'Updates', icon: RefreshCw },
            { id: 'restarts', label: 'Restarts', icon: Zap },
            { id: 'healing', label: 'Self-Healing', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-mouse-navy text-mouse-navy' : 'border-transparent text-mouse-slate hover:text-mouse-charcoal'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="Doctor Runs (24h)" value={doctorRuns.length} subtext="Last: 2 hours ago" icon={<Shield className="w-5 h-5 text-blue-500" />} />
              <StatCard title="Auto-Fixes Applied" value={doctorRuns.reduce((sum, run) => sum + run.fixesApplied.length, 0)} subtext="Issues resolved automatically" icon={<CheckCircle className="w-5 h-5 text-green-500" />} />
              <StatCard title="Service Restarts" value={restartLogs.length} subtext="Last: 12 hours ago" icon={<Zap className="w-5 h-5 text-yellow-500" />} />
              <StatCard title="Issues Healed" value={issues.filter(i => i.status === 'fixed').length} subtext="Self-healed automatically" icon={<TrendingUp className="w-5 h-5 text-mouse-teal" />} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-mouse-charcoal flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Activity
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {[...doctorRuns, ...restartLogs, ...issues]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 10)
                  .map((item: any, idx) => (
                    <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {item.checks ? <Shield className="w-5 h-5 text-blue-500" /> : item.type ? <Zap className="w-5 h-5 text-yellow-500" /> : <TrendingUp className="w-5 h-5 text-mouse-teal" />}
                        <div>
                          <p className="text-sm font-medium text-mouse-charcoal">{item.checks ? 'Health check completed' : item.type ? `Service ${item.type} restart` : `Issue ${item.status}`}</p>
                          <p className="text-xs text-mouse-slate">{formatTimeAgo(item.timestamp)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status || 'completed')}`}>{item.status || 'completed'}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctor' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-mouse-charcoal flex items-center gap-2"><Shield className="w-5 h-5" />Doctor Run History</h3>
              <span className="text-sm text-mouse-slate">Runs every 6 hours automatically</span>
            </div>
            <div className="divide-y divide-gray-100">
              {doctorRuns.map((run) => (
                <div key={run.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(run.status)}
                      <div>
                        <p className="text-sm font-medium text-mouse-charcoal">Health Check - {run.vmId}</p>
                        <p className="text-xs text-mouse-slate">{formatTimeAgo(run.timestamp)} • {run.checks.length} checks</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>{run.status}</span>
                  </div>
                  {run.fixesApplied.length > 0 && <div className="mt-2 ml-8 text-sm text-green-600">✓ {run.fixesApplied.length} auto-fixes applied</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-mouse-charcoal">🎓 Mouse Training Status</h3>
                  <p className="text-sm text-mouse-slate mt-1">Current training level: <span className="font-mono font-medium">2.1.4</span></p>
                </div>
                <button onClick={checkForUpdates} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Check for New Tricks
                </button>
              </div>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">🐭 Mouse knows all the latest tricks!</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-mouse-charcoal">Update History</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {updateHistory.map((update) => (
                  <div key={update.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><RefreshCw className="w-5 h-5 text-blue-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-mouse-charcoal">Version {update.fromVersion} → {update.toVersion}</p>
                        <p className="text-xs text-mouse-slate">{formatTimeAgo(update.timestamp)} • {update.autoUpdate ? 'Auto-update' : 'Manual'}{update.duration && ` • ${(update.duration / 1000).toFixed(1)}s`}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>{update.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'restarts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-mouse-charcoal">🐭 Mouse Status</h3>
                  <p className="text-sm text-mouse-slate mt-1">Mouse ID: <span className="font-mono">2847</span> • Working since: 12h 34m</p>
                </div>
                <button onClick={restartService} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50">
                  <Zap className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  💤 Give Mouse a Nap
                </button>
              </div>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                <Server className="w-5 h-5" />
                <span className="text-sm font-medium">🐭 Mouse is energetic and working hard!</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-mouse-charcoal">Restart History</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {restartLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.type === 'scheduled' ? 'bg-green-100' : log.type === 'memory_leak' ? 'bg-yellow-100' : log.type === 'crash' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <Zap className={`w-5 h-5 ${log.type === 'scheduled' ? 'text-green-600' : log.type === 'memory_leak' ? 'text-yellow-600' : log.type === 'crash' ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-mouse-charcoal capitalize">{log.type.replace('_', ' ')} Restart</p>
                        <p className="text-xs text-mouse-slate">{formatTimeAgo(log.timestamp)} • {log.triggeredBy === 'auto' ? 'Automatic' : 'Manual'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{log.success ? 'Success' : 'Failed'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'healing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-mouse-charcoal mb-4">Self-Healing Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-mouse-charcoal">{issues.length}</p><p className="text-sm text-mouse-slate">Total Issues</p></div>
                <div className="text-center p-4 bg-green-50 rounded-lg"><p className="text-2xl font-bold text-green-600">{issues.filter(i => i.status === 'fixed').length}</p><p className="text-sm text-green-700">Auto-Fixed</p></div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg"><p className="text-2xl font-bold text-yellow-600">{issues.filter(i => i.status === 'alerted').length}</p><p className="text-sm text-yellow-700">Need Attention</p></div>
                <div className="text-center p-4 bg-blue-50 rounded-lg"><p className="text-2xl font-bold text-blue-600">{issues.length > 0 ? Math.round((issues.filter(i => i.status === 'fixed').length / issues.length) * 100) : 0}%</p><p className="text-sm text-blue-700">Success Rate</p></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-mouse-charcoal">Recent Issues</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {issues.map((issue) => (
                  <div key={issue.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {issue.status === 'fixed' ? <CheckCircle className="w-5 h-5 text-green-500" /> : issue.status === 'alerted' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <Activity className="w-5 h-5 text-gray-400" />}
                        <div>
                          <p className="text-sm font-medium text-mouse-char capitalize">{issue.pattern.category.replace('_', ' ')}</p>
                          <p className="text-xs text-mouse-slate">{formatTimeAgo(issue.timestamp)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>{issue.status}</span>
                    </div>
                    <p className="text-sm text-mouse-slate ml-8">{issue.pattern.description}</p>
                    {issue.fixAttempts.length > 0 && (
                      <div className="ml-8 mt-2 space-y-1">
                        {issue.fixAttempts.map((attempt, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            {attempt.success ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                            <span className={attempt.success ? 'text-green-700' : 'text-red-700'}>{attempt.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HealthCard({ title, score, icon, color, lastRun }: { title: string; score: number; icon: React.ReactNode; color: 'green' | 'yellow' | 'red'; lastRun?: string }) {
  const colorClasses = { green: 'bg-green-50 border-green-200', yellow: 'bg-yellow-50 border-yellow-200', red: 'bg-red-50 border-red-200' };
  const scoreColor = { green: 'text-green-600', yellow: 'text-yellow-600', red: 'text-red-600' };
  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-mouse-slate">{title}</span>
        <span className={scoreColor[color]}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${scoreColor[color]}`}>{score}</span>
        <span className="text-sm text-mouse-slate">/100</span>
      </div>
      {lastRun && <p className="text-xs text-mouse-slate mt-1">Last run: {new Date(lastRun).toLocaleTimeString()}</p>}
    </div>
  );
}

function StatCard({ title, value, subtext, icon }: { title: string; value: number; subtext: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200">
      <div className="flex items-center gap-3 mb-2">{icon}<span className="text-sm text-mouse-slate">{title}</span></div>
      <p className="text-2xl font-bold text-mouse-charcoal">{value}</p>
      <p className="text-xs text-mouse-slate mt-1">{subtext}</p>
    </div>
  );
}
