"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, Clock, MousePointer2, Calendar, 
  User, Search, ChevronLeft, Download, Eye, 
  Video, RefreshCw, Monitor, Activity
} from "lucide-react";

interface ReplaySession {
  id: string;
  vmId: string;
  employeeId: string;
  employeeName: string;
  startedAt: string;
  status: 'recording' | 'completed';
  screenshotCount: number;
  actionCount: number;
  duration: string;
}

interface SessionDetails {
  vmId: string;
  employeeId: string;
  employeeName: string;
  screenshots: { timestamp: string; url: string }[];
  actions: { timestamp: string; type: string; description: string }[];
  startedAt: string;
  status: 'recording' | 'completed';
}

export default function ReplaysPage() {
  const [sessions, setSessions] = useState<ReplaySession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<ReplaySession | null>(null);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch sessions list
  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/screen-replay');
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions);
        setError(null);
      } else {
        setError(data.error || 'Failed to load sessions');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch session details
  const fetchSessionDetails = useCallback(async (session: ReplaySession) => {
    try {
      const response = await fetch(`/api/screen-replay?sessionId=${session.id}&vmId=${session.vmId}`);
      const data = await response.json();
      
      if (data.success) {
        setSessionDetails(data.session);
      }
    } catch (err) {
      console.error('Failed to fetch session details:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Auto-refresh for active sessions
  useEffect(() => {
    if (!autoRefresh || !selectedSession || selectedSession.status !== 'recording') return;
    
    const interval = setInterval(() => {
      fetchSessionDetails(selectedSession);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedSession, fetchSessionDetails]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying || !sessionDetails?.screenshots.length) return;
    
    const interval = setInterval(() => {
      setCurrentScreenshotIndex(prev => {
        if (prev >= sessionDetails.screenshots.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000); // 2 seconds per screenshot

    return () => clearInterval(interval);
  }, [isPlaying, sessionDetails]);

  const filteredSessions = sessions.filter(
    (s) =>
      s.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSessionSelect = async (session: ReplaySession) => {
    setSelectedSession(session);
    setCurrentScreenshotIndex(0);
    setIsPlaying(false);
    await fetchSessionDetails(session);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-mouse-teal animate-spin" />
        <span className="ml-3 text-mouse-slate">Loading screen replays...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-red-700 font-semibold mb-2">Error Loading Replays</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchSessions}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">Screen Replays</h1>
          <p className="text-sm text-mouse-slate mt-1">
            Watch your AI employees work in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
            <input
              type="text"
              placeholder="Search replays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal w-64"
            />
          </div>
          <button
            onClick={fetchSessions}
            className="p-2 bg-white border border-mouse-slate/20 rounded-lg hover:bg-mouse-offwhite transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-mouse-slate" />
          </button>
        </div>
      </div>

      {selectedSession && sessionDetails ? (
        /* Replay Player View */
        <div>
          <button
            onClick={() => {
              setSelectedSession(null);
              setSessionDetails(null);
              setIsPlaying(false);
            }}
            className="flex items-center gap-2 text-mouse-slate hover:text-mouse-charcoal mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to replays
          </button>

          {/* Live Session Banner */}
          {selectedSession.status === 'recording' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="text-green-800 font-semibold">Live Session</p>
                  <p className="text-green-600 text-sm">
                    Recording in progress • {selectedSession.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-green-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-green-300"
                  />
                  Auto-refresh
                </label>
              </div>
            </div>
          )}

          {/* Main Player */}
          <div className="bg-mouse-navy rounded-2xl overflow-hidden">
            {/* Screenshot Display */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {sessionDetails.screenshots.length > 0 ? (
                <img
                  src={sessionDetails.screenshots[currentScreenshotIndex]?.url}
                  alt={`Screenshot ${currentScreenshotIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-white/50">
                  <Monitor className="w-16 h-16 mx-auto mb-4" />
                  <p>No screenshots available yet</p>
                  <p className="text-sm mt-2">Screenshots are captured every 30 seconds</p>
                </div>
              )}

              {/* Overlay Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      disabled={sessionDetails.screenshots.length <= 1}
                      className="w-12 h-12 bg-mouse-teal rounded-full flex items-center justify-center hover:bg-mouse-teal/80 transition-colors disabled:opacity-50"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-1" />
                      )}
                    </button>
                    <div>
                      <p className="text-white font-medium">
                        {sessionDetails.screenshots.length > 0
                          ? `Screenshot ${currentScreenshotIndex + 1} of ${sessionDetails.screenshots.length}`
                          : 'Waiting for screenshots...'}
                      </p>
                      <p className="text-white/60 text-sm">
                        {sessionDetails.screenshots[currentScreenshotIndex] 
                          ? formatDate(sessionDetails.screenshots[currentScreenshotIndex].timestamp)
                          : 'No data'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {sessionDetails.screenshots.length > 0 && (
                      <a
                        href={sessionDetails.screenshots[currentScreenshotIndex]?.url}
                        download
                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {sessionDetails.screenshots.length > 1 && (
                  <div className="mt-4">
                    <input
                      type="range"
                      min={0}
                      max={sessionDetails.screenshots.length - 1}
                      value={currentScreenshotIndex}
                      onChange={(e) => {
                        setCurrentScreenshotIndex(parseInt(e.target.value));
                        setIsPlaying(false);
                      }}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Session Info */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-mouse-slate text-sm mb-1">Employee</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-mouse-teal/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-mouse-teal">
                        {sessionDetails.employeeName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-white font-medium">{sessionDetails.employeeName}</span>
                  </div>
                </div>
                <div>
                  <p className="text-mouse-slate text-sm mb-1">Screenshots</p>
                  <p className="text-white font-medium">{sessionDetails.screenshots.length}</p>
                </div>
                <div>
                  <p className="text-mouse-slate text-sm mb-1">Actions</p>
                  <p className="text-white font-medium">{sessionDetails.actions.length}</p>
                </div>
                <div>
                  <p className="text-mouse-slate text-sm mb-1">Duration</p>
                  <p className="text-white font-medium">{selectedSession.duration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          {sessionDetails.actions.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-mouse-slate/20 p-6">
              <h3 className="font-semibold text-mouse-navy mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-mouse-teal" />
                Activity Log
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sessionDetails.actions.slice(-20).reverse().map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-mouse-offwhite rounded-lg">
                    <MousePointer2 className="w-4 h-4 text-mouse-teal mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-mouse-charcoal">{action.description}</p>
                      <p className="text-xs text-mouse-slate mt-1">
                        {formatDate(action.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Sessions List View */
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-16">
              <Video className="w-12 h-12 text-mouse-slate mx-auto mb-4" />
              <h3 className="text-lg font-medium text-mouse-charcoal mb-2">No replays yet</h3>
              <p className="text-sm text-mouse-slate max-w-md mx-auto">
                Screen replays are automatically created when your AI employees are active. 
                Check back after deploying your first employee.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-mouse-slate/10">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionSelect(session)}
                  className="p-6 hover:bg-mouse-offwhite transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-mouse-navy rounded-lg flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-mouse-teal" />
                      </div>
                      <div>
                        <h3 className="font-medium text-mouse-charcoal">
                          {session.employeeName}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-mouse-slate">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(session.startedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {session.screenshotCount} screenshots
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {session.status === 'recording' && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Live
                        </span>
                      )}
                      <button className="p-2 hover:bg-white rounded-lg transition-colors">
                        <Play className="w-5 h-5 text-mouse-teal" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
