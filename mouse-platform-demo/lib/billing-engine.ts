/**
 * Work Hours Billing Engine
 * Converts vendor costs to work-hours using margin multipliers.
 * Customers see hours consumed, never tokens or API calls.
 */

export type ServiceType = 'elevenlabs' | 'anthropic_opus' | 'anthropic_sonnet' | 'kimi' | 'orgo_vm' | 'twilio_call' | 'twilio_sms' | 'twilio_number';

export interface MarginConfig {
  multiplier: number;
  description: string;
}

// Margin multipliers per service
export const MARGINS: Record<ServiceType, MarginConfig> = {
  elevenlabs:      { multiplier: 10, description: 'ElevenLabs voice (~$0.20/min → $2.00/min)' },
  anthropic_opus:  { multiplier: 5,  description: 'Claude Opus 4.6 (5x on token cost)' },
  anthropic_sonnet:{ multiplier: 8,  description: 'Claude Sonnet (8x on token cost)' },
  kimi:            { multiplier: 30, description: 'Kimi K2.5 (30x on token cost)' },
  orgo_vm:         { multiplier: 10, description: 'Orgo VM compute (10x on hourly cost)' },
  twilio_call:     { multiplier: 10, description: 'Twilio voice (10x on per-minute)' },
  twilio_sms:      { multiplier: 10, description: 'Twilio SMS (10x on per-message)' },
  twilio_number:   { multiplier: 1,  description: 'Twilio number (flat $28/number)' },
};

// Pricing tiers - hourly rate determines how fast hours are consumed
export interface PricingTier {
  name: string;
  pricePerMonth: number;
  includedHours: number;
  hourlyRate: number; // $/hour - used to convert marked-up cost to hours
  model: 'kimi' | 'opus' | 'sonnet';
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  starter: {
    name: 'Starter',
    pricePerMonth: 97,
    includedHours: 20,
    hourlyRate: 4.85, // $97 / 20 hours
    model: 'kimi',
  },
  growth: {
    name: 'Growth',
    pricePerMonth: 297,
    includedHours: 70,
    hourlyRate: 4.24, // $297 / 70 hours
    model: 'sonnet',
  },
  pro: {
    name: 'Pro',
    pricePerMonth: 497,
    includedHours: 125,
    hourlyRate: 3.98, // $497 / 125 hours
    model: 'opus',
  },
};

/**
 * Calculate hours to deduct for a billable action
 */
export function calculateHoursDeducted(
  service: ServiceType,
  vendorCost: number,
  tier: string = 'starter'
): { markedUpCost: number; hoursDeducted: number; margin: number } {
  const marginConfig = MARGINS[service];
  const pricingTier = PRICING_TIERS[tier] || PRICING_TIERS.starter;
  
  // Special case: flat-rate services
  if (service === 'twilio_number') {
    const flatCost = 28; // $28 per number
    const hoursDeducted = flatCost / pricingTier.hourlyRate;
    return {
      markedUpCost: flatCost,
      hoursDeducted,
      margin: flatCost - vendorCost,
    };
  }
  
  const markedUpCost = vendorCost * marginConfig.multiplier;
  const hoursDeducted = markedUpCost / pricingTier.hourlyRate;
  const margin = markedUpCost - vendorCost;
  
  return { markedUpCost, hoursDeducted, margin };
}

/**
 * Get the AI model to use for a customer based on their tier
 */
export function getModelForTier(tier: string): { model: string; apiModel: string } {
  const pricingTier = PRICING_TIERS[tier];
  if (!pricingTier) {
    return { model: 'kimi', apiModel: 'kimi-k2.5' };
  }
  
  switch (pricingTier.model) {
    case 'opus':
      return { model: 'anthropic_opus', apiModel: 'claude-opus-4-6' };
    case 'sonnet':
      return { model: 'anthropic_sonnet', apiModel: 'claude-sonnet-4-5-20250929' };
    case 'kimi':
    default:
      return { model: 'kimi', apiModel: 'kimi-k2.5' };
  }
}

/**
 * Estimate vendor cost for common API operations
 */
export const VENDOR_COST_ESTIMATES = {
  // Anthropic (per 1M tokens)
  anthropic_opus_input: 15.00 / 1_000_000,    // $15/MTok
  anthropic_opus_output: 75.00 / 1_000_000,   // $75/MTok
  anthropic_sonnet_input: 3.00 / 1_000_000,   // $3/MTok
  anthropic_sonnet_output: 15.00 / 1_000_000, // $15/MTok
  
  // Kimi (per 1M tokens)
  kimi_input: 0.15 / 1_000_000,
  kimi_output: 0.60 / 1_000_000,
  
  // ElevenLabs (per minute)
  elevenlabs_per_minute: 0.20,
  
  // Orgo VM (per hour)
  orgo_vm_per_hour: 0.50,
  
  // Twilio
  twilio_sms_per_message: 0.0079,
  twilio_call_per_minute: 0.014,
  twilio_number_monthly: 2.00,
};
