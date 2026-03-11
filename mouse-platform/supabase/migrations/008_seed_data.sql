-- Seed Pro Profiles
INSERT INTO pro_profiles (slug, name, description, category, prompt_template, tools, workflows, onboarding_questions, dashboard_modules, sort_order) VALUES
(
    'appliance',
    'Appliance Pro',
    'AI operations manager for appliance repair businesses. Handles inventory, scheduling, and supplier coordination.',
    'home_services',
    E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Appliance Repair\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle:\n- Inventory tracking and reorder alerts\n- Appointment scheduling and reminders\n- Supplier ordering and coordination\n- Customer follow-ups\n- Admin tasks and documentation\n\nYou only ask {{owner_name}} to approve decisions. You handle everything else autonomously.',
    '["inventory_tracking", "appointment_scheduling", "supplier_ordering", "call_receptionist", "customer_followup"]',
    '["inventory_reorder", "appointment_scheduler", "receptionist", "supplier_order"]',
    '[{"question": "What items do you track inventory for?", "field_name": "inventory_items", "type": "textarea"}, {"question": "What quantity should trigger a reorder alert?", "field_name": "reorder_threshold", "type": "number"}, {"question": "How do you typically place supplier orders?", "field_name": "order_method", "type": "select", "options": ["Website", "Email", "Phone", "Other"]}, {"question": "Do you want automated appointment reminders?", "field_name": "auto_reminders", "type": "boolean"}]',
    '["chat", "inventory", "orders", "appointments", "supplier_contacts", "activity_log", "billing"]',
    1
),
(
    'roofer',
    'Roofer Pro',
    'AI operations manager for roofing companies. Lead generation, estimates, job scheduling, and crew coordination.',
    'trades',
    E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Roofing\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle:\n- Lead capture and qualification\n- Estimate generation and follow-up\n- Job scheduling and crew coordination\n- Material ordering\n- Customer communication\n\nYou only ask {{owner_name}} to approve decisions. You handle everything else autonomously.',
    '["lead_capture", "estimate_generation", "job_scheduling", "material_ordering", "crew_coordination", "call_receptionist"]',
    '["lead_capture", "estimate_followup", "job_scheduler", "receptionist"]',
    '[{"question": "What roofing services do you offer?", "field_name": "services", "type": "textarea"}, {"question": "Average estimate turnaround time?", "field_name": "estimate_turnaround", "type": "select", "options": ["Same day", "24 hours", "48 hours", "1 week"]}, {"question": "How many crew members do you manage?", "field_name": "crew_size", "type": "number"}, {"question": "Do you want automated lead follow-up?", "field_name": "auto_lead_followup", "type": "boolean"}]',
    '["chat", "leads", "estimates", "jobs", "crew", "activity_log", "billing"]',
    2
),
(
    'dentist',
    'Dentist Pro',
    'AI operations manager for dental practices. Patient scheduling, recall management, insurance follow-ups.',
    'healthcare',
    E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Dental Practice\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle:\n- Patient scheduling and reminders\n- Recall management (6-month cleanings, etc.)\n- Insurance verification and follow-up\n- New patient intake\n- Admin tasks and documentation\n\nYou only ask {{owner_name}} to approve decisions. You handle everything else autonomously.',
    '["patient_scheduling", "recall_management", "insurance_followup", "patient_intake", "call_receptionist"]',
    '["appointment_scheduler", "recall_reminder", "insurance_verify", "receptionist"]',
    '[{"question": "How many operatories/chairs?", "field_name": "operatories", "type": "number"}, {"question": "Default recall interval?", "field_name": "recall_interval", "type": "select", "options": ["3 months", "6 months", "12 months"]}, {"question": "Do you verify insurance before appointments?", "field_name": "insurance_verify", "type": "boolean"}, {"question": "What practice management software do you use?", "field_name": "pms_software", "type": "text"}]',
    '["chat", "patients", "appointments", "recalls", "insurance", "activity_log", "billing"]',
    3
);

-- Seed Subscription Plans
INSERT INTO subscription_plans (slug, name, price_cents, hours_included, overage_rate_cents, features, sort_order) VALUES
('pro', 'Pro', 9700, 20, 498, '["20 hours/month", "1 AI employee", "Core automations", "Email support"]', 1),
('growth', 'Growth', 49700, 125, 498, '["125 hours/month", "1 AI employee", "Advanced automations", "Priority support", "Custom workflows"]', 2),
('enterprise', 'Enterprise', 99700, 300, 498, '["300 hours/month", "1 AI employee", "All automations", "Dedicated support", "Custom integrations", "API access"]', 3);
