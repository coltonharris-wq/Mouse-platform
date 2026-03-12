// src/types/reseller-dashboard.ts

export interface ResellerBusiness {
  id: string;
  reseller_id: string;
  customer_id: string | null;
  business_name: string;
  business_email: string;
  contact_name: string | null;
  phone: string | null;
  pro_slug: string | null;
  custom_price_cents: number | null;
  custom_hourly_rate_cents: number | null;
  invite_link_id: string | null;
  status: 'invited' | 'signed_up' | 'active' | 'churned';
  monthly_revenue_cents: number;
  notes: string | null;
  invited_at: string;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
  products?: BusinessProducts;
}

export interface SavedLead {
  id: string;
  reseller_id: string;
  company_name: string;
  industry: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  employee_count: string | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'lost';
  source: 'manual' | 'search' | 'import';
  created_at: string;
  updated_at: string;
}

export interface TaskLogEntry {
  id: string;
  customer_id: string | null;
  reseller_id: string | null;
  title: string;
  description: string | null;
  type: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  category: string | null;
  schedule_cron: string | null;
  next_run_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  result: string | null;
  error: string | null;
  created_at: string;
}

export interface ResellerAnalytics {
  total_customers: number;
  active_customers: number;
  avg_hourly_rate_cents: number;
  avg_profit_per_hour_cents: number;
  total_customer_hours_this_month: number;
  estimated_monthly_profit_cents: number;
  base_rate_cents: number;
  customers_by_status: Record<string, number>;
  profit_by_month: { month: string; profit_cents: number }[];
}

export interface LeadSearchResult {
  name: string;
  address: string;
  phone: string;
  website: string;
  industry: string;
}

export interface BusinessProducts {
  receptionist: {
    active: boolean;
    phone_number?: string;
    calls_this_month?: number;
  };
  lead_funnel: {
    active: boolean;
    funnel_id?: string;
    leads_this_month?: number;
    target?: number;
  };
  king_mouse: {
    active: boolean;
    computer_id?: string;
    hours_this_month?: number;
    vm_status?: string;
  };
}
