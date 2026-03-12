'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Monitor, Maximize, RotateCcw, MessageSquare } from 'lucide-react';
import Link from 'next/link';

type VMStatus = 'working' | 'idle' | 'offline';

export default function ComputerPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<VMStatus>('idle');
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const customerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('customer_id') || 'demo'
    : 'demo';

  const fetchScreenshot = useCallback(async () => {
    try {
      const res = await fetch(`/api/vm/screenshot?customer_id=${customerId}`);
      const data = await res.json();
      if (data.image) setImageUrl(data.image);
      if (data.status) setStatus(data.status as VMStatus);
      if (data.current_task !== undefined) setCurrentTask(data.current_task);
      if (data.last_active) setLastActive(data.last_active);
    } catch {
      // Keep last state on network error
    }
  }, [customerId]);

  useEffect(() => {
    fetchScreenshot();
    pollRef.current = setInterval(fetchScreenshot, 2500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchScreenshot]);

  const handleRestart = async () => {
    setRestarting(true);
    try {
      await fetch(`/api/vm/restart?customer_id=${customerId}`, { method: 'POST' });
      // Wait a moment then resume polling
      setTimeout(() => {
        setRestarting(false);
        fetchScreenshot();
      }, 5000);
    } catch {
      setRestarting(false);
    }
  };

  const handleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const statusConfig = {
    working: { label: 'Working', color: 'bg-green-500', emoji: '\u{1F7E2}' },
    idle: { label: 'Idle', color: 'bg-yellow-500', emoji: '\u{1F634}' },
    offline: { label: 'Offline', color: 'bg-red-500', emoji: '\u{1F534}' },
  };

  const sc = statusConfig[status];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold text-[#0B1F3B]">
            {'\u{1F42D}'} King Mouse&apos;s Computer
          </h1>
          <span className="flex items-center gap-2 text-lg font-medium px-3 py-1 rounded-full bg-gray-100">
            <span className={`w-3 h-3 rounded-full ${sc.color}`} />
            {sc.label}
          </span>
        </div>
      </div>

      {/* Live Viewer */}
      <div ref={viewerRef} className={`mx-auto ${isFullscreen ? 'max-w-none' : 'max-w-5xl'}`}>
        {/* Monitor Frame */}
        <div className="bg-gray-900 rounded-2xl p-3 shadow-2xl">
          {/* Screen */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="King Mouse's desktop"
                className="w-full h-full object-contain"
              />
            ) : status === 'offline' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">{'\u{1F534}'}</div>
                  <p className="text-2xl text-gray-400 font-semibold">King Mouse is offline</p>
                  <button
                    onClick={handleRestart}
                    disabled={restarting}
                    className="mt-4 bg-[#0F6B6E] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#0B5456] transition-colors disabled:opacity-50"
                  >
                    {restarting ? 'Restarting...' : 'Start King Mouse'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">{'\u{1F634}'}</div>
                  <p className="text-2xl text-gray-400 font-semibold">
                    King Mouse is idle — waiting for your next task
                  </p>
                </div>
              </div>
            )}

            {/* Idle overlay on last screenshot */}
            {imageUrl && status === 'idle' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <p className="text-xl text-white font-semibold bg-black/60 px-6 py-3 rounded-xl">
                  {'\u{1F634}'} Idle — waiting for your next task
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Monitor Stand */}
        <div className="flex justify-center">
          <div className="w-24 h-4 bg-gray-300 rounded-b-lg" />
        </div>

        {/* Activity Indicator */}
        <div className="mt-6 text-center">
          {currentTask ? (
            <p className="text-xl text-gray-700">
              <span className="font-semibold">Currently working on:</span> {currentTask}
            </p>
          ) : lastActive ? (
            <p className="text-lg text-gray-500">
              Idle since {new Date(lastActive).toLocaleTimeString()}
            </p>
          ) : null}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-[#0F6B6E] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#0B5456] transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Send a Task
          </Link>
          <button
            onClick={handleRestart}
            disabled={restarting}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-5 h-5 ${restarting ? 'animate-spin' : ''}`} />
            {restarting ? 'Restarting...' : 'Restart'}
          </button>
          <button
            onClick={handleFullscreen}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            <Maximize className="w-5 h-5" />
            {isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}
          </button>
        </div>
      </div>
    </div>
  );
}
