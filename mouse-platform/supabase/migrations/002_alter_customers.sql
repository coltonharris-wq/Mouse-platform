-- Add Pro profile reference + onboarding data to customers
ALTER TABLE customers ADD COLUMN pro_profile_id UUID REFERENCES pro_profiles(id);
ALTER TABLE customers ADD COLUMN pro_slug TEXT;
ALTER TABLE customers ADD COLUMN owner_name TEXT;
ALTER TABLE customers ADD COLUMN business_type TEXT;
ALTER TABLE customers ADD COLUMN location TEXT;
ALTER TABLE customers ADD COLUMN onboarding_answers JSONB DEFAULT '{}';
ALTER TABLE customers ADD COLUMN vm_computer_id TEXT;
ALTER TABLE customers ADD COLUMN vm_status TEXT DEFAULT 'pending'; -- pending, provisioning, running, stopped, error
ALTER TABLE customers ADD COLUMN vm_provisioned_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN subscription_plan TEXT; -- 'pro', 'growth', 'enterprise'
ALTER TABLE customers ADD COLUMN hours_included INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN hours_used DECIMAL(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN trial_hours_remaining DECIMAL(4,2) DEFAULT 2.0;

CREATE INDEX idx_customers_pro_slug ON customers(pro_slug);
CREATE INDEX idx_customers_vm_status ON customers(vm_status);
