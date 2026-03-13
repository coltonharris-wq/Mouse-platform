// TEMPLATE150 — TypeScript Schema for Mouse Platform Pro Templates
// Every template follows this exact interface.

export interface ProTemplate {
  // Identity
  id: string;
  industry: string;
  niche: string;
  display_name: string;
  emoji: string;
  tagline: string;

  // Demo Experience (pre-signup chat)
  demo_greeting: string;
  demo_system_prompt: string;
  demo_suggested_messages: string[];

  // King Mouse Personality (post-signup VM)
  soul_template: string;

  // AI Receptionist (voice agent)
  receptionist_greeting: string;
  receptionist_system_prompt: string;
  receptionist_faqs: FAQ[];
  receptionist_transfer_triggers: string[];

  // Onboarding Wizard (post-signup setup)
  wizard_steps: WizardStep[];

  // Dashboard Config
  dashboard_widgets: DashboardWidget[];
  sample_tasks: SampleTask[];
  kpis: KPI[];

  // Integrations
  suggested_integrations: Integration[];
  integration_priority: string[];

  // Content
  email_templates: EmailTemplate[];
  sms_templates: SMSTemplate[];

  // Metadata
  estimated_hours_saved_weekly: number;
  estimated_monthly_value: number;
  ideal_plan: string;
  competitor_tools: string[];
}

export interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export interface WizardStep {
  step_number: number;
  title: string;
  description: string;
  fields: WizardField[];
}

export interface WizardField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'toggle' | 'time_range' | 'phone' | 'email' | 'url' | 'number' | 'currency';
  placeholder: string;
  required: boolean;
  options?: string[];
  help_text?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  priority: number;
}

export interface SampleTask {
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

export interface KPI {
  name: string;
  unit: string;
  description: string;
  target_suggestion: number;
}

export interface Integration {
  name: string;
  slug: string;
  category: string;
  why: string;
  priority: 'essential' | 'recommended' | 'nice-to-have';
}

export interface EmailTemplate {
  name: string;
  subject: string;
  body: string;
  trigger: string;
}

export interface SMSTemplate {
  name: string;
  body: string;
  trigger: string;
}
