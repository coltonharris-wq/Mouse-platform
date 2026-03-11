// src/types/pro.ts

export interface ProProfile {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  category: string;
  prompt_template: string;
  tools: string[];
  workflows: string[];
  onboarding_questions: OnboardingQuestion[];
  dashboard_modules: string[];
  is_active: boolean;
  sort_order: number;
}

export interface OnboardingQuestion {
  question: string;
  field_name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  hours_included: number;
  overage_rate_cents: number;
  features: string[];
  stripe_price_id: string | null;
  is_active: boolean;
}
