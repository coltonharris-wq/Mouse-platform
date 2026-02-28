'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface WorkHoursTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund';
  amount: number;
  description: string;
  timestamp: Date;
  employeeName?: string;
}

export interface WorkHoursState {
  balance: number;
  totalUsed: number;
  totalPurchased: number;
  transactions: WorkHoursTransaction[];
}

interface WorkHoursContextType extends WorkHoursState {
  purchaseHours: (amount: number, cost: number) => void;
  useHours: (amount: number, description: string, employeeName?: string) => boolean;
  getHourlyRate: () => number;
  getCostBreakdown: () => { deployment: number; runtime: number; messaging: number; api: number };
}

const WORK_HOURS_COSTS = {
  messageKingMouse: 0.1,
  deployAiEmployee: 1,
  vmRuntime1h: 1,
  processEmail: 0.05,
  apiCall: 0.01,
};

const WorkHoursContext = createContext<WorkHoursContextType | undefined>(undefined);

export function WorkHoursProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkHoursState>({
    balance: 45.5,
    totalUsed: 12.5,
    totalPurchased: 58,
    transactions: [
      { id: '1', type: 'purchase', amount: 50, description: 'Purchased 50 hours', timestamp: new Date(Date.now() - 86400000 * 7) },
      { id: '2', type: 'usage', amount: -2.5, description: 'VM Runtime', timestamp: new Date(Date.now() - 86400000), employeeName: 'Sales Assistant' },
      { id: '3', type: 'usage', amount: -0.5, description: 'Message King Mouse', timestamp: new Date(Date.now() - 3600000 * 4) },
      { id: '4', type: 'usage', amount: -8, description: 'AI Employee Tasks', timestamp: new Date(Date.now() - 86400000), employeeName: 'Support Bot' },
      { id: '5', type: 'usage', amount: -1.5, description: 'API Calls', timestamp: new Date(Date.now() - 1800000) },
    ],
  });

  const purchaseHours = (amount: number, cost: number) => {
    const transaction: WorkHoursTransaction = {
      id: Date.now().toString(),
      type: 'purchase',
      amount,
      description: `Purchased ${amount} hours for $${cost}`,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      balance: prev.balance + amount,
      totalPurchased: prev.totalPurchased + amount,
      transactions: [transaction, ...prev.transactions],
    }));
  };

  const useHours = (amount: number, description: string, employeeName?: string): boolean => {
    if (state.balance < amount) {
      return false;
    }

    const transaction: WorkHoursTransaction = {
      id: Date.now().toString(),
      type: 'usage',
      amount: -amount,
      description,
      timestamp: new Date(),
      employeeName,
    };

    setState(prev => ({
      ...prev,
      balance: prev.balance - amount,
      totalUsed: prev.totalUsed + amount,
      transactions: [transaction, ...prev.transactions],
    }));

    return true;
  };

  const getHourlyRate = () => {
    return 2.5; // $2.50 per hour
  };

  const getCostBreakdown = () => ({
    deployment: WORK_HOURS_COSTS.deployAiEmployee,
    runtime: WORK_HOURS_COSTS.vmRuntime1h,
    messaging: WORK_HOURS_COSTS.messageKingMouse,
    api: WORK_HOURS_COSTS.apiCall,
  });

  return (
    <WorkHoursContext.Provider value={{
      ...state,
      purchaseHours,
      useHours,
      getHourlyRate,
      getCostBreakdown,
    }}>
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

export { WORK_HOURS_COSTS };
