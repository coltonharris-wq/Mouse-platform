// Lead Finder types - matches spec and DB schema

export type Vertical =
  | "plumbing"
  | "dental"
  | "hvac"
  | "electrical"
  | "roofing"
  | "landscaping"
  | "cleaning"
  | "real_estate"
  | "legal"
  | "accounting"
  | "auto_repair"
  | "restaurant"
  | "other";

export type PipelineStatus =
  | "new"
  | "contacted"
  | "pitched"
  | "demo"
  | "negotiation"
  | "closed"
  | "lost";

export type ScanStatus = "pending" | "running" | "completed" | "failed";

export interface ScanRequest {
  vertical: Vertical;
  location: string;
  radius: number; // miles
}

export interface ScanResponse {
  scan_id: string;
  status: ScanStatus;
  estimated_time: string;
}

export interface LeadBusiness {
  id: string;
  name: string;
  vertical?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  google_place_id?: string;
  google_rating?: number;
  google_review_count?: number;
  pain_signals: string[];
  pain_score: number;
  estimated_monthly_calls?: number;
  estimated_lost_revenue?: number;
  pipeline_status: PipelineStatus;
  last_outreach_at?: string;
  outreach_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ScanResult {
  id: string;
  status: ScanStatus;
  vertical: string;
  location: string;
  total_found: number;
  high_priority_count: number;
  businesses: LeadBusiness[];
}
