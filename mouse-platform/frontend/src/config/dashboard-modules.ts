// src/config/dashboard-modules.ts
// Dashboard module registry — streamlined for Manus-style chat UI

export interface DashboardModule {
  slug: string;
  name: string;
  icon: string;           // Lucide icon name
  route: string;
  description: string;
}

// Core modules — sidebar nav items
export const DASHBOARD_MODULES: Record<string, DashboardModule> = {
  receptionist: {
    slug: 'receptionist',
    name: 'AI Receptionist',
    icon: 'Phone',
    route: '/dashboard/receptionist',
    description: 'AI-powered call handling with your own number'
  },
  activity_log: {
    slug: 'activity_log',
    name: 'Activity Log',
    icon: 'History',
    route: '/dashboard/activity',
    description: 'Everything KingMouse has done'
  },
  billing: {
    slug: 'billing',
    name: 'Billing & Hours',
    icon: 'Clock',
    route: '/dashboard/billing',
    description: 'Work hours used and subscription status'
  },
  settings: {
    slug: 'settings',
    name: 'Settings',
    icon: 'Settings',
    route: '/dashboard/settings',
    description: 'Account settings'
  },
};

// Resolve which modules a customer sees
export function getModulesForPro(dashboardModuleSlugs: string[]): DashboardModule[] {
  return dashboardModuleSlugs
    .map(slug => DASHBOARD_MODULES[slug])
    .filter(Boolean);
}
