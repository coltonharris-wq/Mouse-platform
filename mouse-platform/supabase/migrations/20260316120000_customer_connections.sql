-- Customer connections table for OAuth integrations
CREATE TABLE IF NOT EXISTS public.customer_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  service TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  config JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_connections_cust 
  ON public.customer_connections (customer_id, service);

-- RLS
ALTER TABLE public.customer_connections ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY customer_connections_service_all ON public.customer_connections 
  FOR ALL USING (true) WITH CHECK (true);
