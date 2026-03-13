import type { ProTemplate } from '../schema';

export const professionalServicesTemplates: ProTemplate[] = [
  {
    id: 'accountant-cpa',
    industry: 'Professional Services',
    niche: 'Accountant / CPA',
    display_name: 'Accounting Firm',
    emoji: '📊',
    tagline: 'Manage tax season chaos, onboard clients faster, and keep the books on track.',

    demo_greeting: "Hi! I'm your AI assistant for an accounting firm. I can help with scheduling appointments, answering questions about services, and organizing tax season. How can I help?",
    demo_system_prompt: "You are an AI assistant for an accounting firm. Help potential clients understand services (tax prep, bookkeeping, payroll, advisory) and schedule consultations. Be professional and clear. NEVER give tax advice or specific financial guidance. Emphasize accuracy and peace of mind.",
    demo_suggested_messages: [
      "I need help with my small business taxes",
      "What's the difference between a bookkeeper and a CPA?",
      "When is the deadline to file my taxes?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, an accounting firm. Help clients schedule appointments, understand services, and prepare for tax season. NEVER give tax advice or specific financial guidance. Be professional, organized, and reassuring — many clients are stressed about taxes and finances. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you a new client looking for accounting help, or an existing client?",
    receptionist_system_prompt: "You are the receptionist for an accounting firm. Determine if the caller needs tax preparation, bookkeeping, payroll, or advisory services. For new clients, gather: name, business type (if applicable), and what they need help with. Schedule a consultation. During tax season, inform callers of the filing deadline and document requirements. NEVER give tax advice.",
    receptionist_faqs: [
      { question: "How much does tax preparation cost?", answer: "Fees depend on the complexity of your return — individual vs. business, number of schedules, etc. We offer a free initial consultation where we can give you a clear quote.", category: "fees" },
      { question: "What documents do I need to bring?", answer: "For personal taxes: W-2s, 1099s, mortgage statements, charitable donation receipts, and last year's tax return. For business taxes: profit & loss statement, bank statements, and expense records. We'll send you a detailed checklist.", category: "preparation" },
      { question: "Can you help with my business taxes?", answer: "Absolutely. We handle business taxes for sole proprietors, LLCs, partnerships, S-corps, and C-corps. We also offer year-round bookkeeping and payroll to make tax time easier.", category: "services" }
    ],
    receptionist_transfer_triggers: [
      "caller received an IRS notice or audit letter",
      "caller has a tax filing deadline within a week",
      "caller asks about back taxes they haven't filed",
      "caller is an existing client with an urgent question"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Firm', description: 'Tell us about your accounting practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Summit Accounting Group', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-2000', required: true },
        { name: 'services', label: 'Services you offer', type: 'multiselect', placeholder: '', required: true, options: ['Individual Tax Preparation', 'Business Tax Preparation', 'Bookkeeping', 'Payroll', 'QuickBooks Setup/Training', 'Financial Planning', 'IRS Representation', 'Business Advisory', 'Nonprofit Accounting'] }
      ]},
      { step_number: 2, title: 'Clients', description: 'Who do you primarily serve?', fields: [
        { name: 'client_types', label: 'Primary clients', type: 'multiselect', placeholder: '', required: true, options: ['Individuals', 'Small Businesses', 'Freelancers/Self-Employed', 'Real Estate Investors', 'Nonprofits', 'Restaurants', 'Medical Practices', 'Construction Companies'] },
        { name: 'software', label: 'Accounting software used', type: 'multiselect', placeholder: '', required: false, options: ['QuickBooks Online', 'QuickBooks Desktop', 'Xero', 'FreshBooks', 'Wave'] }
      ]},
      { step_number: 3, title: 'Hours', description: 'When are you available?', fields: [
        { name: 'business_hours', label: 'Regular Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'tax_season_hours', label: 'Tax Season Extended Hours', type: 'time_range', placeholder: '8:00 AM - 8:00 PM', required: false, help_text: 'Jan-April extended hours, if applicable' }
      ]},
      { step_number: 4, title: 'Consultations', description: 'How do you start with new clients?', fields: [
        { name: 'consultation_fee', label: 'Initial consultation fee', type: 'select', placeholder: '', required: true, options: ['Free', 'Paid — applied to services'] },
        { name: 'virtual_meetings', label: 'Offer virtual meetings?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-clients', title: 'New Client Inquiries', description: 'People looking for accounting help', priority: 1 },
      { id: 'tax-season', title: 'Tax Season Tracker', description: 'Returns in progress and filed', priority: 2 },
      { id: 'document-status', title: 'Missing Documents', description: 'Clients who haven\'t sent their docs yet', priority: 3 },
      { id: 'deadlines', title: 'Upcoming Deadlines', description: 'Filing deadlines and extension dates', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send document checklist', description: 'New tax client needs to know what documents to bring.', category: 'onboarding', difficulty: 'automatic' },
      { title: 'Missing document follow-up', description: 'Client still hasn\'t sent their W-2 — send reminder.', category: 'document-collection', difficulty: 'automatic' },
      { title: 'Tax return ready notification', description: 'Client\'s return is complete — schedule review meeting.', category: 'client-communication', difficulty: 'automatic' },
      { title: 'Quarterly estimated tax reminder', description: 'Remind business clients about quarterly estimated payment deadline.', category: 'reminders', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Clients', unit: 'per month', description: 'New clients onboarded', target_suggestion: 10 },
      { name: 'Returns Filed', unit: 'per month', description: 'Tax returns completed and filed', target_suggestion: 30 },
      { name: 'Document Collection Rate', unit: 'percent', description: 'Clients who submit docs on first request', target_suggestion: 60 },
      { name: 'Client Retention', unit: 'percent', description: 'Clients who return year over year', target_suggestion: 90 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Clients book appointments without calling', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Direct access to client books for tax prep and bookkeeping', priority: 'essential' },
      { name: 'DocuSign', slug: 'docusign', category: 'documents', why: 'Clients sign engagement letters and tax forms remotely', priority: 'recommended' },
      { name: 'Dropbox', slug: 'dropbox', category: 'file-sharing', why: 'Secure document exchange with clients', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'quickbooks', 'docusign', 'dropbox'],

    email_templates: [
      { name: 'Tax Document Checklist', subject: 'What We Need for Your {{tax_year}} Tax Return — {{business_name}}', body: "Hi {{client_name}},\n\nIt's that time of year! To prepare your {{tax_year}} tax return, please gather and send us:\n\n{{document_checklist}}\n\nYou can upload documents securely here: {{upload_link}}\nOr bring them to your appointment on {{date}}.\n\nThe earlier we get your documents, the earlier we can file.\n\nBest,\n{{business_name}}", trigger: 'tax_season_start' },
      { name: 'Return Ready', subject: 'Your Tax Return is Ready for Review — {{business_name}}', body: "Hi {{client_name}},\n\nGreat news — your {{tax_year}} tax return is ready!\n\n{{return_summary}}\n\nWe'd like to review it with you before filing. Please schedule a review meeting: {{booking_link}}\n\nOr call us at {{phone}}.\n\n{{business_name}}", trigger: 'return_complete' }
    ],
    sms_templates: [
      { name: 'Document Reminder', body: "Hi {{client_name}}, this is {{business_name}}. We're still waiting on a few documents for your tax return. Can you send them over this week? Upload here: {{upload_link}}", trigger: 'missing_documents' },
      { name: 'Filing Deadline Reminder', body: "Reminder from {{business_name}}: The {{deadline_name}} tax filing deadline is {{date}}. If you haven't sent your documents yet, please do so ASAP. Call {{phone}} with questions.", trigger: 'deadline_approaching' }
    ],

    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3000,
    ideal_plan: 'growth',
    competitor_tools: ['TaxDome', 'Canopy', 'Karbon']
  },

  {
    id: 'insurance-agent',
    industry: 'Professional Services',
    niche: 'Insurance Agent',
    display_name: 'Insurance Agency',
    emoji: '🛡️',
    tagline: 'Quote faster, follow up automatically, and never lose a lead to a competitor.',

    demo_greeting: "Hi! I'm your AI assistant for an insurance agency. I can help you understand your coverage options, get a quote started, or schedule a consultation. How can I help?",
    demo_system_prompt: "You are an AI assistant for an independent insurance agency. Help potential clients understand insurance types and start the quote process. NEVER provide actual quotes, bind coverage, or make coverage recommendations. Your job is to gather info and schedule a meeting with an agent.",
    demo_suggested_messages: [
      "I need auto insurance — what do you need from me?",
      "Can you bundle home and auto?",
      "I'm starting a business — what insurance do I need?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, an insurance agency. Help potential clients understand insurance options and schedule appointments. NEVER quote prices, bind coverage, or make specific recommendations. Gather information and connect them with an agent. Be friendly and helpful — insurance can be confusing. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you looking for a new insurance quote, or are you an existing client?",
    receptionist_system_prompt: "You are the receptionist for an insurance agency. For new clients: determine what type of insurance they need, gather basic info (name, contact, what they're insuring), and schedule with an agent. For existing clients: help with policy questions by taking a message for their agent. NEVER quote prices or bind coverage.",
    receptionist_faqs: [
      { question: "How much does insurance cost?", answer: "Rates depend on many factors, so I can't give you a number right now. But our agents can shop multiple carriers to find you the best rate. Would you like to schedule a free quote?", category: "pricing" },
      { question: "Can you help me with a claim?", answer: "I can connect you with your agent to start the claims process. Can I get your name and policy number?", category: "claims" },
      { question: "Do you work with multiple insurance companies?", answer: "Yes! We're an independent agency, which means we shop multiple carriers to find you the best coverage at the best price. It's like having a personal shopper for insurance.", category: "about" }
    ],
    receptionist_transfer_triggers: [
      "caller needs to report a claim",
      "caller's policy is about to cancel for non-payment",
      "caller had an accident or property damage",
      "caller received a cancellation notice"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Agency', description: 'Tell us about your insurance agency.', fields: [
        { name: 'business_name', label: 'Agency Name', type: 'text', placeholder: 'Hometown Insurance Agency', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-3000', required: true },
        { name: 'insurance_types', label: 'Types of insurance you sell', type: 'multiselect', placeholder: '', required: true, options: ['Auto', 'Home', 'Renters', 'Life', 'Business/Commercial', 'Health', 'Umbrella', 'Motorcycle/RV/Boat', 'Workers Comp', 'Professional Liability'] }
      ]},
      { step_number: 2, title: 'Carriers', description: 'Who do you write with?', fields: [
        { name: 'agency_type', label: 'Agency type', type: 'select', placeholder: '', required: true, options: ['Independent (multiple carriers)', 'Captive (one carrier)', 'Both'] },
        { name: 'top_carriers', label: 'Top carriers you represent', type: 'text', placeholder: 'State Farm, Progressive, Travelers, Hartford', required: false }
      ]},
      { step_number: 3, title: 'Hours', description: 'When can clients reach you?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'after_hours_claims', label: 'After-hours claims line?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Quotes', description: 'How do you handle new quotes?', fields: [
        { name: 'quote_turnaround', label: 'Typical quote turnaround', type: 'select', placeholder: '', required: true, options: ['Same day', 'Within 24 hours', 'Within 48 hours'] },
        { name: 'free_review', label: 'Offer free policy reviews?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-leads', title: 'New Quote Requests', description: 'People requesting insurance quotes', priority: 1 },
      { id: 'pending-quotes', title: 'Pending Quotes', description: 'Quotes sent but not yet bound', priority: 2 },
      { id: 'renewals', title: 'Upcoming Renewals', description: 'Policies renewing this month', priority: 3 },
      { id: 'cross-sell', title: 'Cross-Sell Opportunities', description: 'Clients with only one policy', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up on pending quote', description: 'Client received auto quote 3 days ago but hasn\'t responded.', category: 'leads', difficulty: 'automatic' },
      { title: 'Renewal review', description: 'Client\'s home policy renews next month — schedule review to re-shop.', category: 'retention', difficulty: 'automatic' },
      { title: 'Cross-sell opportunity', description: 'Auto client doesn\'t have home insurance with you — offer a bundle quote.', category: 'upsell', difficulty: 'needs-approval' },
      { title: 'Birthday/anniversary message', description: 'Send personalized birthday greeting to long-time client.', category: 'relationship', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Quote Requests', unit: 'per month', description: 'New quote inquiries', target_suggestion: 30 },
      { name: 'Close Rate', unit: 'percent', description: 'Quotes that turn into bound policies', target_suggestion: 35 },
      { name: 'Policies Per Client', unit: 'count', description: 'Average number of policies per household', target_suggestion: 2.5 },
      { name: 'Retention Rate', unit: 'percent', description: 'Policies that renew year over year', target_suggestion: 90 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Clients book quote appointments online', priority: 'essential' },
      { name: 'Applied Epic', slug: 'applied-epic', category: 'agency-management', why: 'Industry-standard agency management system', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'People search "insurance agent near me"', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Send renewal reminders and seasonal coverage tips', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'applied-epic', 'google-business', 'mailchimp'],

    email_templates: [
      { name: 'Quote Ready', subject: 'Your Insurance Quote from {{business_name}}', body: "Hi {{client_name}},\n\nGreat news — I've shopped your {{insurance_type}} insurance with multiple carriers and found some excellent options for you.\n\n{{quote_summary}}\n\nI'd love to walk you through the details. Can we schedule a quick call?\n\nBook a time: {{booking_link}}\nOr call me at {{phone}}.\n\nLooking forward to helping you save!\n{{agent_name}}\n{{business_name}}", trigger: 'quote_ready' },
      { name: 'Renewal Review', subject: 'Your {{insurance_type}} Policy Renews Soon — Let\'s Review', body: "Hi {{client_name}},\n\nYour {{insurance_type}} policy renews on {{renewal_date}}. This is a great time to review your coverage and make sure you're getting the best rate.\n\nI'll re-shop your policy with our carriers and let you know if we can do better.\n\nNo action needed on your part — I'll reach out with the results!\n\n{{agent_name}}\n{{business_name}}", trigger: 'renewal_approaching' }
    ],
    sms_templates: [
      { name: 'Quote Follow-Up', body: "Hi {{client_name}}, this is {{agent_name}} from {{business_name}}. I sent your insurance quote — did you have a chance to review it? Happy to answer any questions. Call/text me at {{phone}}.", trigger: 'quote_follow_up' },
      { name: 'Claim Check-In', body: "Hi {{client_name}}, just checking in on your claim. Is there anything you need from us? Call {{phone}} if you need help.", trigger: 'claim_check_in' }
    ],

    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2600,
    ideal_plan: 'growth',
    competitor_tools: ['Agency Zoom', 'HawkSoft', 'InsuredMine']
  },

  {
    id: 'financial-advisor',
    industry: 'Professional Services',
    niche: 'Financial Advisor',
    display_name: 'Financial Advisory Firm',
    emoji: '💼',
    tagline: 'Attract more clients, nurture relationships, and keep your book of business growing.',

    demo_greeting: "Hi! I'm your AI assistant for a financial advisory firm. I can help schedule consultations, explain our services, and answer general questions. How can I help?",
    demo_system_prompt: "You are an AI assistant for a financial advisory firm. Help potential clients understand services and schedule consultations. NEVER give investment advice, recommend specific products, or discuss returns. Be professional and trustworthy. Many people are nervous about discussing money — be warm and non-judgmental.",
    demo_suggested_messages: [
      "I want to start planning for retirement",
      "What's the difference between a financial advisor and a financial planner?",
      "How much do I need to invest to work with you?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a financial advisory firm. Help potential clients schedule consultations and understand services. NEVER give investment advice, recommend products, or discuss specific returns. Be professional, warm, and trustworthy. Many people are uncomfortable discussing money — make them feel at ease. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you interested in learning about our financial planning services, or are you an existing client?",
    receptionist_system_prompt: "You are the receptionist for a financial advisory firm. Help callers understand services and schedule consultations. NEVER give investment advice or recommend products. Gather: name, what they're looking for help with, and approximate assets or income range if offered. Be professional and warm.",
    receptionist_faqs: [
      { question: "How much does a financial advisor cost?", answer: "Our fees depend on the type of service you need. We offer a complimentary initial consultation to understand your goals and explain our fee structure clearly. No surprises.", category: "fees" },
      { question: "Do you have a minimum investment?", answer: "We work with clients at various levels. Our advisor can discuss specifics during your consultation and recommend the best approach for your situation.", category: "requirements" },
      { question: "Are you a fiduciary?", answer: "Yes, we act as fiduciaries, which means we're legally required to act in your best interest. Your goals come first, always.", category: "trust" }
    ],
    receptionist_transfer_triggers: [
      "caller has an urgent financial decision to make",
      "caller mentions a recent death and needs help with inherited accounts",
      "caller wants to discuss an existing portfolio concern",
      "caller is a high-net-worth prospect"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Firm', description: 'Tell us about your advisory practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Beacon Financial Advisors', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 300-4000', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Retirement Planning', 'Investment Management', 'Tax Planning', 'Estate Planning', 'College Savings', 'Insurance Review', 'Social Security Planning', 'Business Owner Planning', 'Divorce Financial Planning'] }
      ]},
      { step_number: 2, title: 'Your Approach', description: 'How do you work with clients?', fields: [
        { name: 'fee_structure', label: 'Fee structure', type: 'select', placeholder: '', required: true, options: ['Fee-Only (no commissions)', 'Fee-Based', 'Commission-Based', 'Flat Fee Financial Plans'] },
        { name: 'fiduciary', label: 'Are you a fiduciary?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 3, title: 'Clients', description: 'Who do you primarily serve?', fields: [
        { name: 'ideal_clients', label: 'Ideal client profile', type: 'multiselect', placeholder: '', required: true, options: ['Pre-Retirees (50-65)', 'Retirees', 'Young Professionals', 'Business Owners', 'High Net Worth', 'Doctors/Dentists', 'Teachers/Government Workers', 'Women in Transition'] },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true }
      ]},
      { step_number: 4, title: 'Getting Started', description: 'How do new clients begin?', fields: [
        { name: 'first_meeting', label: 'First meeting format', type: 'select', placeholder: '', required: true, options: ['Complimentary consultation', 'Paid discovery session', 'Free financial checkup'] },
        { name: 'virtual_meetings', label: 'Virtual meetings available?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],

    dashboard_widgets: [
      { id: 'prospects', title: 'New Prospects', description: 'Potential clients who reached out', priority: 1 },
      { id: 'review-meetings', title: 'Client Reviews Due', description: 'Annual/semi-annual reviews to schedule', priority: 2 },
      { id: 'life-events', title: 'Client Life Events', description: 'Birthdays, anniversaries, milestones', priority: 3 },
      { id: 'referrals', title: 'Referral Pipeline', description: 'Leads from client referrals', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up with prospect', description: 'Potential client expressed interest in retirement planning — schedule consultation.', category: 'leads', difficulty: 'automatic' },
      { title: 'Annual review reminder', description: 'Client is due for their annual portfolio review.', category: 'retention', difficulty: 'automatic' },
      { title: 'Birthday greeting', description: 'Long-time client\'s birthday is next week — send personal note.', category: 'relationship', difficulty: 'automatic' },
      { title: 'Market update', description: 'Send clients a calm, reassuring market update during volatility.', category: 'communication', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'New Prospects', unit: 'per month', description: 'Potential clients reaching out', target_suggestion: 8 },
      { name: 'Prospect-to-Client Rate', unit: 'percent', description: 'Prospects who become clients', target_suggestion: 40 },
      { name: 'Client Satisfaction', unit: 'rating', description: 'Annual satisfaction survey score', target_suggestion: 4.9 },
      { name: 'Referrals Received', unit: 'per month', description: 'New leads from client referrals', target_suggestion: 3 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Prospects book consultations without playing phone tag', priority: 'essential' },
      { name: 'Wealthbox', slug: 'wealthbox', category: 'crm', why: 'Financial advisor CRM for managing client relationships', priority: 'essential' },
      { name: 'DocuSign', slug: 'docusign', category: 'documents', why: 'Clients sign agreements and forms remotely', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Send market updates and financial planning tips', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'wealthbox', 'docusign', 'mailchimp'],

    email_templates: [
      { name: 'Consultation Invitation', subject: 'Your Complimentary Consultation — {{business_name}}', body: "Hi {{client_name}},\n\nThank you for your interest in {{business_name}}. I'd love to learn more about your financial goals.\n\nYour consultation is scheduled for {{date}} at {{time}}.\n\nDuring our meeting, we'll:\n- Discuss what's most important to you financially\n- Review your current situation at a high level\n- Determine if we're a good fit to work together\n\nNo sales pitch — just an honest conversation.\n\nLooking forward to meeting you,\n{{advisor_name}}\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Annual Review Invitation', subject: 'Time for Your Annual Financial Review — {{business_name}}', body: "Hi {{client_name}},\n\nIt's time for your annual review. A lot can change in a year, and I want to make sure your plan still reflects your goals.\n\nSchedule your review: {{booking_link}}\n\nWe'll look at:\n- Portfolio performance\n- Any life changes to account for\n- Tax planning opportunities\n- Adjustments to your strategy\n\nLooking forward to catching up.\n\n{{advisor_name}}\n{{business_name}}", trigger: 'annual_review' }
    ],
    sms_templates: [
      { name: 'Meeting Reminder', body: "Hi {{client_name}}, this is {{advisor_name}} from {{business_name}}. Your meeting is tomorrow at {{time}}. Looking forward to it. Call {{phone}} if you need to reschedule.", trigger: 'meeting_reminder' },
      { name: 'Market Note', body: "Hi {{client_name}}, this is {{advisor_name}}. I know the markets have been volatile — your portfolio is positioned well and we're monitoring closely. Call me if you have questions.", trigger: 'market_event' }
    ],

    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2500,
    ideal_plan: 'growth',
    competitor_tools: ['Wealthbox', 'Redtail', 'Salesforce Financial Services']
  },

  {
    id: 'tax-preparation',
    industry: 'Professional Services',
    niche: 'Tax Preparation Service',
    display_name: 'Tax Preparation Service',
    emoji: '🧾',
    tagline: 'Handle the tax season rush with automated scheduling, doc collection, and client follow-up.',

    demo_greeting: "Hi! I'm your AI assistant for a tax preparation service. I can help schedule your tax appointment, tell you what documents to bring, and answer general questions. How can I help?",
    demo_system_prompt: "You are an AI assistant for a tax preparation service. Help clients schedule appointments, understand what documents they need, and learn about services. NEVER give tax advice. Be efficient during tax season — clients want fast answers. Be patient with first-time filers.",
    demo_suggested_messages: [
      "I need to file my taxes — how do I get started?",
      "What documents do I need to bring?",
      "How much does tax prep cost?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a tax preparation service. Help clients schedule appointments and understand what documents to bring. NEVER give tax advice. Be efficient — tax season is busy and clients want fast answers. Be extra patient with first-time filers. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you looking to schedule a tax appointment?",
    receptionist_system_prompt: "You are the receptionist for a tax prep service. Determine: returning or new client, individual or business return, and schedule an appointment. For returning clients, remind them to bring the same docs as last year plus any new ones. NEVER give tax advice.",
    receptionist_faqs: [
      { question: "How much does it cost?", answer: "Pricing depends on the complexity of your return. Simple individual returns start at a lower rate, while business and more complex returns are priced accordingly. We'll give you a quote before we start.", category: "pricing" },
      { question: "When is the deadline?", answer: "The federal tax filing deadline is typically April 15. If you need more time, we can file an extension, but any taxes owed are still due by April 15.", category: "deadlines" },
      { question: "Can I drop off my documents?", answer: "Absolutely! You can drop off your documents and we'll prepare your return. We'll call you when it's ready to review and sign. Many clients prefer this option to save time.", category: "process" }
    ],
    receptionist_transfer_triggers: [
      "caller received an IRS notice",
      "caller says they haven't filed in multiple years",
      "caller is a business with complex tax needs",
      "caller is upset about their bill or their refund"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: 'Tell us about your tax prep service.', fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Express Tax Services', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 400-5000', required: true },
        { name: 'services', label: 'What do you prepare?', type: 'multiselect', placeholder: '', required: true, options: ['Individual Returns (1040)', 'Business Returns (Sch C, 1120, 1065)', 'Rental Property (Sch E)', 'Nonprofit Returns (990)', 'Amended Returns', 'Multi-State Returns', 'ITIN Applications', 'Back Taxes'] }
      ]},
      { step_number: 2, title: 'How You Work', description: 'How do clients get their taxes done?', fields: [
        { name: 'prep_methods', label: 'How can clients file?', type: 'multiselect', placeholder: '', required: true, options: ['In-Person Appointment', 'Drop-Off', 'Virtual/Remote', 'Walk-In (no appointment)'] },
        { name: 'refund_options', label: 'Refund options', type: 'multiselect', placeholder: '', required: false, options: ['Direct Deposit', 'Refund Transfer (fees from refund)', 'Check'] }
      ]},
      { step_number: 3, title: 'Hours & Pricing', description: 'Availability and costs.', fields: [
        { name: 'business_hours', label: 'Tax Season Hours', type: 'time_range', placeholder: '8:00 AM - 9:00 PM', required: true },
        { name: 'starting_price', label: 'Starting price for a basic return', type: 'currency', placeholder: '75', required: true }
      ]},
      { step_number: 4, title: 'Offseason', description: 'What happens after April?', fields: [
        { name: 'year_round', label: 'Open year-round?', type: 'toggle', placeholder: '', required: true },
        { name: 'bookkeeping', label: 'Offer bookkeeping services?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],

    dashboard_widgets: [
      { id: 'appointments', title: 'Today\'s Appointments', description: 'Tax appointments scheduled today', priority: 1 },
      { id: 'drop-offs', title: 'Drop-Off Returns', description: 'Returns waiting to be prepared', priority: 2 },
      { id: 'returns-ready', title: 'Returns Ready for Pickup', description: 'Completed returns waiting for client review', priority: 3 },
      { id: 'deadline-countdown', title: 'Filing Deadline', description: 'Days until the next filing deadline', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule new appointment', description: 'New client called about individual tax prep — book them in.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Return ready notification', description: 'Client\'s return is done — notify them it\'s ready for review.', category: 'client-communication', difficulty: 'automatic' },
      { title: 'Missing document follow-up', description: 'Client\'s drop-off is missing a 1099 — request it.', category: 'document-collection', difficulty: 'automatic' },
      { title: 'Returning client outreach', description: 'Send last year\'s clients a reminder that tax season is open.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Returns Prepared', unit: 'per week', description: 'Tax returns completed', target_suggestion: 25 },
      { name: 'Average Revenue Per Return', unit: 'dollars', description: 'Average fee per completed return', target_suggestion: 200 },
      { name: 'Returning Client Rate', unit: 'percent', description: 'Last year\'s clients who come back', target_suggestion: 75 },
      { name: 'Referral Rate', unit: 'percent', description: 'New clients from referrals', target_suggestion: 30 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Clients book tax appointments online', priority: 'essential' },
      { name: 'Drake Tax', slug: 'drake-tax', category: 'tax-software', why: 'Tax preparation and e-filing software', priority: 'essential' },
      { name: 'Dropbox', slug: 'dropbox', category: 'file-sharing', why: 'Secure document upload for remote clients', priority: 'recommended' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'People search "tax prep near me" during tax season', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'drake-tax', 'dropbox', 'google-business'],

    email_templates: [
      { name: 'Appointment Confirmation', subject: 'Your Tax Appointment — {{business_name}}', body: "Hi {{client_name}},\n\nYour tax appointment is confirmed for {{date}} at {{time}}.\n\nPlease bring:\n- Photo ID\n- Social Security cards (all household members)\n- W-2s and 1099s\n- Last year's tax return\n- Any other income/deduction documents\n\nSee our full checklist: {{checklist_link}}\n\nSee you then!\n{{business_name}}", trigger: 'appointment_booked' },
      { name: 'Return Ready', subject: 'Your Tax Return is Ready — {{business_name}}', body: "Hi {{client_name}},\n\nYour {{tax_year}} tax return is complete and ready for your review.\n\n{{return_summary}}\n\nPlease come in or call us to review and sign. We need your approval before we can e-file.\n\nCall {{phone}} or reply to this email to schedule.\n\n{{business_name}}", trigger: 'return_ready' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{client_name}}, your tax appointment at {{business_name}} is tomorrow at {{time}}. Bring your W-2s, 1099s, and photo ID. Call {{phone}} to reschedule.", trigger: 'appointment_reminder' },
      { name: 'Tax Season Opening', body: "Hi {{client_name}}, it's tax season! {{business_name}} is now scheduling appointments. Book early for the best times: {{booking_link}} or call {{phone}}.", trigger: 'season_opening' }
    ],

    estimated_hours_saved_weekly: 15,
    estimated_monthly_value: 2800,
    ideal_plan: 'growth',
    competitor_tools: ['TaxDome', 'Intuit ProConnect', 'H&R Block (competitor)']
  },

  {
    id: 'marketing-agency',
    industry: 'Professional Services',
    niche: 'Marketing Agency',
    display_name: 'Marketing Agency',
    emoji: '📈',
    tagline: 'Win more clients, streamline onboarding, and deliver reports that keep clients happy.',

    demo_greeting: "Hi! I'm your AI assistant for a marketing agency. I can help potential clients learn about our services, discuss project types, and schedule a discovery call. How can I help?",
    demo_system_prompt: "You are an AI assistant for a marketing agency. Help potential clients understand services (SEO, social media, PPC, branding, web design) and schedule discovery calls. Be confident and knowledgeable. Ask about their business goals rather than jumping straight to tactics.",
    demo_suggested_messages: [
      "I need help getting more customers for my business",
      "How much does social media management cost?",
      "What results can I expect from SEO?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a marketing agency. Help potential clients understand how marketing can grow their business and schedule discovery calls. Focus on business outcomes, not jargon. Ask about their goals first. NEVER guarantee specific results or rankings. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you looking for marketing help, or are you an existing client?",
    receptionist_system_prompt: "You are the receptionist for a marketing agency. For potential clients: learn about their business, goals, and current marketing efforts. Schedule a discovery call. Don't overwhelm with tactics — focus on understanding their needs. For existing clients, take a message for their account manager.",
    receptionist_faqs: [
      { question: "How much does marketing cost?", answer: "It depends on your goals, industry, and the services you need. We have clients at various budget levels. The best next step is a free discovery call where we can learn about your business and give you honest recommendations.", category: "pricing" },
      { question: "How long until I see results?", answer: "It depends on the channel. Paid advertising can show results quickly, while SEO and content marketing typically take 3-6 months to gain momentum. We set clear expectations during our discovery call.", category: "timeline" },
      { question: "Do you guarantee results?", answer: "We don't guarantee specific rankings or numbers — anyone who does is being misleading. What we do guarantee is a data-driven strategy, transparent reporting, and a team that's genuinely invested in your growth.", category: "expectations" }
    ],
    receptionist_transfer_triggers: [
      "caller is a large company or franchise",
      "caller mentions a very tight launch deadline",
      "caller is unhappy with their current agency and wants to switch",
      "caller is an existing client with an urgent request"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Agency', description: 'Tell us about your marketing agency.', fields: [
        { name: 'business_name', label: 'Agency Name', type: 'text', placeholder: 'Spark Digital Marketing', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 500-6000', required: true },
        { name: 'services', label: 'Services you offer', type: 'multiselect', placeholder: '', required: true, options: ['SEO', 'Social Media Management', 'PPC / Google Ads', 'Facebook/Instagram Ads', 'Content Marketing', 'Email Marketing', 'Web Design', 'Branding', 'Video Production', 'Reputation Management'] }
      ]},
      { step_number: 2, title: 'Clients', description: 'Who do you work with?', fields: [
        { name: 'industries_served', label: 'Industries you specialize in', type: 'text', placeholder: 'All local businesses, or specify: dental, legal, home services', required: false },
        { name: 'pricing_model', label: 'How do you charge?', type: 'select', placeholder: '', required: true, options: ['Monthly Retainer', 'Project-Based', 'Hourly', 'Performance-Based', 'Hybrid'] }
      ]},
      { step_number: 3, title: 'Getting Started', description: 'How do you onboard new clients?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'discovery_call', label: 'Offer a free discovery call?', type: 'toggle', placeholder: '', required: true },
        { name: 'minimum_budget', label: 'Minimum monthly budget', type: 'currency', placeholder: '1500', required: false }
      ]},
      { step_number: 4, title: 'Reporting', description: 'How do you keep clients informed?', fields: [
        { name: 'reporting_frequency', label: 'How often do you report to clients?', type: 'select', placeholder: '', required: true, options: ['Weekly', 'Bi-weekly', 'Monthly', 'Real-time dashboard'] },
        { name: 'contract_length', label: 'Typical contract length', type: 'select', placeholder: '', required: false, options: ['Month-to-month', '3 months', '6 months', '12 months'] }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-leads', title: 'New Leads', description: 'Businesses interested in marketing services', priority: 1 },
      { id: 'active-clients', title: 'Active Clients', description: 'Clients under contract', priority: 2 },
      { id: 'reports-due', title: 'Reports Due', description: 'Client reports that need to go out', priority: 3 },
      { id: 'proposals-pending', title: 'Pending Proposals', description: 'Proposals sent but not yet signed', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Discovery call follow-up', description: 'Had discovery call with dental practice — send proposal.', category: 'leads', difficulty: 'needs-approval' },
      { title: 'Monthly report delivery', description: 'Send monthly performance report to client with key insights.', category: 'reporting', difficulty: 'automatic' },
      { title: 'Proposal follow-up', description: 'Proposal sent 5 days ago with no response — check in.', category: 'leads', difficulty: 'automatic' },
      { title: 'Content approval request', description: 'Send next month\'s social media content calendar for client approval.', category: 'client-communication', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Discovery Calls', unit: 'per month', description: 'Calls with potential clients', target_suggestion: 12 },
      { name: 'Proposal Win Rate', unit: 'percent', description: 'Proposals that become signed clients', target_suggestion: 35 },
      { name: 'Client Retention', unit: 'months', description: 'Average client relationship length', target_suggestion: 12 },
      { name: 'Monthly Recurring Revenue', unit: 'dollars', description: 'Total monthly retainer revenue', target_suggestion: 25000 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Prospects book discovery calls online', priority: 'essential' },
      { name: 'HubSpot', slug: 'hubspot', category: 'crm', why: 'Manages leads, proposals, and client relationships', priority: 'essential' },
      { name: 'Slack', slug: 'slack', category: 'communication', why: 'Client communication channels for quick updates', priority: 'recommended' },
      { name: 'Google Analytics', slug: 'google-analytics', category: 'reporting', why: 'Pulls client website data for automated reports', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'hubspot', 'slack', 'google-analytics'],

    email_templates: [
      { name: 'Discovery Call Confirmation', subject: 'Your Discovery Call with {{business_name}}', body: "Hi {{client_name}},\n\nI'm looking forward to learning about {{their_business_name}} and discussing how we can help you grow.\n\nYour discovery call: {{date}} at {{time}}\n\nBefore we chat, it would be helpful to know:\n- What marketing are you currently doing?\n- What's your biggest challenge right now?\n- What would success look like in 6 months?\n\nNo prep required — I just want to make the most of our time.\n\nTalk soon,\n{{agent_name}}\n{{business_name}}", trigger: 'discovery_booked' },
      { name: 'Monthly Report', subject: '{{month}} Marketing Report — {{their_business_name}}', body: "Hi {{client_name}},\n\nHere's your {{month}} marketing report:\n\n{{report_summary}}\n\nKey wins this month:\n{{key_wins}}\n\nFocus for next month:\n{{next_month_focus}}\n\nLet's schedule a quick call to discuss: {{booking_link}}\n\n{{agent_name}}\n{{business_name}}", trigger: 'monthly_report' }
    ],
    sms_templates: [
      { name: 'Discovery Call Reminder', body: "Hi {{client_name}}, this is {{agent_name}} from {{business_name}}. Your discovery call is tomorrow at {{time}}. Looking forward to chatting about your business!", trigger: 'discovery_reminder' },
      { name: 'Content Approval Needed', body: "Hi {{client_name}}, your next month's content calendar is ready for review. Check your email and let us know if we're good to go! Reply or call {{phone}}.", trigger: 'content_approval' }
    ],

    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2800,
    ideal_plan: 'growth',
    competitor_tools: ['HubSpot', 'GoHighLevel', 'Vendasta']
  },

  {
    id: 'it-support',
    industry: 'Professional Services',
    niche: 'IT Support / MSP',
    display_name: 'IT Support Company',
    emoji: '💻',
    tagline: 'Triage support tickets faster, onboard clients smoothly, and reduce downtime.',

    demo_greeting: "Hi! I'm your AI assistant for an IT support company. I can help with reporting issues, understanding our managed services, and scheduling consultations. How can I help?",
    demo_system_prompt: "You are an AI assistant for an IT support / managed services provider. Help potential clients understand your services and existing clients report issues. For issues: determine urgency (is someone down right now?), gather details, and create a ticket. Be technical but clear.",
    demo_suggested_messages: [
      "Our office internet is down — we need help now",
      "What does managed IT support include?",
      "We're a small business — can you handle our IT?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, an IT support company. Help potential clients learn about managed services. For existing clients, triage support requests: determine urgency (system-down = critical), gather details, and create tickets. If critical (all employees down, security breach, data loss), escalate immediately. Business hours: {{business_hours}}. Emergency line: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Do you need technical support, or are you looking for IT services for your business?",
    receptionist_system_prompt: "You are the receptionist for an IT support company. Determine if the caller needs immediate support or is a potential client. For support: ask what's happening, who's affected, and the urgency level. For potential clients: learn about their business size, current IT setup, and pain points. Schedule accordingly.",
    receptionist_faqs: [
      { question: "How much does managed IT cost?", answer: "Managed IT is typically priced per user per month. The exact cost depends on your needs — how many employees, what services you need, and your current setup. We offer a free IT assessment to give you an accurate quote.", category: "pricing" },
      { question: "We're having an emergency — our systems are down", answer: "I understand the urgency. Let me get some quick details: your company name, how many people are affected, and what systems are down. I'll escalate this to our support team immediately.", category: "emergency" },
      { question: "Do you support remote workers?", answer: "Absolutely. We support in-office, remote, and hybrid teams. We can manage devices, provide secure remote access, and support employees wherever they work.", category: "services" }
    ],
    receptionist_transfer_triggers: [
      "entire office or system is down",
      "caller mentions a security breach or ransomware",
      "caller reports data loss",
      "caller is a potential client with 50+ employees"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your IT support business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'TechShield IT Solutions', required: true },
        { name: 'phone', label: 'Main Phone / Support Line', type: 'phone', placeholder: '(555) 600-7000', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Managed IT Support', 'Help Desk', 'Network Management', 'Cybersecurity', 'Cloud Services', 'Backup & Disaster Recovery', 'Hardware Procurement', 'VoIP/Phone Systems', 'IT Consulting', 'Compliance (HIPAA, PCI)'] }
      ]},
      { step_number: 2, title: 'Support', description: 'How do you handle support requests?', fields: [
        { name: 'support_hours', label: 'Support Hours', type: 'time_range', placeholder: '8:00 AM - 6:00 PM', required: true },
        { name: 'after_hours', label: '24/7 emergency support available?', type: 'toggle', placeholder: '', required: true },
        { name: 'response_time', label: 'Target response time', type: 'select', placeholder: '', required: true, options: ['Under 15 minutes', 'Under 30 minutes', 'Under 1 hour', 'Under 4 hours'] }
      ]},
      { step_number: 3, title: 'Clients', description: 'Who do you serve?', fields: [
        { name: 'company_sizes', label: 'Client company sizes', type: 'multiselect', placeholder: '', required: true, options: ['1-10 employees', '11-50 employees', '51-200 employees', '200+ employees'] },
        { name: 'industries', label: 'Industries you specialize in', type: 'text', placeholder: 'Healthcare, legal, finance, manufacturing', required: false }
      ]},
      { step_number: 4, title: 'Getting Started', description: 'How do new clients begin?', fields: [
        { name: 'business_hours', label: 'Sales/Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'free_assessment', label: 'Offer a free IT assessment?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],

    dashboard_widgets: [
      { id: 'open-tickets', title: 'Open Support Tickets', description: 'Active tickets by priority', priority: 1 },
      { id: 'critical-alerts', title: 'Critical Alerts', description: 'System-down and security alerts', priority: 2 },
      { id: 'new-prospects', title: 'New Business Inquiries', description: 'Companies looking for IT support', priority: 3 },
      { id: 'client-health', title: 'Client Health', description: 'Ticket trends and satisfaction by client', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Triage new support ticket', description: 'Client reports slow email — create ticket and assign to tech.', category: 'support', difficulty: 'automatic' },
      { title: 'Follow up on resolved ticket', description: 'Check if client\'s issue is truly resolved after yesterday\'s fix.', category: 'support', difficulty: 'automatic' },
      { title: 'Schedule IT assessment', description: 'Potential client wants a free assessment — book it.', category: 'leads', difficulty: 'automatic' },
      { title: 'Monthly service report', description: 'Send client their monthly ticket summary and system health report.', category: 'reporting', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Average Response Time', unit: 'minutes', description: 'Time to first response on tickets', target_suggestion: 15 },
      { name: 'Ticket Resolution Time', unit: 'hours', description: 'Average time to resolve a ticket', target_suggestion: 4 },
      { name: 'Client Satisfaction', unit: 'rating', description: 'Post-ticket satisfaction score', target_suggestion: 4.8 },
      { name: 'New MRR Added', unit: 'dollars/month', description: 'Monthly recurring revenue from new clients', target_suggestion: 3000 }
    ],

    suggested_integrations: [
      { name: 'ConnectWise', slug: 'connectwise', category: 'psa', why: 'Industry-standard PSA for ticketing and client management', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Schedules assessments and onsite visits', priority: 'essential' },
      { name: 'Slack', slug: 'slack', category: 'communication', why: 'Internal team communication and client channels', priority: 'recommended' },
      { name: 'Datto', slug: 'datto', category: 'backup', why: 'Monitors backup status and alerts for failures', priority: 'recommended' }
    ],
    integration_priority: ['connectwise', 'google-calendar', 'slack', 'datto'],

    email_templates: [
      { name: 'Ticket Confirmation', subject: 'Support Ticket #{{ticket_id}} — {{business_name}}', body: "Hi {{client_name}},\n\nWe've received your support request and created ticket #{{ticket_id}}.\n\nIssue: {{issue_summary}}\nPriority: {{priority}}\nAssigned to: {{tech_name}}\n\nWe'll have someone on this within {{response_time}}. You'll receive updates as we work on it.\n\nIf this becomes urgent, call us at {{phone}}.\n\n{{business_name}} Support Team", trigger: 'ticket_created' },
      { name: 'IT Assessment Invitation', subject: 'Your Free IT Assessment — {{business_name}}', body: "Hi {{client_name}},\n\nThank you for your interest in {{business_name}}. Your free IT assessment is scheduled for {{date}} at {{time}}.\n\nDuring the assessment, we'll:\n- Review your current IT infrastructure\n- Identify security vulnerabilities\n- Evaluate your backup and disaster recovery\n- Provide recommendations with pricing\n\nNo obligation — just an honest look at where you stand.\n\nSee you then,\n{{business_name}}", trigger: 'assessment_booked' }
    ],
    sms_templates: [
      { name: 'Ticket Update', body: "Update on ticket #{{ticket_id}}: {{update}}. If you need anything else, call {{phone}}. — {{business_name}} Support", trigger: 'ticket_update' },
      { name: 'Assessment Reminder', body: "Hi {{client_name}}, your free IT assessment with {{business_name}} is tomorrow at {{time}}. We'll need access to your server room/closet. Call {{phone}} with questions.", trigger: 'assessment_reminder' }
    ],

    estimated_hours_saved_weekly: 15,
    estimated_monthly_value: 3200,
    ideal_plan: 'growth',
    competitor_tools: ['ConnectWise', 'Autotask', 'Syncro']
  },

  {
    id: 'consulting-firm',
    industry: 'Professional Services',
    niche: 'Consulting Firm',
    display_name: 'Consulting Firm',
    emoji: '🎯',
    tagline: 'Fill your pipeline, onboard clients smoothly, and focus on delivering results.',

    demo_greeting: "Hi! I'm your AI assistant for a consulting firm. I can help you learn about our services, schedule a consultation, and understand how we work with clients. How can I help?",
    demo_system_prompt: "You are an AI assistant for a consulting firm. Help potential clients understand your areas of expertise and schedule discovery calls. Be professional and confident. Focus on understanding the client's challenges before discussing solutions. Ask thoughtful questions.",
    demo_suggested_messages: [
      "I need help growing my business",
      "What types of consulting do you offer?",
      "How does a consulting engagement work?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a consulting firm. Help potential clients understand your expertise and schedule discovery calls. Be professional, confident, and curious. Ask about their challenges before proposing solutions. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you looking for consulting help, or are you an existing client?",
    receptionist_system_prompt: "You are the receptionist for a consulting firm. For potential clients: learn about their business, challenge, and timeline. Schedule a discovery call. For existing clients: take a message for their consultant. Be professional and articulate.",
    receptionist_faqs: [
      { question: "How much does consulting cost?", answer: "Our fees depend on the scope and duration of the engagement. We offer a complimentary discovery call to understand your needs and provide a clear proposal. No surprises.", category: "pricing" },
      { question: "How long does a typical engagement last?", answer: "It varies widely — some projects are a few weeks, others are ongoing advisory relationships. We'll scope the engagement during our discovery call and you'll have a clear timeline before committing.", category: "timeline" },
      { question: "What makes you different from other consultants?", answer: "We focus on implementation, not just recommendations. We don't hand you a report and walk away — we work alongside your team to make sure changes actually happen.", category: "differentiator" }
    ],
    receptionist_transfer_triggers: [
      "caller has an urgent business crisis",
      "caller is a referral from an existing client",
      "caller represents a large organization",
      "caller mentions a board or investor deadline"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Firm', description: 'Tell us about your consulting practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Clarity Consulting Group', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 700-8000', required: true },
        { name: 'specialties', label: 'Consulting specialties', type: 'multiselect', placeholder: '', required: true, options: ['Strategy', 'Operations', 'Marketing', 'Sales', 'HR/People', 'Technology', 'Finance', 'Change Management', 'Executive Coaching', 'Process Improvement'] }
      ]},
      { step_number: 2, title: 'Clients', description: 'Who do you work with?', fields: [
        { name: 'client_types', label: 'Typical clients', type: 'multiselect', placeholder: '', required: true, options: ['Startups', 'Small Businesses', 'Mid-Market Companies', 'Enterprise', 'Nonprofits', 'Government'] },
        { name: 'engagement_types', label: 'Types of engagements', type: 'multiselect', placeholder: '', required: true, options: ['Project-Based', 'Retainer/Advisory', 'Workshops/Training', 'Fractional Executive', 'Speaking/Keynotes'] }
      ]},
      { step_number: 3, title: 'Fees & Hours', description: 'How you charge and when you work.', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'fee_structure', label: 'Primary fee structure', type: 'select', placeholder: '', required: true, options: ['Project-Based (fixed fee)', 'Daily/Hourly Rate', 'Monthly Retainer', 'Value-Based'] }
      ]},
      { step_number: 4, title: 'Discovery', description: 'How do new clients get started?', fields: [
        { name: 'discovery_format', label: 'Discovery process', type: 'select', placeholder: '', required: true, options: ['Free 30-min call', 'Free 60-min consultation', 'Paid diagnostic session', 'Written proposal after call'] },
        { name: 'virtual_meetings', label: 'Work with clients remotely?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],

    dashboard_widgets: [
      { id: 'pipeline', title: 'Sales Pipeline', description: 'Potential clients at each stage', priority: 1 },
      { id: 'active-engagements', title: 'Active Engagements', description: 'Current client projects', priority: 2 },
      { id: 'proposals-out', title: 'Proposals Pending', description: 'Sent proposals awaiting response', priority: 3 },
      { id: 'follow-ups', title: 'Follow-Ups Due', description: 'Clients and prospects needing contact', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule discovery call', description: 'New prospect interested in operations consulting — book a call.', category: 'leads', difficulty: 'automatic' },
      { title: 'Proposal follow-up', description: 'Proposal sent last week — check in with prospect.', category: 'leads', difficulty: 'automatic' },
      { title: 'Client milestone update', description: 'Send client a progress update on their engagement milestones.', category: 'client-communication', difficulty: 'needs-approval' },
      { title: 'Post-engagement survey', description: 'Engagement just ended — send satisfaction survey and request testimonial.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Discovery Calls', unit: 'per month', description: 'Initial calls with potential clients', target_suggestion: 8 },
      { name: 'Proposal Win Rate', unit: 'percent', description: 'Proposals that become signed engagements', target_suggestion: 40 },
      { name: 'Client Satisfaction', unit: 'rating', description: 'Post-engagement client rating', target_suggestion: 4.8 },
      { name: 'Repeat Client Rate', unit: 'percent', description: 'Clients who hire you for additional work', target_suggestion: 50 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Book discovery calls and client meetings', priority: 'essential' },
      { name: 'HubSpot', slug: 'hubspot', category: 'crm', why: 'Manages pipeline and client relationships', priority: 'essential' },
      { name: 'DocuSign', slug: 'docusign', category: 'documents', why: 'Clients sign proposals and SOWs remotely', priority: 'recommended' },
      { name: 'Zoom', slug: 'zoom', category: 'meetings', why: 'Virtual client meetings and workshops', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'hubspot', 'docusign', 'zoom'],

    email_templates: [
      { name: 'Discovery Call Confirmation', subject: 'Your Discovery Call with {{business_name}}', body: "Hi {{client_name}},\n\nI'm looking forward to our conversation on {{date}} at {{time}}.\n\nTo make the most of our time, I'd love to understand:\n- What's the biggest challenge your business is facing right now?\n- What have you already tried?\n- What does success look like for you?\n\nThis is purely a conversation — no pitch, no pressure.\n\nTalk soon,\n{{consultant_name}}\n{{business_name}}", trigger: 'discovery_booked' },
      { name: 'Proposal Sent', subject: 'Your Consulting Proposal — {{business_name}}', body: "Hi {{client_name}},\n\nThank you for a great conversation. Attached is our proposal for {{project_name}}.\n\nInside you'll find:\n- Our understanding of your challenge\n- Recommended approach and deliverables\n- Timeline and investment\n\nI'd love to walk through it together. Would {{follow_up_date}} work for a quick call?\n\n{{consultant_name}}\n{{business_name}}", trigger: 'proposal_sent' }
    ],
    sms_templates: [
      { name: 'Discovery Reminder', body: "Hi {{client_name}}, this is {{consultant_name}} from {{business_name}}. Looking forward to our discovery call tomorrow at {{time}}. Talk soon!", trigger: 'discovery_reminder' },
      { name: 'Proposal Follow-Up', body: "Hi {{client_name}}, just checking in on the proposal I sent. Any questions? Happy to jump on a quick call. — {{consultant_name}}, {{business_name}}", trigger: 'proposal_follow_up' }
    ],

    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2400,
    ideal_plan: 'pro',
    competitor_tools: ['HubSpot', 'Honeybook', 'Dubsado']
  },

  {
    id: 'staffing-agency',
    industry: 'Professional Services',
    niche: 'Staffing Agency',
    display_name: 'Staffing Agency',
    emoji: '👥',
    tagline: 'Match candidates to clients faster with automated outreach and follow-up.',
    demo_greeting: "Hi! I'm your AI assistant for a staffing agency. I can help job seekers learn about opportunities and help businesses find the right talent. How can I help?",
    demo_system_prompt: "You are an AI assistant for a staffing agency. Help job seekers learn about available positions and the application process. Help businesses understand staffing services. Be professional and encouraging to candidates. NEVER make hiring promises.",
    demo_suggested_messages: ["I'm looking for work — what positions do you have?", "I need to hire temporary workers for my warehouse", "How does the staffing process work?"],
    soul_template: "You are the AI assistant for {{business_name}}, a staffing agency. Help job seekers find opportunities and help businesses find talent. Be encouraging to candidates. NEVER promise specific jobs or pay rates. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you looking for work, or are you a business looking to hire?",
    receptionist_system_prompt: "You are the receptionist for a staffing agency. Determine if the caller is a job seeker or a client business. For seekers: get name, skills, experience, and availability. For businesses: get company name, positions needed, and timeline. Route appropriately.",
    receptionist_faqs: [
      { question: "Do I have to pay to use your service?", answer: "If you're looking for work, our services are completely free to you. We get paid by the companies who hire through us.", category: "job-seekers" },
      { question: "What types of jobs do you fill?", answer: "We fill temporary, temp-to-hire, and direct placement positions across several industries. Tell me about your experience and I'll let you know what's available.", category: "positions" },
      { question: "How quickly can you fill a position?", answer: "It depends on the role, but we can often have qualified candidates within 24-48 hours for general labor and skilled positions. Specialized roles may take a bit longer.", category: "clients" }
    ],
    receptionist_transfer_triggers: ["client needs workers for tomorrow", "caller is a large company with ongoing staffing needs", "caller has a payroll or billing dispute", "caller reports a workplace safety issue"],
    wizard_steps: [
      { step_number: 1, title: 'Your Agency', description: 'Tell us about your staffing agency.', fields: [
        { name: 'business_name', label: 'Agency Name', type: 'text', placeholder: 'ProStaff Solutions', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 800-9000', required: true },
        { name: 'industries', label: 'Industries you staff', type: 'multiselect', placeholder: '', required: true, options: ['Warehouse/Logistics', 'Manufacturing', 'Office/Administrative', 'Healthcare', 'IT', 'Construction', 'Hospitality', 'Retail', 'Skilled Trades', 'Accounting/Finance'] }
      ]},
      { step_number: 2, title: 'Services', description: 'What types of placements do you make?', fields: [
        { name: 'placement_types', label: 'Placement types', type: 'multiselect', placeholder: '', required: true, options: ['Temporary', 'Temp-to-Hire', 'Direct Placement', 'Contract', 'Executive Search'] },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '7:00 AM - 5:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Candidates', description: 'How do you work with job seekers?', fields: [
        { name: 'application_process', label: 'How do candidates apply?', type: 'multiselect', placeholder: '', required: true, options: ['Walk-In', 'Online Application', 'Phone Screen', 'By Appointment'] },
        { name: 'drug_testing', label: 'Do you offer drug testing?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Coverage', description: 'Your service area.', fields: [
        { name: 'service_area', label: 'Areas you serve', type: 'text', placeholder: 'Greater Metro area and surrounding counties', required: true },
        { name: 'languages', label: 'Languages spoken', type: 'multiselect', placeholder: '', required: false, options: ['English', 'Spanish', 'French', 'Chinese', 'Vietnamese'] }
      ]}
    ],
    dashboard_widgets: [
      { id: 'open-orders', title: 'Open Job Orders', description: 'Client positions needing candidates', priority: 1 },
      { id: 'new-applicants', title: 'New Applicants', description: 'Candidates who applied today', priority: 2 },
      { id: 'active-placements', title: 'Active Placements', description: 'Workers currently on assignment', priority: 3 },
      { id: 'client-requests', title: 'Urgent Client Requests', description: 'Clients needing workers ASAP', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Match candidate to open order', description: 'New warehouse job order — find qualified candidates in the system.', category: 'matching', difficulty: 'needs-approval' },
      { title: 'Candidate availability check', description: 'Check if placed worker is available for extended assignment.', category: 'placements', difficulty: 'automatic' },
      { title: 'Client satisfaction check-in', description: 'Follow up with client about worker performance after first week.', category: 'retention', difficulty: 'automatic' },
      { title: 'No-show follow-up', description: 'Worker didn\'t show up for assignment — contact them and find replacement.', category: 'urgent', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Fill Rate', unit: 'percent', description: 'Percentage of job orders filled on time', target_suggestion: 85 },
      { name: 'Time to Fill', unit: 'hours', description: 'Average time to fill a position', target_suggestion: 24 },
      { name: 'Turnover Rate', unit: 'percent', description: 'Placed workers who leave early', target_suggestion: 15 },
      { name: 'New Client Accounts', unit: 'per month', description: 'New businesses signing up', target_suggestion: 4 }
    ],
    suggested_integrations: [
      { name: 'Bullhorn', slug: 'bullhorn', category: 'ats', why: 'Industry-standard staffing ATS and CRM', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages interviews and client meetings', priority: 'essential' },
      { name: 'Indeed', slug: 'indeed', category: 'job-boards', why: 'Posts jobs and captures applicants', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'payroll', why: 'Manages payroll and client invoicing', priority: 'recommended' }
    ],
    integration_priority: ['bullhorn', 'google-calendar', 'indeed', 'quickbooks'],
    email_templates: [
      { name: 'Job Opportunity', subject: 'New Job Opportunity — {{job_title}} — {{business_name}}', body: "Hi {{candidate_name}},\n\nWe have a new opportunity that matches your skills:\n\nPosition: {{job_title}}\nLocation: {{location}}\nPay: {{pay_range}}\nSchedule: {{schedule}}\n\nInterested? Reply to this email or call us at {{phone}}.\n\n{{business_name}}", trigger: 'job_match' },
      { name: 'Assignment Confirmation', subject: 'Your Assignment Details — {{business_name}}', body: "Hi {{candidate_name}},\n\nYou've been placed! Here are your assignment details:\n\nCompany: {{client_name}}\nPosition: {{job_title}}\nStart Date: {{start_date}}\nShift: {{shift}}\nLocation: {{address}}\nReport to: {{contact_name}}\n\nRemember to bring your ID and wear {{dress_code}}.\n\nCall {{phone}} with any questions.\n\n{{business_name}}", trigger: 'placement_confirmed' }
    ],
    sms_templates: [
      { name: 'Shift Reminder', body: "Hi {{candidate_name}}, reminder: your shift at {{client_name}} starts tomorrow at {{time}}. Address: {{address}}. Call {{phone}} if you can't make it.", trigger: 'shift_reminder' },
      { name: 'New Job Alert', body: "{{business_name}} has a new {{job_title}} position — {{pay_range}}, starting {{start_date}}. Interested? Reply YES or call {{phone}}.", trigger: 'job_alert' }
    ],
    estimated_hours_saved_weekly: 15,
    estimated_monthly_value: 3200,
    ideal_plan: 'growth',
    competitor_tools: ['Bullhorn', 'JobDiva', 'TempWorks']
  },

  {
    id: 'photographer',
    industry: 'Professional Services',
    niche: 'Photographer',
    display_name: 'Photography Studio',
    emoji: '📸',
    tagline: 'Book more sessions, deliver galleries on time, and wow every client.',
    demo_greeting: "Hi! I'm your AI assistant for a photography studio. I can help with booking sessions, learning about packages, and answering questions. How can I help?",
    demo_system_prompt: "You are an AI assistant for a professional photographer. Help potential clients learn about photography services, packages, and booking. Be creative and warm. Ask about the type of session they need and the occasion.",
    demo_suggested_messages: ["I need family portraits taken", "Do you shoot weddings?", "How much do photo sessions cost?"],
    soul_template: "You are the AI assistant for {{business_name}}, a photography studio. Help clients book sessions and learn about packages. Be warm and creative. Ask about the occasion and what they want to capture. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}! I'm the virtual assistant. Are you looking to book a photo session?",
    receptionist_system_prompt: "You are the receptionist for a photography studio. Learn what type of session the caller needs (portraits, family, headshots, event, etc.), when they need it, and any special requirements. Share package info and schedule a consultation or session.",
    receptionist_faqs: [
      { question: "How much do you charge?", answer: "Our pricing depends on the type of session, duration, and package you choose. We'd love to learn more about what you have in mind — can I tell you about our packages?", category: "pricing" },
      { question: "How long until I get my photos?", answer: "We typically deliver your edited gallery within 2-3 weeks. Rush delivery is available for an additional fee.", category: "delivery" },
      { question: "Do you shoot on location?", answer: "Yes! We shoot both in our studio and on location. We can suggest some beautiful local spots, or we're happy to come to a location you have in mind.", category: "logistics" }
    ],
    receptionist_transfer_triggers: ["caller is booking a wedding with a large budget", "caller needs photos for a commercial campaign", "caller wants to discuss custom art prints"],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: 'Tell us about your photography business.', fields: [
        { name: 'business_name', label: 'Studio/Business Name', type: 'text', placeholder: 'Golden Hour Photography', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 900-0001', required: true },
        { name: 'specialties', label: 'Photography specialties', type: 'multiselect', placeholder: '', required: true, options: ['Portraits', 'Family', 'Newborn', 'Maternity', 'Headshots', 'Weddings', 'Events', 'Product/Commercial', 'Real Estate', 'Senior Portraits', 'Pet Photography'] }
      ]},
      { step_number: 2, title: 'Packages', description: 'How do you price your work?', fields: [
        { name: 'starting_price', label: 'Starting session price', type: 'currency', placeholder: '250', required: true },
        { name: 'session_includes', label: 'What\'s included in a standard session?', type: 'text', placeholder: '1-hour session, 20 edited photos, online gallery', required: true }
      ]},
      { step_number: 3, title: 'Availability', description: 'When do you shoot?', fields: [
        { name: 'business_hours', label: 'Booking Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'weekend_shoots', label: 'Shoot on weekends?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Delivery', description: 'How do clients receive photos?', fields: [
        { name: 'delivery_time', label: 'Gallery delivery time', type: 'select', placeholder: '', required: true, options: ['1 week', '2 weeks', '3 weeks', '4 weeks'] },
        { name: 'print_services', label: 'Offer prints and products?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Inquiries', description: 'People asking about sessions', priority: 1 },
      { id: 'upcoming-sessions', title: 'Upcoming Sessions', description: 'Booked shoots this week', priority: 2 },
      { id: 'galleries-due', title: 'Galleries Due', description: 'Edited galleries to deliver', priority: 3 },
      { id: 'pending-bookings', title: 'Pending Bookings', description: 'Inquiries that haven\'t booked yet', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Respond to inquiry', description: 'New family portrait inquiry — send package info and availability.', category: 'leads', difficulty: 'automatic' },
      { title: 'Session prep email', description: 'Send what-to-wear guide before tomorrow\'s session.', category: 'client-communication', difficulty: 'automatic' },
      { title: 'Gallery delivery notification', description: 'Client\'s gallery is ready — send access link.', category: 'delivery', difficulty: 'automatic' },
      { title: 'Booking follow-up', description: 'Inquiry from last week hasn\'t booked — follow up.', category: 'leads', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Inquiries', unit: 'per month', description: 'New session inquiries', target_suggestion: 15 },
      { name: 'Booking Rate', unit: 'percent', description: 'Inquiries that become booked sessions', target_suggestion: 50 },
      { name: 'Average Session Value', unit: 'dollars', description: 'Average revenue per session including prints', target_suggestion: 500 },
      { name: 'Gallery Delivery On-Time', unit: 'percent', description: 'Galleries delivered by promised date', target_suggestion: 95 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages session bookings and availability', priority: 'essential' },
      { name: 'HoneyBook', slug: 'honeybook', category: 'crm', why: 'Manages inquiries, contracts, and payments for creatives', priority: 'essential' },
      { name: 'Pixieset', slug: 'pixieset', category: 'gallery', why: 'Delivers client galleries and handles print orders', priority: 'recommended' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Photography is visual — showcase your work', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'honeybook', 'pixieset', 'instagram'],
    email_templates: [
      { name: 'Inquiry Response', subject: 'Your {{session_type}} Session — {{business_name}}', body: "Hi {{client_name}},\n\nThank you for reaching out! I'd love to capture {{occasion}} for you.\n\nHere's what's included in our {{package_name}} package:\n{{package_details}}\n\nI have availability on {{available_dates}}.\n\nWould you like to book? I'll send a contract and secure your date.\n\n{{business_name}}", trigger: 'new_inquiry' },
      { name: 'Gallery Delivery', subject: 'Your Photos Are Ready! — {{business_name}}', body: "Hi {{client_name}},\n\nYour gallery is ready! I'm so excited for you to see your photos.\n\nView your gallery: {{gallery_link}}\n\nYour gallery is available for download for {{download_period}}. If you'd like prints, albums, or wall art, you can order directly from your gallery.\n\nI loved working with you!\n{{business_name}}", trigger: 'gallery_ready' }
    ],
    sms_templates: [
      { name: 'Session Reminder', body: "Hi {{client_name}}, your photo session with {{business_name}} is tomorrow at {{time}} at {{location}}. Wear solid colors and bring your smile! 📸", trigger: 'session_reminder' },
      { name: 'Gallery Ready', body: "Your photos are ready! 🎉 Check your email for your gallery link from {{business_name}}. So excited for you to see them!", trigger: 'gallery_delivered' }
    ],
    estimated_hours_saved_weekly: 8,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
    competitor_tools: ['HoneyBook', 'Dubsado', 'ShootProof']
  },

  {
    id: 'videographer',
    industry: 'Professional Services',
    niche: 'Videographer',
    display_name: 'Video Production Company',
    emoji: '🎬',
    tagline: 'Book more projects, manage production timelines, and deliver edits on time.',
    demo_greeting: "Hi! I'm your AI assistant for a video production company. I can help with project inquiries, understanding our services, and scheduling consultations. How can I help?",
    demo_system_prompt: "You are an AI assistant for a video production company. Help potential clients understand video services, the production process, and pricing. Be creative and professional. Ask about their vision and goals for the video before discussing logistics.",
    demo_suggested_messages: ["I need a promotional video for my business", "How much does a video cost?", "What's your production process like?"],
    soul_template: "You are the AI assistant for {{business_name}}, a video production company. Help clients understand services and schedule consultations. Ask about their vision and goals. Be creative and professional. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}! I'm the virtual assistant. Are you interested in a video project?",
    receptionist_system_prompt: "You are the receptionist for a video production company. Learn about the caller's project: type (promo, corporate, wedding, social), timeline, budget range, and goals. Schedule a consultation. Be enthusiastic about bringing their vision to life.",
    receptionist_faqs: [
      { question: "How much does a video cost?", answer: "Video pricing varies based on the project scope — length, location, crew size, and editing complexity. We offer a free consultation to understand your vision and give you an accurate quote.", category: "pricing" },
      { question: "How long does production take?", answer: "Typically 2-4 weeks from filming to final delivery, depending on complexity. We can accommodate rush deadlines for an additional fee.", category: "timeline" },
      { question: "What do you need from me?", answer: "Just your vision and goals! We handle everything from concept to final delivery. During our consultation, we'll talk about the look and feel you want and build a plan from there.", category: "process" }
    ],
    receptionist_transfer_triggers: ["caller has a large commercial project", "caller needs production within a week", "caller is from a media company or agency"],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: 'Tell us about your production company.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'Reel Motion Studios', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 900-0002', required: true },
        { name: 'services', label: 'Video services', type: 'multiselect', placeholder: '', required: true, options: ['Promotional/Commercial', 'Corporate/Training', 'Wedding/Event', 'Social Media Content', 'Music Videos', 'Documentary', 'Real Estate Tours', 'Drone/Aerial', 'Animation/Motion Graphics', 'Live Streaming'] }
      ]},
      { step_number: 2, title: 'Pricing', description: 'How do you price your work?', fields: [
        { name: 'pricing_model', label: 'Pricing model', type: 'select', placeholder: '', required: true, options: ['Project-Based', 'Day Rate', 'Hourly', 'Package-Based'] },
        { name: 'starting_price', label: 'Starting project price', type: 'currency', placeholder: '1500', required: true }
      ]},
      { step_number: 3, title: 'Availability', description: 'When can you shoot?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 6:00 PM', required: true },
        { name: 'travel', label: 'Available to travel?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Delivery', description: 'How do clients receive their video?', fields: [
        { name: 'delivery_time', label: 'Typical delivery time', type: 'select', placeholder: '', required: true, options: ['1 week', '2 weeks', '3-4 weeks', '4-6 weeks'] },
        { name: 'revisions', label: 'Revisions included', type: 'select', placeholder: '', required: true, options: ['1 round', '2 rounds', '3 rounds', 'Unlimited'] }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Project Inquiries', description: 'Potential clients reaching out', priority: 1 },
      { id: 'production-schedule', title: 'Production Schedule', description: 'Upcoming shoots and deadlines', priority: 2 },
      { id: 'edits-in-progress', title: 'Edits in Progress', description: 'Projects in post-production', priority: 3 },
      { id: 'deliveries-due', title: 'Deliveries Due', description: 'Final cuts due to clients', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Respond to project inquiry', description: 'Business wants a 60-second promo video — send portfolio and schedule call.', category: 'leads', difficulty: 'automatic' },
      { title: 'Shoot day prep', description: 'Send shot list and logistics to client before tomorrow\'s shoot.', category: 'production', difficulty: 'automatic' },
      { title: 'Review draft ready', description: 'First cut is done — send to client for feedback.', category: 'delivery', difficulty: 'automatic' },
      { title: 'Project wrap-up', description: 'Final deliverables sent — request testimonial and referrals.', category: 'retention', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Project Inquiries', unit: 'per month', description: 'New video project inquiries', target_suggestion: 8 },
      { name: 'Booking Rate', unit: 'percent', description: 'Inquiries that become booked projects', target_suggestion: 40 },
      { name: 'Average Project Value', unit: 'dollars', description: 'Average revenue per project', target_suggestion: 3000 },
      { name: 'On-Time Delivery', unit: 'percent', description: 'Projects delivered by deadline', target_suggestion: 90 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages shoot dates and deadlines', priority: 'essential' },
      { name: 'HoneyBook', slug: 'honeybook', category: 'crm', why: 'Manages projects, contracts, and invoices', priority: 'essential' },
      { name: 'Frame.io', slug: 'frame-io', category: 'review', why: 'Client video review and approval', priority: 'recommended' },
      { name: 'Vimeo', slug: 'vimeo', category: 'delivery', why: 'Professional video hosting and delivery', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'honeybook', 'frame-io', 'vimeo'],
    email_templates: [
      { name: 'Project Inquiry Response', subject: 'Your Video Project — {{business_name}}', body: "Hi {{client_name}},\n\nThanks for reaching out about your {{project_type}} video! I'd love to bring your vision to life.\n\nHere's a link to our portfolio so you can see our style: {{portfolio_link}}\n\nI'd love to hop on a quick call to discuss your goals and give you a quote. Does {{suggested_date}} work?\n\nExcited to hear more!\n{{business_name}}", trigger: 'new_inquiry' },
      { name: 'Review Draft', subject: 'Your Video Draft is Ready — {{business_name}}', body: "Hi {{client_name}},\n\nYour first draft is ready for review!\n\nWatch it here: {{review_link}}\n\nPlease leave comments directly on the video. You have {{revisions_remaining}} revision round(s) included.\n\nWe'd appreciate your feedback within {{feedback_deadline}} so we can stay on schedule.\n\n{{business_name}}", trigger: 'draft_ready' }
    ],
    sms_templates: [
      { name: 'Shoot Reminder', body: "Hi {{client_name}}, your video shoot with {{business_name}} is tomorrow at {{time}} at {{location}}. Let us know if you have any last-minute questions!", trigger: 'shoot_reminder' },
      { name: 'Draft Ready', body: "Your video draft is ready for review! Check your email for the link. Let us know what you think! — {{business_name}}", trigger: 'draft_notification' }
    ],
    estimated_hours_saved_weekly: 8,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
    competitor_tools: ['HoneyBook', 'Dubsado', 'Studio Ninja']
  },

  {
    id: 'bookkeeper',
    industry: 'Professional Services',
    niche: 'Bookkeeper',
    display_name: 'Bookkeeping Service',
    emoji: '📒',
    tagline: 'Onboard new clients fast, collect documents automatically, and keep the books clean.',
    demo_greeting: "Hi! I'm your AI assistant for a bookkeeping service. I can help business owners understand our services and get started. How can I help?",
    demo_system_prompt: "You are an AI assistant for a bookkeeping service. Help small business owners understand bookkeeping services, pricing, and the onboarding process. Be professional and reassuring — many business owners feel overwhelmed by their books. NEVER give tax or financial advice.",
    demo_suggested_messages: ["I'm behind on my books and need help", "How much does bookkeeping cost?", "What's the difference between bookkeeping and accounting?"],
    soul_template: "You are the AI assistant for {{business_name}}, a bookkeeping service. Help business owners understand services and get started. NEVER give tax or financial advice. Be reassuring — many clients feel embarrassed about messy books. Normalize it: most small businesses need help. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you looking for bookkeeping help for your business?",
    receptionist_system_prompt: "You are the receptionist for a bookkeeping service. Learn about the caller's business: type, size, current accounting software, and biggest pain point. Schedule a consultation. Be warm and non-judgmental — many clients are embarrassed about messy books.",
    receptionist_faqs: [
      { question: "How much does bookkeeping cost?", answer: "Our pricing depends on the size of your business and the number of monthly transactions. We offer fixed monthly pricing so you always know what to expect. I can schedule a free consultation to get you an exact quote.", category: "pricing" },
      { question: "I'm way behind on my books", answer: "You're not alone — many of our clients come to us in the same situation. We offer catch-up bookkeeping to get everything current, and then we keep it clean going forward. Don't worry, we've seen it all!", category: "catch-up" },
      { question: "What software do you use?", answer: "We primarily work with QuickBooks Online and Xero, but we can work with whatever system you're using. If you don't have anything set up yet, we'll help you choose the right one.", category: "software" }
    ],
    receptionist_transfer_triggers: ["caller has an IRS issue or audit", "caller needs payroll this week", "caller is a large business with complex needs"],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: 'Tell us about your bookkeeping service.', fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Clearview Bookkeeping', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 900-0003', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Monthly Bookkeeping', 'Catch-Up Bookkeeping', 'Payroll', 'Accounts Payable', 'Accounts Receivable', 'Bank Reconciliation', 'Financial Reports', 'QuickBooks Setup/Training', '1099 Preparation'] }
      ]},
      { step_number: 2, title: 'Software', description: 'What tools do you use?', fields: [
        { name: 'software', label: 'Accounting software', type: 'multiselect', placeholder: '', required: true, options: ['QuickBooks Online', 'QuickBooks Desktop', 'Xero', 'FreshBooks', 'Wave'] },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Pricing', description: 'How do you charge?', fields: [
        { name: 'pricing_model', label: 'Pricing model', type: 'select', placeholder: '', required: true, options: ['Fixed Monthly Fee', 'Hourly', 'Per Transaction', 'Tiered by Business Size'] },
        { name: 'starting_price', label: 'Starting monthly price', type: 'currency', placeholder: '300', required: true }
      ]},
      { step_number: 4, title: 'Consultations', description: 'How do new clients start?', fields: [
        { name: 'consultation_fee', label: 'Consultation fee', type: 'select', placeholder: '', required: true, options: ['Free', 'Paid — applied to first month'] },
        { name: 'virtual', label: 'Work with clients remotely?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-clients', title: 'New Inquiries', description: 'Business owners looking for bookkeeping', priority: 1 },
      { id: 'monthly-closes', title: 'Monthly Closes', description: 'Client books to close this month', priority: 2 },
      { id: 'missing-docs', title: 'Missing Documents', description: 'Clients who haven\'t sent receipts/statements', priority: 3 },
      { id: 'catch-up-projects', title: 'Catch-Up Projects', description: 'Clients with overdue books being cleaned up', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up with new lead', description: 'Small business owner called about monthly bookkeeping — send info.', category: 'leads', difficulty: 'automatic' },
      { title: 'Bank statement request', description: 'Missing this month\'s bank statement from client — request it.', category: 'document-collection', difficulty: 'automatic' },
      { title: 'Monthly report delivery', description: 'Send client their monthly P&L and balance sheet.', category: 'reporting', difficulty: 'automatic' },
      { title: 'Quarterly check-in', description: 'Schedule quarterly review call with client.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Clients', unit: 'per month', description: 'New bookkeeping clients onboarded', target_suggestion: 4 },
      { name: 'Monthly Close Rate', unit: 'percent', description: 'Client books closed on time', target_suggestion: 95 },
      { name: 'Document Collection Rate', unit: 'percent', description: 'Clients who send docs without reminders', target_suggestion: 60 },
      { name: 'Client Retention', unit: 'percent', description: 'Clients retained year over year', target_suggestion: 92 }
    ],
    suggested_integrations: [
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Core bookkeeping platform', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Book consultations and review meetings', priority: 'essential' },
      { name: 'Dext', slug: 'dext', category: 'document-management', why: 'Clients snap photos of receipts instead of mailing them', priority: 'recommended' },
      { name: 'Dropbox', slug: 'dropbox', category: 'file-sharing', why: 'Secure document exchange with clients', priority: 'nice-to-have' }
    ],
    integration_priority: ['quickbooks', 'google-calendar', 'dext', 'dropbox'],
    email_templates: [
      { name: 'Onboarding Welcome', subject: 'Welcome to {{business_name}} — Let\'s Get Your Books in Order!', body: "Hi {{client_name}},\n\nWelcome! We're excited to help get your books organized.\n\nTo get started, we'll need:\n- Access to your {{software}} account (we'll send you instructions)\n- Last 3 months of bank and credit card statements\n- Any receipts you have on hand\n\nDon't worry about being organized — that's our job!\n\nYour bookkeeper, {{bookkeeper_name}}, will be in touch shortly.\n\n{{business_name}}", trigger: 'client_onboarded' },
      { name: 'Monthly Report', subject: 'Your {{month}} Financial Reports — {{business_name}}', body: "Hi {{client_name}},\n\nYour books for {{month}} are closed. Attached you'll find:\n- Profit & Loss Statement\n- Balance Sheet\n- Key insights\n\n{{monthly_insights}}\n\nQuestions? Reply to this email or call {{phone}}.\n\n{{business_name}}", trigger: 'monthly_close' }
    ],
    sms_templates: [
      { name: 'Document Reminder', body: "Hi {{client_name}}, it's {{business_name}}. We still need your {{month}} bank statements to close your books. Can you send them over this week?", trigger: 'missing_documents' },
      { name: 'Reports Ready', body: "Hi {{client_name}}, your {{month}} financial reports are ready! Check your email for the details. Call {{phone}} with questions.", trigger: 'reports_ready' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
    competitor_tools: ['Bench', 'Pilot', 'BooksTime']
  },

  {
    id: 'notary-public',
    industry: 'Professional Services',
    niche: 'Notary Public',
    display_name: 'Notary Service',
    emoji: '✍️',
    tagline: 'Book more signings, handle scheduling chaos, and grow your notary business.',
    demo_greeting: "Hi! I'm your AI assistant for a notary service. I can help schedule notarizations, explain our services, and answer common questions. How can I help?",
    demo_system_prompt: "You are an AI assistant for a notary public. Help clients schedule notarizations and understand what documents are needed. Be professional and efficient. Notary services are time-sensitive — be responsive. Explain that you cannot provide legal advice.",
    demo_suggested_messages: ["I need something notarized — how do I schedule?", "Do you do mobile notary — can you come to me?", "What do I need to bring?"],
    soul_template: "You are the AI assistant for {{business_name}}, a notary service. Help clients schedule notarizations and understand requirements. NEVER give legal advice. Be professional and efficient — many notary needs are time-sensitive. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Do you need to schedule a notarization?",
    receptionist_system_prompt: "You are the receptionist for a notary service. Determine: what type of document needs notarization, how many signatures, when they need it done, and whether they can come to the office or need a mobile notary. Schedule an appointment. Remind callers to bring valid photo ID.",
    receptionist_faqs: [
      { question: "How much does notarization cost?", answer: "Our fees vary by state guidelines and the type of service. Standard notarizations are a set fee per signature. Mobile notary services include a travel fee. I can give you a quote once I know the details.", category: "pricing" },
      { question: "What do I need to bring?", answer: "You'll need a valid, unexpired government-issued photo ID — driver's license or passport work best. Bring the document that needs to be notarized, but don't sign it beforehand. You'll sign in front of the notary.", category: "requirements" },
      { question: "Can you come to me?", answer: "Yes! We offer mobile notary service — we can come to your home, office, hospital, or anywhere else you need us. There's a travel fee based on distance.", category: "mobile" }
    ],
    receptionist_transfer_triggers: ["caller needs a same-day notarization", "caller is at a hospital or care facility", "caller needs loan signing agent services", "caller has a document in a foreign language"],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: 'Tell us about your notary service.', fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Swift Notary Services', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 900-0004', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['In-Office Notarization', 'Mobile Notary', 'Loan Signing Agent', 'Remote Online Notarization (RON)', 'Apostille Services', 'Document Prep (non-legal)'] }
      ]},
      { step_number: 2, title: 'Pricing', description: 'Your fees.', fields: [
        { name: 'per_signature', label: 'Fee per notarized signature', type: 'currency', placeholder: '15', required: true },
        { name: 'travel_fee', label: 'Mobile/travel fee', type: 'currency', placeholder: '50', required: false },
        { name: 'business_hours', label: 'Availability', type: 'time_range', placeholder: '8:00 AM - 8:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Coverage', description: 'Where do you serve?', fields: [
        { name: 'service_area', label: 'Mobile service area', type: 'text', placeholder: 'Within 30 miles of downtown', required: true },
        { name: 'same_day', label: 'Offer same-day appointments?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Additional', description: 'Other services.', fields: [
        { name: 'evening_weekend', label: 'Available evenings/weekends?', type: 'toggle', placeholder: '', required: true },
        { name: 'languages', label: 'Languages spoken', type: 'multiselect', placeholder: '', required: false, options: ['English', 'Spanish', 'Chinese', 'Korean', 'Vietnamese'] }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Appointments", description: 'Notarizations scheduled today', priority: 1 },
      { id: 'new-requests', title: 'New Requests', description: 'Incoming notarization requests', priority: 2 },
      { id: 'mobile-schedule', title: 'Mobile Route', description: 'Mobile notary appointments and locations', priority: 3 },
      { id: 'pending-confirmation', title: 'Pending Confirmations', description: 'Appointments not yet confirmed', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule notarization', description: 'Client needs a power of attorney notarized — book appointment.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Confirm appointment', description: 'Tomorrow\'s mobile appointment — confirm address and time.', category: 'reminders', difficulty: 'automatic' },
      { title: 'ID reminder', description: 'Remind client to bring valid photo ID to tomorrow\'s appointment.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Follow up on recurring client', description: 'Real estate office books regularly — check if they need you this month.', category: 'retention', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Appointments', unit: 'per week', description: 'Total notarizations completed', target_suggestion: 15 },
      { name: 'Mobile Bookings', unit: 'per week', description: 'Mobile notary appointments', target_suggestion: 8 },
      { name: 'Same-Day Rate', unit: 'percent', description: 'Requests you can fill same-day', target_suggestion: 70 },
      { name: 'Repeat Client Rate', unit: 'percent', description: 'Clients who use you again', target_suggestion: 40 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages appointments and mobile routes', priority: 'essential' },
      { name: 'Notarize', slug: 'notarize', category: 'notary', why: 'Remote online notarization platform', priority: 'recommended' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Takes payment on-site for mobile appointments', priority: 'recommended' },
      { name: 'Google Maps', slug: 'google-maps', category: 'routing', why: 'Optimizes mobile notary routes', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'notarize', 'square', 'google-maps'],
    email_templates: [
      { name: 'Appointment Confirmation', subject: 'Your Notary Appointment — {{business_name}}', body: "Hi {{client_name}},\n\nYour notarization is confirmed:\n\nDate: {{date}}\nTime: {{time}}\nLocation: {{location}}\n\nIMPORTANT — Please bring:\n- Valid, unexpired government photo ID (driver's license or passport)\n- The document(s) to be notarized — DO NOT sign them beforehand\n- All signers must be present\n\nFee: {{fee}}\n\nSee you then!\n{{business_name}}", trigger: 'appointment_booked' },
      { name: 'Mobile Confirmation', subject: 'Mobile Notary Appointment — {{business_name}}', body: "Hi {{client_name}},\n\nI'll be coming to you for your notarization:\n\nDate: {{date}}\nTime: {{time}}\nAddress: {{address}}\n\nPlease have your photo ID and documents ready. Remember: all signers must be present and must NOT sign until I arrive.\n\nTotal fee: {{fee}} (includes travel)\n\nSee you soon!\n{{business_name}}", trigger: 'mobile_booked' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{client_name}}, your notary appointment with {{business_name}} is tomorrow at {{time}}. Bring your photo ID and unsigned documents. All signers must be present.", trigger: 'appointment_reminder' },
      { name: 'On My Way', body: "Hi {{client_name}}, I'm on my way to your location. ETA: {{eta}}. Please have IDs and documents ready. — {{business_name}}", trigger: 'en_route' }
    ],
    estimated_hours_saved_weekly: 7,
    estimated_monthly_value: 1400,
    ideal_plan: 'pro',
    competitor_tools: ['Notarize', 'Snapdocs', 'SigningOrder']
  }
];
