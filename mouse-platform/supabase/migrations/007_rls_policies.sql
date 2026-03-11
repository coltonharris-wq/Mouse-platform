-- pro_profiles: public read, admin write
ALTER TABLE pro_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active pro profiles" ON pro_profiles
    FOR SELECT USING (is_active = true);
CREATE POLICY "Platform owners manage pro profiles" ON pro_profiles
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));

-- work_sessions: customer reads own, platform reads all
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own work sessions" ON work_sessions
    FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = work_sessions.customer_id));
CREATE POLICY "Platform owners all work sessions" ON work_sessions
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));

-- automation_workflows: customer reads own
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own automation workflows" ON automation_workflows
    FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = automation_workflows.customer_id));
CREATE POLICY "Platform owners all automation workflows" ON automation_workflows
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));

-- subscription_plans: public read
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active plans" ON subscription_plans
    FOR SELECT USING (is_active = true);
CREATE POLICY "Platform owners manage plans" ON subscription_plans
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
