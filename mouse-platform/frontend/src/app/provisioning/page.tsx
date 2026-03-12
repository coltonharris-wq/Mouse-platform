'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const STEPS = [
  { label: 'Setting up your workspace...', key: 'workspace' },
  { label: 'Installing your AI operations manager...', key: 'installing' },
  { label: 'Configuring for your business...', key: 'configuring' },
  { label: 'Loading your dashboard...', key: 'dashboard' },
];

const TIPS = [
  'King Mouse can manage your emails, schedule, and inventory autonomously.',
  'Your AI operations manager works 24/7 — no breaks, no sick days.',
  'Every action King Mouse takes is logged for your review.',
  'You can connect your phone, email, and calendar for full automation.',
  'King Mouse learns your business patterns and gets smarter over time.',
];

export default function ProvisioningPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-[#0F6B6E] animate-spin" />
      </div>
    }>
      <ProvisioningContent />
    </Suspense>
  );
}

function ProvisioningContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<'provisioning' | 'running' | 'error'>('provisioning');
  const [tipIndex, setTipIndex] = useState(0);
  const [retried, setRetried] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const provisionStarted = useRef(false);

  const customerId = searchParams.get('customer_id') || (typeof window !== 'undefined' ? sessionStorage.getItem('customer_id') : null);

  // Rotate tips
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(tipTimer);
  }, []);

  // Animate steps forward during provisioning
  useEffect(() => {
    if (status !== 'provisioning') return;
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(stepTimer);
  }, [status]);

  const startProvisioning = useCallback(async () => {
    if (!customerId || provisionStarted.current) return;
    provisionStarted.current = true;

    try {
      // Fetch customer info for provisioning
      const infoRes = await fetch(`/api/vm/status?customer_id=${customerId}`);
      const infoData = await infoRes.json();

      // If already running, redirect immediately
      if (infoData.status === 'running') {
        setStatus('running');
        setCurrentStep(STEPS.length - 1);
        setTimeout(() => {
          window.location.href = '/dashboard?onboarding=true';
        }, 1500);
        return;
      }

      // If not already provisioning, kick it off
      if (infoData.status !== 'provisioning') {
        const industry = sessionStorage.getItem('signup_industry') || '';
        const niche = sessionStorage.getItem('signup_niche') || '';

        await fetch('/api/vm/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customerId,
            pro_slug: niche || 'general',
            business_name: sessionStorage.getItem('signup_business_name') || 'My Business',
            owner_name: '',
            industry,
            niche,
          }),
        });
      }

      // Start polling
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/vm/status?customer_id=${customerId}`);
          const data = await res.json();

          if (data.status === 'running') {
            setStatus('running');
            setCurrentStep(STEPS.length - 1);
            if (pollRef.current) clearInterval(pollRef.current);
            setTimeout(() => {
              window.location.href = '/dashboard?onboarding=true';
            }, 2000);
          } else if (data.status === 'error' || data.status === 'failed') {
            if (!retried) {
              // Auto-retry once
              setRetried(true);
              provisionStarted.current = false;
              startProvisioning();
            } else {
              setStatus('error');
              if (pollRef.current) clearInterval(pollRef.current);
            }
          }
        } catch {
          // Keep polling on network errors
        }
      }, 3000);
    } catch {
      setStatus('error');
    }
  }, [customerId, retried]);

  useEffect(() => {
    startProvisioning();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [startProvisioning]);

  if (!customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">{'\u{1F42D}'}</div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] mb-2">Session Not Found</h1>
          <p className="text-gray-500 mb-6">Please sign up first to provision your AI operations manager.</p>
          <a href="/" className="text-[#0F6B6E] font-semibold hover:underline">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="text-6xl mb-6">{'\u{1F42D}'}</div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] mb-2">
          {status === 'error' ? 'Setup Hit a Snag' : 'Setting Up Your AI Manager'}
        </h1>
        <p className="text-gray-500 mb-10">
          {status === 'error'
            ? "We're having trouble setting things up. Please try again."
            : 'About 60 seconds. Hang tight!'}
        </p>

        {/* Progress Steps */}
        {status !== 'error' && (
          <div className="space-y-4 mb-10 text-left max-w-sm mx-auto">
            {STEPS.map((step, i) => {
              const isDone = i < currentStep || status === 'running';
              const isActive = i === currentStep && status !== 'running';
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle className="w-6 h-6 text-[#0F6B6E]" />
                    ) : isActive ? (
                      <Loader2 className="w-6 h-6 text-[#0F6B6E] animate-spin" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <span className={`text-lg ${isDone ? 'text-[#0F6B6E] font-medium' : isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="mb-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <button
              onClick={() => {
                setStatus('provisioning');
                setCurrentStep(0);
                provisionStarted.current = false;
                setRetried(false);
                startProvisioning();
              }}
              className="bg-[#0F6B6E] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#0B5456] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Tip */}
        {status === 'provisioning' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 max-w-sm mx-auto">
            <p className="text-sm text-gray-500 font-medium mb-1">Did you know?</p>
            <p className="text-gray-700 transition-opacity duration-500">{TIPS[tipIndex]}</p>
          </div>
        )}

        {/* Success */}
        {status === 'running' && (
          <div className="text-[#0F6B6E] font-semibold text-lg">
            All set! Redirecting to your dashboard...
          </div>
        )}
      </div>
    </div>
  );
}
