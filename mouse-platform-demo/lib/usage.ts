import { supabaseQuery, supabaseRpc } from './supabase-server'

// Kimi K2.5 rates
const KIMI_INPUT_PER_MILLION = 0.60
const KIMI_OUTPUT_PER_MILLION = 3.00
const MARKUP = 30
const HOURLY_RATE = 4.98

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export async function getBalance(customerId: string) {
  const data = await supabaseQuery(
    'usage_balance',
    'GET',
    undefined,
    `customer_id=eq.${customerId}&select=*`
  )
  return data?.[0] || { plan_hours: 0, hours_used: 0, hours_remaining: 0 }
}

export async function trackLLMUsage(
  customerId: string,
  inputTokens: number,
  outputTokens: number,
  metadata: Record<string, any> = {}
) {
  const baseCostDollars =
    (inputTokens / 1_000_000) * KIMI_INPUT_PER_MILLION +
    (outputTokens / 1_000_000) * KIMI_OUTPUT_PER_MILLION
  const billedCostDollars = baseCostDollars * MARKUP
  const hoursDeducted = billedCostDollars / HOURLY_RATE

  await supabaseQuery('usage_log', 'POST', {
    customer_id: customerId,
    type: 'llm_call',
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    base_cost_cents: Math.ceil(baseCostDollars * 100),
    billed_cost_cents: Math.ceil(billedCostDollars * 100),
    work_hours_deducted: hoursDeducted,
    metadata: { model: 'kimi-k2.5', ...metadata },
  })

  await supabaseRpc('deduct_hours', {
    p_customer_id: customerId,
    p_hours: hoursDeducted,
  })

  return hoursDeducted
}

export async function trackVMUptime(customerId: string, vmId: string) {
  const ORGO_COST_PER_HOUR = 0.10
  const balance = await getBalance(customerId)

  const vmHours = 5 / 60
  const baseCostDollars = vmHours * ORGO_COST_PER_HOUR
  const billedCostDollars = baseCostDollars * MARKUP
  const hoursDeducted = billedCostDollars / HOURLY_RATE

  if (balance.hours_remaining <= hoursDeducted) {
    return { paused: true }
  }

  await supabaseQuery('usage_log', 'POST', {
    customer_id: customerId,
    type: 'vm_uptime',
    input_tokens: 0,
    output_tokens: 0,
    base_cost_cents: Math.ceil(baseCostDollars * 100),
    billed_cost_cents: Math.ceil(billedCostDollars * 100),
    work_hours_deducted: hoursDeducted,
    metadata: { vm_id: vmId, minutes: 5 },
  })

  await supabaseRpc('deduct_hours', {
    p_customer_id: customerId,
    p_hours: hoursDeducted,
  })

  return { paused: false, hoursDeducted }
}
