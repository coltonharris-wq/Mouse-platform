// Tier System Configuration and Management
// Handles free tier, pro features, and usage tracking

export type TierName = 'free' | 'pro' | 'enterprise';
export type LLMProvider = 'ollama' | 'moonshot' | 'anthropic' | 'openai';

export interface TierConfig {
  id: string;
  tierName: TierName;
  displayName: string;
  llmProvider: LLMProvider;
  llmModel: string;
  maxMessagesPerMonth: number; // -1 for unlimited
  maxProUsageUsd: number; // -1 for unlimited
  proUsageGracePeriodUsd: number;
  features: string[];
  isActive: boolean;
}

export interface TierFeature {
  id: string;
  tierName: TierName;
  featureKey: string;
  featureName: string;
  isEnabled: boolean;
  limitValue: number | null;
}

export interface MessageUsage {
  id: string;
  customerId: string;
  year: number;
  month: number;
  messageCount: number;
  freeLlmMessageCount: number;
  paidLlmMessageCount: number;
  remainingFree: number;
}

export interface ProUsage {
  id: string;
  customerId: string;
  year: number;
  month: number;
  totalUsd: number;
  callsUsd: number;
  integrationsUsd: number;
  advancedFeaturesUsd: number;
}

export interface TierUsageLog {
  id: string;
  customerId: string;
  employeeId: string | null;
  usageType: 'message' | 'call' | 'integration' | 'api' | 'advanced_feature';
  tierAtTime: TierName;
  llmProviderUsed: string;
  costUsd: number;
  isPaidFeature: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface CustomerTierStatus {
  customerId: string;
  tier: TierName;
  tierStatus: 'active' | 'grace_period' | 'downgraded_auto' | 'suspended';
  llmProvider: LLMProvider;
  messageUsage: MessageUsage | null;
  proUsage: ProUsage | null;
  features: TierFeature[];
  limits: {
    messagesRemaining: number;
    proUsageRemaining: number;
    inGracePeriod: boolean;
    gracePeriodRemaining: number;
  };
}

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired: boolean;
  upgradePrompt?: {
    type: 'message_limit' | 'pro_limit' | 'payment_required';
    title: string;
    message: string;
    cta: string;
  };
}

// Feature keys for checking permissions
export const FEATURE_KEYS = {
  // LLM Features
  OLLAMA_LLM: 'ollama_llm',
  MOONSHOT_LLM: 'moonshot_llm',
  BASIC_CHAT: 'basic_chat',
  ADVANCED_CHAT: 'advanced_chat',
  UNLIMITED_MESSAGES: 'unlimited_messages',
  
  // Employee Features
  ONE_EMPLOYEE: 'one_employee',
  MULTIPLE_EMPLOYEES: 'multiple_employees',
  UNLIMITED_EMPLOYEES: 'unlimited_employees',
  
  // Communication Features
  CALLS: 'calls',
  TEXT_RESPONSES: 'text_responses',
  
  // Integration Features
  ADVANCED_INTEGRATIONS: 'advanced_integrations',
  ALL_INTEGRATIONS: 'all_integrations',
  CUSTOM_WORKFLOWS: 'custom_workflows',
  
  // API Features
  API_ACCESS: 'api_access',
  FULL_API_ACCESS: 'full_api_access',
  
  // Support Features
  EMAIL_SUPPORT: 'email_support',
  PRIORITY_SUPPORT: 'priority_support',
  WHITE_GLOVE_SUPPORT: 'white_glove_support',
  
  // Enterprise Features
  SLA: 'sla',
  CUSTOM_MODELS: 'custom_models',
  WHITE_LABEL: 'white_label',
} as const;

// Default tier configurations (fallback if DB not available)
export const DEFAULT_TIER_CONFIGS: Record<TierName, TierConfig> = {
  free: {
    id: 'free-tier-default',
    tierName: 'free',
    displayName: 'Free',
    llmProvider: 'ollama',
    llmModel: 'qwen2.5:0.5b',
    maxMessagesPerMonth: 50,
    maxProUsageUsd: 2.00,
    proUsageGracePeriodUsd: 3.00,
    features: ['basic_chat', 'text_responses', 'email_support', 'one_employee'],
    isActive: true,
  },
  pro: {
    id: 'pro-tier-default',
    tierName: 'pro',
    displayName: 'Pro',
    llmProvider: 'moonshot',
    llmModel: 'kimi-k2.5',
    maxMessagesPerMonth: -1, // unlimited
    maxProUsageUsd: -1, // unlimited
    proUsageGracePeriodUsd: 0,
    features: ['unlimited_messages', 'advanced_integrations', 'api_access', 'priority_support', 'calls', 'custom_workflows', 'multiple_employees'],
    isActive: true,
  },
  enterprise: {
    id: 'enterprise-tier-default',
    tierName: 'enterprise',
    displayName: 'Enterprise',
    llmProvider: 'moonshot',
    llmModel: 'kimi-k2.5',
    maxMessagesPerMonth: -1, // unlimited
    maxProUsageUsd: -1, // unlimited
    proUsageGracePeriodUsd: 0,
    features: ['unlimited_messages', 'all_integrations', 'full_api_access', 'dedicated_support', 'sla', 'custom_models', 'white_label', 'unlimited_employees'],
    isActive: true,
  },
};

// Pricing for pro features (in USD)
export const PRO_FEATURE_PRICING = {
  call_per_minute: 0.05,
  advanced_integration: 0.10,
  api_call: 0.001,
  custom_workflow: 0.50,
  priority_compute: 0.20,
} as const;

// Tier Manager Class
export class TierManager {
  private supabaseUrl: string;
  private supabaseKey: string;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private cacheTTL = 60000; // 1 minute cache

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
  }

  // Get tier configuration
  async getTierConfig(tierName: TierName): Promise<TierConfig> {
    const cacheKey = `tier_config_${tierName}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/tier_config?tier_name=eq.${tierName}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: this.supabaseKey,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch tier config');

      const records = await response.json();
      if (records.length > 0) {
        const config = this.mapTierConfig(records[0]);
        this.setCache(cacheKey, config);
        return config;
      }
    } catch (error) {
      console.warn('Using default tier config for:', tierName);
    }

    return DEFAULT_TIER_CONFIGS[tierName];
  }

  // Get all tier configurations
  async getAllTierConfigs(): Promise<TierConfig[]> {
    const cacheKey = 'tier_configs_all';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/tier_config?is_active=eq.true&order=display_order`,
        {
          headers: {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: this.supabaseKey,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch tier configs');

      const records = await response.json();
      const configs = records.map(this.mapTierConfig);
      this.setCache(cacheKey, configs);
      return configs;
    } catch (error) {
      return Object.values(DEFAULT_TIER_CONFIGS);
    }
  }

  // Get customer tier status
  async getCustomerTierStatus(customerId: string): Promise<CustomerTierStatus | null> {
    try {
      // Get customer info
      const customerResponse = await fetch(
        `${this.supabaseUrl}/rest/v1/customers?id=eq.${customerId}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: this.supabaseKey,
          },
        }
      );

      if (!customerResponse.ok) return null;
      const customers = await customerResponse.json();
      if (customers.length === 0) return null;

      const customer = customers[0];
      const tier = (customer.tier || 'free') as TierName;

      // Get tier config
      const tierConfig = await this.getTierConfig(tier);

      // Get features for tier
      const features = await this.getTierFeatures(tier);

      // Get message usage
      const messageUsage = await this.getMessageUsage(customerId);

      // Get pro usage
      const proUsage = await this.getProUsage(customerId);

      // Calculate limits
      const messagesRemaining = tierConfig.maxMessagesPerMonth === -1 
        ? -1 
        : Math.max(0, tierConfig.maxMessagesPerMonth - (messageUsage?.messageCount || 0));

      const proUsageTotal = proUsage?.totalUsd || 0;
      const inGracePeriod = tier === 'free' && 
        proUsageTotal >= tierConfig.maxProUsageUsd && 
        proUsageTotal < (tierConfig.maxProUsageUsd + tierConfig.proUsageGracePeriodUsd);

      const proUsageRemaining = tierConfig.maxProUsageUsd === -1
        ? -1
        : Math.max(0, tierConfig.maxProUsageUsd - proUsageTotal);

      const gracePeriodRemaining = inGracePeriod
        ? (tierConfig.maxProUsageUsd + tierConfig.proUsageGracePeriodUsd) - proUsageTotal
        : 0;

      return {
        customerId,
        tier,
        tierStatus: customer.tier_status || 'active',
        llmProvider: customer.llm_provider || tierConfig.llmProvider,
        messageUsage,
        proUsage,
        features,
        limits: {
          messagesRemaining,
          proUsageRemaining,
          inGracePeriod,
          gracePeriodRemaining,
        },
      };
    } catch (error) {
      console.error('Error getting customer tier status:', error);
      return null;
    }
  }

  // Check if customer can send a message
  async checkMessageAllowed(customerId: string): Promise<UsageCheckResult> {
    const status = await this.getCustomerTierStatus(customerId);
    if (!status) {
      return {
        allowed: false,
        reason: 'Customer not found',
        upgradeRequired: false,
      };
    }

    // Pro/Enterprise users have unlimited messages
    if (status.tier !== 'free') {
      return { allowed: true, upgradeRequired: false };
    }

    const tierConfig = await this.getTierConfig('free');
    const messageCount = status.messageUsage?.messageCount || 0;

    // Check if exceeded message limit
    if (messageCount >= tierConfig.maxMessagesPerMonth) {
      return {
        allowed: false,
        reason: 'Monthly message limit reached',
        upgradeRequired: true,
        upgradePrompt: {
          type: 'message_limit',
          title: 'Message Limit Reached',
          message: `You've used all ${tierConfig.maxMessagesPerMonth} free messages this month. Upgrade to Pro for unlimited messages and advanced features.`,
          cta: 'Upgrade to Pro',
        },
      };
    }

    // Check if approaching limit (within 10 messages)
    if (messageCount >= tierConfig.maxMessagesPerMonth - 10) {
      return {
        allowed: true,
        reason: `You have ${tierConfig.maxMessagesPerMonth - messageCount} free messages remaining this month.`,
        upgradeRequired: false,
      };
    }

    return { allowed: true, upgradeRequired: false };
  }

  // Check if customer can use a pro feature
  async checkProFeatureAllowed(
    customerId: string,
    featureKey: string,
    estimatedCost: number = 0
  ): Promise<UsageCheckResult> {
    const status = await this.getCustomerTierStatus(customerId);
    if (!status) {
      return {
        allowed: false,
        reason: 'Customer not found',
        upgradeRequired: false,
      };
    }

    // Check if feature is enabled for tier
    const feature = status.features.find(f => f.featureKey === featureKey);
    if (!feature || !feature.isEnabled) {
      // Check if this is a free tier trying to use pro feature
      if (status.tier === 'free') {
        return {
          allowed: false,
          reason: 'This feature requires a Pro subscription',
          upgradeRequired: true,
          upgradePrompt: {
            type: 'pro_limit',
            title: 'Pro Feature',
            message: 'This feature is available with a Pro subscription. Upgrade now to unlock advanced features.',
            cta: 'Upgrade to Pro',
          },
        };
      }
      return {
        allowed: false,
        reason: 'Feature not available on your tier',
        upgradeRequired: true,
      };
    }

    // For free tier, check pro usage limits
    if (status.tier === 'free') {
      const tierConfig = await this.getTierConfig('free');
      const currentProUsage = status.proUsage?.totalUsd || 0;
      const projectedUsage = currentProUsage + estimatedCost;

      // Check if exceeded grace period
      if (currentProUsage >= (tierConfig.maxProUsageUsd + tierConfig.proUsageGracePeriodUsd)) {
        return {
          allowed: false,
          reason: 'Pro usage limit exceeded. Payment required to continue.',
          upgradeRequired: true,
          upgradePrompt: {
            type: 'payment_required',
            title: 'Payment Required',
            message: `You've exceeded your $${tierConfig.maxProUsageUsd + tierConfig.proUsageGracePeriodUsd} free usage limit. Upgrade to Pro to continue using premium features.`,
            cta: 'Upgrade to Pro',
          },
        };
      }

      // Check if in grace period
      if (currentProUsage >= tierConfig.maxProUsageUsd) {
        return {
          allowed: true,
          reason: `You've used $${currentProUsage.toFixed(2)} of pro features. Grace period active: $${status.limits.gracePeriodRemaining.toFixed(2)} remaining before upgrade required.`,
          upgradeRequired: false,
        };
      }

      // Check if this usage would exceed the initial limit
      if (projectedUsage > tierConfig.maxProUsageUsd) {
        return {
          allowed: true,
          reason: `This will start your grace period. You've used $${currentProUsage.toFixed(2)} of your $${tierConfig.maxProUsageUsd} free pro usage.`,
          upgradeRequired: false,
        };
      }
    }

    return { allowed: true, upgradeRequired: false };
  }

  // Record message usage
  async recordMessageUsage(
    customerId: string,
    employeeId: string | null,
    llmProvider: LLMProvider,
    isPaidLlm: boolean,
    costUsd: number = 0
  ): Promise<{ success: boolean; newCount: number; remaining: number; tierExceeded: boolean }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/record_message_usage`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.supabaseKey}`,
          apikey: this.supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_customer_id: customerId,
          p_employee_id: employeeId,
          p_llm_provider: llmProvider,
          p_is_paid_llm: isPaidLlm,
          p_cost_usd: costUsd,
        }),
      });

      if (!response.ok) throw new Error('Failed to record message usage');

      const result = await response.json();
      return {
        success: result[0].success,
        newCount: result[0].new_count,
        remaining: result[0].remaining,
        tierExceeded: result[0].tier_exceeded,
      };
    } catch (error) {
      console.error('Error recording message usage:', error);
      return { success: false, newCount: 0, remaining: 0, tierExceeded: false };
    }
  }

  // Record pro feature usage
  async recordProUsage(
    customerId: string,
    employeeId: string | null,
    usageType: 'call' | 'integration' | 'advanced_feature' | 'api',
    costUsd: number
  ): Promise<{ success: boolean; newTotal: number; limitExceeded: boolean; gracePeriodActive: boolean }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/record_pro_usage`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.supabaseKey}`,
          apikey: this.supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_customer_id: customerId,
          p_employee_id: employeeId,
          p_usage_type: usageType,
          p_cost_usd: costUsd,
        }),
      });

      if (!response.ok) throw new Error('Failed to record pro usage');

      const result = await response.json();
      return {
        success: result[0].success,
        newTotal: result[0].new_total,
        limitExceeded: result[0].limit_exceeded,
        gracePeriodActive: result[0].grace_period_active,
      };
    } catch (error) {
      console.error('Error recording pro usage:', error);
      return { success: false, newTotal: 0, limitExceeded: false, gracePeriodActive: false };
    }
  }

  // Upgrade customer tier
  async upgradeCustomer(
    customerId: string,
    newTier: TierName,
    stripeSubscriptionId?: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/upgrade_customer_tier`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.supabaseKey}`,
          apikey: this.supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_customer_id: customerId,
          p_new_tier: newTier,
          p_stripe_subscription_id: stripeSubscriptionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to upgrade customer');

      // Clear cache
      this.clearCache(`customer_tier_${customerId}`);
      
      return true;
    } catch (error) {
      console.error('Error upgrading customer:', error);
      return false;
    }
  }

  // Get appropriate LLM provider for customer
  async getLLMProviderForCustomer(customerId: string): Promise<{
    provider: LLMProvider;
    model: string;
    isFree: boolean;
  }> {
    const status = await this.getCustomerTierStatus(customerId);
    if (!status) {
      return { provider: 'ollama', model: 'qwen2.5:0.5b', isFree: true };
    }

    const tierConfig = await this.getTierConfig(status.tier);
    
    return {
      provider: status.llmProvider as LLMProvider,
      model: tierConfig.llmModel,
      isFree: status.tier === 'free' && status.llmProvider === 'ollama',
    };
  }

  // Get message usage for customer
  private async getMessageUsage(customerId: string): Promise<MessageUsage | null> {
    try {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;

      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/message_usage?customer_id=eq.${customerId}&year=eq.${year}&month=eq.${month}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: this.supabaseKey,
          },
        }
      );

      if (!response.ok) return null;

      const records = await response.json();
      if (records.length === 0) return null;

      return this.mapMessageUsage(records[0]);
    } catch (error) {
      return null;
    }
  }

  // Get pro usage for customer
  private async getProUsage(customerId: string): Promise<ProUsage | null> {
    try {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;

      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/pro_usage?customer_id=eq.${customerId}&year=eq.${year}&month=eq.${month}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: this.supabaseKey,
          },
        }
      );

      if (!response.ok) return null;

      const records = await response.json();
      if (records.length === 0) return null;

      return this.mapProUsage(records[0]);
    } catch (error) {
      return null;
    }
  }

  // Get tier features
  private async getTierFeatures(tierName: TierName): Promise<TierFeature[]> {
    const cacheKey = `tier_features_${tierName}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/tier_features?tier_name=eq.${tierName}`,
        {
          headers: {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: this.supabaseKey,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch tier features');

      const records = await response.json();
      const features = records.map(this.mapTierFeature);
      this.setCache(cacheKey, features);
      return features;
    } catch (error) {
      return [];
    }
  }

  // Check if feature is enabled for customer
  async hasFeature(customerId: string, featureKey: string): Promise<boolean> {
    const status = await this.getCustomerTierStatus(customerId);
    if (!status) return false;

    const feature = status.features.find(f => f.featureKey === featureKey);
    return feature?.isEnabled ?? false;
  }

  // Get remaining employees allowed
  async getRemainingEmployeesAllowed(customerId: string, currentEmployeeCount: number): Promise<number> {
    const status = await this.getCustomerTierStatus(customerId);
    if (!status) return 0;

    const feature = status.features.find(f => 
      f.featureKey === FEATURE_KEYS.UNLIMITED_EMPLOYEES ||
      f.featureKey === FEATURE_KEYS.MULTIPLE_EMPLOYEES ||
      f.featureKey === FEATURE_KEYS.ONE_EMPLOYEE
    );

    if (!feature || !feature.isEnabled) return 0;
    if (feature.limitValue === null) return -1; // unlimited

    return Math.max(0, feature.limitValue - currentEmployeeCount);
  }

  // Record upgrade prompt shown
  async recordUpgradePrompt(
    customerId: string,
    promptType: 'message_limit' | 'pro_limit' | 'payment_required',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/upgrade_prompts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.supabaseKey}`,
          apikey: this.supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          prompt_type: promptType,
          metadata: metadata || {},
        }),
      });
    } catch (error) {
      console.error('Error recording upgrade prompt:', error);
    }
  }

  // Private helper methods
  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, expiry: Date.now() + this.cacheTTL });
  }

  private clearCache(key: string): void {
    this.cache.delete(key);
  }

  private mapTierConfig(record: any): TierConfig {
    return {
      id: record.id,
      tierName: record.tier_name,
      displayName: record.display_name,
      llmProvider: record.llm_provider,
      llmModel: record.llm_model,
      maxMessagesPerMonth: record.max_messages_per_month,
      maxProUsageUsd: record.max_pro_usage_usd,
      proUsageGracePeriodUsd: record.pro_usage_grace_period_usd,
      features: record.features || [],
      isActive: record.is_active,
    };
  }

  private mapTierFeature(record: any): TierFeature {
    return {
      id: record.id,
      tierName: record.tier_name,
      featureKey: record.feature_key,
      featureName: record.feature_name,
      isEnabled: record.is_enabled,
      limitValue: record.limit_value,
    };
  }

  private mapMessageUsage(record: any): MessageUsage {
    return {
      id: record.id,
      customerId: record.customer_id,
      year: record.year,
      month: record.month,
      messageCount: record.message_count,
      freeLlmMessageCount: record.free_llm_message_count,
      paidLlmMessageCount: record.paid_llm_message_count,
      remainingFree: record.remaining_free || 0,
    };
  }

  private mapProUsage(record: any): ProUsage {
    return {
      id: record.id,
      customerId: record.customer_id,
      year: record.year,
      month: record.month,
      totalUsd: record.total_usd,
      callsUsd: record.calls_usd,
      integrationsUsd: record.integrations_usd,
      advancedFeaturesUsd: record.advanced_features_usd,
    };
  }
}

// Singleton instance
let tierManager: TierManager | null = null;

export function getTierManager(): TierManager {
  if (!tierManager) {
    tierManager = new TierManager();
  }
  return tierManager;
}

// Utility functions
export function formatTierDisplay(tier: TierName): string {
  const displays: Record<TierName, string> = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };
  return displays[tier] || tier;
}

export function getUpgradeUrl(tier: TierName): string {
  return `/pricing?upgrade_from=${tier}`;
}

export function calculateProFeatureCost(
  featureType: keyof typeof PRO_FEATURE_PRICING,
  quantity: number
): number {
  const rate = PRO_FEATURE_PRICING[featureType];
  return rate * quantity;
}

// ============================================
// Work Hours Pricing Integration
// Re-export for convenience
// ============================================

export {
  // Types
  type FeatureType,
  type PricingTier,
  type CostCalculation,
  type FeatureUsage,
  type UsageBreakdown,
  
  // Constants
  PRICING_TIERS,
  EMPTY_USAGE_BREAKDOWN,
  
  // Calculation functions
  calculateCost,
  calculateTextChatCost,
  calculateVoiceChatCost,
  calculateImageGenerationCost,
  calculateVideoGenerationCost,
  calculateScreenRecordingCost,
  calculateApiCallCost,
  calculateTotalWorkHours,
  
  // Formatting functions
  formatWorkHoursCost,
  formatCostTooltip,
  formatUsageBreakdown,
  getFeatureDisplayName,
  getAllFeatureTypes,
} from './work-hours-costs';
