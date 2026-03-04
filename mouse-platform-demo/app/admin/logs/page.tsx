"use client";

import { useState, useEffect } from "react";
import { FileText, AlertCircle, Terminal, Clock, Loader2, CheckCircle, XCircle } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  metadata?: any;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Real log pipeline will fetch from backend/log aggregator
    // For now, show "starting" state until pipeline is built
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mouse-navy">System Logs</h1>
        <span className="text-sm text-gray-400">Log collection starting...</span>
      </div>

      {/* Log Pipeline Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <Terminal className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-blue-900">Log Collection Pipeline</h2>
            <p className="text-sm text-blue-700 mt-1">
              Setting up centralized logging for backend requests, auth events, and system errors.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm text-blue-700">Backend API logs</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm text-blue-700">Authentication events</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm text-blue-700">Error tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 mb-6">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white"
          disabled
        >
          <option value="all">All Logs</option>
          <option value="error">Errors</option>
          <option value="warn">Warnings</option>
          <option value="info">Info</option>
        </select>
        <button 
          disabled
          className="px-4 py-2 text-sm bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
        >
          Download Logs
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No logs collected yet</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-4">
          Log collection is being set up. Once the pipeline is live, you'll see real-time 
          backend requests, authentication events, and system errors here.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          Expected: Within 24 hours
        </div>
      </div>
    </div>
  );
}
