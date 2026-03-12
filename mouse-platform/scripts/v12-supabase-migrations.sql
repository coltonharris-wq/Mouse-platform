-- ============================================
-- V12: Mouse OS - Supabase Migrations
-- Run each CREATE TABLE individually in SQL Editor
-- (Supabase silently fails on multi-statement batches)
-- ============================================

-- 1. Notifications table (for dashboard Ping bell)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  agent_type TEXT DEFAULT 'king_mouse',
  type TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'normal',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tasks table (telemetry)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  computer_id TEXT,
  agent_type TEXT DEFAULT 'king_mouse',
  tool_used TEXT NOT NULL,
  duration_ms INTEGER DEFAULT 0,
  work_hours_cost DECIMAL(10,6) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add columns to employee_vms if they don't exist
ALTER TABLE employee_vms
  ADD COLUMN IF NOT EXISTS vm_name TEXT,
  ADD COLUMN IF NOT EXISTS ram_gb INTEGER DEFAULT 8,
  ADD COLUMN IF NOT EXISTS cpu_cores INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ;

-- 4. Add hours_used to usage_events if not present
ALTER TABLE usage_events
  ADD COLUMN IF NOT EXISTS hours_used DECIMAL(10,6) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tool_name TEXT;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_customer ON tasks(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_computer ON tasks(computer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_vms_customer ON employee_vms(customer_id, status);

-- 6. Enable Realtime on key tables (for dashboard live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE employee_vms;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- 7. Supabase Storage bucket for VM state sync
-- (Run via Supabase dashboard > Storage > New bucket)
-- Bucket name: vm-state
-- Public: false
-- File size limit: 100MB
