-- V6: Work Hours Billing Engine
-- usage_events table + margin_config + balance check functions

-- Event types enum
CREATE TYPE usage_event_type AS ENUM (
  'chat_opus',
  'chat_sonnet',
  'chat_kimi',
  'voice_elevenlabs',
  'vm_orgo',
  'phone_twilio',
  'phone_number',
  'image_gen',
  'deployment'
);

-- Usage events table
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES ai_employees(id) ON DELETE SET NULL,
  event_type usage_event_type NOT NULL,
  vendor_cost DECIMAL(12,6) NOT NULL DEFAULT 0,
  work_hours_charged DECIMAL(10,4) NOT NULL DEFAULT 0,
  margin_multiplier INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for fast queries
CREATE INDEX idx_usage_events_customer ON usage_events(customer_id);
CREATE INDEX idx_usage_events_created ON usage_events(created_at DESC);
CREATE INDEX idx_usage_events_type ON usage_events(event_type);
CREATE INDEX idx_usage_events_customer_month ON usage_events(customer_id, created_at);

-- Margin configuration table
CREATE TABLE IF NOT EXISTS margin_config (
  id SERIAL PRIMARY KEY,
  event_type usage_event_type UNIQUE NOT NULL,
  margin_multiplier INTEGER NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed margin config
INSERT INTO margin_config (event_type, margin_multiplier, description) VALUES
  ('chat_opus', 5, 'Anthropic Opus — 5x margin'),
  ('chat_sonnet', 5, 'Anthropic Sonnet — 5x margin'),
  ('chat_kimi', 30, 'Kimi K2.5 — 30x margin'),
  ('voice_elevenlabs', 10, 'ElevenLabs voice — 10x margin'),
  ('vm_orgo', 10, 'Orgo VM compute — 10x margin'),
  ('phone_twilio', 10, 'Twilio calls/SMS — 10x margin'),
  ('phone_number', 14, 'Twilio phone number — 14x ($2 → $28/mo)'),
  ('image_gen', 10, 'Image generation — 10x margin'),
  ('deployment', 5, 'Employee deployment — 5x margin')
ON CONFLICT (event_type) DO NOTHING;

-- Add work_hours_balance to customers if not exists
ALTER TABLE customers ADD COLUMN IF NOT EXISTS work_hours_balance DECIMAL(10,4) NOT NULL DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS work_hours_purchased DECIMAL(10,4) NOT NULL DEFAULT 0;

-- Function: record usage event and deduct balance (atomic)
CREATE OR REPLACE FUNCTION record_usage_event(
  p_customer_id UUID,
  p_employee_id UUID,
  p_event_type usage_event_type,
  p_vendor_cost DECIMAL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS TABLE(
  success BOOLEAN,
  event_id UUID,
  work_hours_charged DECIMAL,
  new_balance DECIMAL,
  margin_used INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
  v_multiplier INTEGER;
  v_hours DECIMAL;
  v_balance DECIMAL;
  v_event_id UUID;
  v_hourly_rate DECIMAL := 4.98;
BEGIN
  -- Get margin multiplier
  SELECT mc.margin_multiplier INTO v_multiplier
  FROM margin_config mc WHERE mc.event_type = p_event_type;

  IF v_multiplier IS NULL THEN
    v_multiplier := 5; -- default
  END IF;

  -- Calculate hours: vendor_cost × multiplier / $4.98
  v_hours := (p_vendor_cost * v_multiplier) / v_hourly_rate;

  -- Check balance
  SELECT c.work_hours_balance INTO v_balance
  FROM customers c WHERE c.id = p_customer_id FOR UPDATE;

  IF v_balance IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 0::DECIMAL, 0;
    RETURN;
  END IF;

  IF v_balance < v_hours THEN
    RETURN QUERY SELECT false, NULL::UUID, v_hours, v_balance, v_multiplier;
    RETURN;
  END IF;

  -- Insert usage event
  INSERT INTO usage_events (customer_id, employee_id, event_type, vendor_cost, work_hours_charged, margin_multiplier, metadata)
  VALUES (p_customer_id, p_employee_id, p_event_type, p_vendor_cost, v_hours, v_multiplier, p_metadata)
  RETURNING usage_events.id INTO v_event_id;

  -- Deduct balance
  UPDATE customers SET work_hours_balance = work_hours_balance - v_hours WHERE customers.id = p_customer_id
  RETURNING customers.work_hours_balance INTO v_balance;

  RETURN QUERY SELECT true, v_event_id, v_hours, v_balance, v_multiplier;
END;
$$;

-- Function: get usage summary for a customer (current month)
CREATE OR REPLACE FUNCTION get_customer_usage_summary(
  p_customer_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())::INTEGER
) RETURNS TABLE(
  event_type usage_event_type,
  event_count BIGINT,
  total_vendor_cost DECIMAL,
  total_hours_charged DECIMAL,
  total_margin DECIMAL
) LANGUAGE sql STABLE AS $$
  SELECT
    ue.event_type,
    COUNT(*) as event_count,
    SUM(ue.vendor_cost) as total_vendor_cost,
    SUM(ue.work_hours_charged) as total_hours_charged,
    SUM(ue.vendor_cost * (ue.margin_multiplier - 1)) as total_margin
  FROM usage_events ue
  WHERE ue.customer_id = p_customer_id
    AND EXTRACT(YEAR FROM ue.created_at) = p_year
    AND EXTRACT(MONTH FROM ue.created_at) = p_month
  GROUP BY ue.event_type
  ORDER BY total_hours_charged DESC;
$$;

-- Function: admin overview — all customers usage
CREATE OR REPLACE FUNCTION get_admin_usage_overview(
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())::INTEGER
) RETURNS TABLE(
  event_type usage_event_type,
  event_count BIGINT,
  total_vendor_cost DECIMAL,
  total_hours_billed DECIMAL,
  total_revenue DECIMAL,
  total_margin DECIMAL
) LANGUAGE sql STABLE AS $$
  SELECT
    ue.event_type,
    COUNT(*) as event_count,
    SUM(ue.vendor_cost) as total_vendor_cost,
    SUM(ue.work_hours_charged) as total_hours_billed,
    SUM(ue.work_hours_charged * 4.98) as total_revenue,
    SUM((ue.work_hours_charged * 4.98) - ue.vendor_cost) as total_margin
  FROM usage_events ue
  WHERE EXTRACT(YEAR FROM ue.created_at) = p_year
    AND EXTRACT(MONTH FROM ue.created_at) = p_month
  GROUP BY ue.event_type
  ORDER BY total_vendor_cost DESC;
$$;

-- Function: per-customer breakdown for admin
CREATE OR REPLACE FUNCTION get_admin_customer_breakdown(
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())::INTEGER
) RETURNS TABLE(
  customer_id UUID,
  customer_name TEXT,
  event_count BIGINT,
  total_vendor_cost DECIMAL,
  total_hours_charged DECIMAL,
  current_balance DECIMAL
) LANGUAGE sql STABLE AS $$
  SELECT
    c.id as customer_id,
    COALESCE(c.company_name, c.email, c.id::text) as customer_name,
    COUNT(ue.id) as event_count,
    COALESCE(SUM(ue.vendor_cost), 0) as total_vendor_cost,
    COALESCE(SUM(ue.work_hours_charged), 0) as total_hours_charged,
    c.work_hours_balance as current_balance
  FROM customers c
  LEFT JOIN usage_events ue ON ue.customer_id = c.id
    AND EXTRACT(YEAR FROM ue.created_at) = p_year
    AND EXTRACT(MONTH FROM ue.created_at) = p_month
  GROUP BY c.id, c.company_name, c.email, c.work_hours_balance
  ORDER BY total_hours_charged DESC;
$$;

-- View: reseller aggregate usage
CREATE OR REPLACE VIEW reseller_usage_summary AS
SELECT
  c.reseller_id,
  COUNT(DISTINCT c.id) as customer_count,
  COUNT(ue.id) as total_events,
  COALESCE(SUM(ue.vendor_cost), 0) as total_vendor_cost,
  COALESCE(SUM(ue.work_hours_charged), 0) as total_hours_used,
  COALESCE(SUM(ue.work_hours_charged * 4.98), 0) as total_revenue
FROM customers c
LEFT JOIN usage_events ue ON ue.customer_id = c.id
WHERE c.reseller_id IS NOT NULL
GROUP BY c.reseller_id;
