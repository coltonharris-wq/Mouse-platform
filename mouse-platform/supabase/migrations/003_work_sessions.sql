-- Tracks VM work time for hourly billing
CREATE TABLE work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    vm_computer_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER, -- computed on end
    billed_hours DECIMAL(6,2),
    billing_rate DECIMAL(6,2) DEFAULT 4.98,
    status TEXT DEFAULT 'active', -- active, completed, error
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_work_sessions_customer ON work_sessions(customer_id);
CREATE INDEX idx_work_sessions_status ON work_sessions(status);
