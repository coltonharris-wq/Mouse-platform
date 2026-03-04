"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Maximize2, Download, X } from "lucide-react";

interface ReplaySession {
  id: string;
  employeeName: string;
  task: string;
  duration: string;
  timestamp: string;
  thumbnail?: string;
}

interface ScreenReplayViewerProps {
  session?: ReplaySession;
  onClose?: () => void;
}

const mockSessions: ReplaySession[] = [
  {
    id: "replay-001",
    employeeName: "Alex",
    task: "Salesforce lead follow-up",
    duration: "4:32",
    timestamp: "Today, 9:15 AM",
  },
  {
    id: "replay-002",
    employeeName: "Jordan",
    task: "QuickBooks invoice check",
    duration: "2:18",
    timestamp: "Today, 8:45 AM",
  },
  {
    id: "replay-003",
    employeeName: "Alex",
    task: "Email campaign setup",
    duration: "6:45",
    timestamp: "Yesterday, 4:30 PM",
  },
];

export function ScreenReplayList() {
  const [selectedSession, setSelectedSession] = useState<ReplaySession | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl border border-mouse-slate/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-mouse-slate/20 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-mouse-charcoal">Session Replays</h3>
            <p className="text-xs text-mouse-slate">Review AI employee actions</p>
          </div>
          <span className="text-xs text-mouse-slate bg-mouse-offwhite px-2 py-1 rounded">
            {mockSessions.length} sessions
          </span>
        </div>
        <div className="divide-y divide-mouse-slate/10">
          {mockSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-mouse-offwhite transition-colors text-left"
            >
              <div className="w-16 h-12 bg-mouse-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 text-mouse-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-mouse-charcoal text-sm truncate">{session.task}</p>
                <p className="text-xs text-mouse-slate">
                  {session.employeeName} • {session.timestamp}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-mouse-charcoal">{session.duration}</p>
                <p className="text-xs text-mouse-green">View replay</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedSession && (
        <ScreenReplayViewer
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}

export default function ScreenReplayViewer({ session, onClose }: ScreenReplayViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const durationSeconds = 272; // 4:32 in seconds

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          setProgress((newTime / durationSeconds) * 100);
          if (newTime >= durationSeconds) {
            setIsPlaying(false);
            return durationSeconds;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    setCurrentTime(Math.floor((newProgress / 100) * durationSeconds));
  };

  const handleRestart = () => {
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const mockLogEntries = [
    { time: 0, action: "Opened Salesforce CRM", type: "info" },
    { time: 12, action: "Logged in with credentials", type: "success" },
    { time: 28, action: "Navigated to Leads tab", type: "info" },
    { time: 45, action: "Filtered leads by status: 'New'", type: "info" },
    { time: 67, action: "Found 7 leads requiring follow-up", type: "success" },
    { time: 89, action: "Opened lead: Martinez Construction", type: "info" },
    { time: 124, action: "Drafted personalized email", type: "info" },
    { time: 156, action: "Email saved to drafts", type: "success" },
    { time: 178, action: "Sent follow-up SMS to contact", type: "success" },
    { time: 203, action: "Updated lead status to 'Contacted'", type: "success" },
    { time: 245, action: "Moved to next lead in queue", type: "info" },
  ];

  const visibleLogs = mockLogEntries.filter((log) => log.time <= currentTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div
        className={`bg-mouse-navy rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen ? "w-full h-full" : "w-full max-w-5xl max-h-[90vh]"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-mouse-teal/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-mouse-teal" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{session?.task}</h3>
              <p className="text-xs text-mouse-slate">
                {session?.employeeName} • {session?.timestamp}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-mouse-slate hover:text-white transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-mouse-slate hover:text-white transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-mouse-slate hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100%-140px)]">
          {/* Screen Viewport */}
          <div className="flex-1 bg-black relative overflow-hidden">
            {/* Mock Browser */}
            <div className="absolute inset-4 bg-white rounded-lg overflow-hidden flex flex-col">
              {/* Browser Chrome */}
              <div className="h-10 bg-mouse-slate/20 flex items-center px-4 gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-mouse-red" />
                  <div className="w-3 h-3 rounded-full bg-mouse-orange" />
                  <div className="w-3 h-3 rounded-full bg-mouse-green" />
                </div>
                <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-mouse-slate flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-mouse-green/20" />
                  salesforce.com/leads
                </div>
              </div>
              {/* Mock Content */}
              <div className="flex-1 p-6 bg-mouse-offwhite overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-bold text-mouse-charcoal">Leads</h1>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 bg-white rounded border text-xs">Filter</div>
                    <div className="px-3 py-1.5 bg-orange-500 text-white rounded text-xs">New Lead</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-mouse-slate/10 text-xs font-medium text-mouse-slate">
                    <span>Name</span>
                    <span>Company</span>
                    <span>Status</span>
                    <span>Last Activity</span>
                  </div>
                  {[
                    { name: "John Martinez", company: "Martinez Construction", status: "New", highlight: currentTime > 89 },
                    { name: "Sarah Chen", company: "Chen Design Studio", status: "Contacted" },
                    { name: "Mike Ross", company: "Ross Engineering", status: "Qualified" },
                    { name: "Emily Davis", company: "Davis Consulting", status: "New" },
                  ].map((lead, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-4 gap-4 px-4 py-3 border-t text-sm ${
                        lead.highlight ? "bg-mouse-teal/10" : ""
                      }`}
                    >
                      <span className="font-medium text-mouse-charcoal">{lead.name}</span>
                      <span className="text-mouse-slate">{lead.company}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${
                        lead.status === "New" ? "bg-blue-100 text-blue-700" :
                        lead.status === "Contacted" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>{lead.status}</span>
                      <span className="text-mouse-slate text-xs">2 days ago</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay during pause */}
            {!isPlaying && progress === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-20 h-20 bg-mouse-teal rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </button>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="w-80 bg-mouse-navy border-l border-white/10 flex flex-col">
            <div className="px-4 py-3 border-b border-white/10">
              <h4 className="font-medium text-white text-sm">Activity Log</h4>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {visibleLogs.map((log, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-mouse-slate text-xs font-mono w-10">
                    {formatTime(log.time)}
                  </span>
                  <div className={`flex-1 ${
                    log.type === "success" ? "text-mouse-green" : "text-mouse-slate"
                  }`}>
                    {log.action}
                  </div>
                </div>
              ))}
              {isPlaying && (
                <div className="flex gap-3 text-sm">
                  <span className="text-mouse-slate text-xs font-mono w-10">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 text-mouse-teal flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-mouse-teal rounded-full animate-pulse" />
                    Recording...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="h-16 bg-mouse-navy border-t border-white/10 px-6 flex items-center gap-4">
          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
            className="text-mouse-slate hover:text-white"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-mouse-teal rounded-full flex items-center justify-center hover:bg-mouse-teal/80"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          <button
            onClick={() => setCurrentTime(Math.min(durationSeconds, currentTime + 10))}
            className="text-mouse-slate hover:text-white"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={handleRestart}
            className="text-mouse-slate hover:text-white"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <span className="text-mouse-slate text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(durationSeconds)}
          </span>
          <div className="flex-1 mx-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-mouse-teal [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-mouse-slate">Speed:</span>
            <select className="bg-white/10 text-white text-xs rounded px-2 py-1 border border-white/20">
              <option>1x</option>
              <option>1.5x</option>
              <option>2x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
