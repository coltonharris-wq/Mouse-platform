-- Idempotency: ensure only one payment per Stripe session (prevents double-credit on webhook retry/race)
CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_session_id_key ON payments(stripe_session_id);
