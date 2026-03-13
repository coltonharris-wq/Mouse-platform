import type { ProTemplate } from '../schema';

export const automotiveTemplates: ProTemplate[] = [
  // ─── 1. AUTO REPAIR SHOP ───
  {
    id: 'auto-repair-shop',
    industry: 'Automotive',
    niche: 'Auto Repair Shop',
    display_name: 'Auto Repair Shop',
    emoji: '🔧',
    tagline: 'Your AI shop manager that books appointments, sends estimates, and keeps customers coming back.',
    demo_greeting: "Hey there! I'm Mouse, your AI shop manager. I handle appointments, send estimates, and follow up with customers — so you can stay under the hood. Want to see how I'd handle a call from a customer whose check engine light just came on?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for an auto repair shop. Show how you handle appointment booking, estimate follow-ups, and service reminders. Be friendly, knowledgeable about common car issues, and speak in plain language — no mechanic jargon unless the customer uses it first. Always reassure the customer that their car is in good hands.",
    demo_suggested_messages: [
      'My check engine light just came on',
      'How much does a brake job cost?',
      'I need an oil change appointment',
      'My car is making a weird noise'
    ],
    soul_template: "You are Mouse, the AI shop manager for {{business_name}}. You help {{owner_name}} run their auto repair shop by managing appointments, following up on estimates, sending service reminders, and keeping customers informed. You know common repair timelines and can explain car issues in plain English. You're honest, reliable, and never upsell — just like a good mechanic. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse, your virtual assistant. I can help you schedule service, check on your vehicle's status, or answer questions. How can I help you today?",
    receptionist_system_prompt: "You are Mouse, the AI phone receptionist for {{business_name}}, an auto repair shop. You can book appointments, provide general repair timelines, check vehicle status if given a name, and transfer to a technician for complex diagnostics. Be warm, reassuring, and speak in everyday language. If someone describes an urgent safety issue (brakes failing, smoke, fluid leaking while driving), treat it as urgent and offer immediate guidance plus same-day appointment.",
    receptionist_faqs: [
      { question: 'How much does an oil change cost?', answer: "Our standard oil change starts at {{oil_change_price}}. Synthetic oil is a bit more. We can get you in and out in about 30 minutes. Want me to book a time?", category: 'pricing' },
      { question: 'How long does a brake job take?', answer: "A brake pad replacement usually takes 1-2 hours. If rotors need resurfacing or replacement, it could be 2-3 hours. We'll give you a firm estimate once we take a look.", category: 'services' },
      { question: 'Do you offer free estimates?', answer: "We do a free visual inspection. If we need to do diagnostic work that takes time on the lift, there's a small diagnostic fee that gets applied to your repair if you go ahead with it.", category: 'pricing' },
      { question: 'Can I wait while my car is being fixed?', answer: "Absolutely! We have a comfortable waiting area with Wi-Fi and coffee. For longer repairs, we can also arrange a ride or loaner vehicle if available.", category: 'general' },
      { question: 'Do you work on all makes and models?', answer: "Yes, we service all major makes and models — domestic and foreign. Our techs are ASE certified and have experience with just about everything on the road.", category: 'services' },
      { question: 'What forms of payment do you accept?', answer: "We accept cash, all major credit cards, debit cards, and we also offer financing through {{financing_partner}} for larger repairs.", category: 'billing' }
    ],
    receptionist_transfer_triggers: [
      'wants to speak to a mechanic about a specific diagnosis',
      'has a complaint about a previous repair',
      'asking about warranty claim on recent work',
      'vehicle is undriveable and needs towing arranged',
      'commercial fleet account inquiry'
    ],
    wizard_steps: [
      {
        step_number: 1,
        title: 'Your Shop',
        description: "Let's get your shop set up in Mouse.",
        fields: [
          { name: 'business_name', label: 'Shop Name', type: 'text', placeholder: "Mike's Auto Repair", required: true },
          { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Mike Johnson', required: true },
          { name: 'phone', label: 'Shop Phone', type: 'phone', placeholder: '(555) 123-4567', required: true },
          { name: 'address', label: 'Shop Address', type: 'text', placeholder: '123 Main St, Anytown, USA', required: true }
        ]
      },
      {
        step_number: 2,
        title: 'Services & Hours',
        description: 'What services do you offer and when are you open?',
        fields: [
          { name: 'services', label: 'Services Offered', type: 'multiselect', placeholder: 'Select your services', required: true, options: ['Oil Changes', 'Brake Service', 'Engine Repair', 'Transmission', 'AC/Heating', 'Electrical', 'Suspension', 'Exhaust', 'Tire Service', 'State Inspection', 'Diagnostics', 'Tune-Ups'] },
          { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-6pm', required: true },
          { name: 'oil_change_price', label: 'Starting Oil Change Price', type: 'currency', placeholder: '39.99', required: false, help_text: 'Used in customer quotes' }
        ]
      },
      {
        step_number: 3,
        title: 'Customer Experience',
        description: 'How do you want Mouse to interact with your customers?',
        fields: [
          { name: 'appointment_buffer', label: 'Time Between Appointments', type: 'select', placeholder: 'Select buffer time', required: true, options: ['15 minutes', '30 minutes', '1 hour'] },
          { name: 'estimate_method', label: 'How Do You Send Estimates?', type: 'select', placeholder: 'Select method', required: true, options: ['Text message', 'Email', 'Phone call', 'All of the above'] },
          { name: 'financing_partner', label: 'Financing Partner (if any)', type: 'text', placeholder: 'Synchrony, GreenSky, etc.', required: false }
        ]
      },
      {
        step_number: 4,
        title: 'Get Started',
        description: 'A couple more details and you\'re ready to roll.',
        fields: [
          { name: 'website', label: 'Website (if you have one)', type: 'url', placeholder: 'www.mikesauto.com', required: false },
          { name: 'specialties', label: 'Any Specialties?', type: 'text', placeholder: 'Diesel trucks, European cars, classic cars...', required: false, help_text: 'Mouse will highlight these to customers' }
        ]
      }
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Appointments", description: 'All scheduled service appointments for today with vehicle and service details.', priority: 1 },
      { id: 'pending-estimates', title: 'Pending Estimates', description: 'Estimates sent to customers awaiting approval.', priority: 2 },
      { id: 'vehicles-in-shop', title: 'Vehicles in Shop', description: 'Current vehicles being worked on with status and estimated completion.', priority: 3 },
      { id: 'service-reminders', title: 'Upcoming Service Reminders', description: 'Customers due for scheduled maintenance this week.', priority: 4 },
      { id: 'revenue-today', title: "Today's Revenue", description: 'Total invoiced and collected today.', priority: 5 }
    ],
    sample_tasks: [
      { title: 'Send service reminder to customers due for oil change', description: 'Text all customers whose last oil change was 4+ months ago.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Follow up on pending estimate', description: "Send a friendly nudge to customers who haven't approved their estimate in 48 hours.", category: 'sales', difficulty: 'automatic' },
      { title: 'Book appointment from voicemail', description: 'Listen to after-hours voicemail and create appointment with details.', category: 'scheduling', difficulty: 'needs-approval' },
      { title: 'Send vehicle ready notification', description: "Text the customer that their car is done and ready for pickup.", category: 'operations', difficulty: 'automatic' },
      { title: 'Generate monthly revenue report', description: 'Summarize total repairs, average ticket, and top services for the month.', category: 'reporting', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Average Repair Order Value', unit: 'dollars', description: 'Average dollar amount per repair order.', target_suggestion: 350 },
      { name: 'Bay Utilization Rate', unit: 'percentage', description: 'Percentage of available bay-hours that are booked.', target_suggestion: 80 },
      { name: 'Estimate Approval Rate', unit: 'percentage', description: 'Percentage of sent estimates that get approved.', target_suggestion: 70 },
      { name: 'Customer Return Rate', unit: 'percentage', description: 'Percentage of customers who return within 12 months.', target_suggestion: 60 }
    ],
    suggested_integrations: [
      { name: 'Shop-Ware', slug: 'shop-ware', category: 'shop-management', why: 'Syncs repair orders, estimates, and customer history.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Manage reviews and show up in local search when people search for mechanics.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Auto-sync invoices and track shop finances.', priority: 'recommended' },
      { name: 'Carfax', slug: 'carfax', category: 'industry', why: 'Pull vehicle history and share service records with customers.', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Accept payments and send digital invoices.', priority: 'recommended' }
    ],
    integration_priority: ['shop-ware', 'google-business', 'quickbooks', 'carfax', 'stripe'],
    email_templates: [
      { name: 'Estimate Ready', subject: 'Your Vehicle Estimate from {{business_name}}', body: "Hi {{customer_name}},\n\nWe've looked over your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} and put together an estimate for you.\n\nTotal Estimate: {{estimate_total}}\n\nYou can view the full breakdown and approve it here: {{estimate_link}}\n\nQuestions? Just reply to this email or call us at {{phone}}.\n\n— The team at {{business_name}}", trigger: 'estimate_created' },
      { name: 'Vehicle Ready for Pickup', subject: 'Your Car is Ready! — {{business_name}}', body: "Hi {{customer_name}},\n\nGreat news — your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} is all done and ready for pickup!\n\nTotal: {{invoice_total}}\n\nWe're open until {{closing_time}} today. See you soon!\n\n— {{business_name}}", trigger: 'repair_completed' },
      { name: 'Service Reminder', subject: "Time for a checkup — {{business_name}}", body: "Hi {{customer_name}},\n\nIt's been a while since your last visit. Based on your {{vehicle_year}} {{vehicle_make}}, you're probably due for {{recommended_service}}.\n\nBook online: {{booking_link}}\nOr call us: {{phone}}\n\nKeeping up with maintenance saves you money down the road!\n\n— {{business_name}}", trigger: 'service_reminder_due' }
    ],
    sms_templates: [
      { name: 'Appointment Confirmation', body: "Hi {{customer_name}}, your appointment at {{business_name}} is confirmed for {{date}} at {{time}}. Please bring your keys and any relevant paperwork. See you then!", trigger: 'appointment_booked' },
      { name: 'Vehicle Ready', body: "{{customer_name}}, your {{vehicle_make}} is ready for pickup at {{business_name}}! We're open until {{closing_time}}. Total: {{invoice_total}}.", trigger: 'repair_completed' },
      { name: 'Estimate Follow-Up', body: "Hi {{customer_name}}, just checking in on the estimate we sent for your {{vehicle_make}}. Want to go ahead or have questions? Reply here or call {{phone}}.", trigger: 'estimate_pending_48h' }
    ],
    estimated_hours_saved_weekly: 15,
    estimated_monthly_value: 3200,
    ideal_plan: 'pro',
    competitor_tools: ['Shop-Ware', 'Mitchell 1', 'Tekmetric', 'AutoFluent']
  },

  // ─── 2. AUTO DETAILING ───
  {
    id: 'auto-detailing',
    industry: 'Automotive',
    niche: 'Auto Detailing',
    display_name: 'Auto Detailing',
    emoji: '✨',
    tagline: 'Your AI detailing assistant that books jobs, sends before/after photos, and fills your schedule.',
    demo_greeting: "Hey! I'm Mouse, your AI detailing assistant. I help book detailing appointments, send quotes, and keep your calendar full. Want to see how I'd handle a customer asking about a full interior detail?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for an auto detailing business. Show how you handle appointment booking, service package explanations, and follow-ups. Be enthusiastic about cars, knowledgeable about detailing services, and help customers pick the right package for their needs.",
    demo_suggested_messages: [
      'How much for a full detail?',
      'I need my car cleaned before a road trip',
      'Do you do ceramic coating?',
      "What's the difference between your packages?"
    ],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} run their auto detailing business by booking appointments, explaining service packages, sending quotes, and following up with customers. You know the difference between a basic wash and a full paint correction. You're enthusiastic about making cars look amazing. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! I can help you book a detailing appointment, explain our packages, or get you a quick quote. What can I do for you?",
    receptionist_system_prompt: "You are Mouse, the AI phone receptionist for {{business_name}}, an auto detailing business. Book appointments, explain service tiers, provide pricing, and help customers choose the right package. Be enthusiastic and knowledgeable. If a customer has a special request (wedding car prep, show car, paint correction), transfer to the owner.",
    receptionist_faqs: [
      { question: 'What are your detailing packages?', answer: "We have three main packages: Basic Wash & Vacuum starting at {{basic_price}}, Full Interior & Exterior Detail at {{full_price}}, and our Premium Detail with paint correction at {{premium_price}}. Want me to go over what's included in each?", category: 'pricing' },
      { question: 'How long does a full detail take?', answer: "A full interior and exterior detail usually takes 3-5 hours depending on the size and condition of your vehicle. We'll take great care of it!", category: 'services' },
      { question: 'Do you offer mobile detailing?', answer: "{{mobile_answer}} Want me to book an appointment?", category: 'services' },
      { question: 'Do you do ceramic coating?', answer: "Yes! Our ceramic coating packages start at {{ceramic_price}} and include paint prep and application. It protects your paint for years. Want more details?", category: 'services' },
      { question: 'Can I drop off my car?', answer: "Absolutely! You can drop off anytime during business hours and we'll text you when it's ready. Most customers pick up same day.", category: 'general' }
    ],
    receptionist_transfer_triggers: [
      'custom or specialty work request (show car, classic car)',
      'paint correction consultation needed',
      'commercial fleet detailing inquiry',
      'complaint about previous service',
      'asking about employment'
    ],
    wizard_steps: [
      {
        step_number: 1,
        title: 'Your Business',
        description: "Let's set up your detailing business.",
        fields: [
          { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Precision Auto Detail', required: true },
          { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Chris Martinez', required: true },
          { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 234-5678', required: true },
          { name: 'address', label: 'Shop or Service Area', type: 'text', placeholder: '456 Oak Ave or "Mobile — Dallas metro"', required: true }
        ]
      },
      {
        step_number: 2,
        title: 'Services & Pricing',
        description: 'Tell us about your packages.',
        fields: [
          { name: 'services', label: 'Services Offered', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Basic Wash', 'Full Detail', 'Interior Only', 'Exterior Only', 'Ceramic Coating', 'Paint Correction', 'Headlight Restoration', 'Engine Bay', 'Odor Removal', 'Pet Hair Removal'] },
          { name: 'basic_price', label: 'Basic Package Starting Price', type: 'currency', placeholder: '49.99', required: true },
          { name: 'full_price', label: 'Full Detail Starting Price', type: 'currency', placeholder: '199.99', required: true },
          { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 8am-5pm', required: true }
        ]
      },
      {
        step_number: 3,
        title: 'How You Work',
        description: 'A few details about your setup.',
        fields: [
          { name: 'mobile_service', label: 'Do You Offer Mobile Detailing?', type: 'toggle', placeholder: '', required: true, help_text: 'Can you go to the customer?' },
          { name: 'premium_price', label: 'Premium/Ceramic Starting Price', type: 'currency', placeholder: '499.99', required: false },
          { name: 'ceramic_price', label: 'Ceramic Coating Starting Price', type: 'currency', placeholder: '599.99', required: false }
        ]
      },
      {
        step_number: 4,
        title: 'Finishing Touches',
        description: "Almost ready to make your business shine!",
        fields: [
          { name: 'website', label: 'Website', type: 'url', placeholder: 'www.precisiondetail.com', required: false },
          { name: 'instagram', label: 'Instagram Handle', type: 'text', placeholder: '@precisiondetail', required: false, help_text: 'Great for showing off before/after photos' }
        ]
      }
    ],
    dashboard_widgets: [
      { id: 'todays-schedule', title: "Today's Schedule", description: 'All booked detailing jobs for today.', priority: 1 },
      { id: 'pending-quotes', title: 'Pending Quotes', description: 'Quotes sent awaiting customer confirmation.', priority: 2 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue for the current week.', priority: 3 },
      { id: 'review-requests', title: 'Review Requests', description: 'Recent customers who should get a review request.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send before/after photos to customer', description: 'Text the customer photos of their completed detail.', category: 'operations', difficulty: 'needs-approval' },
      { title: 'Request Google review after detail', description: 'Send review request 24 hours after job completion.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Send seasonal detail reminder', description: 'Remind past customers about spring/winter detail specials.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Follow up on unanswered quote', description: 'Check in with customer who received a quote 3 days ago.', category: 'sales', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per detailing job.', target_suggestion: 175 },
      { name: 'Jobs Per Week', unit: 'count', description: 'Total detailing jobs completed per week.', target_suggestion: 20 },
      { name: 'Customer Rebooking Rate', unit: 'percentage', description: 'Customers who book again within 6 months.', target_suggestion: 40 },
      { name: 'Google Review Score', unit: 'rating', description: 'Average Google review rating.', target_suggestion: 4.8 }
    ],
    suggested_integrations: [
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up when people search for detailing near them.', priority: 'essential' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Accept payments on-site or send invoices.', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Sync your detailing schedule across devices.', priority: 'recommended' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Auto-post before/after photos to attract new customers.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track income and expenses for tax time.', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-business', 'square', 'google-calendar', 'instagram', 'quickbooks'],
    email_templates: [
      { name: 'Quote Ready', subject: 'Your Detailing Quote from {{business_name}}', body: "Hi {{customer_name}},\n\nThanks for reaching out! Here's your custom detailing quote:\n\nVehicle: {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}\nPackage: {{package_name}}\nPrice: {{quote_total}}\n\nReady to book? Reply to this email or call us at {{phone}}.\n\n— {{business_name}}", trigger: 'quote_created' },
      { name: 'Job Complete', subject: 'Your Car Looks Amazing! — {{business_name}}', body: "Hi {{customer_name}},\n\nYour {{vehicle_make}} is looking brand new! Here are your before and after photos.\n\nLoved the results? We'd really appreciate a Google review: {{review_link}}\n\nSee you next time!\n— {{business_name}}", trigger: 'job_completed' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}! Reminder: your detailing appointment at {{business_name}} is tomorrow at {{time}}. {{location_note}} See you then!", trigger: 'appointment_reminder_24h' },
      { name: 'Job Complete', body: "{{customer_name}}, your {{vehicle_make}} looks incredible! Ready for pickup at {{business_name}}. We'll send photos shortly!", trigger: 'job_completed' },
      { name: 'Review Request', body: "Thanks for choosing {{business_name}}, {{customer_name}}! If you loved the results, a quick Google review would mean the world to us: {{review_link}}", trigger: 'review_request_24h' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2400,
    ideal_plan: 'pro',
    competitor_tools: ['Urable', 'Mobile Tech RX', 'Booksy']
  },

  // ─── 3. BODY SHOP / COLLISION REPAIR ───
  {
    id: 'body-shop',
    industry: 'Automotive',
    niche: 'Body Shop / Collision Repair',
    display_name: 'Body Shop',
    emoji: '🚗',
    tagline: 'Your AI front desk that handles insurance calls, repair updates, and keeps customers in the loop.',
    demo_greeting: "Hi there! I'm Mouse, your AI front desk for collision repair. I handle insurance paperwork, keep customers updated on their repairs, and manage your schedule. Want to see how I'd handle a customer who just got in a fender bender?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a body shop / collision repair center. Show how you handle insurance claims, repair status updates, and customer communication. Be empathetic — people calling a body shop just had a bad day. Reassure them and make the process feel easy.",
    demo_suggested_messages: [
      'I just got in an accident, what do I do?',
      "How long will my repair take?",
      'Do you work with my insurance?',
      'Can I get an estimate for a dent?'
    ],
    soul_template: "You are Mouse, the AI front desk for {{business_name}}. You help {{owner_name}} run their body shop by managing customer communication, providing repair status updates, handling insurance-related questions, and booking estimates. You're empathetic — customers calling you have usually just had an accident. Make the process feel simple and stress-free. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse. Whether you need a repair estimate, a status update, or help with an insurance claim, I'm here to help. What's going on?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a body shop and collision repair center. Be empathetic and reassuring — callers have often just been in an accident. Help with estimate scheduling, repair status, insurance questions, and general info. Transfer to the shop manager for complex insurance disputes, total loss questions, or supplement negotiations.",
    receptionist_faqs: [
      { question: 'Do you work with my insurance company?', answer: "We work with all major insurance companies. Just bring in your claim number and we'll handle the rest. We deal with {{insurance_partners}} regularly.", category: 'insurance' },
      { question: 'How long will my repair take?', answer: "It depends on the damage. Minor dents and scratches are usually 2-3 days. Larger collision repairs can be 1-3 weeks. We'll give you a timeline after we assess the damage.", category: 'services' },
      { question: 'Do you offer rental cars?', answer: "We partner with {{rental_partner}} and can help arrange a rental for you while your car is in the shop. Most insurance policies cover this.", category: 'services' },
      { question: 'Can I get a free estimate?', answer: "Absolutely! We offer free estimates. You can stop by during business hours or schedule an appointment. It only takes about 15-20 minutes.", category: 'pricing' },
      { question: 'Do you guarantee your work?', answer: "Yes — all our repairs come with a {{warranty_period}} warranty on workmanship and paint. We stand behind everything we do.", category: 'general' }
    ],
    receptionist_transfer_triggers: [
      'insurance dispute or supplement negotiation',
      'total loss question',
      'complaint about repair quality',
      'fleet or commercial account',
      'attorney or legal inquiry related to an accident'
    ],
    wizard_steps: [
      {
        step_number: 1,
        title: 'Your Shop',
        description: "Let's get your body shop set up.",
        fields: [
          { name: 'business_name', label: 'Shop Name', type: 'text', placeholder: "Tony's Collision Center", required: true },
          { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Tony Russo', required: true },
          { name: 'phone', label: 'Shop Phone', type: 'phone', placeholder: '(555) 345-6789', required: true },
          { name: 'address', label: 'Shop Address', type: 'text', placeholder: '789 Industrial Blvd, Anytown, USA', required: true }
        ]
      },
      {
        step_number: 2,
        title: 'Services & Insurance',
        description: 'Tell us about your services and insurance relationships.',
        fields: [
          { name: 'services', label: 'Services Offered', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Collision Repair', 'Dent Removal', 'Paint & Refinish', 'Frame Straightening', 'Glass Replacement', 'Bumper Repair', 'Scratch Repair', 'Hail Damage', 'Fleet Repair'] },
          { name: 'insurance_partners', label: 'Insurance Companies You Work With', type: 'text', placeholder: 'State Farm, GEICO, Progressive, Allstate...', required: true },
          { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-5:30pm', required: true }
        ]
      },
      {
        step_number: 3,
        title: 'Customer Experience',
        description: 'How do you serve your customers?',
        fields: [
          { name: 'rental_partner', label: 'Rental Car Partner', type: 'text', placeholder: 'Enterprise, Hertz, etc.', required: false },
          { name: 'warranty_period', label: 'Warranty on Repairs', type: 'select', placeholder: 'Select warranty', required: true, options: ['Lifetime', '5 years', '3 years', '1 year'] },
          { name: 'certifications', label: 'Certifications', type: 'multiselect', placeholder: 'Select certifications', required: false, options: ['I-CAR Gold', 'ASE Certified', 'OEM Certified', 'PPG Certified'] }
        ]
      },
      {
        step_number: 4,
        title: 'Final Details',
        description: "You're almost ready to go.",
        fields: [
          { name: 'website', label: 'Website', type: 'url', placeholder: 'www.tonyscollision.com', required: false },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'info@tonyscollision.com', required: false }
        ]
      }
    ],
    dashboard_widgets: [
      { id: 'active-repairs', title: 'Active Repairs', description: 'All vehicles currently in the shop with status and expected completion.', priority: 1 },
      { id: 'pending-estimates', title: 'Pending Estimates', description: 'Estimate requests awaiting scheduling or approval.', priority: 2 },
      { id: 'insurance-updates', title: 'Insurance Updates', description: 'Claims awaiting supplement approval or payment.', priority: 3 },
      { id: 'vehicles-ready', title: 'Vehicles Ready for Pickup', description: 'Completed repairs ready for customer pickup.', priority: 4 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Total billed for the current month.', priority: 5 }
    ],
    sample_tasks: [
      { title: 'Send daily repair status update', description: 'Text customers with an update on their vehicle repair progress.', category: 'operations', difficulty: 'automatic' },
      { title: 'Follow up with insurance adjuster', description: 'Send a follow-up email on pending supplement approvals.', category: 'operations', difficulty: 'needs-approval' },
      { title: 'Notify customer vehicle is ready', description: 'Send text and email that their car is done and ready for pickup.', category: 'operations', difficulty: 'automatic' },
      { title: 'Request review after pickup', description: 'Send review request 48 hours after vehicle pickup.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Average Repair Order', unit: 'dollars', description: 'Average revenue per repair job.', target_suggestion: 2800 },
      { name: 'Cycle Time', unit: 'days', description: 'Average days from drop-off to delivery.', target_suggestion: 7 },
      { name: 'Customer Satisfaction', unit: 'percentage', description: 'Percentage of customers rating 4+ stars.', target_suggestion: 95 },
      { name: 'Supplement Approval Time', unit: 'days', description: 'Average days to get supplement approved by insurance.', target_suggestion: 3 }
    ],
    suggested_integrations: [
      { name: 'CCC ONE', slug: 'ccc-one', category: 'estimating', why: 'Industry-standard estimating and insurance communication platform.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up in local search and manage reviews.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track shop finances and insurance payments.', priority: 'recommended' },
      { name: 'Enterprise Rent-A-Car', slug: 'enterprise', category: 'rental', why: 'Arrange rental cars directly for customers.', priority: 'recommended' }
    ],
    integration_priority: ['ccc-one', 'google-business', 'quickbooks', 'enterprise'],
    email_templates: [
      { name: 'Repair Status Update', subject: 'Update on Your Vehicle — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's an update on your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}:\n\nStatus: {{repair_status}}\nEstimated Completion: {{estimated_completion}}\n\nWe'll keep you posted as things progress. Questions? Reply here or call {{phone}}.\n\n— {{business_name}}", trigger: 'daily_status_update' },
      { name: 'Vehicle Ready', subject: 'Your Car is Ready for Pickup! — {{business_name}}', body: "Hi {{customer_name}},\n\nGreat news — your {{vehicle_make}} {{vehicle_model}} is repaired and ready for pickup!\n\nPickup hours: {{business_hours}}\nAddress: {{address}}\n\nPlease bring a valid ID. We're excited for you to see the results!\n\n— {{business_name}}", trigger: 'repair_completed' }
    ],
    sms_templates: [
      { name: 'Repair Update', body: "Hi {{customer_name}}, update on your {{vehicle_make}}: {{repair_status}}. Estimated ready: {{estimated_completion}}. Questions? Call {{phone}}.", trigger: 'status_update' },
      { name: 'Ready for Pickup', body: "Great news, {{customer_name}}! Your {{vehicle_make}} is done and looks great. Pick up at {{business_name}} during {{business_hours}}.", trigger: 'repair_completed' },
      { name: 'Estimate Appointment Reminder', body: "Reminder: your estimate appointment at {{business_name}} is tomorrow at {{time}}. See you then!", trigger: 'estimate_appointment_reminder' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3500,
    ideal_plan: 'pro',
    competitor_tools: ['CCC ONE', 'Mitchell', 'Audatex', 'BodyShop Booster']
  },

  // ─── 4. TIRE SHOP ───
  {
    id: 'tire-shop',
    industry: 'Automotive',
    niche: 'Tire Shop',
    display_name: 'Tire Shop',
    emoji: '🛞',
    tagline: 'Your AI tire consultant that matches customers to the right tires, books installs, and sends rotation reminders.',
    demo_greeting: "Hey! I'm Mouse, your AI tire consultant. I help customers find the right tires, book installations, and send timely rotation reminders. Want to see how I'd help someone who needs new tires but doesn't know what size?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a tire shop. Help customers find the right tires, understand sizing, book appointments, and learn about tire maintenance. Be knowledgeable but approachable — most people don't know much about tires and that's okay.",
    demo_suggested_messages: [
      "I need new tires but I don't know my size",
      'How much for a set of four tires?',
      'My tire has a nail in it',
      "When should I rotate my tires?"
    ],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} run their tire shop by matching customers to the right tires, booking installations, sending rotation and replacement reminders, and answering tire questions in plain language. You know tire basics and can explain sizing, tread wear, and maintenance without overwhelming anyone. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Whether you need new tires, a repair, or just have a question, I'm here to help. What's going on?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a tire shop. Help customers with tire selection, pricing, flat repairs, and appointment booking. Be patient and informative — most callers don't know tire terminology. If they don't know their tire size, walk them through finding it on the sidewall or door jamb. Transfer to a technician for specialty fitments or commercial accounts.",
    receptionist_faqs: [
      { question: 'How much for a set of four tires?', answer: "It depends on your vehicle and the tire brand. For a standard sedan, a good set of four starts around {{sedan_price}}. For trucks and SUVs, it's usually {{truck_price}} and up. Want me to look up your specific vehicle?", category: 'pricing' },
      { question: 'How do I find my tire size?', answer: "Look on the sidewall of your current tire — there's a number like 225/65R17. You can also find it on a sticker inside your driver's door. If you tell me your vehicle year, make, and model, I can look it up for you!", category: 'general' },
      { question: 'Can you fix a flat tire?', answer: "In most cases, yes! If the puncture is in the tread area, we can patch it for around {{patch_price}}. If it's in the sidewall, the tire needs to be replaced for safety. Bring it in and we'll take a look.", category: 'services' },
      { question: 'How often should I rotate my tires?', answer: "Every 5,000 to 7,500 miles is the sweet spot. Regular rotation helps your tires wear evenly and last longer. We can set you up with reminders!", category: 'maintenance' },
      { question: 'Do you do alignments?', answer: "{{alignment_answer}} An alignment helps your tires wear evenly and keeps your car driving straight.", category: 'services' }
    ],
    receptionist_transfer_triggers: [
      'commercial fleet tire account',
      'specialty or custom wheel fitment',
      'complaint about a recent tire purchase',
      'wholesale or dealer inquiry',
      'roadside assistance needed'
    ],
    wizard_steps: [
      {
        step_number: 1,
        title: 'Your Shop',
        description: "Let's get your tire shop set up.",
        fields: [
          { name: 'business_name', label: 'Shop Name', type: 'text', placeholder: "Al's Tire Center", required: true },
          { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Al Thompson', required: true },
          { name: 'phone', label: 'Shop Phone', type: 'phone', placeholder: '(555) 456-7890', required: true },
          { name: 'address', label: 'Shop Address', type: 'text', placeholder: '321 Tire Lane, Anytown, USA', required: true }
        ]
      },
      {
        step_number: 2,
        title: 'Services & Pricing',
        description: 'What do you offer?',
        fields: [
          { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select services', required: true, options: ['New Tire Sales', 'Tire Installation', 'Flat Repair', 'Tire Rotation', 'Wheel Balancing', 'Alignment', 'TPMS Service', 'Custom Wheels', 'Used Tires'] },
          { name: 'tire_brands', label: 'Tire Brands Carried', type: 'text', placeholder: 'Michelin, Goodyear, BFGoodrich...', required: true },
          { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 8am-6pm', required: true }
        ]
      },
      {
        step_number: 3,
        title: 'Pricing Info',
        description: 'Some starting prices so Mouse can quote customers.',
        fields: [
          { name: 'sedan_price', label: 'Set of 4 Starting Price (Sedan)', type: 'currency', placeholder: '400', required: true },
          { name: 'truck_price', label: 'Set of 4 Starting Price (Truck/SUV)', type: 'currency', placeholder: '600', required: true },
          { name: 'patch_price', label: 'Flat Repair Price', type: 'currency', placeholder: '25', required: false }
        ]
      },
      {
        step_number: 4,
        title: 'Extras',
        description: 'Almost done!',
        fields: [
          { name: 'alignment_service', label: 'Do You Offer Alignments?', type: 'toggle', placeholder: '', required: true },
          { name: 'website', label: 'Website', type: 'url', placeholder: 'www.alstirecenter.com', required: false }
        ]
      }
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Appointments", description: 'Scheduled tire installations and services.', priority: 1 },
      { id: 'rotation-reminders', title: 'Rotation Reminders Due', description: 'Customers due for tire rotation this week.', priority: 2 },
      { id: 'inventory-alerts', title: 'Low Inventory Alerts', description: 'Popular tire sizes running low in stock.', priority: 3 },
      { id: 'weekly-sales', title: 'Weekly Sales', description: 'Tire sales and service revenue this week.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send tire rotation reminder', description: 'Text customers who bought tires 5,000+ miles ago.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Book tire installation from call', description: 'Create appointment from phone inquiry with vehicle and tire details.', category: 'scheduling', difficulty: 'needs-approval' },
      { title: 'Send seasonal tire change reminder', description: 'Notify customers about winter/summer tire swaps.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Follow up on tire quote', description: 'Check in with customer who got a quote but hasn\'t booked.', category: 'sales', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Sets Sold Per Week', unit: 'count', description: 'Number of complete tire sets sold weekly.', target_suggestion: 25 },
      { name: 'Average Transaction Value', unit: 'dollars', description: 'Average sale including tires and services.', target_suggestion: 550 },
      { name: 'Rotation Compliance Rate', unit: 'percentage', description: 'Customers who come back for scheduled rotations.', target_suggestion: 50 },
      { name: 'Customer Return Rate', unit: 'percentage', description: 'Customers who buy their next set from you.', target_suggestion: 65 }
    ],
    suggested_integrations: [
      { name: 'TireConnect', slug: 'tireconnect', category: 'industry', why: 'Real-time tire catalog and pricing from distributors.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up in local tire shop searches.', priority: 'essential' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Process payments and track sales.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track finances and inventory costs.', priority: 'recommended' }
    ],
    integration_priority: ['tireconnect', 'google-business', 'square', 'quickbooks'],
    email_templates: [
      { name: 'Tire Quote', subject: 'Your Tire Quote from {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your tire quote:\n\nVehicle: {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}\nTire: {{tire_brand}} {{tire_model}} ({{tire_size}})\nQty: {{quantity}}\nTotal (installed): {{quote_total}}\n\nReady to schedule? Reply or call {{phone}}.\n\n— {{business_name}}", trigger: 'quote_created' },
      { name: 'Rotation Reminder', subject: "Time to Rotate Your Tires — {{business_name}}", body: "Hi {{customer_name}},\n\nIt's been about {{months_since}} months since we installed your tires. A quick rotation will help them wear evenly and last longer.\n\nBook your rotation: {{booking_link}}\nOr call: {{phone}}\n\nIt only takes about 30 minutes!\n\n— {{business_name}}", trigger: 'rotation_due' }
    ],
    sms_templates: [
      { name: 'Appointment Confirmation', body: "Hi {{customer_name}}! Your tire appointment at {{business_name}} is confirmed for {{date}} at {{time}}. See you then!", trigger: 'appointment_booked' },
      { name: 'Rotation Reminder', body: "Hi {{customer_name}}, your tires are due for a rotation! Quick 30-min visit keeps them wearing evenly. Book at {{booking_link}} or call {{phone}}. — {{business_name}}", trigger: 'rotation_due' },
      { name: 'Seasonal Reminder', body: "Hey {{customer_name}}! {{season}} is here — time to think about {{seasonal_service}}. Call {{business_name}} at {{phone}} to schedule. Stay safe out there!", trigger: 'seasonal_reminder' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
    competitor_tools: ['TireConnect', 'Tire Guru', 'Net Driven']
  },

  // ─── 5. OIL CHANGE / QUICK LUBE ───
  {
    id: 'oil-change-quick-lube',
    industry: 'Automotive',
    niche: 'Oil Change / Quick Lube',
    display_name: 'Oil Change & Quick Lube',
    emoji: '🛢️',
    tagline: 'Your AI service advisor that books oil changes, sends reminders, and upsells maintenance — automatically.',
    demo_greeting: "Hi! I'm Mouse, your AI service advisor. I keep your oil change business running smoothly by booking appointments, sending service reminders, and helping customers pick the right service. Want to see how I handle a walk-in question?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for an oil change / quick lube shop. Help customers understand oil change options, book appointments, and learn about preventive maintenance. Be quick, friendly, and make the process feel easy. Use plain language — most customers just want to know what they need and how long it'll take.",
    demo_suggested_messages: [
      'How much is an oil change?',
      'Do I need synthetic oil?',
      "What else should I get done while I'm here?",
      'How often should I change my oil?'
    ],
    soul_template: "You are Mouse, the AI service advisor for {{business_name}}. You help {{owner_name}} run their quick lube by booking oil changes, sending service reminders, recommending additional maintenance services, and keeping customers coming back. You keep things fast and simple — that's the whole point of a quick lube. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Need to schedule an oil change or have a question about our services? I can help!",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a quick lube / oil change shop. Help customers understand service options, book appointments, and answer questions about pricing and timing. Be quick and efficient — that matches the brand. Most oil changes take 15-30 minutes. Transfer to manager for fleet accounts or complaints.",
    receptionist_faqs: [
      { question: 'How much is an oil change?', answer: "Our conventional oil change starts at {{conventional_price}} and synthetic starts at {{synthetic_price}}. Both include a new filter and a multi-point inspection. No appointment needed — but booking ahead can save you wait time!", category: 'pricing' },
      { question: 'Do I need synthetic oil?', answer: "It depends on your vehicle. Most newer cars (2010+) recommend synthetic. Check your owner's manual, or just tell me your vehicle and I can look it up for you.", category: 'services' },
      { question: 'How long does it take?', answer: "Most oil changes take about 15-30 minutes. We're pretty quick! If you add on extras like a transmission flush or tire rotation, it might be a bit longer.", category: 'general' },
      { question: 'Do I need an appointment?', answer: "Walk-ins are always welcome! But booking ahead guarantees your spot and can save you wait time, especially on weekends.", category: 'general' },
      { question: 'What other services do you offer?', answer: "Beyond oil changes, we do transmission fluid, coolant flush, air filters, wiper blades, tire rotation, battery testing, and more. We can check everything during your visit!", category: 'services' }
    ],
    receptionist_transfer_triggers: [
      'fleet or commercial account inquiry',
      'complaint about a recent service',
      'asking about employment',
      'warranty issue on recent oil change',
      'wants to speak to the manager'
    ],
    wizard_steps: [
      {
        step_number: 1,
        title: 'Your Shop',
        description: "Let's set up your quick lube.",
        fields: [
          { name: 'business_name', label: 'Shop Name', type: 'text', placeholder: 'Quick Stop Lube', required: true },
          { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Dave Wilson', required: true },
          { name: 'phone', label: 'Shop Phone', type: 'phone', placeholder: '(555) 567-8901', required: true },
          { name: 'address', label: 'Shop Address', type: 'text', placeholder: '555 Service Rd, Anytown, USA', required: true }
        ]
      },
      {
        step_number: 2,
        title: 'Services & Pricing',
        description: 'Your core service info.',
        fields: [
          { name: 'conventional_price', label: 'Conventional Oil Change Price', type: 'currency', placeholder: '29.99', required: true },
          { name: 'synthetic_price', label: 'Full Synthetic Price', type: 'currency', placeholder: '69.99', required: true },
          { name: 'additional_services', label: 'Extra Services', type: 'multiselect', placeholder: 'Select extras', required: false, options: ['Transmission Flush', 'Coolant Flush', 'Air Filter', 'Cabin Filter', 'Wiper Blades', 'Tire Rotation', 'Battery Test', 'Fuel System Clean', 'Differential Service'] },
          { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 8am-6pm, Sun 9am-4pm', required: true }
        ]
      },
      {
        step_number: 3,
        title: 'Customer Reminders',
        description: 'How often should Mouse remind your customers?',
        fields: [
          { name: 'reminder_interval', label: 'Oil Change Reminder Interval', type: 'select', placeholder: 'Select interval', required: true, options: ['Every 3 months', 'Every 3,000 miles', 'Every 5,000 miles', 'Every 6 months'] },
          { name: 'walk_in_friendly', label: 'Accept Walk-Ins?', type: 'toggle', placeholder: '', required: true }
        ]
      },
      {
        step_number: 4,
        title: 'Go Live',
        description: "You're ready!",
        fields: [
          { name: 'website', label: 'Website', type: 'url', placeholder: 'www.quickstoplube.com', required: false },
          { name: 'loyalty_program', label: 'Loyalty Program?', type: 'toggle', placeholder: '', required: false, help_text: 'e.g., Every 5th oil change free' }
        ]
      }
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Schedule", description: 'Booked and walk-in oil changes for today.', priority: 1 },
      { id: 'service-reminders', title: 'Reminders Going Out', description: 'Customers getting oil change reminders this week.', priority: 2 },
      { id: 'daily-car-count', title: 'Daily Car Count', description: 'Total vehicles serviced today vs. average.', priority: 3 },
      { id: 'upsell-rate', title: 'Add-On Sales', description: 'Percentage of customers adding extra services.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send oil change reminder', description: 'Text customers who are due based on their last visit date.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Book appointment from phone call', description: 'Create appointment with vehicle details from incoming call.', category: 'scheduling', difficulty: 'needs-approval' },
      { title: 'Send loyalty reward notification', description: 'Notify customer when they earn a free oil change.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Generate weekly car count report', description: 'Summarize total vehicles serviced and revenue by day.', category: 'reporting', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Daily Car Count', unit: 'count', description: 'Vehicles serviced per day.', target_suggestion: 30 },
      { name: 'Average Ticket', unit: 'dollars', description: 'Average revenue per vehicle visit.', target_suggestion: 65 },
      { name: 'Upsell Rate', unit: 'percentage', description: 'Percentage of customers adding services beyond oil change.', target_suggestion: 35 },
      { name: 'Return Rate', unit: 'percentage', description: 'Customers who return within the recommended interval.', target_suggestion: 55 }
    ],
    suggested_integrations: [
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up when people search "oil change near me."', priority: 'essential' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Fast checkout and sales tracking.', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manage appointments alongside walk-ins.', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Send promotional emails and seasonal offers.', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-business', 'square', 'google-calendar', 'mailchimp'],
    email_templates: [
      { name: 'Oil Change Reminder', subject: "You're Due for an Oil Change — {{business_name}}", body: "Hi {{customer_name}},\n\nIt's been {{time_since}} since your last oil change. Regular oil changes keep your engine running smoothly and prevent costly repairs.\n\nConventional: {{conventional_price}}\nSynthetic: {{synthetic_price}}\n\nBook now: {{booking_link}}\nOr just stop by — no appointment needed!\n\n— {{business_name}}", trigger: 'oil_change_due' },
      { name: 'Loyalty Reward', subject: 'You Earned a Free Oil Change! — {{business_name}}', body: "Hi {{customer_name}},\n\nThanks for being a loyal customer! You've earned a FREE oil change at {{business_name}}.\n\nJust mention this email at your next visit. No expiration — use it whenever you're ready.\n\nSee you soon!\n— {{business_name}}", trigger: 'loyalty_reward_earned' }
    ],
    sms_templates: [
      { name: 'Oil Change Reminder', body: "Hi {{customer_name}}, it's been {{time_since}} since your last oil change at {{business_name}}. Time for a fresh one! Book: {{booking_link}} or just stop by. We're quick!", trigger: 'oil_change_due' },
      { name: 'Appointment Confirmation', body: "Your oil change at {{business_name}} is booked for {{date}} at {{time}}. We'll have you in and out in about 20 minutes!", trigger: 'appointment_booked' },
      { name: 'Thank You', body: "Thanks for choosing {{business_name}}, {{customer_name}}! Your next oil change is due around {{next_due_date}}. We'll remind you!", trigger: 'service_completed' }
    ],
    estimated_hours_saved_weekly: 8,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
    competitor_tools: ['Valvoline Express Care POS', 'Pit Crew', 'AutoLeap']
  },

  // ─── 6. TOWING SERVICE ───
  {
    id: 'towing-service',
    industry: 'Automotive',
    niche: 'Towing Service',
    display_name: 'Towing Service',
    emoji: '🚛',
    tagline: 'Your AI dispatch assistant that takes emergency calls, dispatches drivers, and tracks ETAs — 24/7.',
    demo_greeting: "Hey! I'm Mouse, your AI dispatch assistant. I handle incoming tow calls, get the vehicle details, dispatch the nearest driver, and keep the customer updated with real ETAs. Want to see how I'd handle a roadside emergency?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a towing service. Show how you handle emergency tow requests calmly and efficiently. Get vehicle location, vehicle details, and situation. Be reassuring — people calling for a tow are stressed. Always ask if they're in a safe location. Prioritize safety above everything else.",
    demo_suggested_messages: [
      "My car broke down on the highway",
      "I locked my keys in my car",
      "I need a tow to my mechanic's shop",
      'How much does a tow cost?'
    ],
    soul_template: "You are Mouse, the AI dispatch assistant for {{business_name}}. You help {{owner_name}} run their towing service by taking emergency calls, gathering vehicle and location details, dispatching drivers, and keeping customers updated on ETAs. You stay calm and reassuring — people who need a tow are having a bad day. Always ask if they're somewhere safe first. Service area: {{service_area}}. Dispatch: {{phone}}. Available: {{business_hours}}.",
    receptionist_greeting: "{{business_name}} dispatch, this is Mouse. Are you in a safe location? Tell me what's going on and I'll get help on the way.",
    receptionist_system_prompt: "You are Mouse, the AI dispatcher for {{business_name}}, a towing service. PRIORITY: Ask if the caller is in a safe location. Then gather: location, vehicle details (year/make/model), situation (breakdown, accident, lockout, flat). Be calm, efficient, and reassuring. Dispatch the nearest available driver. For accident scenes with injuries, advise them to call 911 first. Transfer to owner for insurance company contracts, police rotation lists, or complaints.",
    receptionist_faqs: [
      { question: 'How much does a tow cost?', answer: "Our standard tow within {{service_area}} starts at {{base_rate}}. Longer distances are {{per_mile_rate}} per mile after the first {{included_miles}} miles. I can give you an exact quote once I know your location and destination.", category: 'pricing' },
      { question: 'How long until you get here?', answer: "I'll dispatch the nearest available driver right away. Typical response time in our area is {{avg_response_time}}. I'll give you a specific ETA once the driver is on the way.", category: 'general' },
      { question: 'Do you do lockouts?', answer: "Yes! We can unlock most vehicles. Lockout service is {{lockout_price}}. We'll have someone there quickly.", category: 'services' },
      { question: 'Do you tow motorcycles?', answer: "Yes, we have flatbed trucks that safely transport motorcycles. Same rates apply.", category: 'services' },
      { question: 'Do you work with AAA or insurance?', answer: "{{insurance_answer}} We accept all major credit cards and cash on-site.", category: 'billing' }
    ],
    receptionist_transfer_triggers: [
      'accident with injuries — direct to 911 first',
      'police department requesting rotation tow',
      'insurance company contract negotiation',
      'complaint about damage during tow',
      'commercial fleet towing contract'
    ],
    wizard_steps: [
      {
        step_number: 1,
        title: 'Your Business',
        description: "Let's set up your towing dispatch.",
        fields: [
          { name: 'business_name', label: 'Company Name', type: 'text', placeholder: "Ace Towing & Recovery", required: true },
          { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Rick Davis', required: true },
          { name: 'phone', label: 'Dispatch Phone', type: 'phone', placeholder: '(555) 678-9012', required: true },
          { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Dallas/Fort Worth metro area', required: true }
        ]
      },
      {
        step_number: 2,
        title: 'Services & Rates',
        description: 'Your towing services and pricing.',
        fields: [
          { name: 'services', label: 'Services Offered', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Local Towing', 'Long Distance Towing', 'Flatbed Service', 'Lockout Service', 'Jump Start', 'Tire Change', 'Fuel Delivery', 'Winch Out', 'Motorcycle Towing', 'Heavy Duty Towing'] },
          { name: 'base_rate', label: 'Base Tow Rate', type: 'currency', placeholder: '75', required: true },
          { name: 'per_mile_rate', label: 'Per Mile Rate', type: 'currency', placeholder: '4', required: true },
          { name: 'included_miles', label: 'Included Miles in Base Rate', type: 'number', placeholder: '5', required: true }
        ]
      },
      {
        step_number: 3,
        title: 'Availability & Fleet',
        description: 'When are you available and what do you have?',
        fields: [
          { name: 'business_hours', label: 'Availability', type: 'select', placeholder: 'Select availability', required: true, options: ['24/7', 'Mon-Sun 6am-12am', 'Mon-Sat 7am-10pm', 'Custom'] },
          { name: 'avg_response_time', label: 'Average Response Time', type: 'select', placeholder: 'Select response time', required: true, options: ['15-20 minutes', '20-30 minutes', '30-45 minutes', '45-60 minutes'] },
          { name: 'lockout_price', label: 'Lockout Service Price', type: 'currency', placeholder: '50', required: false }
        ]
      },
      {
        step_number: 4,
        title: 'Final Setup',
        description: "Let's get you dispatching!",
        fields: [
          { name: 'insurance_partnerships', label: 'Insurance/AAA Partnerships?', type: 'text', placeholder: 'AAA, GEICO Motor Club, etc.', required: false },
          { name: 'website', label: 'Website', type: 'url', placeholder: 'www.acetowing.com', required: false }
        ]
      }
    ],
    dashboard_widgets: [
      { id: 'active-calls', title: 'Active Calls', description: 'Current tow requests being handled with driver and ETA.', priority: 1 },
      { id: 'driver-status', title: 'Driver Status', description: 'All drivers with current location and availability.', priority: 2 },
      { id: 'todays-calls', title: "Today's Call Log", description: 'All calls received today with status.', priority: 3 },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Total revenue from completed tows today.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Dispatch nearest available driver', description: 'Match incoming tow request with closest free driver and send them.', category: 'operations', difficulty: 'needs-approval' },
      { title: 'Send ETA update to customer', description: 'Text the customer with real-time ETA of their tow truck.', category: 'operations', difficulty: 'automatic' },
      { title: 'Follow up for review after tow', description: 'Request a Google review 2 hours after completed service.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Generate daily call log report', description: 'Summarize all calls, dispatches, and revenue for the day.', category: 'reporting', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Average Response Time', unit: 'minutes', description: 'Minutes from call to driver arrival.', target_suggestion: 25 },
      { name: 'Calls Per Day', unit: 'count', description: 'Total tow calls received per day.', target_suggestion: 15 },
      { name: 'Revenue Per Tow', unit: 'dollars', description: 'Average revenue per tow service.', target_suggestion: 125 },
      { name: 'Driver Utilization', unit: 'percentage', description: 'Percentage of driver time spent on active calls.', target_suggestion: 70 }
    ],
    suggested_integrations: [
      { name: 'Google Maps', slug: 'google-maps', category: 'dispatch', why: 'Real-time location tracking and ETA calculations.', priority: 'essential' },
      { name: 'Towbook', slug: 'towbook', category: 'industry', why: 'Manage dispatch, invoicing, and fleet tracking.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up when people search "towing near me."', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Accept mobile payments on-site.', priority: 'recommended' }
    ],
    integration_priority: ['google-maps', 'towbook', 'google-business', 'stripe'],
    email_templates: [
      { name: 'Service Receipt', subject: 'Your Tow Receipt — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your receipt for today's service:\n\nService: {{service_type}}\nFrom: {{pickup_location}}\nTo: {{dropoff_location}}\nTotal: {{total}}\n\nThank you for choosing {{business_name}}. We hope your day gets better from here!\n\nIf you have a moment, a Google review would really help us out: {{review_link}}\n\n— {{business_name}}", trigger: 'service_completed' }
    ],
    sms_templates: [
      { name: 'Driver Dispatched', body: "{{business_name}} here — a driver is on the way to you now. ETA: {{eta}}. Driver: {{driver_name}}, Truck: {{truck_description}}. Hang tight!", trigger: 'driver_dispatched' },
      { name: 'Driver Arriving', body: "Your tow truck is about 5 minutes away. Look for {{truck_description}}. Almost there!", trigger: 'driver_nearby' },
      { name: 'Service Complete', body: "Thanks for using {{business_name}}, {{customer_name}}. Your receipt has been emailed. We hope the rest of your day goes smoothly!", trigger: 'service_completed' }
    ],
    estimated_hours_saved_weekly: 20,
    estimated_monthly_value: 4000,
    ideal_plan: 'growth',
    competitor_tools: ['Towbook', 'TowTrax', 'ProTow', 'Agero']
  },

  // ─── 7. CAR WASH ───
  {
    id: 'car-wash',
    industry: 'Automotive',
    niche: 'Car Wash',
    display_name: 'Car Wash',
    emoji: '🫧',
    tagline: 'Your AI car wash manager that sells memberships, runs promotions, and keeps customers coming back.',
    demo_greeting: "Hey! I'm Mouse, your AI car wash manager. I sell and manage wash memberships, run weather-based promotions, and keep your customers coming back. Want to see how I'd sell someone on an unlimited wash membership?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a car wash business. Show how you sell memberships, explain wash packages, and handle customer questions. Be upbeat and make it fun — car washes should feel like a treat, not a chore.",
    demo_suggested_messages: [
      'What wash packages do you have?',
      'Tell me about your unlimited membership',
      'Do you have gift cards?',
      'Is the car wash open in the rain?'
    ],
    soul_template: "You are Mouse, the AI manager for {{business_name}}. You help {{owner_name}} run their car wash by selling memberships, managing promotions, handling customer inquiries, and running the loyalty program. You're upbeat and make getting a car wash feel like a treat. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Whether you want to sign up for our unlimited wash plan or just have a question, I'm here. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a car wash. Sell memberships, explain wash tiers, answer general questions, and handle billing inquiries. Be upbeat and enthusiastic. Transfer to the manager for equipment issues, membership cancellations, or damage claims.",
    receptionist_faqs: [
      { question: 'What wash packages do you have?', answer: "We have {{wash_tiers}}. Our most popular is the {{popular_tier}} at {{popular_price}}! Want the full rundown?", category: 'pricing' },
      { question: 'How much is the unlimited membership?', answer: "Our unlimited monthly membership is {{membership_price}}/month — wash as often as you want! Most members tell us it pays for itself after 2-3 washes.", category: 'pricing' },
      { question: 'Do you have gift cards?', answer: "We sure do! Gift cards are available in any amount. You can get them at the wash or I can email you one.", category: 'general' },
      { question: 'Is the car wash open in the rain?', answer: "Yes! In fact, rain is a great time to wash. Our wash removes the road grime and pollutants that rain brings down. Plus, it's usually shorter lines!", category: 'general' },
      { question: 'How do I cancel my membership?', answer: "I'm sorry to hear that! Let me transfer you to our manager who can help with membership changes.", category: 'billing' }
    ],
    receptionist_transfer_triggers: [
      'damage claim from wash',
      'membership cancellation request',
      'equipment malfunction report',
      'commercial account or fleet inquiry',
      'wants to speak to a manager'
    ],
    wizard_steps: [
      {
        step_number: 1,
        title: 'Your Car Wash',
        description: "Let's set up your car wash in Mouse.",
        fields: [
          { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Sparkle Express Car Wash', required: true },
          { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Kim Lee', required: true },
          { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 789-0123', required: true },
          { name: 'address', label: 'Location', type: 'text', placeholder: '888 Wash Way, Anytown, USA', required: true }
        ]
      },
      {
        step_number: 2,
        title: 'Wash Packages',
        description: 'Tell us about your wash tiers.',
        fields: [
          { name: 'wash_type', label: 'Type of Car Wash', type: 'select', placeholder: 'Select type', required: true, options: ['Express/Tunnel', 'Full Service', 'Self Service', 'Hand Wash', 'Hybrid'] },
          { name: 'wash_tiers', label: 'Wash Tier Names (basic to premium)', type: 'text', placeholder: 'Basic, Plus, Premium, Ultimate', required: true },
          { name: 'popular_tier', label: 'Most Popular Tier', type: 'text', placeholder: 'Premium', required: true },
          { name: 'popular_price', label: 'Most Popular Tier Price', type: 'currency', placeholder: '15.99', required: true }
        ]
      },
      {
        step_number: 3,
        title: 'Membership',
        description: 'Your unlimited wash plan.',
        fields: [
          { name: 'membership_price', label: 'Monthly Membership Price', type: 'currency', placeholder: '29.99', required: true },
          { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Daily 7am-8pm', required: true },
          { name: 'loyalty_program', label: 'Loyalty Program?', type: 'toggle', placeholder: '', required: false, help_text: 'e.g., Buy 5 washes, get 1 free' }
        ]
      },
      {
        step_number: 4,
        title: 'Ready to Shine',
        description: "You're all set!",
        fields: [
          { name: 'website', label: 'Website', type: 'url', placeholder: 'www.sparkleexpress.com', required: false },
          { name: 'weather_promos', label: 'Run Weather-Based Promos?', type: 'toggle', placeholder: '', required: false, help_text: 'Auto-send deals on sunny days after rain' }
        ]
      }
    ],
    dashboard_widgets: [
      { id: 'todays-car-count', title: "Today's Car Count", description: 'Total cars washed today by tier.', priority: 1 },
      { id: 'membership-stats', title: 'Membership Dashboard', description: 'Active members, new sign-ups, and churn.', priority: 2 },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue from washes, memberships, and extras.', priority: 3 },
      { id: 'weather-forecast', title: 'Weather & Promos', description: '5-day forecast with auto-promotion triggers.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send sunny day promotion', description: 'Text customers a wash deal when forecast shows sunshine after rain.', category: 'marketing', difficulty: 'automatic' },
      { title: 'New membership welcome', description: 'Send welcome email to new unlimited wash members.', category: 'operations', difficulty: 'automatic' },
      { title: 'Membership renewal reminder', description: 'Alert members 3 days before billing renewal.', category: 'billing', difficulty: 'automatic' },
      { title: 'Win-back lapsed members', description: 'Send special offer to members who cancelled in the last 90 days.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Daily Car Count', unit: 'count', description: 'Total vehicles washed per day.', target_suggestion: 200 },
      { name: 'Active Memberships', unit: 'count', description: 'Total active unlimited wash members.', target_suggestion: 500 },
      { name: 'Membership Churn Rate', unit: 'percentage', description: 'Monthly membership cancellation rate.', target_suggestion: 5 },
      { name: 'Revenue Per Car', unit: 'dollars', description: 'Average revenue per vehicle.', target_suggestion: 14 }
    ],
    suggested_integrations: [
      { name: 'DRB Systems', slug: 'drb', category: 'pos', why: 'Industry-leading POS and tunnel management.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up in local car wash searches.', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Process membership billing and one-time payments.', priority: 'recommended' },
      { name: 'Weather API', slug: 'weather-api', category: 'automation', why: 'Trigger promotions based on weather forecasts.', priority: 'recommended' }
    ],
    integration_priority: ['drb', 'google-business', 'stripe', 'weather-api'],
    email_templates: [
      { name: 'Membership Welcome', subject: 'Welcome to {{business_name}} Unlimited!', body: "Hi {{customer_name}},\n\nWelcome to the {{business_name}} Unlimited Wash Club! Your membership is active and you can wash as often as you like.\n\nJust drive up and your RFID tag will let you right through. No limits, no hassle.\n\nYour plan: {{plan_name}} — {{membership_price}}/month\nBills on the {{billing_day}} of each month.\n\nEnjoy that fresh car feeling!\n— {{business_name}}", trigger: 'membership_created' },
      { name: 'Weather Promo', subject: '☀️ Perfect Day for a Wash — {{business_name}}', body: "Hi {{customer_name}},\n\nThe sun is out and your car deserves some love! Come through {{business_name}} today and enjoy a sparkling clean ride.\n\n{{promo_details}}\n\nSee you at the wash!\n— {{business_name}}", trigger: 'weather_promo_triggered' }
    ],
    sms_templates: [
      { name: 'Sunny Day Deal', body: "Sun's out at {{business_name}}! Perfect day for a wash. {{promo_details}} Drive through today!", trigger: 'weather_promo' },
      { name: 'Membership Renewal', body: "Hi {{customer_name}}, your {{business_name}} unlimited membership renews on {{renewal_date}} for {{membership_price}}. No action needed — just keep enjoying unlimited washes!", trigger: 'renewal_reminder' },
      { name: 'Win-Back Offer', body: "We miss you at {{business_name}}, {{customer_name}}! Come back to Unlimited and get your first month for just {{promo_price}}. Reply YES to re-activate!", trigger: 'winback_90_days' }
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2800,
    ideal_plan: 'growth',
    competitor_tools: ['DRB Patheon', 'Rinsed', 'Washify', 'EverWash']
  },

  // ─── 8. AUTO GLASS ───
  {
    id: 'auto-glass',
    industry: 'Automotive',
    niche: 'Auto Glass',
    display_name: 'Auto Glass',
    emoji: '🪟',
    tagline: 'Your AI assistant that handles insurance claims, books mobile repairs, and fills your schedule.',
    demo_greeting: "Hi! I'm Mouse, your AI assistant for auto glass repair and replacement. I handle insurance claims, book mobile service, and keep your schedule full. Want to see how I'd help a customer with a cracked windshield?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for an auto glass business. Help customers understand if their chip can be repaired or needs replacement, walk them through insurance coverage, and book mobile or in-shop service. Be helpful and reassuring — a cracked windshield feels urgent.",
    demo_suggested_messages: [
      'I have a crack in my windshield',
      'Does insurance cover windshield replacement?',
      'Can you come to my house to replace it?',
      'How long does a replacement take?'
    ],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} run their auto glass business by booking repairs and replacements, handling insurance claims, scheduling mobile service, and following up with customers. You know the difference between a repairable chip and one that needs full replacement. Business hours: {{business_hours}}. Service area: {{service_area}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! I can help you with windshield repairs, replacements, or insurance claims. What's going on with your glass?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, an auto glass shop. Help customers determine if they need a repair or replacement, explain insurance coverage (many states have zero-deductible windshield coverage), and book mobile or in-shop appointments. Transfer to the owner for complex insurance disputes or commercial fleet quotes.",
    receptionist_faqs: [
      { question: 'Can my chip be repaired or do I need a replacement?', answer: "Generally, chips smaller than a quarter and cracks shorter than 6 inches can be repaired. Anything bigger or in the driver's line of sight usually needs replacement. Send us a photo and we can tell you for sure!", category: 'services' },
      { question: 'Does insurance cover this?', answer: "Most comprehensive insurance policies cover windshield replacement with little or no deductible. In some states like Arizona and Florida, it's covered with zero deductible by law. We'll file the claim for you!", category: 'insurance' },
      { question: 'Do you come to me?', answer: "{{mobile_answer}} Most replacements take about an hour wherever we meet you.", category: 'services' },
      { question: 'How long does a replacement take?', answer: "The actual replacement takes about an hour. After that, we recommend waiting one hour before driving so the adhesive can cure properly.", category: 'services' },
      { question: 'How much does it cost without insurance?', answer: "Windshield replacement without insurance typically runs {{replacement_range}} depending on your vehicle. Chip repairs are much less — usually {{chip_repair_price}}. I can get you an exact quote with your vehicle info.", category: 'pricing' }
    ],
    receptionist_transfer_triggers: [
      'insurance dispute or denied claim',
      'commercial fleet contract',
      'complaint about a previous installation',
      'specialty glass (classic cars, RVs, heavy equipment)',
      'asking about ADAS recalibration issues'
    ],
    wizard_steps: [
      {
        step_number: 1,
        title: 'Your Business',
        description: "Let's get your glass business set up.",
        fields: [
          { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'ClearView Auto Glass', required: true },
          { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Steve Park', required: true },
          { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 890-1234', required: true },
          { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Phoenix metro area', required: true }
        ]
      },
      {
        step_number: 2,
        title: 'Services & Pricing',
        description: 'What do you offer?',
        fields: [
          { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Windshield Replacement', 'Chip Repair', 'Side Window', 'Rear Window', 'Sunroof Glass', 'ADAS Recalibration', 'Mobile Service'] },
          { name: 'replacement_range', label: 'Windshield Replacement Price Range', type: 'text', placeholder: '$200-$500', required: true },
          { name: 'chip_repair_price', label: 'Chip Repair Price', type: 'currency', placeholder: '49.99', required: false },
          { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 8am-5pm', required: true }
        ]
      },
      {
        step_number: 3,
        title: 'Service Details',
        description: 'A few more details.',
        fields: [
          { name: 'mobile_service', label: 'Offer Mobile Service?', type: 'toggle', placeholder: '', required: true },
          { name: 'insurance_filing', label: 'File Insurance Claims for Customers?', type: 'toggle', placeholder: '', required: true },
          { name: 'adas_calibration', label: 'Offer ADAS Recalibration?', type: 'toggle', placeholder: '', required: false, help_text: 'Required for newer vehicles with lane assist, etc.' }
        ]
      },
      {
        step_number: 4,
        title: 'Go Live',
        description: "You're ready!",
        fields: [
          { name: 'website', label: 'Website', type: 'url', placeholder: 'www.clearviewautoglass.com', required: false },
          { name: 'address', label: 'Shop Address (if applicable)', type: 'text', placeholder: '456 Glass Lane, Phoenix, AZ', required: false }
        ]
      }
    ],
    dashboard_widgets: [
      { id: 'todays-jobs', title: "Today's Jobs", description: 'Scheduled replacements and repairs for today.', priority: 1 },
      { id: 'pending-insurance', title: 'Pending Insurance Claims', description: 'Claims awaiting approval from insurance companies.', priority: 2 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue from retail and insurance jobs this week.', priority: 3 },
      { id: 'parts-inventory', title: 'Glass Inventory', description: 'Common windshield stock levels by vehicle.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'File insurance claim for customer', description: 'Submit windshield claim to customer\'s insurance with photos and details.', category: 'operations', difficulty: 'needs-approval' },
      { title: 'Book mobile replacement appointment', description: 'Schedule mobile service at customer\'s home or work.', category: 'scheduling', difficulty: 'needs-approval' },
      { title: 'Send service completion photo', description: 'Text customer a photo of the completed installation.', category: 'operations', difficulty: 'automatic' },
      { title: 'Follow up for Google review', description: 'Request review 48 hours after service.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Jobs Per Week', unit: 'count', description: 'Total installations and repairs completed weekly.', target_suggestion: 30 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per job (insurance + retail).', target_suggestion: 350 },
      { name: 'Insurance Claim Approval Rate', unit: 'percentage', description: 'Percentage of claims approved on first submission.', target_suggestion: 90 },
      { name: 'Mobile Service Percentage', unit: 'percentage', description: 'Percentage of jobs done via mobile service.', target_suggestion: 60 }
    ],
    suggested_integrations: [
      { name: 'Glaxis', slug: 'glaxis', category: 'industry', why: 'Insurance billing and claims management for auto glass.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up in local auto glass searches.', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manage mobile and in-shop appointment schedule.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track retail and insurance revenue.', priority: 'recommended' }
    ],
    integration_priority: ['glaxis', 'google-business', 'google-calendar', 'quickbooks'],
    email_templates: [
      { name: 'Appointment Confirmation', subject: 'Your Auto Glass Appointment — {{business_name}}', body: "Hi {{customer_name}},\n\nYour windshield {{service_type}} is scheduled:\n\nDate: {{date}}\nTime: {{time}}\nLocation: {{service_location}}\nVehicle: {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}\n\n{{insurance_note}}\n\nPlease plan for about 1 hour. After replacement, wait 1 hour before driving.\n\nSee you then!\n— {{business_name}}", trigger: 'appointment_confirmed' },
      { name: 'Insurance Claim Filed', subject: 'Your Insurance Claim Has Been Filed — {{business_name}}', body: "Hi {{customer_name}},\n\nWe've filed your windshield claim with {{insurance_company}}. Here's your info:\n\nClaim #: {{claim_number}}\nStatus: Submitted\n\nWe'll follow up with the insurance company and let you know as soon as it's approved. Most claims are processed within 1-2 business days.\n\n— {{business_name}}", trigger: 'claim_filed' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: your auto glass appointment with {{business_name}} is tomorrow at {{time}} at {{service_location}}. See you then!", trigger: 'appointment_reminder_24h' },
      { name: 'Claim Approved', body: "Good news, {{customer_name}}! Your insurance approved your windshield {{service_type}}. Your cost: {{customer_cost}}. Ready to schedule? Reply or call {{phone}}.", trigger: 'claim_approved' },
      { name: 'Review Request', body: "Thanks for choosing {{business_name}}, {{customer_name}}! How does that new windshield look? A quick review would mean a lot: {{review_link}}", trigger: 'review_request_48h' }
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2600,
    ideal_plan: 'pro',
    competitor_tools: ['Safelite', 'Glaxis', 'GlassMate', 'Alpha Systems']
  },

  // ─── 9. USED CAR DEALER ───
  {
    id: 'used-car-dealer',
    industry: 'Automotive',
    niche: 'Used Car Dealer',
    display_name: 'Used Car Dealer',
    emoji: '🚙',
    tagline: 'Your AI sales assistant that qualifies leads, answers inventory questions, and books test drives — even after hours.',
    demo_greeting: "Hey! I'm Mouse, your AI sales assistant. I answer questions about your inventory 24/7, qualify leads, book test drives, and follow up with buyers. Want to see how I'd handle someone browsing for a reliable SUV under $20K?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a used car dealership. Help customers find vehicles that match their needs, answer questions about inventory, and book test drives. Be honest and helpful — no stereotypical car salesman pressure. Focus on helping the customer find the right vehicle for their needs and budget.",
    demo_suggested_messages: [
      "I'm looking for a reliable SUV under $20K",
      'Do you offer financing?',
      'Can I trade in my current car?',
      'I want to schedule a test drive'
    ],
    soul_template: "You are Mouse, the AI sales assistant for {{business_name}}. You help {{owner_name}} run their used car dealership by answering inventory questions, qualifying leads, booking test drives, and following up with interested buyers. You're honest and helpful — never pushy. You help customers find the right vehicle for their needs and budget. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! I can help you find a vehicle, check on our inventory, or schedule a test drive. What are you looking for?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a used car dealership. Help customers find vehicles by type, price, and features. Book test drives and answer questions about financing and trade-ins. Be honest and no-pressure. Transfer to a sales manager for price negotiations, trade-in valuations, or financing applications.",
    receptionist_faqs: [
      { question: 'Do you offer financing?', answer: "Yes! We work with several lenders and can usually get you approved regardless of credit history. {{financing_details}} Want to come in and talk numbers?", category: 'financing' },
      { question: 'Can I trade in my current car?', answer: "Absolutely! Bring your vehicle in and we'll give you a fair trade-in value on the spot. It can go right toward your down payment.", category: 'sales' },
      { question: 'Do your cars come with a warranty?', answer: "{{warranty_answer}} We also offer extended warranty options for extra peace of mind.", category: 'general' },
      { question: 'Can I see a Carfax report?', answer: "Yes — we provide a free Carfax or vehicle history report on every vehicle on our lot. Just ask and we'll pull it up.", category: 'general' },
      { question: 'What do I need to bring to buy a car?', answer: "You'll need a valid driver's license, proof of insurance, and proof of income if you're financing. If you're paying cash, just the license and insurance.", category: 'general' }
    ],
    receptionist_transfer_triggers: [
      'ready to negotiate price',
      'wants a trade-in appraisal',
      'financing application or credit discussion',
      'complaint about a vehicle purchased',
      'asking about wholesale or dealer-to-dealer'
    ],
    wizard_steps: [
      {
        step_number: 1,
        title: 'Your Dealership',
        description: "Let's set up your dealership.",
        fields: [
          { name: 'business_name', label: 'Dealership Name', type: 'text', placeholder: 'Reliable Motors', required: true },
          { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'James Cooper', required: true },
          { name: 'phone', label: 'Sales Phone', type: 'phone', placeholder: '(555) 901-2345', required: true },
          { name: 'address', label: 'Lot Address', type: 'text', placeholder: '1000 Auto Row, Anytown, USA', required: true }
        ]
      },
      {
        step_number: 2,
        title: 'Inventory & Sales',
        description: 'Tell us about what you sell.',
        fields: [
          { name: 'vehicle_types', label: 'Types of Vehicles', type: 'multiselect', placeholder: 'Select types', required: true, options: ['Sedans', 'SUVs', 'Trucks', 'Vans', 'Luxury', 'Sports Cars', 'Economy', 'Electric/Hybrid'] },
          { name: 'price_range', label: 'Typical Price Range', type: 'text', placeholder: '$5,000 - $35,000', required: true },
          { name: 'inventory_size', label: 'Approximate Inventory Size', type: 'number', placeholder: '50', required: true },
          { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 9am-7pm, Sun 11am-5pm', required: true }
        ]
      },
      {
        step_number: 3,
        title: 'Financing & Warranties',
        description: 'How do you handle financing?',
        fields: [
          { name: 'financing_available', label: 'Offer In-House Financing?', type: 'toggle', placeholder: '', required: true },
          { name: 'financing_details', label: 'Financing Details', type: 'text', placeholder: 'We work with all credit types, low down payments...', required: false },
          { name: 'warranty_answer', label: 'Warranty Policy', type: 'text', placeholder: 'All vehicles come with a 30-day/1,000-mile warranty...', required: true }
        ]
      },
      {
        step_number: 4,
        title: 'Final Details',
        description: "Almost there!",
        fields: [
          { name: 'website', label: 'Website', type: 'url', placeholder: 'www.reliablemotors.com', required: false },
          { name: 'inventory_url', label: 'Online Inventory Link', type: 'url', placeholder: 'www.reliablemotors.com/inventory', required: false }
        ]
      }
    ],
    dashboard_widgets: [
      { id: 'active-leads', title: 'Active Leads', description: 'Current prospects with status and follow-up dates.', priority: 1 },
      { id: 'test-drives-today', title: "Today's Test Drives", description: 'Scheduled test drives for today.', priority: 2 },
      { id: 'inventory-overview', title: 'Inventory Status', description: 'Total vehicles, new arrivals, and days on lot.', priority: 3 },
      { id: 'monthly-sales', title: 'Monthly Sales', description: 'Units sold and revenue this month.', priority: 4 },
      { id: 'follow-ups-due', title: 'Follow-Ups Due Today', description: 'Leads that need a follow-up call or text today.', priority: 5 }
    ],
    sample_tasks: [
      { title: 'Follow up with test drive lead', description: 'Send a personalized follow-up to someone who test drove a vehicle.', category: 'sales', difficulty: 'automatic' },
      { title: 'Book test drive from website inquiry', description: 'Create test drive appointment from online lead.', category: 'scheduling', difficulty: 'needs-approval' },
      { title: 'Send new inventory alert', description: 'Notify leads when a vehicle matching their criteria arrives.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Post vehicle to social media', description: 'Create listing post for a new arrival with photos and details.', category: 'marketing', difficulty: 'needs-approval' },
      { title: 'Send anniversary check-in', description: 'Text customers on the 1-year anniversary of their purchase.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Units Sold Per Month', unit: 'count', description: 'Total vehicles sold per month.', target_suggestion: 20 },
      { name: 'Average Days on Lot', unit: 'days', description: 'Average days a vehicle sits before selling.', target_suggestion: 45 },
      { name: 'Lead-to-Sale Conversion', unit: 'percentage', description: 'Percentage of leads that result in a sale.', target_suggestion: 15 },
      { name: 'Average Profit Per Unit', unit: 'dollars', description: 'Average gross profit per vehicle sold.', target_suggestion: 2500 }
    ],
    suggested_integrations: [
      { name: 'DealerSocket', slug: 'dealersocket', category: 'crm', why: 'Manage leads, inventory, and customer relationships.', priority: 'essential' },
      { name: 'AutoTrader', slug: 'autotrader', category: 'marketplace', why: 'List your inventory where buyers are searching.', priority: 'essential' },
      { name: 'Facebook Marketplace', slug: 'facebook-marketplace', category: 'marketplace', why: 'Reach local buyers on Facebook.', priority: 'recommended' },
      { name: 'Carfax', slug: 'carfax', category: 'industry', why: 'Provide vehicle history reports to build trust.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track sales, expenses, and profit per unit.', priority: 'recommended' }
    ],
    integration_priority: ['dealersocket', 'autotrader', 'facebook-marketplace', 'carfax', 'quickbooks'],
    email_templates: [
      { name: 'Test Drive Follow-Up', subject: "How'd You Like the {{vehicle_year}} {{vehicle_make}}? — {{business_name}}", body: "Hi {{customer_name}},\n\nThanks for coming in to test drive the {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} yesterday! We hope you enjoyed it.\n\nIf you have any questions or want to talk numbers, I'm here. That {{vehicle_make}} has been getting a lot of interest, so don't wait too long!\n\nCall: {{phone}}\nOr just reply to this email.\n\n— {{salesperson_name}} at {{business_name}}", trigger: 'test_drive_completed' },
      { name: 'New Inventory Match', subject: 'We Found Something You Might Like — {{business_name}}', body: "Hi {{customer_name}},\n\nA vehicle just arrived that matches what you were looking for:\n\n{{vehicle_year}} {{vehicle_make}} {{vehicle_model}}\nMiles: {{mileage}}\nPrice: {{price}}\n\nWant to come take a look? Schedule a test drive: {{booking_link}}\n\n— {{business_name}}", trigger: 'inventory_match' }
    ],
    sms_templates: [
      { name: 'Test Drive Confirmation', body: "Hi {{customer_name}}! Your test drive at {{business_name}} is confirmed for {{date}} at {{time}}. We'll have the {{vehicle_year}} {{vehicle_make}} ready for you!", trigger: 'test_drive_booked' },
      { name: 'Lead Follow-Up', body: "Hi {{customer_name}}, it's {{salesperson_name}} from {{business_name}}. Still thinking about that {{vehicle_make}}? It's still available! Let me know if you have any questions.", trigger: 'lead_follow_up_48h' },
      { name: 'Purchase Anniversary', body: "Happy car-iversary, {{customer_name}}! It's been 1 year since you drove off in your {{vehicle_make}} from {{business_name}}. Hope it's been treating you well! Need anything? We're here.", trigger: 'purchase_anniversary' }
    ],
    estimated_hours_saved_weekly: 18,
    estimated_monthly_value: 4500,
    ideal_plan: 'growth',
    competitor_tools: ['DealerSocket', 'VinSolutions', 'CarGurus', 'AutoTrader']
  },

  // ─── 10. MOTORCYCLE SHOP ───
  {
    id: 'motorcycle-shop',
    industry: 'Automotive',
    niche: 'Motorcycle Shop',
    display_name: 'Motorcycle Shop',
    emoji: '🏍️',
    tagline: 'Your AI shop assistant that books service, manages parts orders, and keeps riders coming back.',
    demo_greeting: "Hey! I'm Mouse, your AI motorcycle shop assistant. I book service appointments, answer parts questions, and keep your riding community engaged. Want to see how I'd help a rider whose bike won't start?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a motorcycle shop that does sales, service, and parts. Be passionate about riding and knowledgeable about common motorcycle issues. Help with service booking, parts inquiries, and general motorcycle questions. Use riding community language naturally.",
    demo_suggested_messages: [
      "My bike won't start — what could it be?",
      'How much for a full service on my Harley?',
      "I need new tires for my sportbike",
      'Do you sell used bikes?'
    ],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} run their motorcycle shop by booking service, answering parts questions, managing the riding community, and keeping bikers coming back. You're passionate about motorcycles and speak the language of riders. You know common issues across different brands. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Whether you need service, parts, or just have a question about your ride, I can help. What's going on?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a motorcycle shop. Help with service booking, parts inquiries, general motorcycle questions, and sales inquiries. Be passionate and knowledgeable. Transfer to a technician for complex diagnostic questions, to sales for new/used bike purchases, or to the owner for custom build inquiries.",
    receptionist_faqs: [
      { question: 'How much for a full service?', answer: "A full service (oil change, chain adjust, brake check, fluid top-off, and multi-point inspection) starts at {{service_price}} for most bikes. Sport bikes and touring bikes may vary. Want me to get you a quote for your specific ride?", category: 'pricing' },
      { question: 'Do you work on all brands?', answer: "{{brands_answer}} Our techs have experience across the board.", category: 'services' },
      { question: 'How much for new tires?', answer: "Tire prices vary by bike and riding style. A set of sport tires starts around {{sport_tire_price}}, cruiser tires around {{cruiser_tire_price}}, including installation. Tell me your bike and I'll get you an exact quote.", category: 'pricing' },
      { question: 'Do you sell used bikes?', answer: "{{used_bikes_answer}} We also take trade-ins if you're looking to upgrade.", category: 'sales' },
      { question: 'Do you do custom work?', answer: "{{custom_work_answer}} Tell us your vision and we'll make it happen.", category: 'services' }
    ],
    receptionist_transfer_triggers: [
      'complex diagnostic or engine rebuild discussion',
      'new or used bike purchase negotiation',
      'custom build consultation',
      'complaint about a repair or parts order',
      'group ride or event sponsorship inquiry'
    ],
    wizard_steps: [
      {
        step_number: 1,
        title: 'Your Shop',
        description: "Let's get your motorcycle shop set up.",
        fields: [
          { name: 'business_name', label: 'Shop Name', type: 'text', placeholder: 'Iron Horse Cycles', required: true },
          { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Jake Morgan', required: true },
          { name: 'phone', label: 'Shop Phone', type: 'phone', placeholder: '(555) 012-3456', required: true },
          { name: 'address', label: 'Shop Address', type: 'text', placeholder: '777 Rider Rd, Anytown, USA', required: true }
        ]
      },
      {
        step_number: 2,
        title: 'Services & Brands',
        description: 'What do you do and what brands do you work on?',
        fields: [
          { name: 'services', label: 'Services Offered', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Routine Service', 'Engine Repair', 'Tire Change', 'Brake Service', 'Chain & Sprocket', 'Electrical', 'Suspension', 'Custom Builds', 'Performance Upgrades', 'Winterization', 'Dyno Tuning'] },
          { name: 'brands', label: 'Brands You Service', type: 'multiselect', placeholder: 'Select brands', required: true, options: ['Harley-Davidson', 'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'Triumph', 'Indian', 'KTM', 'All Brands'] },
          { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Tue-Sat 9am-6pm', required: true }
        ]
      },
      {
        step_number: 3,
        title: 'Pricing & Inventory',
        description: 'Some basics for customer quotes.',
        fields: [
          { name: 'service_price', label: 'Full Service Starting Price', type: 'currency', placeholder: '199', required: true },
          { name: 'sells_bikes', label: 'Do You Sell Bikes?', type: 'toggle', placeholder: '', required: true },
          { name: 'parts_department', label: 'Parts Department?', type: 'toggle', placeholder: '', required: true }
        ]
      },
      {
        step_number: 4,
        title: 'Community',
        description: 'Last step — connect with your riders.',
        fields: [
          { name: 'website', label: 'Website', type: 'url', placeholder: 'www.ironhorsecycles.com', required: false },
          { name: 'group_rides', label: 'Organize Group Rides?', type: 'toggle', placeholder: '', required: false, help_text: 'Mouse can help promote and manage these' }
        ]
      }
    ],
    dashboard_widgets: [
      { id: 'todays-service', title: "Today's Service Schedule", description: 'Bikes in for service today with status.', priority: 1 },
      { id: 'parts-orders', title: 'Pending Parts Orders', description: 'Parts on order with expected arrival dates.', priority: 2 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Service, parts, and sales revenue.', priority: 3 },
      { id: 'upcoming-events', title: 'Upcoming Rides & Events', description: 'Group rides and shop events on the calendar.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send spring service reminder', description: 'Text customers about spring tune-ups and tire checks.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Follow up on parts order arrival', description: 'Notify customer their ordered part has arrived.', category: 'operations', difficulty: 'automatic' },
      { title: 'Promote group ride', description: 'Send ride details to the rider community list.', category: 'marketing', difficulty: 'needs-approval' },
      { title: 'Book seasonal service appointment', description: 'Schedule winterization or spring startup service.', category: 'scheduling', difficulty: 'needs-approval' },
      { title: 'Request review after service', description: 'Send review request 24 hours after service pickup.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Service Revenue Per Week', unit: 'dollars', description: 'Total service department revenue per week.', target_suggestion: 5000 },
      { name: 'Parts Sales Per Week', unit: 'dollars', description: 'Total parts department revenue per week.', target_suggestion: 3000 },
      { name: 'Average Service Ticket', unit: 'dollars', description: 'Average revenue per service visit.', target_suggestion: 300 },
      { name: 'Customer Return Rate', unit: 'percentage', description: 'Customers who return within 12 months.', target_suggestion: 65 }
    ],
    suggested_integrations: [
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up when riders search for motorcycle shops.', priority: 'essential' },
      { name: 'Lightspeed', slug: 'lightspeed', category: 'pos', why: 'Manage service, parts, and sales in one system.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track shop finances across all departments.', priority: 'recommended' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Showcase builds, restorations, and shop culture.', priority: 'recommended' },
      { name: 'Parts Unlimited', slug: 'parts-unlimited', category: 'industry', why: 'Order parts directly from the distributor.', priority: 'recommended' }
    ],
    integration_priority: ['google-business', 'lightspeed', 'quickbooks', 'instagram', 'parts-unlimited'],
    email_templates: [
      { name: 'Service Confirmation', subject: 'Your Service Appointment — {{business_name}}', body: "Hi {{customer_name}},\n\nYour {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} is scheduled for service:\n\nDate: {{date}}\nService: {{service_type}}\n\nDrop off anytime during business hours: {{business_hours}}\nAddress: {{address}}\n\nRide safe getting here!\n— {{business_name}}", trigger: 'appointment_confirmed' },
      { name: 'Spring Riding Season', subject: 'Riding Season is Here! — {{business_name}}', body: "Hi {{customer_name}},\n\nTime to dust off the bike! Before you hit the road, let us give your ride a spring check-up:\n\n- Oil & filter change\n- Tire inspection\n- Chain adjustment\n- Brake check\n- Battery test\n\nStarting at {{service_price}}. Book now: {{booking_link}}\n\nLet's ride!\n— {{business_name}}", trigger: 'spring_season_reminder' }
    ],
    sms_templates: [
      { name: 'Service Ready', body: "Hey {{customer_name}}! Your {{vehicle_make}} is ready to ride. Pick up at {{business_name}} during {{business_hours}}. She's running great!", trigger: 'service_completed' },
      { name: 'Parts Arrived', body: "{{customer_name}}, the parts for your {{vehicle_make}} are in! Call {{phone}} or stop by {{business_name}} to schedule installation.", trigger: 'parts_received' },
      { name: 'Group Ride Invite', body: "{{business_name}} group ride this {{ride_day}}! Meeting at the shop at {{ride_time}}, route: {{route_description}}. All riders welcome. Reply YES to RSVP!", trigger: 'group_ride_promo' }
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2800,
    ideal_plan: 'pro',
    competitor_tools: ['Lightspeed EVO', 'Blackpurl', 'CDK Global Powersports']
  }
];
