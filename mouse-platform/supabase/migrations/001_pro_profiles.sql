-- Pro profiles: industry configuration packs
CREATE TABLE pro_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,           -- 'appliance', 'roofer', 'dentist'
    name TEXT NOT NULL,                  -- 'Appliance Pro'
    description TEXT,                    -- Short description for marketplace
    icon_url TEXT,                       -- Marketplace icon
    category TEXT,                       -- 'home_services', 'healthcare', 'trades'
    prompt_template TEXT NOT NULL,       -- System prompt template (has {{business_name}} etc.)
    tools JSONB NOT NULL DEFAULT '[]',   -- ["inventory_tracking", "scheduling", ...]
    workflows JSONB NOT NULL DEFAULT '[]', -- ["inventory_reorder", "appointment_scheduler"]
    onboarding_questions JSONB NOT NULL DEFAULT '[]', -- [{question, field_name, type, options?}]
    dashboard_modules JSONB NOT NULL DEFAULT '[]',    -- ["inventory", "orders", "appointments"]
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pro_profiles_slug ON pro_profiles(slug);
CREATE INDEX idx_pro_profiles_category ON pro_profiles(category);
