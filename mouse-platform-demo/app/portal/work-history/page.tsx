"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play, Pause, Clock, Monitor, Calendar,
  User, Search, ChevronLeft, ChevronRight, Eye,
  RefreshCw, Activity, Image as ImageIcon, Loader2
} from "lucide-react";

interface WorkSession {
  id: string;
  employee_id: string;
  employee_vm_id: string;
  customer_id: string;
  task_description: string;
  status: "active" | "completed" | "error";
  started_at: string;
  ended_at: string | null;
  work_hours_charged: number;
}

interface SessionDetail extends WorkSession {
  screenshots: { timestamp: string; image: string }[];
}

export default function WorkHistoryPage() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingScreenshot, setViewingScreenshot] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      // TODO: get customerId from auth context
      const res = await fetch("/api/vm/sessions?limit=50");
      const data = await res.json();
      if (data.success) setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const loadSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/vm/sessions?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedSession(data.session);
        setViewingScreenshot(0);
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  // Auto-play screenshots
  useEffect(() => {
    if (!isPlaying || !selectedSession?.screenshots?.length) return;
    const interval = setInterval(() => {
      setViewingScreenshot((prev) => {
        const next = prev + 1;
        if (next >= (selectedSession.screenshots?.length || 0)) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, selectedSession]);

  const filteredSessions = sessions.filter(
    (s) =>
      s.task_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (start: string, end: string | null) => {
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    const mins = Math.floor((e.getTime() - s.getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  // ── Session Detail View ──
  if (selectedSession) {
    const screenshots = selectedSession.screenshots || [];
    const currentScreenshot = screenshots[viewingScreenshot];

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Work History
        </button>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedSession.task_description}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(selectedSession.started_at).toLocaleString()} •{" "}
                {formatDuration(selectedSession.started_at, selectedSession.ended_at)}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                selectedSession.status === "active"
                  ? "bg-green-50 text-green-700"
                  : selectedSession.status === "completed"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {selectedSession.status}
            </span>
          </div>

          {/* Screenshot Viewer */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            {currentScreenshot ? (
              <img
                src={currentScreenshot.image}
                alt={`Screenshot ${viewingScreenshot + 1}`}
                className="w-full h-auto"
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <Monitor className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>No screenshots captured yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Playback Controls */}
          {screenshots.length > 0 && (
            <div className="flex items-center gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-white shadow hover:bg-gray-100"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setViewingScreenshot(Math.max(0, viewingScreenshot - 1))}
                disabled={viewingScreenshot === 0}
                className="p-2 rounded-full bg-white shadow hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[80px] text-center">
                {viewingScreenshot + 1} / {screenshots.length}
              </span>
              <button
                onClick={() =>
                  setViewingScreenshot(Math.min(screenshots.length - 1, viewingScreenshot + 1))
                }
                disabled={viewingScreenshot >= screenshots.length - 1}
                className="p-2 rounded-full bg-white shadow hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {currentScreenshot && (
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(currentScreenshot.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Session List View ──
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work History</h1>
            <p className="text-gray-500 text-sm">
              Watch your AI employees work in real-time or replay past sessions
            </p>
          </div>
          <button
            onClick={fetchSessions}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border hover:bg-gray-50 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by task or employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold text-gray-700 mb-1">No work sessions yet</h3>
            <p className="text-gray-400 text-sm">
              Hire an AI employee and they&apos;ll start working in a virtual machine
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => loadSession(session.id)}
                className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        session.status === "active"
                          ? "bg-green-50"
                          : "bg-blue-50"
                      }`}
                    >
                      {session.status === "active" ? (
                        <Activity className="w-5 h-5 text-green-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {session.task_description}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {new Date(session.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(session.started_at, session.ended_at)}
                    </div>
                    {session.work_hours_charged > 0 && (
                      <span className="text-xs text-gray-400">
                        {session.work_hours_charged.toFixed(2)} hrs
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        session.status === "active"
                          ? "bg-green-50 text-green-700"
                          : session.status === "completed"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {session.status === "active" ? "LIVE" : session.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
