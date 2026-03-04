'use client';

import { use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  MessageSquare, 
  Settings, 
  Activity,
  Clock,
  CheckCircle,
  Cpu,
  Globe
} from 'lucide-react';
import { useEmployees } from '@/app/context/EmployeeContext';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { employees, setEmployeeStatus, deleteEmployee, getEmployeeById } = useEmployees();
  
  const employee = getEmployeeById(id);

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Employee not found</h1>
        <p className="text-gray-600 mb-4">The employee you're looking for doesn't exist.</p>
        <Link href="/dashboard/employees" className="text-mouse-navy hover:underline">
          ← Back to employees
        </Link>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const newStatus = employee.status === 'working' ? 'idle' : 'working';
    setEmployeeStatus(employee.id, newStatus);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
      deleteEmployee(employee.id);
      window.location.href = '/dashboard/employees';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link 
        href="/dashboard/employees" 
        className="inline-flex items-center gap-2 text-mouse-slate hover:text-mouse-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to employees
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{employee.personality.avatar}</span>
            <div>
              <h1 className="text-2xl font-bold text-mouse-charcoal">{employee.name}</h1>
              <p className="text-mouse-slate">{employee.roleDisplay}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  employee.status === 'idle' ? 'bg-green-100 text-green-700' :
                  employee.status === 'working' ? 'bg-blue-100 text-blue-700' :
                  employee.status === 'paused' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {employee.status === 'idle' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                  {employee.status === 'working' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                  {employee.status === 'paused' && <Pause className="w-3 h-3" />}
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  Communication: {employee.personality.style}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                employee.status === 'working'
                  ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {employee.status === 'working' ? (
                <><Pause className="w-4 h-4" /> Pause</>
              ) : (
                <><Play className="w-4 h-4" /> Start</>
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-mouse-slate/20">
          <div className="flex items-center gap-2 text-mouse-slate text-sm mb-1">
            <CheckCircle className="w-4 h-4" />
            Tasks Completed
          </div>
          <p className="text-2xl font-bold text-mouse-charcoal">{employee.tasksCompleted}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-mouse-slate/20">
          <div className="flex items-center gap-2 text-mouse-slate text-sm mb-1">
            <Clock className="w-4 h-4" />
            Hours Used
          </div>
          <p className="text-2xl font-bold text-mouse-charcoal">{employee.hoursUsed.toFixed(1)}h</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-mouse-slate/20">
          <div className="flex items-center gap-2 text-mouse-slate text-sm mb-1">
            <Activity className="w-4 h-4" />
            Efficiency
          </div>
          <p className="text-2xl font-bold text-green-600">{employee.efficiency}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-mouse-slate/20">
          <div className="flex items-center gap-2 text-mouse-slate text-sm mb-1">
            <Cpu className="w-4 h-4" />
            VM ID
          </div>
          <p className="text-lg font-bold text-mouse-charcoal font-mono">{employee.vmId || 'N/A'}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Skills */}
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
          <h3 className="font-semibold text-mouse-charcoal mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {employee.skills.map(skill => (
              <span key={skill} className="px-3 py-1.5 bg-blue-50 text-mouse-navy text-sm rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* VM Details */}
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
          <h3 className="font-semibold text-mouse-charcoal mb-4">VM Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-mouse-slate">VM ID</span>
              <span className="font-mono text-sm">{employee.vmId || 'Not assigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mouse-slate">Internal IP</span>
              <span className="font-mono text-sm">{employee.vmIp || 'Not assigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mouse-slate">Mouse AI URL</span>
              <span className="font-mono text-sm text-mouse-navy">{employee.openclayUrl || 'Not assigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mouse-slate">Deployed</span>
              <span className="text-sm">
                {employee.deployedAt 
                  ? new Date(employee.deployedAt).toLocaleDateString() 
                  : 'Not deployed'}
              </span>
            </div>
          </div>
        </div>

        {/* Personality */}
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
          <h3 className="font-semibold text-mouse-charcoal mb-4">Personality</h3>
          <div className="space-y-3">
            <div>
              <span className="text-mouse-slate text-sm">Communication Style</span>
              <p className="font-medium capitalize">{employee.personality.style}</p>
            </div>
            <div>
              <span className="text-mouse-slate text-sm">Greeting</span>
              <p className="text-sm italic">"{employee.personality.greeting}"</p>
            </div>
            <div>
              <span className="text-mouse-slate text-sm">Signature</span>
              <p className="text-sm italic">"{employee.personality.signature}"</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-6">
          <h3 className="font-semibold text-mouse-charcoal mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 p-3 bg-blue-50 text-mouse-navy rounded-lg hover:bg-blue-100 transition-colors">
              <MessageSquare className="w-4 h-4" />
              Open Chat
            </button>
            <button className="w-full flex items-center gap-2 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Globe className="w-4 h-4" />
              View Mouse AI Dashboard
            </button>
            <button 
              onClick={handleDelete}
              className="w-full flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
