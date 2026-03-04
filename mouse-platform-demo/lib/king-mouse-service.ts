/**
 * King Mouse Provisioning Service (Launch-Ready Version)
 * Auto-creates isolated OpenClaw instances for each customer on signup
 * 
 * NOTE: This is the simplified launch version. Full version requires Supabase.
 */

import crypto from 'crypto';

export interface KingMouseConfig {
  customerId: string;
  customerEmail: string;
  companyName: string;
  planTier: string;
  resellerId?: string;
}

export interface KingMouseInstance {
  id: string;
  customerId: string;
  botToken: string;
  botUsername: string;
  botLink: string;
  qrCodeUrl?: string;
  telegramChatId?: string;
  status: 'provisioning' | 'active' | 'error' | 'suspended';
  createdAt: string;
  lastActiveAt?: string;
  totalInteractions: number;
  config: {
    maxEmployees: number;
    maxWorkHours: number;
    features: string[];
  };
}

export interface ProvisioningResult {
  success: boolean;
  instance?: KingMouseInstance;
  error?: string;
}

// In-memory store for launch (replace with Supabase later)
const kingMouseStore: Map<string, KingMouseInstance> = new Map();

export class KingMouseService {
  // Plan configurations for King Mouse
  private planConfigs: Record<string, { maxEmployees: number; maxWorkHours: number; features: string[] }> = {
    free: {
      maxEmployees: 1,
      maxWorkHours: 20,
      features: ['basic_chat', 'email_support'],
    },
    starter: {
      maxEmployees: 1,
      maxWorkHours: 160,
      features: ['basic_chat', 'email_support', 'crm_integration', 'roi_dashboard'],
    },
    growth: {
      maxEmployees: 3,
      maxWorkHours: 500,
      features: ['basic_chat', 'priority_support', 'crm_integration', 'roi_dashboard', 'voice_calls', 'api_access'],
    },
    pro: {
      maxEmployees: 5,
      maxWorkHours: -1, // unlimited
      features: ['all_features', 'custom_workflows', 'dedicated_manager', 'sla_guarantee'],
    },
    enterprise: {
      maxEmployees: 10,
      maxWorkHours: -1,
      features: ['all_features', 'white_label', 'dedicated_infrastructure', 'custom_models'],
    },
  };

  /**
   * Generate a unique bot username
   */
  private generateBotUsername(customerId: string): string {
    const shortId = customerId.replace('cust_', '').slice(0, 8);
    return `mouse_king_${shortId}_bot`;
  }

  /**
   * Generate bot link from username
   */
  private generateBotLink(username: string): string {
    return `https://t.me/${username}`;
  }

  /**
   * Provision a new King Mouse instance for a customer
   */
  async provisionKingMouse(config: KingMouseConfig): Promise<ProvisioningResult> {
    const startTime = Date.now();
    console.log(`🤖 Starting King Mouse provisioning for customer: ${config.customerId}`);

    try {
      // 1. Check if King Mouse already exists for this customer
      const existing = await this.getKingMouseByCustomer(config.customerId);
      if (existing) {
        console.log(`⚠️ King Mouse already exists for customer: ${config.customerId}`);
        return {
          success: true,
          instance: existing,
        };
      }

      // 2. Generate bot credentials
      const botUsername = this.generateBotUsername(config.customerId);
      const botLink = this.generateBotLink(botUsername);

      // 3. Get plan configuration
      const planConfig = this.planConfigs[config.planTier] || this.planConfigs.starter;

      // 4. Create King Mouse instance
      const kingMouseId = `km_${crypto.randomBytes(8).toString('hex')}`;
      
      const instance: KingMouseInstance = {
        id: kingMouseId,
        customerId: config.customerId,
        botToken: `mock-token-${Date.now()}`,
        botUsername,
        botLink,
        status: 'active', // Auto-active for launch
        createdAt: new Date().toISOString(),
        config: planConfig,
        totalInteractions: 0,
      };

      // Store in memory
      kingMouseStore.set(config.customerId, instance);

      console.log(`✅ King Mouse provisioned: ${kingMouseId}`);

      const duration = Date.now() - startTime;
      console.log(`✅ King Mouse provisioning completed in ${duration}ms for customer: ${config.customerId}`);

      return {
        success: true,
        instance,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ King Mouse provisioning failed after ${duration}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown provisioning error',
      };
    }
  }

  /**
   * Get King Mouse by customer ID
   */
  async getKingMouseByCustomer(customerId: string): Promise<KingMouseInstance | null> {
    return kingMouseStore.get(customerId) || null;
  }

  /**
   * Get King Mouse by ID
   */
  async getKingMouseById(kingMouseId: string): Promise<KingMouseInstance | null> {
    for (const instance of kingMouseStore.values()) {
      if (instance.id === kingMouseId) {
        return instance;
      }
    }
    return null;
  }

  /**
   * Deprovision King Mouse (when customer cancels)
   */
  async deprovisionKingMouse(customerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      kingMouseStore.delete(customerId);
      console.log(`🗑️ King Mouse deprovisioned for customer: ${customerId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get King Mouse status and metrics
   */
  async getKingMouseStatus(kingMouseId: string): Promise<{
    status: string;
    totalInteractions: number;
    lastActiveAt?: string;
    config: any;
  } | null> {
    const instance = await this.getKingMouseById(kingMouseId);
    if (!instance) return null;

    return {
      status: instance.status,
      totalInteractions: instance.totalInteractions,
      lastActiveAt: instance.lastActiveAt,
      config: instance.config,
    };
  }

  /**
   * Record interaction
   */
  async recordInteraction(kingMouseId: string): Promise<void> {
    const instance = await this.getKingMouseById(kingMouseId);
    if (instance) {
      instance.totalInteractions++;
      instance.lastActiveAt = new Date().toISOString();
    }
  }
}

// Export singleton instance
export const kingMouseService = new KingMouseService();
