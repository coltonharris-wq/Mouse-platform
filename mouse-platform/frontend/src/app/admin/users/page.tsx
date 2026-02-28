'use client';

import { Users, Search, Filter, MoreVertical } from 'lucide-react';

export default function UsersPage() {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Admin', joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', role: 'User', joined: '2024-02-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive', role: 'User', joined: '2024-03-10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white rounded-lg hover:bg-mouse-teal-dark transition-colors">
          <Users className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full bg-dark-surface border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border text-gray-300 rounded-lg hover:bg-dark-bg-tertiary transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">User</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Role</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Joined</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-dark-border last:border-0">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{user.joined}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-dark-bg-tertiary rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
