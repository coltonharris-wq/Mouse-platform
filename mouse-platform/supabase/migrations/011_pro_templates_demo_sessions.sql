-- V5 Sprint 1: pro_templates and demo_sessions tables

CREATE TABLE IF NOT EXISTS pro_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  niche TEXT NOT NULL,
  display_name TEXT NOT NULL,
  industry_display TEXT NOT NULL,
  icon TEXT,
  demo_prompt TEXT NOT NULL,
  soul_template TEXT NOT NULL,
  dashboard_config JSONB DEFAULT '{}',
  wizard_config JSONB DEFAULT '{}',
  tools_config JSONB DEFAULT '{}',
  capabilities TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pro_templates_industry_niche ON pro_templates(industry, niche);

CREATE TABLE IF NOT EXISTS demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL,
  industry TEXT NOT NULL,
  niche TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  message_count INTEGER DEFAULT 0,
  converted BOOLEAN DEFAULT false,
  customer_id TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demo_sessions_token ON demo_sessions(session_token);

-- Add industry/niche columns to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS niche TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pro_template_id UUID;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS demo_chat_transcript JSONB DEFAULT '[]';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS provisioning_status TEXT DEFAULT 'pending';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS provisioning_started_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS provisioning_completed_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
