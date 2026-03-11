// src/config/dashboard-modules.ts

export interface DashboardModule {
  slug: string;
  name: string;
  icon: string;           // Lucide icon name
  component: string;      // React component path
  route: string;          // Dashboard sub-route
  description: string;
}

// Master registry — all possible modules
export const DASHBOARD_MODULES: Record<string, DashboardModule> = {
  chat: {
    slug: 'chat',
    name: 'Chat with KingMouse',
    icon: 'MessageSquare',
    component: 'ChatModule',
    route: '/dashboard/chat',
    description: 'Talk to your AI employee'
  },
  inventory: {
    slug: 'inventory',
    name: 'Inventory',
    icon: 'Package',
    component: 'InventoryModule',
    route: '/dashboard/inventory',
    description: 'Track stock levels and reorder alerts'
  },
  orders: {
    slug: 'orders',
    name: 'Orders',
    icon: 'ShoppingCart',
    component: 'OrdersModule',
    route: '/dashboard/orders',
    description: 'Supplier orders and purchase history'
  },
  appointments: {
    slug: 'appointments',
    name: 'Appointments',
    icon: 'Calendar',
    component: 'AppointmentsModule',
    route: '/dashboard/appointments',
    description: 'Schedule and manage appointments'
  },
  supplier_contacts: {
    slug: 'supplier_contacts',
    name: 'Suppliers',
    icon: 'Truck',
    component: 'SuppliersModule',
    route: '/dashboard/suppliers',
    description: 'Supplier directory and contact info'
  },
  leads: {
    slug: 'leads',
    name: 'Leads',
    icon: 'UserPlus',
    component: 'LeadsModule',
    route: '/dashboard/leads',
    description: 'Incoming leads and follow-up status'
  },
  estimates: {
    slug: 'estimates',
    name: 'Estimates',
    icon: 'FileText',
    component: 'EstimatesModule',
    route: '/dashboard/estimates',
    description: 'Generate and track estimates'
  },
  jobs: {
    slug: 'jobs',
    name: 'Jobs',
    icon: 'Briefcase',
    component: 'JobsModule',
    route: '/dashboard/jobs',
    description: 'Active and completed jobs'
  },
  crew: {
    slug: 'crew',
    name: 'Crew',
    icon: 'Users',
    component: 'CrewModule',
    route: '/dashboard/crew',
    description: 'Crew assignments and scheduling'
  },
  patients: {
    slug: 'patients',
    name: 'Patients',
    icon: 'Heart',
    component: 'PatientsModule',
    route: '/dashboard/patients',
    description: 'Patient records and history'
  },
  recalls: {
    slug: 'recalls',
    name: 'Recalls',
    icon: 'Bell',
    component: 'RecallsModule',
    route: '/dashboard/recalls',
    description: 'Patient recall scheduling'
  },
  insurance: {
    slug: 'insurance',
    name: 'Insurance',
    icon: 'Shield',
    component: 'InsuranceModule',
    route: '/dashboard/insurance',
    description: 'Insurance verification and claims'
  },
  activity_log: {
    slug: 'activity_log',
    name: 'Activity Log',
    icon: 'History',
    component: 'ActivityLogModule',
    route: '/dashboard/activity',
    description: 'Everything KingMouse has done'
  },
  billing: {
    slug: 'billing',
    name: 'Billing & Hours',
    icon: 'Clock',
    component: 'BillingModule',
    route: '/dashboard/billing',
    description: 'Work hours used and subscription status'
  }
};

// Resolve which modules a customer sees
export function getModulesForPro(dashboardModuleSlugs: string[]): DashboardModule[] {
  return dashboardModuleSlugs
    .map(slug => DASHBOARD_MODULES[slug])
    .filter(Boolean);
}
