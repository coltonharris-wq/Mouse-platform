-- ============================================
-- CRITICAL SECURITY FIXES - RLS POLICIES
-- ============================================
-- This migration adds missing RLS policies for:
-- 1. revenue_events table
-- 2. usage_logs table
-- 3. Additional security policies
-- ============================================

-- ============================================
-- FIX 1: RLS POLICIES FOR REVENUE_EVENTS
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Revenue events viewable by reseller" ON revenue_events;
DROP POLICY IF EXISTS "Revenue events viewable by platform owner" ON revenue_events;
DROP POLICY IF EXISTS "Revenue events insertable by service" ON revenue_events;
DROP POLICY IF EXISTS "Revenue events manageable by reseller" ON revenue_events;

-- Resellers can only see their own revenue events
CREATE POLICY "Revenue events viewable by reseller" ON revenue_events
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE reseller_id = revenue_events.reseller_id
        )
    );

-- Platform owners can see all revenue events
CREATE POLICY "Revenue events viewable by platform owner" ON revenue_events
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role = 'platform_owner'
        )
    );

-- Service role can insert revenue events (for webhooks)
CREATE POLICY "Revenue events insertable by service" ON revenue_events
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role IN ('platform_owner', 'service')
        )
    );

-- ============================================
-- FIX 2: RLS POLICIES FOR USAGE_LOGS
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Usage logs viewable by customer" ON usage_logs;
DROP POLICY IF EXISTS "Usage logs viewable by reseller" ON usage_logs;
DROP POLICY IF EXISTS "Usage logs viewable by platform owner" ON usage_logs;
DROP POLICY IF EXISTS "Usage logs insertable by service" ON usage_logs;

-- Customers can see usage logs for their employees
CREATE POLICY "Usage logs viewable by customer" ON usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employees e
            JOIN profiles p ON e.customer_id = p.customer_id
            WHERE e.id = usage_logs.employee_id AND p.id = auth.uid()
        )
    );

-- Resellers can see usage logs for their customers
CREATE POLICY "Usage logs viewable by reseller" ON usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employees e
            JOIN customers c ON e.customer_id = c.id
            JOIN profiles p ON c.reseller_id = p.reseller_id
            WHERE e.id = usage_logs.employee_id AND p.id = auth.uid()
        )
    );

-- Platform owners can see all usage logs
CREATE POLICY "Usage logs viewable by platform owner" ON usage_logs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role = 'platform_owner'
        )
    );

-- Service role can insert usage logs
CREATE POLICY "Usage logs insertable by service" ON usage_logs
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role IN ('platform_owner', 'service')
        )
    );

-- ============================================
-- FIX 3: ENHANCED RLS FOR PROFILES TABLE
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Platform owners can view all profiles" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Platform owners can view all profiles
CREATE POLICY "Platform owners can view all profiles" ON profiles
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role = 'platform_owner'
        )
    );

-- ============================================
-- FIX 4: ADDITIONAL SECURITY POLICIES
-- ============================================

-- Ensure chat_logs has proper RLS
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Recreate chat_logs policy with better isolation
DROP POLICY IF EXISTS "Customers own chat_logs" ON chat_logs;
DROP POLICY IF EXISTS "Resellers can view customer chat_logs" ON chat_logs;

-- Customers can only see their own chat logs
CREATE POLICY "Customers own chat_logs" ON chat_logs
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE customer_id = chat_logs.customer_id
        )
    );

-- Resellers can see chat logs for their customers
CREATE POLICY "Resellers can view customer chat_logs" ON chat_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customers c
            JOIN profiles p ON c.reseller_id = p.reseller_id
            WHERE c.id = chat_logs.customer_id AND p.id = auth.uid()
        )
    );

-- ============================================
-- FIX 5: INDEXES FOR PERFORMANCE
-- ============================================

-- Add indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_revenue_events_reseller_lookup ON revenue_events(reseller_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_employee_lookup ON usage_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_lookup ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_employees_idempotency ON employees(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- ============================================
-- FIX 6: EMPLOYEE IDEMPOTENCY COLUMN
-- ============================================

-- Add idempotency_key column to employees if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'idempotency_key'
    ) THEN
        ALTER TABLE employees ADD COLUMN idempotency_key TEXT;
        CREATE UNIQUE INDEX idx_employees_idempotency_key ON employees(idempotency_key) WHERE idempotency_key IS NOT NULL;
    END IF;
END $$;

-- ============================================
-- FIX 7: FUNCTION FOR IDEMPOTENCY LOOKUP
-- ============================================

CREATE OR REPLACE FUNCTION get_employee_by_idempotency_key(p_idempotency_key TEXT)
RETURNS TABLE (
    id TEXT,
    customer_id TEXT,
    name TEXT,
    role TEXT,
    status TEXT,
    vm_id TEXT,
    vm_url TEXT,
    current_task TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.customer_id,
        e.name,
        e.role,
        e.status,
        e.vm_id,
        e.vm_url,
        e.current_task
    FROM employees e
    WHERE e.idempotency_key = p_idempotency_key
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIX 8: AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only platform owners can view audit logs
CREATE POLICY "Audit logs viewable by platform owner" ON audit_log
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role = 'platform_owner'
        )
    );

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_at ON audit_log(performed_at);

-- ============================================
-- FIX 9: TRIGGER FOR AUDIT LOG
-- ============================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    audit_row audit_log;
BEGIN
    audit_row = ROW(
        uuid_generate_v4(),  -- id
        TG_TABLE_NAME,       -- table_name
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
            ELSE NEW.id::TEXT
        END,                 -- record_id
        TG_OP,               -- action
        CASE 
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
            WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD)
            ELSE NULL
        END,                 -- old_data
        CASE 
            WHEN TG_OP = 'DELETE' THEN NULL
            ELSE to_jsonb(NEW)
        END,                 -- new_data
        auth.uid(),          -- performed_by
        NOW(),               -- performed_at
        NULL,                -- ip_address (would need to be passed)
        NULL                 -- user_agent
    );
    
    INSERT INTO audit_log 
        (id, table_name, record_id, action, old_data, new_data, performed_by, performed_at)
    VALUES (
        audit_row.id,
        audit_row.table_name,
        audit_row.record_id,
        audit_row.action,
        audit_row.old_data,
        audit_row.new_data,
        audit_row.performed_by,
        audit_row.performed_at
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit trigger to sensitive tables
DROP TRIGGER IF EXISTS audit_employees ON employees;
CREATE TRIGGER audit_employees
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_customers ON customers;
CREATE TRIGGER audit_customers
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_token_transactions ON token_transactions;
CREATE TRIGGER audit_token_transactions
    AFTER INSERT OR UPDATE OR DELETE ON token_transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================
-- FIX 10: ROW COUNT LIMITS FOR SECURITY
-- ============================================

-- Add function to enforce row-level limits
CREATE OR REPLACE FUNCTION check_employee_limit()
RETURNS TRIGGER AS $$
DECLARE
    employee_count INTEGER;
    max_employees INTEGER := 100; -- Configurable limit per customer
BEGIN
    SELECT COUNT(*) INTO employee_count
    FROM employees
    WHERE customer_id = NEW.customer_id;
    
    IF employee_count >= max_employees THEN
        RAISE EXCEPTION 'Employee limit reached for customer. Maximum allowed: %', max_employees;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to enforce employee limits
DROP TRIGGER IF EXISTS enforce_employee_limit ON employees;
CREATE TRIGGER enforce_employee_limit
    BEFORE INSERT ON employees
    FOR EACH ROW EXECUTE FUNCTION check_employee_limit();

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('revenue_events', 'usage_logs', 'employees', 'customers', 'chat_logs', 'profiles')
AND schemaname = 'public';
