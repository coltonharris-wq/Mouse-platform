-- Add user_id to customers for login lookup (auth.users.id)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE;

-- Add columns to EXISTING resellers table (do not create - table exists with id UUID, name, email, etc.)
ALTER TABLE resellers
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS invite_code VARCHAR(16) UNIQUE,
  ADD COLUMN IF NOT EXISTS pricing_config JSONB,
  ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,4) DEFAULT 0.40,
  ADD COLUMN IF NOT EXISTS total_customers INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_revenue INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_commissions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_resellers_user_id ON resellers(user_id);
CREATE INDEX IF NOT EXISTS idx_resellers_invite_code ON resellers(invite_code);
