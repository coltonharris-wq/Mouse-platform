'use client';

import Sidebar from '../../components/layout/Sidebar';
import { CheckCircle, Clock, AlertCircle, Pause, Play, XCircle, Plus } from 'lucide-react';

const tasks = [
  { id: '1', title: 'Process support tickets', description: 'Respond to 15 pending support tickets', status: 'in-progress', priority: 'high', dueDate: 'Today' },
  { id: '2', title: 'Generate monthly report', description: 'Create analytics report for Q4 2025', status: 'pending', priority: 'medium', dueDate: 'Tomorrow' },
  { id: '3', title: 'Data cleanup', description: 'Clean and organize customer database', status: 'completed', priority: 'low', dueDate: 'Yesterday' },
  { id: '4', title: 'Email campaign setup', description: 'Configure automated email sequence', status: 'failed', priority: 'high', dueDate: 'Today' },
];

const statusIcons = {
  'completed': <CheckCircle className="w-5 h-5 text-green-600" />,
  'in-progress': <Clock className="w-5 h-5 text-blue-600" />,
  'pending': <Pause className="w-5 h-5 text-yellow-600" />,
  'failed': <XCircle className="w-5 h-5 text-red-600" />,
};

const priorityColors = {
  'high': 'bg-red-100 text-red-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'low': 'bg-green-100 text-green-800',
};

export default function TasksPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="customer" />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Queue</h1>
              <p className="text-gray-600">Manage and monitor AI employee tasks</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">All</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Pending</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">In Progress</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Completed</button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <div key={task.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {statusIcons[task.status as keyof typeof statusIcons]}
                      <div>
                        <div className="font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                            {task.priority}
                          </span>
                          <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.status !== 'completed' && (
                        <button className="p-2 hover:bg-gray-200 rounded-lg">
                          <Play className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
