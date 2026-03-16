-- Allow user_id to be null since reseller signup doesn't use Supabase auth
ALTER TABLE public.resellers ALTER COLUMN user_id DROP NOT NULL;
