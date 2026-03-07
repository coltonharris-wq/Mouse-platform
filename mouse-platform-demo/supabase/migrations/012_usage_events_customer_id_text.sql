-- Align usage_events with customers.id (TEXT/cst_xxx format from signup)
-- Run this if usage_events.customer_id is UUID and you're using cst_xxx customer IDs

-- Drop FK, alter column type, re-add FK
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usage_events' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE usage_events DROP CONSTRAINT IF EXISTS usage_events_customer_id_fkey;
    -- Clear rows: UUID customer_ids won't match cst_xxx format
    TRUNCATE usage_events;
    ALTER TABLE usage_events ALTER COLUMN customer_id TYPE TEXT USING customer_id::text;
    ALTER TABLE usage_events ADD CONSTRAINT usage_events_customer_id_fkey 
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update record_usage_event to accept TEXT customer_id
CREATE OR REPLACE FUNCTION record_usage_event(
  p_customer_id TEXT,
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
  SELECT mc.margin_multiplier INTO v_multiplier
  FROM margin_config mc WHERE mc.event_type = p_event_type;
  IF v_multiplier IS NULL THEN v_multiplier := 5; END IF;

  v_hours := (p_vendor_cost * v_multiplier) / v_hourly_rate;

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

  INSERT INTO usage_events (customer_id, employee_id, event_type, vendor_cost, work_hours_charged, margin_multiplier, metadata)
  VALUES (p_customer_id, p_employee_id, p_event_type, p_vendor_cost, v_hours, v_multiplier, p_metadata)
  RETURNING usage_events.id INTO v_event_id;

  UPDATE customers SET work_hours_balance = work_hours_balance - v_hours WHERE customers.id = p_customer_id
  RETURNING customers.work_hours_balance INTO v_balance;

  RETURN QUERY SELECT true, v_event_id, v_hours, v_balance, v_multiplier;
END;
$$;

-- Update get_customer_usage_summary
CREATE OR REPLACE FUNCTION get_customer_usage_summary(
  p_customer_id TEXT,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())::INTEGER
) RETURNS TABLE(
  event_type usage_event_type,
  event_count BIGINT,
  total_vendor_cost DECIMAL,
  total_hours_charged DECIMAL,
  total_margin DECIMAL
) LANGUAGE sql STABLE AS $$
  SELECT ue.event_type, COUNT(*), SUM(ue.vendor_cost), SUM(ue.work_hours_charged), SUM(ue.vendor_cost * (ue.margin_multiplier - 1))
  FROM usage_events ue
  WHERE ue.customer_id = p_customer_id
    AND EXTRACT(YEAR FROM ue.created_at) = p_year
    AND EXTRACT(MONTH FROM ue.created_at) = p_month
  GROUP BY ue.event_type ORDER BY SUM(ue.work_hours_charged) DESC;
$$;

-- Update get_admin_customer_breakdown
CREATE OR REPLACE FUNCTION get_admin_customer_breakdown(
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())::INTEGER
) RETURNS TABLE(
  customer_id TEXT,
  customer_name TEXT,
  event_count BIGINT,
  total_vendor_cost DECIMAL,
  total_hours_charged DECIMAL,
  current_balance DECIMAL
) LANGUAGE sql STABLE AS $$
  SELECT c.id::text, COALESCE(c.company_name, c.email, c.id::text),
    COUNT(ue.id), COALESCE(SUM(ue.vendor_cost), 0), COALESCE(SUM(ue.work_hours_charged), 0), c.work_hours_balance
  FROM customers c
  LEFT JOIN usage_events ue ON ue.customer_id = c.id AND EXTRACT(YEAR FROM ue.created_at) = p_year AND EXTRACT(MONTH FROM ue.created_at) = p_month
  GROUP BY c.id, c.company_name, c.email, c.work_hours_balance ORDER BY COALESCE(SUM(ue.work_hours_charged), 0) DESC;
$$;
