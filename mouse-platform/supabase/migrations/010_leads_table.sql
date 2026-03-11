-- Leads table for lead tracking
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    source TEXT, -- 'web_form', 'phone', 'email', 'referral', 'other'
    name TEXT NOT NULL,
    contact TEXT, -- phone or email
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_customer ON leads(customer_id);
CREATE INDEX idx_leads_status ON leads(status);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers own leads" ON leads
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = leads.customer_id));
CREATE POLICY "Platform owners all leads" ON leads
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
