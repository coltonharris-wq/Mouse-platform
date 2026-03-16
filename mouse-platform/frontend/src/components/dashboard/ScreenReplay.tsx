'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Gauge } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface Screenshot {
  id: string;
  screenshot_url: string;
  captured_at: string;
}

interface ScreenReplayProps {
  taskId: string;
  onClose: () => void;
}

const SPEED_OPTIONS = [1, 2, 4];

export default function ScreenReplay({ taskId, onClose }: ScreenReplayProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const customerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('customer_id') || 'demo'
    : 'demo';

  useEffect(() => {
    apiFetch(`/api/vm/replay/${taskId}?customer_id=${customerId}`)
      .then((r) => r.json())
      .then((data) => {
        setScreenshots(data.screenshots || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [taskId, customerId]);

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPlaying(false);
  }, []);

  const startPlayback = useCallback(() => {
    stopPlayback();
    setPlaying(true);
    // 2fps base → interval = 500ms / speed
    const ms = 500 / speed;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= screenshots.length - 1) {
          stopPlayback();
          return prev;
        }
        return prev + 1;
      });
    }, ms);
  }, [speed, screenshots.length, stopPlayback]);

  // Restart playback when speed changes during play
  useEffect(() => {
    if (playing) {
      startPlayback();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    if (playing) {
      stopPlayback();
    } else {
      if (currentIndex >= screenshots.length - 1) setCurrentIndex(0);
      startPlayback();
    }
  };

  const skipBack = () => {
    stopPlayback();
    setCurrentIndex((prev) => Math.max(0, prev - 10));
  };

  const skipForward = () => {
    stopPlayback();
    setCurrentIndex((prev) => Math.min(screenshots.length - 1, prev + 10));
  };

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    setSpeed(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopPlayback();
    setCurrentIndex(Number(e.target.value));
  };

  const currentShot = screenshots[currentIndex];
  const timestamp = currentShot
    ? new Date(currentShot.captured_at).toLocaleTimeString()
    : '';

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/60">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          {'\u{1F3AC}'} Screen Replay
        </h3>
        <button onClick={onClose} className="text-white/70 hover:text-white p-2">
          <X className="w-7 h-7" />
        </button>
      </div>

      {/* Viewer */}
      <div className="flex-1 flex items-center justify-center px-4 py-2 min-h-0">
        {loading ? (
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-white/70">Loading replay...</p>
          </div>
        ) : screenshots.length === 0 ? (
          <div className="text-center">
            <div className="text-6xl mb-4">{'\u{1F4F7}'}</div>
            <p className="text-xl text-white/70">No screenshots captured for this task yet</p>
            <p className="text-lg text-white/50 mt-2">Screenshots are captured while King Mouse works on tasks</p>
          </div>
        ) : (
          <div className="max-w-4xl w-full">
            <div className="relative bg-gray-900 rounded-xl border-4 border-gray-700 overflow-hidden aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentShot.screenshot_url}
                alt={`Screenshot ${currentIndex + 1}`}
                className="w-full h-full object-contain"
              />
              {/* Frame counter */}
              <div className="absolute top-3 right-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                {currentIndex + 1} / {screenshots.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {screenshots.length > 0 && (
        <div className="px-6 py-4 bg-black/60">
          {/* Timeline scrubber */}
          <div className="max-w-4xl mx-auto mb-3">
            <input
              type="range"
              min={0}
              max={screenshots.length - 1}
              value={currentIndex}
              onChange={handleScrub}
              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#0F6B6E]"
            />
            <div className="flex justify-between text-sm text-white/50 mt-1">
              <span>{timestamp}</span>
              <span>
                {screenshots.length > 0 ? new Date(screenshots[screenshots.length - 1].captured_at).toLocaleTimeString() : ''}
              </span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={skipBack} className="text-white/70 hover:text-white p-2">
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="w-14 h-14 bg-[#0F6B6E] rounded-full flex items-center justify-center text-white hover:bg-[#0d5c5f] transition-colors"
            >
              {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>
            <button onClick={skipForward} className="text-white/70 hover:text-white p-2">
              <SkipForward className="w-6 h-6" />
            </button>
            <button
              onClick={cycleSpeed}
              className="flex items-center gap-1 text-white/70 hover:text-white px-3 py-1.5 rounded-full border border-white/20"
            >
              <Gauge className="w-4 h-4" />
              <span className="text-base font-medium">{speed}x</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
