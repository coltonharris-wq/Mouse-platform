'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const DEPLOY_STEPS = [
  'Creating secure environment',
  'Installing KingMouse',
  'Configuring for your business',
  'Almost ready...',
];

function SuccessFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [currentStep, setCurrentStep] = useState(0);
  const [vmStatus, setVmStatus] = useState('pending');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Complete onboarding
  useEffect(() => {
    if (!sessionId) return;

    const onboardingData = typeof window !== 'undefined'
      ? JSON.parse(sessionStorage.getItem('onboarding_data') || '{}')
      : {};

    fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stripe_session_id: sessionId,
        business_name: onboardingData.business_name,
        owner_name: onboardingData.owner_name,
        email: onboardingData.email,
        location: onboardingData.location,
        pro_slug: onboardingData.pro_slug,
        plan_slug: onboardingData.plan_slug,
        onboarding_answers: onboardingData.onboarding_answers,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomerId(data.customer_id);
          setVmStatus(data.vm_status);
        } else {
          setError(data.error || 'Setup failed');
        }
      })
      .catch(() => setError('Connection error. Please refresh.'));
  }, [sessionId]);

  // Animate deploy steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < DEPLOY_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Poll VM status
  useEffect(() => {
    if (!customerId || vmStatus === 'running') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/billing/usage?customer_id=${customerId}`);
        if (res.ok) {
          // If we can reach billing, customer exists — check VM
          const customerRes = await fetch(`/api/admin/customers`);
          const data = await customerRes.json();
          const customer = (data.customers || []).find((c: { id: string }) => c.id === customerId);
          if (customer?.vm_status === 'running') {
            setVmStatus('running');
            clearInterval(interval);
            setTimeout(() => router.push('/dashboard'), 2000);
          }
        }
      } catch {
        // Ignore poll errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [customerId, vmStatus, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">&#9888;&#65039;</div>
          <h1 className="text-2xl font-bold text-white mb-4">Setup Error</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Sandbox animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-teal-500/20 rounded-2xl flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 bg-teal-500/40 rounded-xl flex items-center justify-center">
              <span className="text-4xl">🐭</span>
            </div>
          </div>
          <div className="absolute inset-0 w-32 h-32 mx-auto border-2 border-teal-500/30 rounded-3xl animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          For your security, we&apos;re putting King Mouse in a sandbox
        </h1>
        <p className="text-gray-400 mb-10">This takes about 2 minutes.</p>

        {/* Progress steps */}
        <div className="space-y-4 text-left">
          {DEPLOY_STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                i < currentStep
                  ? 'bg-teal-500 text-white'
                  : i === currentStep
                    ? 'bg-teal-500/50 text-white animate-pulse'
                    : 'bg-gray-700 text-gray-500'
              }`}>
                {i < currentStep ? '&#10003;' : i === currentStep ? '...' : ''}
              </div>
              <span className={`text-sm ${
                i <= currentStep ? 'text-white' : 'text-gray-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {vmStatus === 'running' && (
          <div className="mt-8 p-4 bg-teal-500/20 rounded-lg">
            <p className="text-teal-400 font-semibold">Your AI employee is ready! Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    }>
      <SuccessFlow />
    </Suspense>
  );
}
