'use client';

import Sidebar from '../../components/layout/Sidebar';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Plus
} from 'lucide-react';
import { useState } from 'react';

const aiEmployees = [
  { 
    id: '1', 
    name: 'Sales Assistant', 
    role: 'Sales', 
    status: 'active', 
    skills: ['Lead Qualification', 'Email Outreach', 'CRM Management'],
    tasksCompleted: 1247,
    efficiency: 94,
    avatar: 'S'
  },
  { 
    id: '2', 
    name: 'Support Agent', 
    role: 'Support', 
    status: 'active', 
    skills: ['Ticket Resolution', 'Live Chat', 'Knowledge Base'],
    tasksCompleted: 3892,
    efficiency: 97,
    avatar: 'C'
  },
  { 
    id: '3', 
    name: 'Data Analyst', 
    role: 'Analytics', 
    status: 'paused', 
    skills: ['Report Generation', 'Data Visualization', 'SQL'],
    tasksCompleted: 456,
    efficiency: 89,
    avatar: 'D'
  },
];

export default function CustomerDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="customer" />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600">Manage your AI employees and view performance</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Hire AI Employee
            </button>
          </div>

          {/* AI Employees Grid */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your AI Employees</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {aiEmployees.map((employee) => (
              <div key={employee.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                      {employee.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-600">{employee.role}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {employee.status === 'active' ? (
                      <>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Active
                      </>
                    ) : (
                      <>
                        <Pause className="w-3 h-3" />
                        Paused
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {employee.skills.map((skill) => (
                    <span key={skill} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md mr-2">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-sm text-gray-600">Tasks</div>
                    <div className="text-lg font-semibold text-gray-900">{employee.tasksCompleted.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                    <div className="text-lg font-semibold text-green-600">{employee.efficiency}%</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Settings className="w-4 h-4" />
                    Configure
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* VM Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">VM Status</h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Running</span>
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">12%</div>
                <div className="text-sm text-gray-600">CPU Usage</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">4.2 GB</div>
                <div className="text-sm text-gray-600">Memory Used</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">14d 6h</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
