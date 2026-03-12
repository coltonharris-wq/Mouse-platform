-- V5 Sprint 3: Notifications, task screenshots, workspace apps, daily metrics

-- Notifications (3C)
CREATE TABLE IF NOT EXISTS customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  channel TEXT DEFAULT 'in_app',
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_customer ON customer_notifications(customer_id, read);

-- Notification Preferences (3C)
CREATE TABLE IF NOT EXISTS notification_preferences (
  customer_id TEXT PRIMARY KEY,
  email_urgent BOOLEAN DEFAULT true,
  email_daily_summary BOOLEAN DEFAULT true,
  email_weekly_report BOOLEAN DEFAULT true,
  sms_critical BOOLEAN DEFAULT false,
  notification_email TEXT,
  notification_phone TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Task Screenshots / Replay (3F)
CREATE TABLE IF NOT EXISTS task_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_screenshots ON task_screenshots(task_id, captured_at);

-- Workspace App Links (3H)
CREATE TABLE IF NOT EXISTS workspace_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  app_slug TEXT NOT NULL,
  app_name TEXT NOT NULL,
  category TEXT NOT NULL,
  connected BOOLEAN DEFAULT false,
  app_url TEXT,
  oauth_token_id TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_apps ON workspace_apps(customer_id, app_slug);

-- Engagement Metrics (3I)
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  date DATE NOT NULL,
  hours_worked NUMERIC(10,4) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  calls_handled INTEGER DEFAULT 0,
  emails_handled INTEGER DEFAULT 0,
  estimated_hours_saved NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_metrics ON daily_metrics(customer_id, date);
