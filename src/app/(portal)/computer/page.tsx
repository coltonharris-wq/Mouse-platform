'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-browser';
import { Monitor, Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { VM } from '@/lib/types';

export default function ComputerPage() {
  const [vm, setVm] = useState<VM | null>(null);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function loadVM() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: vmData } = await supabase
          .from('vms')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (vmData) {
          setVm(vmData as VM);
        }

        // Check for active task
        const { data: activeTask } = await supabase
          .from('usage_events')
          .select('description, service')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (activeTask) {
          setCurrentTask(activeTask.description || activeTask.service);
        }
      } catch (err) {
        console.error('Failed to load VM:', err);
      } finally {
        setLoading(false);
      }
    }

    loadVM();
  }, []);

  const isOnline = vm?.status === 'running';
  const streamUrl = vm?.ip_address ? `http://${vm.ip_address}:${vm.port || 6080}/vnc.html?autoconnect=true` : null;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-mouse-text-secondary text-lg">Loading computer view...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Monitor size={24} className="text-mouse-primary" />
          <h1 className="text-2xl font-bold text-mouse-text">King Mouse&apos;s Computer</h1>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi size={18} className="text-mouse-primary" />
              <span className="text-mouse-primary font-medium">Online</span>
              <div className="w-2.5 h-2.5 rounded-full bg-mouse-primary animate-pulse-ring ml-1" />
            </>
          ) : (
            <>
              <WifiOff size={18} className="text-red-400" />
              <span className="text-red-400 font-medium">Offline</span>
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 ml-1" />
            </>
          )}
        </div>
      </div>

      {/* Current task */}
      {currentTask && (
        <div className="bg-mouse-card rounded-xl border border-mouse-border p-4 mb-6 flex items-center gap-3">
          <Loader2 size={18} className="text-mouse-accent animate-spin" />
          <div>
            <div className="text-sm text-mouse-text-secondary">Your AI is working on:</div>
            <div className="font-medium text-mouse-text">{currentTask}</div>
          </div>
        </div>
      )}

      {/* VM screen */}
      <div className="bg-mouse-card rounded-xl border border-mouse-border overflow-hidden">
        {isOnline && streamUrl ? (
          <iframe
            src={streamUrl}
            className="w-full border-0"
            style={{ height: '600px' }}
            title="King Mouse VM Screen"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Monitor size={36} className="text-mouse-text-secondary" />
            </div>
            {!vm ? (
              <>
                <h2 className="text-xl font-semibold text-mouse-text mb-2">
                  No computer set up yet
                </h2>
                <p className="text-mouse-text-secondary max-w-md">
                  King Mouse&apos;s computer will appear here once your account is fully set up.
                  This is where you can watch your AI employee work in real time.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-mouse-text mb-2">
                  Computer is offline
                </h2>
                <p className="text-mouse-text-secondary max-w-md">
                  King Mouse&apos;s computer is currently powered off.
                  It will start automatically when there is work to do.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
