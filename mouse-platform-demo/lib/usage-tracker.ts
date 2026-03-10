/**
 * Usage Tracker — Server-side billing middleware
 * 
 * Every external API call must go through this to:
 * 1. Check customer balance BEFORE the call
 * 2. Make the call
 * 3. Log the actual cost and deduct hours
 * 
 * Formula: work_hours_charged = vendor_cost × margin_multiplier / $4.98
 */

import { getSupabaseServer } from './supabase-server';

export type UsageEventType =
  | 'chat_opus'
  | 'chat_sonnet'
  | 'chat_kimi'
  | 'voice_elevenlabs'
  | 'vm_orgo'
  | 'phone_twilio'
  | 'phone_number'
  | 'image_gen'
  | 'deployment';

// Margin multipliers (mirrors margin_config table)
const MARGINS: Record<UsageEventType, number> = {
  chat_opus: 5,
  chat_sonnet: 5,
  chat_kimi: 30,
  voice_elevenlabs: 10,
  vm_orgo: 10,
  phone_twilio: 10,
  phone_number: 14,
  image_gen: 10,
  deployment: 5,
};

const HOURLY_RATE = 4.98;

/** Resolve a UUID (Supabase auth ID) to cst_* customer ID */
async function resolveCustomerId(supabase: any, id: string): Promise<string> {
  if (id.startsWith('cst_')) return id;
  const { data } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', id)
    .single();
  return data?.id || id;
}

export interface UsageResult {
  success: boolean;
  eventId?: string;
  workHoursCharged?: number;
  newBalance?: number;
  error?: string;
}

export interface BalanceCheck {
  hasBalance: boolean;
  currentBalance: number;
  requiredHours?: number;
}

/**
 * Check if a customer has enough balance for an estimated cost
 */
export async function checkBalance(
  customerId: string,
  eventType: UsageEventType,
  estimatedVendorCost: number
): Promise<BalanceCheck> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { hasBalance: false, currentBalance: 0, error: 'No database connection' } as any;
  }

  const resolvedId = await resolveCustomerId(supabase, customerId);
  const margin = MARGINS[eventType] || 5;
  const requiredHours = (estimatedVendorCost * margin) / HOURLY_RATE;

  const { data, error } = await supabase
    .from('customers')
    .select('work_hours_balance')
    .eq('id', resolvedId)
    .single();

  if (error || !data) {
    return { hasBalance: false, currentBalance: 0, requiredHours };
  }

  return {
    hasBalance: data.work_hours_balance >= requiredHours,
    currentBalance: data.work_hours_balance,
    requiredHours,
  };
}

/**
 * Record a usage event and deduct from customer balance (atomic via DB function)
 */
export async function recordUsage(
  customerId: string,
  eventType: UsageEventType,
  vendorCost: number,
  metadata: Record<string, any> = {},
  employeeId?: string
): Promise<UsageResult> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'No database connection' };
  }

  try {
    const resolvedId = await resolveCustomerId(supabase, customerId);
    const { data, error } = await supabase.rpc('record_usage_event', {
      p_customer_id: resolvedId,
      p_employee_id: employeeId || null,
      p_event_type: eventType,
      p_vendor_cost: vendorCost,
      p_metadata: metadata,
    });

    if (error) {
      console.error('[usage-tracker] RPC error:', error);
      return { success: false, error: error.message };
    }

    const result = data?.[0];
    if (!result?.success) {
      return {
        success: false,
        error: 'Insufficient work hours',
        workHoursCharged: result?.work_hours_charged,
        newBalance: result?.new_balance,
      };
    }

    return {
      success: true,
      eventId: result.event_id,
      workHoursCharged: result.work_hours_charged,
      newBalance: result.new_balance,
    };
  } catch (err: any) {
    console.error('[usage-tracker] Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Calculate vendor cost from Anthropic API response
 */
export function calculateAnthropicCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): { vendorCost: number; eventType: UsageEventType } {
  // Per-token pricing
  const pricing: Record<string, { input: number; output: number; type: UsageEventType }> = {
    'claude-opus-4-6': { input: 15 / 1_000_000, output: 75 / 1_000_000, type: 'chat_opus' },
    'claude-opus-4-20250918': { input: 15 / 1_000_000, output: 75 / 1_000_000, type: 'chat_opus' },
    'claude-sonnet-4-20250514': { input: 3 / 1_000_000, output: 15 / 1_000_000, type: 'chat_sonnet' },
    'claude-sonnet-4-5-20250929': { input: 3 / 1_000_000, output: 15 / 1_000_000, type: 'chat_sonnet' },
  };

  const p = pricing[model] || pricing['claude-sonnet-4-20250514'];
  const vendorCost = (inputTokens * p.input) + (outputTokens * p.output);

  return { vendorCost, eventType: p.type };
}

/**
 * Calculate estimated hours for a vendor cost
 */
export function estimateHours(eventType: UsageEventType, vendorCost: number): number {
  const margin = MARGINS[eventType] || 5;
  return (vendorCost * margin) / HOURLY_RATE;
}

/**
 * Billing-wrapped API call helper.
 * Checks balance → makes call → records usage.
 */
export async function billedApiCall<T>(opts: {
  customerId: string;
  eventType: UsageEventType;
  estimatedCost: number;
  employeeId?: string;
  metadata?: Record<string, any>;
  apiCall: () => Promise<{ result: T; actualCost: number }>;
}): Promise<{ success: true; result: T; usage: UsageResult } | { success: false; error: string; balance?: number }> {
  // 1. Pre-check balance
  const check = await checkBalance(opts.customerId, opts.eventType, opts.estimatedCost);
  if (!check.hasBalance) {
    return {
      success: false,
      error: 'Your work hours are depleted. Purchase more to continue.',
      balance: check.currentBalance,
    };
  }

  // 2. Make the API call
  let result: T;
  let actualCost: number;
  try {
    const callResult = await opts.apiCall();
    result = callResult.result;
    actualCost = callResult.actualCost;
  } catch (err: any) {
    return { success: false, error: `API call failed: ${err.message}` };
  }

  // 3. Record usage with actual cost
  const usage = await recordUsage(
    opts.customerId,
    opts.eventType,
    actualCost,
    opts.metadata || {},
    opts.employeeId
  );

  if (!usage.success) {
    // Call succeeded but billing failed — log but don't fail the user
    console.error('[usage-tracker] Billing failed after successful API call:', usage.error);
  }

  return { success: true, result, usage };
}

/**
 * Get customer's current balance
 */
export async function getBalance(customerId: string): Promise<number> {
  const supabase = getSupabaseServer();
  if (!supabase) return 0;

  const { data } = await supabase
    .from('customers')
    .select('work_hours_balance')
    .eq('id', customerId)
    .single();

  return data?.work_hours_balance || 0;
}

/**
 * Credit hours to a customer (for purchases)
 */
export async function creditHours(
  customerId: string,
  hours: number,
  reason: string = 'purchase'
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) return { success: false, error: 'No database connection' };

  const { data, error } = await supabase.rpc('credit_work_hours', {
    p_customer_id: customerId,
    p_hours: hours,
  });

  if (error) {
    // Fallback: manual update
    const { data: customer } = await supabase
      .from('customers')
      .select('work_hours_balance, work_hours_purchased')
      .eq('id', customerId)
      .single();

    if (!customer) return { success: false, error: 'Customer not found' };

    const { error: updateErr } = await supabase
      .from('customers')
      .update({
        work_hours_balance: (customer.work_hours_balance || 0) + hours,
        work_hours_purchased: (customer.work_hours_purchased || 0) + hours,
      })
      .eq('id', customerId);

    if (updateErr) return { success: false, error: updateErr.message };

    return { success: true, newBalance: (customer.work_hours_balance || 0) + hours };
  }

  return { success: true, newBalance: data?.[0]?.new_balance };
}
