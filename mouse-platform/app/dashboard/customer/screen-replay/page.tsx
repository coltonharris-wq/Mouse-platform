'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Download, 
  Trash2, 
  Search,
  Calendar,
  Clock,
  Monitor,
  User,
  Filter,
  MoreVertical,
  Video,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Replay {
  id: string;
  title: string;
  employeeName: string;
  employeeRole: string;
  date: string;
  duration: string;
  size: string;
  thumbnail: string;
  actions: number;
  status: 'completed' | 'recording' | 'failed';
}

const mockReplays: Replay[] = [
  {
    id: '1',
    title: 'Website Redesign Session',
    employeeName: 'Web Developer Knight',
    employeeRole: 'Web Development',
    date: '2026-02-28 14:30',
    duration: '45:23',
    size: '234 MB',
    thumbnail: '🎨',
    actions: 342,
    status: 'completed',
  },
  {
    id: '2',
    title: 'Customer Support - Ticket #4582',
    employeeName: 'Support Agent Alice',
    employeeRole: 'Customer Support',
    date: '2026-02-28 12:15',
    duration: '12:45',
    size: '67 MB',
    thumbnail: '🎧',
    actions: 89,
    status: 'completed',
  },
  {
    id: '3',
    title: 'Social Media Content Creation',
    employeeName: 'Social Media Maven',
    employeeRole: 'Social Media',
    date: '2026-02-28 10:00',
    duration: '1:23:45',
    size: '456 MB',
    thumbnail: '📱',
    actions: 567,
    status: 'recording',
  },
  {
    id: '4',
    title: 'Data Analysis - Q1 Report',
    employeeName: 'Data Analyst Bob',
    employeeRole: 'Data Analytics',
    date: '2026-02-27 16:45',
    duration: '32:18',
    size: '178 MB',
    thumbnail: '📊',
    actions: 234,
    status: 'completed',
  },
  {
    id: '5',
    title: 'Sales Outreach Campaign',
    employeeName: 'Sales Rep Sarah',
    employeeRole: 'Sales',
    date: '2026-02-27 09:30',
    duration: '58:42',
    size: '312 MB',
    thumbnail: '💼',
    actions: 445,
    status: 'completed',
  },
];

interface RecordingSession {
  timestamp: number;
  action: string;
  details: string;
  screenshot?: string;
}

const mockSessionData: RecordingSession[] = [
  { timestamp: 0, action: 'Session Started', details: 'Employee logged in to VM' },
  { timestamp: 5, action: 'Opened Browser', details: 'Chrome launched' },
  { timestamp: 12, action: 'Navigated to', details: 'Visited customer portal' },
  { timestamp: 25, action: 'Click', details: 'Clicked "New Project" button' },
  { timestamp: 35, action: 'Input', details: 'Entered project name "Q1 Campaign"' },
  { timestamp: 48, action: 'Scroll', details: 'Scrolled through template options' },
  { timestamp: 62, action: 'Click', details: 'Selected template "Modern Clean"' },
  { timestamp: 75, action: 'Drag', details: 'Dragged logo to header position' },
  { timestamp: 92, action: 'Type', details: 'Added hero section text' },
  { timestamp: 110, action: 'Click', details: 'Clicked preview button' },
  { timestamp: 125, action: 'Screenshot', details: 'Captured preview image' },
  { timestamp: 140, action: 'Click', details: 'Clicked publish button' },
  { timestamp: 155, action: 'Success', details: 'Project published successfully' },
  { timestamp: 160, action: 'Session Ended', details: 'Employee logged out' },
];

export default function ScreenReplayPage() {
  const [replays, setReplays] = useState<Replay[]>(mockReplays);
  const [selectedReplay, setSelectedReplay] = useState<Replay | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const progressRef = useRef<HTMLDivElement>(null);
  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = 160; // seconds

  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + playbackSpeed;
        });
      }, 1000);
    } else {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    }

    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.floor(clickPosition * totalDuration));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentAction = () => {
    return mockSessionData
      .slice()
      .reverse()
      .find((session) => session.timestamp <= currentTime);
  };

  const filteredReplays = replays.filter((replay) => {
    const matchesSearch = 
      replay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      replay.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || replay.employeeRole.toLowerCase().includes(filterRole.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const handleDelete = (id: string) => {
    setReplays(replays.filter((r) => r.id !== id));
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Screen Replay</h1>
            <p className="text-gray-600">Record and review AI employee sessions</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors">
              <Video className="w-4 h-4" />
              Start Recording
            </button>
          </div>
        </div>

        {selectedReplay ? (
          /* Replay Viewer */
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedReplay(null);
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              className="text-[#1e3a5f] hover:text-[#2d4a6f] flex items-center gap-2"
            >
              ← Back to Replays
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video Player */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video relative">
                  {/* Mock Screen Content */}
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-6xl mb-4">{selectedReplay.thumbnail}</div>
                      <p className="text-gray-400">Screen Recording Playback</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {selectedReplay.employeeName} - {selectedReplay.title}
                      </p>
                    </div>
                  </div>

                  {/* Current Action Overlay */}
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                    <p className="text-xs text-gray-400">Current Action</p>
                    <p className="font-medium">{getCurrentAction()?.action || 'Waiting...'}</p>
                  </div>

                  {/* Time Overlay */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                    {formatTime(currentTime)} / {selectedReplay.duration}
                  </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  {/* Progress Bar */}
                  <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer mb-4"
                  >
                    <div
                      className="h-full bg-[#1e3a5f] rounded-full transition-all"
                      style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <SkipBack className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f]"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 10))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>

                      <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-[#1e3a5f] mb-4">Action Timeline</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {mockSessionData.map((session, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        session.timestamp <= currentTime
                          ? 'bg-[#1e3a5f]/5 border-[#1e3a5f]/20'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{session.action}</span>
                        <span className="text-xs text-gray-500">{formatTime(session.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-600">{session.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Replay List */
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search replays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f]"
              >
                <option value="all">All Roles</option>
                <option value="web">Web Development</option>
                <option value="support">Customer Support</option>
                <option value="social">Social Media</option>
                <option value="data">Data Analytics</option>
                <option value="sales">Sales</option>
              </select>
            </div>

            {/* Replays Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReplays.map((replay) => (
                <div
                  key={replay.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                    <span className="text-5xl">{replay.thumbnail}</span>
                    {replay.status === 'recording' && (
                      <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Recording
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {replay.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{replay.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <User className="w-4 h-4" />
                      <span>{replay.employeeName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {replay.date.split(' ')[0]}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {replay.date.split(' ')[1]}
                      </div>
                      <div className="flex items-center gap-1">
                        <Monitor className="w-3 h-3" />
                        {replay.size}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {replay.actions} actions
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReplay(replay)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Play
                      </button>
                      <button
                        onClick={() => handleDelete(replay.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredReplays.length === 0 && (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No replays found</h3>
                <p className="text-gray-600">Start recording to capture AI employee sessions</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
