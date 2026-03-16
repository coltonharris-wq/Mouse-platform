-- 014: Add missing columns to resellers table for signup flow
ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS full_name text DEFAULT '';
ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS email text DEFAULT '';
ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
ALTER TABLE public.resellers ADD COLUMN IF NOT EXISTS brand_slug text DEFAULT '';
