-- Tracks deployed n8n workflows per customer
CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    workflow_slug TEXT NOT NULL,        -- 'inventory_reorder', 'appointment_scheduler'
    workflow_name TEXT NOT NULL,        -- 'Inventory Reorder'
    n8n_workflow_id TEXT,              -- n8n's internal ID once deployed
    config JSONB DEFAULT '{}',         -- Customer-specific config (thresholds, etc.)
    status TEXT DEFAULT 'pending',     -- pending, active, paused, error
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_customer ON automation_workflows(customer_id);
