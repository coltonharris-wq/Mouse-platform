import type { ProTemplate } from '../schema';

export const constructionTradesTemplates: ProTemplate[] = [
  {
    id: 'general-contractor',
    industry: 'Construction & Trades',
    niche: 'General Contractor',
    display_name: 'General Contractor',
    emoji: '🏗️',
    tagline: 'Win more bids, manage projects with ease, and keep homeowners in the loop.',
    demo_greeting: "Hi! I'm your AI assistant for a general contracting company. I can help with project inquiries, estimates, and understanding our services. How can I help?",
    demo_system_prompt: "You are an AI assistant for a general contractor. Help homeowners and businesses understand your services, get the estimate process started, and schedule consultations. Be professional, reliable, and straightforward. Many homeowners are anxious about contractors — build trust through transparency.",
    demo_suggested_messages: ["I want to remodel my kitchen — where do I start?", "How do I get an estimate?", "Are you licensed and insured?"],
    soul_template: "You are the AI assistant for {{business_name}}, a general contracting company. Help clients understand services and schedule estimates. Be professional and transparent — homeowners often have bad experiences with contractors, so build trust. Always mention you're licensed and insured. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you looking for help with a project?",
    receptionist_system_prompt: "You are the receptionist for a general contractor. Determine the type of project (remodel, addition, new build, repair), scope, and timeline. Schedule an on-site estimate. Be professional and reliable. Mention licensing and insurance proactively.",
    receptionist_faqs: [
      { question: "Are you licensed and insured?", answer: "Absolutely. We're fully licensed, bonded, and insured. We're happy to provide copies of our credentials during your estimate appointment.", category: "credentials" },
      { question: "How much does a kitchen remodel cost?", answer: "It depends on the scope — are we talking a refresh with new countertops and paint, or a full gut renovation? The best way to get an accurate number is to schedule a free on-site estimate.", category: "pricing" },
      { question: "How long does a remodel take?", answer: "Timelines vary by project. A bathroom remodel might take 3-4 weeks, while a full kitchen remodel could be 8-12 weeks. We'll give you a detailed timeline during the estimate.", category: "timeline" }
    ],
    receptionist_transfer_triggers: ["caller has a large commercial project", "caller mentions water damage or structural emergency", "caller is another contractor looking to subcontract", "caller has a warranty issue with previous work"],
    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your contracting business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'Summit Builders LLC', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1001', required: true },
        { name: 'services', label: 'Services you offer', type: 'multiselect', placeholder: '', required: true, options: ['Kitchen Remodels', 'Bathroom Remodels', 'Additions', 'Basements', 'Whole-Home Renovations', 'New Construction', 'Decks & Patios', 'Structural Repairs', 'Commercial Build-Outs', 'Handyman Services'] }
      ]},
      { step_number: 2, title: 'Credentials', description: 'Your license and insurance info.', fields: [
        { name: 'license_number', label: 'Contractor License Number', type: 'text', placeholder: 'GC-12345', required: true },
        { name: 'insured', label: 'Fully insured?', type: 'toggle', placeholder: '', required: true },
        { name: 'warranty', label: 'Workmanship warranty', type: 'select', placeholder: '', required: false, options: ['1 year', '2 years', '5 years', 'Lifetime on structural'] }
      ]},
      { step_number: 3, title: 'Estimates', description: 'How do you handle estimates?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '7:00 AM - 5:00 PM', required: true },
        { name: 'free_estimates', label: 'Offer free estimates?', type: 'toggle', placeholder: '', required: true },
        { name: 'estimate_turnaround', label: 'Estimate turnaround time', type: 'select', placeholder: '', required: true, options: ['Same visit', 'Within 48 hours', 'Within 1 week'] }
      ]},
      { step_number: 4, title: 'Service Area', description: 'Where do you work?', fields: [
        { name: 'service_area', label: 'Service area', type: 'text', placeholder: 'Within 30 miles of downtown', required: true },
        { name: 'financing', label: 'Offer financing?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-leads', title: 'New Project Inquiries', description: 'Homeowners requesting estimates', priority: 1 },
      { id: 'active-projects', title: 'Active Projects', description: 'Jobs currently in progress', priority: 2 },
      { id: 'estimates-pending', title: 'Pending Estimates', description: 'Estimates sent but not yet accepted', priority: 3 },
      { id: 'schedule', title: 'Crew Schedule', description: 'This week\'s job assignments', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule estimate', description: 'Homeowner wants a kitchen remodel estimate — book on-site visit.', category: 'leads', difficulty: 'automatic' },
      { title: 'Estimate follow-up', description: 'Sent estimate 5 days ago — check if they have questions.', category: 'leads', difficulty: 'automatic' },
      { title: 'Project update to client', description: 'Send weekly progress update with photos to homeowner.', category: 'client-communication', difficulty: 'needs-approval' },
      { title: 'Material order reminder', description: 'Cabinets need to be ordered 6 weeks before install date.', category: 'project-management', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Estimate Requests', unit: 'per month', description: 'New project inquiries', target_suggestion: 15 },
      { name: 'Close Rate', unit: 'percent', description: 'Estimates that become signed contracts', target_suggestion: 35 },
      { name: 'Average Project Value', unit: 'dollars', description: 'Average contract value', target_suggestion: 25000 },
      { name: 'On-Time Completion', unit: 'percent', description: 'Projects completed by the agreed deadline', target_suggestion: 85 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages estimate appointments and project timelines', priority: 'essential' },
      { name: 'Buildertrend', slug: 'buildertrend', category: 'project-management', why: 'Manages projects, budgets, and client communication', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Tracks job costs, invoicing, and payments', priority: 'recommended' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Homeowners search "contractor near me" — reviews matter', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'buildertrend', 'quickbooks', 'google-business'],
    email_templates: [
      { name: 'Estimate Confirmation', subject: 'Your Estimate Appointment — {{business_name}}', body: "Hi {{client_name}},\n\nYour estimate appointment is confirmed:\n\nDate: {{date}}\nTime: {{time}}\nProject: {{project_type}}\n\n{{estimator_name}} will come to your home, assess the project, and provide a detailed written estimate.\n\nIf you have photos, measurements, or inspiration images, feel free to have those ready!\n\nSee you then,\n{{business_name}}\nLicense #{{license_number}} | Fully Insured", trigger: 'estimate_booked' },
      { name: 'Weekly Project Update', subject: 'Project Update — Week {{week_number}} — {{business_name}}', body: "Hi {{client_name}},\n\nHere's your weekly project update:\n\nCompleted this week:\n{{completed_items}}\n\nPlanned for next week:\n{{upcoming_items}}\n\nAny issues to note:\n{{issues}}\n\nPhotos attached.\n\nQuestions? Call {{phone}} or reply here.\n\n{{business_name}}", trigger: 'weekly_update' }
    ],
    sms_templates: [
      { name: 'Estimate Reminder', body: "Hi {{client_name}}, {{business_name}} here. Your estimate appointment is tomorrow at {{time}}. We'll assess your {{project_type}} project and give you a detailed quote. See you then!", trigger: 'estimate_reminder' },
      { name: 'Estimate Follow-Up', body: "Hi {{client_name}}, this is {{business_name}}. Just checking in on the estimate we sent for your {{project_type}}. Any questions? Call/text {{phone}}.", trigger: 'estimate_follow_up' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3000,
    ideal_plan: 'growth',
    competitor_tools: ['Buildertrend', 'CoConstruct', 'Houzz Pro']
  },

  {
    id: 'flooring-company',
    industry: 'Construction & Trades',
    niche: 'Flooring Company',
    display_name: 'Flooring Company',
    emoji: '🪵',
    tagline: 'Book more installs, show off your work, and keep projects on track.',
    demo_greeting: "Hi! I'm your AI assistant for a flooring company. I can help with flooring options, estimates, and scheduling. What can I help with?",
    demo_system_prompt: "You are an AI assistant for a flooring company. Help homeowners understand flooring options (hardwood, tile, LVP, carpet), get estimates, and schedule installations. Be knowledgeable about materials and help clients choose the right floor for their space and budget.",
    demo_suggested_messages: ["What type of flooring is best for a kitchen?", "How much does hardwood flooring cost?", "Can you install LVP over my existing floor?"],
    soul_template: "You are the AI assistant for {{business_name}}, a flooring company. Help clients choose the right flooring, schedule estimates, and understand the installation process. Be knowledgeable about materials and honest about pros/cons. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you looking for new flooring?",
    receptionist_system_prompt: "You are the receptionist for a flooring company. Learn what rooms need flooring, what type they're interested in, and the approximate square footage. Schedule an in-home estimate. Be helpful with material comparisons.",
    receptionist_faqs: [
      { question: "What's the best flooring for my situation?", answer: "It depends on the room, traffic, moisture, and your budget. Hardwood is timeless, LVP is waterproof and budget-friendly, tile is great for bathrooms. Our estimator can bring samples and help you decide.", category: "materials" },
      { question: "How much does flooring cost?", answer: "Pricing depends on the material, square footage, and prep work needed. We offer free in-home estimates where we measure, show samples, and give you an exact price.", category: "pricing" },
      { question: "Do you remove old flooring?", answer: "Yes! We handle everything — removal, disposal, subfloor prep, and installation. It's all included in your estimate.", category: "process" }
    ],
    receptionist_transfer_triggers: ["caller has a commercial flooring project", "caller has water damage under their floor", "caller wants to discuss a warranty claim"],
    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your flooring business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'Premier Floors', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1002', required: true },
        { name: 'flooring_types', label: 'Flooring types you install', type: 'multiselect', placeholder: '', required: true, options: ['Hardwood', 'Engineered Hardwood', 'Laminate', 'Luxury Vinyl Plank (LVP)', 'Tile (Ceramic/Porcelain)', 'Natural Stone', 'Carpet', 'Vinyl Sheet', 'Epoxy/Concrete Coating'] }
      ]},
      { step_number: 2, title: 'Services', description: 'What services do you offer?', fields: [
        { name: 'services', label: 'Additional services', type: 'multiselect', placeholder: '', required: true, options: ['Old Floor Removal', 'Subfloor Repair/Prep', 'Stair Installation', 'Refinishing/Sanding', 'Commercial Installation', 'Showroom/Samples'] },
        { name: 'free_estimates', label: 'Free in-home estimates?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 3, title: 'Availability', description: 'When can you work?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '8:00 AM - 5:00 PM', required: true },
        { name: 'lead_time', label: 'Typical lead time to start', type: 'select', placeholder: '', required: true, options: ['1-2 weeks', '2-4 weeks', '4-6 weeks', 'Varies by material'] }
      ]},
      { step_number: 4, title: 'Financing', description: 'Payment options.', fields: [
        { name: 'financing', label: 'Offer financing?', type: 'toggle', placeholder: '', required: false },
        { name: 'warranty', label: 'Installation warranty', type: 'select', placeholder: '', required: false, options: ['1 year', '2 years', '5 years', 'Lifetime labor warranty'] }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-leads', title: 'New Estimates Requested', description: 'Homeowners wanting flooring quotes', priority: 1 },
      { id: 'jobs-scheduled', title: 'Jobs Scheduled', description: 'Upcoming installations', priority: 2 },
      { id: 'material-orders', title: 'Material Orders', description: 'Materials to order for upcoming jobs', priority: 3 },
      { id: 'estimates-pending', title: 'Estimates Pending', description: 'Quotes sent but not accepted', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule in-home estimate', description: 'Homeowner wants LVP for their whole first floor — schedule estimate.', category: 'leads', difficulty: 'automatic' },
      { title: 'Follow up on estimate', description: 'Sent hardwood quote last week — check in.', category: 'leads', difficulty: 'automatic' },
      { title: 'Material arrival notification', description: 'Client\'s tile arrived — schedule installation date.', category: 'project-management', difficulty: 'automatic' },
      { title: 'Post-install follow-up', description: 'Installation completed yesterday — check if client is happy.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Estimate Requests', unit: 'per month', description: 'New flooring inquiries', target_suggestion: 20 },
      { name: 'Close Rate', unit: 'percent', description: 'Estimates that turn into jobs', target_suggestion: 40 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per installation', target_suggestion: 4000 },
      { name: 'Client Satisfaction', unit: 'rating', description: 'Post-install satisfaction rating', target_suggestion: 4.8 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages estimate and install schedules', priority: 'essential' },
      { name: 'Jobber', slug: 'jobber', category: 'field-service', why: 'Manages estimates, jobs, and invoicing', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Homeowners search "flooring near me" — reviews matter', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Tracks job costs and payments', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'jobber', 'google-business', 'quickbooks'],
    email_templates: [
      { name: 'Estimate Confirmation', subject: 'Your Flooring Estimate — {{business_name}}', body: "Hi {{client_name}},\n\nYour free in-home flooring estimate is set:\n\nDate: {{date}}\nTime: {{time}}\n\nOur estimator will bring samples, measure your space, and give you an exact quote.\n\nIf you've seen any flooring you like online, feel free to show us — we can usually match or source it!\n\nSee you then,\n{{business_name}}", trigger: 'estimate_booked' },
      { name: 'Install Prep', subject: 'Getting Ready for Your Flooring Installation — {{business_name}}', body: "Hi {{client_name}},\n\nYour installation is coming up on {{date}}! Here's what to prepare:\n\n- Move furniture out of the work area (we can help with heavy items)\n- Remove items from closet floors in the work area\n- Expect some noise and dust — we protect your home but it gets messy\n- Installation typically takes {{duration}}\n\nWe'll arrive between {{arrival_window}}.\n\nCall {{phone}} with questions.\n\n{{business_name}}", trigger: 'install_prep' }
    ],
    sms_templates: [
      { name: 'Estimate Reminder', body: "Hi {{client_name}}, {{business_name}} here. Your flooring estimate is tomorrow at {{time}}. We'll bring samples and measure your space. See you then!", trigger: 'estimate_reminder' },
      { name: 'Install Day', body: "Hi {{client_name}}, your flooring installation is tomorrow! Our crew will arrive between {{arrival_window}}. Please have the area cleared. Call {{phone}} with questions.", trigger: 'install_reminder' }
    ],
    estimated_hours_saved_weekly: 11,
    estimated_monthly_value: 2400,
    ideal_plan: 'pro',
    competitor_tools: ['Jobber', 'FloorSoft', 'Houzz Pro']
  },

  {
    id: 'window-door-installer',
    industry: 'Construction & Trades',
    niche: 'Window & Door Installer',
    display_name: 'Window & Door Company',
    emoji: '🪟',
    tagline: 'Book more installs, show energy savings, and turn every estimate into a sale.',
    demo_greeting: "Hi! I'm your AI assistant for a window and door company. I can help with replacement options, energy efficiency questions, and scheduling estimates. How can I help?",
    demo_system_prompt: "You are an AI assistant for a window and door company. Help homeowners understand replacement options, energy efficiency benefits, and the installation process. Be knowledgeable about window types and door styles. Emphasize energy savings and curb appeal.",
    demo_suggested_messages: ["My windows are drafty — should I replace them?", "How much do replacement windows cost?", "Do new windows really save on energy bills?"],
    soul_template: "You are the AI assistant for {{business_name}}, a window and door company. Help homeowners learn about replacement options and schedule estimates. Emphasize energy savings and increased home value. Be patient — window replacement is a big investment. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you interested in new windows or doors?",
    receptionist_system_prompt: "You are the receptionist for a window and door company. Learn: what needs replacing (windows, doors, or both), how many, what's driving the decision (energy, aesthetics, damage), and schedule an in-home estimate. Mention financing options.",
    receptionist_faqs: [
      { question: "How much do replacement windows cost?", answer: "Pricing depends on window size, style, glass type, and quantity. We offer free in-home consultations where we measure, discuss options, and give you an exact quote — no pressure.", category: "pricing" },
      { question: "Will new windows lower my energy bills?", answer: "Yes — modern energy-efficient windows can significantly reduce heating and cooling costs. Many homeowners see savings of 15-30% on energy bills. We'll show you the options during your consultation.", category: "energy" },
      { question: "How long does installation take?", answer: "Most window replacements take just one day. We install from the outside when possible, so there's minimal disruption inside your home.", category: "installation" }
    ],
    receptionist_transfer_triggers: ["caller mentions a broken window that's a security concern", "caller has a commercial project", "caller has a very large project (10+ windows)"],
    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your window/door business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'ClearView Windows & Doors', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1003', required: true },
        { name: 'products', label: 'Products you offer', type: 'multiselect', placeholder: '', required: true, options: ['Replacement Windows', 'Entry Doors', 'Patio/Sliding Doors', 'Storm Windows', 'Storm Doors', 'Bay/Bow Windows', 'Skylights', 'Glass Block', 'Commercial Windows'] }
      ]},
      { step_number: 2, title: 'Brands & Features', description: 'What brands and options do you carry?', fields: [
        { name: 'window_brands', label: 'Window brands', type: 'text', placeholder: 'Andersen, Pella, Marvin, or custom', required: false },
        { name: 'energy_star', label: 'Offer ENERGY STAR® certified products?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 3, title: 'Estimates & Pricing', description: 'How you quote projects.', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '8:00 AM - 6:00 PM', required: true },
        { name: 'free_estimates', label: 'Free in-home estimates?', type: 'toggle', placeholder: '', required: true },
        { name: 'financing', label: 'Financing available?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Warranty', description: 'What warranties do you offer?', fields: [
        { name: 'product_warranty', label: 'Product warranty', type: 'text', placeholder: 'Lifetime manufacturer warranty', required: false },
        { name: 'labor_warranty', label: 'Installation warranty', type: 'text', placeholder: '10-year labor warranty', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-leads', title: 'New Estimate Requests', description: 'Homeowners wanting quotes', priority: 1 },
      { id: 'estimates-sent', title: 'Estimates Sent', description: 'Quotes pending acceptance', priority: 2 },
      { id: 'orders-pending', title: 'Orders in Production', description: 'Windows/doors being manufactured', priority: 3 },
      { id: 'installs-scheduled', title: 'Upcoming Installations', description: 'Jobs scheduled this week', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule estimate', description: 'Homeowner has 8 drafty windows — schedule in-home consultation.', category: 'leads', difficulty: 'automatic' },
      { title: 'Estimate follow-up', description: 'Sent quote for 12 windows — follow up on decision.', category: 'leads', difficulty: 'automatic' },
      { title: 'Order status update', description: 'Client\'s windows arrived at warehouse — schedule installation.', category: 'project-management', difficulty: 'automatic' },
      { title: 'Post-install satisfaction check', description: 'Installation completed — check if homeowner is happy.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Estimate Appointments', unit: 'per month', description: 'In-home estimates scheduled', target_suggestion: 20 },
      { name: 'Close Rate', unit: 'percent', description: 'Estimates that become signed contracts', target_suggestion: 30 },
      { name: 'Average Sale', unit: 'dollars', description: 'Average contract value', target_suggestion: 8000 },
      { name: 'Referral Rate', unit: 'percent', description: 'New business from referrals', target_suggestion: 25 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages estimate and install appointments', priority: 'essential' },
      { name: 'Jobber', slug: 'jobber', category: 'field-service', why: 'Manages estimates, work orders, and invoicing', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Reviews and visibility for local search', priority: 'recommended' },
      { name: 'GreenSky', slug: 'greensky', category: 'financing', why: 'Offers customer financing for large projects', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'jobber', 'google-business', 'greensky'],
    email_templates: [
      { name: 'Estimate Confirmation', subject: 'Your Free Window/Door Estimate — {{business_name}}', body: "Hi {{client_name}},\n\nYour free in-home estimate is confirmed:\n\nDate: {{date}}\nTime: {{time}}\n\nOur consultant will:\n- Inspect your current windows/doors\n- Show you product options and samples\n- Provide an exact quote\n- Discuss financing if needed\n\nNo pressure — just honest advice.\n\n{{business_name}}", trigger: 'estimate_booked' },
      { name: 'Order Ready', subject: 'Your Windows/Doors Have Arrived! — {{business_name}}', body: "Hi {{client_name}},\n\nGreat news — your {{product_type}} have arrived and are ready for installation!\n\nLet's schedule your install date. Most installations take just {{install_duration}}.\n\nBook your install: {{booking_link}}\nOr call us: {{phone}}\n\n{{business_name}}", trigger: 'order_arrived' }
    ],
    sms_templates: [
      { name: 'Estimate Reminder', body: "Hi {{client_name}}, your free window/door estimate with {{business_name}} is tomorrow at {{time}}. Our consultant will bring samples. See you then!", trigger: 'estimate_reminder' },
      { name: 'Install Day', body: "Hi {{client_name}}, your installation is tomorrow! Our crew will arrive between {{arrival_window}}. Clear window sills and move breakables away from work areas. Call {{phone}} with questions.", trigger: 'install_reminder' }
    ],
    estimated_hours_saved_weekly: 11,
    estimated_monthly_value: 2600,
    ideal_plan: 'growth',
    competitor_tools: ['Jobber', 'MarketSharp', 'Improveit 360']
  },

  {
    id: 'kitchen-remodel',
    industry: 'Construction & Trades',
    niche: 'Kitchen Remodeler',
    display_name: 'Kitchen Remodeling Company',
    emoji: '🍳',
    tagline: 'Turn dream kitchens into reality with smooth project management and happy clients.',
    demo_greeting: "Hi! I'm your AI assistant for a kitchen remodeling company. I can help with design ideas, estimates, and understanding the remodel process. How can I help?",
    demo_system_prompt: "You are an AI assistant for a kitchen remodeling company. Help homeowners understand the process, get inspired, and schedule design consultations. Be knowledgeable about layouts, materials, and timelines. Kitchen remodels are emotional — they're the heart of the home.",
    demo_suggested_messages: ["I want to remodel my kitchen — where do I start?", "How much does a kitchen remodel cost?", "How long does a kitchen remodel take?"],
    soul_template: "You are the AI assistant for {{business_name}}, a kitchen remodeling company. Help homeowners envision their dream kitchen and schedule consultations. Be passionate about great design and honest about costs and timelines. Kitchens are emotional — it's the heart of the home. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}! I'm the virtual assistant. Are you thinking about a kitchen remodel?",
    receptionist_system_prompt: "You are the receptionist for a kitchen remodeler. Learn about the project: full remodel or partial, budget range, timeline, and what they dislike about their current kitchen. Schedule a design consultation. Be enthusiastic about transformations.",
    receptionist_faqs: [
      { question: "How much does a kitchen remodel cost?", answer: "Kitchen remodels range widely — a basic refresh might start around $15-20K, while a full custom remodel can be $50K+. We offer a free design consultation to understand your vision and give you an accurate budget.", category: "pricing" },
      { question: "How long does it take?", answer: "A typical full kitchen remodel takes 8-12 weeks from demo to completion. Timeline depends on scope and material lead times. We'll give you a detailed schedule during your consultation.", category: "timeline" },
      { question: "Can I use my kitchen during the remodel?", answer: "During most of the remodel, your kitchen will be out of commission. We'll help you set up a temporary kitchen area and do everything we can to minimize the disruption.", category: "process" }
    ],
    receptionist_transfer_triggers: ["caller wants to discuss a project over $100K", "caller has a very tight timeline", "caller is building a new home and needs kitchen design"],
    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your kitchen remodeling business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'Dream Kitchen Design + Build', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1004', required: true },
        { name: 'services', label: 'Services you offer', type: 'multiselect', placeholder: '', required: true, options: ['Full Kitchen Remodels', 'Cabinet Refacing', 'Countertop Replacement', 'Kitchen Design', 'Custom Cabinetry', 'Backsplash Installation', 'Appliance Installation', 'Kitchen Island Build', 'Open Concept Conversion'] }
      ]},
      { step_number: 2, title: 'Process', description: 'How do you work with clients?', fields: [
        { name: 'design_process', label: 'Do you provide 3D design renderings?', type: 'toggle', placeholder: '', required: true },
        { name: 'showroom', label: 'Do you have a showroom?', type: 'toggle', placeholder: '', required: false },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '8:00 AM - 5:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Budget Ranges', description: 'What budget levels do you serve?', fields: [
        { name: 'budget_range', label: 'Budget ranges you work with', type: 'multiselect', placeholder: '', required: true, options: ['Budget-Friendly ($10-25K)', 'Mid-Range ($25-50K)', 'High-End ($50-100K)', 'Luxury ($100K+)'] },
        { name: 'financing', label: 'Offer financing?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Warranty', description: 'What do you guarantee?', fields: [
        { name: 'warranty', label: 'Workmanship warranty', type: 'select', placeholder: '', required: true, options: ['1 year', '2 years', '5 years', 'Lifetime labor warranty'] },
        { name: 'service_area', label: 'Service area', type: 'text', placeholder: 'Greater Metro area', required: true }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-leads', title: 'New Inquiries', description: 'Homeowners dreaming of a new kitchen', priority: 1 },
      { id: 'design-phase', title: 'In Design Phase', description: 'Projects being designed', priority: 2 },
      { id: 'active-remodels', title: 'Active Remodels', description: 'Kitchens currently under construction', priority: 3 },
      { id: 'material-tracking', title: 'Material Orders', description: 'Cabinets and materials on order', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule consultation', description: 'Homeowner wants a modern kitchen remodel — book design consultation.', category: 'leads', difficulty: 'automatic' },
      { title: 'Design approval follow-up', description: 'Sent 3D rendering — check if client is ready to approve and move forward.', category: 'design', difficulty: 'needs-approval' },
      { title: 'Weekly project update', description: 'Send homeowner photos and progress update.', category: 'client-communication', difficulty: 'automatic' },
      { title: 'Cabinet order deadline', description: 'Cabinets need to be ordered this week to meet the timeline.', category: 'project-management', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Consultation Requests', unit: 'per month', description: 'Homeowners requesting design consultations', target_suggestion: 12 },
      { name: 'Close Rate', unit: 'percent', description: 'Consultations that become signed contracts', target_suggestion: 35 },
      { name: 'Average Project Value', unit: 'dollars', description: 'Average kitchen remodel contract', target_suggestion: 35000 },
      { name: 'On-Time Delivery', unit: 'percent', description: 'Projects completed on schedule', target_suggestion: 80 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages consultations and project milestones', priority: 'essential' },
      { name: 'Buildertrend', slug: 'buildertrend', category: 'project-management', why: 'Manages the full remodel process from design to punch list', priority: 'essential' },
      { name: 'Houzz', slug: 'houzz', category: 'marketing', why: 'Showcase before/after photos and collect reviews', priority: 'recommended' },
      { name: 'GreenSky', slug: 'greensky', category: 'financing', why: 'Offers homeowner financing to increase close rates', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'buildertrend', 'houzz', 'greensky'],
    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Kitchen Design Consultation — {{business_name}}', body: "Hi {{client_name}},\n\nWe're excited to help you design your dream kitchen!\n\nConsultation: {{date}} at {{time}}\nLocation: {{location}}\n\nBefore we meet, think about:\n- What you love and hate about your current kitchen\n- Your must-haves (island? pantry? specific appliances?)\n- Any inspiration photos (Pinterest, Houzz, magazines)\n- Your approximate budget range\n\nWe'll bring ideas, samples, and lots of possibilities.\n\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Project Kickoff', subject: 'Your Kitchen Remodel Starts Soon! — {{business_name}}', body: "Hi {{client_name}},\n\nYour kitchen remodel begins on {{start_date}}! Here's what to expect:\n\n- Set up a temporary kitchen area (microwave, coffee maker, mini fridge)\n- Clear all cabinets and countertops in the work area\n- Expect noise from {{work_hours}}\n- Our project manager, {{pm_name}}, is your main contact\n\nThis is going to be an amazing transformation!\n\n{{business_name}}", trigger: 'project_start' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, your kitchen design consultation with {{business_name}} is tomorrow at {{time}}. Bring any inspiration photos you love! See you then.", trigger: 'consultation_reminder' },
      { name: 'Project Update', body: "Hi {{client_name}}, quick update on your kitchen remodel: {{update}}. Photos in your email. Questions? Call {{phone}}.", trigger: 'project_update' }
    ],
    estimated_hours_saved_weekly: 13,
    estimated_monthly_value: 2800,
    ideal_plan: 'growth',
    competitor_tools: ['Buildertrend', 'Houzz Pro', 'CoConstruct']
  },

  {
    id: 'bathroom-remodel',
    industry: 'Construction & Trades',
    niche: 'Bathroom Remodeler',
    display_name: 'Bathroom Remodeling Company',
    emoji: '🚿',
    tagline: 'Book more bathroom projects and deliver stunning transformations on time.',
    demo_greeting: "Hi! I'm your AI assistant for a bathroom remodeling company. I can help with design ideas, estimates, and scheduling. How can I help?",
    demo_system_prompt: "You are an AI assistant for a bathroom remodeling company. Help homeowners explore options for bathroom renovations, understand costs, and schedule consultations. Be knowledgeable about tile, fixtures, vanities, and accessibility options (walk-in showers, grab bars).",
    demo_suggested_messages: ["I want to update my master bathroom", "How much does a bathroom remodel cost?", "Can you convert my tub to a walk-in shower?"],
    soul_template: "You are the AI assistant for {{business_name}}, a bathroom remodeling company. Help homeowners visualize their dream bathroom and schedule consultations. Be knowledgeable about materials and accessibility options. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you thinking about a bathroom remodel?",
    receptionist_system_prompt: "You are the receptionist for a bathroom remodeler. Learn about the project: which bathroom, full remodel or specific items, budget range, and any accessibility needs. Schedule a consultation.",
    receptionist_faqs: [
      { question: "How much does a bathroom remodel cost?", answer: "A basic bathroom update starts around $8-10K, while a full master bath remodel can range from $15-40K depending on size and finishes. We offer a free consultation to give you an exact quote.", category: "pricing" },
      { question: "How long does it take?", answer: "A standard bathroom remodel takes about 3-4 weeks. Walk-in shower conversions can sometimes be done in as little as 1-2 weeks. We'll give you a specific timeline during your consultation.", category: "timeline" },
      { question: "Can you make my bathroom more accessible?", answer: "Absolutely. We specialize in accessibility upgrades — walk-in showers, grab bars, comfort-height toilets, and ADA-compliant layouts. These upgrades can be beautiful AND functional.", category: "accessibility" }
    ],
    receptionist_transfer_triggers: ["caller has a water leak or plumbing emergency", "caller needs accessibility modifications urgently", "caller has a multi-bathroom project"],
    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your bathroom remodeling business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'Refresh Bath & Design', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1005', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Full Bathroom Remodels', 'Tub-to-Shower Conversion', 'Walk-In Shower Installation', 'Tile Work', 'Vanity/Countertop Replacement', 'Accessibility Modifications', 'Plumbing Updates', 'Custom Shower Glass', 'Bathtub Refinishing'] }
      ]},
      { step_number: 2, title: 'Process', description: 'How do you work?', fields: [
        { name: 'design_service', label: 'Offer design service?', type: 'toggle', placeholder: '', required: true },
        { name: 'showroom', label: 'Have a showroom?', type: 'toggle', placeholder: '', required: false },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '8:00 AM - 5:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Pricing', description: 'Budget and payment info.', fields: [
        { name: 'starting_price', label: 'Starting remodel price', type: 'currency', placeholder: '8000', required: true },
        { name: 'financing', label: 'Offer financing?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Warranty & Area', description: 'Guarantees and coverage.', fields: [
        { name: 'warranty', label: 'Labor warranty', type: 'select', placeholder: '', required: true, options: ['1 year', '2 years', '5 years', 'Lifetime'] },
        { name: 'service_area', label: 'Service area', type: 'text', placeholder: 'Greater Metro area', required: true }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-leads', title: 'New Inquiries', description: 'Homeowners wanting bathroom quotes', priority: 1 },
      { id: 'active-remodels', title: 'Active Remodels', description: 'Bathrooms currently under construction', priority: 2 },
      { id: 'design-approvals', title: 'Pending Design Approvals', description: 'Designs waiting for client sign-off', priority: 3 },
      { id: 'material-orders', title: 'Material Orders', description: 'Tile, fixtures, and vanities on order', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule consultation', description: 'Homeowner wants master bath remodel — book consultation.', category: 'leads', difficulty: 'automatic' },
      { title: 'Material selection reminder', description: 'Client needs to pick tile by end of week to stay on schedule.', category: 'project-management', difficulty: 'automatic' },
      { title: 'Before/after photos', description: 'Remodel complete — take professional photos for portfolio.', category: 'marketing', difficulty: 'needs-approval' },
      { title: 'Warranty reminder', description: 'Send 1-year warranty check-in to past client.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Consultation Requests', unit: 'per month', description: 'New bathroom inquiries', target_suggestion: 15 },
      { name: 'Close Rate', unit: 'percent', description: 'Consultations that become contracts', target_suggestion: 40 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average bathroom remodel contract', target_suggestion: 15000 },
      { name: 'Client Satisfaction', unit: 'rating', description: 'Post-remodel satisfaction rating', target_suggestion: 4.9 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages consultations and project schedules', priority: 'essential' },
      { name: 'Buildertrend', slug: 'buildertrend', category: 'project-management', why: 'Tracks remodel projects from design to completion', priority: 'essential' },
      { name: 'Houzz', slug: 'houzz', category: 'marketing', why: 'Showcase before/after bathroom transformations', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Manages invoicing and job costing', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'buildertrend', 'houzz', 'quickbooks'],
    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Bathroom Consultation — {{business_name}}', body: "Hi {{client_name}},\n\nYour free bathroom remodel consultation is set:\n\nDate: {{date}}\nTime: {{time}}\n\nBefore we meet, think about:\n- What bothers you most about your current bathroom\n- Must-haves (walk-in shower? double vanity? heated floors?)\n- Any inspiration photos\n\nWe'll measure, discuss options, and give you a quote.\n\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Remodel Complete', subject: 'Your New Bathroom is Done! — {{business_name}}', body: "Hi {{client_name}},\n\nYour bathroom transformation is complete! We hope you love it as much as we loved building it.\n\nA few notes:\n- Your warranty information is attached\n- Avoid using harsh chemicals on new grout for 30 days\n- Let new caulk cure for 24 hours before getting it wet\n\nIf you love your new bathroom, we'd be grateful for a review: {{review_link}}\n\nEnjoy!\n{{business_name}}", trigger: 'project_complete' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, your bathroom consultation with {{business_name}} is tomorrow at {{time}}. We'll bring design ideas! See you then.", trigger: 'consultation_reminder' },
      { name: 'Material Decision Needed', body: "Hi {{client_name}}, we need your tile/fixture selections by {{deadline}} to keep your remodel on schedule. Check your email for the options or call {{phone}}.", trigger: 'material_deadline' }
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2600,
    ideal_plan: 'growth',
    competitor_tools: ['Buildertrend', 'Bath Planet (competitor)', 'Houzz Pro']
  },

  {
    id: 'concrete-company',
    industry: 'Construction & Trades',
    niche: 'Concrete Company',
    display_name: 'Concrete Company',
    emoji: '🪨',
    tagline: 'Pour more jobs with automated estimates, weather-aware scheduling, and client follow-up.',
    demo_greeting: "Hi! I'm your AI assistant for a concrete company. I can help with driveways, patios, foundations, and more. How can I help?",
    demo_system_prompt: "You are an AI assistant for a concrete company. Help clients understand concrete services, get estimates, and schedule jobs. Be knowledgeable about types of concrete work and finishes. Mention that weather affects scheduling.",
    demo_suggested_messages: ["I need a new driveway poured", "How much does a concrete patio cost?", "Do you do stamped concrete?"],
    soul_template: "You are the AI assistant for {{business_name}}, a concrete company. Help clients with estimates and scheduling. Be knowledgeable about concrete finishes and applications. Note that weather affects scheduling — concrete can't be poured in freezing temperatures or heavy rain. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. What concrete work are you looking for?",
    receptionist_system_prompt: "You are the receptionist for a concrete company. Determine: type of work (driveway, patio, foundation, sidewalk, etc.), approximate size, any decorative finish desired, and timeline. Schedule an estimate. Mention weather-dependent scheduling.",
    receptionist_faqs: [
      { question: "How much does concrete work cost?", answer: "Pricing depends on the size, type of work, and finish. Basic concrete runs $6-10 per square foot, while stamped or decorative concrete is $12-18+. We offer free on-site estimates.", category: "pricing" },
      { question: "How long does concrete take to cure?", answer: "Concrete reaches initial strength in about 24-48 hours (you can walk on it), but full cure takes about 28 days. We'll give you specific care instructions for your project.", category: "process" },
      { question: "Do you do stamped or colored concrete?", answer: "Yes! We offer a variety of stamped patterns and colors that can make concrete look like brick, stone, or slate. It's a beautiful and durable option for patios and walkways.", category: "decorative" }
    ],
    receptionist_transfer_triggers: ["caller needs emergency foundation repair", "caller has a large commercial project", "caller mentions structural cracks in their foundation"],
    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your concrete business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'Solid Foundation Concrete', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1006', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Driveways', 'Patios', 'Sidewalks', 'Foundations', 'Retaining Walls', 'Stamped/Decorative', 'Colored Concrete', 'Concrete Repair', 'Garage Floors', 'Commercial'] }
      ]},
      { step_number: 2, title: 'Capabilities', description: 'What can you do?', fields: [
        { name: 'finishes', label: 'Finish options', type: 'multiselect', placeholder: '', required: true, options: ['Broom Finish', 'Smooth/Troweled', 'Stamped', 'Exposed Aggregate', 'Colored/Stained', 'Epoxy Coating', 'Polished'] },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '7:00 AM - 5:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Estimates', description: 'How you quote projects.', fields: [
        { name: 'free_estimates', label: 'Free on-site estimates?', type: 'toggle', placeholder: '', required: true },
        { name: 'seasonal', label: 'Seasonal operation?', type: 'select', placeholder: '', required: true, options: ['Year-round', 'Spring through Fall', 'Weather-dependent'] }
      ]},
      { step_number: 4, title: 'Service Area', description: 'Where do you work?', fields: [
        { name: 'service_area', label: 'Service area', type: 'text', placeholder: 'Within 50 miles', required: true },
        { name: 'min_project', label: 'Minimum project size', type: 'currency', placeholder: '1500', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-leads', title: 'New Estimates Requested', description: 'Clients wanting concrete quotes', priority: 1 },
      { id: 'weather', title: 'Weather Forecast', description: 'Upcoming weather affecting pour schedule', priority: 2 },
      { id: 'jobs-scheduled', title: 'Upcoming Pours', description: 'Jobs scheduled this week', priority: 3 },
      { id: 'estimates-pending', title: 'Pending Estimates', description: 'Quotes awaiting acceptance', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule estimate', description: 'Homeowner wants a stamped concrete patio — schedule on-site visit.', category: 'leads', difficulty: 'automatic' },
      { title: 'Weather reschedule', description: 'Rain forecasted for Thursday\'s pour — reschedule and notify client.', category: 'scheduling', difficulty: 'needs-approval' },
      { title: 'Estimate follow-up', description: 'Sent driveway quote last week — check in.', category: 'leads', difficulty: 'automatic' },
      { title: 'Curing care instructions', description: 'Send post-pour care instructions to yesterday\'s client.', category: 'client-communication', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Estimates Given', unit: 'per month', description: 'On-site estimates completed', target_suggestion: 15 },
      { name: 'Close Rate', unit: 'percent', description: 'Estimates that become jobs', target_suggestion: 45 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per project', target_suggestion: 5000 },
      { name: 'Weather Delays', unit: 'per month', description: 'Jobs delayed due to weather', target_suggestion: 2 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages estimate and pour schedules', priority: 'essential' },
      { name: 'Jobber', slug: 'jobber', category: 'field-service', why: 'Manages estimates, work orders, and invoicing', priority: 'essential' },
      { name: 'Weather API', slug: 'weather-api', category: 'operations', why: 'Monitors weather for pour scheduling', priority: 'recommended' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Reviews and visibility for local concrete searches', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'jobber', 'weather-api', 'google-business'],
    email_templates: [
      { name: 'Estimate Confirmation', subject: 'Your Concrete Estimate — {{business_name}}', body: "Hi {{client_name}},\n\nYour free on-site estimate is scheduled:\n\nDate: {{date}}\nTime: {{time}}\nProject: {{project_type}}\n\nWe'll measure the area, discuss finish options, and give you an exact quote.\n\nSee you then!\n{{business_name}}", trigger: 'estimate_booked' },
      { name: 'Post-Pour Care', subject: 'Care Instructions for Your New Concrete — {{business_name}}', body: "Hi {{client_name}},\n\nYour new {{project_type}} looks great! Here's how to take care of it:\n\n- Keep off for at least 24 hours (48 for vehicles)\n- Keep moist for the first 7 days (light sprinkle with a hose)\n- No heavy vehicles for 7-10 days\n- Avoid salt or deicers for the first winter\n- Full cure takes about 28 days\n\nQuestions? Call {{phone}}.\n\nEnjoy your new concrete!\n{{business_name}}", trigger: 'pour_complete' }
    ],
    sms_templates: [
      { name: 'Estimate Reminder', body: "Hi {{client_name}}, your concrete estimate with {{business_name}} is tomorrow at {{time}}. We'll measure and give you a quote. See you then!", trigger: 'estimate_reminder' },
      { name: 'Pour Day Confirmation', body: "Hi {{client_name}}, your concrete pour is scheduled for tomorrow. Weather looks good! Our crew will arrive at {{time}}. Please make sure the area is clear and accessible.", trigger: 'pour_day' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
    competitor_tools: ['Jobber', 'ServiceTitan', 'Concrete Network']
  },

  {
    id: 'solar-installer',
    industry: 'Construction & Trades',
    niche: 'Solar Installer',
    display_name: 'Solar Installation Company',
    emoji: '☀️',
    tagline: 'Close more solar deals with instant savings estimates and seamless project management.',
    demo_greeting: "Hi! I'm your AI assistant for a solar installation company. I can help you understand solar energy, estimate savings, and schedule a consultation. How can I help?",
    demo_system_prompt: "You are an AI assistant for a solar installation company. Help homeowners understand solar benefits, tax incentives, and the installation process. Be enthusiastic about clean energy but honest about costs and ROI. Ask about their current electric bill to estimate savings.",
    demo_suggested_messages: ["Will solar save me money?", "How much does solar installation cost?", "What tax credits are available for solar?"],
    soul_template: "You are the AI assistant for {{business_name}}, a solar installation company. Help homeowners understand solar energy and schedule consultations. Be enthusiastic but honest. Ask about their electric bill, roof type, and sun exposure. Mention available tax credits and incentives but don't guarantee specific savings. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}! I'm the virtual assistant. Are you interested in going solar?",
    receptionist_system_prompt: "You are the receptionist for a solar company. Learn: homeowner's average monthly electric bill, roof type and age, whether they own the home, and what's driving their interest. Schedule a consultation. Mention the federal solar tax credit. Don't make specific savings promises.",
    receptionist_faqs: [
      { question: "How much does solar cost?", answer: "System cost depends on your energy needs and roof size. Most residential systems range from $15-30K before incentives. With the federal tax credit, the cost drops significantly. We offer free consultations with a custom savings analysis.", category: "pricing" },
      { question: "What about the tax credit?", answer: "The federal solar investment tax credit lets you deduct a significant percentage of your solar system cost from your federal taxes. Your tax advisor can confirm your eligibility. We'll include the credit in your savings estimate.", category: "incentives" },
      { question: "Do you offer financing?", answer: "Yes! We offer multiple financing options including $0-down solar loans, leases, and power purchase agreements. Many homeowners pay less on their solar loan than they were paying for electricity.", category: "financing" }
    ],
    receptionist_transfer_triggers: ["caller has a commercial property", "caller asks about battery storage", "caller has a very high electric bill ($500+/month)", "caller is a builder wanting solar for new construction"],
    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your solar business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'SunPeak Solar', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1007', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Residential Solar', 'Commercial Solar', 'Battery Storage', 'EV Charger Installation', 'Solar Roof', 'Ground-Mount Systems', 'System Monitoring', 'Panel Maintenance/Cleaning'] }
      ]},
      { step_number: 2, title: 'Products', description: 'What do you install?', fields: [
        { name: 'panel_brands', label: 'Panel brands', type: 'text', placeholder: 'LG, SunPower, Canadian Solar', required: false },
        { name: 'inverter_types', label: 'Inverter types', type: 'multiselect', placeholder: '', required: false, options: ['String Inverters', 'Microinverters', 'Power Optimizers'] },
        { name: 'battery_options', label: 'Offer battery storage?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 3, title: 'Sales Process', description: 'How do you work with homeowners?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '8:00 AM - 6:00 PM', required: true },
        { name: 'free_consultation', label: 'Free consultation?', type: 'toggle', placeholder: '', required: true },
        { name: 'financing_options', label: 'Financing options', type: 'multiselect', placeholder: '', required: true, options: ['Cash Purchase', 'Solar Loan ($0 down)', 'Solar Lease', 'PPA (Power Purchase Agreement)', 'PACE Financing'] }
      ]},
      { step_number: 4, title: 'Coverage', description: 'Where do you install?', fields: [
        { name: 'service_area', label: 'Service area', type: 'text', placeholder: 'Tri-state area', required: true },
        { name: 'warranty', label: 'Workmanship warranty', type: 'text', placeholder: '25-year warranty', required: true }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-leads', title: 'New Inquiries', description: 'Homeowners interested in solar', priority: 1 },
      { id: 'proposals-sent', title: 'Proposals Sent', description: 'Custom solar designs pending acceptance', priority: 2 },
      { id: 'installs-scheduled', title: 'Installations Scheduled', description: 'Upcoming installations', priority: 3 },
      { id: 'permits-pending', title: 'Permits & Inspections', description: 'Permit applications in progress', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule consultation', description: 'Homeowner with $250/mo electric bill wants to learn about solar.', category: 'leads', difficulty: 'automatic' },
      { title: 'Proposal follow-up', description: 'Sent custom solar design 4 days ago — follow up.', category: 'leads', difficulty: 'automatic' },
      { title: 'Permit status update', description: 'Check permit status and update client.', category: 'project-management', difficulty: 'automatic' },
      { title: 'System activation celebration', description: 'System is live — send congratulations and monitoring setup guide.', category: 'client-communication', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Consultations Booked', unit: 'per month', description: 'In-home solar consultations', target_suggestion: 20 },
      { name: 'Close Rate', unit: 'percent', description: 'Consultations that become signed contracts', target_suggestion: 25 },
      { name: 'Average System Size', unit: 'kW', description: 'Average residential system size installed', target_suggestion: 8 },
      { name: 'Referral Rate', unit: 'percent', description: 'New leads from customer referrals', target_suggestion: 20 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages consultations and install schedules', priority: 'essential' },
      { name: 'Aurora Solar', slug: 'aurora-solar', category: 'design', why: 'Creates solar designs and savings proposals', priority: 'essential' },
      { name: 'Salesforce', slug: 'salesforce', category: 'crm', why: 'Manages solar sales pipeline', priority: 'recommended' },
      { name: 'GreenSky', slug: 'greensky', category: 'financing', why: 'Offers solar financing to homeowners', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'aurora-solar', 'salesforce', 'greensky'],
    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Free Solar Consultation — {{business_name}}', body: "Hi {{client_name}},\n\nYour solar consultation is confirmed:\n\nDate: {{date}}\nTime: {{time}}\n\nOur solar advisor will:\n- Analyze your roof using satellite imagery\n- Review your energy usage\n- Design a custom system for your home\n- Show you exactly how much you can save\n- Explain all financing options\n\nHave your recent electric bill handy if possible!\n\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'System Activated', subject: '🎉 Your Solar System is Live! — {{business_name}}', body: "Hi {{client_name}},\n\nCongratulations — your solar system is officially producing clean energy!\n\nSystem size: {{system_size}}\nEstimated annual production: {{annual_production}}\nEstimated annual savings: {{annual_savings}}\n\nDownload our monitoring app to see your production in real-time: {{app_link}}\n\nWelcome to the solar family!\n{{business_name}}", trigger: 'system_activated' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, your free solar consultation with {{business_name}} is tomorrow at {{time}}. Have your electric bill ready! See you then. ☀️", trigger: 'consultation_reminder' },
      { name: 'System Live', body: "🎉 {{client_name}}, your solar system is LIVE and producing energy! Check your monitoring app to see it in action. Welcome to solar! — {{business_name}}", trigger: 'system_live' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3200,
    ideal_plan: 'growth',
    competitor_tools: ['Aurora Solar', 'Enphase Enlighten', 'Sunrun (competitor)']
  },

  {
    id: 'masonry-company',
    industry: 'Construction & Trades',
    niche: 'Masonry Company',
    display_name: 'Masonry Company',
    emoji: '🧱',
    tagline: 'Book more masonry projects with easy estimates and professional follow-up.',
    demo_greeting: "Hi! I'm your AI assistant for a masonry company. I can help with brick, stone, and block work. How can I help?",
    demo_system_prompt: "You are an AI assistant for a masonry company. Help clients with brick, stone, block, and concrete masonry projects. Be knowledgeable about materials and applications.",
    demo_suggested_messages: ["I need a brick retaining wall built", "Can you repair my chimney?", "How much does a stone patio cost?"],
    soul_template: "You are the AI assistant for {{business_name}}, a masonry company. Help clients understand masonry services and schedule estimates. Be knowledgeable about brick, stone, and block work. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. What masonry work do you need?",
    receptionist_system_prompt: "You are the receptionist for a masonry company. Determine: type of work (new build, repair, restoration), materials (brick, stone, block), scope, and timeline. Schedule an on-site estimate.",
    receptionist_faqs: [
      { question: "What types of masonry do you do?", answer: "We work with brick, natural stone, manufactured stone, concrete block, and stucco. We do everything from new construction to repairs and restoration of existing masonry.", category: "services" },
      { question: "Can you repair a cracked chimney?", answer: "Absolutely. We do chimney repair, tuckpointing, crown repair, and full chimney rebuilds. We'll assess the damage and give you a free estimate.", category: "repairs" },
      { question: "How much does a stone wall cost?", answer: "Pricing depends on the type of stone, wall height, and length. Natural stone costs more than manufactured. We offer free on-site estimates to give you an exact price.", category: "pricing" }
    ],
    receptionist_transfer_triggers: ["caller mentions structural damage", "caller has a commercial project", "caller needs emergency chimney repair (leaning or falling bricks)"],
    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your masonry business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'Heritage Masonry', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1008', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Brick Work', 'Stone Veneer', 'Retaining Walls', 'Chimneys', 'Fireplaces', 'Tuckpointing', 'Block Work', 'Stucco', 'Pavers', 'Outdoor Kitchens', 'Restoration'] }
      ]},
      { step_number: 2, title: 'Capabilities', description: 'Your specialties.', fields: [
        { name: 'residential_commercial', label: 'Project types', type: 'multiselect', placeholder: '', required: true, options: ['Residential', 'Commercial', 'Historical Restoration'] },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '7:00 AM - 5:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Estimates', description: 'How you quote.', fields: [
        { name: 'free_estimates', label: 'Free estimates?', type: 'toggle', placeholder: '', required: true },
        { name: 'service_area', label: 'Service area', type: 'text', placeholder: 'Within 40 miles', required: true }
      ]},
      { step_number: 4, title: 'Seasonal Info', description: 'Operating season.', fields: [
        { name: 'seasonal', label: 'Operating season', type: 'select', placeholder: '', required: true, options: ['Year-round', 'Spring through Fall', 'Weather-dependent'] },
        { name: 'warranty', label: 'Workmanship warranty', type: 'text', placeholder: '5-year warranty', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-leads', title: 'New Estimates', description: 'Clients requesting masonry quotes', priority: 1 },
      { id: 'active-jobs', title: 'Active Jobs', description: 'Projects in progress', priority: 2 },
      { id: 'estimates-pending', title: 'Pending Estimates', description: 'Quotes awaiting response', priority: 3 },
      { id: 'weather', title: 'Weather Watch', description: 'Forecast affecting outdoor work', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule estimate', description: 'Homeowner needs chimney repair — schedule on-site visit.', category: 'leads', difficulty: 'automatic' },
      { title: 'Estimate follow-up', description: 'Sent retaining wall quote — check in with homeowner.', category: 'leads', difficulty: 'automatic' },
      { title: 'Material order', description: 'Stone for patio project needs to be ordered this week.', category: 'project-management', difficulty: 'automatic' },
      { title: 'Post-job review request', description: 'Fireplace completed — ask for Google review.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Estimates Given', unit: 'per month', description: 'On-site estimates completed', target_suggestion: 12 },
      { name: 'Close Rate', unit: 'percent', description: 'Estimates that become jobs', target_suggestion: 40 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average project revenue', target_suggestion: 6000 },
      { name: 'Client Satisfaction', unit: 'rating', description: 'Post-job satisfaction score', target_suggestion: 4.8 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages estimate and job schedules', priority: 'essential' },
      { name: 'Jobber', slug: 'jobber', category: 'field-service', why: 'Manages estimates, jobs, and invoicing', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Reviews drive masonry referrals', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Tracks job costs and payments', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'jobber', 'google-business', 'quickbooks'],
    email_templates: [
      { name: 'Estimate Confirmation', subject: 'Your Masonry Estimate — {{business_name}}', body: "Hi {{client_name}},\n\nYour free on-site estimate is scheduled for {{date}} at {{time}}.\n\nWe'll assess the work needed, discuss materials and options, and give you a detailed quote.\n\n{{business_name}}", trigger: 'estimate_booked' },
      { name: 'Job Complete', subject: 'Your Masonry Project is Complete — {{business_name}}', body: "Hi {{client_name}},\n\nYour {{project_type}} is complete! We hope you love the result.\n\nCare tips:\n{{care_instructions}}\n\nIf you're happy with our work, a Google review would mean the world: {{review_link}}\n\n{{business_name}}", trigger: 'job_complete' }
    ],
    sms_templates: [
      { name: 'Estimate Reminder', body: "Hi {{client_name}}, your masonry estimate with {{business_name}} is tomorrow at {{time}}. See you then!", trigger: 'estimate_reminder' },
      { name: 'Crew Arrival', body: "Hi {{client_name}}, our masonry crew will arrive tomorrow between {{arrival_window}} to start your {{project_type}}. Call {{phone}} with questions.", trigger: 'job_start' }
    ],
    estimated_hours_saved_weekly: 9,
    estimated_monthly_value: 2000,
    ideal_plan: 'pro',
    competitor_tools: ['Jobber', 'ServiceTitan', 'Houzz Pro']
  },

  {
    id: 'welding-shop',
    industry: 'Construction & Trades',
    niche: 'Welding Shop',
    display_name: 'Welding & Fabrication Shop',
    emoji: '🔥',
    tagline: 'Quote custom jobs faster and keep your fabrication shop booked solid.',
    demo_greeting: "Hi! I'm your AI assistant for a welding and fabrication shop. I can help with custom projects, repairs, and estimates. How can I help?",
    demo_system_prompt: "You are an AI assistant for a welding and metal fabrication shop. Help clients with custom fabrication projects, repairs, and mobile welding services. Be knowledgeable about materials (steel, aluminum, stainless) and processes (MIG, TIG, stick).",
    demo_suggested_messages: ["I need custom metal railings made", "Can you repair a cracked trailer frame?", "Do you do mobile welding?"],
    soul_template: "You are the AI assistant for {{business_name}}, a welding and fabrication shop. Help clients with custom projects and repairs. Be knowledgeable about metals and welding processes. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. What kind of welding or fabrication work do you need?",
    receptionist_system_prompt: "You are the receptionist for a welding shop. Determine: type of work (custom fab, repair, mobile), material, and scope. Schedule an estimate or shop visit. Ask if they have drawings or photos to share.",
    receptionist_faqs: [
      { question: "Can you make something custom?", answer: "Absolutely! We do custom fabrication — railings, gates, furniture, brackets, you name it. If you have a design or idea, bring it in or email us photos/sketches and we'll give you a quote.", category: "custom" },
      { question: "Do you do mobile welding?", answer: "Yes, we offer mobile welding services for jobs that can't come to the shop — farm equipment, on-site repairs, large structures. There's a trip charge based on distance.", category: "mobile" },
      { question: "What materials do you work with?", answer: "We work with steel, stainless steel, aluminum, and cast iron. We do MIG, TIG, and stick welding depending on the application.", category: "materials" }
    ],
    receptionist_transfer_triggers: ["caller has an emergency repair (broken equipment halting business)", "caller has a large commercial fabrication project", "caller needs certified welding for structural work"],
    wizard_steps: [
      { step_number: 1, title: 'Your Shop', description: 'Tell us about your welding business.', fields: [
        { name: 'business_name', label: 'Shop Name', type: 'text', placeholder: 'Ironworks Welding & Fab', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1009', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Custom Fabrication', 'Welding Repairs', 'Mobile Welding', 'Railings & Handrails', 'Gates & Fences', 'Structural Steel', 'Ornamental Iron', 'Trailer Repair', 'Equipment Repair', 'CNC Cutting'] }
      ]},
      { step_number: 2, title: 'Capabilities', description: 'What can you do?', fields: [
        { name: 'materials', label: 'Materials you work with', type: 'multiselect', placeholder: '', required: true, options: ['Mild Steel', 'Stainless Steel', 'Aluminum', 'Cast Iron', 'Brass/Copper'] },
        { name: 'welding_types', label: 'Welding processes', type: 'multiselect', placeholder: '', required: true, options: ['MIG', 'TIG', 'Stick/Arc', 'Flux-Core'] }
      ]},
      { step_number: 3, title: 'Hours', description: 'When is your shop open?', fields: [
        { name: 'business_hours', label: 'Shop Hours', type: 'time_range', placeholder: '7:00 AM - 5:00 PM', required: true },
        { name: 'emergency_available', label: 'Emergency/after-hours available?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Quotes', description: 'How do you quote projects?', fields: [
        { name: 'quote_process', label: 'How do you prefer to receive project details?', type: 'multiselect', placeholder: '', required: true, options: ['In-person at shop', 'Email with photos/drawings', 'On-site visit', 'Phone description'] },
        { name: 'mobile_range', label: 'Mobile welding service area', type: 'text', placeholder: 'Within 50 miles', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Job Inquiries', description: 'Custom and repair requests', priority: 1 },
      { id: 'shop-schedule', title: 'Shop Schedule', description: 'Jobs in progress and queued', priority: 2 },
      { id: 'quotes-pending', title: 'Pending Quotes', description: 'Estimates awaiting approval', priority: 3 },
      { id: 'mobile-jobs', title: 'Mobile Jobs', description: 'On-site welding appointments', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Quote custom railing', description: 'Client sent photos of stairway — quote custom metal railing.', category: 'quoting', difficulty: 'needs-approval' },
      { title: 'Emergency repair call', description: 'Farm equipment broke — schedule mobile welding ASAP.', category: 'urgent', difficulty: 'automatic' },
      { title: 'Job pickup notification', description: 'Custom gate is done — notify client for pickup.', category: 'delivery', difficulty: 'automatic' },
      { title: 'Quote follow-up', description: 'Sent fabrication quote last week — check in.', category: 'leads', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Job Inquiries', unit: 'per month', description: 'New welding/fab requests', target_suggestion: 20 },
      { name: 'Quote Acceptance', unit: 'percent', description: 'Quotes that become jobs', target_suggestion: 50 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per job', target_suggestion: 1500 },
      { name: 'Shop Utilization', unit: 'percent', description: 'Percentage of available shop time booked', target_suggestion: 80 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages shop schedule and mobile appointments', priority: 'essential' },
      { name: 'Jobber', slug: 'jobber', category: 'field-service', why: 'Quotes, work orders, and invoicing', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Tracks materials, labor, and invoicing', priority: 'recommended' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local visibility for welding searches', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'jobber', 'quickbooks', 'google-business'],
    email_templates: [
      { name: 'Quote Ready', subject: 'Your Welding/Fabrication Quote — {{business_name}}', body: "Hi {{client_name}},\n\nHere's your quote for {{project_description}}:\n\n{{quote_details}}\n\nTimeline: {{estimated_timeline}}\n\nTo move forward, reply to this email or call {{phone}}. We'll schedule your job as soon as we get the go-ahead.\n\n{{business_name}}", trigger: 'quote_sent' },
      { name: 'Job Ready for Pickup', subject: 'Your Project is Done — {{business_name}}', body: "Hi {{client_name}},\n\nYour {{project_description}} is complete and ready for pickup!\n\nShop hours: {{business_hours}}\nAddress: {{address}}\n\nBalance due: {{balance}}\n\nCall {{phone}} if you need delivery arrangements.\n\n{{business_name}}", trigger: 'job_complete' }
    ],
    sms_templates: [
      { name: 'Quote Follow-Up', body: "Hi {{client_name}}, this is {{business_name}}. Just checking in on the welding quote we sent. Any questions? Call/text {{phone}}.", trigger: 'quote_follow_up' },
      { name: 'Ready for Pickup', body: "Hi {{client_name}}, your {{project_description}} is done and ready for pickup at {{business_name}}! Call {{phone}} to arrange pickup or delivery.", trigger: 'ready_for_pickup' }
    ],
    estimated_hours_saved_weekly: 8,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
    competitor_tools: ['Jobber', 'ServiceTitan', 'Invoice Ninja']
  },

  {
    id: 'cabinet-maker',
    industry: 'Construction & Trades',
    niche: 'Cabinet Maker',
    display_name: 'Custom Cabinet Shop',
    emoji: '🪚',
    tagline: 'Showcase your craftsmanship and fill your production schedule with dream projects.',
    demo_greeting: "Hi! I'm your AI assistant for a custom cabinet shop. I can help with design consultations, material options, and scheduling. How can I help?",
    demo_system_prompt: "You are an AI assistant for a custom cabinet maker. Help clients explore custom cabinetry options for kitchens, bathrooms, closets, and built-ins. Be passionate about craftsmanship and quality. Help clients understand the difference between custom, semi-custom, and stock cabinets.",
    demo_suggested_messages: ["I want custom kitchen cabinets", "What wood species do you work with?", "How long does custom cabinetry take?"],
    soul_template: "You are the AI assistant for {{business_name}}, a custom cabinet shop. Help clients explore cabinetry options and schedule design consultations. Be passionate about craftsmanship. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}! I'm the virtual assistant. Are you interested in custom cabinetry?",
    receptionist_system_prompt: "You are the receptionist for a custom cabinet shop. Learn: what room(s) need cabinets, style preferences, budget range, and timeline. Schedule a design consultation. Be enthusiastic about custom work and the value of quality craftsmanship.",
    receptionist_faqs: [
      { question: "How much do custom cabinets cost?", answer: "Custom cabinet pricing depends on the room size, wood species, finish, and hardware. Custom costs more than stock but you get exactly what you want — every detail tailored to your space. We offer free design consultations to give you an accurate quote.", category: "pricing" },
      { question: "How long does it take?", answer: "From design approval to installation, custom cabinets typically take 6-10 weeks to build. We'll give you a specific timeline during your consultation.", category: "timeline" },
      { question: "What makes custom better than stock?", answer: "Custom cabinets are built specifically for your space — no wasted gaps, exact dimensions, your choice of wood, finish, and hardware. They're built to last a lifetime and add significant value to your home.", category: "quality" }
    ],
    receptionist_transfer_triggers: ["caller has a large multi-room project", "caller is a builder with ongoing cabinet needs", "caller wants commercial cabinetry"],
    wizard_steps: [
      { step_number: 1, title: 'Your Shop', description: 'Tell us about your cabinet business.', fields: [
        { name: 'business_name', label: 'Shop Name', type: 'text', placeholder: 'Artisan Cabinet Co.', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1010', required: true },
        { name: 'products', label: 'What do you build?', type: 'multiselect', placeholder: '', required: true, options: ['Kitchen Cabinets', 'Bathroom Vanities', 'Closet Systems', 'Built-In Bookshelves', 'Entertainment Centers', 'Home Office', 'Mudroom Storage', 'Laundry Room', 'Garage Cabinets', 'Commercial Millwork'] }
      ]},
      { step_number: 2, title: 'Materials', description: 'What do you work with?', fields: [
        { name: 'wood_species', label: 'Wood species offered', type: 'multiselect', placeholder: '', required: true, options: ['Maple', 'Cherry', 'Oak', 'Walnut', 'Hickory', 'Alder', 'Birch', 'Painted MDF', 'Thermofoil'] },
        { name: 'finish_options', label: 'Finish options', type: 'multiselect', placeholder: '', required: true, options: ['Natural/Clear Coat', 'Stained', 'Painted', 'Glazed', 'Distressed'] }
      ]},
      { step_number: 3, title: 'Process', description: 'How you work with clients.', fields: [
        { name: 'business_hours', label: 'Office/Showroom Hours', type: 'time_range', placeholder: '8:00 AM - 5:00 PM', required: true },
        { name: 'showroom', label: 'Have a showroom?', type: 'toggle', placeholder: '', required: false },
        { name: '3d_design', label: 'Provide 3D renderings?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Installation', description: 'Do you install?', fields: [
        { name: 'installation', label: 'Handle installation?', type: 'toggle', placeholder: '', required: true },
        { name: 'service_area', label: 'Service area', type: 'text', placeholder: 'Greater Metro area', required: true }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Inquiries', description: 'Clients interested in custom cabinets', priority: 1 },
      { id: 'design-phase', title: 'In Design', description: 'Projects being designed', priority: 2 },
      { id: 'production', title: 'In Production', description: 'Cabinets being built in the shop', priority: 3 },
      { id: 'ready-to-install', title: 'Ready to Install', description: 'Completed cabinets awaiting installation', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule design consultation', description: 'Homeowner wants custom kitchen cabinets — book showroom visit.', category: 'leads', difficulty: 'automatic' },
      { title: 'Design approval', description: 'Send 3D rendering for client approval before production.', category: 'design', difficulty: 'automatic' },
      { title: 'Production update', description: 'Client\'s cabinets are in production — send progress update.', category: 'client-communication', difficulty: 'automatic' },
      { title: 'Schedule installation', description: 'Cabinets are complete — schedule installation date.', category: 'scheduling', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Design Consultations', unit: 'per month', description: 'Initial meetings with potential clients', target_suggestion: 8 },
      { name: 'Close Rate', unit: 'percent', description: 'Consultations that become contracts', target_suggestion: 45 },
      { name: 'Average Project Value', unit: 'dollars', description: 'Average cabinet project revenue', target_suggestion: 12000 },
      { name: 'Production On-Time', unit: 'percent', description: 'Projects completed by shop deadline', target_suggestion: 90 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages consultations, production, and install dates', priority: 'essential' },
      { name: 'Cabinet Vision', slug: 'cabinet-vision', category: 'design', why: 'Cabinet design and CNC integration', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Tracks materials, labor, and invoicing', priority: 'recommended' },
      { name: 'Houzz', slug: 'houzz', category: 'marketing', why: 'Showcase finished cabinetry projects', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'cabinet-vision', 'quickbooks', 'houzz'],
    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Cabinet Design Consultation — {{business_name}}', body: "Hi {{client_name}},\n\nYour design consultation is scheduled for {{date}} at {{time}}.\n\nBefore we meet, think about:\n- Which room(s) need cabinets\n- Style preferences (modern, traditional, shaker, etc.)\n- Any wood/finish preferences\n- Any inspiration photos\n\nWe'll walk you through our showroom, discuss your vision, and start designing.\n\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Cabinets Complete', subject: 'Your Custom Cabinets Are Ready! — {{business_name}}', body: "Hi {{client_name}},\n\nExciting news — your custom cabinets are built and ready for installation!\n\nLet's schedule your install date: {{booking_link}}\nOr call {{phone}}.\n\nInstallation typically takes {{install_duration}}.\n\nWe can't wait for you to see them in your home!\n{{business_name}}", trigger: 'cabinets_ready' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, your cabinet design consultation at {{business_name}} is tomorrow at {{time}}. Bring any inspiration photos you love! See you then.", trigger: 'consultation_reminder' },
      { name: 'Install Day', body: "Hi {{client_name}}, your cabinet installation is tomorrow! Our crew will arrive at {{time}}. Please clear the area. This is going to look amazing! — {{business_name}}", trigger: 'install_reminder' }
    ],
    estimated_hours_saved_weekly: 9,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
    competitor_tools: ['Cabinet Vision', 'Houzz Pro', 'Buildertrend']
  },

  {
    id: 'countertop-company',
    industry: 'Construction & Trades',
    niche: 'Countertop Company',
    display_name: 'Countertop Company',
    emoji: '💎',
    tagline: 'Book more countertop jobs with showroom-quality estimates and fast follow-up.',
    demo_greeting: "Hi! I'm your AI assistant for a countertop company. I can help with material options, estimates, and scheduling. How can I help?",
    demo_system_prompt: "You are an AI assistant for a countertop company. Help clients choose the right countertop material, understand pricing, and schedule estimates. Be knowledgeable about granite, quartz, marble, butcher block, and other options.",
    demo_suggested_messages: ["What's the difference between quartz and granite?", "How much do new countertops cost?", "Do you remove old countertops?"],
    soul_template: "You are the AI assistant for {{business_name}}, a countertop company. Help clients choose the right material and schedule estimates. Be knowledgeable about stone, quartz, and other surfaces. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you looking for new countertops?",
    receptionist_system_prompt: "You are the receptionist for a countertop company. Determine: which room (kitchen, bath, etc.), material preference, approximate linear/sq footage, and timeline. Schedule an estimate or showroom visit.",
    receptionist_faqs: [
      { question: "Quartz vs granite — which is better?", answer: "Both are excellent! Granite is natural stone with unique patterns — no two slabs are alike. Quartz is engineered, non-porous, and never needs sealing. Our showroom has both so you can see and feel the difference.", category: "materials" },
      { question: "How much do countertops cost?", answer: "Pricing depends on the material, square footage, edge profile, and sink cutouts. We offer free in-home measurements and estimates with exact pricing.", category: "pricing" },
      { question: "How long does installation take?", answer: "Once your countertops are fabricated, installation is usually completed in one day. The total timeline from template to install is typically 1-2 weeks.", category: "timeline" }
    ],
    receptionist_transfer_triggers: ["caller has a commercial project", "caller wants rare or exotic stone", "caller mentions a very tight timeline (needs install this week)"],
    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your countertop business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'Prestige Countertops', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 100-1011', required: true },
        { name: 'materials', label: 'Materials you offer', type: 'multiselect', placeholder: '', required: true, options: ['Granite', 'Quartz', 'Marble', 'Quartzite', 'Soapstone', 'Butcher Block', 'Concrete', 'Solid Surface (Corian)', 'Laminate', 'Porcelain'] }
      ]},
      { step_number: 2, title: 'Services', description: 'What you provide.', fields: [
        { name: 'services', label: 'Services included', type: 'multiselect', placeholder: '', required: true, options: ['Free In-Home Measurement', 'Showroom/Slab Yard', 'Old Countertop Removal', 'Sink/Faucet Installation', 'Backsplash Installation', 'Edge Profile Options', 'Seam Matching', 'Commercial Projects'] },
        { name: 'business_hours', label: 'Showroom Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Pricing', description: 'How you quote.', fields: [
        { name: 'pricing_unit', label: 'Pricing unit', type: 'select', placeholder: '', required: true, options: ['Per square foot (installed)', 'Per linear foot', 'Project-based'] },
        { name: 'starting_price', label: 'Starting price per sq ft (installed)', type: 'currency', placeholder: '45', required: true }
      ]},
      { step_number: 4, title: 'Timeline', description: 'How fast can you deliver?', fields: [
        { name: 'typical_timeline', label: 'Template to install timeline', type: 'select', placeholder: '', required: true, options: ['3-5 business days', '1-2 weeks', '2-3 weeks'] },
        { name: 'service_area', label: 'Service area', type: 'text', placeholder: 'Within 60 miles', required: true }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-leads', title: 'New Inquiries', description: 'Clients requesting countertop quotes', priority: 1 },
      { id: 'templates-scheduled', title: 'Templates Scheduled', description: 'In-home measurements this week', priority: 2 },
      { id: 'in-fabrication', title: 'In Fabrication', description: 'Countertops being cut and polished', priority: 3 },
      { id: 'installs-scheduled', title: 'Installations', description: 'Installations scheduled this week', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule showroom visit', description: 'Homeowner wants to see quartz options — book showroom appointment.', category: 'leads', difficulty: 'automatic' },
      { title: 'Template appointment', description: 'Client selected their slab — schedule in-home template measurement.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Fabrication complete', description: 'Countertops ready — schedule installation.', category: 'project-management', difficulty: 'automatic' },
      { title: 'Post-install care guide', description: 'Send care instructions for their new granite countertops.', category: 'client-communication', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Showroom Visits', unit: 'per month', description: 'Clients visiting the showroom or slab yard', target_suggestion: 20 },
      { name: 'Close Rate', unit: 'percent', description: 'Visits that become orders', target_suggestion: 50 },
      { name: 'Average Order Value', unit: 'dollars', description: 'Average countertop order', target_suggestion: 3500 },
      { name: 'Install Satisfaction', unit: 'rating', description: 'Post-install satisfaction score', target_suggestion: 4.9 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages template, fabrication, and install schedules', priority: 'essential' },
      { name: 'Moraware', slug: 'moraware', category: 'countertop-management', why: 'Industry-specific scheduling and job management', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Reviews and visibility for "countertops near me"', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Invoicing and payment tracking', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'moraware', 'google-business', 'quickbooks'],
    email_templates: [
      { name: 'Showroom Invitation', subject: 'Visit Our Showroom — {{business_name}}', body: "Hi {{client_name}},\n\nWe'd love to show you our selection! Your showroom visit is confirmed:\n\nDate: {{date}}\nTime: {{time}}\nAddress: {{address}}\n\nYou'll be able to see and touch hundreds of slabs, choose your exact slab, and get a quote on the spot.\n\nBring your cabinet color sample or a photo of your kitchen — it helps with matching!\n\n{{business_name}}", trigger: 'showroom_booked' },
      { name: 'Install Complete', subject: 'Your New Countertops Are Installed! — {{business_name}}', body: "Hi {{client_name}},\n\nYour new {{material}} countertops are installed! We hope you love them.\n\nCare tips:\n{{care_instructions}}\n\nIf you love them, please leave us a review: {{review_link}}\n\nEnjoy your beautiful new countertops!\n{{business_name}}", trigger: 'install_complete' }
    ],
    sms_templates: [
      { name: 'Showroom Reminder', body: "Hi {{client_name}}, your showroom visit at {{business_name}} is tomorrow at {{time}}. Bring a cabinet sample or kitchen photo for matching! See you there.", trigger: 'showroom_reminder' },
      { name: 'Install Day', body: "Hi {{client_name}}, your countertop installation is tomorrow! Our team will arrive at {{time}}. Please clear countertops and disconnect your sink/faucet. Call {{phone}} with questions.", trigger: 'install_reminder' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
    competitor_tools: ['Moraware', 'Jobber', 'Stone Profits']
  },

  {
    id: 'septic-service',
    industry: 'Construction & Trades',
    niche: 'Septic Service',
    display_name: 'Septic Service Company',
    emoji: '🚽',
    tagline: 'Keep your trucks rolling with automated reminders and emergency dispatch.',
    demo_greeting: "Hi! I'm your AI assistant for a septic service company. I can help with pumping schedules, inspections, and emergencies. How can I help?",
    demo_system_prompt: "You are an AI assistant for a septic service company. Help homeowners schedule septic pumping, understand maintenance, and handle emergencies. If someone reports sewage backup or overflow, treat it as urgent.",
    demo_suggested_messages: ["I need my septic tank pumped", "How often should I pump my septic?", "I have sewage backing up into my house!"],
    soul_template: "You are the AI assistant for {{business_name}}, a septic service company. Help homeowners with pumping schedules and maintenance. If someone reports a sewage backup, overflow, or sewage smell, treat as URGENT and connect them immediately. Business hours: {{business_hours}}. Emergency line: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Do you need septic service, or is this an emergency?",
    receptionist_system_prompt: "You are the receptionist for a septic service company. FIRST determine if this is an emergency (sewage backup, overflow, strong odor). If yes, escalate immediately. For routine calls: determine service needed (pumping, inspection, repair, install), approximate tank size, and when it was last pumped. Schedule the service.",
    receptionist_faqs: [
      { question: "How often should I pump my septic tank?", answer: "For most households, every 3-5 years. It depends on your household size and tank size. We can put you on an automatic reminder schedule so you never forget.", category: "maintenance" },
      { question: "How much does septic pumping cost?", answer: "Pumping costs depend on your tank size and accessibility. We give you a price before we come out — no surprises.", category: "pricing" },
      { question: "My drains are slow — is it my septic?", answer: "It could be. Slow drains, gurgling sounds, or wet spots in your yard can all be signs your tank needs pumping or service. Let's schedule a visit to check it out.", category: "symptoms" }
    ],
    receptionist_transfer_triggers: ["sewage backing up into the home", "sewage overflow in the yard", "septic system alarm going off", "strong sewage odor inside the home"],
    wizard_steps: [
      { step_number: 1, title: 'Your Company', description: 'Tell us about your septic business.', fields: [
        { name: 'business_name', label: 'Company Name', type: 'text', placeholder: 'CleanFlow Septic Services', required: true },
        { name: 'phone', label: 'Main Phone / Emergency Line', type: 'phone', placeholder: '(555) 100-1012', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Septic Pumping', 'Septic Inspection', 'Septic Installation', 'Septic Repair', 'Drain Field Repair/Replacement', 'Grease Trap Service', 'Porta-Potty Rental', 'Sewer Line Cleaning', 'Real Estate Inspections'] }
      ]},
      { step_number: 2, title: 'Availability', description: 'When can clients reach you?', fields: [
        { name: 'business_hours', label: 'Regular Hours', type: 'time_range', placeholder: '7:00 AM - 5:00 PM', required: true },
        { name: 'emergency_service', label: '24/7 emergency service?', type: 'toggle', placeholder: '', required: true },
        { name: 'service_area', label: 'Service area', type: 'text', placeholder: 'Within 50 miles', required: true }
      ]},
      { step_number: 3, title: 'Pricing', description: 'How you charge.', fields: [
        { name: 'pumping_price', label: 'Standard pumping price (1000 gallon tank)', type: 'currency', placeholder: '350', required: true },
        { name: 'inspection_price', label: 'Inspection price', type: 'currency', placeholder: '250', required: false }
      ]},
      { step_number: 4, title: 'Reminders', description: 'Do you remind clients about service?', fields: [
        { name: 'reminder_service', label: 'Send pumping reminders?', type: 'toggle', placeholder: '', required: true, help_text: 'Automatically remind clients when their tank is due for pumping' },
        { name: 'reminder_frequency', label: 'Default reminder frequency', type: 'select', placeholder: '', required: false, options: ['Every 2 years', 'Every 3 years', 'Every 5 years', 'Custom per client'] }
      ]}
    ],
    dashboard_widgets: [
      { id: 'emergencies', title: 'Emergency Calls', description: 'Urgent septic emergencies', priority: 1 },
      { id: 'todays-schedule', title: "Today's Schedule", description: 'Pumping and service appointments', priority: 2 },
      { id: 'reminders-due', title: 'Reminders Due', description: 'Clients due for regular pumping', priority: 3 },
      { id: 'new-requests', title: 'New Requests', description: 'Incoming service requests', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule pumping', description: 'Homeowner is overdue for septic pumping — book appointment.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Pumping reminder', description: 'Client\'s tank was last pumped 3 years ago — send reminder.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Emergency dispatch', description: 'Sewage backup — dispatch nearest truck immediately.', category: 'urgent', difficulty: 'automatic' },
      { title: 'Post-service follow-up', description: 'Pumping completed — send care tips and set next reminder.', category: 'client-communication', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Jobs Per Day', unit: 'per day', description: 'Average pumping/service jobs per day', target_suggestion: 4 },
      { name: 'Reminder Response Rate', unit: 'percent', description: 'Clients who schedule after receiving a reminder', target_suggestion: 40 },
      { name: 'Emergency Response Time', unit: 'hours', description: 'Average time to respond to emergencies', target_suggestion: 2 },
      { name: 'Repeat Client Rate', unit: 'percent', description: 'Clients who use you again', target_suggestion: 80 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages daily route and appointments', priority: 'essential' },
      { name: 'ServiceTitan', slug: 'servicetitan', category: 'field-service', why: 'Dispatching, invoicing, and customer management', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Tracks revenue and expenses per job', priority: 'recommended' },
      { name: 'Google Maps', slug: 'google-maps', category: 'routing', why: 'Optimizes daily truck routes', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'servicetitan', 'quickbooks', 'google-maps'],
    email_templates: [
      { name: 'Service Confirmation', subject: 'Your Septic Service Appointment — {{business_name}}', body: "Hi {{client_name}},\n\nYour septic service is scheduled:\n\nDate: {{date}}\nService: {{service_type}}\nEstimated Arrival: {{arrival_window}}\n\nPlease make sure the septic tank lid is accessible. If it's buried, let us know so we can plan accordingly.\n\n{{business_name}}", trigger: 'service_booked' },
      { name: 'Pumping Reminder', subject: 'Time to Pump Your Septic Tank — {{business_name}}', body: "Hi {{client_name}},\n\nIt's been {{years}} years since your last septic pumping. Regular pumping prevents costly backups and repairs.\n\nSchedule your pumping: {{booking_link}}\nOr call: {{phone}}\n\nDon't wait for a problem — preventive maintenance saves you money!\n\n{{business_name}}", trigger: 'pumping_reminder' }
    ],
    sms_templates: [
      { name: 'Service Reminder', body: "Hi {{client_name}}, your septic service with {{business_name}} is tomorrow. Please make sure the tank lid is accessible. Our truck will arrive between {{arrival_window}}. Call {{phone}} with questions.", trigger: 'service_reminder' },
      { name: 'Pumping Due', body: "Hi {{client_name}}, it's been {{years}} years since your last septic pumping. Time to schedule! Call {{phone}} or book online: {{booking_link}}. — {{business_name}}", trigger: 'pumping_due' }
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2400,
    ideal_plan: 'pro',
    competitor_tools: ['ServiceTitan', 'Jobber', 'Service Fusion']
  }
];
