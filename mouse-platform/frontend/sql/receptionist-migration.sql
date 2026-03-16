-- Receptionist AI: Database Migration
-- Run this in Supabase SQL Editor

-- 1. Add columns to receptionist_config if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receptionist_config' AND column_name = 'twilio_phone_sid') THEN
    ALTER TABLE receptionist_config ADD COLUMN twilio_phone_sid text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receptionist_config' AND column_name = 'business_name') THEN
    ALTER TABLE receptionist_config ADD COLUMN business_name text;
  END IF;
END $$;

-- 2. Add columns to call_logs if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_logs' AND column_name = 'ai_summary') THEN
    ALTER TABLE call_logs ADD COLUMN ai_summary text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_logs' AND column_name = 'action_taken') THEN
    ALTER TABLE call_logs ADD COLUMN action_taken text;
  END IF;
END $$;

-- 3. Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id text NOT NULL,
  call_log_id uuid REFERENCES call_logs(id),
  caller_name text,
  caller_phone text,
  preferred_date text,
  preferred_time text,
  service_requested text,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);

-- 4. Create receptionist_messages table
CREATE TABLE IF NOT EXISTS receptionist_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id text NOT NULL,
  call_log_id uuid REFERENCES call_logs(id),
  caller_name text,
  caller_phone text,
  message text,
  urgency text DEFAULT 'normal',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_receptionist_messages_customer ON receptionist_messages(customer_id);

-- 5. Create public storage bucket for receptionist audio (run in Supabase dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receptionist-audio', 'receptionist-audio', true)
-- ON CONFLICT (id) DO NOTHING;

-- 6. Enable RLS (optional, service role bypasses RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receptionist_messages ENABLE ROW LEVEL SECURITY;
