-- Add markup cap for resellers
ALTER TABLE resellers ADD COLUMN markup_cap_percent INTEGER DEFAULT 50;
ALTER TABLE resellers ADD COLUMN commission_percent INTEGER DEFAULT 40;
ALTER TABLE resellers ADD COLUMN custom_domain TEXT;
