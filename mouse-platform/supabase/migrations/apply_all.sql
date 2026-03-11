-- Combined migration: safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

-- 001: Pro profiles
CREATE TABLE IF NOT EXISTS pro_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    category TEXT,
    prompt_template TEXT NOT NULL,
    tools JSONB NOT NULL DEFAULT '[]',
    workflows JSONB NOT NULL DEFAULT '[]',
    onboarding_questions JSONB NOT NULL DEFAULT '[]',
    dashboard_modules JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pro_profiles_slug ON pro_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_pro_profiles_category ON pro_profiles(category);

-- 002: Alter customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pro_profile_id UUID;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pro_slug TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_answers JSONB DEFAULT '{}';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vm_computer_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vm_status TEXT DEFAULT 'pending';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vm_provisioned_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS hours_included INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS hours_used DECIMAL(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS trial_hours_remaining DECIMAL(4,2) DEFAULT 2.0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT;
CREATE INDEX IF NOT EXISTS idx_customers_pro_slug ON customers(pro_slug);
CREATE INDEX IF NOT EXISTS idx_customers_vm_status ON customers(vm_status);

-- 003: Work sessions
CREATE TABLE IF NOT EXISTS work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    vm_computer_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    billed_hours DECIMAL(6,2),
    billing_rate DECIMAL(6,2) DEFAULT 4.98,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_work_sessions_customer ON work_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_status ON work_sessions(status);

-- 004: Automation workflows
CREATE TABLE IF NOT EXISTS automation_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    workflow_slug TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    n8n_workflow_id TEXT,
    config JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_automation_customer ON automation_workflows(customer_id);

-- 005: Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    hours_included INTEGER NOT NULL,
    overage_rate_cents INTEGER DEFAULT 498,
    stripe_price_id TEXT,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 006: Alter resellers
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS markup_cap_percent INTEGER DEFAULT 50;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS commission_percent INTEGER DEFAULT 40;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS custom_domain TEXT;

-- 007: RLS policies (use DO blocks to check existence)
ALTER TABLE pro_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pro_profiles' AND policyname='Anyone can read active pro profiles') THEN
    CREATE POLICY "Anyone can read active pro profiles" ON pro_profiles FOR SELECT USING (is_active = true);
  END IF;
END $$;

ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscription_plans' AND policyname='Anyone can read active plans') THEN
    CREATE POLICY "Anyone can read active plans" ON subscription_plans FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- 008: Seed data (upsert)
INSERT INTO pro_profiles (slug, name, description, category, prompt_template, tools, workflows, onboarding_questions, dashboard_modules, sort_order) VALUES
(
    'appliance',
    'Appliance Pro',
    'AI operations manager for appliance repair businesses. Handles inventory, scheduling, and supplier coordination.',
    'home_services',
    E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Appliance Repair\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle:\n- Inventory tracking and reorder alerts\n- Appointment scheduling and reminders\n- Supplier ordering and coordination\n- Customer follow-ups\n- Admin tasks and documentation\n\nYou only ask {{owner_name}} to approve decisions. You handle everything else autonomously.',
    '["inventory_tracking", "appointment_scheduling", "supplier_ordering", "call_receptionist", "customer_followup"]',
    '["inventory_reorder", "appointment_scheduler", "receptionist", "supplier_order"]',
    '[{"question": "What items do you track inventory for?", "field_name": "inventory_items", "type": "textarea"}, {"question": "What quantity should trigger a reorder alert?", "field_name": "reorder_threshold", "type": "number"}, {"question": "How do you typically place supplier orders?", "field_name": "order_method", "type": "select", "options": ["Website", "Email", "Phone", "Other"]}, {"question": "Do you want automated appointment reminders?", "field_name": "auto_reminders", "type": "boolean"}]',
    '["chat", "inventory", "orders", "appointments", "supplier_contacts", "activity_log", "billing"]',
    1
),
(
    'roofer',
    'Roofer Pro',
    'AI operations manager for roofing companies. Lead generation, estimates, job scheduling, and crew coordination.',
    'trades',
    E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Roofing\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle:\n- Lead capture and qualification\n- Estimate generation and follow-up\n- Job scheduling and crew coordination\n- Material ordering\n- Customer communication\n\nYou only ask {{owner_name}} to approve decisions. You handle everything else autonomously.',
    '["lead_capture", "estimate_generation", "job_scheduling", "material_ordering", "crew_coordination", "call_receptionist"]',
    '["lead_capture", "estimate_followup", "job_scheduler", "receptionist"]',
    '[{"question": "What roofing services do you offer?", "field_name": "services", "type": "textarea"}, {"question": "Average estimate turnaround time?", "field_name": "estimate_turnaround", "type": "select", "options": ["Same day", "24 hours", "48 hours", "1 week"]}, {"question": "How many crew members do you manage?", "field_name": "crew_size", "type": "number"}, {"question": "Do you want automated lead follow-up?", "field_name": "auto_lead_followup", "type": "boolean"}]',
    '["chat", "leads", "estimates", "jobs", "crew", "activity_log", "billing"]',
    2
),
(
    'dentist',
    'Dentist Pro',
    'AI operations manager for dental practices. Patient scheduling, recall management, insurance follow-ups.',
    'healthcare',
    E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Dental Practice\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle:\n- Patient scheduling and reminders\n- Recall management (6-month cleanings, etc.)\n- Insurance verification and follow-up\n- New patient intake\n- Admin tasks and documentation\n\nYou only ask {{owner_name}} to approve decisions. You handle everything else autonomously.',
    '["patient_scheduling", "recall_management", "insurance_followup", "patient_intake", "call_receptionist"]',
    '["appointment_scheduler", "recall_reminder", "insurance_verify", "receptionist"]',
    '[{"question": "How many operatories/chairs?", "field_name": "operatories", "type": "number"}, {"question": "Default recall interval?", "field_name": "recall_interval", "type": "select", "options": ["3 months", "6 months", "12 months"]}, {"question": "Do you verify insurance before appointments?", "field_name": "insurance_verify", "type": "boolean"}, {"question": "What practice management software do you use?", "field_name": "pms_software", "type": "text"}]',
    '["chat", "patients", "appointments", "recalls", "insurance", "activity_log", "billing"]',
    3
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    prompt_template = EXCLUDED.prompt_template,
    tools = EXCLUDED.tools,
    workflows = EXCLUDED.workflows,
    onboarding_questions = EXCLUDED.onboarding_questions,
    dashboard_modules = EXCLUDED.dashboard_modules,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

INSERT INTO subscription_plans (slug, name, price_cents, hours_included, overage_rate_cents, features, sort_order) VALUES
('pro', 'Pro', 9700, 20, 498, '["20 hours/month", "1 AI employee", "Core automations", "Email support"]', 1),
('growth', 'Growth', 49700, 125, 498, '["125 hours/month", "1 AI employee", "Advanced automations", "Priority support", "Custom workflows"]', 2),
('enterprise', 'Enterprise', 99700, 300, 498, '["300 hours/month", "1 AI employee", "All automations", "Dedicated support", "Custom integrations", "API access"]', 3)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    price_cents = EXCLUDED.price_cents,
    hours_included = EXCLUDED.hours_included,
    features = EXCLUDED.features,
    sort_order = EXCLUDED.sort_order;

-- 009: KMI tables (skip failure_patterns if it already exists)
CREATE TABLE IF NOT EXISTS secret_shopper_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL,
    scenario TEXT NOT NULL,
    result TEXT NOT NULL,
    score INTEGER,
    notes TEXT,
    tested_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_secret_shopper_customer ON secret_shopper_results(customer_id);

CREATE TABLE IF NOT EXISTS customer_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_customer_id TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_contact TEXT,
    preferences JSONB DEFAULT '{}',
    history JSONB DEFAULT '[]',
    last_interaction TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customer_memories_business ON customer_memories(business_customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_memories_customer ON customer_memories(customer_id);

CREATE TABLE IF NOT EXISTS owner_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 3,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_owner_alerts_customer ON owner_alerts(customer_id);

CREATE TABLE IF NOT EXISTS improvement_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    evidence TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_improvement_suggestions_customer ON improvement_suggestions(customer_id);

CREATE TABLE IF NOT EXISTS owner_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL,
    content TEXT NOT NULL,
    context TEXT,
    learned_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_owner_patterns_customer ON owner_patterns(customer_id);

CREATE TABLE IF NOT EXISTS generated_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_generated_assets_customer ON generated_assets(customer_id);

CREATE TABLE IF NOT EXISTS product_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    idea TEXT NOT NULL,
    evidence TEXT,
    estimated_demand TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_ideas_customer ON product_ideas(customer_id);

-- 010: Leads (may already exist from old schema)
-- Only add columns if table exists, create if not
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads' AND table_schema = 'public') THEN
    CREATE TABLE leads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
        source TEXT,
        name TEXT NOT NULL,
        contact TEXT,
        status TEXT DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_leads_customer ON leads(customer_id);
    CREATE INDEX idx_leads_status ON leads(status);
  END IF;
END $$;
