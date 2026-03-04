'use client';

import { ReactNode } from 'react';
import { WorkHoursProvider } from './context/WorkHoursContext';
import { SecurityProvider } from './context/SecurityContext';
import { EmployeeProvider } from './context/EmployeeContext';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <WorkHoursProvider>
      <SecurityProvider>
        <EmployeeProvider>
          {children}
        </EmployeeProvider>
      </SecurityProvider>
    </WorkHoursProvider>
  );
}
