-- Create reseller_pending_signups table for the signup flow
-- Stores pending reseller signups before Stripe payment completes

CREATE TABLE IF NOT EXISTS public.reseller_pending_signups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  email text NOT NULL,
  company text DEFAULT '',
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  website text DEFAULT '',
  referral_source text DEFAULT '',
  expires_at timestamptz DEFAULT (now() + interval '24 hours') NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for token lookups during checkout flow
CREATE INDEX IF NOT EXISTS idx_reseller_pending_token ON public.reseller_pending_signups(token);

-- Index for cleanup of expired signups
CREATE INDEX IF NOT EXISTS idx_reseller_pending_expires ON public.reseller_pending_signups(expires_at);

-- RLS: service role only (API routes use service key)
ALTER TABLE public.reseller_pending_signups ENABLE ROW LEVEL SECURITY;
