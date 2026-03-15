-- 013: Reseller Portal Tables
-- Adds pipeline, invites, commissions, payouts, and customer linkage tables

-- Reseller pipeline (deals they're working)
CREATE TABLE IF NOT EXISTS public.reseller_pipeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES public.resellers(id) NOT NULL,
  lead_name TEXT NOT NULL,
  business_name TEXT,
  niche TEXT,
  industry TEXT,
  phone TEXT,
  email TEXT,
  stage TEXT DEFAULT 'prospecting', -- prospecting, contacted, demo_done, closed, lost
  estimated_monthly DECIMAL(10,2),
  notes TEXT,
  lead_score INTEGER,
  lead_intel JSONB,
  sales_angles TEXT[],
  suggested_price DECIMAL(4,2),
  source TEXT, -- lead_finder, manual, referral
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reseller invites (tracking sent invites)
CREATE TABLE IF NOT EXISTS public.reseller_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES public.resellers(id) NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  industry TEXT,
  niche TEXT,
  custom_rate DECIMAL(4,2),
  invite_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'sent', -- sent, opened, signed_up, expired
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ
);

-- Reseller's customers (links reseller to customer profiles)
CREATE TABLE IF NOT EXISTS public.reseller_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES public.resellers(id) NOT NULL,
  customer_id UUID NOT NULL,
  customer_rate DECIMAL(4,2),
  total_hours_used DECIMAL(10,2) DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  invited_at TIMESTAMPTZ DEFAULT now(),
  signed_up_at TIMESTAMPTZ,
  UNIQUE(reseller_id, customer_id)
);

-- Reseller commissions (per billing cycle)
CREATE TABLE IF NOT EXISTS public.reseller_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES public.resellers(id) NOT NULL,
  customer_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  hours_used DECIMAL(10,4) DEFAULT 0,
  margin_per_hour DECIMAL(4,2),
  commission_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, paid, failed
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reseller payouts
CREATE TABLE IF NOT EXISTS public.reseller_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES public.resellers(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  customer_count INTEGER,
  total_hours DECIMAL(10,2),
  stripe_payout_id TEXT,
  status TEXT DEFAULT 'processing', -- processing, deposited, failed
  payout_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to resellers if not present
DO $$ BEGIN
  ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS markup_rate DECIMAL(4,2) DEFAULT 7.48;
  ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS wholesale_rate DECIMAL(4,2) DEFAULT 4.98;
  ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0;
  ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS total_customers INTEGER DEFAULT 0;
  ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;
  ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT;
  ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS company_name TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- RLS
ALTER TABLE public.reseller_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_payouts ENABLE ROW LEVEL SECURITY;

-- Policies (using service role bypass for API routes)
DO $$ BEGIN
  CREATE POLICY "Resellers own pipeline" ON public.reseller_pipeline FOR ALL USING (true);
  CREATE POLICY "Resellers own invites" ON public.reseller_invites FOR ALL USING (true);
  CREATE POLICY "Resellers own customers" ON public.reseller_customers FOR ALL USING (true);
  CREATE POLICY "Resellers own commissions" ON public.reseller_commissions FOR ALL USING (true);
  CREATE POLICY "Resellers own payouts" ON public.reseller_payouts FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
