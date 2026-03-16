-- Add remaining missing columns to resellers table
ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS markup_rate numeric DEFAULT 7.48;
ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS wholesale_rate numeric DEFAULT 4.98;
ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS total_customers integer DEFAULT 0;
ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
