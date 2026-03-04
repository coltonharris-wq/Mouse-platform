import { NextResponse } from 'next/server';
import {
  generateMockUsageData,
  generateMockDailyUsage,
  generateMockOrgoConfig,
  generateMockAlerts,
  DEFAULT_BUDGETS,
  type ApiProvider,
  type ApiBudget,
} from '@/lib/api-usage';

// In-memory store (in production, use database)
let usageRecords = generateMockUsageData();
let dailyUsage = generateMockDailyUsage();
let orgoConfig = generateMockOrgoConfig();
let alerts = generateMockAlerts();
let budgets = [...DEFAULT_BUDGETS];

// GET /api/usage - Get current usage summary
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'summary') {
    return getUsageSummary();
  }

  if (type === 'daily') {
    const provider = searchParams.get('provider') as ApiProvider | null;
    const days = parseInt(searchParams.get('days') || '30');
    return getDailyUsage(provider, days);
  }

  if (type === 'alerts') {
    return getAlerts();
  }

  if (type === 'orgo') {
    return getOrgoStatus();
  }

  if (type === 'budgets') {
    return getBudgets();
  }

  // Default: return all usage data
  return NextResponse.json({
    records: usageRecords.slice(0, 100),
    daily: dailyUsage,
    alerts,
    budgets,
    orgo: orgoConfig,
  });
}

function getUsageSummary() {
  const now = new Date();
  const daysIntoMonth = now.getDate();
  
  // Calculate current month spend per provider
  const currentMonthSpend: Record<ApiProvider, number> = {
    anthropic: 0,
    moonshot: 0,
    openai: 0,
    orgo: 0,
  };

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  usageRecords.forEach(record => {
    if (record.timestamp >= currentMonthStart) {
      currentMonthSpend[record.provider] += record.costUsd;
    }
  });

  // Update budgets with current spend
  const updatedBudgets = budgets.map(budget => ({
    ...budget,
    currentSpend: Number(currentMonthSpend[budget.provider].toFixed(2)),
  }));

  // Calculate totals
  const totalSpend = Object.values(currentMonthSpend).reduce((a, b) => a + b, 0);
  const totalBudget = budgets.reduce((a, b) => a + b.monthlyBudget, 0);

  // Calculate projections
  const projections: Record<ApiProvider, number | null> = {
    anthropic: null,
    moonshot: null,
    openai: null,
    orgo: null,
  };

  Object.keys(currentMonthSpend).forEach(provider => {
    const p = provider as ApiProvider;
    const budget = budgets.find(b => b.provider === p);
    if (budget) {
      const projectedDays = calculateProjectedRunout(
        currentMonthSpend[p],
        budget.monthlyBudget,
        daysIntoMonth
      );
      projections[p] = projectedDays;
    }
  });

  return NextResponse.json({
    currentMonthSpend,
    totalSpend: Number(totalSpend.toFixed(2)),
    totalBudget,
    daysIntoMonth,
    budgets: updatedBudgets,
    projections,
    usagePercentage: Math.round((totalSpend / totalBudget) * 100),
  });
}

function getDailyUsage(provider: ApiProvider | null, days: number) {
  let filtered = dailyUsage;
  
  if (provider) {
    filtered = dailyUsage.filter(d => d.provider === provider);
  }

  // Get last N days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  filtered = filtered.filter(d => new Date(d.date) >= cutoff);

  return NextResponse.json({ daily: filtered });
}

function getAlerts() {
  return NextResponse.json({ alerts });
}

function getOrgoStatus() {
  return NextResponse.json({ orgo: orgoConfig });
}

function getBudgets() {
  return NextResponse.json({ budgets });
}

function calculateProjectedRunout(
  currentSpend: number,
  budget: number,
  daysIntoMonth: number
): number | null {
  if (currentSpend === 0 || daysIntoMonth === 0) return null;
  
  const dailyRate = currentSpend / daysIntoMonth;
  const daysRemaining = (budget - currentSpend) / dailyRate;
  
  return Math.ceil(daysRemaining);
}

// POST /api/usage - Record new usage
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newRecord = {
      id: `usage-${Date.now()}`,
      provider: body.provider,
      endpoint: body.endpoint,
      tokensUsed: body.tokensUsed || 0,
      costUsd: body.costUsd || 0,
      timestamp: new Date(),
      success: body.success ?? true,
      errorMessage: body.errorMessage,
      metadata: body.metadata,
    };

    usageRecords.unshift(newRecord);

    // Check for alerts
    const budget = budgets.find(b => b.provider === body.provider);
    if (budget) {
      const currentSpend = usageRecords
        .filter(r => 
          r.provider === body.provider && 
          r.timestamp.getMonth() === new Date().getMonth()
        )
        .reduce((sum, r) => sum + r.costUsd, 0);
      
      const percentage = currentSpend / budget.monthlyBudget;
      
      if (percentage >= budget.alertThreshold && percentage < 1) {
        // Create alert if not already exists
        const existingAlert = alerts.find(
          a => a.provider === body.provider && 
               a.type === 'budget' && 
               !a.acknowledged
        );
        
        if (!existingAlert) {
          alerts.unshift({
            id: `alert-${Date.now()}`,
            provider: body.provider,
            type: 'budget',
            severity: percentage >= 0.9 ? 'critical' : 'warning',
            message: `Budget at ${Math.round(percentage * 100)}% ($${currentSpend.toFixed(2)} / $${budget.monthlyBudget})`,
            timestamp: new Date(),
            acknowledged: false,
          });
        }
      }
    }

    return NextResponse.json({ success: true, record: newRecord });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// PATCH /api/usage - Update budgets or acknowledge alerts
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'updateBudget') {
      const { provider, updates } = body;
      const index = budgets.findIndex(b => b.provider === provider);
      
      if (index !== -1) {
        budgets[index] = { ...budgets[index], ...updates };
        return NextResponse.json({ success: true, budget: budgets[index] });
      }
      
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    if (action === 'acknowledgeAlert') {
      const { alertId } = body;
      const alert = alerts.find(a => a.id === alertId);
      
      if (alert) {
        alert.acknowledged = true;
        return NextResponse.json({ success: true, alert });
      }
      
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    if (action === 'autoRefill') {
      // Simulate auto-refill
      return NextResponse.json({ 
        success: true, 
        message: 'Auto-refill triggered successfully' 
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
