'use client';

import { Bot, Plus, Play, Pause, Settings, Trash2 } from 'lucide-react';

export default function PortalEmployeesPage() {
  const employees = [
    { id: 1, name: 'Sales Assistant', type: 'Sales', status: 'Active', hoursUsed: 12.5, tasksCompleted: 45 },
    { id: 2, name: 'Support Bot', type: 'Support', status: 'Active', hoursUsed: 8.3, tasksCompleted: 128 },
    { id: 3, name: 'Data Analyst', type: 'Analytics', status: 'Paused', hoursUsed: 5.2, tasksCompleted: 12 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">My AI Employees</h2>
        <a href="/employees/new" className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white rounded-lg hover:bg-mouse-teal-dark transition-colors">
          <Plus className="w-4 h-4" />
          Deploy New Employee
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-purple/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-accent-purple" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.type}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                employee.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {employee.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-dark-bg rounded-lg p-3">
                <p className="text-xs text-gray-500">Hours Used</p>
                <p className="text-lg font-semibold text-white">{employee.hoursUsed}h</p>
              </div>
              <div className="bg-dark-bg rounded-lg p-3">
                <p className="text-xs text-gray-500">Tasks Done</p>
                <p className="text-lg font-semibold text-white">{employee.tasksCompleted}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                employee.status === 'Active' 
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}>
                {employee.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {employee.status === 'Active' ? 'Pause' : 'Resume'}
              </button>
              <button className="p-2 bg-dark-bg rounded-lg hover:bg-dark-bg-tertiary transition-colors">
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-2 bg-dark-bg rounded-lg hover:bg-rose-500/20 transition-colors">
                <Trash2 className="w-4 h-4 text-gray-500 hover:text-rose-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
