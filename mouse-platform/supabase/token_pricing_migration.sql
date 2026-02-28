-- ============================================
-- TOKEN PRICING SYSTEM MIGRATION
-- Updated with correct pricing per requirements
-- ============================================

-- ============================================
-- TOKEN PACKAGES (Pricing Tiers)
-- ============================================
CREATE TABLE IF NOT EXISTS token_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price_cents INTEGER NOT NULL,
    token_amount INTEGER NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    stripe_price_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMER TOKEN BALANCES
-- ============================================
CREATE TABLE IF NOT EXISTS token_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    lifetime_earned INTEGER DEFAULT 0,
    lifetime_spent INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- ============================================
-- TOKEN TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'purchase', 'usage', 'bonus', 'refund', 'adjustment'
    amount INTEGER NOT NULL, -- positive for credit, negative for debit
    balance_after INTEGER NOT NULL,
    description TEXT,
    reference_id TEXT, -- stripe_payment_intent_id, employee_id, etc.
    reference_type TEXT, -- 'stripe_payment', 'vm_usage', 'task_usage', etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TOKEN USAGE RATES (Cost per action)
-- ============================================
CREATE TABLE IF NOT EXISTS token_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type TEXT UNIQUE NOT NULL, -- 'message_king_mouse', 'deploy_ai_employee', etc.
    tokens INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TOKEN PURCHASE ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS token_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    package_id UUID REFERENCES token_packages(id),
    token_amount INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled', 'refunded'
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_token_balances_customer ON token_balances(customer_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_customer ON token_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(type);
CREATE INDEX IF NOT EXISTS idx_token_orders_customer ON token_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_token_orders_status ON token_orders(status);
CREATE INDEX IF NOT EXISTS idx_token_packages_slug ON token_packages(slug);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Token packages readable" ON token_packages;
DROP POLICY IF EXISTS "Customers own token balances" ON token_balances;
DROP POLICY IF EXISTS "Resellers see customer token balances" ON token_balances;
DROP POLICY IF EXISTS "Customers own token transactions" ON token_transactions;
DROP POLICY IF EXISTS "Token rates readable" ON token_rates;
DROP POLICY IF EXISTS "Customers own token orders" ON token_orders;

-- Token packages are readable by all authenticated users
CREATE POLICY "Token packages readable" ON token_packages
    FOR SELECT USING (true);

-- Token balances - customers see their own
CREATE POLICY "Customers own token balances" ON token_balances
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE customer_id = token_balances.customer_id)
    );

-- Resellers see their customers' token balances
CREATE POLICY "Resellers see customer token balances" ON token_balances
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles p 
                JOIN customers c ON p.reseller_id = c.reseller_id 
                WHERE p.id = auth.uid() AND c.id = token_balances.customer_id)
    );

-- Token transactions - customers see their own
CREATE POLICY "Customers own token transactions" ON token_transactions
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM profiles WHERE customer_id = token_transactions.customer_id)
    );

-- Token rates readable by all
CREATE POLICY "Token rates readable" ON token_rates
    FOR SELECT USING (true);

-- Token orders - customers see their own
CREATE POLICY "Customers own token orders" ON token_orders
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE customer_id = token_orders.customer_id)
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamps
DROP TRIGGER IF EXISTS token_packages_updated_at ON token_packages;
CREATE TRIGGER token_packages_updated_at BEFORE UPDATE ON token_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS token_balances_updated_at ON token_balances;
CREATE TRIGGER token_balances_updated_at BEFORE UPDATE ON token_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS token_rates_updated_at ON token_rates;
CREATE TRIGGER token_rates_updated_at BEFORE UPDATE ON token_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS token_orders_updated_at ON token_orders;
CREATE TRIGGER token_orders_updated_at BEFORE UPDATE ON token_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to credit tokens to customer
CREATE OR REPLACE FUNCTION credit_tokens(
    p_customer_id TEXT,
    p_amount INTEGER,
    p_type TEXT,
    p_description TEXT,
    p_reference_id TEXT DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_new_balance INTEGER;
BEGIN
    -- Insert or update balance
    INSERT INTO token_balances (customer_id, balance, lifetime_earned)
    VALUES (p_customer_id, p_amount, p_amount)
    ON CONFLICT (customer_id)
    DO UPDATE SET
        balance = token_balances.balance + p_amount,
        lifetime_earned = token_balances.lifetime_earned + p_amount,
        last_updated = NOW()
    RETURNING balance INTO v_new_balance;

    -- Create transaction record
    INSERT INTO token_transactions (
        customer_id, type, amount, balance_after, description,
        reference_id, reference_type, metadata
    ) VALUES (
        p_customer_id, p_type, p_amount, v_new_balance, p_description,
        p_reference_id, p_reference_type, p_metadata
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to debit tokens from customer
CREATE OR REPLACE FUNCTION debit_tokens(
    p_customer_id TEXT,
    p_amount INTEGER,
    p_description TEXT,
    p_reference_id TEXT DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS TABLE(success BOOLEAN, transaction_id UUID, new_balance INTEGER) AS $$
DECLARE
    v_transaction_id UUID;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT balance INTO v_current_balance
    FROM token_balances
    WHERE customer_id = p_customer_id;

    -- Check if sufficient balance
    IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
        RETURN QUERY SELECT false, NULL::UUID, v_current_balance;
        RETURN;
    END IF;

    -- Update balance
    UPDATE token_balances
    SET balance = balance - p_amount,
        lifetime_spent = lifetime_spent + p_amount,
        last_updated = NOW()
    WHERE customer_id = p_customer_id
    RETURNING balance INTO v_new_balance;

    -- Create transaction record
    INSERT INTO token_transactions (
        customer_id, type, amount, balance_after, description,
        reference_id, reference_type, metadata
    ) VALUES (
        p_customer_id, 'usage', -p_amount, v_new_balance, p_description,
        p_reference_id, p_reference_type, p_metadata
    ) RETURNING id INTO v_transaction_id;

    RETURN QUERY SELECT true, v_transaction_id, v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to check and deduct tokens atomically
CREATE OR REPLACE FUNCTION use_tokens(
    p_customer_id TEXT,
    p_amount INTEGER,
    p_description TEXT,
    p_reference_id TEXT DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS TABLE(success BOOLEAN, transaction_id UUID, new_balance INTEGER, error TEXT) AS $$
DECLARE
    v_transaction_id UUID;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Lock the balance row
    SELECT balance INTO v_current_balance
    FROM token_balances
    WHERE customer_id = p_customer_id
    FOR UPDATE;

    -- Check if customer has balance record
    IF v_current_balance IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, 0, 'No token balance found'::TEXT;
        RETURN;
    END IF;

    -- Check if sufficient balance
    IF v_current_balance < p_amount THEN
        RETURN QUERY SELECT false, NULL::UUID, v_current_balance, 'Insufficient token balance'::TEXT;
        RETURN;
    END IF;

    -- Update balance
    UPDATE token_balances
    SET balance = balance - p_amount,
        lifetime_spent = lifetime_spent + p_amount,
        last_updated = NOW()
    WHERE customer_id = p_customer_id
    RETURNING balance INTO v_new_balance;

    -- Create transaction record
    INSERT INTO token_transactions (
        customer_id, type, amount, balance_after, description,
        reference_id, reference_type, metadata
    ) VALUES (
        p_customer_id, 'usage', -p_amount, v_new_balance, p_description,
        p_reference_id, p_reference_type, p_metadata
    ) RETURNING id INTO v_transaction_id;

    RETURN QUERY SELECT true, v_transaction_id, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA - TOKEN PACKAGES (Updated pricing)
-- ============================================
DELETE FROM token_packages WHERE slug IN ('starter', 'growth', 'pro', 'enterprise');

INSERT INTO token_packages (name, slug, price_cents, token_amount, description, features, display_order) VALUES
('Starter', 'starter', 1900, 4000, 'Perfect for small teams getting started', '["4,000 tokens", "Message with King Mouse", "Deploy AI employees", "Email support"]', 1),
('Growth', 'growth', 4900, 12000, 'Best value for growing teams', '["12,000 tokens", "Everything in Starter", "Priority support", "API access"]', 2),
('Pro', 'pro', 9900, 30000, 'Maximum value for power users', '["30,000 tokens", "Everything in Growth", "Dedicated support", "Custom integrations"]', 3),
('Enterprise', 'enterprise', 0, 0, 'Custom pricing for large organizations', '["Custom token amount", "Volume discounts", "Dedicated account manager", "SLA guarantees", "Custom contracts"]', 4);

-- ============================================
-- SEED DATA - TOKEN RATES (Updated per requirements)
-- ============================================
DELETE FROM token_rates WHERE action_type IN ('message_king_mouse', 'deploy_ai_employee', 'vm_runtime_1h', 'process_email', 'api_call');

INSERT INTO token_rates (action_type, tokens, description) VALUES
('message_king_mouse', 10, 'Send a message to King Mouse'),
('deploy_ai_employee', 100, 'Deploy a new AI employee'),
('vm_runtime_1h', 500, '1 hour of VM runtime'),
('process_email', 5, 'Process 1 email'),
('api_call', 1, 'API call');

-- ============================================
-- MIGRATION: Convert existing customers to token system
-- ============================================

-- Create token balances for existing customers who don't have one
INSERT INTO token_balances (customer_id, balance, lifetime_earned, lifetime_spent)
SELECT 
    c.id,
    CASE 
        WHEN c.plan_tier = 'starter' THEN 4000
        WHEN c.plan_tier = 'growth' THEN 12000
        WHEN c.plan_tier = 'enterprise' THEN 30000
        ELSE 4000
    END as balance,
    CASE 
        WHEN c.plan_tier = 'starter' THEN 4000
        WHEN c.plan_tier = 'growth' THEN 12000
        WHEN c.plan_tier = 'enterprise' THEN 30000
        ELSE 4000
    END as lifetime_earned,
    0 as lifetime_spent
FROM customers c
LEFT JOIN token_balances tb ON c.id = tb.customer_id
WHERE tb.id IS NULL;
