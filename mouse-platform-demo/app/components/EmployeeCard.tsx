'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Settings, 
  Trash2,
  MessageCircle,
  Users,
  Clock,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { AIEmployee } from './EmployeeMarketplace';

interface EmployeeCardProps {
  employee: AIEmployee;
  onToggleStatus: () => void;
  onDelete: () => void;
  onInterview: () => void;
  getRoleIcon: (role: string) => React.ReactNode;
}

export default function EmployeeCard({ 
  employee, 
  onToggleStatus, 
  onDelete, 
  onInterview,
  getRoleIcon 
}: EmployeeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar Section */}
      <div className="relative h-32 bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        
        {/* Human Avatar */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className={`relative transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}>
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
              {employee.avatarUrl ? (
                <img 
                  src={employee.avatarUrl} 
                  alt={employee.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center text-white text-2xl font-bold">
                  {employee.avatar}
                </div>
              )}
            </div>
            
            {/* Status Badge */}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
              employee.status === 'working' ? 'bg-green-500' :
              employee.status === 'idle' ? 'bg-gray-400' :
              employee.status === 'paused' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              {employee.status === 'working' && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 pb-4 px-6">
        {/* Name & Role */}
        <div className="text-center mb-4">
          <h3 className="font-bold text-gray-900 text-lg">{employee.name}</h3>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mt-1">
            {getRoleIcon(employee.role)}
            <span className="capitalize">{employee.role}</span>
          </div>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <Users className="w-3 h-3" />
              <span className="text-xs font-semibold">
                {(employee.totalBusinesses || 0) >= 1000 
                  ? `${((employee.totalBusinesses || 0) / 1000).toFixed(1)}K` 
                  : (employee.totalBusinesses || 0)}
              </span>
            </div>
            <p className="text-[10px] text-gray-500">Businesses</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-semibold">
                {(employee.totalHoursSaved || 0) >= 1000 
                  ? `${((employee.totalHoursSaved || 0) / 1000).toFixed(0)}K` 
                  : (employee.totalHoursSaved || 0)}
              </span>
            </div>
            <p className="text-[10px] text-gray-500">Hours Saved</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-semibold">{employee.successRate || 95}%</span>
            </div>
            <p className="text-[10px] text-gray-500">Success</p>
          </div>
        </div>

        {/* Cost Info - New Format (No Dollar Prices) */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cost:</span>
            <span className="font-semibold text-blue-700">
              {employee.monthlyWorkHours || 10} work hours/month
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Avg Saved:</span>
            <span className="font-semibold text-green-700">
              {employee.monthlyHoursSaved || 40} hours/month
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Rate:</span>
            <span className="font-semibold text-purple-700">
              ${employee.hourlyRate || 4.98}/hour
            </span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-4 justify-center">
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

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Tasks</p>
            <p className="font-semibold text-gray-900 text-sm">{employee.tasksCompleted.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Hours</p>
            <p className="font-semibold text-gray-900 text-sm">{employee.hoursUsed.toFixed(1)}h</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Efficiency</p>
            <p className="font-semibold text-green-600 text-sm">{employee.efficiency}%</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Interview Button */}
          <button
            onClick={onInterview}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Interview
          </button>
          
          {/* Start/Pause Button */}
          <button
            onClick={onToggleStatus}
            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              employee.status === 'working'
                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {employee.status === 'working' ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          
          {/* Settings Button */}
          <button className="p-2 text-gray-400 hover:text-[#1e3a5f] hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          
          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}