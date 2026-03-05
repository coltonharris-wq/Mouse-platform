-- V11: Orgo VM Integration Tables
-- Run this in Supabase SQL Editor

-- Employee VMs — maps hired employees to Orgo VMs
CREATE TABLE IF NOT EXISTS employee_vms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL DEFAULT 'AI Employee',
  computer_id TEXT NOT NULL,          -- Orgo computer UUID
  status TEXT NOT NULL DEFAULT 'starting',  -- starting, running, stopped, terminated, error
  ram INTEGER NOT NULL DEFAULT 4,
  cpu INTEGER NOT NULL DEFAULT 2,
  gpu TEXT NOT NULL DEFAULT 'none',
  orgo_url TEXT,                       -- Orgo dashboard URL
  vnc_password TEXT,
  last_screenshot_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stopped_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_employee_vms_customer ON employee_vms(customer_id);
CREATE INDEX IF NOT EXISTS idx_employee_vms_employee ON employee_vms(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_vms_computer ON employee_vms(computer_id);

-- Hired Employees — tracks all hires from the marketplace
CREATE TABLE IF NOT EXISTS hired_employees (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  employee_type TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'deploying',  -- deploying, active, paused, error, fired
  vm_id TEXT,                          -- Orgo computer_id
  config JSONB DEFAULT '{}',
  error_message TEXT,
  hired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fired_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hired_employees_customer ON hired_employees(customer_id);

-- VM Sessions (Work History) — tracks work periods
CREATE TABLE IF NOT EXISTS vm_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_vm_id UUID REFERENCES employee_vms(id),
  employee_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  task_description TEXT NOT NULL DEFAULT 'General work',
  status TEXT NOT NULL DEFAULT 'active',  -- active, completed, error
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  screenshots JSONB DEFAULT '[]',      -- [{timestamp, image}] — base64 screenshots
  work_hours_charged NUMERIC(10,4) DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_vm_sessions_customer ON vm_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_vm_sessions_employee ON vm_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_vm_sessions_status ON vm_sessions(status);
