-- Reseller Customer Signup Flow Migration
-- Creates tables for reseller invite codes, referrals, and commission tracking

-- Add columns to resellers table if they don't exist
ALTER TABLE resellers 
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(16) UNIQUE,
ADD COLUMN IF NOT EXISTS pricing_config JSONB,
ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,4) DEFAULT 0.40,
ADD COLUMN IF NOT EXISTS total_customers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_commissions INTEGER DEFAULT 0;

-- Create index on invite code for fast lookups
CREATE INDEX IF NOT EXISTS idx_resellers_invite_code ON resellers(invite_code);

-- Create reseller_referrals table to track customer signups
CREATE TABLE IF NOT EXISTS reseller_referrals (
    id VARCHAR(32) PRIMARY KEY,
    reseller_id VARCHAR(32) NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
    invite_code VARCHAR(16) NOT NULL,
    customer_id VARCHAR(32) REFERENCES customers(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.40,
    stripe_checkout_session_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending_payment', -- pending_payment, converted, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_status CHECK (status IN ('pending_payment', 'converted', 'cancelled'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_referrals_reseller_id ON reseller_referrals(reseller_id);
CREATE INDEX IF NOT EXISTS idx_referrals_invite_code ON reseller_referrals(invite_code);
CREATE INDEX IF NOT EXISTS idx_referrals_customer_id ON reseller_referrals(customer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON reseller_referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_stripe_session ON reseller_referrals(stripe_checkout_session_id);

-- Create reseller_commissions table for payout tracking
CREATE TABLE IF NOT EXISTS reseller_commissions (
    id VARCHAR(32) PRIMARY KEY,
    reseller_id VARCHAR(32) NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
    referral_id VARCHAR(32) REFERENCES reseller_referrals(id) ON DELETE SET NULL,
    customer_id VARCHAR(32) REFERENCES customers(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- Original payment amount in cents
    commission_rate DECIMAL(5,4) NOT NULL,
    commission_amount INTEGER NOT NULL, -- Commission in cents
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255), -- Stripe Connect transfer ID
    status VARCHAR(50) NOT NULL DEFAULT 'pending_payout', -- pending_payout, paid, failed
    is_recurring BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_commission_status CHECK (status IN ('pending_payout', 'paid', 'failed'))
);

-- Create indexes for commission queries
CREATE INDEX IF NOT EXISTS idx_commissions_reseller_id ON reseller_commissions(reseller_id);
CREATE INDEX IF NOT EXISTS idx_commissions_customer_id ON reseller_commissions(customer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON reseller_commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_created ON reseller_commissions(created_at);

-- Add reseller_id to customers table if not exists
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS reseller_id VARCHAR(32) REFERENCES resellers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customers_reseller_id ON customers(reseller_id);

-- Create function to increment reseller stats
CREATE OR REPLACE FUNCTION increment_reseller_stats(
    p_reseller_id VARCHAR,
    p_customer_count INTEGER,
    p_revenue_amount INTEGER,
    p_commission_amount INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE resellers
    SET 
        total_customers = total_customers + p_customer_count,
        total_revenue = total_revenue + p_revenue_amount,
        total_commissions = total_commissions + p_commission_amount,
        updated_at = NOW()
    WHERE id = p_reseller_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE reseller_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_commissions ENABLE ROW LEVEL SECURITY;

-- Create policies for reseller_referrals
CREATE POLICY "Resellers can view their own referrals"
ON reseller_referrals FOR SELECT
USING (reseller_id IN (
    SELECT id FROM resellers WHERE user_id = auth.uid()
));

CREATE POLICY "System can manage referrals"
ON reseller_referrals FOR ALL
USING (true)
WITH CHECK (true);

-- Create policies for reseller_commissions
CREATE POLICY "Resellers can view their own commissions"
ON reseller_commissions FOR SELECT
USING (reseller_id IN (
    SELECT id FROM resellers WHERE user_id = auth.uid()
));

CREATE POLICY "System can manage commissions"
ON reseller_commissions FOR ALL
USING (true)
WITH CHECK (true);

-- Insert sample reseller for testing (optional - remove in production)
-- INSERT INTO resellers (id, company_name, email, status, invite_code, commission_rate, stripe_account_id)
-- VALUES ('rsl_test123', 'Test Agency', 'test@agency.com', 'active', 'ABC12345', 0.40, 'acct_test123')
-- ON CONFLICT DO NOTHING;
