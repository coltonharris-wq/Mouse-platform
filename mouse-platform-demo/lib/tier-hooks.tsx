// Tier System React Hook
// Provides easy access to tier status and usage in React components

'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { 
  TierName, 
  CustomerTierStatus, 
  UsageCheckResult,
  FEATURE_KEYS,
  TierFeature 
} from '@/lib/tier-system';

interface TierContextType {
  // Status
  tier: TierName | null;
  tierStatus: string | null;
  llmProvider: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Usage
  messageUsage: {
    used: number;
    remaining: number;
    unlimited: boolean;
  } | null;
  proUsage: {
    used: number;
    remaining: number;
    inGracePeriod: boolean;
    gracePeriodRemaining: number;
    unlimited: boolean;
  } | null;
  
  // Features
  features: string[];
  hasFeature: (featureKey: string) => boolean;
  
  // Actions
  refresh: () => Promise<void>;
  checkMessageAllowed: () => Promise<UsageCheckResult>;
  checkProFeature: (featureKey: string, estimatedCost?: number) => Promise<UsageCheckResult>;
  
  // Helpers
  isFree: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  canSendMessage: boolean;
  messagesRemaining: number;
  showUpgradePrompt: boolean;
  upgradePromptType: 'message_limit' | 'pro_limit' | 'payment_required' | null;
}

const TierContext = createContext<TierContextType | null>(null);

interface TierProviderProps {
  children: ReactNode;
  customerId: string;
}

export function TierProvider({ children, customerId }: TierProviderProps) {
  const [status, setStatus] = useState<CustomerTierStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<UsageCheckResult | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!customerId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/tier/check?customerId=${customerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tier status');
      }

      const data = await response.json();
      
      setStatus({
        customerId,
        tier: data.tier,
        tierStatus: data.tierStatus,
        llmProvider: data.llmProvider,
        messageUsage: data.usage.messages.used > 0 || data.usage.messages.remaining >= 0 ? {
          id: '',
          customerId,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          messageCount: data.usage.messages.used,
          freeLlmMessageCount: data.usage.messages.used,
          paidLlmMessageCount: 0,
          remainingFree: data.usage.messages.remaining,
        } : null,
        proUsage: data.usage.proFeatures ? {
          id: '',
          customerId,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          totalUsd: data.usage.proFeatures.used,
          callsUsd: 0,
          integrationsUsd: 0,
          advancedFeaturesUsd: 0,
        } : null,
        features: data.features.map((key: string) => ({
          id: '',
          tierName: data.tier,
          featureKey: key,
          featureName: key,
          isEnabled: true,
          limitValue: null,
        })),
        limits: {
          messagesRemaining: data.usage.messages.remaining,
          proUsageRemaining: data.usage.proFeatures.remaining,
          inGracePeriod: data.usage.proFeatures.inGracePeriod,
          gracePeriodRemaining: data.usage.proFeatures.gracePeriodRemaining,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const checkMessageAllowed = useCallback(async (): Promise<UsageCheckResult> => {
    if (!customerId) {
      return { allowed: false, upgradeRequired: false };
    }

    try {
      const response = await fetch('/api/tier/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, action: 'message' }),
      });

      if (!response.ok) {
        throw new Error('Failed to check message permission');
      }

      const data = await response.json();
      
      if (data.result.upgradePrompt) {
        setUpgradePrompt(data.result);
      }

      return data.result;
    } catch (err) {
      return { 
        allowed: false, 
        reason: err instanceof Error ? err.message : 'Check failed',
        upgradeRequired: false 
      };
    }
  }, [customerId]);

  const checkProFeature = useCallback(async (
    featureKey: string,
    estimatedCost?: number
  ): Promise<UsageCheckResult> => {
    if (!customerId) {
      return { allowed: false, upgradeRequired: false };
    }

    try {
      const response = await fetch('/api/tier/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId, 
          action: 'pro_feature',
          featureKey,
          estimatedCost 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check feature permission');
      }

      const data = await response.json();
      
      if (data.result.upgradePrompt) {
        setUpgradePrompt(data.result);
      }

      return data.result;
    } catch (err) {
      return { 
        allowed: false, 
        reason: err instanceof Error ? err.message : 'Check failed',
        upgradeRequired: false 
      };
    }
  }, [customerId]);

  const hasFeature = useCallback((featureKey: string): boolean => {
    return status?.features.some(f => f.featureKey === featureKey && f.isEnabled) ?? false;
  }, [status]);

  const contextValue: TierContextType = {
    tier: status?.tier || null,
    tierStatus: status?.tierStatus || null,
    llmProvider: status?.llmProvider || null,
    isLoading,
    error,
    
    messageUsage: status ? {
      used: status.messageUsage?.messageCount || 0,
      remaining: status.limits.messagesRemaining,
      unlimited: status.limits.messagesRemaining === -1,
    } : null,
    
    proUsage: status ? {
      used: status.proUsage?.totalUsd || 0,
      remaining: status.limits.proUsageRemaining,
      inGracePeriod: status.limits.inGracePeriod,
      gracePeriodRemaining: status.limits.gracePeriodRemaining,
      unlimited: status.limits.proUsageRemaining === -1,
    } : null,
    
    features: status?.features.map(f => f.featureKey) || [],
    hasFeature,
    
    refresh: fetchStatus,
    checkMessageAllowed,
    checkProFeature,
    
    isFree: status?.tier === 'free',
    isPro: status?.tier === 'pro',
    isEnterprise: status?.tier === 'enterprise',
    canSendMessage: status ? status.limits.messagesRemaining !== 0 : false,
    messagesRemaining: status?.limits.messagesRemaining || 0,
    showUpgradePrompt: !!upgradePrompt?.upgradePrompt,
    upgradePromptType: upgradePrompt?.upgradePrompt?.type || null,
  };

  return (
    <TierContext.Provider value={contextValue}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier(): TierContextType {
  const context = useContext(TierContext);
  if (!context) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}

// Hook for checking specific features
export function useFeature(featureKey: string): {
  enabled: boolean;
  check: () => Promise<UsageCheckResult>;
  isLoading: boolean;
} {
  const { hasFeature, checkProFeature, isLoading } = useTier();
  
  return {
    enabled: hasFeature(featureKey),
    check: () => checkProFeature(featureKey),
    isLoading,
  };
}

// Hook for message sending with tier checks
export function useTieredChat(customerId: string, employeeId?: string) {
  const { checkMessageAllowed, messageUsage, isFree } = useTier();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<UsageCheckResult | null>(null);

  const sendMessage = useCallback(async (
    messages: { role: string; content: string }[]
  ): Promise<{ success: boolean; response?: any; error?: string; upgradePrompt?: any }> => {
    setIsChecking(true);
    
    try {
      // Check if allowed
      const check = await checkMessageAllowed();
      setLastCheck(check);

      if (!check.allowed) {
        return {
          success: false,
          error: check.reason,
          upgradePrompt: check.upgradePrompt,
        };
      }

      // Send the message
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          employeeId,
          messages,
          temperature: 0.7,
          maxTokens: 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Chat failed',
          upgradePrompt: error.upgradePrompt,
        };
      }

      const data = await response.json();
      return { success: true, response: data.message };
    } finally {
      setIsChecking(false);
    }
  }, [customerId, employeeId, checkMessageAllowed]);

  return {
    sendMessage,
    isChecking,
    lastCheck,
    messagesRemaining: messageUsage?.remaining || 0,
    isApproachingLimit: isFree && (messageUsage?.remaining || 0) <= 10 && (messageUsage?.remaining || 0) > 0,
    isAtLimit: isFree && (messageUsage?.remaining || 0) <= 0,
  };
}

// Upgrade prompt component
interface UpgradePromptProps {
  type: 'message_limit' | 'pro_limit' | 'payment_required';
  onDismiss?: () => void;
  onUpgrade?: () => void;
}

export function UpgradePrompt({ type, onDismiss, onUpgrade }: UpgradePromptProps) {
  const prompts = {
    message_limit: {
      title: 'Message Limit Reached',
      message: 'You have used all your free messages this month. Upgrade to Pro for unlimited messages and premium features.',
      cta: 'Upgrade to Pro',
    },
    pro_limit: {
      title: 'Pro Feature Required',
      message: 'This feature is available with a Pro subscription. Upgrade now to unlock advanced features.',
      cta: 'Upgrade to Pro',
    },
    payment_required: {
      title: 'Payment Required',
      message: 'You have exceeded your free usage limit. Upgrade to Pro to continue using premium features.',
      cta: 'Upgrade to Pro',
    },
  };

  const prompt = prompts[type];

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-orange-800 mb-1">{prompt.title}</h4>
      <p className="text-orange-700 text-sm mb-3">{prompt.message}</p>
      <div className="flex gap-2">
        <button
          onClick={onUpgrade}
          className="bg-orange-600 text-white text-sm px-4 py-2 rounded hover:bg-orange-700 transition-colors"
        >
          {prompt.cta}
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-orange-700 text-sm px-4 py-2 hover:underline"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

// Usage indicator component
interface UsageIndicatorProps {
  className?: string;
}

export function UsageIndicator({ className = '' }: UsageIndicatorProps) {
  const { messageUsage, proUsage, isFree, isLoading } = useTier();

  if (isLoading) {
    return <div className={`text-sm text-gray-500 ${className}`}>Loading...</div>;
  }

  if (!isFree) {
    return (
      <div className={`text-sm text-green-600 ${className}`}>
        ✓ Pro Plan - Unlimited
      </div>
    );
  }

  const messagePercent = messageUsage?.unlimited 
    ? 0 
    : Math.min(100, ((messageUsage?.used || 0) / ((messageUsage?.used || 0) + (messageUsage?.remaining || 1))) * 100);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Messages */}
      <div>
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Messages</span>
          <span>
            {messageUsage?.used || 0} / {messageUsage?.unlimited ? '∞' : (messageUsage?.used || 0) + (messageUsage?.remaining || 0)}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              messagePercent >= 90 ? 'bg-red-500' : 
              messagePercent >= 70 ? 'bg-orange-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${messagePercent}%` }}
          />
        </div>
      </div>

      {/* Pro Usage */}
      {proUsage && !proUsage.unlimited && (
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Pro Usage</span>
            <span>
              ${(proUsage.used || 0).toFixed(2)} / $2.00
              {proUsage.inGracePeriod && (
                <span className="text-orange-600 ml-1">(Grace period)</span>
              )}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                proUsage.inGracePeriod ? 'bg-orange-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, ((proUsage.used || 0) / 2) * 100)}%` }}
            />
          </div>
          {proUsage.inGracePeriod && (
            <p className="text-xs text-orange-600 mt-1">
              ${proUsage.gracePeriodRemaining.toFixed(2)} remaining in grace period
            </p>
          )}
        </div>
      )}
    </div>
  );
}
