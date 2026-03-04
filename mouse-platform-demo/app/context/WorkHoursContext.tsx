'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  FeatureType,
  CostCalculation,
  calculateCost,
  calculateTextChatCost,
  calculateVoiceChatCost,
  calculateImageGenerationCost,
  calculateVideoGenerationCost,
  calculateScreenRecordingCost,
  calculateApiCallCost,
  formatWorkHoursCost,
  formatCostTooltip,
  UsageBreakdown,
  EMPTY_USAGE_BREAKDOWN,
  formatUsageBreakdown,
  calculateTotalWorkHours,
  getFeatureDisplayName,
  HOURLY_RATE,
  HUMAN_HOURLY_RATE,
  calculateSavings,
} from '@/lib/work-hours-costs';

// Transaction type now includes feature tracking
export interface WorkHoursTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund';
  amount: number; // Positive for purchase, negative for usage
  featureType?: FeatureType;
  description: string;
  timestamp: Date;
  employeeName?: string;
  metadata?: Record<string, any>;
}

export interface WorkHoursState {
  balance: number;
  totalUsed: number;
  totalPurchased: number;
  transactions: WorkHoursTransaction[];
  usageBreakdown: UsageBreakdown;
}

// Enhanced context with tiered pricing functions
interface WorkHoursContextType extends WorkHoursState {
  // Core functions
  purchaseHours: (hours: number, cost: number) => void;
  useHours: (hours: number, description: string, employeeName?: string) => boolean;
  getHourlyRate: () => number;
  getHumanHourlyRate: () => number;
  getSavings: (hours: number) => number;
  getSavingsPercent: () => number;
  
  // New tiered pricing functions
  calculateFeatureCost: (featureType: FeatureType, units: number) => CostCalculation;
  useFeature: (featureType: FeatureType, units: number, description: string, metadata?: Record<string, any>) => { success: boolean; calculation: CostCalculation };
  previewCost: (featureType: FeatureType, units?: number) => CostCalculation;
  getCostTooltip: (featureType: FeatureType, units?: number) => string;
  formatWorkHours: (hours: number) => string;
  getFeatureBreakdown: () => { feature: FeatureType; hours: number; displayName: string }[];
  getFormattedBreakdown: () => string;
  
  // Balance warnings
  isLowBalance: () => boolean;
  getBalanceStatus: () => 'healthy' | 'warning' | 'critical';
}

const WorkHoursContext = createContext<WorkHoursContextType | undefined>(undefined);

// Mock initial data with usage breakdown
const INITIAL_STATE: WorkHoursState = {
  balance: 47.5,
  totalUsed: 22.5,
  totalPurchased: 70,
  transactions: [
    { id: '1', type: 'purchase', amount: 70, description: 'Growth Plan - 70 hours', timestamp: new Date(Date.now() - 86400000 * 30) },
    { id: '2', type: 'usage', amount: -5.2, featureType: 'vm_runtime', description: 'VM Runtime - Sales Assistant', timestamp: new Date(Date.now() - 86400000), employeeName: 'Sales Assistant' },
    { id: '3', type: 'usage', amount: -2.1, featureType: 'voice_chat', description: 'Voice Chat Session', timestamp: new Date(Date.now() - 3600000 * 4) },
    { id: '4', type: 'usage', amount: -8.5, featureType: 'text_chat', description: 'Text Chat - Multiple Sessions', timestamp: new Date(Date.now() - 86400000 * 2) },
    { id: '5', type: 'usage', amount: -1.5, featureType: 'image_generation', description: 'Generated 3 images', timestamp: new Date(Date.now() - 1800000) },
    { id: '6', type: 'usage', amount: -4.0, featureType: 'api_call', description: 'API Calls (400 calls)', timestamp: new Date(Date.now() - 3600000) },
  ],
  usageBreakdown: {
    text_chat: 8.5,
    voice_chat: 2.1,
    image_generation: 1.5,
    video_generation: 0,
    screen_recording: 0,
    api_call: 4.0,
    employee_deployment: 1.2,
    vm_runtime: 5.2,
  },
};

// Low balance threshold (10 hours)
const LOW_BALANCE_THRESHOLD = 10;
const CRITICAL_BALANCE_THRESHOLD = 5;

export function WorkHoursProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkHoursState>(INITIAL_STATE);

  // Fetch real balance from backend on mount
  useEffect(() => {
    async function loadWorkHours() {
      try {
        const session = localStorage.getItem('mouse_session');
        const userId = session ? JSON.parse(session).userId : null;
        if (!userId) return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const [statusRes, historyRes] = await Promise.allSettled([
          fetch(`${API_URL}/work-hours/status/${userId}`),
          fetch(`${API_URL}/work-hours/usage-history/${userId}`),
        ]);

        if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
          const statusData = await statusRes.value.json();
          setState(prev => ({
            ...prev,
            balance: statusData.remaining_hours ?? statusData.balance ?? prev.balance,
            totalUsed: statusData.used_hours ?? statusData.total_used ?? prev.totalUsed,
            totalPurchased: statusData.total_hours ?? statusData.total_purchased ?? prev.totalPurchased,
          }));
        }

        if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
          const historyData = await historyRes.value.json();
          if (historyData.usage_history && Array.isArray(historyData.usage_history)) {
            const transactions: WorkHoursTransaction[] = historyData.usage_history.map((h: any) => ({
              id: h.id || `tx-${Date.now()}-${Math.random()}`,
              type: h.type || 'usage',
              amount: h.hours || h.amount || 0,
              featureType: h.feature_type as FeatureType,
              description: h.description || '',
              timestamp: new Date(h.created_at || h.timestamp || Date.now()),
              employeeName: h.employee_name,
            }));
            setState(prev => ({ ...prev, transactions: transactions.length > 0 ? transactions : prev.transactions }));
          }
        }
      } catch (err) {
        console.log('[WorkHoursContext] Backend fetch failed, using defaults');
      }
    }
    loadWorkHours();
  }, []);

  // Purchase additional hours
  const purchaseHours = useCallback((hours: number, cost: number) => {
    const transaction: WorkHoursTransaction = {
      id: Date.now().toString(),
      type: 'purchase',
      amount: hours,
      description: `Purchased ${hours} hours for $${cost.toFixed(2)}`,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      balance: prev.balance + hours,
      totalPurchased: prev.totalPurchased + hours,
      transactions: [transaction, ...prev.transactions],
    }));
  }, []);

  // Legacy useHours - maintains backward compatibility
  const useHours = useCallback((hours: number, description: string, employeeName?: string): boolean => {
    if (state.balance < hours) {
      return false;
    }

    const transaction: WorkHoursTransaction = {
      id: Date.now().toString(),
      type: 'usage',
      amount: -hours,
      description,
      timestamp: new Date(),
      employeeName,
    };

    setState(prev => ({
      ...prev,
      balance: prev.balance - hours,
      totalUsed: prev.totalUsed + hours,
      transactions: [transaction, ...prev.transactions],
    }));

    return true;
  }, [state.balance]);

  // Get hourly rate for purchasing ($4.98/hour)
  const getHourlyRate = useCallback(() => {
    return HOURLY_RATE;
  }, []);

  // Get human employee hourly rate for comparison ($35/hour)
  const getHumanHourlyRate = useCallback(() => {
    return HUMAN_HOURLY_RATE;
  }, []);

  // Calculate savings vs human employee
  const getSavings = useCallback((hours: number) => {
    return calculateSavings(hours);
  }, []);

  // Get savings percentage
  const getSavingsPercent = useCallback(() => {
    return Math.round(((HUMAN_HOURLY_RATE - HOURLY_RATE) / HUMAN_HOURLY_RATE) * 100);
  }, []);

  // Calculate feature cost without deducting
  const calculateFeatureCost = useCallback((featureType: FeatureType, units: number): CostCalculation => {
    return calculateCost(featureType, units, state.balance);
  }, [state.balance]);

  // Preview cost with default units of 1
  const previewCost = useCallback((featureType: FeatureType, units: number = 1): CostCalculation => {
    return calculateFeatureCost(featureType, units);
  }, [calculateFeatureCost]);

  // Use a feature with tiered pricing
  const useFeature = useCallback((
    featureType: FeatureType,
    units: number,
    description: string,
    metadata?: Record<string, any>
  ): { success: boolean; calculation: CostCalculation } => {
    const calculation = calculateFeatureCost(featureType, units);
    
    if (!calculation.canAfford) {
      return { success: false, calculation };
    }

    const transaction: WorkHoursTransaction = {
      id: Date.now().toString(),
      type: 'usage',
      amount: -calculation.workHoursRequired,
      featureType,
      description,
      timestamp: new Date(),
      metadata,
    };

    setState(prev => ({
      ...prev,
      balance: calculation.balanceAfter,
      totalUsed: prev.totalUsed + calculation.workHoursRequired,
      transactions: [transaction, ...prev.transactions],
      usageBreakdown: {
        ...prev.usageBreakdown,
        [featureType]: prev.usageBreakdown[featureType] + calculation.workHoursRequired,
      },
    }));

    return { success: true, calculation };
  }, [calculateFeatureCost]);

  // Get cost tooltip
  const getCostTooltip = useCallback((featureType: FeatureType, units?: number): string => {
    return formatCostTooltip(featureType, units);
  }, []);

  // Format work hours for display
  const formatWorkHours = useCallback((hours: number): string => {
    return formatWorkHoursCost(hours);
  }, []);

  // Get feature breakdown for display
  const getFeatureBreakdown = useCallback((): { feature: FeatureType; hours: number; displayName: string }[] => {
    return (Object.entries(state.usageBreakdown) as [FeatureType, number][])
      .filter(([, hours]) => hours > 0)
      .map(([feature, hours]) => ({
        feature,
        hours,
        displayName: getFeatureDisplayName(feature),
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [state.usageBreakdown]);

  // Get formatted breakdown string
  const getFormattedBreakdown = useCallback((): string => {
    return formatUsageBreakdown(state.usageBreakdown);
  }, [state.usageBreakdown]);

  // Check if balance is low
  const isLowBalance = useCallback((): boolean => {
    return state.balance < LOW_BALANCE_THRESHOLD;
  }, [state.balance]);

  // Get balance status
  const getBalanceStatus = useCallback((): 'healthy' | 'warning' | 'critical' => {
    if (state.balance < CRITICAL_BALANCE_THRESHOLD) return 'critical';
    if (state.balance < LOW_BALANCE_THRESHOLD) return 'warning';
    return 'healthy';
  }, [state.balance]);

  const contextValue: WorkHoursContextType = {
    ...state,
    purchaseHours,
    useHours,
    getHourlyRate,
    getHumanHourlyRate,
    getSavings,
    getSavingsPercent,
    calculateFeatureCost,
    useFeature,
    previewCost,
    getCostTooltip,
    formatWorkHours,
    getFeatureBreakdown,
    getFormattedBreakdown,
    isLowBalance,
    getBalanceStatus,
  };

  return (
    <WorkHoursContext.Provider value={contextValue}>
      {children}
    </WorkHoursContext.Provider>
  );
}

export function useWorkHours() {
  const context = useContext(WorkHoursContext);
  if (context === undefined) {
    throw new Error('useWorkHours must be used within a WorkHoursProvider');
  }
  return context;
}

// Re-export from work-hours-costs
export {
  // Types
  type FeatureType,
  type CostCalculation,
  type UsageBreakdown,
  
  // Constants
  PRICING_TIERS,
  HOURLY_RATE,
  HUMAN_HOURLY_RATE,
  WORK_HOURS_COSTS,
  
  // Functions
  calculateCost,
  calculateTextChatCost,
  calculateVoiceChatCost,
  calculateImageGenerationCost,
  calculateVideoGenerationCost,
  calculateScreenRecordingCost,
  calculateApiCallCost,
  formatWorkHoursCost,
  formatCostTooltip,
  getFeatureDisplayName,
  formatUsageBreakdown,
  calculateTotalWorkHours,
  EMPTY_USAGE_BREAKDOWN,
} from '@/lib/work-hours-costs';
