export interface ProTemplateLight {
  id: string;
  industry: string;
  niche: string;
  display_name: string;
  emoji: string;
  tagline: string;

  // Wizard config
  wizard_steps: WizardStep[];

  // Dashboard config
  dashboard_widgets: DashboardWidgetConfig[];
  sample_tasks: SampleTask[];
  kpis: KPI[];

  // Receptionist
  receptionist_greeting: string;

  // Integrations
  suggested_integrations: IntegrationSuggestion[];

  // Marketing
  estimated_hours_saved_weekly: number;
  estimated_monthly_value: number;
  ideal_plan: string;
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
  default_value?: string | boolean | number;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  description: string;
  priority: number;
  icon?: string;
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

export interface IntegrationSuggestion {
  name: string;
  slug: string;
  category: string;
  why: string;
  priority: 'essential' | 'recommended' | 'nice-to-have';
}
