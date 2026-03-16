'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

const STATUS_MESSAGES = [
  'Setting up your workspace...',
  'Researching your business...',
  'Training your AI on {niche}...',
  'Configuring your tools...',
  'Almost ready...',
];

export default function ProvisioningPage() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [niche, setNiche] = useState('your industry');
  const [error, setError] = useState('');
  const hasStartedProvision = useRef(false);
  const accessTokenRef = useRef<string | null>(null);
  const vmIdRef = useRef<string | null>(null);

  // Kick off provisioning on mount
  useEffect(() => {
    if (hasStartedProvision.current) return;
    hasStartedProvision.current = true;

    async function startProvisioning() {
      try {
        const { createBrowserClient } = await import('@/lib/supabase-browser');
        const supabase = createBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken) {
          setError('Not authenticated. Please log in and try again.');
          return;
        }

        accessTokenRef.current = accessToken;

        // Get niche + website URL
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.niche) {
          setNiche(user.user_metadata.niche);
        }

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('website_url, niche')
            .eq('id', user.id)
            .single();

          if (profile?.niche) setNiche(profile.niche);

          // Fire-and-forget: deep research crawl runs in parallel
          if (profile?.website_url) {
            fetch('/api/research/crawl', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ url: profile.website_url }),
            }).catch(() => {});
          }
        }

        // Start VM provisioning — AWAIT the response to get vm_id
        const provisionRes = await fetch('/api/vm/provision', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!provisionRes.ok) {
          const text = await provisionRes.text();
          let errorMsg = `Provisioning failed (${provisionRes.status})`;
          try { errorMsg = JSON.parse(text).error || errorMsg; } catch {}
          setError(errorMsg + '. Please try again or call (910) 515-8927.');
          return;
        }

        const provisionData = await provisionRes.json();

        if (provisionData.success && provisionData.data?.vm_id) {
          vmIdRef.current = provisionData.data.vm_id;
          // If already ready, redirect immediately
          if (provisionData.data.status === 'ready') {
            window.location.href = '/dashboard';
            return;
          }
          // Max wait: redirect after 60s even if VM isn't ready yet
          // (VM will continue installing in background, chat falls back to Kimi/Anthropic)
          setTimeout(() => { window.location.href = '/dashboard'; }, 60000);
        } else {
          console.error('Provision failed:', provisionData);
          setError(provisionData.error || 'Failed to start provisioning. Please try again.');
        }
      } catch (err) {
        console.error('Provisioning error:', err);
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(`Something went wrong (${msg}). Please try again or call (910) 515-8927.`);
      }
    }

    startProvisioning();
  }, []);

  // Poll for VM readiness
  const checkStatus = useCallback(async () => {
    const token = accessTokenRef.current;
    const vmId = vmIdRef.current;
    if (!token || !vmId) return;

    try {
      const res = await fetch(`/api/vm/status?vm_id=${vmId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.data?.status === 'ready') {
        window.location.href = '/dashboard';
      }
    } catch {
      // Keep polling on error
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Cycle through status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentMessage = STATUS_MESSAGES[messageIndex].replace(
    '{niche}',
    niche
  );

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px 0',
      }}
    >
      {/* Pulsing mouse logo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: '#F07020',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'provisionPulse 2s ease-in-out infinite',
          }}
        >
          <span
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            M
          </span>
        </div>
      </div>

      <h1
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: 12,
        }}
      >
        Building your AI employee
      </h1>

      {error ? (
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <p style={{ fontSize: 15, color: '#b91c1c', marginBottom: 20 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 600,
              backgroundColor: '#F07020',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              marginBottom: 24,
            }}
          >
            Try again
          </button>
          <div style={{ borderTop: '1px solid #e8e8e4', paddingTop: 20 }}>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
              Still not working? Reach out and we&apos;ll get you set up personally.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <a href="tel:9105158927" style={{ fontSize: 14, fontWeight: 600, color: '#F07020', textDecoration: 'none' }}>
                (910) 515-8927
              </a>
              <a href="mailto:mouse@automioapp.com" style={{ fontSize: 14, fontWeight: 600, color: '#F07020', textDecoration: 'none' }}>
                mouse@automioapp.com
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p
            style={{
              fontSize: 16,
              color: '#666',
              marginBottom: 8,
              minHeight: 24,
              transition: 'opacity 0.3s',
            }}
          >
            {currentMessage}
          </p>

          {/* Progress dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              marginTop: 32,
            }}
          >
            {STATUS_MESSAGES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: i === messageIndex ? '#F07020' : '#e8e8e4',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>

          <p
            style={{
              fontSize: 13,
              color: '#aaa',
              marginTop: 32,
            }}
          >
            This usually takes about a minute
          </p>
        </>
      )}

      {/* Inline keyframes for the pulse animation */}
      <style>{`
        @keyframes provisionPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(240, 112, 32, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(240, 112, 32, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(240, 112, 32, 0); }
        }
      `}</style>
    </div>
  );
}
