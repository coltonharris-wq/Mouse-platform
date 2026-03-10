"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, Server, Cpu, Database } from "lucide-react";

function DeployingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');

  const [progress, setProgress] = useState(10);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const retriedRef = useRef(false);

  useEffect(() => {
    if (!customerId) {
      setError('Missing customer ID');
      return;
    }

    startProvisioning();
  }, [customerId]);

  async function callProvisionStart() {
    const res = await fetch('/api/provision/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });

    if (!res.ok) {
      // Fall back to marketplace hire if provision/start fails
      const fallback = await fetch('/api/marketplace/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, employeeType: 'king-mouse', isOnboarding: true }),
      });
      if (!fallback.ok) {
        const errData = await fallback.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to start provisioning');
      }
      return fallback.json();
    }

    return res.json();
  }

  async function startProvisioning() {
    try {
      // Step 1: Trigger VM provision (this now waits up to 45s for VM to boot)
      setStatus('Creating your dedicated server...');
      setProgress(20);

      const provisionData = await callProvisionStart();
      const computerId = provisionData.computerId || provisionData.vm?.computer_id || provisionData.vmId;

      if (!computerId) {
        throw new Error('No VM ID returned');
      }

      // Step 2: Poll for readiness
      setStatus('Installing Mouse...');
      setProgress(40);

      let attempts = 0;
      const maxAttempts = 120; // 10 minutes at 5s intervals
      let creatingCount = 0; // Track how many times we see "creating"

      const pollInterval = setInterval(async () => {
        attempts++;

        try {
          const statusRes = await fetch(`/api/provision/status?computer_id=${computerId}&customerId=${customerId}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'ready' || statusData.status === 'active') {
            clearInterval(pollInterval);
            setProgress(100);
            setStatus('King Mouse is ready!');
            setReady(true);

            // Redirect to dashboard after 2 seconds
            // Resellers go to /dashboard, customers go to /portal
            const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mouse_session') || '{}') : {};
            const dest = (session.role === 'reseller' || session.accountType === 'reseller') ? '/dashboard' : '/portal';
            setTimeout(() => {
              router.push(dest);
            }, 2000);
            return;
          } else if (statusData.status === 'error') {
            clearInterval(pollInterval);
            setError('Provisioning failed. Please contact support.');
            return;
          }

          // If still "creating" after 30s of polling, retry provision/start
          // provision/start is idempotent — it will find the existing VM
          // and retry kickOffProvision
          if (statusData.progress <= 30) {
            creatingCount++;
          } else {
            creatingCount = 0; // Reset if we see progress
          }

          if (creatingCount >= 6 && !retriedRef.current) {
            // 6 polls at 5s = 30s stuck in "creating"
            retriedRef.current = true;
            console.log('[deploying] Status stuck in creating — retrying provision/start');
            setStatus('Retrying server setup...');
            callProvisionStart().catch(e => {
              console.error('[deploying] Retry provision/start failed:', e);
            });
          }

          // Update progress
          const newProgress = Math.min(40 + Math.round((attempts / maxAttempts) * 50), 90);
          setProgress(newProgress);

          // Rotate status messages
          const messages = [
            'Installing Mouse...',
            'Configuring your AI workforce...',
            'Setting up your dedicated server...',
            'Downloading runtime packages...',
            'Almost there...',
          ];
          setStatus(messages[attempts % messages.length]);

          // Timeout after 10 minutes
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setError('Provisioning is taking longer than expected. Check your dashboard in a few minutes.');
          }
        } catch (e) {
          console.error('Poll error:', e);
        }
      }, 5000); // Poll every 5 seconds

    } catch (err: any) {
      console.error('Provisioning error:', err);
      setError(err.message || 'Failed to provision VM');
    }
  }

  const dashboardDest = (() => {
    try {
      const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mouse_session') || '{}') : {};
      return (session.role === 'reseller' || session.accountType === 'reseller') ? '/dashboard' : '/portal';
    } catch { return '/portal'; }
  })();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push(dashboardDest)}
            className="w-full bg-mouse-teal text-white font-semibold py-3 rounded-xl hover:bg-mouse-teal/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (ready) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">King Mouse is Ready!</h1>
          <p className="text-gray-400 mb-6">Your AI workforce is online and ready to work.</p>
          <button
            onClick={() => router.push(dashboardDest)}
            className="w-full bg-mouse-teal text-white font-semibold py-3 rounded-xl hover:bg-mouse-teal/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#1a1a2e] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-800">
            <Loader2 className="w-10 h-10 text-mouse-teal animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Setting up your King Mouse</h1>
          <p className="text-gray-400">This usually takes 3-5 minutes. Please don't leave this page.</p>
          <p className="text-gray-500 text-sm mt-1">May take longer depending on server availability.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-mouse-teal to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-mouse-teal mt-3 font-medium">{Math.round(progress)}%</p>
        </div>

        {/* Status Steps */}
        <div className="space-y-4">
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${progress >= 20 ? 'bg-mouse-teal/10 border-mouse-teal/30' : 'bg-[#1a1a2e] border-gray-800'}`}>
            <Server className={`w-6 h-6 ${progress >= 20 ? 'text-mouse-teal' : 'text-gray-600'}`} />
            <div>
              <p className={`font-medium ${progress >= 20 ? 'text-white' : 'text-gray-500'}`}>Provisioning VM</p>
              <p className="text-xs text-gray-500">Creating your dedicated server</p>
            </div>
          </div>

          <div className={`flex items-center gap-4 p-4 rounded-xl border ${progress >= 40 ? 'bg-mouse-teal/10 border-mouse-teal/30' : 'bg-[#1a1a2e] border-gray-800'}`}>
            <Cpu className={`w-6 h-6 ${progress >= 40 ? 'text-mouse-teal' : 'text-gray-600'}`} />
            <div>
              <p className={`font-medium ${progress >= 40 ? 'text-white' : 'text-gray-500'}`}>Installing Mouse</p>
              <p className="text-xs text-gray-500">Setting up your AI workforce</p>
            </div>
          </div>

          <div className={`flex items-center gap-4 p-4 rounded-xl border ${progress >= 80 ? 'bg-mouse-teal/10 border-mouse-teal/30' : 'bg-[#1a1a2e] border-gray-800'}`}>
            <Database className={`w-6 h-6 ${progress >= 80 ? 'text-mouse-teal' : 'text-gray-600'}`} />
            <div>
              <p className={`font-medium ${progress >= 80 ? 'text-white' : 'text-gray-500'}`}>Configuring King Mouse</p>
              <p className="text-xs text-gray-500">Personalizing your AI workforce</p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">{status}</p>
      </div>
    </div>
  );
}

export default function DeployingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-mouse-teal animate-spin" />
      </div>
    }>
      <DeployingContent />
    </Suspense>
  );
}
