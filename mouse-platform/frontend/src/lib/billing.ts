/**
 * Shared billing utilities for hour balance enforcement.
 * Every billable route MUST check balance before executing.
 *
 * Schema notes:
 *  - customers table: id (custom), user_id (auth UUID), hours_included, hours_used
 *  - usage_events table: user_id (auth UUID), service, description, hours_used
 */

import { supabaseQuery } from '@/lib/supabase-server';

// Billing rates (in hours per unit)
export const BILLING_RATES = {
  CHAT_MESSAGE: 0.05,        // ~3 min work time per message ≈ $0.25
  TASK_EXECUTION: 0.10,      // ~6 min work time per task ≈ $0.50
  VOICE_CALL_PER_MIN: 0.6024, // $3.00/min at $4.98/hr
  PHONE_PROVISION: 5.622,     // $28 one-time cost at $4.98/hr
  VOICE_PREVIEW: 0.005,       // Tiny charge to prevent spam ≈ $0.025
} as const;

export interface BalanceInfo {
  hoursIncluded: number;
  hoursUsed: number;
  remaining: number;
  customerId: string;
  userId: string;
}

/**
 * Resolve a customer by their id OR user_id.
 * Returns { id, user_id, hours_included, hours_used } or null.
 */
async function resolveCustomer(customerId: string): Promise<{
  id: string; user_id: string; hours_included: number; hours_used: number;
} | null> {
  // Try by primary id first
  let customers = await supabaseQuery(
    'customers', 'GET', undefined,
    `id=eq.${customerId}&select=id,user_id,hours_included,hours_used`
  );

  if (!customers || customers.length === 0) {
    // Fallback: try by user_id (auth UUID)
    customers = await supabaseQuery(
      'customers', 'GET', undefined,
      `user_id=eq.${customerId}&select=id,user_id,hours_included,hours_used`
    );
  }

  if (!customers || customers.length === 0) return null;

  const c = customers[0];
  return {
    id: c.id,
    user_id: c.user_id || c.id,
    hours_included: parseFloat(c.hours_included) || 0,
    hours_used: parseFloat(c.hours_used) || 0,
  };
}

/**
 * Check if a customer has sufficient hours for an operation.
 * Returns balance info or null if customer not found.
 */
export async function getBalance(customerId: string): Promise<BalanceInfo | null> {
  const c = await resolveCustomer(customerId);
  if (!c) return null;

  return {
    hoursIncluded: c.hours_included,
    hoursUsed: c.hours_used,
    remaining: c.hours_included - c.hours_used,
    customerId: c.id,
    userId: c.user_id,
  };
}

/**
 * Check balance and return 402 error message if insufficient.
 * Returns null if balance is sufficient, or error string if not.
 */
export async function checkBalance(customerId: string, requiredHours: number): Promise<string | null> {
  const balance = await getBalance(customerId);
  if (!balance) return 'Customer not found';

  if (balance.remaining < requiredHours) {
    const deficit = requiredHours - balance.remaining;
    return `Insufficient hours. You need ${requiredHours.toFixed(3)} hours but only have ${Math.max(0, balance.remaining).toFixed(3)} remaining. Please purchase more hours. (Short by ${deficit.toFixed(3)} hrs)`;
  }

  return null; // Balance is sufficient
}

/**
 * Deduct hours from a customer's balance and log the usage event.
 * Uses optimistic concurrency — reads current value and writes incremented value.
 *
 * Writes to:
 *  - customers.hours_used (increment)
 *  - usage_events (user_id, service, description, hours_used)
 */
export async function deductHours(
  customerId: string,
  hours: number,
  service: string,
  description: string
): Promise<void> {
  const customer = await resolveCustomer(customerId);
  if (!customer) {
    throw new Error('Customer not found for billing');
  }

  // Increment hours_used on customer record
  await supabaseQuery('customers', 'PATCH',
    { hours_used: customer.hours_used + hours },
    `id=eq.${customer.id}`
  );

  // Log usage event (uses user_id and hours_used per DB schema)
  await supabaseQuery('usage_events', 'POST', {
    user_id: customer.user_id,
    service,
    description,
    hours_used: hours,
  });
}
