import { supabaseQuery } from './supabase-server'

// Cache customer data in memory (per-request in serverless, but still useful)
const customerCache = new Map<string, { data: any; ts: number }>()

async function getCustomer(customerId: string) {
  const cached = customerCache.get(customerId)
  if (cached && Date.now() - cached.ts < 60_000) return cached.data

  const rows = await supabaseQuery(
    'customers',
    'GET',
    undefined,
    `id=eq.${customerId}&select=*`
  )
  const customer = rows?.[0]
  if (customer) {
    customerCache.set(customerId, { data: customer, ts: Date.now() })
  }
  return customer
}

export async function sendToKingMouse(customerId: string, message: string) {
  const customer = await getCustomer(customerId)
  if (!customer) throw new Error('Customer not found')

  if (
    customer.mousecore_endpoint &&
    customer.mousecore_endpoint !== 'API_FALLBACK'
  ) {
    // Route to their personal King Mouse VM
    const response = await fetch(
      `${customer.mousecore_endpoint}/api/chat`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${customer.gateway_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      }
    )
    return response.json()
  } else {
    // Fallback: direct Moonshot API call
    const response = await fetch(
      'https://api.moonshot.ai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.MOONSHOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'kimi-k2.5',
          messages: [
            {
              role: 'system',
              content: `You are King Mouse, an AI operations manager for ${customer.company_name} in the ${customer.industry} industry. The owner's name is ${customer.name}. Their needs include: ${JSON.stringify(customer.needs || [])}. ${customer.custom_instructions || ''}`,
            },
            { role: 'user', content: message },
          ],
        }),
      }
    )
    const data = await response.json()
    return {
      response: data.choices?.[0]?.message?.content || 'Sorry, I could not process that.',
      usage: data.usage
        ? {
            input_tokens: data.usage.prompt_tokens,
            output_tokens: data.usage.completion_tokens,
          }
        : undefined,
    }
  }
}
