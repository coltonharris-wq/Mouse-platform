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

export interface LeadIntel {
  estimated_employees: string;
  estimated_revenue: string;
  owner_name: string | null;
  owner_source: string | null;
  owner_linkedin: string | null;
  decision_maker: string | null;
  years_in_business: string | null;
  sales_angles: string[];
  pain_points: string[];
  gatekeeper_strategy: string;
  best_call_time: string;
  suggested_pitch: string;
  current_tools: string[];
  missing_tools: string[];
  recommended_products: string[];
  estimated_value: string;
}

export interface OnlinePresence {
  google_rating: number;
  google_reviews: number;
  google_response_rate: string;
  has_website: boolean;
  website_quality: 'basic' | 'modern' | 'professional' | 'outdated' | 'none';
  has_online_booking: boolean;
  has_chat_widget: boolean;
  has_contact_form: boolean;
  facebook_url: string | null;
  yelp_url: string | null;
  instagram_url: string | null;
  social_activity: string;
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
  status: 'new' | 'contacting' | 'pitched' | 'demo_sent' | 'closed' | 'lost';
  source: 'manual' | 'search' | 'import';
  intel: LeadIntel | null;
  online_presence: OnlinePresence | null;
  products_sold: string[];
  estimated_monthly_value: number;
  created_at: string;
  updated_at: string;
  last_contacted: string | null;
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
  rating: number;
  review_count: number;
  place_id: string;
  industry: string;
  business_types: string[];
  hours: string;
  is_open_now: boolean;
  online_presence: OnlinePresence;
  intel: LeadIntel;
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
