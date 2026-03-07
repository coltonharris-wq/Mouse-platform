-- Customer portal: persist interview answers and business config for provision retries
-- So provision-trigger can build USER.md correctly when VM wasn't ready on first kickOffProvision

ALTER TABLE hired_employees ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN hired_employees.config IS 'businessName, businessType, interviewAnswers for King Mouse provisioning';
