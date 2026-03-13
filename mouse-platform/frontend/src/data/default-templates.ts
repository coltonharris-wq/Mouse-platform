import type { ProTemplateLight } from '@/types/pro-template';

export const defaultTemplates: ProTemplateLight[] = [
  // ─── 1. Pizza Shop ────────────────────────────────────────
  {
    id: 'food-pizza-shop',
    industry: 'Food & Restaurant',
    niche: 'Pizza Shop',
    display_name: 'Pizza Shop',
    emoji: '\u{1F355}',
    tagline: 'Your AI kitchen manager that never calls in sick',
    wizard_steps: [
      {
        step_number: 1,
        title: 'About Your Shop',
        description: 'Tell us about your pizza business',
        fields: [
          { name: 'business_name', label: "What's the name of your shop?", type: 'text', placeholder: "Tony's Pizza", required: true },
          { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Tony', required: true },
          { name: 'phone', label: 'Shop phone number?', type: 'phone', placeholder: '(910) 555-1234', required: true },
          { name: 'address', label: 'Shop address?', type: 'text', placeholder: '123 Main St, Wilmington, NC', required: false },
        ],
      },
      {
        step_number: 2,
        title: 'Hours & Operations',
        description: 'When are you open and how do you operate?',
        fields: [
          { name: 'business_hours', label: 'Business hours?', type: 'time_range', placeholder: '11:00 AM - 10:00 PM', required: true },
          { name: 'delivery', label: 'Do you offer delivery?', type: 'toggle', placeholder: '', required: false, default_value: true },
          { name: 'online_ordering', label: 'Online ordering platform?', type: 'select', placeholder: 'Select platform', required: false, options: ['None', 'Slice', 'DoorDash', 'UberEats', 'GrubHub', 'Own website', 'Other'] },
        ],
      },
      {
        step_number: 3,
        title: 'What Should King Mouse Handle?',
        description: 'Pick the tasks you want automated',
        fields: [
          { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Take phone orders', 'Handle complaints', 'Send text blasts', 'Manage online reviews', 'Track inventory', 'Schedule staff', 'Catering inquiries'] },
        ],
      },
      {
        step_number: 4,
        title: 'Review & Launch',
        description: 'Review your setup and launch King Mouse',
        fields: [
          { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'e.g., We close early on Sundays, our best seller is the Grandma pie...', required: false },
        ],
      },
    ],
    dashboard_widgets: [
      { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled by King Mouse', priority: 1, icon: 'Phone' },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Total revenue today', priority: 2, icon: 'DollarSign' },
      { id: 'pending-orders', title: 'Pending Orders', description: 'Orders waiting to be made', priority: 3, icon: 'Package' },
      { id: 'review-alerts', title: 'Review Alerts', description: 'New online reviews', priority: 4, icon: 'Star' },
      { id: 'catering-pipeline', title: 'Catering Inquiries', description: 'Upcoming catering requests', priority: 5, icon: 'Calendar' },
    ],
    sample_tasks: [
      { title: 'Take a phone order for a large pepperoni', description: 'King Mouse answers calls and takes orders using your menu', category: 'Orders', difficulty: 'easy' },
      { title: 'Send a text blast for Friday night specials', description: 'Blast your customer list with tonight\'s deals', category: 'Marketing', difficulty: 'easy' },
      { title: 'Handle a Yelp complaint', description: 'Respond professionally to negative reviews', category: 'Reviews', difficulty: 'medium' },
      { title: 'Check what supplies are running low', description: 'Review inventory levels and flag shortages', category: 'Inventory', difficulty: 'easy' },
    ],
    kpis: [
      { name: 'Daily Orders', unit: 'orders', description: 'Number of orders per day', target_suggestion: 50 },
      { name: 'Avg Order Value', unit: 'dollars', description: 'Average ticket size', target_suggestion: 28 },
      { name: 'Phone Answer Rate', unit: 'percent', description: 'Percentage of calls answered', target_suggestion: 95 },
      { name: 'Review Rating', unit: 'stars', description: 'Average online review rating', target_suggestion: 4.5 },
    ],
    receptionist_greeting: "Thanks for calling {business_name}! This is King Mouse, your AI assistant. I can take your order, answer questions about our menu, or connect you with the team. How can I help?",
    suggested_integrations: [
      { name: 'Slice', slug: 'slice', category: 'Online Ordering', why: 'Sync online orders directly into your workflow', priority: 'essential' },
      { name: 'Yelp', slug: 'yelp', category: 'Reviews', why: 'Monitor and respond to reviews automatically', priority: 'recommended' },
      { name: 'Square POS', slug: 'square', category: 'Payments', why: 'Track revenue and orders in real-time', priority: 'recommended' },
    ],
    estimated_hours_saved_weekly: 15,
    estimated_monthly_value: 2400,
    ideal_plan: 'pro',
  },

  // ─── 2. Auto Repair ──────────────────────────────────────
  {
    id: 'automotive-auto-repair',
    industry: 'Automotive',
    niche: 'Auto Repair',
    display_name: 'Auto Repair',
    emoji: '\u{1F527}',
    tagline: 'Your AI service advisor that keeps the bays full',
    wizard_steps: [
      {
        step_number: 1,
        title: 'About Your Shop',
        description: 'Tell us about your auto repair business',
        fields: [
          { name: 'business_name', label: "What's the name of your shop?", type: 'text', placeholder: "Mike's Auto Care", required: true },
          { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Mike', required: true },
          { name: 'phone', label: 'Shop phone number?', type: 'phone', placeholder: '(555) 123-4567', required: true },
          { name: 'address', label: 'Shop address?', type: 'text', placeholder: '456 Garage Ln, Charlotte, NC', required: false },
        ],
      },
      {
        step_number: 2,
        title: 'Shop Operations',
        description: 'How does your shop run day to day?',
        fields: [
          { name: 'business_hours', label: 'Business hours?', type: 'time_range', placeholder: '7:30 AM - 5:30 PM', required: true },
          { name: 'bay_count', label: 'How many service bays?', type: 'number', placeholder: '4', required: false, help_text: 'Helps King Mouse manage scheduling capacity' },
          { name: 'specialties', label: 'Shop specialties?', type: 'multiselect', placeholder: '', required: false, options: ['Oil changes', 'Brakes', 'Engine repair', 'Transmission', 'Tires', 'AC/Heating', 'Diagnostics', 'Body work', 'Inspections'] },
        ],
      },
      {
        step_number: 3,
        title: 'What Should King Mouse Handle?',
        description: 'Pick the tasks you want automated',
        fields: [
          { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Schedule appointments', 'Send repair estimates', 'Follow up on declined repairs', 'Manage reviews', 'Send service reminders', 'Handle billing questions'] },
        ],
      },
      {
        step_number: 4,
        title: 'Review & Launch',
        description: 'Review your setup and launch King Mouse',
        fields: [
          { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'e.g., We specialize in German cars, we offer a shuttle service...', required: false },
        ],
      },
    ],
    dashboard_widgets: [
      { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 1, icon: 'Phone' },
      { id: 'vehicles-in-shop', title: 'Vehicles in Shop', description: 'Cars currently being serviced', priority: 2, icon: 'Car' },
      { id: 'estimates-pending', title: 'Estimates Pending', description: 'Estimates awaiting approval', priority: 3, icon: 'FileText' },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue collected today', priority: 4, icon: 'DollarSign' },
      { id: 'review-alerts', title: 'Review Alerts', description: 'New reviews to address', priority: 5, icon: 'Star' },
    ],
    sample_tasks: [
      { title: 'Schedule an oil change for tomorrow at 9am', description: 'Book appointments and check bay availability', category: 'Scheduling', difficulty: 'easy' },
      { title: 'Send a repair estimate for the 2019 Camry', description: 'Generate and text/email estimates to customers', category: 'Estimates', difficulty: 'medium' },
      { title: 'Follow up on declined brake job from last week', description: 'Re-engage customers who passed on recommended repairs', category: 'Sales', difficulty: 'medium' },
      { title: 'Respond to a 3-star Google review', description: 'Draft professional responses to reviews', category: 'Reviews', difficulty: 'easy' },
    ],
    kpis: [
      { name: 'Vehicles Serviced', unit: 'vehicles', description: 'Cars completed per day', target_suggestion: 8 },
      { name: 'Avg Repair Order', unit: 'dollars', description: 'Average repair ticket', target_suggestion: 450 },
      { name: 'Estimate Approval Rate', unit: 'percent', description: 'Percentage of estimates approved', target_suggestion: 70 },
      { name: 'Review Rating', unit: 'stars', description: 'Average online rating', target_suggestion: 4.6 },
    ],
    receptionist_greeting: "Thanks for calling {business_name}! This is King Mouse, your AI service advisor. I can schedule service appointments, provide estimates, or check on your vehicle's status. How can I help today?",
    suggested_integrations: [
      { name: 'Shop-Ware', slug: 'shop-ware', category: 'Shop Management', why: 'Sync repair orders and customer history', priority: 'essential' },
      { name: 'Google Business', slug: 'google-business', category: 'Reviews', why: 'Monitor and respond to Google reviews', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'Accounting', why: 'Sync invoices and payments', priority: 'nice-to-have' },
    ],
    estimated_hours_saved_weekly: 18,
    estimated_monthly_value: 3200,
    ideal_plan: 'pro',
  },

  // ─── 3. Hair Salon ───────────────────────────────────────
  {
    id: 'beauty-hair-salon',
    industry: 'Beauty & Personal Care',
    niche: 'Hair Salon',
    display_name: 'Hair Salon',
    emoji: '\u{1F487}',
    tagline: 'Your AI front desk that books while you style',
    wizard_steps: [
      {
        step_number: 1,
        title: 'About Your Salon',
        description: 'Tell us about your salon',
        fields: [
          { name: 'business_name', label: "What's the name of your salon?", type: 'text', placeholder: "Bella's Hair Studio", required: true },
          { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Bella', required: true },
          { name: 'phone', label: 'Salon phone number?', type: 'phone', placeholder: '(555) 234-5678', required: true },
          { name: 'address', label: 'Salon address?', type: 'text', placeholder: '789 Style Ave, Raleigh, NC', required: false },
        ],
      },
      {
        step_number: 2,
        title: 'Services & Scheduling',
        description: 'What services do you offer?',
        fields: [
          { name: 'business_hours', label: 'Salon hours?', type: 'time_range', placeholder: '9:00 AM - 7:00 PM', required: true },
          { name: 'stylist_count', label: 'How many stylists?', type: 'number', placeholder: '3', required: false, help_text: 'Helps King Mouse manage booking capacity' },
          { name: 'services', label: 'Services offered?', type: 'multiselect', placeholder: '', required: false, options: ['Haircut', 'Color', 'Balayage', 'Blowout', 'Extensions', 'Keratin treatment', 'Bridal styling', 'Kids cuts'] },
          { name: 'booking_platform', label: 'Current booking system?', type: 'select', placeholder: 'Select platform', required: false, options: ['None', 'Vagaro', 'Square Appointments', 'Fresha', 'Booksy', 'Other'] },
        ],
      },
      {
        step_number: 3,
        title: 'What Should King Mouse Handle?',
        description: 'Pick the tasks you want automated',
        fields: [
          { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Book appointments', 'Send appointment reminders', 'Handle cancellations', 'Manage reviews', 'Send follow-up texts', 'Promote open slots', 'Handle walk-in inquiries'] },
        ],
      },
      {
        step_number: 4,
        title: 'Review & Launch',
        description: 'Review your setup and launch King Mouse',
        fields: [
          { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'e.g., We require a deposit for color services, no walk-ins on Saturdays...', required: false },
        ],
      },
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Appointments", description: 'Scheduled appointments today', priority: 1, icon: 'Calendar' },
      { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 2, icon: 'Phone' },
      { id: 'open-slots', title: 'Open Slots', description: 'Available booking slots today', priority: 3, icon: 'Clock' },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue today', priority: 4, icon: 'DollarSign' },
      { id: 'review-alerts', title: 'Review Alerts', description: 'New online reviews', priority: 5, icon: 'Star' },
    ],
    sample_tasks: [
      { title: 'Book a balayage appointment for next Tuesday', description: 'Schedule services and check stylist availability', category: 'Booking', difficulty: 'easy' },
      { title: 'Send reminders for tomorrow\'s appointments', description: 'Text/email clients about upcoming visits', category: 'Reminders', difficulty: 'easy' },
      { title: 'Fill the open 2pm slot today', description: 'Text waitlist clients about last-minute availability', category: 'Marketing', difficulty: 'medium' },
      { title: 'Respond to a Google review', description: 'Thank happy clients and address concerns', category: 'Reviews', difficulty: 'easy' },
    ],
    kpis: [
      { name: 'Daily Bookings', unit: 'appointments', description: 'Appointments booked per day', target_suggestion: 12 },
      { name: 'Chair Utilization', unit: 'percent', description: 'Percentage of slots filled', target_suggestion: 85 },
      { name: 'No-show Rate', unit: 'percent', description: 'Percentage of no-shows', target_suggestion: 5 },
      { name: 'Avg Ticket', unit: 'dollars', description: 'Average service total', target_suggestion: 95 },
    ],
    receptionist_greeting: "Thanks for calling {business_name}! This is King Mouse, your AI booking assistant. I can schedule appointments, check availability, or answer questions about our services. How can I help?",
    suggested_integrations: [
      { name: 'Vagaro', slug: 'vagaro', category: 'Booking', why: 'Sync appointments and client profiles', priority: 'essential' },
      { name: 'Instagram', slug: 'instagram', category: 'Social Media', why: 'Share before/after photos automatically', priority: 'recommended' },
      { name: 'Square', slug: 'square', category: 'Payments', why: 'Track revenue and process payments', priority: 'recommended' },
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
  },

  // ─── 4. Plumber ──────────────────────────────────────────
  {
    id: 'home-services-plumber',
    industry: 'Home Services',
    niche: 'Plumber',
    display_name: 'Plumber',
    emoji: '\u{1F527}',
    tagline: 'Your AI dispatcher that keeps jobs flowing',
    wizard_steps: [
      {
        step_number: 1,
        title: 'About Your Business',
        description: 'Tell us about your plumbing company',
        fields: [
          { name: 'business_name', label: "What's the name of your company?", type: 'text', placeholder: "Joe's Plumbing", required: true },
          { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Joe', required: true },
          { name: 'phone', label: 'Business phone number?', type: 'phone', placeholder: '(555) 345-6789', required: true },
          { name: 'service_area', label: 'Service area?', type: 'text', placeholder: 'Raleigh-Durham metro area', required: false, help_text: 'Cities or zip codes you serve' },
        ],
      },
      {
        step_number: 2,
        title: 'Services & Team',
        description: 'What services do you offer?',
        fields: [
          { name: 'business_hours', label: 'Business hours?', type: 'time_range', placeholder: '7:00 AM - 6:00 PM', required: true },
          { name: 'emergency_service', label: 'Do you offer emergency/after-hours service?', type: 'toggle', placeholder: '', required: false, default_value: true },
          { name: 'team_size', label: 'How many plumbers on your team?', type: 'number', placeholder: '3', required: false },
          { name: 'services', label: 'Services offered?', type: 'multiselect', placeholder: '', required: false, options: ['Drain cleaning', 'Leak repair', 'Water heater', 'Pipe repair', 'Sewer line', 'Fixture install', 'Remodeling', 'Inspections'] },
        ],
      },
      {
        step_number: 3,
        title: 'What Should King Mouse Handle?',
        description: 'Pick the tasks you want automated',
        fields: [
          { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Schedule service calls', 'Send estimates', 'Dispatch technicians', 'Follow up after service', 'Manage reviews', 'Handle emergency calls', 'Send invoices'] },
        ],
      },
      {
        step_number: 4,
        title: 'Review & Launch',
        description: 'Review your setup and launch King Mouse',
        fields: [
          { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'e.g., We charge $99 for the first hour, we offer free estimates for sewer lines...', required: false },
        ],
      },
    ],
    dashboard_widgets: [
      { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 1, icon: 'Phone' },
      { id: 'todays-appointments', title: 'Jobs Scheduled', description: 'Service calls today', priority: 2, icon: 'Calendar' },
      { id: 'estimates-pending', title: 'Estimates Pending', description: 'Estimates awaiting approval', priority: 3, icon: 'FileText' },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue collected today', priority: 4, icon: 'DollarSign' },
      { id: 'review-alerts', title: 'Review Alerts', description: 'New online reviews', priority: 5, icon: 'Star' },
    ],
    sample_tasks: [
      { title: 'Schedule a drain cleaning for tomorrow morning', description: 'Book service calls and check technician availability', category: 'Scheduling', difficulty: 'easy' },
      { title: 'Send an estimate for the water heater replacement', description: 'Generate and send estimates to customers', category: 'Estimates', difficulty: 'medium' },
      { title: 'Follow up with last week\'s emergency call customer', description: 'Check satisfaction and ask for a review', category: 'Follow-up', difficulty: 'easy' },
      { title: 'Respond to a negative Yelp review', description: 'Draft professional review responses', category: 'Reviews', difficulty: 'easy' },
    ],
    kpis: [
      { name: 'Jobs Completed', unit: 'jobs', description: 'Service calls completed per day', target_suggestion: 6 },
      { name: 'Avg Job Value', unit: 'dollars', description: 'Average invoice amount', target_suggestion: 350 },
      { name: 'Response Time', unit: 'minutes', description: 'Average time to return a call', target_suggestion: 5 },
      { name: 'Review Rating', unit: 'stars', description: 'Average online rating', target_suggestion: 4.7 },
    ],
    receptionist_greeting: "Thanks for calling {business_name}! This is King Mouse, your AI dispatcher. I can schedule service calls, provide estimates, or connect you with a plumber for emergencies. How can I help?",
    suggested_integrations: [
      { name: 'ServiceTitan', slug: 'servicetitan', category: 'Field Service', why: 'Sync jobs, dispatch, and invoicing', priority: 'essential' },
      { name: 'Google Business', slug: 'google-business', category: 'Reviews', why: 'Monitor and respond to Google reviews', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'Accounting', why: 'Sync invoices and track payments', priority: 'nice-to-have' },
    ],
    estimated_hours_saved_weekly: 20,
    estimated_monthly_value: 3500,
    ideal_plan: 'pro',
  },

  // ─── 5. Dentist ──────────────────────────────────────────
  {
    id: 'healthcare-dentist',
    industry: 'Healthcare',
    niche: 'Dentist',
    display_name: 'Dentist',
    emoji: '\u{1F9B7}',
    tagline: 'Your AI front office that keeps the chairs full',
    wizard_steps: [
      {
        step_number: 1,
        title: 'About Your Practice',
        description: 'Tell us about your dental practice',
        fields: [
          { name: 'business_name', label: "What's the name of your practice?", type: 'text', placeholder: 'Bright Smile Dental', required: true },
          { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Dr. Smith', required: true },
          { name: 'phone', label: 'Office phone number?', type: 'phone', placeholder: '(555) 456-7890', required: true },
          { name: 'address', label: 'Office address?', type: 'text', placeholder: '321 Dental Way, Durham, NC', required: false },
        ],
      },
      {
        step_number: 2,
        title: 'Practice Operations',
        description: 'How does your practice run?',
        fields: [
          { name: 'business_hours', label: 'Office hours?', type: 'time_range', placeholder: '8:00 AM - 5:00 PM', required: true },
          { name: 'chair_count', label: 'How many treatment chairs?', type: 'number', placeholder: '4', required: false },
          { name: 'services', label: 'Services offered?', type: 'multiselect', placeholder: '', required: false, options: ['Cleanings', 'Fillings', 'Root canals', 'Crowns', 'Implants', 'Whitening', 'Invisalign', 'Emergency care', 'Pediatric'] },
          { name: 'practice_mgmt', label: 'Practice management software?', type: 'select', placeholder: 'Select software', required: false, options: ['None', 'Dentrix', 'Eaglesoft', 'Open Dental', 'Curve Dental', 'Other'] },
        ],
      },
      {
        step_number: 3,
        title: 'What Should King Mouse Handle?',
        description: 'Pick the tasks you want automated',
        fields: [
          { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Schedule appointments', 'Send appointment reminders', 'Handle insurance questions', 'Recall reminders', 'New patient intake', 'Manage reviews', 'Follow up on treatment plans'] },
        ],
      },
      {
        step_number: 4,
        title: 'Review & Launch',
        description: 'Review your setup and launch King Mouse',
        fields: [
          { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'e.g., We accept most PPO plans, new patients get a free exam...', required: false },
        ],
      },
    ],
    dashboard_widgets: [
      { id: 'patient-schedule', title: "Today's Patients", description: 'Patient schedule today', priority: 1, icon: 'Users' },
      { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 2, icon: 'Phone' },
      { id: 'recalls-due', title: 'Recalls Due', description: 'Patients due for recall', priority: 3, icon: 'Bell' },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue today', priority: 4, icon: 'DollarSign' },
      { id: 'review-alerts', title: 'Review Alerts', description: 'New online reviews', priority: 5, icon: 'Star' },
    ],
    sample_tasks: [
      { title: 'Schedule a cleaning for next Wednesday at 2pm', description: 'Book patient appointments and check availability', category: 'Scheduling', difficulty: 'easy' },
      { title: 'Send recall reminders to patients due this month', description: 'Reach out to patients overdue for their 6-month checkup', category: 'Recalls', difficulty: 'easy' },
      { title: 'Handle a new patient intake call', description: 'Collect insurance info and schedule first visit', category: 'New Patients', difficulty: 'medium' },
      { title: 'Follow up on the crown treatment plan for Sarah', description: 'Re-engage patients who need to schedule treatment', category: 'Treatment Plans', difficulty: 'medium' },
    ],
    kpis: [
      { name: 'Patients Seen', unit: 'patients', description: 'Patients treated per day', target_suggestion: 18 },
      { name: 'Recall Rate', unit: 'percent', description: 'Percentage of patients returning for recall', target_suggestion: 80 },
      { name: 'New Patients', unit: 'patients', description: 'New patients per month', target_suggestion: 25 },
      { name: 'Treatment Acceptance', unit: 'percent', description: 'Percentage of treatment plans accepted', target_suggestion: 65 },
    ],
    receptionist_greeting: "Thanks for calling {business_name}! This is King Mouse, your AI front desk assistant. I can schedule appointments, answer insurance questions, or help with anything else. How can I help you today?",
    suggested_integrations: [
      { name: 'Dentrix', slug: 'dentrix', category: 'Practice Management', why: 'Sync patient schedules and records', priority: 'essential' },
      { name: 'Google Business', slug: 'google-business', category: 'Reviews', why: 'Monitor and respond to patient reviews', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'Marketing', why: 'Send recall emails and newsletters', priority: 'nice-to-have' },
    ],
    estimated_hours_saved_weekly: 22,
    estimated_monthly_value: 4000,
    ideal_plan: 'growth',
  },

  // ─── 6. Chiropractor ─────────────────────────────────────
  {
    id: 'healthcare-chiropractor',
    industry: 'Healthcare',
    niche: 'Chiropractor',
    display_name: 'Chiropractor',
    emoji: '\u{1F9B4}',
    tagline: 'Your AI front desk that aligns your schedule',
    wizard_steps: [
      {
        step_number: 1,
        title: 'About Your Practice',
        description: 'Tell us about your chiropractic practice',
        fields: [
          { name: 'business_name', label: "What's the name of your practice?", type: 'text', placeholder: 'Peak Chiropractic', required: true },
          { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Dr. Johnson', required: true },
          { name: 'phone', label: 'Office phone number?', type: 'phone', placeholder: '(555) 567-8901', required: true },
          { name: 'address', label: 'Office address?', type: 'text', placeholder: '555 Wellness Blvd, Greensboro, NC', required: false },
        ],
      },
      {
        step_number: 2,
        title: 'Practice Operations',
        description: 'How does your practice operate?',
        fields: [
          { name: 'business_hours', label: 'Office hours?', type: 'time_range', placeholder: '8:00 AM - 6:00 PM', required: true },
          { name: 'services', label: 'Services offered?', type: 'multiselect', placeholder: '', required: false, options: ['Adjustments', 'X-rays', 'Massage therapy', 'Rehabilitation', 'Spinal decompression', 'Sports chiropractic', 'Prenatal', 'Pediatric'] },
          { name: 'accepts_insurance', label: 'Do you accept insurance?', type: 'toggle', placeholder: '', required: false, default_value: true },
        ],
      },
      {
        step_number: 3,
        title: 'What Should King Mouse Handle?',
        description: 'Pick the tasks you want automated',
        fields: [
          { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Schedule appointments', 'Send reminders', 'Handle insurance verification', 'New patient intake', 'Manage reviews', 'Recall reminders', 'Handle billing questions'] },
        ],
      },
      {
        step_number: 4,
        title: 'Review & Launch',
        description: 'Review your setup and launch King Mouse',
        fields: [
          { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'e.g., New patients need to arrive 15 min early, we accept most major insurance...', required: false },
        ],
      },
    ],
    dashboard_widgets: [
      { id: 'patient-schedule', title: "Today's Patients", description: 'Patient schedule today', priority: 1, icon: 'Users' },
      { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 2, icon: 'Phone' },
      { id: 'open-slots', title: 'Open Slots', description: 'Available slots today', priority: 3, icon: 'Clock' },
      { id: 'new-clients', title: 'New Patients', description: 'New patients this week', priority: 4, icon: 'UserPlus' },
      { id: 'review-alerts', title: 'Review Alerts', description: 'New online reviews', priority: 5, icon: 'Star' },
    ],
    sample_tasks: [
      { title: 'Schedule a new patient consultation for Friday', description: 'Book first-visit appointments with intake forms', category: 'Scheduling', difficulty: 'easy' },
      { title: 'Send appointment reminders for tomorrow', description: 'Text/call patients about upcoming visits', category: 'Reminders', difficulty: 'easy' },
      { title: 'Verify insurance for next week\'s new patients', description: 'Check coverage before visits', category: 'Insurance', difficulty: 'medium' },
      { title: 'Ask last week\'s patients to leave a review', description: 'Send review request texts', category: 'Reviews', difficulty: 'easy' },
    ],
    kpis: [
      { name: 'Patient Visits', unit: 'visits', description: 'Patient visits per day', target_suggestion: 24 },
      { name: 'New Patients', unit: 'patients', description: 'New patients per month', target_suggestion: 20 },
      { name: 'Retention Rate', unit: 'percent', description: 'Patients completing care plans', target_suggestion: 75 },
      { name: 'Review Rating', unit: 'stars', description: 'Average online rating', target_suggestion: 4.8 },
    ],
    receptionist_greeting: "Thanks for calling {business_name}! This is King Mouse, your AI assistant. I can schedule appointments, answer insurance questions, or help new patients get started. How can I help?",
    suggested_integrations: [
      { name: 'ChiroTouch', slug: 'chirotouch', category: 'Practice Management', why: 'Sync patient schedules and records', priority: 'essential' },
      { name: 'Google Business', slug: 'google-business', category: 'Reviews', why: 'Monitor and respond to reviews', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'Payments', why: 'Process copays and self-pay', priority: 'nice-to-have' },
    ],
    estimated_hours_saved_weekly: 16,
    estimated_monthly_value: 2800,
    ideal_plan: 'pro',
  },

  // ─── 7. House Cleaning ───────────────────────────────────
  {
    id: 'home-services-house-cleaning',
    industry: 'Home Services',
    niche: 'House Cleaning',
    display_name: 'House Cleaning',
    emoji: '\u{1F9F9}',
    tagline: 'Your AI office manager that fills your cleaning calendar',
    wizard_steps: [
      {
        step_number: 1,
        title: 'About Your Business',
        description: 'Tell us about your cleaning business',
        fields: [
          { name: 'business_name', label: "What's the name of your company?", type: 'text', placeholder: 'Sparkling Clean Co.', required: true },
          { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Maria', required: true },
          { name: 'phone', label: 'Business phone number?', type: 'phone', placeholder: '(555) 678-9012', required: true },
          { name: 'service_area', label: 'Service area?', type: 'text', placeholder: 'Charlotte metro area', required: false },
        ],
      },
      {
        step_number: 2,
        title: 'Services & Team',
        description: 'What cleaning services do you offer?',
        fields: [
          { name: 'business_hours', label: 'Business hours?', type: 'time_range', placeholder: '8:00 AM - 5:00 PM', required: true },
          { name: 'team_size', label: 'How many cleaners on your team?', type: 'number', placeholder: '4', required: false },
          { name: 'services', label: 'Services offered?', type: 'multiselect', placeholder: '', required: false, options: ['Regular cleaning', 'Deep cleaning', 'Move-in/move-out', 'Office cleaning', 'Post-construction', 'Carpet cleaning', 'Window cleaning', 'Organizing'] },
          { name: 'base_price', label: 'Starting price for a standard cleaning?', type: 'currency', placeholder: '120', required: false, help_text: 'Helps King Mouse provide accurate quotes' },
        ],
      },
      {
        step_number: 3,
        title: 'What Should King Mouse Handle?',
        description: 'Pick the tasks you want automated',
        fields: [
          { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Book cleaning jobs', 'Send quotes', 'Dispatch teams', 'Send reminders', 'Follow up after cleaning', 'Manage reviews', 'Handle recurring schedules'] },
        ],
      },
      {
        step_number: 4,
        title: 'Review & Launch',
        description: 'Review your setup and launch King Mouse',
        fields: [
          { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'e.g., We bring our own supplies, we offer a satisfaction guarantee...', required: false },
        ],
      },
    ],
    dashboard_widgets: [
      { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 1, icon: 'Phone' },
      { id: 'todays-appointments', title: "Today's Jobs", description: 'Cleaning jobs today', priority: 2, icon: 'Calendar' },
      { id: 'pipeline', title: 'New Leads', description: 'Incoming quote requests', priority: 3, icon: 'Users' },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue today', priority: 4, icon: 'DollarSign' },
      { id: 'review-alerts', title: 'Review Alerts', description: 'New online reviews', priority: 5, icon: 'Star' },
    ],
    sample_tasks: [
      { title: 'Book a deep cleaning for next Monday', description: 'Schedule cleaning jobs and assign teams', category: 'Booking', difficulty: 'easy' },
      { title: 'Send a quote for a 3-bedroom house', description: 'Generate and send estimates based on your pricing', category: 'Quotes', difficulty: 'easy' },
      { title: 'Follow up with last week\'s new clients', description: 'Ask about satisfaction and schedule recurring service', category: 'Follow-up', difficulty: 'medium' },
      { title: 'Respond to a Google review', description: 'Thank happy clients and address any concerns', category: 'Reviews', difficulty: 'easy' },
    ],
    kpis: [
      { name: 'Jobs Completed', unit: 'jobs', description: 'Cleaning jobs completed per week', target_suggestion: 20 },
      { name: 'Recurring Clients', unit: 'clients', description: 'Clients on recurring schedules', target_suggestion: 30 },
      { name: 'Avg Job Value', unit: 'dollars', description: 'Average cleaning ticket', target_suggestion: 150 },
      { name: 'Review Rating', unit: 'stars', description: 'Average online rating', target_suggestion: 4.8 },
    ],
    receptionist_greeting: "Thanks for calling {business_name}! This is King Mouse, your AI booking assistant. I can schedule cleanings, provide quotes, or answer any questions. How can I help?",
    suggested_integrations: [
      { name: 'Jobber', slug: 'jobber', category: 'Field Service', why: 'Manage jobs, quotes, and invoicing', priority: 'essential' },
      { name: 'Google Business', slug: 'google-business', category: 'Reviews', why: 'Monitor and respond to reviews', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'Payments', why: 'Process online payments', priority: 'nice-to-have' },
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
  },

  // ─── 8. HVAC ─────────────────────────────────────────────
  {
    id: 'home-services-hvac',
    industry: 'Home Services',
    niche: 'HVAC',
    display_name: 'HVAC',
    emoji: '\u{1F321}\u{FE0F}',
    tagline: 'Your AI dispatcher that keeps calls cool and revenue hot',
    wizard_steps: [
      {
        step_number: 1,
        title: 'About Your Business',
        description: 'Tell us about your HVAC company',
        fields: [
          { name: 'business_name', label: "What's the name of your company?", type: 'text', placeholder: 'Cool Breeze HVAC', required: true },
          { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Dave', required: true },
          { name: 'phone', label: 'Business phone number?', type: 'phone', placeholder: '(555) 789-0123', required: true },
          { name: 'service_area', label: 'Service area?', type: 'text', placeholder: 'Triangle area, NC', required: false },
        ],
      },
      {
        step_number: 2,
        title: 'Services & Operations',
        description: 'What HVAC services do you offer?',
        fields: [
          { name: 'business_hours', label: 'Business hours?', type: 'time_range', placeholder: '7:00 AM - 6:00 PM', required: true },
          { name: 'emergency_service', label: 'Do you offer 24/7 emergency service?', type: 'toggle', placeholder: '', required: false, default_value: true },
          { name: 'team_size', label: 'How many technicians?', type: 'number', placeholder: '5', required: false },
          { name: 'services', label: 'Services offered?', type: 'multiselect', placeholder: '', required: false, options: ['AC repair', 'Heating repair', 'Installation', 'Maintenance plans', 'Duct cleaning', 'Indoor air quality', 'Mini-splits', 'Commercial HVAC'] },
        ],
      },
      {
        step_number: 3,
        title: 'What Should King Mouse Handle?',
        description: 'Pick the tasks you want automated',
        fields: [
          { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Schedule service calls', 'Handle emergency dispatch', 'Send estimates', 'Maintenance plan renewals', 'Follow up after service', 'Manage reviews', 'Seasonal marketing'] },
        ],
      },
      {
        step_number: 4,
        title: 'Review & Launch',
        description: 'Review your setup and launch King Mouse',
        fields: [
          { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'e.g., We offer $59 diagnostic calls, free estimates on replacements...', required: false },
        ],
      },
    ],
    dashboard_widgets: [
      { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 1, icon: 'Phone' },
      { id: 'todays-appointments', title: "Today's Jobs", description: 'Service calls today', priority: 2, icon: 'Calendar' },
      { id: 'estimates-pending', title: 'Estimates Pending', description: 'Estimates awaiting approval', priority: 3, icon: 'FileText' },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue today', priority: 4, icon: 'DollarSign' },
      { id: 'review-alerts', title: 'Review Alerts', description: 'New online reviews', priority: 5, icon: 'Star' },
    ],
    sample_tasks: [
      { title: 'Schedule an AC tune-up for Thursday', description: 'Book service appointments and dispatch techs', category: 'Scheduling', difficulty: 'easy' },
      { title: 'Send a replacement estimate for the Smith job', description: 'Generate and send equipment replacement quotes', category: 'Estimates', difficulty: 'medium' },
      { title: 'Send maintenance plan renewal reminders', description: 'Contact customers whose maintenance plans are expiring', category: 'Retention', difficulty: 'easy' },
      { title: 'Handle an after-hours emergency call', description: 'Triage urgency and dispatch or schedule', category: 'Emergency', difficulty: 'medium' },
    ],
    kpis: [
      { name: 'Jobs Completed', unit: 'jobs', description: 'Service calls completed per day', target_suggestion: 8 },
      { name: 'Avg Ticket', unit: 'dollars', description: 'Average service ticket', target_suggestion: 500 },
      { name: 'Maintenance Plans', unit: 'plans', description: 'Active maintenance agreements', target_suggestion: 150 },
      { name: 'Review Rating', unit: 'stars', description: 'Average online rating', target_suggestion: 4.7 },
    ],
    receptionist_greeting: "Thanks for calling {business_name}! This is King Mouse, your AI service coordinator. I can schedule service calls, provide estimates, or help with an emergency. How can I help?",
    suggested_integrations: [
      { name: 'ServiceTitan', slug: 'servicetitan', category: 'Field Service', why: 'Sync jobs, dispatch, and invoicing', priority: 'essential' },
      { name: 'Google Business', slug: 'google-business', category: 'Reviews', why: 'Monitor and respond to reviews', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'Accounting', why: 'Sync invoices and payments', priority: 'nice-to-have' },
    ],
    estimated_hours_saved_weekly: 20,
    estimated_monthly_value: 3800,
    ideal_plan: 'growth',
  },

  // ─── 9. Lawyer ───────────────────────────────────────────
  {
    id: 'professional-lawyer',
    industry: 'Professional Services',
    niche: 'Lawyer',
    display_name: 'Lawyer',
    emoji: '\u{2696}\u{FE0F}',
    tagline: 'Your AI intake specialist that screens and schedules',
    wizard_steps: [
      {
        step_number: 1,
        title: 'About Your Firm',
        description: 'Tell us about your law practice',
        fields: [
          { name: 'business_name', label: "What's the name of your firm?", type: 'text', placeholder: 'Smith & Associates', required: true },
          { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Attorney Smith', required: true },
          { name: 'phone', label: 'Office phone number?', type: 'phone', placeholder: '(555) 890-1234', required: true },
          { name: 'address', label: 'Office address?', type: 'text', placeholder: '100 Legal Way, Raleigh, NC', required: false },
        ],
      },
      {
        step_number: 2,
        title: 'Practice Areas',
        description: 'What areas of law do you practice?',
        fields: [
          { name: 'business_hours', label: 'Office hours?', type: 'time_range', placeholder: '8:30 AM - 5:30 PM', required: true },
          { name: 'practice_areas', label: 'Practice areas?', type: 'multiselect', placeholder: '', required: true, options: ['Personal injury', 'Family law', 'Criminal defense', 'Estate planning', 'Business law', 'Real estate', 'Immigration', 'Bankruptcy', 'Employment law'] },
          { name: 'consultation_fee', label: 'Initial consultation fee?', type: 'select', placeholder: 'Select option', required: false, options: ['Free consultation', '$50', '$100', '$150', '$200', '$250+'] },
        ],
      },
      {
        step_number: 3,
        title: 'What Should King Mouse Handle?',
        description: 'Pick the tasks you want automated',
        fields: [
          { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Screen potential clients', 'Schedule consultations', 'Client intake forms', 'Follow up on leads', 'Manage reviews', 'Send appointment reminders', 'Handle billing inquiries'] },
        ],
      },
      {
        step_number: 4,
        title: 'Review & Launch',
        description: 'Review your setup and launch King Mouse',
        fields: [
          { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'e.g., We offer free consultations for personal injury cases, conflicts check is required...', required: false },
        ],
      },
    ],
    dashboard_widgets: [
      { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 1, icon: 'Phone' },
      { id: 'pipeline', title: 'Lead Pipeline', description: 'Potential client leads', priority: 2, icon: 'Users' },
      { id: 'todays-appointments', title: 'Consultations Today', description: 'Scheduled consultations', priority: 3, icon: 'Calendar' },
      { id: 'new-clients', title: 'New Clients', description: 'New clients this week', priority: 4, icon: 'UserPlus' },
      { id: 'review-alerts', title: 'Review Alerts', description: 'New online reviews', priority: 5, icon: 'Star' },
    ],
    sample_tasks: [
      { title: 'Screen a new personal injury inquiry', description: 'Qualify leads by asking case details and checking conflicts', category: 'Intake', difficulty: 'medium' },
      { title: 'Schedule a consultation for tomorrow at 3pm', description: 'Book client consultations and send confirmations', category: 'Scheduling', difficulty: 'easy' },
      { title: 'Follow up with last week\'s consultation leads', description: 'Re-engage potential clients who haven\'t retained', category: 'Follow-up', difficulty: 'medium' },
      { title: 'Send a review request to recent clients', description: 'Ask satisfied clients to leave Google/Avvo reviews', category: 'Reviews', difficulty: 'easy' },
    ],
    kpis: [
      { name: 'Leads Screened', unit: 'leads', description: 'Potential clients screened per week', target_suggestion: 15 },
      { name: 'Consultation Rate', unit: 'percent', description: 'Leads that become consultations', target_suggestion: 40 },
      { name: 'Retention Rate', unit: 'percent', description: 'Consultations that become clients', target_suggestion: 60 },
      { name: 'Review Rating', unit: 'stars', description: 'Average online rating', target_suggestion: 4.8 },
    ],
    receptionist_greeting: "Thanks for calling {business_name}! This is King Mouse, the firm's AI intake specialist. I can help schedule a consultation, answer general questions about our practice areas, or take a message for an attorney. How can I assist you?",
    suggested_integrations: [
      { name: 'Clio', slug: 'clio', category: 'Practice Management', why: 'Sync cases, contacts, and billing', priority: 'essential' },
      { name: 'Google Business', slug: 'google-business', category: 'Reviews', why: 'Monitor and respond to client reviews', priority: 'recommended' },
      { name: 'Calendly', slug: 'calendly', category: 'Scheduling', why: 'Enable self-service consultation booking', priority: 'nice-to-have' },
    ],
    estimated_hours_saved_weekly: 18,
    estimated_monthly_value: 4500,
    ideal_plan: 'growth',
  },

  // ─── 10. Gym ─────────────────────────────────────────────
  {
    id: 'fitness-gym',
    industry: 'Fitness & Wellness',
    niche: 'Gym',
    display_name: 'Gym',
    emoji: '\u{1F4AA}',
    tagline: 'Your AI front desk that flexes your membership sales',
    wizard_steps: [
      {
        step_number: 1,
        title: 'About Your Gym',
        description: 'Tell us about your fitness facility',
        fields: [
          { name: 'business_name', label: "What's the name of your gym?", type: 'text', placeholder: 'Iron Works Fitness', required: true },
          { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Coach Mike', required: true },
          { name: 'phone', label: 'Gym phone number?', type: 'phone', placeholder: '(555) 901-2345', required: true },
          { name: 'address', label: 'Gym address?', type: 'text', placeholder: '200 Fitness Dr, Chapel Hill, NC', required: false },
        ],
      },
      {
        step_number: 2,
        title: 'Facility & Services',
        description: 'What does your gym offer?',
        fields: [
          { name: 'business_hours', label: 'Gym hours?', type: 'time_range', placeholder: '5:00 AM - 10:00 PM', required: true },
          { name: 'gym_type', label: 'Type of gym?', type: 'select', placeholder: 'Select type', required: false, options: ['General fitness', 'CrossFit', 'Boutique/studio', 'Martial arts', 'Yoga studio', 'Personal training', 'Other'] },
          { name: 'services', label: 'Services offered?', type: 'multiselect', placeholder: '', required: false, options: ['Memberships', 'Personal training', 'Group classes', 'Nutrition coaching', 'Youth programs', 'Corporate wellness', 'Day passes', 'Online training'] },
          { name: 'membership_price', label: 'Starting membership price?', type: 'currency', placeholder: '49', required: false },
        ],
      },
      {
        step_number: 3,
        title: 'What Should King Mouse Handle?',
        description: 'Pick the tasks you want automated',
        fields: [
          { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Handle membership inquiries', 'Book free trials', 'Send class reminders', 'Follow up with expired members', 'Manage reviews', 'Handle billing questions', 'Promote upcoming events'] },
        ],
      },
      {
        step_number: 4,
        title: 'Review & Launch',
        description: 'Review your setup and launch King Mouse',
        fields: [
          { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'e.g., We offer a free 7-day trial, new members get a free PT session...', required: false },
        ],
      },
    ],
    dashboard_widgets: [
      { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 1, icon: 'Phone' },
      { id: 'new-clients', title: 'New Members', description: 'New signups this week', priority: 2, icon: 'UserPlus' },
      { id: 'todays-appointments', title: "Today's Classes", description: 'Scheduled classes today', priority: 3, icon: 'Calendar' },
      { id: 'pipeline', title: 'Trial Leads', description: 'Free trial signups pending', priority: 4, icon: 'Users' },
      { id: 'review-alerts', title: 'Review Alerts', description: 'New online reviews', priority: 5, icon: 'Star' },
    ],
    sample_tasks: [
      { title: 'Book a free trial visit for this Saturday', description: 'Schedule trial workouts for prospective members', category: 'Sales', difficulty: 'easy' },
      { title: 'Follow up with members who haven\'t visited in 2 weeks', description: 'Re-engage inactive members with encouragement', category: 'Retention', difficulty: 'medium' },
      { title: 'Send a text blast about the new HIIT class', description: 'Promote new classes and events to your member list', category: 'Marketing', difficulty: 'easy' },
      { title: 'Handle a membership cancellation request', description: 'Save at-risk members with retention offers', category: 'Retention', difficulty: 'medium' },
    ],
    kpis: [
      { name: 'New Members', unit: 'members', description: 'New signups per month', target_suggestion: 25 },
      { name: 'Churn Rate', unit: 'percent', description: 'Members cancelling per month', target_suggestion: 5 },
      { name: 'Class Attendance', unit: 'percent', description: 'Average class fill rate', target_suggestion: 75 },
      { name: 'Trial Conversion', unit: 'percent', description: 'Free trials that become members', target_suggestion: 50 },
    ],
    receptionist_greeting: "Thanks for calling {business_name}! This is King Mouse, your AI fitness assistant. I can answer questions about memberships, book a free trial, or help with your account. How can I help?",
    suggested_integrations: [
      { name: 'Mindbody', slug: 'mindbody', category: 'Gym Management', why: 'Sync memberships, classes, and scheduling', priority: 'essential' },
      { name: 'Google Business', slug: 'google-business', category: 'Reviews', why: 'Monitor and respond to reviews', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'Marketing', why: 'Send member newsletters and promotions', priority: 'nice-to-have' },
    ],
    estimated_hours_saved_weekly: 16,
    estimated_monthly_value: 2600,
    ideal_plan: 'pro',
  },
];
