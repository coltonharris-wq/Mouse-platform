/**
 * Tiered Work Hours Cost System
 * Different features cost different work hours based on their resource usage
 */

// Feature types for tracking
export type FeatureType = 
  | 'text_chat'
  | 'voice_chat'
  | 'image_generation'
  | 'video_generation'
  | 'screen_recording'
  | 'api_call'
  | 'employee_deployment'
  | 'vm_runtime';

// Pricing tier configuration
export interface PricingTier {
  feature: FeatureType;
  displayName: string;
  workHoursCost: number; // Cost per unit in hours
  unit: string; // '1000_tokens' | 'image' | 'video' | 'hour' | 'call'
  multiplier: number; // Relative to base (1x)
  description: string;
}

// MAIN PRICING CONFIGURATION - $4.98/hour base rate
export const HOURLY_RATE = 4.98;

// Human employee cost for comparison (average $35/hour)
export const HUMAN_HOURLY_RATE = 35;

// Calculate savings vs human employee
export function calculateSavings(aiHours: number): number {
  const humanCost = aiHours * HUMAN_HOURLY_RATE;
  const aiCost = aiHours * HOURLY_RATE;
  return humanCost - aiCost;
}

// Calculate savings percentage
export function calculateSavingsPercent(): number {
  return Math.round(((HUMAN_HOURLY_RATE - HOURLY_RATE) / HUMAN_HOURLY_RATE) * 100);
}

// Main pricing configuration - All costs are in WORK HOURS (not tokens)
export const PRICING_TIERS: Record<FeatureType, PricingTier> = {
  text_chat: {
    feature: 'text_chat',
    displayName: 'Text Chat (Kimi K2.5)',
    workHoursCost: 0.1, // 0.1 hours per 1000 tokens (~6 minutes)
    unit: '1000_tokens',
    multiplier: 1,
    description: 'Standard text-based AI chat',
  },
  voice_chat: {
    feature: 'voice_chat',
    displayName: 'Voice Chat (ElevenLabs)',
    workHoursCost: 0.2, // 0.2 hours per 1000 tokens (~12 minutes)
    unit: '1000_tokens',
    multiplier: 2,
    description: 'Voice-based AI conversation with ElevenLabs',
  },
  image_generation: {
    feature: 'image_generation',
    displayName: 'Image Generation',
    workHoursCost: 0.5, // 0.5 hours per image (30 minutes)
    unit: 'image',
    multiplier: 5,
    description: 'AI-generated images',
  },
  video_generation: {
    feature: 'video_generation',
    displayName: 'Video Generation',
    workHoursCost: 2.0, // 2 hours per video
    unit: 'video',
    multiplier: 20,
    description: 'AI-generated video content',
  },
  screen_recording: {
    feature: 'screen_recording',
    displayName: 'Screen Recording',
    workHoursCost: 0.5, // 0.5 hours per hour of recording
    unit: 'hour',
    multiplier: 0.5,
    description: 'Record and analyze screen activity',
  },
  api_call: {
    feature: 'api_call',
    displayName: 'API Call',
    workHoursCost: 0.01, // 0.01 hours per call (~36 seconds)
    unit: 'call',
    multiplier: 0.1,
    description: 'External API integrations',
  },
  employee_deployment: {
    feature: 'employee_deployment',
    displayName: 'Employee Deployment',
    workHoursCost: 0.25, // 0.25 hours per deployment (15 minutes setup)
    unit: 'deployment',
    multiplier: 0.25,
    description: 'Deploy a new AI employee',
  },
  vm_runtime: {
    feature: 'vm_runtime',
    displayName: 'VM Runtime',
    workHoursCost: 1.0, // 1 hour per hour of runtime
    unit: 'hour',
    multiplier: 1,
    description: 'Virtual machine running time',
  },
};

// Feature usage tracking
export interface FeatureUsage {
  featureType: FeatureType;
  unitsUsed: number;
  workHoursConsumed: number;
  timestamp: Date;
}

// Cost calculation result
export interface CostCalculation {
  featureType: FeatureType;
  units: number;
  workHoursRequired: number;
  canAfford: boolean;
  currentBalance: number;
  balanceAfter: number;
}

/**
 * Calculate the work hours cost for a feature usage
 */
export function calculateCost(
  featureType: FeatureType,
  units: number,
  currentBalance: number
): CostCalculation {
  const tier = PRICING_TIERS[featureType];
  const workHoursRequired = tier.workHoursCost * units;
  
  return {
    featureType,
    units,
    workHoursRequired,
    canAfford: currentBalance >= workHoursRequired,
    currentBalance,
    balanceAfter: currentBalance - workHoursRequired,
  };
}

/**
 * Calculate cost for text chat based on token count
 */
export function calculateTextChatCost(tokenCount: number, currentBalance: number): CostCalculation {
  const units = tokenCount / 1000;
  return calculateCost('text_chat', units, currentBalance);
}

/**
 * Calculate cost for voice chat based on token count
 */
export function calculateVoiceChatCost(tokenCount: number, currentBalance: number): CostCalculation {
  const units = tokenCount / 1000;
  return calculateCost('voice_chat', units, currentBalance);
}

/**
 * Calculate cost for image generation
 */
export function calculateImageGenerationCost(imageCount: number, currentBalance: number): CostCalculation {
  return calculateCost('image_generation', imageCount, currentBalance);
}

/**
 * Calculate cost for video generation
 */
export function calculateVideoGenerationCost(videoCount: number, currentBalance: number): CostCalculation {
  return calculateCost('video_generation', videoCount, currentBalance);
}

/**
 * Calculate cost for screen recording
 */
export function calculateScreenRecordingCost(hours: number, currentBalance: number): CostCalculation {
  return calculateCost('screen_recording', hours, currentBalance);
}

/**
 * Calculate cost for API calls
 */
export function calculateApiCallCost(callCount: number, currentBalance: number): CostCalculation {
  return calculateCost('api_call', callCount, currentBalance);
}

/**
 * Format work hours cost for display
 * Shows hours with 1 decimal place, or minutes if less than 0.1 hours
 */
export function formatWorkHoursCost(workHours: number): string {
  if (workHours < 0.1 && workHours > 0) {
    const minutes = Math.round(workHours * 60);
    return `${minutes} min`;
  }
  if (workHours < 1 && workHours >= 0.1) {
    return `${workHours.toFixed(2)} hr`;
  }
  return `${workHours.toFixed(1)} hr${workHours !== 1 ? 's' : ''}`;
}

/**
 * Format cost preview tooltip text
 */
export function formatCostTooltip(featureType: FeatureType, units?: number): string {
  const tier = PRICING_TIERS[featureType];
  const unitText = units ? `${units} ${tier.unit.replace('_', ' ')}` : tier.unit.replace('_', ' ');
  const hoursText = tier.workHoursCost < 0.1 
    ? `${Math.round(tier.workHoursCost * 60)} min`
    : `${tier.workHoursCost} hr${tier.workHoursCost !== 1 ? 's' : ''}`;
  return `Uses ${hoursText} per ${unitText} ($${(tier.workHoursCost * HOURLY_RATE).toFixed(2)})`;
}

/**
 * Get display label for feature type
 */
export function getFeatureDisplayName(featureType: FeatureType): string {
  return PRICING_TIERS[featureType].displayName;
}

/**
 * Get all feature types for dashboard display
 */
export function getAllFeatureTypes(): FeatureType[] {
  return Object.keys(PRICING_TIERS) as FeatureType[];
}

// Default empty usage breakdown
export const EMPTY_USAGE_BREAKDOWN: Record<FeatureType, number> = {
  text_chat: 0,
  voice_chat: 0,
  image_generation: 0,
  video_generation: 0,
  screen_recording: 0,
  api_call: 0,
  employee_deployment: 0,
  vm_runtime: 0,
};

// Usage breakdown by feature type
export interface UsageBreakdown {
  text_chat: number;
  voice_chat: number;
  image_generation: number;
  video_generation: number;
  screen_recording: number;
  api_call: number;
  employee_deployment: number;
  vm_runtime: number;
}

/**
 * Calculate total work hours from usage breakdown
 */
export function calculateTotalWorkHours(breakdown: UsageBreakdown): number {
  return Object.values(breakdown).reduce((sum, hours) => sum + hours, 0);
}

/**
 * Format usage breakdown for display
 * Example: "Voice: 10hrs, Images: 5hrs, Text: 20hrs"
 */
export function formatUsageBreakdown(breakdown: UsageBreakdown): string {
  const parts: string[] = [];
  
  if (breakdown.voice_chat > 0) {
    parts.push(`Voice: ${formatWorkHoursCost(breakdown.voice_chat)}`);
  }
  if (breakdown.image_generation > 0) {
    parts.push(`Images: ${formatWorkHoursCost(breakdown.image_generation)}`);
  }
  if (breakdown.video_generation > 0) {
    parts.push(`Video: ${formatWorkHoursCost(breakdown.video_generation)}`);
  }
  if (breakdown.text_chat > 0) {
    parts.push(`Text: ${formatWorkHoursCost(breakdown.text_chat)}`);
  }
  if (breakdown.screen_recording > 0) {
    parts.push(`Screen: ${formatWorkHoursCost(breakdown.screen_recording)}`);
  }
  if (breakdown.api_call > 0) {
    parts.push(`API: ${formatWorkHoursCost(breakdown.api_call)}`);
  }
  if (breakdown.employee_deployment > 0) {
    parts.push(`Deploy: ${formatWorkHoursCost(breakdown.employee_deployment)}`);
  }
  if (breakdown.vm_runtime > 0) {
    parts.push(`VM: ${formatWorkHoursCost(breakdown.vm_runtime)}`);
  }
  
  return parts.join(', ') || 'No usage yet';
}

// Legacy WORK_HOURS_COSTS for backward compatibility
export const WORK_HOURS_COSTS = {
  messageKingMouse: 0.1,
  deployAiEmployee: 0.25,
  vmRuntime1h: 1,
  processEmail: 0.05,
  apiCall: 0.01,
};
