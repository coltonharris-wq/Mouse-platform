import type { ProTemplate } from '../schema';

export const homeServicesTemplates: ProTemplate[] = [
  // ─── 1. PLUMBER ───
  {
    id: 'plumber',
    industry: 'Home Services',
    niche: 'Plumber',
    display_name: 'Plumber',
    emoji: '🔧',
    tagline: 'Your AI dispatcher that answers emergency calls, books service, and keeps your trucks rolling.',
    demo_greeting: "Hey! I'm Mouse, your AI plumbing dispatcher. I handle emergency calls 24/7, book service appointments, send estimates, and follow up on jobs. Want to see how I'd handle a midnight burst pipe call?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a plumbing business. Show how you handle emergency calls (burst pipes, overflows, gas leaks) with urgency, plus routine service booking. Be calm and efficient. For emergencies, always ask if they've shut off the water and if there's an immediate safety concern. For gas leaks: tell them to leave the house and call 911.",
    demo_suggested_messages: ['My pipe just burst!', 'I need a water heater replaced', 'My toilet keeps running', 'How much to fix a leaky faucet?'],
    soul_template: "You are Mouse, the AI dispatcher for {{business_name}}. You help {{owner_name}} run their plumbing business by taking emergency calls, booking service appointments, sending estimates, and following up. For emergencies: ask if they've shut off water, assess severity, and dispatch immediately. For gas leaks: tell them to evacuate and call 911. Service area: {{service_area}}. Phone: {{phone}}. Available: {{business_hours}}.",
    receptionist_greeting: "{{business_name}}, this is Mouse. Do you have a plumbing emergency or need to schedule service? I'm here to help.",
    receptionist_system_prompt: "You are Mouse, the AI dispatcher for {{business_name}}, a plumbing company. EMERGENCY PROTOCOL: For burst pipes/flooding, ask if they shut off the main water valve and dispatch immediately. For gas smell, tell them to evacuate and call 911 FIRST. For routine service, book appointments and provide general pricing. Transfer to the plumber for complex estimates, commercial jobs, or complaints.",
    receptionist_faqs: [
      { question: 'How much to fix a leaky faucet?', answer: "A faucet repair is typically {{faucet_repair_price}}. If the faucet needs replacing, it's {{faucet_replace_price}} plus the cost of the fixture. We can give you an exact quote on-site.", category: 'pricing' },
      { question: 'How much for a water heater?', answer: "A standard tank water heater replacement runs {{water_heater_price}} installed. Tankless units start at {{tankless_price}}. We can assess your situation and recommend the best option.", category: 'pricing' },
      { question: 'Do you charge for estimates?', answer: "We charge a {{service_call_fee}} service call fee which covers the trip and diagnosis. If you go ahead with the repair, it's applied to the total.", category: 'pricing' },
      { question: 'Do you offer emergency service?', answer: "Yes — we're available {{availability}} for plumbing emergencies. Emergency rates may apply after regular business hours.", category: 'services' },
      { question: 'Are you licensed and insured?', answer: "Absolutely. We're fully licensed, bonded, and insured. License #{{license_number}}.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['gas leak — tell them to evacuate first', 'commercial plumbing contract', 'complaint about previous work', 'insurance claim related to water damage', 'requesting the owner or specific plumber'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your plumbing business.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: "Joe's Plumbing", required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Joe Martinez', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0001', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Dallas/Fort Worth metro', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your core services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Leak Repair', 'Drain Cleaning', 'Water Heater', 'Sewer Line', 'Faucet/Fixture', 'Toilet Repair', 'Garbage Disposal', 'Pipe Repair', 'Gas Lines', 'Repiping', 'Sump Pump', 'Water Filtration'] },
        { name: 'service_call_fee', label: 'Service Call Fee', type: 'currency', placeholder: '89', required: true },
        { name: 'business_hours', label: 'Regular Hours', type: 'time_range', placeholder: 'Mon-Fri 7am-6pm', required: true },
        { name: 'availability', label: 'Emergency Availability', type: 'select', placeholder: 'Select', required: true, options: ['24/7', 'Extended hours (6am-10pm)', 'Regular hours only'] }
      ]},
      { step_number: 3, title: 'Pricing Info', description: 'Common pricing for quotes.', fields: [
        { name: 'faucet_repair_price', label: 'Faucet Repair Price Range', type: 'text', placeholder: '$125-$225', required: false },
        { name: 'water_heater_price', label: 'Water Heater Install Range', type: 'text', placeholder: '$1,200-$2,000', required: false },
        { name: 'license_number', label: 'License Number', type: 'text', placeholder: 'PLB-12345', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "You're ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.joesplumbing.com', required: false },
        { name: 'faucet_replace_price', label: 'Faucet Replacement Range', type: 'text', placeholder: '$200-$400 + fixture', required: false },
        { name: 'tankless_price', label: 'Tankless Water Heater Range', type: 'text', placeholder: '$2,500-$4,500', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-jobs', title: "Today's Jobs", description: 'All scheduled service calls for today.', priority: 1 },
      { id: 'emergency-queue', title: 'Emergency Queue', description: 'Urgent calls requiring immediate dispatch.', priority: 2 },
      { id: 'pending-estimates', title: 'Pending Estimates', description: 'Estimates awaiting customer approval.', priority: 3 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue from completed jobs this week.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up on pending estimate', description: 'Check in on estimates not approved in 48 hours.', category: 'sales', difficulty: 'automatic' },
      { title: 'Send seasonal maintenance reminder', description: 'Remind customers about winterizing pipes or water heater flush.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Request review after completed job', description: 'Send review request 24 hours after service.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Dispatch plumber for emergency', description: 'Assign nearest available plumber to emergency call.', category: 'operations', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Jobs Per Day', unit: 'count', description: 'Service calls completed per day.', target_suggestion: 6 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per job.', target_suggestion: 350 },
      { name: 'Estimate Conversion Rate', unit: 'percentage', description: 'Estimates that become jobs.', target_suggestion: 65 },
      { name: 'Emergency Response Time', unit: 'minutes', description: 'Average response time for emergencies.', target_suggestion: 45 }
    ],
    suggested_integrations: [
      { name: 'ServiceTitan', slug: 'servicetitan', category: 'field-service', why: 'Industry-leading field service management for plumbers.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up when people search "plumber near me."', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track job costs and profitability.', priority: 'recommended' },
      { name: 'Google Maps', slug: 'google-maps', category: 'dispatch', why: 'Route optimization and ETA tracking.', priority: 'recommended' }
    ],
    integration_priority: ['servicetitan', 'google-business', 'quickbooks', 'google-maps'],
    email_templates: [
      { name: 'Estimate Ready', subject: 'Your Plumbing Estimate — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your estimate for the plumbing work we discussed:\n\n{{estimate_details}}\n\nTotal: {{estimate_total}}\n\nApprove online: {{estimate_link}}\nOr call us: {{phone}}\n\nThis estimate is valid for 30 days.\n\n— {{business_name}}", trigger: 'estimate_created' },
      { name: 'Job Complete', subject: 'Your Plumbing Service is Complete — {{business_name}}', body: "Hi {{customer_name}},\n\nYour plumbing service has been completed:\n\n{{job_summary}}\n\nTotal: {{invoice_total}}\n\nAll work is backed by our {{warranty_period}} warranty.\n\nThank you for choosing {{business_name}}!\n\nIf you have a moment: {{review_link}}\n\n— {{business_name}}", trigger: 'job_completed' }
    ],
    sms_templates: [
      { name: 'On the Way', body: "{{business_name}} here — your plumber {{tech_name}} is on the way! ETA: {{eta}}. They'll be in a {{truck_description}}.", trigger: 'tech_dispatched' },
      { name: 'Job Complete', body: "Your plumbing service from {{business_name}} is complete. Total: {{invoice_total}}. Thank you, {{customer_name}}!", trigger: 'job_completed' },
      { name: 'Review Request', body: "Thanks for choosing {{business_name}}, {{customer_name}}! A quick review helps us a lot: {{review_link}}", trigger: 'review_request_24h' }
    ],
    estimated_hours_saved_weekly: 18,
    estimated_monthly_value: 4000,
    ideal_plan: 'growth',
    competitor_tools: ['ServiceTitan', 'Housecall Pro', 'Jobber', 'FieldEdge']
  },

  // ─── 2. ELECTRICIAN ───
  {
    id: 'electrician',
    industry: 'Home Services',
    niche: 'Electrician',
    display_name: 'Electrician',
    emoji: '⚡',
    tagline: 'Your AI dispatcher that books electrical service, handles emergency calls, and keeps jobs organized.',
    demo_greeting: "Hi! I'm Mouse, your AI electrical service dispatcher. I handle emergency calls, book appointments, and keep your crew organized. Want to see how I'd handle a customer with no power in half their house?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for an electrical company. Handle emergency calls (power outages, sparking outlets, burning smell) with safety first. For burning smells or sparking: tell them to turn off the breaker and call 911 if needed. For routine work, book service and give general pricing.",
    demo_suggested_messages: ['Half my house has no power', 'I need new outlets installed', 'My breaker keeps tripping', 'How much to upgrade my panel?'],
    soul_template: "You are Mouse, the AI dispatcher for {{business_name}}. You help {{owner_name}} run their electrical business by handling emergency calls, booking service, sending estimates, and following up. SAFETY FIRST: For burning smells or sparking, tell them to shut off the breaker. For exposed wires or shock hazards, keep people away. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "{{business_name}}, this is Mouse. Do you have an electrical emergency or need to schedule service?",
    receptionist_system_prompt: "You are Mouse, the AI dispatcher for {{business_name}}, an electrical company. SAFETY: Burning smell/sparks → turn off breaker, call 911 if fire. Exposed wires → keep everyone away. Shock injury → call 911. For routine work, book appointments and provide general pricing. Transfer to electrician for panel upgrades, commercial bids, or code violations.",
    receptionist_faqs: [
      { question: 'How much to install an outlet?', answer: "A standard outlet installation is {{outlet_price}}. GFCI outlets (for kitchens/bathrooms) are {{gfci_price}}. If new wiring needs to be run, it may be more.", category: 'pricing' },
      { question: 'How much for a panel upgrade?', answer: "A panel upgrade from 100 to 200 amps typically runs {{panel_upgrade_price}}. We'll assess your current setup and give you an exact quote.", category: 'pricing' },
      { question: 'My breaker keeps tripping. Is that dangerous?', answer: "A tripping breaker means a circuit is overloaded or there could be a wiring issue. Don't keep resetting it — that's your panel protecting you. Let us come take a look.", category: 'services' },
      { question: 'Are you licensed?', answer: "Yes — fully licensed, bonded, and insured. License #{{license_number}}.", category: 'general' },
      { question: 'Do you do ceiling fans?', answer: "Absolutely! Ceiling fan installation is {{fan_price}}. If there's no existing electrical box, we'll install one.", category: 'pricing' }
    ],
    receptionist_transfer_triggers: ['fire or burning smell — tell them to cut breaker and call 911', 'electrical shock injury — call 911', 'commercial electrical bid', 'code violation notice', 'generator installation consultation'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your electrical business.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Bright Spark Electric', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Tom Harris', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0002', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Metro Phoenix area', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'What electrical work do you do?', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Outlet/Switch Install', 'Panel Upgrade', 'Ceiling Fan', 'Lighting', 'Whole House Rewiring', 'EV Charger', 'Generator Install', 'Troubleshooting', 'Smoke Detectors', 'Surge Protection', 'Landscape Lighting', 'Commercial'] },
        { name: 'service_call_fee', label: 'Service Call Fee', type: 'currency', placeholder: '89', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 7am-5pm', required: true },
        { name: 'emergency_service', label: 'Offer Emergency Service?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 3, title: 'Pricing', description: 'Common pricing for quotes.', fields: [
        { name: 'outlet_price', label: 'Outlet Install Price', type: 'text', placeholder: '$150-$250', required: false },
        { name: 'panel_upgrade_price', label: 'Panel Upgrade Price Range', type: 'text', placeholder: '$1,800-$3,000', required: false },
        { name: 'license_number', label: 'License Number', type: 'text', placeholder: 'ELEC-12345', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready to go!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.brightsparkelectric.com', required: false },
        { name: 'gfci_price', label: 'GFCI Outlet Price', type: 'text', placeholder: '$175-$300', required: false },
        { name: 'fan_price', label: 'Ceiling Fan Install Price', type: 'text', placeholder: '$150-$350', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-jobs', title: "Today's Jobs", description: 'Scheduled electrical jobs for today.', priority: 1 },
      { id: 'pending-estimates', title: 'Pending Estimates', description: 'Estimates awaiting approval.', priority: 2 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue from completed jobs.', priority: 3 },
      { id: 'emergency-calls', title: 'Emergency Calls', description: 'After-hours emergency call log.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up on estimate', description: 'Check in on pending estimates after 48 hours.', category: 'sales', difficulty: 'automatic' },
      { title: 'Send seasonal safety tip', description: 'Email customers about electrical safety for holidays/storms.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review request after completed job.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Dispatch electrician', description: 'Assign available electrician to service call.', category: 'operations', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Jobs Per Day', unit: 'count', description: 'Service calls completed per day.', target_suggestion: 5 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per job.', target_suggestion: 400 },
      { name: 'Estimate Conversion', unit: 'percentage', description: 'Estimates that convert to jobs.', target_suggestion: 60 },
      { name: 'Customer Satisfaction', unit: 'percentage', description: 'Customers rating 4+ stars.', target_suggestion: 95 }
    ],
    suggested_integrations: [
      { name: 'ServiceTitan', slug: 'servicetitan', category: 'field-service', why: 'Field service management for electrical contractors.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up in "electrician near me" searches.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track financials and job costing.', priority: 'recommended' },
      { name: 'Google Maps', slug: 'google-maps', category: 'dispatch', why: 'Route optimization for service calls.', priority: 'recommended' }
    ],
    integration_priority: ['servicetitan', 'google-business', 'quickbooks', 'google-maps'],
    email_templates: [
      { name: 'Estimate', subject: 'Your Electrical Estimate — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your estimate for the electrical work discussed:\n\n{{estimate_details}}\nTotal: {{estimate_total}}\n\nApprove: {{estimate_link}}\nCall: {{phone}}\n\nValid for 30 days.\n\n— {{business_name}}", trigger: 'estimate_created' },
      { name: 'Job Complete', subject: 'Electrical Work Complete — {{business_name}}', body: "Hi {{customer_name}},\n\nYour electrical service is complete. {{job_summary}}\n\nTotal: {{invoice_total}}\n\nAll work meets code and carries our {{warranty_period}} warranty.\n\nReview: {{review_link}}\n\n— {{business_name}}", trigger: 'job_completed' }
    ],
    sms_templates: [
      { name: 'On the Way', body: "{{business_name}} — your electrician {{tech_name}} is on the way. ETA: {{eta}}.", trigger: 'tech_dispatched' },
      { name: 'Job Complete', body: "Your electrical service from {{business_name}} is complete. Total: {{invoice_total}}. Thank you!", trigger: 'job_completed' },
      { name: 'Review Request', body: "Thanks for choosing {{business_name}}! A quick review helps: {{review_link}}", trigger: 'review_request_24h' }
    ],
    estimated_hours_saved_weekly: 16,
    estimated_monthly_value: 3800,
    ideal_plan: 'growth',
    competitor_tools: ['ServiceTitan', 'Housecall Pro', 'Jobber', 'FieldEdge']
  },

  // ─── 3. HVAC ───
  {
    id: 'hvac',
    industry: 'Home Services',
    niche: 'HVAC',
    display_name: 'HVAC',
    emoji: '❄️',
    tagline: 'Your AI dispatcher that handles emergency AC/heat calls, books tune-ups, and sells maintenance plans.',
    demo_greeting: "Hey! I'm Mouse, your AI HVAC dispatcher. I handle emergency no-heat and no-AC calls, book seasonal tune-ups, and sell maintenance plans. Want to see how I'd handle a customer whose AC just died in July?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for an HVAC company. Handle emergency calls (no heat in winter, no AC in summer) with urgency. Be empathetic about comfort issues. For gas/carbon monoxide smell: evacuate and call 911. Help with routine maintenance booking and system questions.",
    demo_suggested_messages: ['My AC stopped working', 'I need a furnace tune-up', 'How much for a new AC unit?', 'My heater smells like gas'],
    soul_template: "You are Mouse, the AI dispatcher for {{business_name}}. You help {{owner_name}} manage their HVAC business by handling emergency calls, booking tune-ups, selling maintenance plans, and following up. SAFETY: Gas smell → evacuate, call 911. Carbon monoxide alarm → evacuate, call 911. No heat with elderly/infants → treat as priority. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "{{business_name}}, this is Mouse. Is your heating or AC not working, or do you need to schedule service?",
    receptionist_system_prompt: "You are Mouse, the AI dispatcher for {{business_name}}, an HVAC company. EMERGENCY: Gas smell or CO alarm → evacuate, call 911. No heat with elderly/infants/medical needs → priority dispatch. For routine service, book tune-ups and maintenance. Transfer to technician for system sizing, replacement quotes, or commercial jobs.",
    receptionist_faqs: [
      { question: 'How much for a new AC unit?', answer: "A new AC system typically runs {{ac_install_price}} installed, depending on the size of your home. We offer free in-home estimates and financing options.", category: 'pricing' },
      { question: 'How often should I get a tune-up?', answer: "Twice a year is ideal — once in spring for AC and once in fall for heating. Our maintenance plan covers both for {{maintenance_plan_price}}/year.", category: 'services' },
      { question: 'My AC is blowing warm air. What should I check?', answer: "First, check your thermostat settings and make sure it's on 'cool.' Then check your air filter — a clogged filter is the #1 cause. If those are fine, give us a call and we'll send someone out.", category: 'troubleshooting' },
      { question: 'Do you offer financing?', answer: "Yes! We partner with {{financing_partner}} for affordable monthly payments on new systems. Many customers pay as little as {{monthly_payment}} per month.", category: 'billing' },
      { question: 'How long does a replacement take?', answer: "Most AC or furnace replacements are completed in one day. Larger or more complex installations might take two days.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['gas smell — evacuate first then call 911', 'carbon monoxide alarm — evacuate and call 911', 'commercial HVAC bid', 'new construction install consultation', 'complaint about a recent repair'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your HVAC business.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Cool Comfort HVAC', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Mark Thompson', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0003', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Houston metro area', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Your HVAC services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select services', required: true, options: ['AC Repair', 'AC Installation', 'Furnace Repair', 'Furnace Installation', 'Heat Pump', 'Ductwork', 'Indoor Air Quality', 'Thermostat Install', 'Maintenance Plans', 'Mini-Split', 'Commercial HVAC'] },
        { name: 'service_call_fee', label: 'Service Call Fee', type: 'currency', placeholder: '89', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 7am-6pm', required: true },
        { name: 'emergency_available', label: '24/7 Emergency Service?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 3, title: 'Pricing', description: 'Key pricing info.', fields: [
        { name: 'ac_install_price', label: 'AC Install Price Range', type: 'text', placeholder: '$4,000-$8,000', required: false },
        { name: 'maintenance_plan_price', label: 'Annual Maintenance Plan Price', type: 'currency', placeholder: '199', required: false },
        { name: 'financing_partner', label: 'Financing Partner', type: 'text', placeholder: 'Synchrony, GreenSky', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.coolcomforthvac.com', required: false },
        { name: 'monthly_payment', label: 'Lowest Monthly Payment Example', type: 'text', placeholder: '$89/month', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-calls', title: "Today's Service Calls", description: 'Scheduled HVAC calls for today.', priority: 1 },
      { id: 'emergency-queue', title: 'Emergency Queue', description: 'Urgent no-heat/no-AC calls.', priority: 2 },
      { id: 'maintenance-plans', title: 'Maintenance Plans', description: 'Active plans and upcoming tune-ups.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue from service, installs, and plans.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send seasonal tune-up reminder', description: 'Remind customers to schedule spring AC or fall heating tune-up.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Follow up on replacement estimate', description: 'Check in on pending system replacement estimates.', category: 'sales', difficulty: 'automatic' },
      { title: 'Maintenance plan renewal reminder', description: 'Alert customers when their plan is due for renewal.', category: 'billing', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review request after service.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Service Calls Per Day', unit: 'count', description: 'HVAC service calls completed daily.', target_suggestion: 6 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per service call.', target_suggestion: 400 },
      { name: 'Active Maintenance Plans', unit: 'count', description: 'Total active maintenance agreements.', target_suggestion: 200 },
      { name: 'Replacement Close Rate', unit: 'percentage', description: 'System replacement estimates that close.', target_suggestion: 40 }
    ],
    suggested_integrations: [
      { name: 'ServiceTitan', slug: 'servicetitan', category: 'field-service', why: 'The #1 platform for HVAC businesses.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up in "HVAC near me" searches.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track job costs and profitability.', priority: 'recommended' },
      { name: 'Synchrony Financial', slug: 'synchrony', category: 'financing', why: 'Offer customer financing on new systems.', priority: 'recommended' }
    ],
    integration_priority: ['servicetitan', 'google-business', 'quickbooks', 'synchrony'],
    email_templates: [
      { name: 'Seasonal Tune-Up', subject: "Time for Your {{season}} HVAC Tune-Up — {{business_name}}", body: "Hi {{customer_name}},\n\n{{season}} is coming! A quick tune-up now prevents breakdowns when you need your system most.\n\nTune-up: {{tuneup_price}}\nMaintenance plan members: FREE\n\nBook now: {{booking_link}}\n\n— {{business_name}}", trigger: 'seasonal_reminder' },
      { name: 'System Estimate', subject: 'Your HVAC System Estimate — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your estimate for a new HVAC system:\n\n{{estimate_details}}\nTotal: {{estimate_total}}\n\nFinancing available: as low as {{monthly_payment}}/month.\n\nApprove: {{estimate_link}}\n\n— {{business_name}}", trigger: 'estimate_created' }
    ],
    sms_templates: [
      { name: 'Tech En Route', body: "{{business_name}} — your HVAC tech {{tech_name}} is on the way. ETA: {{eta}}.", trigger: 'tech_dispatched' },
      { name: 'Seasonal Reminder', body: "Hi {{customer_name}}, {{season}} is here! Schedule your HVAC tune-up at {{business_name}}: {{booking_link}}", trigger: 'seasonal_reminder' },
      { name: 'Review Request', body: "Thanks for choosing {{business_name}}, {{customer_name}}! A review helps us grow: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 18,
    estimated_monthly_value: 4200,
    ideal_plan: 'growth',
    competitor_tools: ['ServiceTitan', 'Housecall Pro', 'FieldEdge', 'Jobber']
  },

  // ─── 4. ROOFER ───
  {
    id: 'roofer',
    industry: 'Home Services',
    niche: 'Roofer',
    display_name: 'Roofer',
    emoji: '🏠',
    tagline: 'Your AI estimator that books roof inspections, follows up on estimates, and manages storm damage leads.',
    demo_greeting: "Hey! I'm Mouse, your AI roofing assistant. I book inspections, follow up on estimates, and manage storm damage leads. Want to see how I'd handle a homeowner who found a leak after a storm?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a roofing company. Help homeowners with roof inspections, storm damage assessment, and general roofing questions. Be empathetic about storm damage and leaks. Recommend a free inspection for any concern.",
    demo_suggested_messages: ['I found a leak after the storm', 'How much for a new roof?', 'Do you work with insurance?', 'I need a free roof inspection'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} manage their roofing company by booking inspections, following up on estimates, managing storm leads, and handling insurance-related questions. You're empathetic about roof problems and knowledgeable about the process. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Do you need a roof inspection, have storm damage, or have a question? I'm here to help.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a roofing company. Book free inspections, explain the roofing process, answer insurance questions, and manage storm damage inquiries. For active leaks, offer emergency tarp service if available. Transfer to the owner for insurance adjuster meetings, commercial bids, or complaints.",
    receptionist_faqs: [
      { question: 'How much for a new roof?', answer: "A new roof depends on size, materials, and pitch. For a typical home, it ranges from {{roof_price_range}}. We offer free inspections and detailed estimates — no obligation.", category: 'pricing' },
      { question: 'Do you work with insurance?', answer: "Absolutely. We work with all insurance companies on storm damage claims. We'll meet with your adjuster, document everything, and help you get the coverage you're entitled to.", category: 'insurance' },
      { question: 'How long does a roof replacement take?', answer: "Most residential roofs are completed in 1-3 days, depending on size and weather. We'll give you a specific timeline with your estimate.", category: 'services' },
      { question: 'Do you offer free inspections?', answer: "Yes! We provide free roof inspections with a detailed report. No obligation, no pressure. Just honest information about your roof's condition.", category: 'services' },
      { question: 'What roofing materials do you offer?', answer: "We install {{materials}}. Each has different lifespans and price points. We'll help you choose the best option for your budget and goals.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['active leak needing emergency tarp', 'insurance adjuster meeting scheduling', 'commercial roofing bid', 'complaint about previous work', 'structural damage concern'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your roofing business.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Apex Roofing', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Dan Rodriguez', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0004', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Denver metro and Front Range', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'What roofing services do you offer?', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Roof Replacement', 'Roof Repair', 'Storm Damage', 'Insurance Claims', 'Inspections', 'Gutters', 'Siding', 'Emergency Tarp', 'Commercial Roofing', 'Flat Roof'] },
        { name: 'materials', label: 'Materials Offered', type: 'text', placeholder: 'Asphalt shingle, metal, tile, flat', required: true },
        { name: 'roof_price_range', label: 'Typical Roof Price Range', type: 'text', placeholder: '$8,000-$15,000', required: false },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 7am-6pm', required: true }
      ]},
      { step_number: 3, title: 'Insurance & Financing', description: 'How do you handle insurance?', fields: [
        { name: 'works_with_insurance', label: 'Work With Insurance Claims?', type: 'toggle', placeholder: '', required: true },
        { name: 'financing_available', label: 'Offer Financing?', type: 'toggle', placeholder: '', required: false },
        { name: 'warranty', label: 'Workmanship Warranty', type: 'select', placeholder: 'Select', required: true, options: ['Lifetime', '25 years', '10 years', '5 years'] }
      ]},
      { step_number: 4, title: 'Go Live', description: "You're ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.apexroofing.com', required: false },
        { name: 'license_number', label: 'License Number', type: 'text', placeholder: 'ROO-12345', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'inspection-schedule', title: 'Inspection Schedule', description: 'Upcoming roof inspections.', priority: 1 },
      { id: 'pending-estimates', title: 'Pending Estimates', description: 'Estimates awaiting homeowner approval.', priority: 2 },
      { id: 'active-jobs', title: 'Active Jobs', description: 'Roof jobs in progress.', priority: 3 },
      { id: 'storm-leads', title: 'Storm Damage Leads', description: 'Recent storm damage inquiries.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up on roof estimate', description: 'Check in on estimates not approved in 5 days.', category: 'sales', difficulty: 'automatic' },
      { title: 'Send post-storm outreach', description: 'Text customers in storm-affected areas about free inspections.', category: 'marketing', difficulty: 'needs-approval' },
      { title: 'Request review after job', description: 'Ask for a review after roof completion.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Schedule insurance adjuster meeting', description: 'Coordinate meeting between homeowner, adjuster, and your team.', category: 'operations', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Inspections Per Week', unit: 'count', description: 'Roof inspections completed weekly.', target_suggestion: 15 },
      { name: 'Estimate Close Rate', unit: 'percentage', description: 'Estimates that convert to signed contracts.', target_suggestion: 35 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per roofing job.', target_suggestion: 10000 },
      { name: 'Monthly Revenue', unit: 'dollars', description: 'Total monthly revenue.', target_suggestion: 80000 }
    ],
    suggested_integrations: [
      { name: 'AccuLynx', slug: 'acculynx', category: 'crm', why: 'CRM built specifically for roofing contractors.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up in local roofing searches.', priority: 'essential' },
      { name: 'CompanyCam', slug: 'companycam', category: 'field', why: 'Photo documentation for inspections and jobs.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track job costs and profitability.', priority: 'recommended' }
    ],
    integration_priority: ['acculynx', 'google-business', 'companycam', 'quickbooks'],
    email_templates: [
      { name: 'Inspection Report', subject: 'Your Roof Inspection Report — {{business_name}}', body: "Hi {{customer_name}},\n\nThank you for letting us inspect your roof. Here's our findings:\n\n{{inspection_summary}}\n\n{{recommendation}}\n\nEstimate: {{estimate_total}}\nView full report: {{report_link}}\n\nQuestions? Call {{phone}}.\n\n— {{business_name}}", trigger: 'inspection_completed' },
      { name: 'Storm Follow-Up', subject: 'Storm Damage? Free Roof Inspection — {{business_name}}', body: "Hi {{customer_name}},\n\nRecent storms may have damaged your roof. Even small damage can lead to costly leaks if not addressed.\n\nWe're offering free storm damage inspections in your area. Schedule yours: {{booking_link}}\n\n— {{business_name}}", trigger: 'storm_outreach' }
    ],
    sms_templates: [
      { name: 'Inspection Reminder', body: "Hi {{customer_name}}, reminder: your roof inspection with {{business_name}} is tomorrow at {{time}}. No need to be home — we'll send you the report!", trigger: 'inspection_reminder' },
      { name: 'Estimate Follow-Up', body: "Hi {{customer_name}}, checking in on your roof estimate from {{business_name}}. Any questions? Ready to schedule? Call {{phone}} or reply here.", trigger: 'estimate_followup' },
      { name: 'Review Request', body: "Thanks for choosing {{business_name}}, {{customer_name}}! Your new roof looks great. A review helps us a lot: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 16,
    estimated_monthly_value: 5000,
    ideal_plan: 'growth',
    competitor_tools: ['AccuLynx', 'JobNimbus', 'Roofr', 'SumoQuote']
  },

  // ─── 5. PAINTER ───
  {
    id: 'painter',
    industry: 'Home Services',
    niche: 'Painter',
    display_name: 'House Painter',
    emoji: '🎨',
    tagline: 'Your AI estimator that books paint jobs, sends proposals, and fills your crew\'s schedule.',
    demo_greeting: "Hi! I'm Mouse, your AI painting assistant. I book estimates, send professional proposals, and keep your crew busy. Want to see how I'd handle a homeowner looking to repaint their exterior?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a residential and commercial painting company. Help customers with interior and exterior painting estimates, color consultations, and scheduling. Be knowledgeable about paint types, prep work, and timelines.",
    demo_suggested_messages: ['I need my house exterior painted', 'How much to paint a bedroom?', 'Do you do color consultations?', 'How long does exterior painting take?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} manage their painting business by booking estimates, sending proposals, scheduling crews, and following up with customers. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Need a painting estimate or have a question about our services? I'd love to help.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a painting company. Book free estimates, explain services, and answer general pricing questions. Transfer to the owner for commercial bids, color consultations, or complaints.",
    receptionist_faqs: [
      { question: 'How much to paint a room?', answer: "A standard bedroom (10x12) typically costs {{room_price}}. Larger rooms, vaulted ceilings, or extensive prep work may be more. We always provide a free estimate first.", category: 'pricing' },
      { question: 'How much for exterior painting?', answer: "Exterior painting depends on your home's size, condition, and paint type. A typical home runs {{exterior_price_range}}. We offer free estimates with no obligation.", category: 'pricing' },
      { question: 'How long does it take to paint a house exterior?', answer: "Most homes take 3-5 days for exterior painting, depending on size and weather. Interior rooms are typically 1-2 days each.", category: 'services' },
      { question: 'Do you do the prep work?', answer: "Absolutely — proper prep is the key to a great paint job. We handle pressure washing, scraping, sanding, caulking, and priming as needed.", category: 'services' },
      { question: 'What paint brands do you use?', answer: "We use {{paint_brands}}. We're happy to use a specific brand if you prefer.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['commercial painting bid', 'cabinet painting consultation', 'complaint about previous work', 'color consultation request', 'HOA or multi-unit project'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your painting business.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Fresh Coat Painting', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Carlos Mendez', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0005', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Austin metro area', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'What painting services do you offer?', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Interior Painting', 'Exterior Painting', 'Cabinet Painting', 'Deck/Fence Staining', 'Pressure Washing', 'Drywall Repair', 'Color Consultation', 'Commercial Painting', 'Wallpaper Removal', 'Popcorn Ceiling Removal'] },
        { name: 'room_price', label: 'Standard Room Price Range', type: 'text', placeholder: '$300-$500', required: false },
        { name: 'paint_brands', label: 'Paint Brands Used', type: 'text', placeholder: 'Sherwin-Williams, Benjamin Moore', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 7am-5pm, Sat 8am-2pm', required: true }
      ]},
      { step_number: 3, title: 'Estimates', description: 'How you handle estimates.', fields: [
        { name: 'free_estimates', label: 'Offer Free Estimates?', type: 'toggle', placeholder: '', required: true },
        { name: 'exterior_price_range', label: 'Typical Exterior Price Range', type: 'text', placeholder: '$3,000-$7,000', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.freshcoatpainting.com', required: false },
        { name: 'license_number', label: 'License/Insurance #', type: 'text', placeholder: 'PTR-12345', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'estimate-schedule', title: 'Upcoming Estimates', description: 'Scheduled estimate appointments.', priority: 1 },
      { id: 'active-jobs', title: 'Active Jobs', description: 'Current painting projects in progress.', priority: 2 },
      { id: 'pending-proposals', title: 'Pending Proposals', description: 'Proposals awaiting customer approval.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue from completed jobs.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up on painting estimate', description: 'Check in on proposals not approved in 5 days.', category: 'sales', difficulty: 'automatic' },
      { title: 'Send seasonal painting reminder', description: 'Remind homeowners about spring exterior painting.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Request review after job', description: 'Ask for a review after painting is complete.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Send project update photos', description: 'Share progress photos during multi-day jobs.', category: 'operations', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Estimates Per Week', unit: 'count', description: 'Painting estimates given per week.', target_suggestion: 10 },
      { name: 'Close Rate', unit: 'percentage', description: 'Estimates that convert to jobs.', target_suggestion: 45 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per painting job.', target_suggestion: 3000 },
      { name: 'Crew Utilization', unit: 'percentage', description: 'Percentage of work days with active jobs.', target_suggestion: 85 }
    ],
    suggested_integrations: [
      { name: 'Jobber', slug: 'jobber', category: 'field-service', why: 'Estimating, scheduling, and invoicing for painters.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local painter search visibility.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track job costs and profit margins.', priority: 'recommended' },
      { name: 'CompanyCam', slug: 'companycam', category: 'field', why: 'Before/after photos for every project.', priority: 'recommended' }
    ],
    integration_priority: ['jobber', 'google-business', 'quickbooks', 'companycam'],
    email_templates: [
      { name: 'Painting Proposal', subject: 'Your Painting Estimate — {{business_name}}', body: "Hi {{customer_name}},\n\nThank you for having us out! Here's your painting proposal:\n\n{{proposal_details}}\nTotal: {{estimate_total}}\n\nIncludes: all prep, {{coats}} coats of {{paint_brand}}, and cleanup.\n\nApprove: {{estimate_link}}\n\n— {{business_name}}", trigger: 'estimate_created' },
      { name: 'Job Complete', subject: 'Your Painting Project is Complete! — {{business_name}}', body: "Hi {{customer_name}},\n\nYour painting project is complete! We hope you love the results.\n\n{{job_summary}}\n\nTotal: {{invoice_total}}\n\nReview: {{review_link}}\n\n— {{business_name}}", trigger: 'job_completed' }
    ],
    sms_templates: [
      { name: 'Estimate Reminder', body: "Hi {{customer_name}}, reminder: your painting estimate with {{business_name}} is tomorrow at {{time}}. See you then!", trigger: 'estimate_reminder' },
      { name: 'Crew Arriving', body: "Good morning {{customer_name}}! The {{business_name}} crew will arrive at {{time}} to start your painting project. Questions? Call {{phone}}.", trigger: 'job_start_day' },
      { name: 'Review Request', body: "Hi {{customer_name}}, we hope you love your freshly painted space! A review helps us grow: {{review_link}} — {{business_name}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 3000,
    ideal_plan: 'pro',
    competitor_tools: ['Jobber', 'Housecall Pro', 'PaintScout', 'Estimate Rocket']
  },

  // ─── 6. LANDSCAPER ───
  {
    id: 'landscaper',
    industry: 'Home Services',
    niche: 'Landscaper',
    display_name: 'Landscaper',
    emoji: '🌿',
    tagline: 'Your AI office manager that books lawn care, sends seasonal reminders, and manages recurring clients.',
    demo_greeting: "Hey! I'm Mouse, your AI landscaping assistant. I book lawn service, manage recurring clients, and send seasonal reminders. Want to see how I'd onboard a new weekly mowing customer?",
    demo_system_prompt: "You are Mouse, an AI demo for a landscaping/lawn care company. Book recurring and one-time services, explain packages, and answer seasonal care questions. Be outdoorsy and helpful.",
    demo_suggested_messages: ['How much for weekly lawn mowing?', 'I need my yard cleaned up for spring', 'Do you do landscape design?', 'Can you trim my hedges?'],
    soul_template: "You are Mouse, the AI office manager for {{business_name}}. You help {{owner_name}} run their landscaping business by booking services, managing recurring clients, sending seasonal reminders, and keeping crews scheduled. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Need lawn care, landscaping, or have a question? I can help.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a landscaping company. Book lawn care, explain service packages, and handle recurring schedule questions. Transfer to the owner for landscape design consultations, commercial contracts, or complaints.",
    receptionist_faqs: [
      { question: 'How much for weekly mowing?', answer: "Weekly mowing starts at {{mowing_price}} per visit for a standard residential yard. Price depends on lot size. We'll give you an exact quote after a quick look at your property.", category: 'pricing' },
      { question: 'What does your maintenance package include?', answer: "Our standard maintenance includes mowing, edging, blowing, and trimming for {{maintenance_price}}/visit. We also offer full-service packages with fertilization and weed control.", category: 'services' },
      { question: 'Do you do spring/fall cleanups?', answer: "Yes! Spring cleanup (debris removal, bed prep, mulching) starts at {{cleanup_price}}. Fall cleanup (leaf removal, winterizing) is similar.", category: 'services' },
      { question: 'Do you do landscape design?', answer: "We do! From simple bed designs to full yard transformations. We'll come out for a free consultation to discuss your vision and budget.", category: 'services' },
      { question: 'Are you licensed and insured?', answer: "Yes — fully licensed and insured for your protection.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['landscape design consultation', 'commercial property contract', 'irrigation system install', 'complaint about service quality', 'HOA or property management account'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your landscaping business.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Green Thumb Landscaping', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Miguel Sanchez', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0006', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Nashville metro', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'What services do you offer?', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Lawn Mowing', 'Edging/Trimming', 'Mulching', 'Spring/Fall Cleanup', 'Hedge Trimming', 'Leaf Removal', 'Fertilization', 'Weed Control', 'Landscape Design', 'Sod Installation', 'Irrigation', 'Hardscaping'] },
        { name: 'mowing_price', label: 'Weekly Mowing Starting Price', type: 'currency', placeholder: '40', required: true },
        { name: 'maintenance_price', label: 'Full Maintenance Starting Price', type: 'currency', placeholder: '60', required: false },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 7am-5pm, Sat 8am-1pm', required: true }
      ]},
      { step_number: 3, title: 'Scheduling', description: 'How you manage clients.', fields: [
        { name: 'service_days', label: 'Service Days', type: 'multiselect', placeholder: 'Select days', required: true, options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        { name: 'cleanup_price', label: 'Spring/Fall Cleanup Starting Price', type: 'currency', placeholder: '250', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.greenthumblandscaping.com', required: false },
        { name: 'crew_count', label: 'Number of Crews', type: 'number', placeholder: '3', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-route', title: "Today's Route", description: 'Properties scheduled for service today.', priority: 1 },
      { id: 'recurring-clients', title: 'Recurring Clients', description: 'All active recurring service clients.', priority: 2 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue from all services this week.', priority: 3 },
      { id: 'seasonal-leads', title: 'New Leads', description: 'Recent service inquiries to follow up.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send spring cleanup promotion', description: 'Email customers about spring yard cleanup.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Remind clients of seasonal service changes', description: 'Notify about switch to biweekly or winter pause.', category: 'operations', difficulty: 'automatic' },
      { title: 'Follow up on landscape estimate', description: 'Check in on pending landscaping proposals.', category: 'sales', difficulty: 'automatic' },
      { title: 'Request review', description: 'Ask for review after first month of service.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Active Recurring Clients', unit: 'count', description: 'Total clients on recurring service.', target_suggestion: 80 },
      { name: 'Revenue Per Route Day', unit: 'dollars', description: 'Average revenue per crew per day.', target_suggestion: 1200 },
      { name: 'Client Retention Rate', unit: 'percentage', description: 'Clients who renew for the next season.', target_suggestion: 85 },
      { name: 'Average Monthly Client Value', unit: 'dollars', description: 'Average monthly revenue per client.', target_suggestion: 200 }
    ],
    suggested_integrations: [
      { name: 'Jobber', slug: 'jobber', category: 'field-service', why: 'Scheduling, invoicing, and route management for landscapers.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local landscaping search visibility.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track seasonal revenue and expenses.', priority: 'recommended' },
      { name: 'Google Maps', slug: 'google-maps', category: 'routing', why: 'Optimize daily service routes.', priority: 'recommended' }
    ],
    integration_priority: ['jobber', 'google-business', 'quickbooks', 'google-maps'],
    email_templates: [
      { name: 'Service Proposal', subject: 'Your Landscaping Proposal — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your custom landscaping proposal:\n\n{{proposal_details}}\n\nMonthly cost: {{monthly_total}}\n\nApprove: {{proposal_link}}\n\n— {{business_name}}", trigger: 'proposal_created' },
      { name: 'Seasonal Reminder', subject: "{{season}} is Here — {{business_name}}", body: "Hi {{customer_name}},\n\n{{season}} means it's time for {{seasonal_service}}! Let us get your yard in shape.\n\nBook: {{booking_link}}\n\n— {{business_name}}", trigger: 'seasonal_reminder' }
    ],
    sms_templates: [
      { name: 'Service Day Notice', body: "Hi {{customer_name}}, the {{business_name}} crew will be at your property today. No need to be home — we'll let you know when we're done!", trigger: 'service_day_morning' },
      { name: 'Service Complete', body: "{{customer_name}}, your lawn service from {{business_name}} is done for today. Your yard looks great! See you next week.", trigger: 'service_completed' },
      { name: 'Review Request', body: "Enjoying your yard, {{customer_name}}? A quick review for {{business_name}} helps us grow: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3200,
    ideal_plan: 'growth',
    competitor_tools: ['Jobber', 'LMN', 'Service Autopilot', 'Aspire']
  },

  // ─── 7. PEST CONTROL ───
  {
    id: 'pest-control',
    industry: 'Home Services',
    niche: 'Pest Control',
    display_name: 'Pest Control',
    emoji: '🐛',
    tagline: 'Your AI scheduler that books treatments, sells recurring plans, and keeps customers pest-free.',
    demo_greeting: "Hi! I'm Mouse, your AI pest control assistant. I book treatments, sell recurring plans, and handle those panicked calls about bugs. Want to see how I'd handle someone who just found termites?",
    demo_system_prompt: "You are Mouse, an AI demo for a pest control company. Book treatments, sell maintenance plans, and answer pest questions. Be reassuring — people calling about bugs are often stressed. Be knowledgeable about common pests.",
    demo_suggested_messages: ['I think I have termites', 'How much for monthly pest control?', 'I have ants in my kitchen', 'Do you treat for bed bugs?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} manage their pest control business by booking treatments, selling recurring plans, answering pest questions, and keeping customers on schedule. Be reassuring — pests stress people out. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "{{business_name}}, this is Mouse! Got a pest problem or need to schedule service? I can help.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a pest control company. Book treatments, explain service plans, and help identify pest concerns. Be reassuring. Transfer to tech for termite inspections, bed bug heat treatment consultations, or wildlife removal.",
    receptionist_faqs: [
      { question: 'How much for monthly pest control?', answer: "Our recurring pest control plan is {{monthly_price}}/month or {{quarterly_price}}/quarter. It covers {{covered_pests}}. First treatment includes a thorough inspection.", category: 'pricing' },
      { question: 'I think I have termites. What do I do?', answer: "Don't panic — we'll come out for a free termite inspection. Termites are treatable, but it's important to act quickly. Let me schedule an inspection for you.", category: 'services' },
      { question: 'Is the treatment safe for my kids and pets?', answer: "Yes — we use EPA-approved products and follow strict safety protocols. We'll let you know exactly how long to stay out of treated areas (usually 1-2 hours once dry).", category: 'safety' },
      { question: 'Do you do bed bugs?', answer: "Yes. Bed bug treatment starts at {{bedbug_price}}. We offer both chemical and heat treatments. An inspection is the first step.", category: 'pricing' },
      { question: 'How often do you come?', answer: "Our standard plan is {{frequency}}. For severe infestations, we may recommend more frequent initial treatments.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['termite inspection scheduling', 'bed bug heat treatment', 'wildlife removal', 'commercial pest control contract', 'complaint about treatment effectiveness'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your pest control business.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Shield Pest Control', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Randy Cooper', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0007', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Orlando metro', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your pest control services.', fields: [
        { name: 'pests_treated', label: 'Pests Treated', type: 'multiselect', placeholder: 'Select', required: true, options: ['Ants', 'Roaches', 'Spiders', 'Termites', 'Bed Bugs', 'Mosquitoes', 'Rodents', 'Wasps/Bees', 'Fleas/Ticks', 'Silverfish', 'Scorpions', 'Wildlife'] },
        { name: 'monthly_price', label: 'Monthly Plan Price', type: 'currency', placeholder: '45', required: true },
        { name: 'quarterly_price', label: 'Quarterly Plan Price', type: 'currency', placeholder: '120', required: false },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 7am-5pm, Sat 8am-12pm', required: true }
      ]},
      { step_number: 3, title: 'Plans', description: 'Your service plans.', fields: [
        { name: 'covered_pests', label: 'Pests Covered in Standard Plan', type: 'text', placeholder: 'Ants, roaches, spiders, wasps, silverfish', required: true },
        { name: 'frequency', label: 'Standard Service Frequency', type: 'select', placeholder: 'Select', required: true, options: ['Monthly', 'Bi-monthly', 'Quarterly'] },
        { name: 'bedbug_price', label: 'Bed Bug Treatment Starting Price', type: 'currency', placeholder: '500', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.shieldpestcontrol.com', required: false },
        { name: 'license_number', label: 'License Number', type: 'text', placeholder: 'PCT-12345', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-route', title: "Today's Route", description: 'Properties scheduled for treatment today.', priority: 1 },
      { id: 'recurring-plans', title: 'Active Plans', description: 'All active recurring pest control plans.', priority: 2 },
      { id: 'pending-inspections', title: 'Pending Inspections', description: 'Termite and specialty inspections to schedule.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue from plans and one-time treatments.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send treatment reminder', description: 'Remind customers of their upcoming service visit.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Follow up after initial treatment', description: 'Check in 2 weeks after first treatment to assess results.', category: 'operations', difficulty: 'automatic' },
      { title: 'Seasonal pest alert', description: 'Send tips about seasonal pest activity (mosquitoes in summer, rodents in winter).', category: 'marketing', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review request after service.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Active Plans', unit: 'count', description: 'Total active recurring pest control plans.', target_suggestion: 300 },
      { name: 'Monthly Recurring Revenue', unit: 'dollars', description: 'MRR from pest control plans.', target_suggestion: 15000 },
      { name: 'Plan Retention Rate', unit: 'percentage', description: 'Plans that renew month-over-month.', target_suggestion: 92 },
      { name: 'Treatments Per Day', unit: 'count', description: 'Average treatments completed per tech per day.', target_suggestion: 8 }
    ],
    suggested_integrations: [
      { name: 'PestRoutes', slug: 'pestroutes', category: 'field-service', why: 'Industry-leading pest control field management.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local pest control search visibility.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track recurring revenue and expenses.', priority: 'recommended' },
      { name: 'Google Maps', slug: 'google-maps', category: 'routing', why: 'Optimize daily service routes.', priority: 'recommended' }
    ],
    integration_priority: ['pestroutes', 'google-business', 'quickbooks', 'google-maps'],
    email_templates: [
      { name: 'Service Report', subject: 'Your Pest Control Service Report — {{business_name}}', body: "Hi {{customer_name}},\n\nYour pest control service is complete:\n\n{{service_report}}\n\nNext visit: {{next_visit_date}}\n\nIf you notice any pest activity before then, contact us — retreatment between visits is covered under your plan.\n\n— {{business_name}}", trigger: 'service_completed' },
      { name: 'Plan Welcome', subject: 'Welcome to {{business_name}} Pest Protection', body: "Hi {{customer_name}},\n\nYou're now protected! Your {{plan_name}} plan covers {{covered_pests}}.\n\nFrequency: {{frequency}}\nNext visit: {{next_visit_date}}\n\nBetween visits, if you see any covered pests, just call — we'll come back at no extra charge.\n\n— {{business_name}}", trigger: 'plan_activated' }
    ],
    sms_templates: [
      { name: 'Treatment Reminder', body: "Hi {{customer_name}}, your {{business_name}} pest treatment is scheduled for tomorrow. No need to be home — we'll treat exterior areas. Questions? {{phone}}", trigger: 'service_reminder' },
      { name: 'Service Complete', body: "{{customer_name}}, your pest treatment from {{business_name}} is done. Service report sent to your email. Next visit: {{next_visit_date}}.", trigger: 'service_completed' },
      { name: 'Review Request', body: "Enjoying a pest-free home? A review for {{business_name}} helps others find us: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3500,
    ideal_plan: 'growth',
    competitor_tools: ['PestRoutes', 'FieldRoutes', 'PestPac', 'Briostack']
  },

  // ─── 8. CLEANING SERVICE ───
  {
    id: 'cleaning-service',
    industry: 'Home Services',
    niche: 'Cleaning Service',
    display_name: 'Cleaning Service',
    emoji: '🧹',
    tagline: 'Your AI booking manager that schedules cleanings, manages recurring clients, and fills your teams\' calendars.',
    demo_greeting: "Hi! I'm Mouse, your AI cleaning service manager. I book cleanings, manage recurring clients, and keep your teams busy. Want to see how I'd onboard a new biweekly cleaning customer?",
    demo_system_prompt: "You are Mouse, an AI demo for a residential cleaning service. Help clients book one-time or recurring cleanings, understand service options, and get pricing. Be friendly and detail-oriented.",
    demo_suggested_messages: ['How much for a house cleaning?', 'I need a deep clean before a party', 'Do you do move-out cleanings?', 'Can I get biweekly service?'],
    soul_template: "You are Mouse, the AI booking manager for {{business_name}}. You help {{owner_name}} run their cleaning business by booking services, managing recurring schedules, handling quotes, and keeping teams full. Business hours: {{business_hours}}. Service area: {{service_area}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Need a cleaning or have a question? I'd love to help.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a residential cleaning service. Book one-time and recurring cleanings, provide pricing, and answer service questions. Transfer to the owner for commercial contracts, complaints, or large event cleanings.",
    receptionist_faqs: [
      { question: 'How much for a house cleaning?', answer: "A standard cleaning for a {{typical_size}} starts at {{standard_price}}. Deep cleans start at {{deep_clean_price}}. Recurring clients get {{recurring_discount}} off. Exact pricing depends on home size and condition.", category: 'pricing' },
      { question: 'What does a standard cleaning include?', answer: "Standard cleaning covers all rooms: dusting, vacuuming, mopping, kitchen (counters, sink, appliances), bathrooms (toilet, shower, mirrors), and general tidying.", category: 'services' },
      { question: 'What about a deep clean?', answer: "Deep cleaning adds inside oven, inside fridge, baseboards, inside cabinets, window sills, ceiling fans, and detailed scrubbing. Great for first-time clients or seasonal refreshes.", category: 'services' },
      { question: 'Do you bring your own supplies?', answer: "Yes! We bring all cleaning supplies and equipment. If you have preferred products or have allergy concerns, just let us know.", category: 'general' },
      { question: 'Are you insured?', answer: "Yes — fully insured and bonded. Our cleaners are background-checked employees, not independent contractors.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['commercial cleaning contract', 'complaint about cleaning quality', 'damage claim', 'event or large venue cleaning', 'asking about employment'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your cleaning business.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Sparkle Clean', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Rosa Hernandez', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0008', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'San Antonio area', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your cleaning options.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Standard Clean', 'Deep Clean', 'Move In/Out Clean', 'Post-Construction', 'Office Cleaning', 'Airbnb Turnover', 'Window Cleaning', 'Carpet Cleaning', 'Recurring Service'] },
        { name: 'standard_price', label: 'Standard Clean Starting Price', type: 'currency', placeholder: '150', required: true },
        { name: 'deep_clean_price', label: 'Deep Clean Starting Price', type: 'currency', placeholder: '250', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-5pm, Sat 9am-2pm', required: true }
      ]},
      { step_number: 3, title: 'Recurring Service', description: 'Your recurring options.', fields: [
        { name: 'recurring_options', label: 'Recurring Frequencies', type: 'multiselect', placeholder: 'Select', required: true, options: ['Weekly', 'Biweekly', 'Monthly'] },
        { name: 'recurring_discount', label: 'Recurring Client Discount', type: 'text', placeholder: '10%', required: false },
        { name: 'typical_size', label: 'Typical Home Size for Base Price', type: 'text', placeholder: '2-3 bedroom home', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.sparkleclean.com', required: false },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'info@sparkleclean.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-schedule', title: "Today's Schedule", description: 'All cleaning jobs for today by team.', priority: 1 },
      { id: 'recurring-clients', title: 'Recurring Clients', description: 'Active recurring cleaning schedules.', priority: 2 },
      { id: 'pending-quotes', title: 'Pending Quotes', description: 'Quotes awaiting client approval.', priority: 3 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue from all cleaning jobs.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send cleaning day reminder', description: 'Remind clients about tomorrow\'s scheduled cleaning.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Request review after cleaning', description: 'Send review request after service.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Send deep clean promotion', description: 'Email clients about seasonal deep cleaning specials.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Follow up on quote', description: 'Check in on unanswered quotes after 3 days.', category: 'sales', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Active Recurring Clients', unit: 'count', description: 'Clients on recurring cleaning schedules.', target_suggestion: 60 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per cleaning job.', target_suggestion: 175 },
      { name: 'Client Retention', unit: 'percentage', description: 'Recurring clients retained month-over-month.', target_suggestion: 90 },
      { name: 'Teams Utilized', unit: 'percentage', description: 'Percentage of team-days with full schedules.', target_suggestion: 85 }
    ],
    suggested_integrations: [
      { name: 'ZenMaid', slug: 'zenmaid', category: 'industry', why: 'Purpose-built scheduling for cleaning services.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local cleaning service search visibility.', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Online booking payments and recurring billing.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track revenue and payroll.', priority: 'recommended' }
    ],
    integration_priority: ['zenmaid', 'google-business', 'stripe', 'quickbooks'],
    email_templates: [
      { name: 'Cleaning Quote', subject: 'Your Cleaning Quote — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your custom cleaning quote:\n\nService: {{service_type}}\nHome: {{home_details}}\nPrice: {{quote_total}}\n{{recurring_note}}\n\nBook: {{booking_link}}\n\n— {{business_name}}", trigger: 'quote_created' },
      { name: 'Service Complete', subject: 'Your Home is Sparkling! — {{business_name}}', body: "Hi {{customer_name}},\n\nYour cleaning is complete! We hope you love walking into a fresh, clean home.\n\nNext cleaning: {{next_date}}\n\nReview: {{review_link}}\n\n— {{business_name}}", trigger: 'service_completed' }
    ],
    sms_templates: [
      { name: 'Cleaning Reminder', body: "Hi {{customer_name}}, your {{business_name}} cleaning is scheduled for tomorrow. Any special requests? Reply here or call {{phone}}.", trigger: 'service_reminder' },
      { name: 'Team Arriving', body: "Good morning {{customer_name}}! Your {{business_name}} cleaning team is on the way. They'll arrive around {{time}}.", trigger: 'team_dispatched' },
      { name: 'Review Request', body: "Hi {{customer_name}}, enjoy that clean house! A quick review for {{business_name}} helps a lot: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3000,
    ideal_plan: 'growth',
    competitor_tools: ['ZenMaid', 'Launch27', 'Housecall Pro', 'Maid Central']
  },

  // ─── 9. HANDYMAN ───
  {
    id: 'handyman',
    industry: 'Home Services',
    niche: 'Handyman',
    display_name: 'Handyman',
    emoji: '🔨',
    tagline: 'Your AI assistant that books odd jobs, sends quotes, and keeps your schedule packed.',
    demo_greeting: "Hey! I'm Mouse, your AI handyman assistant. I book repair jobs, send quotes, and manage your packed schedule. Want to see how I'd handle a customer with a list of small repairs?",
    demo_system_prompt: "You are Mouse, an AI demo for a handyman service. Help customers with home repair estimates, scheduling, and general questions. Be versatile and practical — handymen fix everything.",
    demo_suggested_messages: ['I need shelves hung', 'My door is sticking', 'Can you fix drywall holes?', 'How much do you charge per hour?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} run their handyman service by booking jobs, sending quotes, managing the schedule, and following up. You handle a wide variety of home repairs and improvements. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "{{business_name}}, this is Mouse! What needs fixing? I can get you scheduled.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a handyman service. Book repair and improvement jobs, provide hourly rate or estimate, and manage scheduling. Be versatile. Transfer to the handyman for complex structural work, plumbing/electrical beyond minor fixes, or complaints.",
    receptionist_faqs: [
      { question: 'How much do you charge?', answer: "Our rate is {{hourly_rate}}/hour with a {{minimum_charge}} minimum. For larger projects, we provide a flat-rate estimate upfront. Most small repairs take 1-2 hours.", category: 'pricing' },
      { question: 'What kind of work do you do?', answer: "Just about anything around the house! {{services_summary}}. If you're not sure whether we can handle it, just ask.", category: 'services' },
      { question: 'Can you give me a quote over the phone?', answer: "For simple jobs, yes! For larger projects, we prefer to see the work first to give you an accurate price. A site visit is free.", category: 'pricing' },
      { question: 'Are you licensed and insured?', answer: "Yes — fully insured for your protection. We're licensed for general handyman work.", category: 'general' },
      { question: 'Can I give you a list of things to fix?', answer: "Absolutely! We love to-do lists. Send us your list and we'll give you a time estimate and quote for everything at once — usually saves you money.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['major structural work', 'permit-required electrical/plumbing', 'complaint about previous work', 'commercial property maintenance contract', 'insurance claim work'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your handyman service.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: "Bob's Handyman Service", required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Bob Williams', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0009', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Portland metro', required: true }
      ]},
      { step_number: 2, title: 'Services & Rates', description: 'What you do and charge.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Drywall Repair', 'Painting', 'Shelving/Mounting', 'Door/Window Repair', 'Furniture Assembly', 'Tile Repair', 'Caulking', 'Gutter Cleaning', 'Deck Repair', 'Minor Plumbing', 'Minor Electrical', 'Fence Repair', 'Pressure Washing'] },
        { name: 'hourly_rate', label: 'Hourly Rate', type: 'currency', placeholder: '75', required: true },
        { name: 'minimum_charge', label: 'Minimum Charge', type: 'currency', placeholder: '100', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-5pm', required: true }
      ]},
      { step_number: 3, title: 'Your Approach', description: 'How you work.', fields: [
        { name: 'services_summary', label: 'How Would You Describe Your Services?', type: 'textarea', placeholder: 'Drywall, painting, mounting TVs, assembling furniture, minor plumbing and electrical...', required: true },
        { name: 'free_estimates', label: 'Offer Free On-Site Estimates?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.bobshandyman.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-jobs', title: "Today's Jobs", description: 'Scheduled repair jobs for today.', priority: 1 },
      { id: 'pending-quotes', title: 'Pending Quotes', description: 'Quotes awaiting approval.', priority: 2 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue from completed jobs.', priority: 3 },
      { id: 'repeat-clients', title: 'Repeat Clients', description: 'Returning customers to prioritize.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up on quote', description: 'Check in on pending quotes after 3 days.', category: 'sales', difficulty: 'automatic' },
      { title: 'Send seasonal maintenance checklist', description: 'Email homeowners about seasonal home maintenance.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review request after job completion.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Invoice completed job', description: 'Generate and send invoice after work is done.', category: 'billing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Jobs Per Week', unit: 'count', description: 'Total jobs completed per week.', target_suggestion: 15 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per job.', target_suggestion: 200 },
      { name: 'Quote Conversion Rate', unit: 'percentage', description: 'Quotes that become jobs.', target_suggestion: 70 },
      { name: 'Repeat Client Rate', unit: 'percentage', description: 'Jobs from returning customers.', target_suggestion: 50 }
    ],
    suggested_integrations: [
      { name: 'Jobber', slug: 'jobber', category: 'field-service', why: 'Quote, schedule, and invoice from one platform.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local handyman search visibility.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track income and expenses.', priority: 'recommended' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manage your daily job schedule.', priority: 'recommended' }
    ],
    integration_priority: ['jobber', 'google-business', 'quickbooks', 'google-calendar'],
    email_templates: [
      { name: 'Job Quote', subject: 'Your Repair Quote — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your quote for the work discussed:\n\n{{job_details}}\nEstimated time: {{estimated_hours}} hours\nTotal: {{quote_total}}\n\nApprove and schedule: {{quote_link}}\n\n— {{business_name}}", trigger: 'quote_created' },
      { name: 'Job Complete', subject: 'Repairs Done! — {{business_name}}', body: "Hi {{customer_name}},\n\nAll done! Here's a summary:\n\n{{job_summary}}\nTotal: {{invoice_total}}\n\nGot more things on the honey-do list? We're always here to help.\n\nReview: {{review_link}}\n\n— {{business_name}}", trigger: 'job_completed' }
    ],
    sms_templates: [
      { name: 'On the Way', body: "{{business_name}} here — I'm heading to your place now. ETA about {{eta}}. See you soon!", trigger: 'en_route' },
      { name: 'Job Complete', body: "All done, {{customer_name}}! Everything's fixed up. Total: {{invoice_total}}. Thanks for calling {{business_name}}!", trigger: 'job_completed' },
      { name: 'Review Request', body: "Hi {{customer_name}}, glad I could help! A quick review for {{business_name}} goes a long way: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
    competitor_tools: ['Jobber', 'Housecall Pro', 'Thumbtack', 'TaskRabbit']
  },

  // ─── 10. LOCKSMITH ───
  {
    id: 'locksmith',
    industry: 'Home Services',
    niche: 'Locksmith',
    display_name: 'Locksmith',
    emoji: '🔐',
    tagline: 'Your AI dispatcher that handles lockout calls, books service, and provides ETAs — 24/7.',
    demo_greeting: "Hi! I'm Mouse, your AI locksmith dispatcher. I take lockout calls 24/7, dispatch the nearest technician, and keep customers updated on ETAs. Want to see how I'd handle someone locked out of their car at midnight?",
    demo_system_prompt: "You are Mouse, an AI demo for a locksmith service. Handle emergency lockouts efficiently and calmly. Ask: Are you in a safe location? Vehicle, home, or business? What's your location? Provide pricing and dispatch quickly.",
    demo_suggested_messages: ["I'm locked out of my car", 'I need my locks changed', 'How much for a lockout?', 'I need a new key made'],
    soul_template: "You are Mouse, the AI dispatcher for {{business_name}}. You help {{owner_name}} run their locksmith service by handling lockout calls, dispatching techs, providing ETAs, and booking scheduled work. You're calm and efficient — people locked out need quick help. Service area: {{service_area}}. Phone: {{phone}}. Available: {{availability}}.",
    receptionist_greeting: "{{business_name}}, this is Mouse. Are you locked out or need locksmith service? I'll get help on the way.",
    receptionist_system_prompt: "You are Mouse, the AI dispatcher for {{business_name}}, a locksmith. For lockouts: ask if they're safe, get location, determine type (car/home/business), dispatch immediately. For scheduled work: book lock changes, rekeying, installations. Transfer to owner for safe work, commercial access control systems, or complaints.",
    receptionist_faqs: [
      { question: 'How much for a car lockout?', answer: "Car lockout service is {{car_lockout_price}}. We can usually get to you within {{response_time}}.", category: 'pricing' },
      { question: 'How much for a house lockout?', answer: "Residential lockout service is {{home_lockout_price}}. If you need locks changed after, we'll quote that on-site.", category: 'pricing' },
      { question: 'How much to rekey my locks?', answer: "Rekeying is {{rekey_price}} per lock. Much cheaper than replacing them! We can match all your locks to one key.", category: 'pricing' },
      { question: 'Can you make keys?', answer: "Yes! Standard key copies are {{key_copy_price}}. Transponder/car keys start at {{car_key_price}}.", category: 'pricing' },
      { question: 'How fast can you get here?', answer: "Our average response time is {{response_time}} in our service area. I'll give you a specific ETA once I dispatch a tech.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['safe opening or combination change', 'commercial access control system', 'complaint about service or damage', 'forensic locksmith inquiry', 'master key system design'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your locksmith business.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: "Quick Key Locksmith", required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Steve O\'Brien', required: true },
        { name: 'phone', label: 'Dispatch Phone', type: 'phone', placeholder: '(555) 111-0010', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Chicago metro', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your locksmith services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Car Lockout', 'Home Lockout', 'Business Lockout', 'Lock Change', 'Rekeying', 'Key Copy', 'Car Key Programming', 'Deadbolt Install', 'Safe Service', 'Access Control', 'Master Key Systems'] },
        { name: 'car_lockout_price', label: 'Car Lockout Price', type: 'currency', placeholder: '65', required: true },
        { name: 'home_lockout_price', label: 'Home Lockout Price', type: 'currency', placeholder: '75', required: true },
        { name: 'rekey_price', label: 'Rekey Price Per Lock', type: 'currency', placeholder: '25', required: true }
      ]},
      { step_number: 3, title: 'Availability', description: 'When can you respond?', fields: [
        { name: 'availability', label: 'Availability', type: 'select', placeholder: 'Select', required: true, options: ['24/7', 'Mon-Sun 6am-12am', 'Mon-Sat 7am-10pm'] },
        { name: 'response_time', label: 'Typical Response Time', type: 'select', placeholder: 'Select', required: true, options: ['15-20 minutes', '20-30 minutes', '30-45 minutes'] },
        { name: 'key_copy_price', label: 'Key Copy Price', type: 'currency', placeholder: '5', required: false },
        { name: 'car_key_price', label: 'Car Key Starting Price', type: 'currency', placeholder: '150', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.quickkeylocksmith.com', required: false },
        { name: 'license_number', label: 'License Number', type: 'text', placeholder: 'LCK-12345', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'active-calls', title: 'Active Calls', description: 'Current lockout calls with tech and ETA.', priority: 1 },
      { id: 'tech-status', title: 'Tech Availability', description: 'Status and location of all technicians.', priority: 2 },
      { id: 'todays-jobs', title: "Today's Jobs", description: 'Completed and scheduled jobs today.', priority: 3 },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue from today\'s jobs.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Dispatch nearest tech', description: 'Assign lockout call to nearest available locksmith.', category: 'operations', difficulty: 'needs-approval' },
      { title: 'Send ETA to customer', description: 'Text customer with tech name and ETA.', category: 'operations', difficulty: 'automatic' },
      { title: 'Send receipt', description: 'Email receipt after service completion.', category: 'billing', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review request after lockout service.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Average Response Time', unit: 'minutes', description: 'Minutes from call to arrival.', target_suggestion: 20 },
      { name: 'Calls Per Day', unit: 'count', description: 'Total locksmith calls per day.', target_suggestion: 10 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per job.', target_suggestion: 95 },
      { name: 'Google Rating', unit: 'rating', description: 'Average Google review score.', target_suggestion: 4.8 }
    ],
    suggested_integrations: [
      { name: 'Google Maps', slug: 'google-maps', category: 'dispatch', why: 'Real-time location and routing.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up for "locksmith near me."', priority: 'essential' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Accept mobile payments on-site.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track revenue and expenses.', priority: 'recommended' }
    ],
    integration_priority: ['google-maps', 'google-business', 'square', 'quickbooks'],
    email_templates: [
      { name: 'Service Receipt', subject: 'Your Locksmith Receipt — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your receipt:\n\nService: {{service_type}}\nLocation: {{service_location}}\nTotal: {{invoice_total}}\n\nThank you for choosing {{business_name}}!\n\nReview: {{review_link}}\n\n— {{business_name}}", trigger: 'service_completed' }
    ],
    sms_templates: [
      { name: 'Tech Dispatched', body: "{{business_name}} — your locksmith {{tech_name}} is on the way! ETA: {{eta}}. {{truck_description}}. Hang tight!", trigger: 'tech_dispatched' },
      { name: 'Tech Arriving', body: "Your locksmith from {{business_name}} is about 5 minutes away. Almost there!", trigger: 'tech_nearby' },
      { name: 'Review Request', body: "Thanks for calling {{business_name}}, {{customer_name}}! Hope we got you back in quickly. A review helps a lot: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 16,
    estimated_monthly_value: 3500,
    ideal_plan: 'growth',
    competitor_tools: ['Dispatch1', 'ServiceTitan', 'Housecall Pro']
  },

  // ─── 11. GARAGE DOOR ───
  {
    id: 'garage-door',
    industry: 'Home Services',
    niche: 'Garage Door',
    display_name: 'Garage Door Service',
    emoji: '🚪',
    tagline: 'Your AI dispatcher that handles broken garage door calls and books installations.',
    demo_greeting: "Hi! I'm Mouse, your AI garage door service assistant. I handle emergency calls for stuck or broken doors, book repairs and installations, and send estimates. Want to see how I'd handle a door that won't open?",
    demo_system_prompt: "You are Mouse, an AI demo for a garage door company. Handle emergency calls for stuck/broken doors urgently. SAFETY: If a spring broke, tell them not to try to open the door manually — it's dangerous. Book repairs and new installations.",
    demo_suggested_messages: ['My garage door won\'t open', 'I heard a loud bang — spring broke', 'How much for a new garage door?', 'My opener stopped working'],
    soul_template: "You are Mouse, the AI dispatcher for {{business_name}}. You handle emergency garage door calls, book repairs and installations, and send estimates. SAFETY: Broken springs are dangerous — never let customers try to manually open a door with a broken spring. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "{{business_name}}, this is Mouse! Is your garage door stuck or do you need service? I can help.",
    receptionist_system_prompt: "You are Mouse, the AI dispatcher for {{business_name}}, a garage door service company. For broken springs or cables: WARN the customer not to try to open the door manually — dangerous. Dispatch quickly. For opener issues, off-track doors, and new installs, book service. Transfer to owner for commercial doors or complaints.",
    receptionist_faqs: [
      { question: 'My spring broke. Is that dangerous?', answer: "Yes — please do NOT try to open the door manually. Broken springs are under extreme tension. Stay clear and we'll send someone out ASAP to replace it safely.", category: 'safety' },
      { question: 'How much for a spring replacement?', answer: "Spring replacement is typically {{spring_price}}. We replace both springs together since if one broke, the other is close behind.", category: 'pricing' },
      { question: 'How much for a new garage door?', answer: "New garage doors range from {{door_price_range}} installed, depending on size, style, and insulation. We offer free estimates.", category: 'pricing' },
      { question: 'How much for a new opener?', answer: "A new garage door opener installed runs {{opener_price}}, depending on the model. We carry {{opener_brands}}.", category: 'pricing' },
      { question: 'Do you offer same-day service?', answer: "Yes! For most repairs, we can get to you same day. Spring replacements and off-track doors are priority calls.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['commercial garage door service', 'fire department door release', 'complaint about previous repair', 'custom door design', 'HOA coordination needed'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Precision Garage Doors', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Gary Nelson', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0011', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Tampa Bay area', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Spring Replacement', 'Opener Repair', 'Opener Install', 'Off-Track Repair', 'New Door Install', 'Panel Replacement', 'Cable Repair', 'Roller Replacement', 'Tune-Up', 'Commercial Doors'] },
        { name: 'spring_price', label: 'Spring Replacement Price Range', type: 'text', placeholder: '$200-$350', required: true },
        { name: 'door_price_range', label: 'New Door Price Range', type: 'text', placeholder: '$800-$2,500', required: false },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 7am-7pm', required: true }
      ]},
      { step_number: 3, title: 'Details', description: 'A few more things.', fields: [
        { name: 'opener_price', label: 'Opener Install Price Range', type: 'text', placeholder: '$350-$600', required: false },
        { name: 'opener_brands', label: 'Opener Brands', type: 'text', placeholder: 'LiftMaster, Chamberlain, Genie', required: false },
        { name: 'same_day', label: 'Offer Same-Day Service?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.precisiongaragedoors.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-calls', title: "Today's Calls", description: 'Service calls for today.', priority: 1 },
      { id: 'emergency-queue', title: 'Emergency Queue', description: 'Priority spring/cable calls.', priority: 2 },
      { id: 'pending-estimates', title: 'Pending Estimates', description: 'New door estimates awaiting approval.', priority: 3 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue from repairs and installs.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up on door estimate', description: 'Check in on pending new door estimates.', category: 'sales', difficulty: 'automatic' },
      { title: 'Send tune-up reminder', description: 'Remind customers about annual garage door tune-up.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review request after service.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Dispatch for emergency', description: 'Send tech for spring/cable emergency.', category: 'operations', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Calls Per Day', unit: 'count', description: 'Service calls per day.', target_suggestion: 6 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per call.', target_suggestion: 300 },
      { name: 'Same-Day Completion', unit: 'percentage', description: 'Calls completed same day.', target_suggestion: 90 },
      { name: 'Door Install Close Rate', unit: 'percentage', description: 'New door estimates that close.', target_suggestion: 40 }
    ],
    suggested_integrations: [
      { name: 'Housecall Pro', slug: 'housecall-pro', category: 'field-service', why: 'Scheduling, dispatch, and invoicing.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local garage door search visibility.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track job profitability.', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Accept on-site payments.', priority: 'recommended' }
    ],
    integration_priority: ['housecall-pro', 'google-business', 'quickbooks', 'stripe'],
    email_templates: [
      { name: 'Service Complete', subject: 'Garage Door Service Complete — {{business_name}}', body: "Hi {{customer_name}},\n\nYour garage door service is complete:\n\n{{job_summary}}\nTotal: {{invoice_total}}\n\nAll work is warrantied. Your door should be working perfectly now!\n\nReview: {{review_link}}\n\n— {{business_name}}", trigger: 'job_completed' },
      { name: 'New Door Estimate', subject: 'Your Garage Door Estimate — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your estimate for a new garage door:\n\n{{estimate_details}}\nTotal (installed): {{estimate_total}}\n\nApprove: {{estimate_link}}\n\n— {{business_name}}", trigger: 'estimate_created' }
    ],
    sms_templates: [
      { name: 'Tech En Route', body: "{{business_name}} — your tech {{tech_name}} is on the way. ETA: {{eta}}. See you soon!", trigger: 'tech_dispatched' },
      { name: 'Job Complete', body: "Your garage door is fixed, {{customer_name}}! Total: {{invoice_total}}. Thanks for calling {{business_name}}!", trigger: 'job_completed' },
      { name: 'Tune-Up Reminder', body: "Hi {{customer_name}}, it's been a year since your last garage door service. A tune-up keeps things running smooth. Book: {{booking_link}} — {{business_name}}", trigger: 'annual_reminder' }
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2800,
    ideal_plan: 'pro',
    competitor_tools: ['Housecall Pro', 'ServiceTitan', 'Jobber']
  },

  // ─── 12. FENCING ───
  {
    id: 'fencing',
    industry: 'Home Services',
    niche: 'Fencing',
    display_name: 'Fencing Company',
    emoji: '🏡',
    tagline: 'Your AI estimator that books fence quotes, sends proposals, and manages installations.',
    demo_greeting: "Hey! I'm Mouse, your AI fencing assistant. I book fence estimates, send professional proposals, and manage installation schedules. Want to see how I'd help a homeowner who needs a new privacy fence?",
    demo_system_prompt: "You are Mouse, an AI demo for a fencing company. Help customers understand fence options, get estimates, and schedule installations. Be knowledgeable about materials, styles, and pricing.",
    demo_suggested_messages: ['How much for a privacy fence?', 'What fence materials do you offer?', 'I need a quote for my backyard', 'How long does fence installation take?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You manage fence estimates, proposals, and installations. You know fence materials, styles, and local code considerations. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Need a fence estimate or have a question? I can help.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a fencing company. Book free estimates, explain materials and styles, provide general pricing. Transfer to owner for commercial projects, HOA disputes, or complaints.",
    receptionist_faqs: [
      { question: 'How much per foot for a privacy fence?', answer: "Wood privacy fencing runs about {{wood_per_foot}}/linear foot installed. Vinyl is {{vinyl_per_foot}}/foot. We provide free on-site estimates for exact pricing.", category: 'pricing' },
      { question: 'What materials do you offer?', answer: "We install {{materials}}. Each has different looks, maintenance, and price points. We'll help you choose the best fit.", category: 'services' },
      { question: 'How long does installation take?', answer: "Most residential fences are installed in 1-3 days depending on the length and terrain. We'll give you a specific timeline.", category: 'services' },
      { question: 'Do I need a permit?', answer: "In most areas, yes. We handle the permit process for you and ensure everything meets local codes and setback requirements.", category: 'general' },
      { question: 'Do you do fence repair?', answer: "Yes! We repair all types of fencing — storm damage, leaning posts, broken boards, and sagging gates.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['commercial fencing project', 'HOA violation or dispute', 'permit issue', 'complaint about installation', 'custom gate or decorative fence'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Patriot Fence Co.', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Jason White', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0012', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Charlotte metro', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Your fencing services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Wood Fence', 'Vinyl Fence', 'Chain Link', 'Aluminum/Iron', 'Farm/Ranch Fence', 'Gate Install', 'Fence Repair', 'Storm Damage', 'Commercial Fencing', 'Retaining Walls'] },
        { name: 'materials', label: 'Materials Offered', type: 'text', placeholder: 'Wood, vinyl, chain link, aluminum', required: true },
        { name: 'wood_per_foot', label: 'Wood Fence Price Per Foot', type: 'text', placeholder: '$25-$40', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 7am-5pm, Sat 8am-12pm', required: true }
      ]},
      { step_number: 3, title: 'Details', description: 'More info.', fields: [
        { name: 'vinyl_per_foot', label: 'Vinyl Fence Price Per Foot', type: 'text', placeholder: '$30-$50', required: false },
        { name: 'handles_permits', label: 'Handle Permits for Customer?', type: 'toggle', placeholder: '', required: true },
        { name: 'warranty', label: 'Workmanship Warranty', type: 'select', placeholder: 'Select', required: true, options: ['Lifetime', '10 years', '5 years', '2 years'] }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.patriotfence.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'estimate-schedule', title: 'Upcoming Estimates', description: 'Scheduled fence estimates.', priority: 1 },
      { id: 'active-installs', title: 'Active Installations', description: 'Fences currently being installed.', priority: 2 },
      { id: 'pending-proposals', title: 'Pending Proposals', description: 'Proposals awaiting approval.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue from installs and repairs.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up on fence proposal', description: 'Check in on unapproved proposals after 5 days.', category: 'sales', difficulty: 'automatic' },
      { title: 'Request review after install', description: 'Ask for a review after fence completion.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Send project update photos', description: 'Share progress photos during multi-day installs.', category: 'operations', difficulty: 'needs-approval' },
      { title: 'Storm damage outreach', description: 'Contact past customers in storm-affected areas.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Estimates Per Week', unit: 'count', description: 'On-site estimates completed weekly.', target_suggestion: 10 },
      { name: 'Close Rate', unit: 'percentage', description: 'Estimates that convert to contracts.', target_suggestion: 45 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per fencing job.', target_suggestion: 4000 },
      { name: 'Crew Utilization', unit: 'percentage', description: 'Percentage of work days with active jobs.', target_suggestion: 85 }
    ],
    suggested_integrations: [
      { name: 'Jobber', slug: 'jobber', category: 'field-service', why: 'Estimating, scheduling, and invoicing.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local fence company search visibility.', priority: 'essential' },
      { name: 'CompanyCam', slug: 'companycam', category: 'field', why: 'Before/after photos for every project.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track job costs and profitability.', priority: 'recommended' }
    ],
    integration_priority: ['jobber', 'google-business', 'companycam', 'quickbooks'],
    email_templates: [
      { name: 'Fence Proposal', subject: 'Your Fence Estimate — {{business_name}}', body: "Hi {{customer_name}},\n\nHere's your fencing proposal:\n\n{{proposal_details}}\nTotal: {{estimate_total}}\n\nIncludes: materials, installation, cleanup, and {{warranty}} warranty.\n\nApprove: {{estimate_link}}\n\n— {{business_name}}", trigger: 'estimate_created' },
      { name: 'Install Complete', subject: 'Your New Fence is Done! — {{business_name}}', body: "Hi {{customer_name}},\n\nYour new fence is installed and looking great!\n\n{{job_summary}}\n\nTotal: {{invoice_total}}\n\nReview: {{review_link}}\n\n— {{business_name}}", trigger: 'job_completed' }
    ],
    sms_templates: [
      { name: 'Estimate Reminder', body: "Hi {{customer_name}}, reminder: your fence estimate with {{business_name}} is tomorrow at {{time}}. See you then!", trigger: 'estimate_reminder' },
      { name: 'Crew Arriving', body: "Good morning {{customer_name}}! The {{business_name}} crew will be there today to start your fence. Questions? {{phone}}", trigger: 'job_start_day' },
      { name: 'Review Request', body: "Love your new fence, {{customer_name}}? A review for {{business_name}} helps a lot: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2800,
    ideal_plan: 'pro',
    competitor_tools: ['Jobber', 'Estimate Rocket', 'Fence Estimator Pro']
  },

  // ─── 13. TREE SERVICE ───
  {
    id: 'tree-service',
    industry: 'Home Services',
    niche: 'Tree Service',
    display_name: 'Tree Service',
    emoji: '🌳',
    tagline: 'Your AI office manager that books tree jobs, handles storm calls, and sends estimates.',
    demo_greeting: "Hey! I'm Mouse, your AI tree service manager. I book tree removals, handle emergency storm damage calls, and send estimates. Want to see how I'd handle a homeowner with a tree on their house?",
    demo_system_prompt: "You are Mouse, an AI demo for a tree service company. Handle emergency calls (tree on house, tree on power line, hanging limbs) with safety priority. For trees on power lines: call the utility company. Book trimming, removal, and stump grinding.",
    demo_suggested_messages: ['A tree fell on my roof', 'How much to remove a large tree?', 'I need some branches trimmed', 'How much for stump grinding?'],
    soul_template: "You are Mouse, the AI manager for {{business_name}}. You handle tree service estimates, emergency storm calls, and scheduling. SAFETY: Tree on power line → call utility company first, stay away. Tree on house → assess if anyone is trapped, call 911 if so. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "{{business_name}}, this is Mouse! Do you have a tree emergency or need service? I can help.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a tree service company. EMERGENCY: Tree on power line → call utility company, stay 50+ feet away. Tree on house with people trapped → call 911. For general service, book estimates for trimming, removal, and stump grinding. Transfer to owner for commercial contracts, crane jobs, or complaints.",
    receptionist_faqs: [
      { question: 'How much to remove a tree?', answer: "Tree removal depends on size, location, and access. Small trees start at {{small_tree_price}}, medium trees {{medium_tree_price}}, and large trees {{large_tree_price}}+. We provide free estimates.", category: 'pricing' },
      { question: 'How much for stump grinding?', answer: "Stump grinding is {{stump_price}} per stump for average-sized stumps. Discounts for multiple stumps.", category: 'pricing' },
      { question: 'Do you do storm damage?', answer: "Yes — we respond to storm emergencies and can get a crew out quickly. For trees on structures or roads, we prioritize response.", category: 'services' },
      { question: 'Are you insured?', answer: "Fully insured with {{insurance_amount}} in liability coverage. Tree work is risky — you always want to use an insured company.", category: 'general' },
      { question: 'How long does it take?', answer: "A simple trim takes a few hours. Full tree removal can take half a day to a full day depending on the tree. We always clean up before we leave.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['tree on power line — tell them to call utility first', 'tree on occupied structure — call 911 if trapped', 'commercial or municipal contract', 'crane job needed', 'complaint about damage'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Mighty Oak Tree Service', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Ray Johnson', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0013', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Atlanta metro', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Your tree services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Tree Removal', 'Tree Trimming', 'Stump Grinding', 'Emergency Storm', 'Lot Clearing', 'Crane Service', 'Cabling/Bracing', 'Tree Health Assessment', 'Firewood'] },
        { name: 'small_tree_price', label: 'Small Tree Removal Price', type: 'text', placeholder: '$300-$500', required: true },
        { name: 'medium_tree_price', label: 'Medium Tree Removal Price', type: 'text', placeholder: '$500-$1,200', required: false },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 7am-5pm', required: true }
      ]},
      { step_number: 3, title: 'Details', description: 'More info.', fields: [
        { name: 'large_tree_price', label: 'Large Tree Starting Price', type: 'text', placeholder: '$1,200-$3,000+', required: false },
        { name: 'stump_price', label: 'Stump Grinding Per Stump', type: 'text', placeholder: '$100-$200', required: false },
        { name: 'insurance_amount', label: 'Insurance Coverage Amount', type: 'text', placeholder: '$2 million', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.mightyoaktree.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-jobs', title: "Today's Jobs", description: 'Scheduled tree work for today.', priority: 1 },
      { id: 'storm-queue', title: 'Storm Damage Queue', description: 'Emergency storm calls.', priority: 2 },
      { id: 'pending-estimates', title: 'Pending Estimates', description: 'Estimates awaiting approval.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue from all tree work.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up on estimate', description: 'Check in on pending tree estimates.', category: 'sales', difficulty: 'automatic' },
      { title: 'Post-storm outreach', description: 'Contact customers in storm-affected areas.', category: 'marketing', difficulty: 'needs-approval' },
      { title: 'Request review', description: 'Send review request after job.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Send seasonal trimming reminder', description: 'Remind customers about dormant-season pruning.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Jobs Per Week', unit: 'count', description: 'Tree jobs completed weekly.', target_suggestion: 8 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per job.', target_suggestion: 800 },
      { name: 'Estimate Close Rate', unit: 'percentage', description: 'Estimates that convert to jobs.', target_suggestion: 50 },
      { name: 'Crew Utilization', unit: 'percentage', description: 'Workdays with active jobs.', target_suggestion: 85 }
    ],
    suggested_integrations: [
      { name: 'Arborgold', slug: 'arborgold', category: 'industry', why: 'Tree service-specific CRM and scheduling.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local tree service search visibility.', priority: 'essential' },
      { name: 'CompanyCam', slug: 'companycam', category: 'field', why: 'Document trees before/after work.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track job costs.', priority: 'recommended' }
    ],
    integration_priority: ['arborgold', 'google-business', 'companycam', 'quickbooks'],
    email_templates: [
      { name: 'Tree Estimate', subject: 'Your Tree Service Estimate — {{business_name}}', body: "Hi {{customer_name}},\n\n{{estimate_details}}\nTotal: {{estimate_total}}\n\nApprove: {{estimate_link}}\n\n— {{business_name}}", trigger: 'estimate_created' },
      { name: 'Job Complete', subject: 'Tree Work Complete — {{business_name}}', body: "Hi {{customer_name}},\n\nYour tree work is done and cleaned up!\n\n{{job_summary}}\nTotal: {{invoice_total}}\n\nReview: {{review_link}}\n\n— {{business_name}}", trigger: 'job_completed' }
    ],
    sms_templates: [
      { name: 'Crew Arriving', body: "Good morning {{customer_name}}! {{business_name}} crew will be there this morning to start your tree work. Questions? {{phone}}", trigger: 'job_start_day' },
      { name: 'Job Complete', body: "{{customer_name}}, tree work is done and all cleaned up. Total: {{invoice_total}}. Thanks for choosing {{business_name}}!", trigger: 'job_completed' },
      { name: 'Review Request', body: "Thanks for choosing {{business_name}}! A review helps us grow: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 3000,
    ideal_plan: 'pro',
    competitor_tools: ['Arborgold', 'SingleOps', 'Jobber', 'ArboStar']
  },

  // ─── 14. PRESSURE WASHING ───
  {
    id: 'pressure-washing',
    industry: 'Home Services',
    niche: 'Pressure Washing',
    display_name: 'Pressure Washing',
    emoji: '💦',
    tagline: 'Your AI booking assistant that fills your pressure washing schedule and sends seasonal reminders.',
    demo_greeting: "Hey! I'm Mouse, your AI pressure washing assistant. I book jobs, send quotes, and keep your schedule full year-round. Want to see how I'd quote a driveway and house wash?",
    demo_system_prompt: "You are Mouse, an AI demo for a pressure washing / power washing business. Book jobs, explain services, and provide pricing. Be straightforward and knowledgeable about different surfaces and cleaning methods.",
    demo_suggested_messages: ['How much to wash my driveway?', 'I need my house exterior cleaned', 'Do you do deck washing?', 'How much for a roof wash?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You book pressure washing jobs, send quotes, manage the schedule, and follow up. You know which surfaces need soft wash vs. pressure wash. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Need a pressure washing quote or want to schedule? I can help.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a pressure washing company. Book jobs, provide pricing, and explain services. Transfer to owner for commercial contracts, roof washing consultations, or complaints.",
    receptionist_faqs: [
      { question: 'How much to pressure wash my driveway?', answer: "A standard driveway (2-car) is about {{driveway_price}}. Larger driveways and heavily stained ones may be more. We can give you an exact quote.", category: 'pricing' },
      { question: 'How much for a house wash?', answer: "House washing starts at {{house_wash_price}} for a standard home. We use soft wash to safely clean your siding without damage.", category: 'pricing' },
      { question: "What's the difference between pressure wash and soft wash?", answer: "Pressure washing uses high pressure for hard surfaces like concrete and brick. Soft washing uses lower pressure with cleaning solutions for delicate surfaces like vinyl siding, stucco, and roofs.", category: 'services' },
      { question: 'Do you wash roofs?', answer: "Yes — roof washing is {{roof_wash_price}}. We only use soft wash to protect your shingles. Removes algae, moss, and black streaks.", category: 'services' },
      { question: 'How often should I wash my house?', answer: "Most homes benefit from an annual wash. Driveways and patios may need it every 1-2 years depending on use and climate.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['commercial pressure washing contract', 'fleet washing inquiry', 'roof washing consultation', 'complaint about damage', 'graffiti removal'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'BlastClean Pressure Washing', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Derek Stone', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0014', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Jacksonville area', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'What you wash.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Driveway Washing', 'House Washing', 'Roof Soft Wash', 'Deck/Patio', 'Fence Washing', 'Sidewalk/Walkway', 'Commercial Wash', 'Gutter Cleaning', 'Pool Deck', 'Concrete Stain Removal'] },
        { name: 'driveway_price', label: 'Standard Driveway Price', type: 'currency', placeholder: '150', required: true },
        { name: 'house_wash_price', label: 'House Wash Starting Price', type: 'currency', placeholder: '250', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 7am-5pm', required: true }
      ]},
      { step_number: 3, title: 'Details', description: 'A few more things.', fields: [
        { name: 'roof_wash_price', label: 'Roof Wash Starting Price', type: 'currency', placeholder: '350', required: false },
        { name: 'offers_soft_wash', label: 'Offer Soft Washing?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.blastclean.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-jobs', title: "Today's Jobs", description: 'Scheduled pressure washing jobs.', priority: 1 },
      { id: 'pending-quotes', title: 'Pending Quotes', description: 'Quotes awaiting approval.', priority: 2 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue from all jobs.', priority: 3 },
      { id: 'seasonal-reminders', title: 'Annual Wash Reminders', description: 'Customers due for their annual wash.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send annual wash reminder', description: 'Remind past customers it\'s time for their yearly wash.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Follow up on quote', description: 'Check in on pending quotes after 3 days.', category: 'sales', difficulty: 'automatic' },
      { title: 'Send before/after photos', description: 'Text customer before/after photos of completed work.', category: 'operations', difficulty: 'needs-approval' },
      { title: 'Request review', description: 'Send review request after job.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Jobs Per Week', unit: 'count', description: 'Washing jobs per week.', target_suggestion: 12 },
      { name: 'Average Job Value', unit: 'dollars', description: 'Average revenue per job.', target_suggestion: 300 },
      { name: 'Quote Close Rate', unit: 'percentage', description: 'Quotes that become jobs.', target_suggestion: 60 },
      { name: 'Customer Return Rate', unit: 'percentage', description: 'Customers who rebook within 18 months.', target_suggestion: 45 }
    ],
    suggested_integrations: [
      { name: 'Jobber', slug: 'jobber', category: 'field-service', why: 'Quoting, scheduling, and invoicing.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local pressure washing search visibility.', priority: 'essential' },
      { name: 'CompanyCam', slug: 'companycam', category: 'field', why: 'Before/after photo documentation.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track seasonal revenue.', priority: 'nice-to-have' }
    ],
    integration_priority: ['jobber', 'google-business', 'companycam', 'quickbooks'],
    email_templates: [
      { name: 'Washing Quote', subject: 'Your Pressure Washing Quote — {{business_name}}', body: "Hi {{customer_name}},\n\n{{quote_details}}\nTotal: {{quote_total}}\n\nApprove and schedule: {{quote_link}}\n\n— {{business_name}}", trigger: 'quote_created' },
      { name: 'Annual Reminder', subject: 'Time to Wash! — {{business_name}}', body: "Hi {{customer_name}},\n\nIt's been about a year since we last washed your {{last_service}}. Time for a refresh!\n\nBook: {{booking_link}}\n\n— {{business_name}}", trigger: 'annual_reminder' }
    ],
    sms_templates: [
      { name: 'Job Day', body: "Good morning {{customer_name}}! {{business_name}} will be at your property today. Please move any vehicles from the driveway. See you soon!", trigger: 'job_start_day' },
      { name: 'Job Complete', body: "{{customer_name}}, pressure washing is done! Your property looks great. Total: {{invoice_total}}. — {{business_name}}", trigger: 'job_completed' },
      { name: 'Review Request', body: "Love the clean look, {{customer_name}}? A review for {{business_name}} helps: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 8,
    estimated_monthly_value: 2000,
    ideal_plan: 'pro',
    competitor_tools: ['Jobber', 'Housecall Pro', 'Responsibid']
  },

  // ─── 15. POOL SERVICE ───
  {
    id: 'pool-service',
    industry: 'Home Services',
    niche: 'Pool Service',
    display_name: 'Pool Service',
    emoji: '🏊',
    tagline: 'Your AI pool manager that schedules service, sells maintenance plans, and keeps pools crystal clear.',
    demo_greeting: "Hey! I'm Mouse, your AI pool service manager. I schedule maintenance, sell recurring plans, and handle pool chemistry questions. Want to see how I'd onboard a new weekly pool customer?",
    demo_system_prompt: "You are Mouse, an AI demo for a pool service company. Book pool cleaning, sell maintenance plans, and answer pool chemistry questions. Be knowledgeable about pool care and seasonal maintenance.",
    demo_suggested_messages: ['How much for weekly pool service?', 'My pool is turning green', 'I need to open my pool for summer', 'Do you repair pool equipment?'],
    soul_template: "You are Mouse, the AI manager for {{business_name}}. You manage pool service routes, sell maintenance plans, handle chemical questions, and schedule equipment repairs. You know pool care — green pool rescue, seasonal opening/closing, and water chemistry. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! Need pool service, have a green pool, or have a question? I can help.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a pool service company. Book weekly service, explain plans, answer chemistry questions, and handle equipment repair requests. Green pool = urgent. Transfer to owner for equipment replacement quotes, replastering, or pool construction referrals.",
    receptionist_faqs: [
      { question: 'How much for weekly pool service?', answer: "Weekly maintenance is {{weekly_price}}/visit and includes skimming, vacuuming, brushing, chemical balancing, and equipment check. We keep your pool swim-ready all season.", category: 'pricing' },
      { question: 'My pool is green! Can you help?', answer: "Absolutely — we do green pool cleanups! Depending on severity, it takes 1-3 visits to get it crystal clear. Green pool rescue starts at {{green_pool_price}}. Let's get you scheduled ASAP.", category: 'services' },
      { question: 'How much to open/close my pool?', answer: "Pool opening is {{opening_price}} and closing is {{closing_price}}. Includes chemical treatment, equipment inspection, and cover installation (for closing).", category: 'pricing' },
      { question: 'Do you repair pool equipment?', answer: "Yes — we service and repair pumps, filters, heaters, salt systems, and automation. We'll diagnose the issue and provide a repair quote.", category: 'services' },
      { question: "What's included in weekly service?", answer: "Our weekly service includes: skim surface, vacuum bottom, brush walls, empty baskets, test and balance chemicals, check equipment, and a service report.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['equipment replacement quote', 'pool replastering or renovation', 'new pool construction referral', 'complaint about water quality', 'commercial pool account'],
    wizard_steps: [
      { step_number: 1, title: 'Your Business', description: "Let's set up your pool service.", fields: [
        { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Crystal Clear Pools', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Mike Palmer', required: true },
        { name: 'phone', label: 'Business Phone', type: 'phone', placeholder: '(555) 111-0015', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Scottsdale / Phoenix metro', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your pool services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Weekly Maintenance', 'Chemical Balancing', 'Filter Cleaning', 'Green Pool Cleanup', 'Pool Opening', 'Pool Closing', 'Equipment Repair', 'Pump Replacement', 'Heater Service', 'Salt System', 'Tile Cleaning', 'Acid Wash'] },
        { name: 'weekly_price', label: 'Weekly Service Price', type: 'currency', placeholder: '150', required: true },
        { name: 'green_pool_price', label: 'Green Pool Rescue Starting Price', type: 'currency', placeholder: '300', required: false },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 7am-5pm', required: true }
      ]},
      { step_number: 3, title: 'Seasonal Info', description: 'Seasonal service details.', fields: [
        { name: 'opening_price', label: 'Pool Opening Price', type: 'currency', placeholder: '250', required: false },
        { name: 'closing_price', label: 'Pool Closing Price', type: 'currency', placeholder: '275', required: false },
        { name: 'year_round', label: 'Year-Round Service Area?', type: 'toggle', placeholder: '', required: true, help_text: 'Or seasonal (summer only)?' }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.crystalclearpools.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-route', title: "Today's Route", description: 'Pools scheduled for service today.', priority: 1 },
      { id: 'recurring-clients', title: 'Active Clients', description: 'All pools on recurring service.', priority: 2 },
      { id: 'chemical-alerts', title: 'Chemical Alerts', description: 'Pools with chemistry issues from last visit.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue from service and repairs.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send service report', description: 'Email pool service report after each visit with chemical readings.', category: 'operations', difficulty: 'automatic' },
      { title: 'Send pool opening reminder', description: 'Remind customers to schedule spring pool opening.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Follow up on equipment repair quote', description: 'Check in on pending repair estimates.', category: 'sales', difficulty: 'automatic' },
      { title: 'Request review', description: 'Ask for review after first month of service.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Active Pool Clients', unit: 'count', description: 'Total pools on recurring service.', target_suggestion: 75 },
      { name: 'Pools Per Day', unit: 'count', description: 'Pools serviced per tech per day.', target_suggestion: 10 },
      { name: 'Monthly Recurring Revenue', unit: 'dollars', description: 'MRR from weekly service plans.', target_suggestion: 12000 },
      { name: 'Client Retention', unit: 'percentage', description: 'Season-over-season client retention.', target_suggestion: 85 }
    ],
    suggested_integrations: [
      { name: 'Skimmer', slug: 'skimmer', category: 'industry', why: 'Pool service route management and chemical tracking.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local pool service search visibility.', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track seasonal revenue and expenses.', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Recurring billing for monthly service.', priority: 'recommended' }
    ],
    integration_priority: ['skimmer', 'google-business', 'quickbooks', 'stripe'],
    email_templates: [
      { name: 'Service Report', subject: 'Pool Service Report — {{business_name}}', body: "Hi {{customer_name}},\n\nYour pool was serviced today. Here's the report:\n\n{{service_report}}\n\nChemical readings:\n{{chemical_readings}}\n\nNext visit: {{next_visit_date}}\n\nQuestions? Reply or call {{phone}}.\n\n— {{business_name}}", trigger: 'service_completed' },
      { name: 'Opening Reminder', subject: 'Time to Open Your Pool! — {{business_name}}', body: "Hi {{customer_name}},\n\nSwim season is almost here! Let's get your pool open and ready.\n\nPool opening: {{opening_price}}\nBook: {{booking_link}}\n\nEarly bookings fill up fast!\n\n— {{business_name}}", trigger: 'opening_season_reminder' }
    ],
    sms_templates: [
      { name: 'Service Day', body: "Hi {{customer_name}}, {{business_name}} will be servicing your pool today. No need to be home — we'll send a report when done!", trigger: 'service_day_morning' },
      { name: 'Service Complete', body: "{{customer_name}}, pool service is done. Chemicals balanced, everything looks good. Report emailed. Enjoy the swim! — {{business_name}}", trigger: 'service_completed' },
      { name: 'Green Pool Alert', body: "Hi {{customer_name}}, we noticed your pool needs attention. Let {{business_name}} get it crystal clear again. Call {{phone}} or reply to schedule.", trigger: 'green_pool_alert' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3200,
    ideal_plan: 'growth',
    competitor_tools: ['Skimmer', 'Pool Brain', 'PoolCarePRO', 'ServiceTitan']
  }
];
