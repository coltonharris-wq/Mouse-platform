// API Usage Monitoring Types and Utilities

export type ApiProvider = 'anthropic' | 'moonshot' | 'openai' | 'orgo';

export interface ApiUsageRecord {
  id: string;
  provider: ApiProvider;
  endpoint: string;
  tokensUsed: number;
  costUsd: number;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface ApiBudget {
  provider: ApiProvider;
  monthlyBudget: number;
  currentSpend: number;
  alertThreshold: number; // 0-1 (e.g., 0.8 = 80%)
  autoRefill: boolean;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
}

export interface FailoverConfig {
  primary: ApiProvider;
  fallbackChain: ApiProvider[];
  enabled: boolean;
}

export interface UsageAlert {
  id: string;
  provider: ApiProvider;
  type: 'budget' | 'error_rate' | 'quota';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface DailyUsage {
  date: string;
  provider: ApiProvider;
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  failedCalls: number;
}

// Budget configuration
export const DEFAULT_BUDGETS: ApiBudget[] = [
  {
    provider: 'anthropic',
    monthlyBudget: 1000,
    currentSpend: 0,
    alertThreshold: 0.8,
    autoRefill: false,
  },
  {
    provider: 'moonshot',
    monthlyBudget: 500,
    currentSpend: 0,
    alertThreshold: 0.8,
    autoRefill: false,
  },
  {
    provider: 'openai',
    monthlyBudget: 500,
    currentSpend: 0,
    alertThreshold: 0.8,
    autoRefill: false,
  },
  {
    provider: 'orgo',
    monthlyBudget: 200,
    currentSpend: 0,
    alertThreshold: 0.8,
    autoRefill: false,
  },
];

// Failover configuration
export const DEFAULT_FAILOVER: FailoverConfig = {
  primary: 'anthropic',
  fallbackChain: ['moonshot', 'openai'],
  enabled: true,
};

// Pricing per 1K tokens (approximate)
export const API_PRICING: Record<ApiProvider, { input: number; output: number }> = {
  anthropic: { input: 0.003, output: 0.015 },
  moonshot: { input: 0.002, output: 0.008 },
  openai: { input: 0.005, output: 0.015 },
  orgo: { input: 0, output: 0 }, // Orgo is VM-based, not token-based
};

// Orgo VM configuration
export interface OrgoConfig {
  maxVMs: number;
  activeVMs: number;
  queuedTasks: number;
  vms: OrgoVM[];
}

export interface OrgoVM {
  id: string;
  status: 'running' | 'stopped' | 'error';
  url?: string;
  createdAt: Date;
  lastUsedAt: Date;
  taskCount: number;
}

// Mock data for demonstration
export const generateMockUsageData = (): ApiUsageRecord[] => {
  const records: ApiUsageRecord[] = [];
  const providers: ApiProvider[] = ['anthropic', 'moonshot', 'openai', 'orgo'];
  const endpoints = {
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    moonshot: ['moonshot-v1-128k', 'moonshot-v1-32k', 'moonshot-v1-8k'],
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    orgo: ['vm-create', 'vm-execute', 'vm-destroy'],
  };

  // Generate last 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    providers.forEach(provider => {
      const dailyCalls = Math.floor(Math.random() * 100) + 10;
      
      for (let j = 0; j < dailyCalls; j++) {
        const timestamp = new Date(date);
        timestamp.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        const tokensUsed = provider === 'orgo' 
          ? Math.floor(Math.random() * 60) + 5 // VM minutes
          : Math.floor(Math.random() * 5000) + 500;
        
        const costUsd = provider === 'orgo'
          ? tokensUsed * 0.05 // $0.05 per minute
          : (tokensUsed / 1000) * ((API_PRICING[provider].input + API_PRICING[provider].output) / 2);
        
        records.push({
          id: `usage-${provider}-${i}-${j}`,
          provider,
          endpoint: endpoints[provider][Math.floor(Math.random() * endpoints[provider].length)],
          tokensUsed,
          costUsd: Number(costUsd.toFixed(4)),
          timestamp,
          success: Math.random() > 0.05, // 95% success rate
        });
      }
    });
  }

  return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const generateMockDailyUsage = (): DailyUsage[] => {
  const daily: DailyUsage[] = [];
  const providers: ApiProvider[] = ['anthropic', 'moonshot', 'openai', 'orgo'];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    providers.forEach(provider => {
      const totalCalls = Math.floor(Math.random() * 100) + 20;
      const failedCalls = Math.floor(totalCalls * (Math.random() * 0.1));
      
      daily.push({
        date: dateStr,
        provider,
        totalCalls,
        totalTokens: provider === 'orgo' 
          ? Math.floor(Math.random() * 3600) + 300
          : Math.floor(Math.random() * 500000) + 50000,
        totalCost: provider === 'orgo'
          ? Number((Math.random() * 50 + 10).toFixed(2))
          : Number((Math.random() * 100 + 20).toFixed(2)),
        failedCalls,
      });
    });
  }
  
  return daily;
};

export const generateMockOrgoConfig = (): OrgoConfig => ({
  maxVMs: 8,
  activeVMs: 6,
  queuedTasks: 3,
  vms: [
    { id: 'vm-001', status: 'running', url: 'https://orgo-computer-puxot5i8.orgo.dev', createdAt: new Date('2024-06-19'), lastUsedAt: new Date(), taskCount: 45 },
    { id: 'vm-002', status: 'running', url: 'https://orgo-computer-p5uod1ze.orgo.dev', createdAt: new Date('2024-06-19'), lastUsedAt: new Date(), taskCount: 38 },
    { id: 'vm-003', status: 'running', url: 'https://orgo-computer-p328rz68.orgo.dev', createdAt: new Date('2024-06-19'), lastUsedAt: new Date(), taskCount: 52 },
    { id: 'vm-004', status: 'running', url: 'https://orgo-6c9101fa-c983-4fbb-b757-4f0fa91b2ece.orgo.dev', createdAt: new Date('2024-06-19'), lastUsedAt: new Date(), taskCount: 29 },
    { id: 'vm-005', status: 'running', url: 'https://orgo-6e4627e5-79af-4ca1-a98e-154142058708.orgo.dev', createdAt: new Date('2024-06-19'), lastUsedAt: new Date(), taskCount: 41 },
    { id: 'vm-006', status: 'running', url: 'https://orgo-43a1b334-91e9-4a9b-951f-2b8e67b35c1e.orgo.dev', createdAt: new Date('2024-06-19'), lastUsedAt: new Date(), taskCount: 35 },
    { id: 'vm-007', status: 'stopped', createdAt: new Date('2024-06-18'), lastUsedAt: new Date('2024-06-19'), taskCount: 12 },
    { id: 'vm-008', status: 'stopped', createdAt: new Date('2024-06-18'), lastUsedAt: new Date('2024-06-19'), taskCount: 8 },
  ],
});

export const generateMockAlerts = (): UsageAlert[] => [
  {
    id: 'alert-001',
    provider: 'anthropic',
    type: 'budget',
    severity: 'warning',
    message: 'Approaching 80% of monthly budget ($800 / $1000)',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    acknowledged: false,
  },
  {
    id: 'alert-002',
    provider: 'moonshot',
    type: 'error_rate',
    severity: 'warning',
    message: 'Error rate elevated: 8% in last hour (threshold: 5%)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    acknowledged: true,
  },
];

// Utility functions
export const calculateProjectedRunout = (
  currentSpend: number,
  budget: number,
  daysIntoMonth: number
): number | null => {
  if (currentSpend === 0 || daysIntoMonth === 0) return null;
  
  const dailyRate = currentSpend / daysIntoMonth;
  const daysRemaining = (budget - currentSpend) / dailyRate;
  
  return Math.ceil(daysRemaining);
};

export const getUsagePercentage = (current: number, budget: number): number => {
  return Math.min(100, Math.round((current / budget) * 100));
};

export const getStatusColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-mouse-red';
  if (percentage >= 80) return 'text-mouse-orange';
  if (percentage >= 60) return 'text-yellow-500';
  return 'text-mouse-green';
};

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-mouse-red';
  if (percentage >= 80) return 'bg-mouse-orange';
  if (percentage >= 60) return 'bg-yellow-500';
  return 'bg-mouse-green';
};
