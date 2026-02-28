-- Mouse Platform Database Schema
-- Multi-tenant with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- RESSELLERS
-- ============================================
CREATE TABLE resellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    brand_primary TEXT DEFAULT '#0F6B6E',
    brand_navy TEXT DEFAULT '#0B1F3B',
    stripe_account_id TEXT,
    stripe_onboarding_status TEXT DEFAULT 'pending',
    stripe_charges_enabled BOOLEAN DEFAULT FALSE,
    stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    reseller_id UUID REFERENCES resellers(id),
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    plan_tier TEXT DEFAULT 'starter',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_subscription_status TEXT DEFAULT 'incomplete',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KING MICE (Telegram Bots)
-- ============================================
CREATE TABLE king_mice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    bot_token TEXT NOT NULL,
    bot_username TEXT NOT NULL,
    bot_link TEXT NOT NULL,
    qr_code_url TEXT,
    telegram_chat_id BIGINT,
    status TEXT DEFAULT 'active',
    total_interactions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMPLOYEES (AI Workers)
-- ============================================
CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    template TEXT,
    status TEXT DEFAULT 'idle',
    vm_id TEXT,
    vm_url TEXT,
    current_task TEXT,
    fte_equivalent DECIMAL(3,2) DEFAULT 1.0,
    hourly_value_assumption INTEGER DEFAULT 50,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    priority INTEGER DEFAULT 3,
    estimated_hours DECIMAL(4,1),
    actual_hours DECIMAL(4,1),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USAGE LOGS
-- ============================================
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    seconds INTEGER DEFAULT 0,
    raw_cost DECIMAL(10,4) DEFAULT 0,
    markup_cost DECIMAL(10,4) DEFAULT 0,
    billed_cost DECIMAL(10,4) DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVENUE EVENTS
-- ============================================
CREATE TABLE revenue_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID REFERENCES resellers(id),
    customer_id TEXT REFERENCES customers(id),
    stripe_event_id TEXT,
    gross_amount INTEGER,
    platform_fee_amount INTEGER,
    reseller_amount INTEGER,
    type TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHAT LOGS
-- ============================================
CREATE TABLE chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    action_taken TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROFILES (Auth Mapping)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'customer',
    reseller_id UUID REFERENCES resellers(id),
    customer_id TEXT REFERENCES customers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_customers_reseller ON customers(reseller_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_employees_customer ON employees(customer_id);
CREATE INDEX idx_employees_vm ON employees(vm_id);
CREATE INDEX idx_tasks_employee ON tasks(employee_id);
CREATE INDEX idx_usage_logs_employee ON usage_logs(employee_id);
CREATE INDEX idx_chat_logs_customer ON chat_logs(customer_id);
CREATE INDEX idx_revenue_reseller ON revenue_events(reseller_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE king_mice ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Platform owners can see everything
CREATE POLICY "Platform owners full access" ON resellers
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));

-- Resellers can only see their own data
CREATE POLICY "Resellers own data" ON resellers
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM profiles WHERE reseller_id = resellers.id)
    );

CREATE POLICY "Resellers own customers" ON customers
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE reseller_id = customers.reseller_id)
        OR 
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner')
    );

-- Customers can only see their own data
CREATE POLICY "Customers own data" ON customers
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM profiles WHERE customer_id = customers.id)
    );

CREATE POLICY "Customers own employees" ON employees
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE customer_id = employees.customer_id)
        OR
        EXISTS (SELECT 1 FROM profiles p 
                JOIN customers c ON p.reseller_id = c.reseller_id 
                WHERE p.id = auth.uid() AND c.id = employees.customer_id)
    );

CREATE POLICY "Customers own tasks" ON tasks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM employees e 
                JOIN profiles p ON e.customer_id = p.customer_id 
                WHERE e.id = tasks.employee_id AND p.id = auth.uid())
    );

CREATE POLICY "Customers own king_mice" ON king_mice
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE customer_id = king_mice.customer_id)
    );

CREATE POLICY "Customers own chat_logs" ON chat_logs
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE customer_id = chat_logs.customer_id)
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER king_mice_updated_at BEFORE UPDATE ON king_mice
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA
-- ============================================

-- Create default reseller (Automio)
INSERT INTO resellers (id, name, slug, email, status)
VALUES (
    '89d0058a-2440-44d0-91c2-a0fcd6ead2e2',
    'Automio',
    'automio',
    'colton.harris@automioapp.com',
    'active'
);
