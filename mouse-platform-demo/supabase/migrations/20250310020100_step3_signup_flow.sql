-- Step 3: Signup Flow Migration (FIXED)
-- Run this in Supabase SQL editor

-- Add missing columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_payment';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vm_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS workspace_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS mousecore_endpoint TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gateway_token TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS needs JSONB;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS custom_instructions TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS novnc_endpoint TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- Provision status table
CREATE TABLE IF NOT EXISTS provision_status (
  customer_id TEXT PRIMARY KEY REFERENCES customers(id),
  progress INTEGER DEFAULT 0,
  message TEXT DEFAULT 'Starting...',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking tables
CREATE TABLE IF NOT EXISTS usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT REFERENCES customers(id),
  type TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  base_cost_cents INTEGER,
  billed_cost_cents INTEGER,
  work_hours_deducted NUMERIC(10,6),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_balance (
  customer_id TEXT PRIMARY KEY REFERENCES customers(id),
  plan_hours NUMERIC(10,2),
  hours_used NUMERIC(10,6) DEFAULT 0,
  hours_remaining NUMERIC(10,6),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Deduct hours function (atomic)
CREATE OR REPLACE FUNCTION deduct_hours(p_customer_id TEXT, p_hours NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE usage_balance
  SET hours_used = hours_used + p_hours,
      hours_remaining = hours_remaining - p_hours,
      last_updated = NOW()
  WHERE customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for new tables
ALTER TABLE provision_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_balance ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
DROP POLICY IF EXISTS "service_role_provision_status" ON provision_status;
CREATE POLICY "service_role_provision_status" ON provision_status
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_usage_log" ON usage_log;
CREATE POLICY "service_role_usage_log" ON usage_log
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_usage_balance" ON usage_balance;
CREATE POLICY "service_role_usage_balance" ON usage_balance
  FOR ALL USING (true) WITH CHECK (true);