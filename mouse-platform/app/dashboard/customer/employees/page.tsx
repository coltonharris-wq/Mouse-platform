'use client';

import { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Search, 
  Filter,
  Settings,
  BarChart3,
  Pause,
  Play,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Monitor,
  MessageSquare,
  Code,
  Headphones,
  TrendingUp,
  Palette,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'paused' | 'error';
  avatar: string;
  skills: string[];
  tasksCompleted: number;
  efficiency: number;
  hoursWorked: number;
  lastActive: string;
  vmStatus: 'running' | 'stopped';
}

const aiEmployees: AIEmployee[] = [
  { 
    id: '1', 
    name: 'Web Developer Knight', 
    role: 'Web Development', 
    status: 'active', 
    avatar: '🛡️',
    skills: ['React', 'Node.js', 'Python', 'CSS'],
    tasksCompleted: 1247,
    efficiency: 94,
    hoursWorked: 342,
    lastActive: '2 min ago',
    vmStatus: 'running',
  },
  { 
    id: '2', 
    name: 'Support Agent Alice', 
    role: 'Customer Support', 
    status: 'active', 
    avatar: '🎧',
    skills: ['Ticket Resolution', 'Live Chat', 'Email Support'],
    tasksCompleted: 3892,
    efficiency: 97,
    hoursWorked: 567,
    lastActive: '5 min ago',
    vmStatus: 'running',
  },
  { 
    id: '3', 
    name: 'Data Analyst Bob', 
    role: 'Data Analytics', 
    status: 'paused', 
    avatar: '📊',
    skills: ['SQL', 'Python', 'Tableau', 'Excel'],
    tasksCompleted: 456,
    efficiency: 89,
    hoursWorked: 189,
    lastActive: '2 hours ago',
    vmStatus: 'stopped',
  },
  { 
    id: '4', 
    name: 'Social Media Maven', 
    role: 'Social Media', 
    status: 'active', 
    avatar: '📱',
    skills: ['Content Creation', 'Analytics', 'Scheduling'],
    tasksCompleted: 892,
    efficiency: 92,
    hoursWorked: 234,
    lastActive: '15 min ago',
    vmStatus: 'running',
  },
  { 
    id: '5', 
    name: 'Sales Rep Sarah', 
    role: 'Sales', 
    status: 'active', 
    avatar: '💼',
    skills: ['Lead Gen', 'CRM', 'Email Outreach'],
    tasksCompleted: 567,
    efficiency: 95,
    hoursWorked: 278,
    lastActive: '30 min ago',
    vmStatus: 'running',
  },
];

const employeeTemplates = [
  {
    role: 'Web Developer',
    icon: Code,
    description: 'Build and maintain websites and web applications',
    skills: ['React', 'Node.js', 'Python', 'CSS', 'JavaScript'],
    hourlyRate: 3.98,
  },
  {
    role: 'Customer Support',
    icon: Headphones,
    description: 'Handle customer inquiries and support tickets',
    skills: ['Ticket Resolution', 'Live Chat', 'Email Support', 'CRM'],
    hourlyRate: 3.50,
  },
  {
    role: 'Data Analyst',
    icon: TrendingUp,
    description: 'Analyze data and generate insights',
    skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'],
    hourlyRate: 4.50,
  },
  {
    role: 'Social Media Manager',
    icon: Palette,
    description: 'Manage social media presence and content',
    skills: ['Content Creation', 'Analytics', 'Scheduling', 'Copywriting'],
    hourlyRate: 3.75,
  },
  {
    role: 'Sales Representative',
    icon: MessageSquare,
    description: 'Generate leads and close sales',
    skills: ['Lead Gen', 'CRM', 'Email Outreach', 'Cold Calling'],
    hourlyRate: 3.75,
  },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<AIEmployee[]>(aiEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof employeeTemplates[0] | null>(null);
  const [deployStep, setDeployStep] = useState(1);
  const [newEmployeeName, setNewEmployeeName] = useState('');

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeploy = () => {
    if (!selectedTemplate || !newEmployeeName) return;

    const newEmployee: AIEmployee = {
      id: (employees.length + 1).toString(),
      name: newEmployeeName,
      role: selectedTemplate.role,
      status: 'active',
      avatar: '🤖',
      skills: selectedTemplate.skills,
      tasksCompleted: 0,
      efficiency: 100,
      hoursWorked: 0,
      lastActive: 'Just now',
      vmStatus: 'running',
    };

    setEmployees([...employees, newEmployee]);
    setShowDeployModal(false);
    setSelectedTemplate(null);
    setNewEmployeeName('');
    setDeployStep(1);
  };

  const toggleEmployeeStatus = (id: string) => {
    setEmployees(employees.map(emp => 
      emp.id === id 
        ? { ...emp, status: emp.status === 'active' ? 'paused' : 'active' }
        : emp
    ));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">AI Employees</h1>
            <p className="text-gray-600">Manage and deploy your AI workforce</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {employees.filter(e => e.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">
              {employees.reduce((sum, e) => sum + e.tasksCompleted, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Avg Efficiency</p>
            <p className="text-2xl font-bold text-[#1e3a5f]">
              {Math.round(employees.reduce((sum, e) => sum + e.efficiency, 0) / employees.length)}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center text-2xl">
                    {employee.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.role}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  employee.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : employee.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.status === 'active' ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Active
                    </>
                  ) : employee.status === 'paused' ? (
                    <>
                      <Pause className="w-3 h-3" />
                      Paused
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      Error
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
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

              <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tasks</p>
                  <p className="font-semibold text-gray-900">{employee.tasksCompleted.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Efficiency</p>
                  <p className="font-semibold text-green-600">{employee.efficiency}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Hours</p>
                  <p className="font-semibold text-gray-900">{employee.hoursWorked}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Monitor className="w-4 h-4" />
                  <span className={employee.vmStatus === 'running' ? 'text-green-600' : 'text-gray-400'}>
                    VM {employee.vmStatus}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleEmployeeStatus(employee.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      employee.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {employee.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <Link
                    href={`/dashboard/customer/employees/${employee.id}`}
                    className="p-2 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f]/20"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteEmployee(employee.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-600 mb-4">Deploy your first AI employee to get started</p>
            <button
              onClick={() => setShowDeployModal(true)}
              className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f]"
            >
              Deploy Employee
            </button>
          </div>
        )}

        {/* Deploy Modal */}
        {showDeployModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#1e3a5f]">
                    {deployStep === 1 ? 'Select Role' : 'Configure Employee'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowDeployModal(false);
                      setSelectedTemplate(null);
                      setDeployStep(1);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {deployStep === 1 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {employeeTemplates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={template.role}
                          onClick={() => {
                            setSelectedTemplate(template);
                            setDeployStep(2);
                          }}
                          className="p-4 border-2 border-gray-200 rounded-xl text-left hover:border-[#1e3a5f] transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-[#1e3a5f]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{template.role}</h3>
                              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                              <p className="text-sm text-green-600 mt-2">${template.hourlyRate}/hour</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  selectedTemplate && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                          <selectedTemplate.icon className="w-8 h-8 text-[#1e3a5f]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedTemplate.role}</h3>
                          <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                          <p className="text-sm text-green-600 mt-1">${selectedTemplate.hourlyRate}/hour</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee Name
                        </label>
                        <input
                          type="text"
                          value={newEmployeeName}
                          onChange={(e) => setNewEmployeeName(e.target.value)}
                          placeholder={`e.g., ${selectedTemplate.role} Knight`}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Skills
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.skills.map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setDeployStep(1)}
                          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleDeploy}
                          disabled={!newEmployeeName}
                          className="flex-1 py-3 bg-[#1e3a5f] text-white rounded-xl font-semibold hover:bg-[#2d4a6f] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Deploy Employee
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
