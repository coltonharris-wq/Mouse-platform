/**
 * King Mouse Context Builder
 * Loads per-user context from Supabase and builds dynamic system prompts
 */

import { getSupabaseServer } from './supabase-server';

export interface ChatContext {
  systemPrompt: string;
  conversationHistory: { role: string; content: string }[];
}

const KING_MOUSE_BASE = `You are King Mouse — the AI orchestrator for the Mouse Platform by Automio.

Personality: Friendly, professional, and direct. You speak in plain English — no jargon. You're confident and helpful, like a trusted operations manager.

Platform Facts:
- Mouse Platform = AI Workforce-as-a-Service
- AI employees work at $4.98/hr (vs $35/hr for humans)
- Plans: Pro $97/20hrs, Growth $497/125hrs, Enterprise $997/300hrs
- Top-ups: 10hrs/$49, 25hrs/$97, 50hrs/$147
- FOUNDERS100 promo code: 100% off first month
- 30+ AI employees across 10 categories
- Support: (877) 934-0395

If asked to do something you can't do yet, say it's coming soon and explain what IS available now.`;

/**
 * Build context-aware system prompt + load conversation history
 */
export async function buildChatContext(
  userId: string,
  portal: 'customer' | 'reseller' | 'admin'
): Promise<ChatContext> {
  const supabase = getSupabaseServer();

  let userContext = '';
  let conversationHistory: { role: string; content: string }[] = [];

  if (supabase) {
    // Load conversation history (last 20 messages)
    try {
      const { data: history, error: histError } = await supabase
        .from('conversations')
        .select('role, content')
        .eq('user_id', userId)
        .eq('portal', portal)
        .order('created_at', { ascending: true })
        .limit(20);

      if (!histError && history && history.length > 0) {
        conversationHistory = history.map((m: any) => ({
          role: m.role,
          content: m.content,
        }));
      }
      // If table doesn't exist (PGRST205), silently continue without history
    } catch (e) {
      console.error('[king-mouse-context] Failed to load history:', e);
    }

    // Load user-specific context based on portal type
    if (portal === 'customer') {
      userContext = await buildCustomerContext(supabase, userId);
    } else if (portal === 'reseller') {
      userContext = await buildResellerContext(supabase, userId);
    } else if (portal === 'admin') {
      userContext = await buildAdminContext(supabase);
    }
  }

  const systemPrompt = `${KING_MOUSE_BASE}

${getPortalInstructions(portal)}

${userContext ? `\n--- CURRENT USER CONTEXT ---\n${userContext}` : ''}

Keep responses concise and actionable. When you know specific data about this user, reference it naturally (e.g., "You have 14.2 hours remaining" not "I can check your hours").`;

  return { systemPrompt, conversationHistory };
}

function getPortalInstructions(portal: string): string {
  switch (portal) {
    case 'customer':
      return `You are helping a CUSTOMER manage their AI workforce. You can help them:
- Check their work hours balance and usage
- Manage their AI employees (status, tasks, performance)
- Understand their plan and billing
- Answer questions about what their AI employees can do
- Suggest new AI employees from the marketplace`;

    case 'reseller':
      return `You are helping a RESELLER PARTNER grow their business. You can help them:
- Review their customer portfolio and health
- Strategize sales and lead generation
- Write cold emails, proposals, and follow-ups
- Analyze customer usage and identify upsell opportunities
- Track their commission and revenue
- Research leads and target markets
They set their price ($4.98–$8.98/hr) and keep the margin on all referred customers.`;

    case 'admin':
      return `You are speaking to the PLATFORM ADMIN/CEO. You have full visibility into:
- All customers, resellers, and their data
- Revenue, MRR, costs, and unit economics
- Platform health and usage metrics
- Strategic decisions and priorities
Be direct. Report facts. Suggest actions.`;

    default:
      return '';
  }
}

async function buildCustomerContext(supabase: any, userId: string): Promise<string> {
  const parts: string[] = [];

  try {
    // Customer profile
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .single();

    if (customer) {
      parts.push(`Customer: ${customer.company_name || customer.name || 'Unknown'}`);
      if (customer.email) parts.push(`Email: ${customer.email}`);
      if (customer.plan_tier) parts.push(`Plan: ${customer.plan_tier}`);
      if (customer.work_hours_balance !== undefined) {
        parts.push(`Work Hours Balance: ${Number(customer.work_hours_balance).toFixed(2)} hours`);
      }
      if (customer.work_hours_purchased !== undefined) {
        parts.push(`Total Hours Purchased: ${Number(customer.work_hours_purchased).toFixed(2)} hours`);
      }
      if (customer.work_hours_used !== undefined) {
        parts.push(`Total Hours Used: ${Number(customer.work_hours_used).toFixed(2)} hours`);
      }
    }

    // Hired employees
    const { data: employees } = await supabase
      .from('hired_employees')
      .select('id, employee_type, status, name')
      .eq('customer_id', userId);

    if (employees && employees.length > 0) {
      const active = employees.filter((e: any) => e.status === 'active');
      parts.push(`\nAI Employees: ${employees.length} total (${active.length} active)`);
      employees.forEach((e: any) => {
        parts.push(`  - ${e.name || e.employee_type} [${e.status}]`);
      });
    } else {
      parts.push(`\nAI Employees: None hired yet`);
    }

    // Recent usage events (last 5)
    const { data: recentUsage } = await supabase
      .from('usage_events')
      .select('event_type, work_hours_charged, created_at')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentUsage && recentUsage.length > 0) {
      parts.push(`\nRecent Activity:`);
      recentUsage.forEach((u: any) => {
        const date = new Date(u.created_at).toLocaleDateString();
        parts.push(`  - ${u.event_type}: ${Number(u.work_hours_charged).toFixed(3)} hrs (${date})`);
      });
    }
  } catch (e) {
    console.error('[king-mouse-context] Customer context error:', e);
  }

  return parts.join('\n');
}

async function buildResellerContext(supabase: any, userId: string): Promise<string> {
  const parts: string[] = [];

  try {
    // Reseller profile
    const { data: reseller } = await supabase
      .from('resellers')
      .select('*')
      .eq('id', userId)
      .single();

    if (reseller) {
      parts.push(`Reseller: ${reseller.agency_name || reseller.name || 'Unknown'}`);
      if (reseller.email) parts.push(`Email: ${reseller.email}`);
      if (reseller.commission_rate) parts.push(`Commission Rate: ${reseller.commission_rate}%`);
      if (reseller.total_earned !== undefined) parts.push(`Total Earned: $${Number(reseller.total_earned).toFixed(2)}`);
    }

    // Reseller's customers
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, company_name, plan_tier, work_hours_balance, work_hours_used, created_at')
      .eq('reseller_id', userId);

    if (customers && customers.length > 0) {
      parts.push(`\nYour Customers: ${customers.length}`);
      let totalRevenue = 0;
      customers.forEach((c: any) => {
        const balance = Number(c.work_hours_balance || 0).toFixed(1);
        const used = Number(c.work_hours_used || 0).toFixed(1);
        parts.push(`  - ${c.company_name || c.name}: ${c.plan_tier || 'free'} plan, ${balance}hrs remaining, ${used}hrs used`);
      });

      // Health indicators
      const lowBalance = customers.filter((c: any) => (c.work_hours_balance || 0) < 5);
      if (lowBalance.length > 0) {
        parts.push(`\n⚠️ Low Balance Alert: ${lowBalance.length} customer(s) under 5 hours`);
        lowBalance.forEach((c: any) => {
          parts.push(`  - ${c.company_name || c.name}: ${Number(c.work_hours_balance || 0).toFixed(1)} hrs left`);
        });
      }
    } else {
      parts.push(`\nYour Customers: None yet`);
    }
  } catch (e) {
    console.error('[king-mouse-context] Reseller context error:', e);
  }

  return parts.join('\n');
}

async function buildAdminContext(supabase: any): Promise<string> {
  const parts: string[] = [];

  try {
    // Aggregate stats
    const [customersRes, resellersRes, employeesRes, usageRes] = await Promise.all([
      supabase.from('customers').select('id, name, company_name, plan_tier, work_hours_balance, work_hours_used, work_hours_purchased, created_at'),
      supabase.from('resellers').select('id, name, agency_name, total_earned'),
      supabase.from('hired_employees').select('id, status, employee_type'),
      supabase.from('usage_events').select('event_type, work_hours_charged, vendor_cost, created_at').order('created_at', { ascending: false }).limit(50),
    ]);

    const customers = customersRes.data || [];
    const resellers = resellersRes.data || [];
    const employees = employeesRes.data || [];
    const usage = usageRes.data || [];

    // Customer stats
    parts.push(`Total Customers: ${customers.length}`);
    const planDist = customers.reduce((acc: any, c: any) => {
      acc[c.plan_tier || 'free'] = (acc[c.plan_tier || 'free'] || 0) + 1;
      return acc;
    }, {});
    parts.push(`Plan Distribution: ${Object.entries(planDist).map(([k, v]) => `${k}: ${v}`).join(', ')}`);

    const totalPurchased = customers.reduce((s: number, c: any) => s + (c.work_hours_purchased || 0), 0);
    const totalUsed = customers.reduce((s: number, c: any) => s + (c.work_hours_used || 0), 0);
    const totalBalance = customers.reduce((s: number, c: any) => s + (c.work_hours_balance || 0), 0);
    parts.push(`Total Hours Purchased: ${totalPurchased.toFixed(1)}`);
    parts.push(`Total Hours Used: ${totalUsed.toFixed(1)}`);
    parts.push(`Total Hours Remaining: ${totalBalance.toFixed(1)}`);

    // Revenue estimate
    const estimatedMRR = customers.reduce((s: number, c: any) => {
      const planPrices: any = { pro: 97, growth: 497, enterprise: 997 };
      return s + (planPrices[c.plan_tier] || 0);
    }, 0);
    parts.push(`Estimated MRR: $${estimatedMRR.toLocaleString()}`);

    // Reseller stats
    parts.push(`\nTotal Resellers: ${resellers.length}`);
    const totalCommissions = resellers.reduce((s: number, r: any) => s + (r.total_earned || 0), 0);
    parts.push(`Total Commissions Paid: $${totalCommissions.toFixed(2)}`);

    // Employee stats
    parts.push(`\nTotal AI Employees Deployed: ${employees.length}`);
    const activeEmps = employees.filter((e: any) => e.status === 'active');
    parts.push(`Active: ${activeEmps.length}`);
    const empTypes = employees.reduce((acc: any, e: any) => {
      acc[e.employee_type || 'unknown'] = (acc[e.employee_type || 'unknown'] || 0) + 1;
      return acc;
    }, {});
    parts.push(`By Type: ${Object.entries(empTypes).map(([k, v]) => `${k}: ${v}`).join(', ')}`);

    // Recent usage cost
    const totalVendorCost = usage.reduce((s: number, u: any) => s + (u.vendor_cost || 0), 0);
    parts.push(`\nRecent Vendor Cost (last 50 events): $${totalVendorCost.toFixed(4)}`);
  } catch (e) {
    console.error('[king-mouse-context] Admin context error:', e);
  }

  return parts.join('\n');
}

/**
 * Store a message in the conversations table
 */
export async function storeMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  portal: 'customer' | 'reseller' | 'admin'
): Promise<void> {
  const supabase = getSupabaseServer();
  if (!supabase) return;

  try {
    await supabase.from('conversations').insert({
      user_id: userId,
      role,
      content,
      portal,
    });
  } catch (e) {
    console.error('[king-mouse-context] Failed to store message:', e);
  }
}

/**
 * Get conversation history for a user
 */
export async function getConversationHistory(
  userId: string,
  portal: 'customer' | 'reseller' | 'admin',
  limit: number = 20
): Promise<{ role: string; content: string; created_at: string }[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from('conversations')
      .select('role, content, created_at')
      .eq('user_id', userId)
      .eq('portal', portal)
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data || []).reverse();
  } catch {
    return [];
  }
}
