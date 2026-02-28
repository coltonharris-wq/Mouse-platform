'use client';

import { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Trash2,
  Cpu,
  MessageSquare,
  Mail,
  Code,
  BarChart3,
  Shield,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useWorkHours, WORK_HOURS_COSTS } from '../context/WorkHoursContext';
import { useSecurity } from '../context/SecurityContext';

export interface AIEmployee {
  id: string;
  name: string;
  role: 'sales' | 'support' | 'developer' | 'analyst' | 'custom';
  status: 'idle' | 'working' | 'paused' | 'error';
  skills: string[];
  tasksCompleted: number;
  hoursUsed: number;
  efficiency: number;
  avatar: string;
  createdAt: Date;
  config?: Record<string, any>;
}

const EMPLOYEE_TEMPLATES = {
  sales: {
    name: 'Sales Assistant',
    skills: ['Lead Qualification', 'Email Outreach', 'CRM Management', 'Demo Scheduling'],
    avatar: 'S',
    description: 'Qualifies leads, schedules demos, and manages your sales pipeline',
    hourlyRate: 1,
  },
  support: {
    name: 'Support Agent',
    skills: ['Ticket Resolution', 'Live Chat', 'Knowledge Base', 'Escalation'],
    avatar: 'C',
    description: 'Handles customer support tickets and live chat inquiries',
    hourlyRate: 0.8,
  },
  developer: {
    name: 'Code Assistant',
    skills: ['Code Review', 'Bug Fixing', 'Documentation', 'Testing'],
    avatar: 'D',
    description: 'Assists with code review, debugging, and documentation',
    hourlyRate: 1.5,
  },
  analyst: {
    name: 'Data Analyst',
    skills: ['Report Generation', 'Data Visualization', 'SQL', 'Forecasting'],
    avatar: 'A',
    description: 'Analyzes data, generates reports, and creates visualizations',
    hourlyRate: 1.2,
  },
};

export default function EmployeeMarketplace() {
  const [employees, setEmployees] = useState<AIEmployee[]>([
    {
      id: '1',
      name: 'Sales Assistant',
      role: 'sales',
      status: 'working',
      skills: ['Lead Qualification', 'Email Outreach', 'CRM Management'],
      tasksCompleted: 1247,
      hoursUsed: 45.2,
      efficiency: 94,
      avatar: 'S',
      createdAt: new Date(Date.now() - 86400000 * 30),
    },
    {
      id: '2',
      name: 'Support Bot',
      role: 'support',
      status: 'idle',
      skills: ['Ticket Resolution', 'Live Chat', 'Knowledge Base'],
      tasksCompleted: 3892,
      hoursUsed: 128.5,
      efficiency: 97,
      avatar: 'C',
      createdAt: new Date(Date.now() - 86400000 * 60),
    },
  ]);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof EMPLOYEE_TEMPLATES | null>(null);
  const [customName, setCustomName] = useState('');
  const { balance, useHours } = useWorkHours();
  const { checkRateLimit, logEvent } = useSecurity();

  const deployEmployee = () => {
    if (!selectedTemplate) return;
    if (!checkRateLimit('deploy')) {
      alert('Rate limit exceeded. Please wait before deploying more employees.');
      return;
    }

    const template = EMPLOYEE_TEMPLATES[selectedTemplate];
    const deployCost = WORK_HOURS_COSTS.deployAiEmployee;

    if (balance < deployCost) {
      alert('Insufficient work hours. Please purchase more hours.');
      return;
    }

    const success = useHours(deployCost, `Deploy ${template.name}`, customName || template.name);
    if (!success) return;

    const newEmployee: AIEmployee = {
      id: Date.now().toString(),
      name: customName || `${template.name} ${employees.length + 1}`,
      role: selectedTemplate,
      status: 'idle',
      skills: template.skills,
      tasksCompleted: 0,
      hoursUsed: 0,
      efficiency: 95,
      avatar: template.avatar,
      createdAt: new Date(),
    };

    setEmployees([...employees, newEmployee]);
    setShowDeployModal(false);
    setSelectedTemplate(null);
    setCustomName('');

    logEvent({
      type: 'system',
      severity: 'low',
      message: `Deployed new AI employee: ${newEmployee.name}`,
    });
  };

  const toggleStatus = (id: string) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        const newStatus = emp.status === 'working' ? 'paused' : 'working';
        logEvent({
          type: 'system',
          severity: 'low',
          message: `${emp.name} status changed to ${newStatus}`,
        });
        return { ...emp, status: newStatus };
      }
      return emp;
    }));
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (emp && confirm(`Are you sure you want to delete ${emp.name}?`)) {
      setEmployees(employees.filter(e => e.id !== id));
      logEvent({
        type: 'system',
        severity: 'medium',
        message: `Deleted AI employee: ${emp.name}`,
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'sales': return <BarChart3 className="w-4 h-4" />;
      case 'support': return <MessageSquare className="w-4 h-4" />;
      case 'developer': return <Code className="w-4 h-4" />;
      case 'analyst': return <BarChart3 className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#1e3a5f]">AI Employee Marketplace</h2>
          <p className="text-gray-600">Deploy and manage your AI workforce</p>
        </div>
        <button
          onClick={() => setShowDeployModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Deploy Employee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-2xl font-bold text-[#1e3a5f]">{employees.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {employees.filter(e => e.status === 'working').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Tasks Completed</p>
          <p className="text-2xl font-bold text-[#1e3a5f]">
            {employees.reduce((sum, e) => sum + e.tasksCompleted, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Hours Used</p>
          <p className="text-2xl font-bold text-[#1e3a5f]">
            {employees.reduce((sum, e) => sum + e.hoursUsed, 0).toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {employee.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{employee.name}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    {getRoleIcon(employee.role)}
                    <span className="capitalize">{employee.role}</span>
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                employee.status === 'working' ? 'bg-green-100 text-green-800' :
                employee.status === 'idle' ? 'bg-gray-100 text-gray-800' :
                employee.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {employee.status === 'working' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                {employee.status === 'idle' && <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />}
                {employee.status === 'paused' && <Pause className="w-3 h-3" />}
                {employee.status === 'error' && <XCircle className="w-3 h-3" />}
                <span className="capitalize">{employee.status}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {employee.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                  {skill}
                </span>
              ))}
              {employee.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                  +{employee.skills.length - 3}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Tasks</p>
                <p className="font-semibold text-gray-900">{employee.tasksCompleted.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Hours</p>
                <p className="font-semibold text-gray-900">{employee.hoursUsed.toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Efficiency</p>
                <p className="font-semibold text-green-600">{employee.efficiency}%</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => toggleStatus(employee.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors ${
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
              <button className="p-2 text-gray-400 hover:text-[#1e3a5f] hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteEmployee(employee.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#1e3a5f]">Deploy AI Employee</h3>
              <p className="text-gray-600">Choose a template and customize your new employee</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Template Selection */}
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(EMPLOYEE_TEMPLATES) as Array<keyof typeof EMPLOYEE_TEMPLATES>).map((key) => {
                  const template = EMPLOYEE_TEMPLATES[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedTemplate(key)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        selectedTemplate === key
                          ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white font-bold">
                          {template.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{template.name}</p>
                          <p className="text-xs text-gray-500">{template.hourlyRate}h/hour</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Name */}
              {selectedTemplate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Name (optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={EMPLOYEE_TEMPLATES[selectedTemplate].name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  />
                </div>
              )}

              {/* Cost Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Deployment Cost:</strong> {WORK_HOURS_COSTS.deployAiEmployee} work hour
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Your balance: {balance.toFixed(1)} hours
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => { setShowDeployModal(false); setSelectedTemplate(null); setCustomName(''); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deployEmployee}
                disabled={!selectedTemplate || balance < WORK_HOURS_COSTS.deployAiEmployee}
                className="flex-1 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deploy Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
