"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus,
  ClipboardList,
} from "lucide-react";

export default function TasksPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">Tasks</h1>
          <p className="text-sm text-mouse-slate mt-1">
            Track tasks assigned to your AI employees
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mouse-charcoal">0</p>
              <p className="text-xs text-mouse-slate">Total Tasks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mouse-charcoal">0</p>
              <p className="text-xs text-mouse-slate">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mouse-charcoal">0</p>
              <p className="text-xs text-mouse-slate">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mouse-charcoal">0</p>
              <p className="text-xs text-mouse-slate">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm">
        <div className="px-6 py-16 text-center">
          <ClipboardList className="w-12 h-12 text-mouse-slate/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-mouse-charcoal mb-2">No tasks yet</h3>
          <p className="text-sm text-mouse-slate max-w-md mx-auto">
            Tasks will appear here once your AI employees are deployed and working. 
            Hire an employee from the Marketplace to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
