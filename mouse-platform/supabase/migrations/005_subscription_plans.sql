-- Plan definitions (replaces token packages)
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,           -- 'pro', 'growth', 'enterprise'
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,        -- monthly price in cents
    hours_included INTEGER NOT NULL,     -- included hours per month
    overage_rate_cents INTEGER DEFAULT 498, -- $4.98 = 498 cents per hour
    stripe_price_id TEXT,               -- Stripe recurring Price ID
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
