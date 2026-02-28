"use client";

import { useState, useRef, useEffect } from "react";
import { screenReplays } from "@/lib/platform-data";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Download,
  Clock,
  MousePointer2,
  Keyboard,
  Calendar,
  User,
  Film,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
} from "lucide-react";

interface Replay {
  id: string;
  name: string;
  employeeId: string;
  employeeName: string;
  duration: string;
  timestamp: string;
  date: string;
  actions: number;
  status: string;
  thumbnail: string;
}

interface ReplayEvent {
  time: number;
  type: "click" | "type" | "scroll" | "navigate";
  description: string;
  target?: string;
}

// Mock replay events for demonstration
const generateMockEvents = (actionCount: number): ReplayEvent[] => {
  const events: ReplayEvent[] = [];
  const types: ("click" | "type" | "scroll" | "navigate")[] = ["click", "type", "scroll", "navigate"];
  const descriptions = [
    "Opened Salesforce CRM",
    "Clicked on Lead #2847",
    "Updated contact information",
    "Scrolled through email list",
    "Typed follow-up message",
    "Navigated to Dashboard",
    "Clicked Send button",
    "Opened new tab",
    "Scrolled down page",
    "Clicked Save changes",
    "Entered search query",
    "Selected dropdown option",
  ];

  for (let i = 0; i < Math.min(actionCount, 20); i++) {
    events.push({
      time: i * 30,
      type: types[Math.floor(Math.random() * types.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      target: i % 3 === 0 ? "input#email" : undefined,
    });
  }
  return events;
};

export default function ReplaysPage() {
  const [replays] = useState<Replay[]>(screenReplays);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReplay, setSelectedReplay] = useState<Replay | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const progressRef = useRef<HTMLDivElement>(null);

  const filteredReplays = replays.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const parseDuration = (duration: string): number => {
    const [mins, secs] = duration.split(":").map(Number);
    return mins * 60 + secs;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentReplayEvents = selectedReplay
    ? generateMockEvents(selectedReplay.actions)
    : [];

  const totalDuration = selectedReplay
    ? parseDuration(selectedReplay.duration)
    : 0;

  // Simulate playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedReplay) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + playbackSpeed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedReplay, playbackSpeed, totalDuration]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setCurrentTime(pos * totalDuration);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "click":
        return <MousePointer2 className="w-4 h-4" />;
      case "type":
        return <Keyboard className="w-4 h-4" />;
      case "scroll":
        return <ChevronLeft className="w-4 h-4 -rotate-90" />;
      case "navigate":
        return <Eye className="w-4 h-4" />;
      default:
        return <MousePointer2 className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">Screen Replays</h1>
          <p className="text-sm text-mouse-slate mt-1">
            Review AI employee sessions and actions
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
        </div>
      </div>

      {selectedReplay ? (
        /* Replay Player View */
        <div>
          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedReplay(null);
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            className="flex items-center gap-2 text-mouse-slate hover:text-mouse-charcoal mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to replays
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-mouse-navy rounded-xl overflow-hidden">
                {/* Screen Area */}
                <div className="aspect-video bg-gradient-to-br from-mouse-navy to-mouse-navy/80 relative flex items-center justify-center">
                  {/* Mock Screen Content */}
                  <div className="w-full h-full p-8 opacity-30">
                    <div className="bg-white/10 rounded-lg h-full p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-8 rounded bg-white/20" />
                        <div className="flex-1 h-4 bg-white/20 rounded" />
                      </div>
                      <div className="space-y-2">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="h-3 bg-white/10 rounded"
                            style={{ width: `${60 + Math.random() * 40}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cursor */}
                  {isPlaying && (
                    <div
                      className="absolute w-4 h-4 transition-all duration-300"
                      style={{
                        left: `${20 + (currentTime % 10) * 7}%`,
                        top: `${30 + ((currentTime * 2) % 5) * 8}%`,
                      }}
                    >
                      <MousePointer2 className="w-5 h-5 text-mouse-teal fill-mouse-teal" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  {!isPlaying && currentTime === 0 && (
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30"
                    >
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-10 h-10 text-white fill-white ml-1" />
                      </div>
                    </button>
                  )}

                  {/* Current Action Overlay */}
                  {isPlaying && currentTime > 0 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg">
                        {currentReplayEvents.find(
                          (e) =>
                            Math.abs(e.time - currentTime) < 2 &&
                            currentTime >= e.time
                        )?.description || "Waiting..."}
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="bg-mouse-navy border-t border-white/10 p-4">
                  {/* Progress Bar */}
                  <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="h-1 bg-white/20 rounded-full cursor-pointer mb-4 relative"
                  >
                    <div
                      className="absolute h-full bg-mouse-teal rounded-full transition-all"
                      style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        <SkipBack className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 bg-mouse-teal rounded-full flex items-center justify-center hover:bg-mouse-teal/90 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-white fill-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          setCurrentTime(Math.min(totalDuration, currentTime + 10))
                        }
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                      <span className="text-white/70 text-sm">
                        {formatTime(currentTime)} / {selectedReplay.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="bg-white/10 text-white text-sm rounded px-2 py-1 border-none focus:ring-0"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                      <button className="text-white/70 hover:text-white transition-colors">
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Replay Info */}
              <div className="bg-white rounded-xl border border-mouse-slate/20 p-5 mt-4">
                <h3 className="font-semibold text-mouse-charcoal mb-4">
                  Session Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-mouse-slate mb-1">Employee</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-mouse-teal/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-mouse-teal">
                          {selectedReplay.employeeName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-mouse-charcoal">
                        {selectedReplay.employeeName}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-mouse-slate mb-1">Duration</p>
                    <p className="text-sm font-medium text-mouse-charcoal">
                      {selectedReplay.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-mouse-slate mb-1">Actions</p>
                    <p className="text-sm font-medium text-mouse-charcoal">
                      {selectedReplay.actions}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-mouse-slate mb-1">Date</p>
                    <p className="text-sm font-medium text-mouse-charcoal">
                      {selectedReplay.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="bg-white rounded-xl border border-mouse-slate/20 p-5 max-h-[600px] overflow-y-auto">
              <h3 className="font-semibold text-mouse-charcoal mb-4">
                Action Timeline
              </h3>
              <div className="space-y-3">
                {currentReplayEvents.map((event, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      currentTime >= event.time
                        ? "bg-mouse-teal/5 border border-mouse-teal/20"
                        : "bg-mouse-offwhite"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        currentTime >= event.time
                          ? "bg-mouse-teal text-white"
                          : "bg-white text-mouse-slate"
                      }`}
                    >
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-mouse-charcoal">
                        {event.description}
                      </p>
                      <p className="text-xs text-mouse-slate">
                        {formatTime(event.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Replays List View */
        <div className="bg-white rounded-xl border border-mouse-slate/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-mouse-slate/20">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-mouse-charcoal">
                Recent Sessions
              </h2>
              <span className="text-sm text-mouse-slate">
                {filteredReplays.length} replays
              </span>
            </div>
          </div>

          <div className="divide-y divide-mouse-slate/10">
            {filteredReplays.map((replay) => (
              <div
                key={replay.id}
                className="p-4 hover:bg-mouse-offwhite transition-colors flex items-center gap-4"
              >
                {/* Thumbnail */}
                <div className="w-24 h-16 bg-mouse-navy/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Film className="w-6 h-6 text-mouse-slate" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-mouse-charcoal truncate">
                    {replay.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-mouse-slate">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {replay.employeeName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {replay.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer2 className="w-3 h-3" />
                      {replay.actions} actions
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {replay.date}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReplay(replay)}
                    className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white rounded-lg text-sm font-medium hover:bg-mouse-teal/90 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </button>
                  <button className="p-2 text-mouse-slate hover:text-mouse-charcoal transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredReplays.length === 0 && (
            <div className="text-center py-16">
              <Film className="w-12 h-12 text-mouse-slate mx-auto mb-4" />
              <h3 className="text-lg font-medium text-mouse-charcoal mb-2">
                No replays found
              </h3>
              <p className="text-sm text-mouse-slate">
                Try adjusting your search
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
