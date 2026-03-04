'use client';

import { useState, useEffect, useRef } from 'react';
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
  Clock,
  Users,
  TrendingUp,
  Award,
  MessageCircle
} from 'lucide-react';
import { useWorkHours, WORK_HOURS_COSTS } from '../context/WorkHoursContext';
import { useSecurity } from '../context/SecurityContext';
import EmployeeCard from './EmployeeCard';
import InterviewModal from './InterviewModal';

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
  avatarUrl?: string;
  createdAt: Date;
  config?: Record<string, any>;
  introMessage?: string;
  // Trust metrics
  totalBusinesses?: number;
  totalHoursSaved?: number;
  successRate?: number;
  monthlyWorkHours?: number;
  monthlyHoursSaved?: number;
  hourlyRate?: number;
}

const EMPLOYEE_TEMPLATES = {
  sales: {
    name: 'Sales Assistant',
    skills: ['Lead Qualification', 'Email Outreach', 'CRM Management', 'Demo Scheduling'],
    avatar: 'S',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    description: 'Qualifies leads, schedules demos, and manages your sales pipeline',
    hourlyRate: 1,
    monthlyWorkHours: 10,
    monthlyHoursSaved: 40,
    effectiveHourlyRate: 4.98,
    introMessage: "Hi! I'm Sarah. I can handle your sales follow-ups, qualify leads, schedule demos, and keep your CRM organized. I typically save businesses 40 hours per month by automating repetitive sales tasks. Let's chat about your pipeline!",
    totalBusinesses: 2847,
    totalHoursSaved: 113880,
    successRate: 96,
  },
  support: {
    name: 'Support Agent',
    skills: ['Ticket Resolution', 'Live Chat', 'Knowledge Base', 'Escalation'],
    avatar: 'C',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    description: 'Handles customer support tickets and live chat inquiries',
    hourlyRate: 0.8,
    monthlyWorkHours: 10,
    monthlyHoursSaved: 42,
    effectiveHourlyRate: 4.76,
    introMessage: "Hello! I'm Marcus. I'm here to help with customer support tickets, live chat, and building your knowledge base. I can resolve issues 24/7 and escalate complex cases to your team. Businesses using me save over 40 hours monthly on support tasks!",
    totalBusinesses: 3156,
    totalHoursSaved: 132552,
    successRate: 98,
  },
  developer: {
    name: 'Code Assistant',
    skills: ['Code Review', 'Bug Fixing', 'Documentation', 'Testing'],
    avatar: 'D',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    description: 'Assists with code review, debugging, and documentation',
    hourlyRate: 1.5,
    monthlyWorkHours: 10,
    monthlyHoursSaved: 38,
    effectiveHourlyRate: 5.26,
    introMessage: "Hey there! I'm Alex. I can review your code, help debug issues, write documentation, and run tests. I work around the clock to keep your codebase clean and your deployments smooth. On average, I help teams save 38 hours per month!",
    totalBusinesses: 1923,
    totalHoursSaved: 73074,
    successRate: 94,
  },
  analyst: {
    name: 'Data Analyst',
    skills: ['Report Generation', 'Data Visualization', 'SQL', 'Forecasting'],
    avatar: 'A',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    description: 'Analyzes data, generates reports, and creates visualizations',
    hourlyRate: 1.2,
    monthlyWorkHours: 10,
    monthlyHoursSaved: 36,
    effectiveHourlyRate: 5.56,
    introMessage: "Hi! I'm Jordan. I specialize in turning your data into actionable insights. I can generate reports, create visualizations, run SQL queries, and help with forecasting. Let me help you make data-driven decisions while saving 36 hours every month!",
    totalBusinesses: 1567,
    totalHoursSaved: 56412,
    successRate: 97,
  },
};

// Calculate global trust metrics
const calculateGlobalMetrics = () => {
  let totalBusinesses = 0;
  let totalHoursSaved = 0;
  let totalSuccessRate = 0;
  const count = Object.keys(EMPLOYEE_TEMPLATES).length;
  
  Object.values(EMPLOYEE_TEMPLATES).forEach(template => {
    totalBusinesses += template.totalBusinesses;
    totalHoursSaved += template.totalHoursSaved;
    totalSuccessRate += template.successRate;
  });
  
  return {
    totalBusinesses,
    totalHoursSaved,
    avgSuccessRate: Math.round(totalSuccessRate / count),
  };
};

export default function EmployeeMarketplace() {
  const [employees, setEmployees] = useState<AIEmployee[]>([
    {
      id: '1',
      name: 'Sarah',
      role: 'sales',
      status: 'working',
      skills: ['Lead Qualification', 'Email Outreach', 'CRM Management'],
      tasksCompleted: 1247,
      hoursUsed: 45.2,
      efficiency: 94,
      avatar: 'S',
      avatarUrl: EMPLOYEE_TEMPLATES.sales.avatarUrl,
      createdAt: new Date(Date.now() - 86400000 * 30),
      introMessage: EMPLOYEE_TEMPLATES.sales.introMessage,
      totalBusinesses: EMPLOYEE_TEMPLATES.sales.totalBusinesses,
      totalHoursSaved: EMPLOYEE_TEMPLATES.sales.totalHoursSaved,
      successRate: EMPLOYEE_TEMPLATES.sales.successRate,
      monthlyWorkHours: EMPLOYEE_TEMPLATES.sales.monthlyWorkHours,
      monthlyHoursSaved: EMPLOYEE_TEMPLATES.sales.monthlyHoursSaved,
      hourlyRate: EMPLOYEE_TEMPLATES.sales.effectiveHourlyRate,
    },
    {
      id: '2',
      name: 'Marcus',
      role: 'support',
      status: 'idle',
      skills: ['Ticket Resolution', 'Live Chat', 'Knowledge Base'],
      tasksCompleted: 3892,
      hoursUsed: 128.5,
      efficiency: 97,
      avatar: 'C',
      avatarUrl: EMPLOYEE_TEMPLATES.support.avatarUrl,
      createdAt: new Date(Date.now() - 86400000 * 60),
      introMessage: EMPLOYEE_TEMPLATES.support.introMessage,
      totalBusinesses: EMPLOYEE_TEMPLATES.support.totalBusinesses,
      totalHoursSaved: EMPLOYEE_TEMPLATES.support.totalHoursSaved,
      successRate: EMPLOYEE_TEMPLATES.support.successRate,
      monthlyWorkHours: EMPLOYEE_TEMPLATES.support.monthlyWorkHours,
      monthlyHoursSaved: EMPLOYEE_TEMPLATES.support.monthlyHoursSaved,
      hourlyRate: EMPLOYEE_TEMPLATES.support.effectiveHourlyRate,
    },
  ]);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof EMPLOYEE_TEMPLATES | null>(null);
  const [customName, setCustomName] = useState('');
  const [interviewEmployee, setInterviewEmployee] = useState<AIEmployee | null>(null);
  const { balance, useHours } = useWorkHours();
  const { checkRateLimit, logEvent } = useSecurity();

  const globalMetrics = calculateGlobalMetrics();

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
      name: customName || template.name,
      role: selectedTemplate,
      status: 'idle',
      skills: template.skills,
      tasksCompleted: 0,
      hoursUsed: 0,
      efficiency: 95,
      avatar: template.avatar,
      avatarUrl: template.avatarUrl,
      createdAt: new Date(),
      introMessage: template.introMessage,
      totalBusinesses: template.totalBusinesses,
      totalHoursSaved: template.totalHoursSaved,
      successRate: template.successRate,
      monthlyWorkHours: template.monthlyWorkHours,
      monthlyHoursSaved: template.monthlyHoursSaved,
      hourlyRate: template.effectiveHourlyRate,
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

  const handleInterview = (employee: AIEmployee) => {
    setInterviewEmployee(employee);
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

      {/* Global Trust Metrics */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold">Trusted by Businesses Worldwide</h3>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-5 h-5 text-blue-300" />
              <span className="text-3xl font-bold">{globalMetrics.totalBusinesses.toLocaleString()}</span>
            </div>
            <p className="text-sm text-blue-200">Businesses Using Our AI Employees</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-green-300" />
              <span className="text-3xl font-bold">{(globalMetrics.totalHoursSaved / 1000).toFixed(0)}K+</span>
            </div>
            <p className="text-sm text-blue-200">Hours Saved Across All Businesses</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-purple-300" />
              <span className="text-3xl font-bold">{globalMetrics.avgSuccessRate}%</span>
            </div>
            <p className="text-sm text-blue-200">Average Success Rate</p>
          </div>
        </div>
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
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onToggleStatus={() => toggleStatus(employee.id)}
            onDelete={() => deleteEmployee(employee.id)}
            onInterview={() => handleInterview(employee)}
            getRoleIcon={getRoleIcon}
          />
        ))}
      </div>

      {/* Interview Modal */}
      {interviewEmployee && (
        <InterviewModal
          employee={interviewEmployee}
          onClose={() => setInterviewEmployee(null)}
        />
      )}

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
              <div className="grid grid-cols-1 gap-4">
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
                      <div className="flex items-start gap-4">
                        <img 
                          src={template.avatarUrl} 
                          alt={template.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 text-lg">{template.name}</p>
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="w-4 h-4" />
                              <span className="text-sm font-medium">{template.successRate}% success</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          
                          {/* New Cost Display - No Dollar Prices */}
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                              Cost: {template.monthlyWorkHours} work hours/month
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                              Avg {template.monthlyHoursSaved} hours saved/month
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                              ${template.effectiveHourlyRate}/hour
                            </span>
                          </div>
                          
                          {/* Trust Metrics */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {template.totalBusinesses.toLocaleString()} businesses
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {template.totalHoursSaved.toLocaleString()} hours saved
                            </span>
                          </div>
                        </div>
                      </div>
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

              {/* Cost Info - Updated */}
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