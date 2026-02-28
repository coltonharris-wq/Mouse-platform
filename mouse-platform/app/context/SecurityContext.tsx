'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SecurityEvent {
  id: string;
  type: 'auth' | 'access' | 'threat' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  ip?: string;
  user?: string;
}

interface SecurityState {
  events: SecurityEvent[];
  isGuardrailsActive: boolean;
  lastScan: Date;
  threatsBlocked: number;
}

interface SecurityContextType extends SecurityState {
  logEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
  toggleGuardrails: () => void;
  runSecurityScan: () => Promise<void>;
  checkRateLimit: (action: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const RATE_LIMITS: Record<string, { max: number; window: number }> = {
  'api_call': { max: 100, window: 60000 }, // 100 per minute
  'login': { max: 5, window: 300000 }, // 5 per 5 minutes
  'deploy': { max: 10, window: 3600000 }, // 10 per hour
};

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SecurityState>({
    events: [
      { id: '1', type: 'system', severity: 'low', message: 'Security guardrails activated', timestamp: new Date(Date.now() - 3600000) },
      { id: '2', type: 'auth', severity: 'low', message: 'User login successful', timestamp: new Date(Date.now() - 1800000), user: 'admin@mouse.ai' },
      { id: '3', type: 'access', severity: 'medium', message: 'API key regenerated', timestamp: new Date(Date.now() - 900000), user: 'admin@mouse.ai' },
    ],
    isGuardrailsActive: true,
    lastScan: new Date(Date.now() - 3600000),
    threatsBlocked: 0,
  });

  const [rateLimitMap, setRateLimitMap] = useState<Record<string, number[]>>({});

  const logEvent = (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    const newEvent: SecurityEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events].slice(0, 100), // Keep last 100 events
    }));

    if (event.type === 'threat') {
      setState(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + 1,
      }));
    }
  };

  const toggleGuardrails = () => {
    setState(prev => ({
      ...prev,
      isGuardrailsActive: !prev.isGuardrailsActive,
    }));
    logEvent({
      type: 'system',
      severity: 'medium',
      message: `Guardrails ${state.isGuardrailsActive ? 'disabled' : 'enabled'}`,
    });
  };

  const runSecurityScan = async () => {
    logEvent({
      type: 'system',
      severity: 'low',
      message: 'Security scan initiated',
    });

    // Simulate scan
    await new Promise(resolve => setTimeout(resolve, 2000));

    setState(prev => ({
      ...prev,
      lastScan: new Date(),
    }));

    logEvent({
      type: 'system',
      severity: 'low',
      message: 'Security scan completed - no threats found',
    });
  };

  const checkRateLimit = (action: string): boolean => {
    const limit = RATE_LIMITS[action];
    if (!limit) return true;

    const now = Date.now();
    const windowStart = now - limit.window;
    
    const currentRequests = rateLimitMap[action] || [];
    const validRequests = currentRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= limit.max) {
      logEvent({
        type: 'threat',
        severity: 'medium',
        message: `Rate limit exceeded for ${action}`,
      });
      return false;
    }

    setRateLimitMap(prev => ({
      ...prev,
      [action]: [...validRequests, now],
    }));

    return true;
  };

  // Auto-run security scan every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      runSecurityScan();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SecurityContext.Provider value={{
      ...state,
      logEvent,
      toggleGuardrails,
      runSecurityScan,
      checkRateLimit,
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

export { RATE_LIMITS };
