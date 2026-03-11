-- KMI (KingMouse Intelligence) Tables

-- Task 29: Silent Failure Detector
CREATE TABLE failure_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_failure_patterns_customer ON failure_patterns(customer_id);
CREATE INDEX idx_failure_patterns_severity ON failure_patterns(severity);

-- Task 30: AI Secret Shopper
CREATE TABLE secret_shopper_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL,
    scenario TEXT NOT NULL,
    result TEXT NOT NULL,
    score INTEGER, -- 1-100
    notes TEXT,
    tested_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_secret_shopper_customer ON secret_shopper_results(customer_id);

-- Task 31: Real Customer Memory
CREATE TABLE customer_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_customer_id TEXT NOT NULL, -- the business's end customer, NOT Mouse platform customer
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE, -- the Mouse platform customer
    customer_name TEXT,
    customer_contact TEXT,
    preferences JSONB DEFAULT '{}',
    history JSONB DEFAULT '[]',
    last_interaction TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_memories_business ON customer_memories(business_customer_id);
CREATE INDEX idx_customer_memories_customer ON customer_memories(customer_id);

-- Task 32: Attention Filtering — Owner Alerts
CREATE TABLE owner_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'money_opportunity', 'emergency', 'info'
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 3, -- 1 = highest
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_owner_alerts_customer ON owner_alerts(customer_id);
CREATE INDEX idx_owner_alerts_unread ON owner_alerts(customer_id, read) WHERE read = false;

-- Task 34: System Improvement Engine
CREATE TABLE improvement_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'process', 'communication', 'pricing', 'service'
    suggestion TEXT NOT NULL,
    evidence TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'accepted', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_improvement_suggestions_customer ON improvement_suggestions(customer_id);

-- Task 35: Owner Brain Clone
CREATE TABLE owner_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL, -- 'phrase', 'decision', 'preference'
    content TEXT NOT NULL,
    context TEXT,
    learned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_owner_patterns_customer ON owner_patterns(customer_id);

-- Task 36: Asset Builder
CREATE TABLE generated_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL, -- 'faq', 'sms_template', 'email_template', 'website_copy'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'active'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generated_assets_customer ON generated_assets(customer_id);

-- Task 38: Product Idea Machine
CREATE TABLE product_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    idea TEXT NOT NULL,
    evidence TEXT,
    estimated_demand TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'considering', 'implemented', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_ideas_customer ON product_ideas(customer_id);

-- RLS for all KMI tables
ALTER TABLE failure_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_shopper_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ideas ENABLE ROW LEVEL SECURITY;

-- Customer access policies
CREATE POLICY "Customers own failure_patterns" ON failure_patterns
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = failure_patterns.customer_id));
CREATE POLICY "Customers own secret_shopper_results" ON secret_shopper_results
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = secret_shopper_results.customer_id));
CREATE POLICY "Customers own customer_memories" ON customer_memories
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = customer_memories.customer_id));
CREATE POLICY "Customers own owner_alerts" ON owner_alerts
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = owner_alerts.customer_id));
CREATE POLICY "Customers own improvement_suggestions" ON improvement_suggestions
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = improvement_suggestions.customer_id));
CREATE POLICY "Customers own owner_patterns" ON owner_patterns
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = owner_patterns.customer_id));
CREATE POLICY "Customers own generated_assets" ON generated_assets
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = generated_assets.customer_id));
CREATE POLICY "Customers own product_ideas" ON product_ideas
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = product_ideas.customer_id));

-- Platform owner access
CREATE POLICY "Platform owners all failure_patterns" ON failure_patterns
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
CREATE POLICY "Platform owners all secret_shopper_results" ON secret_shopper_results
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
CREATE POLICY "Platform owners all customer_memories" ON customer_memories
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
CREATE POLICY "Platform owners all owner_alerts" ON owner_alerts
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
CREATE POLICY "Platform owners all improvement_suggestions" ON improvement_suggestions
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
CREATE POLICY "Platform owners all owner_patterns" ON owner_patterns
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
CREATE POLICY "Platform owners all generated_assets" ON generated_assets
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
CREATE POLICY "Platform owners all product_ideas" ON product_ideas
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
