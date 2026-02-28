'use client';

import Sidebar from '../../components/layout/Sidebar';
import { Monitor, Play, Pause, Square, RefreshCw, Maximize, Camera } from 'lucide-react';

export default function VMViewerPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="customer" />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VM Viewer</h1>
              <p className="text-gray-600">Live view of your AI employee workspace</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Play className="w-4 h-4" />
                Start
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                <Pause className="w-4 h-4" />
                Pause
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <Square className="w-4 h-4" />
                Stop
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* VM Screen */}
          <div className="bg-gray-900 rounded-xl overflow-hidden mb-6">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="text-gray-400 text-sm">AI Employee VM - Desktop</div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Live</span>
              </div>
            </div>
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">VM Screenshot will appear here</p>
                <p className="text-gray-600 text-sm mt-2">Resolution: 1920x1080</p>
              </div>
            </div>
          </div>

          {/* VM Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">CPU Usage</div>
              <div className="text-2xl font-bold text-gray-900">12%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Memory</div>
              <div className="text-2xl font-bold text-gray-900">4.2 GB</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '52%' }} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Storage</div>
              <div className="text-2xl font-bold text-gray-900">23 GB</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '23%' }} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Uptime</div>
              <div className="text-2xl font-bold text-gray-900">14d 6h</div>
              <div className="text-sm text-green-600 mt-2">Running</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
