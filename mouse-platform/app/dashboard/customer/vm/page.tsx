'use client';

import { useState, useEffect } from 'react';
import { 
  Monitor, 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  Power,
  Settings,
  Terminal,
  Camera,
  Maximize2,
  Minimize2,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  MoreVertical
} from 'lucide-react';

interface VM {
  id: string;
  name: string;
  employeeName: string;
  status: 'running' | 'stopped' | 'paused' | 'error';
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  lastActivity: string;
}

const mockVMs: VM[] = [
  {
    id: 'vm-001',
    name: 'Web Developer Knight',
    employeeName: 'Web Developer Knight',
    status: 'running',
    uptime: '14d 6h 23m',
    cpuUsage: 12,
    memoryUsage: 45,
    diskUsage: 32,
    lastActivity: '2 min ago',
  },
  {
    id: 'vm-002',
    name: 'Support Agent Alice',
    employeeName: 'Support Agent Alice',
    status: 'running',
    uptime: '7d 2h 15m',
    cpuUsage: 8,
    memoryUsage: 38,
    diskUsage: 28,
    lastActivity: '5 min ago',
  },
  {
    id: 'vm-003',
    name: 'Data Analyst Bob',
    employeeName: 'Data Analyst Bob',
    status: 'paused',
    uptime: '-',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 45,
    lastActivity: '2 hours ago',
  },
];

export default function VMPage() {
  const [selectedVM, setSelectedVM] = useState<VM>(mockVMs[0]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Simulate live metrics updates
  useEffect(() => {
    if (!isStreaming) return;
    
    const interval = setInterval(() => {
      setSelectedVM(prev => ({
        ...prev,
        cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'stopped':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleVMAction = (action: 'start' | 'stop' | 'pause' | 'restart') => {
    // Simulate VM action
    console.log(`VM ${action} triggered for ${selectedVM.id}`);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">VM Viewer</h1>
            <p className="text-gray-600">Monitor and manage your AI employee virtual machines</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f]">
              <Power className="w-4 h-4" />
              Deploy New VM
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* VM List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1e3a5f]">Your VMs</h2>
            {mockVMs.map((vm) => (
              <button
                key={vm.id}
                onClick={() => setSelectedVM(vm)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedVM.id === vm.id
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{vm.name}</h3>
                    <p className="text-sm text-gray-500">{vm.employeeName}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(vm.status)}`} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {vm.status}
                  </span>
                  <span>•</span>
                  <span>Up {vm.uptime}</span>
                </div>
              </button>
            ))}
          </div>

          {/* VM Details & Stream */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Stream */}
            <div className={`bg-gray-900 rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
              {/* Stream Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="text-white text-sm font-medium">
                    {isStreaming ? 'LIVE' : 'OFFLINE'} - {selectedVM.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowControls(!showControls)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Stream Content */}
              <div className={`relative bg-gray-950 flex items-center justify-center ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'aspect-video'}`}>
                {isStreaming ? (
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🖥️</div>
                    <p className="text-gray-400">Live stream from {selectedVM.name}</p>
                    <p className="text-sm text-gray-500 mt-2">VM ID: {selectedVM.id}</p>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Stream not active</p>
                    <button
                      onClick={() => setIsStreaming(true)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] mx-auto"
                    >
                      <Play className="w-4 h-4" />
                      Start Stream
                    </button>
                  </div>
                )}

                {/* Stream Controls Overlay */}
                {isStreaming && showControls && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setIsStreaming(false)}
                      className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <Square className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleVMAction('pause')}
                      className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600"
                    >
                      <Pause className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleVMAction('restart')}
                      className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                      <Camera className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                      <Terminal className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* VM Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">CPU</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedVM.cpuUsage.toFixed(1)}%</p>
                <div className="h-1.5 bg-gray-200 rounded-full mt-2">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${selectedVM.cpuUsage}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Memory</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedVM.memoryUsage.toFixed(1)}%</p>
                <div className="h-1.5 bg-gray-200 rounded-full mt-2">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${selectedVM.memoryUsage}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Disk</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedVM.diskUsage}%</p>
                <div className="h-1.5 bg-gray-200 rounded-full mt-2">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${selectedVM.diskUsage}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-600">Network</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">12.5</p>
                <p className="text-xs text-gray-500">MB/s</p>
              </div>
            </div>

            {/* VM Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1e3a5f] mb-4">VM Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleVMAction('start')}
                  disabled={selectedVM.status === 'running'}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
                <button
                  onClick={() => handleVMAction('stop')}
                  disabled={selectedVM.status !== 'running'}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
                <button
                  onClick={() => handleVMAction('pause')}
                  disabled={selectedVM.status !== 'running'}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                <button
                  onClick={() => handleVMAction('restart')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f]"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
