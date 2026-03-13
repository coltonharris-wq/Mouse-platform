import type { ProTemplate } from '../schema';

export const legalTemplates: ProTemplate[] = [
  {
    id: 'personal-injury-lawyer',
    industry: 'Legal',
    niche: 'Personal Injury Lawyer',
    display_name: 'Personal Injury Law Firm',
    emoji: '⚖️',
    tagline: 'Sign more cases and keep injured clients informed every step of the way.',

    demo_greeting: "Hi! I'm your AI assistant for a personal injury law firm. I can help potential clients understand their options, schedule free consultations, and keep current clients updated on their case status. Try asking me something!",
    demo_system_prompt: "You are a friendly AI assistant for a personal injury law firm. You help potential clients understand the consultation process, answer general questions about personal injury claims, and schedule free case evaluations. NEVER give legal advice or predict case outcomes. Always recommend speaking with an attorney. Be compassionate — these people are often in pain and stressed about medical bills.",
    demo_suggested_messages: [
      "I was in a car accident last week — what should I do?",
      "How much does a consultation cost?",
      "How long do personal injury cases usually take?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a personal injury law firm. You help potential clients schedule free consultations, answer general questions about the process, and keep existing clients informed about their case progress. NEVER give legal advice, predict outcomes, or discuss specific settlement amounts. Always recommend speaking directly with an attorney for legal guidance. Be compassionate and patient — clients are often dealing with pain, stress, and financial pressure. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you calling about a new injury, or are you an existing client checking on your case?",
    receptionist_system_prompt: "You are the phone receptionist for a personal injury law firm. Determine if the caller is a new potential client or an existing client. For new clients, gather: name, type of injury/accident, when it happened, if they've seen a doctor, and if they have the other party's insurance info. Schedule a free consultation. For existing clients, take a message for their attorney. NEVER give legal advice or predict outcomes. If someone describes a recent accident, express empathy first.",
    receptionist_faqs: [
      { question: "Do I have a case?", answer: "I can't evaluate that over the phone, but our attorneys offer free consultations to review your situation. There's no obligation — would you like to schedule one?", category: "consultations" },
      { question: "How much does it cost?", answer: "We work on a contingency fee basis, which means you don't pay anything unless we win your case. The consultation is completely free.", category: "fees" },
      { question: "How long will my case take?", answer: "Every case is different — it depends on your injuries, treatment, and other factors. Your attorney can give you a better timeline during your consultation.", category: "process" },
      { question: "Should I talk to the other driver's insurance company?", answer: "We generally recommend speaking with an attorney before giving any recorded statements to the other party's insurance. Would you like to schedule a free consultation?", category: "advice" },
      { question: "What if I can't come to the office?", answer: "We can do phone or video consultations, and for clients who are injured, our attorneys can come to you — at your home or even the hospital.", category: "accessibility" }
    ],
    receptionist_transfer_triggers: [
      "caller says they were just in an accident today",
      "caller mentions a loved one who died",
      "caller says they're being pressured by an insurance adjuster",
      "caller is an existing client upset about their case",
      "caller mentions a statute of limitations concern"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Law Firm', description: 'Basic information about your practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Smith & Associates Law', required: true },
        { name: 'phone', label: 'Main Phone Number', type: 'phone', placeholder: '(555) 123-4567', required: true },
        { name: 'practice_areas', label: 'What types of cases do you handle?', type: 'multiselect', placeholder: '', required: true, options: ['Car Accidents', 'Truck Accidents', 'Motorcycle Accidents', 'Slip & Fall', 'Medical Malpractice', 'Dog Bites', 'Wrongful Death', 'Workers Comp', 'Product Liability'] }
      ]},
      { step_number: 2, title: 'Consultations', description: 'How do you meet with new clients?', fields: [
        { name: 'consultation_types', label: 'Consultation options', type: 'multiselect', placeholder: '', required: true, options: ['In-Office', 'Phone', 'Video Call', 'Home/Hospital Visit'] },
        { name: 'consultation_fee', label: 'Consultation fee', type: 'select', placeholder: '', required: true, options: ['Free', 'Paid — deducted from settlement', 'Paid — flat fee'] },
        { name: 'fee_structure', label: 'Fee structure', type: 'select', placeholder: '', required: true, options: ['Contingency (no win, no fee)', 'Hourly', 'Hybrid'] }
      ]},
      { step_number: 3, title: 'Availability', description: 'When can clients reach you?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'emergency_available', label: 'Available for after-hours emergencies?', type: 'toggle', placeholder: '', required: false, help_text: 'For accident victims who need immediate guidance' }
      ]},
      { step_number: 4, title: 'Service Area', description: 'Where do you practice?', fields: [
        { name: 'service_area', label: 'Counties or cities you serve', type: 'text', placeholder: 'All of Cook County and surrounding suburbs', required: true },
        { name: 'languages', label: 'Languages spoken at your firm', type: 'multiselect', placeholder: '', required: false, options: ['English', 'Spanish', 'Polish', 'Chinese', 'Korean', 'Arabic', 'Vietnamese'] }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-leads', title: 'New Case Inquiries', description: 'Potential clients who reached out today', priority: 1 },
      { id: 'consultations-scheduled', title: 'Consultations This Week', description: 'Upcoming free case evaluations', priority: 2 },
      { id: 'active-cases', title: 'Active Cases', description: 'Cases currently in progress', priority: 3 },
      { id: 'follow-ups-due', title: 'Client Follow-Ups Due', description: 'Clients who need a status update', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up with new lead from yesterday', description: 'Call back the potential car accident client who inquired yesterday afternoon.', category: 'leads', difficulty: 'automatic' },
      { title: 'Send case status update', description: 'Email client about medical records request status.', category: 'client-communication', difficulty: 'needs-approval' },
      { title: 'Remind client about doctor appointment', description: 'Text client reminder about their follow-up appointment tomorrow.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Request medical records', description: 'Send records request to treating physician for active case.', category: 'case-management', difficulty: 'supervised' }
    ],
    kpis: [
      { name: 'New Case Inquiries', unit: 'per month', description: 'How many potential clients contact your firm each month', target_suggestion: 40 },
      { name: 'Consultation-to-Signed Ratio', unit: 'percent', description: 'What percentage of free consultations turn into signed cases', target_suggestion: 35 },
      { name: 'Average Response Time', unit: 'minutes', description: 'How quickly you respond to new inquiries', target_suggestion: 15 },
      { name: 'Client Satisfaction', unit: 'rating', description: 'Average rating from client feedback surveys', target_suggestion: 4.8 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Lets clients book free consultations online without calling', priority: 'essential' },
      { name: 'Clio', slug: 'clio', category: 'legal', why: 'Syncs case management so your AI knows case statuses', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Manages your Google listing and reviews automatically', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Sends nurture emails to leads who haven\'t signed yet', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'clio', 'google-business', 'mailchimp'],

    email_templates: [
      { name: 'New Lead Follow-Up', subject: 'Your Free Consultation with {{business_name}}', body: "Hi {{client_name}},\n\nThank you for reaching out to {{business_name}}. We understand this is a stressful time, and we're here to help.\n\nWe'd like to schedule your free consultation to review your case. There's no cost and no obligation.\n\nClick here to pick a time that works for you: {{booking_link}}\n\nIf you'd prefer, you can also call us at {{phone}}.\n\nTake care,\n{{business_name}}", trigger: 'new_lead' },
      { name: 'Case Status Update', subject: 'Update on Your Case — {{business_name}}', body: "Hi {{client_name}},\n\nWe wanted to give you a quick update on your case.\n\n{{case_update}}\n\nIf you have any questions, don't hesitate to call us at {{phone}} or reply to this email.\n\nBest,\n{{business_name}}", trigger: 'case_update' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, this is {{business_name}}. Just a reminder about your free consultation tomorrow at {{time}}. Reply YES to confirm or call us at {{phone}} to reschedule.", trigger: 'appointment_reminder' },
      { name: 'New Lead Quick Response', body: "Hi {{client_name}}, thanks for contacting {{business_name}}. We got your message and want to help. When's a good time for a free consultation? Call or text us back.", trigger: 'new_lead' }
    ],

    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3200,
    ideal_plan: 'growth',
    competitor_tools: ['Clio Grow', 'Lawmatics', 'IntakeQ']
  },

  {
    id: 'family-law-attorney',
    industry: 'Legal',
    niche: 'Family Law Attorney',
    display_name: 'Family Law Practice',
    emoji: '👨‍👩‍👧',
    tagline: 'Handle sensitive family matters with care while keeping your calendar full.',

    demo_greeting: "Hi! I'm your AI assistant for a family law practice. I can help with scheduling consultations, answering questions about divorce and custody processes, and keeping clients informed. What would you like to know?",
    demo_system_prompt: "You are a compassionate AI assistant for a family law practice. You help potential clients understand the general process for divorce, custody, adoption, and other family law matters. NEVER give legal advice or predict outcomes. Be sensitive — these clients are going through some of the hardest moments of their lives. Always recommend scheduling a consultation with an attorney.",
    demo_suggested_messages: [
      "I'm thinking about getting a divorce — where do I start?",
      "How does child custody work in our state?",
      "How much does a family law attorney cost?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a family law practice. You help potential clients schedule consultations and understand the general process for family law matters. NEVER give legal advice, predict outcomes, or take sides. Be compassionate and non-judgmental — clients may be dealing with divorce, custody disputes, domestic violence, or other deeply personal issues. If someone mentions abuse or immediate danger, provide the National Domestic Violence Hotline: 1-800-799-7233. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. How can I help you today?",
    receptionist_system_prompt: "You are the phone receptionist for a family law practice. Be warm and non-judgmental. Determine what type of matter the caller needs help with (divorce, custody, adoption, prenup, etc.). Gather their name, contact info, and a brief description. Schedule an initial consultation. NEVER give legal advice. If a caller mentions domestic violence or immediate danger, provide the National Domestic Violence Hotline: 1-800-799-7233 and offer to transfer to an attorney.",
    receptionist_faqs: [
      { question: "How much does a divorce cost?", answer: "Costs vary depending on the complexity of your situation — whether it's contested or uncontested, if there are children involved, and other factors. Our attorneys can give you a clear fee estimate during your initial consultation.", category: "fees" },
      { question: "How long does a divorce take?", answer: "It depends on your state and situation. An uncontested divorce can take a few months, while contested cases can take a year or more. Your attorney can give you a better timeline after reviewing your case.", category: "process" },
      { question: "Do I need a lawyer for custody?", answer: "While it's not required, having an attorney can make a significant difference — especially if the other parent has one. We'd recommend scheduling a consultation to discuss your options.", category: "custody" },
      { question: "Is the consultation confidential?", answer: "Absolutely. Everything you discuss with our attorneys is protected by attorney-client privilege, even if you decide not to hire us.", category: "confidentiality" }
    ],
    receptionist_transfer_triggers: [
      "caller mentions domestic violence or abuse",
      "caller says they just got served with papers",
      "caller mentions an emergency custody situation",
      "caller is emotional and needs immediate reassurance",
      "caller mentions a restraining order"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: 'Tell us about your family law firm.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Johnson Family Law', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 234-5678', required: true },
        { name: 'practice_areas', label: 'Areas of practice', type: 'multiselect', placeholder: '', required: true, options: ['Divorce', 'Child Custody', 'Child Support', 'Adoption', 'Prenuptial Agreements', 'Domestic Violence', 'Paternity', 'Guardianship', 'Mediation'] }
      ]},
      { step_number: 2, title: 'Consultations', description: 'How do you meet with potential clients?', fields: [
        { name: 'consultation_fee', label: 'Initial consultation fee', type: 'currency', placeholder: '150', required: true, help_text: 'Enter 0 if free' },
        { name: 'consultation_length', label: 'Consultation length', type: 'select', placeholder: '', required: true, options: ['30 minutes', '45 minutes', '1 hour'] }
      ]},
      { step_number: 3, title: 'Hours & Location', description: 'When and where can clients see you?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'virtual_available', label: 'Offer virtual consultations?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Additional Info', description: 'Anything else clients should know?', fields: [
        { name: 'languages', label: 'Languages spoken', type: 'multiselect', placeholder: '', required: false, options: ['English', 'Spanish', 'French', 'Portuguese', 'Chinese', 'Korean'] },
        { name: 'payment_plans', label: 'Do you offer payment plans?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Inquiries', description: 'Potential clients who reached out', priority: 1 },
      { id: 'consultations', title: 'Upcoming Consultations', description: 'Scheduled initial meetings', priority: 2 },
      { id: 'active-cases', title: 'Active Cases', description: 'Current client matters', priority: 3 },
      { id: 'deadlines', title: 'Upcoming Deadlines', description: 'Filing deadlines and court dates', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up with divorce inquiry', description: 'Respond to potential client who called about an uncontested divorce.', category: 'leads', difficulty: 'automatic' },
      { title: 'Send consultation prep email', description: 'Email new client what to bring to their first meeting.', category: 'client-communication', difficulty: 'automatic' },
      { title: 'Court date reminder', description: 'Remind client about their custody hearing next week.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Document request follow-up', description: 'Follow up with client who hasn\'t sent financial documents yet.', category: 'case-management', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'New Inquiries', unit: 'per month', description: 'Number of potential clients contacting your office', target_suggestion: 30 },
      { name: 'Consultation Booking Rate', unit: 'percent', description: 'Percentage of inquiries that become scheduled consultations', target_suggestion: 50 },
      { name: 'Client Retention Rate', unit: 'percent', description: 'Percentage of consultations that become signed clients', target_suggestion: 40 },
      { name: 'Response Time', unit: 'minutes', description: 'Average time to respond to new inquiries', target_suggestion: 30 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Lets potential clients book consultations online', priority: 'essential' },
      { name: 'Clio', slug: 'clio', category: 'legal', why: 'Syncs case management and client communication', priority: 'essential' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'billing', why: 'Tracks retainer payments and billing', priority: 'recommended' },
      { name: 'DocuSign', slug: 'docusign', category: 'documents', why: 'Clients can sign retainer agreements remotely', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'clio', 'quickbooks', 'docusign'],

    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Consultation with {{business_name}} — What to Bring', body: "Hi {{client_name}},\n\nYour consultation is confirmed for {{date}} at {{time}}.\n\nTo make the most of our time together, please bring:\n- A photo ID\n- Any court documents you've received\n- Financial statements (if applicable)\n- A list of questions you'd like to ask\n\nEverything we discuss is confidential.\n\nSee you soon,\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Post-Consultation Follow-Up', subject: 'Next Steps — {{business_name}}', body: "Hi {{client_name}},\n\nThank you for meeting with us. We understand this is a difficult time, and we're here to support you.\n\nIf you'd like to move forward, here are the next steps:\n{{next_steps}}\n\nFeel free to call us at {{phone}} with any questions.\n\nWarmly,\n{{business_name}}", trigger: 'post_consultation' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, this is {{business_name}}. Your consultation is tomorrow at {{time}}. Please bring any court documents and a photo ID. Call {{phone}} if you need to reschedule.", trigger: 'appointment_reminder' },
      { name: 'New Inquiry Response', body: "Hi {{client_name}}, thank you for reaching out to {{business_name}}. We'd love to schedule a consultation. Call us at {{phone}} or reply with a time that works for you.", trigger: 'new_lead' }
    ],

    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2800,
    ideal_plan: 'growth',
    competitor_tools: ['Clio Grow', 'Lawmatics', 'MyCase']
  },

  {
    id: 'criminal-defense-lawyer',
    industry: 'Legal',
    niche: 'Criminal Defense Lawyer',
    display_name: 'Criminal Defense Law Firm',
    emoji: '🛡️',
    tagline: 'Respond to urgent client calls fast and never miss a case that needs you.',

    demo_greeting: "Hi! I'm your AI assistant for a criminal defense firm. I can help people understand the process, schedule urgent consultations, and answer general questions. What can I help with?",
    demo_system_prompt: "You are an AI assistant for a criminal defense law firm. You help callers understand the general process, schedule consultations, and determine urgency. NEVER give legal advice or discuss case strategy. Be direct and calm — callers are often scared and need reassurance. If someone is currently in custody, prioritize getting attorney contact info to them or their family immediately.",
    demo_suggested_messages: [
      "My son was just arrested — what do I do?",
      "What happens at a first court appearance?",
      "Do you handle DUI cases?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a criminal defense law firm. You help potential clients and their families schedule urgent consultations and understand the general process. NEVER give legal advice, discuss strategy, or predict outcomes. Be calm and direct — callers are often panicked. If someone says their loved one is in custody RIGHT NOW, treat it as urgent and connect them with an attorney immediately. Business hours: {{business_hours}}. Emergency line: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Is this about a new matter, or are you an existing client?",
    receptionist_system_prompt: "You are the phone receptionist for a criminal defense firm. Determine urgency immediately: if someone is currently in custody or has a court date within 48 hours, treat as urgent and transfer to an attorney. For non-urgent matters, gather: caller name, relationship to the accused, type of charges, when the arrest happened, and contact info. Schedule a consultation. NEVER give legal advice. Be calm and reassuring.",
    receptionist_faqs: [
      { question: "How much do you charge?", answer: "Fees depend on the type and complexity of the case. We offer an initial consultation where the attorney can give you a clear fee quote. Many cases can be handled on a flat fee basis.", category: "fees" },
      { question: "Can you get the charges dropped?", answer: "I can't predict any outcomes, but our attorneys will thoroughly review your case and fight for the best possible result. The first step is scheduling a consultation.", category: "outcomes" },
      { question: "My family member is in jail right now", answer: "I understand this is urgent. Let me get your information and connect you with an attorney right away. Do you know which facility they're being held at?", category: "urgent" },
      { question: "Do I need a lawyer or can I use a public defender?", answer: "That's your choice, but a private attorney can typically dedicate more time and attention to your case. Our attorney can discuss this during your consultation.", category: "process" }
    ],
    receptionist_transfer_triggers: [
      "someone is currently in custody",
      "court date is within 48 hours",
      "caller mentions felony charges",
      "caller is crying or extremely distressed",
      "caller mentions a warrant"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Firm', description: 'Basic information about your practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Davis Criminal Defense', required: true },
        { name: 'phone', label: 'Main Phone / Emergency Line', type: 'phone', placeholder: '(555) 345-6789', required: true },
        { name: 'case_types', label: 'Types of cases you handle', type: 'multiselect', placeholder: '', required: true, options: ['DUI/DWI', 'Drug Offenses', 'Assault', 'Theft/Burglary', 'Domestic Violence', 'White Collar', 'Federal Cases', 'Juvenile', 'Traffic/Misdemeanors', 'Probation Violations'] }
      ]},
      { step_number: 2, title: 'Availability', description: 'When can clients reach you?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '8:00 AM - 6:00 PM', required: true },
        { name: 'after_hours', label: 'Available 24/7 for emergencies?', type: 'toggle', placeholder: '', required: true, help_text: 'Arrests happen at all hours — being available can win cases' }
      ]},
      { step_number: 3, title: 'Consultations & Fees', description: 'How you work with clients.', fields: [
        { name: 'consultation_fee', label: 'Initial consultation fee', type: 'currency', placeholder: '0', required: true },
        { name: 'fee_type', label: 'Primary fee structure', type: 'select', placeholder: '', required: true, options: ['Flat Fee (most cases)', 'Hourly', 'Retainer + Hourly', 'Varies by case'] },
        { name: 'payment_plans', label: 'Offer payment plans?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Service Area', description: 'Where you practice.', fields: [
        { name: 'courts_served', label: 'Courts you regularly appear in', type: 'text', placeholder: 'All county and municipal courts in Harris County', required: true },
        { name: 'languages', label: 'Languages spoken', type: 'multiselect', placeholder: '', required: false, options: ['English', 'Spanish', 'Vietnamese', 'Chinese', 'Arabic'] }
      ]}
    ],

    dashboard_widgets: [
      { id: 'urgent-calls', title: 'Urgent Calls', description: 'People with active arrests or imminent court dates', priority: 1 },
      { id: 'new-leads', title: 'New Case Inquiries', description: 'Potential clients who reached out', priority: 2 },
      { id: 'court-dates', title: 'Upcoming Court Dates', description: 'Hearings and appearances this week', priority: 3 },
      { id: 'client-updates', title: 'Client Updates Due', description: 'Clients who need a status call', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Return urgent call — arrest last night', description: 'Family member called about a DUI arrest that happened last night. Needs attorney callback ASAP.', category: 'urgent', difficulty: 'automatic' },
      { title: 'Send court date reminder', description: 'Remind client about their arraignment hearing on Thursday.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Follow up with consultation lead', description: 'Potential client asked about drug possession charges but hasn\'t booked yet.', category: 'leads', difficulty: 'needs-approval' },
      { title: 'Post-court update to client', description: 'Update client on what happened at today\'s hearing and next steps.', category: 'client-communication', difficulty: 'supervised' }
    ],
    kpis: [
      { name: 'New Case Inquiries', unit: 'per month', description: 'Potential clients reaching out', target_suggestion: 35 },
      { name: 'Urgent Response Time', unit: 'minutes', description: 'How quickly you respond to custody/arrest calls', target_suggestion: 10 },
      { name: 'Consultation-to-Retained', unit: 'percent', description: 'Percentage of consultations that sign', target_suggestion: 45 },
      { name: 'Cases Resolved', unit: 'per month', description: 'Number of cases closed each month', target_suggestion: 8 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages court dates and client meetings in one place', priority: 'essential' },
      { name: 'Clio', slug: 'clio', category: 'legal', why: 'Tracks cases, deadlines, and client communication', priority: 'essential' },
      { name: 'Twilio', slug: 'twilio', category: 'communication', why: 'Enables 24/7 text responses for urgent inquiries', priority: 'recommended' },
      { name: 'LawPay', slug: 'lawpay', category: 'billing', why: 'Accepts retainer payments and manages trust accounts', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'clio', 'twilio', 'lawpay'],

    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Consultation with {{business_name}}', body: "Hi {{client_name}},\n\nYour consultation is confirmed for {{date}} at {{time}}.\n\nPlease bring:\n- Any paperwork related to your case (arrest report, citation, court notices)\n- A photo ID\n- A list of questions\n\nEverything discussed is confidential and protected by attorney-client privilege.\n\nSee you then,\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Court Date Reminder', subject: 'Court Date Reminder — {{date}}', body: "Hi {{client_name}},\n\nThis is a reminder that your court date is on {{date}} at {{time}} at {{court_name}}.\n\nPlease arrive 15 minutes early. Dress professionally — business casual at minimum.\n\nIf you have any questions before your hearing, call us at {{phone}}.\n\n{{business_name}}", trigger: 'court_reminder' }
    ],
    sms_templates: [
      { name: 'Urgent Response', body: "This is {{business_name}}. We received your message and understand the urgency. An attorney will call you back within the hour. If this is a life-threatening emergency, please call 911.", trigger: 'urgent_inquiry' },
      { name: 'Court Reminder', body: "Reminder: Your court date is {{date}} at {{time}} at {{court_name}}. Arrive 15 min early. Dress professionally. Call {{phone}} with questions.", trigger: 'court_reminder' }
    ],

    estimated_hours_saved_weekly: 15,
    estimated_monthly_value: 3500,
    ideal_plan: 'growth',
    competitor_tools: ['Clio Grow', 'Lawmatics', 'MyCase']
  },

  {
    id: 'immigration-lawyer',
    industry: 'Legal',
    niche: 'Immigration Lawyer',
    display_name: 'Immigration Law Practice',
    emoji: '🌎',
    tagline: 'Help more families navigate immigration with clear communication in any language.',

    demo_greeting: "Hi! I'm your AI assistant for an immigration law practice. I can help with scheduling consultations, explaining general immigration processes, and answering common questions. How can I help?",
    demo_system_prompt: "You are an AI assistant for an immigration law practice. You help potential clients understand general immigration processes and schedule consultations. NEVER give legal advice, predict case outcomes, or comment on someone's immigration status. Be patient and clear — many callers may be stressed about their situation or have English as a second language. Use simple, clear language.",
    demo_suggested_messages: [
      "I want to apply for a green card — where do I start?",
      "My work visa is expiring soon — can you help?",
      "How long does the citizenship process take?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, an immigration law firm. You help potential clients schedule consultations and understand general immigration processes. NEVER give legal advice, predict outcomes, or ask about someone's current immigration status. Use simple, clear language — many clients are not native English speakers. Be patient, kind, and reassuring. If someone mentions ICE enforcement or fear of deportation, treat it as urgent and connect them with an attorney. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you calling about a new immigration matter, or are you an existing client?",
    receptionist_system_prompt: "You are the phone receptionist for an immigration law firm. Be patient and use simple language. Gather: caller name, type of immigration matter (visa, green card, citizenship, asylum, etc.), country of origin, and any urgent deadlines. Schedule a consultation. NEVER ask about someone's current immigration status or give legal advice. If someone mentions ICE, detention, or deportation, treat as urgent and transfer immediately.",
    receptionist_faqs: [
      { question: "How much does it cost?", answer: "Fees depend on the type of case. Our attorneys offer an initial consultation where they can explain the process and give you a clear fee estimate. Government filing fees are separate from attorney fees.", category: "fees" },
      { question: "How long does a green card take?", answer: "Processing times vary widely depending on the type of petition, your country of origin, and current backlogs. Your attorney can give you a realistic timeline during your consultation.", category: "process" },
      { question: "Can you help with asylum?", answer: "Yes, our attorneys handle asylum cases. Given the time-sensitive nature of asylum claims, I'd recommend scheduling a consultation as soon as possible.", category: "services" },
      { question: "Do you speak Spanish?", answer: "Yes, we have Spanish-speaking staff available. We also work with interpreters for other languages. Don't worry — we'll make sure you're understood.", category: "languages" }
    ],
    receptionist_transfer_triggers: [
      "caller mentions ICE, detention, or deportation",
      "caller has a deadline within 2 weeks",
      "caller mentions asylum or fear of persecution",
      "caller is calling from a detention facility",
      "caller mentions DACA renewal expiring soon"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: 'Tell us about your immigration firm.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Garcia Immigration Law', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 456-7890', required: true },
        { name: 'services', label: 'Immigration services you offer', type: 'multiselect', placeholder: '', required: true, options: ['Family-Based Green Cards', 'Employment-Based Visas', 'Citizenship/Naturalization', 'Asylum/Refugee', 'DACA', 'Deportation Defense', 'Business Immigration', 'Student Visas', 'VAWA/U-Visa'] }
      ]},
      { step_number: 2, title: 'Languages', description: 'What languages does your office support?', fields: [
        { name: 'languages', label: 'Languages spoken by staff', type: 'multiselect', placeholder: '', required: true, options: ['English', 'Spanish', 'Portuguese', 'French', 'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Korean', 'Vietnamese', 'Arabic', 'Hindi', 'Tagalog', 'Haitian Creole'] },
        { name: 'interpreter_available', label: 'Can you arrange interpreters for other languages?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 3, title: 'Consultations', description: 'How do you meet with clients?', fields: [
        { name: 'consultation_fee', label: 'Initial consultation fee', type: 'currency', placeholder: '100', required: true },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 6:00 PM', required: true },
        { name: 'virtual_consultations', label: 'Offer phone/video consultations?', type: 'toggle', placeholder: '', required: true, help_text: 'Many immigration clients are in other cities or countries' }
      ]},
      { step_number: 4, title: 'Payment', description: 'How clients pay.', fields: [
        { name: 'payment_plans', label: 'Do you offer payment plans?', type: 'toggle', placeholder: '', required: true, help_text: 'Many immigration cases involve significant filing fees' },
        { name: 'payment_methods', label: 'Payment methods accepted', type: 'multiselect', placeholder: '', required: false, options: ['Cash', 'Check', 'Credit Card', 'Zelle', 'Wire Transfer'] }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Inquiries', description: 'Potential clients who contacted you', priority: 1 },
      { id: 'deadlines', title: 'Filing Deadlines', description: 'Upcoming USCIS deadlines and expiration dates', priority: 2 },
      { id: 'case-status', title: 'Case Status Updates', description: 'Cases with new USCIS updates', priority: 3 },
      { id: 'consultations', title: 'Upcoming Consultations', description: 'Scheduled initial meetings', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Respond to green card inquiry', description: 'New potential client asking about family-based green card process.', category: 'leads', difficulty: 'automatic' },
      { title: 'DACA renewal reminder', description: 'Remind client their DACA expires in 150 days — time to start renewal.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Document checklist follow-up', description: 'Client hasn\'t submitted required documents for their I-130 petition.', category: 'case-management', difficulty: 'needs-approval' },
      { title: 'Case status update', description: 'USCIS shows update on client\'s case — notify them of progress.', category: 'client-communication', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Inquiries', unit: 'per month', description: 'Potential clients contacting your office', target_suggestion: 25 },
      { name: 'Cases Filed', unit: 'per month', description: 'Petitions and applications filed with USCIS', target_suggestion: 10 },
      { name: 'Approval Rate', unit: 'percent', description: 'Percentage of cases approved by USCIS', target_suggestion: 90 },
      { name: 'Response Time', unit: 'hours', description: 'Average time to respond to inquiries', target_suggestion: 4 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages consultations across time zones', priority: 'essential' },
      { name: 'Docketwise', slug: 'docketwise', category: 'legal', why: 'Immigration-specific case management and form preparation', priority: 'essential' },
      { name: 'WhatsApp', slug: 'whatsapp', category: 'communication', why: 'Many immigration clients prefer WhatsApp for communication', priority: 'recommended' },
      { name: 'DocuSign', slug: 'docusign', category: 'documents', why: 'Remote signing for clients in other cities or countries', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'docketwise', 'whatsapp', 'docusign'],

    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Immigration Consultation — {{business_name}}', body: "Hi {{client_name}},\n\nYour consultation is confirmed for {{date}} at {{time}}.\n\nPlease bring:\n- Passport and any current visa documents\n- I-94 record (if applicable)\n- Any USCIS notices or receipts\n- Proof of relationship (if family-based petition)\n\nIf you prefer the consultation in another language, please let us know in advance.\n\nSee you soon,\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Document Checklist', subject: 'Documents Needed for Your Case — {{business_name}}', body: "Hi {{client_name}},\n\nTo move forward with your case, we need the following documents:\n\n{{document_list}}\n\nPlease send copies as soon as possible. You can email them, bring them in, or upload them to your client portal.\n\nIf you have questions about any item on this list, don't hesitate to call us at {{phone}}.\n\nBest,\n{{business_name}}", trigger: 'documents_needed' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, this is {{business_name}}. Your immigration consultation is tomorrow at {{time}}. Please bring your passport and any USCIS notices. Call {{phone}} to reschedule.", trigger: 'appointment_reminder' },
      { name: 'Case Update', body: "Hi {{client_name}}, your case has a new update from USCIS. Please call us at {{phone}} or check your email for details.", trigger: 'case_update' }
    ],

    estimated_hours_saved_weekly: 13,
    estimated_monthly_value: 2900,
    ideal_plan: 'growth',
    competitor_tools: ['Docketwise', 'INSZoom', 'LawLogix']
  },

  {
    id: 'estate-planning-attorney',
    industry: 'Legal',
    niche: 'Estate Planning Attorney',
    display_name: 'Estate Planning Law Firm',
    emoji: '📜',
    tagline: 'Help families protect their legacy with wills, trusts, and peace of mind.',

    demo_greeting: "Hi! I'm your AI assistant for an estate planning law firm. I can help answer general questions about wills, trusts, and powers of attorney, and schedule consultations. How can I help?",
    demo_system_prompt: "You are an AI assistant for an estate planning law firm. Help potential clients understand the general differences between wills and trusts, the importance of estate planning, and schedule consultations. NEVER give legal advice or recommend specific estate planning strategies. Be warm and patient — many people feel uncomfortable thinking about end-of-life planning.",
    demo_suggested_messages: [
      "What's the difference between a will and a trust?",
      "Do I really need estate planning if I'm not wealthy?",
      "How much does a basic will cost?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, an estate planning law firm. You help potential clients understand the importance of estate planning, explain general concepts, and schedule consultations. NEVER give legal advice or recommend specific strategies. Be warm, patient, and reassuring — many people feel anxious about planning for end-of-life. Normalize the process: estate planning is about protecting the people you love. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you calling to learn about estate planning, or are you an existing client?",
    receptionist_system_prompt: "You are the phone receptionist for an estate planning firm. Be warm and patient. Determine what the caller needs (will, trust, power of attorney, estate administration, etc.) and whether this is new planning or updating existing documents. Gather name, contact info, and any time-sensitive concerns. Schedule a consultation. NEVER give legal advice.",
    receptionist_faqs: [
      { question: "How much does a will cost?", answer: "A basic will typically starts around $300-500, but it depends on your situation. Our attorney can give you an exact quote during a consultation — and they'll help you figure out if a will alone is enough or if you might benefit from a trust.", category: "fees" },
      { question: "Do I need a trust?", answer: "It depends on your assets, family situation, and goals. A trust can help avoid probate and provide more control, but it's not right for everyone. Your attorney can walk you through the options during a consultation.", category: "services" },
      { question: "I just need to update my will", answer: "We can definitely help with that. Changes in life — marriage, divorce, new children, new assets — are great reasons to update your documents. Let's schedule a time to review your current estate plan.", category: "updates" },
      { question: "Someone just passed away — what do I do?", answer: "I'm so sorry for your loss. If you're the executor or personal representative, our attorneys can guide you through the probate process. Let me schedule a consultation as soon as possible.", category: "probate" }
    ],
    receptionist_transfer_triggers: [
      "caller says someone just passed away",
      "caller mentions they are terminally ill",
      "caller is elderly and wants to do this urgently",
      "caller mentions a dispute over a will or estate",
      "caller asks about disinheriting someone"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Firm', description: 'Tell us about your estate planning practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Heritage Law Group', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 567-8901', required: true },
        { name: 'services', label: 'Services you offer', type: 'multiselect', placeholder: '', required: true, options: ['Wills', 'Revocable Living Trusts', 'Irrevocable Trusts', 'Powers of Attorney', 'Healthcare Directives', 'Probate Administration', 'Trust Administration', 'Guardianship', 'Asset Protection', 'Business Succession'] }
      ]},
      { step_number: 2, title: 'Pricing', description: 'How do you price your services?', fields: [
        { name: 'pricing_model', label: 'Pricing model', type: 'select', placeholder: '', required: true, options: ['Flat Fee Packages', 'Hourly', 'Flat Fee for Docs + Hourly for Administration'] },
        { name: 'basic_will_price', label: 'Starting price for a basic will', type: 'currency', placeholder: '350', required: false },
        { name: 'consultation_fee', label: 'Initial consultation fee', type: 'currency', placeholder: '0', required: true }
      ]},
      { step_number: 3, title: 'Hours', description: 'When can clients meet with you?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'home_visits', label: 'Do you offer in-home visits?', type: 'toggle', placeholder: '', required: false, help_text: 'For elderly or homebound clients' }
      ]},
      { step_number: 4, title: 'Additional Details', description: 'Other info for clients.', fields: [
        { name: 'signing_witnesses', label: 'Do you provide signing witnesses?', type: 'toggle', placeholder: '', required: false },
        { name: 'document_storage', label: 'Do you store original documents?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Inquiries', description: 'People interested in estate planning', priority: 1 },
      { id: 'consultations', title: 'Upcoming Consultations', description: 'Scheduled meetings this week', priority: 2 },
      { id: 'documents-ready', title: 'Documents Ready for Signing', description: 'Clients whose documents are prepared', priority: 3 },
      { id: 'annual-reviews', title: 'Annual Reviews Due', description: 'Existing clients due for plan reviews', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up with will inquiry', description: 'Potential client asked about creating a basic will last week.', category: 'leads', difficulty: 'automatic' },
      { title: 'Schedule signing appointment', description: 'Client\'s trust documents are ready — schedule signing with witnesses.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Annual review reminder', description: 'Remind existing client it\'s been a year since their plan was created — offer a review.', category: 'retention', difficulty: 'automatic' },
      { title: 'Send document prep questionnaire', description: 'Send new client the intake questionnaire to prepare their estate plan.', category: 'onboarding', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Inquiries', unit: 'per month', description: 'People reaching out about estate planning', target_suggestion: 20 },
      { name: 'Plans Completed', unit: 'per month', description: 'Estate plans signed and finalized', target_suggestion: 8 },
      { name: 'Annual Review Rate', unit: 'percent', description: 'Existing clients who come back for annual reviews', target_suggestion: 30 },
      { name: 'Average Plan Value', unit: 'dollars', description: 'Average revenue per completed estate plan', target_suggestion: 2500 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Clients book consultations and signing appointments online', priority: 'essential' },
      { name: 'Clio', slug: 'clio', category: 'legal', why: 'Manages client matters and document workflows', priority: 'essential' },
      { name: 'DocuSign', slug: 'docusign', category: 'documents', why: 'For documents that can be signed electronically', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Sends annual review reminders and estate planning tips', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'clio', 'docusign', 'mailchimp'],

    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Estate Planning Consultation — {{business_name}}', body: "Hi {{client_name}},\n\nYour consultation is scheduled for {{date}} at {{time}}.\n\nTo make the most of our time, please think about:\n- Who you'd like to inherit your assets\n- Who you'd trust to make medical decisions for you\n- Whether you have minor children who need guardians\n- Any specific concerns about your estate\n\nNo need to have all the answers — that's what we're here for.\n\nSee you soon,\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Annual Review Reminder', subject: 'Time for Your Annual Estate Plan Review', body: "Hi {{client_name}},\n\nIt's been about a year since we created (or last reviewed) your estate plan. Life changes — marriages, births, new assets, moves — can all affect your plan.\n\nWe'd love to schedule a quick review to make sure everything is still up to date.\n\nCall us at {{phone}} or click here to book: {{booking_link}}\n\nBest,\n{{business_name}}", trigger: 'annual_review' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, this is {{business_name}}. Your estate planning consultation is tomorrow at {{time}}. No special prep needed — just come with your questions. Call {{phone}} to reschedule.", trigger: 'appointment_reminder' },
      { name: 'Documents Ready', body: "Hi {{client_name}}, your estate planning documents are ready for review and signing. Please call {{phone}} to schedule your signing appointment.", trigger: 'documents_ready' }
    ],

    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2400,
    ideal_plan: 'pro',
    competitor_tools: ['Clio', 'WealthCounsel', 'Smokeball']
  },

  {
    id: 'bankruptcy-attorney',
    industry: 'Legal',
    niche: 'Bankruptcy Attorney',
    display_name: 'Bankruptcy Law Firm',
    emoji: '💰',
    tagline: 'Give overwhelmed debtors a fresh start with compassionate, efficient service.',

    demo_greeting: "Hi! I'm your AI assistant for a bankruptcy law firm. I can help you understand your options, answer general questions about the process, and schedule a free consultation. What's on your mind?",
    demo_system_prompt: "You are an AI assistant for a bankruptcy law firm. Help callers understand the general bankruptcy process, the difference between Chapter 7 and Chapter 13, and schedule consultations. NEVER give legal advice or tell someone which chapter to file. Be compassionate — people calling about bankruptcy are often embarrassed and stressed. Normalize it: bankruptcy is a legal right designed to give people a fresh start.",
    demo_suggested_messages: [
      "What's the difference between Chapter 7 and Chapter 13?",
      "Will I lose my house if I file bankruptcy?",
      "How much does bankruptcy cost?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a bankruptcy law firm. Help potential clients understand their options and schedule consultations. NEVER give legal advice or recommend a specific chapter. Be compassionate and non-judgmental — people are often embarrassed to call. Normalize the process: bankruptcy is a legal tool, not a failure. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you looking into your debt relief options, or are you an existing client?",
    receptionist_system_prompt: "You are the phone receptionist for a bankruptcy law firm. Be warm and non-judgmental. Determine the caller's situation: type of debt (credit cards, medical, mortgage, business), whether they've been sued or garnished, and any urgent deadlines (foreclosure, wage garnishment, repossession). Schedule a free consultation. NEVER give legal advice or recommend a specific chapter.",
    receptionist_faqs: [
      { question: "Will bankruptcy ruin my credit?", answer: "Bankruptcy does affect your credit, but many people's credit is already suffering from the debt itself. Many of our clients actually see their credit improve within a year or two of filing because the debt is gone. Your attorney can explain this in detail.", category: "credit" },
      { question: "Can I keep my car and house?", answer: "In many cases, yes. Both Chapter 7 and Chapter 13 have exemptions that protect your property. Your attorney will review your specific situation during the consultation.", category: "assets" },
      { question: "How much does it cost?", answer: "We offer a free initial consultation. Our attorney fees vary depending on the type of bankruptcy and complexity of your case. We also offer payment plans so you can get started right away.", category: "fees" },
      { question: "I'm being garnished — can you help?", answer: "Yes — filing bankruptcy triggers an automatic stay that stops most garnishments immediately. If your wages are being garnished, I'd recommend scheduling a consultation as soon as possible.", category: "urgent" }
    ],
    receptionist_transfer_triggers: [
      "caller says their wages are being garnished right now",
      "caller mentions a foreclosure sale date",
      "caller says their car is being repossessed",
      "caller mentions a lawsuit deadline",
      "caller is very emotional or in crisis"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Firm', description: 'Tell us about your bankruptcy practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Fresh Start Law', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 678-9012', required: true },
        { name: 'chapters_handled', label: 'Chapters you handle', type: 'multiselect', placeholder: '', required: true, options: ['Chapter 7', 'Chapter 13', 'Chapter 11 (Business)', 'Debt Negotiation (non-bankruptcy)'] }
      ]},
      { step_number: 2, title: 'Consultations', description: 'How do you meet with clients?', fields: [
        { name: 'consultation_fee', label: 'Initial consultation fee', type: 'select', placeholder: '', required: true, options: ['Free', 'Paid — applied to retainer'] },
        { name: 'consultation_types', label: 'How can clients meet you?', type: 'multiselect', placeholder: '', required: true, options: ['In-Office', 'Phone', 'Video Call'] }
      ]},
      { step_number: 3, title: 'Hours & Fees', description: 'When are you available and how do you charge?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'payment_plans', label: 'Offer payment plans for attorney fees?', type: 'toggle', placeholder: '', required: true, help_text: 'Most bankruptcy clients need flexible payment options' }
      ]},
      { step_number: 4, title: 'Additional Info', description: 'Other details for clients.', fields: [
        { name: 'credit_counseling', label: 'Do you help arrange required credit counseling?', type: 'toggle', placeholder: '', required: false, help_text: 'Required pre-filing course for all bankruptcy filers' },
        { name: 'languages', label: 'Languages spoken', type: 'multiselect', placeholder: '', required: false, options: ['English', 'Spanish', 'Chinese', 'Korean', 'Vietnamese'] }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Inquiries', description: 'People seeking debt relief', priority: 1 },
      { id: 'urgent-cases', title: 'Urgent Matters', description: 'Garnishments, foreclosures, and repossessions', priority: 2 },
      { id: 'consultations', title: 'Upcoming Consultations', description: 'Scheduled free consultations', priority: 3 },
      { id: 'active-cases', title: 'Active Filings', description: 'Cases in progress with the court', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up with garnishment inquiry', description: 'Caller mentioned wage garnishment — schedule urgent consultation.', category: 'urgent', difficulty: 'automatic' },
      { title: 'Send document checklist', description: 'New client needs to gather pay stubs, tax returns, and debt statements.', category: 'onboarding', difficulty: 'automatic' },
      { title: 'Credit counseling reminder', description: 'Remind client to complete the required pre-filing credit counseling course.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Court date reminder', description: 'Remind client about their 341 meeting of creditors.', category: 'reminders', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Inquiries', unit: 'per month', description: 'People calling about debt relief', target_suggestion: 30 },
      { name: 'Consultations Booked', unit: 'per month', description: 'Free consultations scheduled', target_suggestion: 20 },
      { name: 'Cases Filed', unit: 'per month', description: 'Bankruptcy petitions filed', target_suggestion: 8 },
      { name: 'Conversion Rate', unit: 'percent', description: 'Consultations that become retained clients', target_suggestion: 50 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Clients book free consultations online', priority: 'essential' },
      { name: 'Best Case', slug: 'best-case', category: 'legal', why: 'Bankruptcy petition preparation software', priority: 'essential' },
      { name: 'LawPay', slug: 'lawpay', category: 'billing', why: 'Manages payment plans for attorney fees', priority: 'recommended' },
      { name: 'Credit.org', slug: 'credit-org', category: 'compliance', why: 'Connects clients to required credit counseling', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'best-case', 'lawpay', 'credit-org'],

    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Free Bankruptcy Consultation — {{business_name}}', body: "Hi {{client_name}},\n\nYour free consultation is confirmed for {{date}} at {{time}}.\n\nPlease bring (or have handy if meeting by phone):\n- Last 2 years of tax returns\n- Recent pay stubs (last 6 months)\n- List of debts and monthly payments\n- Any lawsuit or garnishment paperwork\n\nDon't worry if you don't have everything — we can work with what you have.\n\nSee you soon,\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Document Checklist', subject: 'Documents Needed to File Your Case — {{business_name}}', body: "Hi {{client_name}},\n\nHere's what we need to move forward with your case:\n\n{{document_checklist}}\n\nPlease gather these as soon as you can. The sooner we have everything, the sooner we can get you relief.\n\nCall us at {{phone}} if you have questions.\n\n{{business_name}}", trigger: 'documents_needed' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, this is {{business_name}}. Your free consultation is tomorrow at {{time}}. Please bring your tax returns, pay stubs, and a list of debts. Call {{phone}} to reschedule.", trigger: 'appointment_reminder' },
      { name: 'Credit Counseling Reminder', body: "Hi {{client_name}}, reminder: you need to complete your pre-filing credit counseling before we can file. Here's the link: {{counseling_link}}. Call {{phone}} if you need help.", trigger: 'credit_counseling' }
    ],

    estimated_hours_saved_weekly: 11,
    estimated_monthly_value: 2600,
    ideal_plan: 'pro',
    competitor_tools: ['Best Case', 'Jubilee', 'Upsolve (DIY competitor)']
  },

  {
    id: 'real-estate-attorney',
    industry: 'Legal',
    niche: 'Real Estate Attorney',
    display_name: 'Real Estate Law Firm',
    emoji: '🏠',
    tagline: 'Close deals faster with automated document prep and client communication.',

    demo_greeting: "Hi! I'm your AI assistant for a real estate law firm. I can help with scheduling closings, answering general questions about real estate transactions, and keeping buyers and sellers informed. How can I help?",
    demo_system_prompt: "You are an AI assistant for a real estate law firm. Help callers with scheduling closings, understanding the general closing process, and answering questions about title searches, contracts, and real estate transactions. NEVER give legal advice. Be professional and efficient — real estate transactions move fast.",
    demo_suggested_messages: [
      "I'm buying a house — do I need a real estate attorney?",
      "What happens at a closing?",
      "How much does a real estate attorney charge?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a real estate law firm. You help clients schedule closings, track transaction progress, and answer general questions about the process. NEVER give legal advice. Be efficient and responsive — real estate deals have tight timelines. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you calling about a real estate transaction, or are you an existing client checking on a closing?",
    receptionist_system_prompt: "You are the receptionist for a real estate law firm. Determine if the caller is a buyer, seller, real estate agent, or lender. Gather: name, type of transaction (purchase, sale, refinance), property address, and closing date if known. Schedule as needed. Be efficient — real estate people are busy and want quick answers.",
    receptionist_faqs: [
      { question: "How much do you charge for a closing?", answer: "Our fees vary depending on the type of transaction and complexity. Typical residential closings are a flat fee. I can have the attorney give you an exact quote — what type of transaction is this?", category: "fees" },
      { question: "How long does a closing take?", answer: "The actual closing appointment is usually about an hour. The overall process from contract to close typically takes 30-45 days, depending on the lender and any title issues.", category: "process" },
      { question: "Do you handle commercial real estate?", answer: "Yes, our attorneys handle both residential and commercial transactions. Commercial deals may require additional review time. Let me schedule a consultation to discuss your specific deal.", category: "services" }
    ],
    receptionist_transfer_triggers: [
      "caller has a closing scheduled this week with an issue",
      "caller mentions a title problem or lien",
      "caller is a real estate agent with an urgent deal question",
      "caller mentions a closing that fell through",
      "caller mentions a boundary or easement dispute"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Firm', description: 'Tell us about your real estate practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Cornerstone Title & Law', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 789-0123', required: true },
        { name: 'services', label: 'Services you offer', type: 'multiselect', placeholder: '', required: true, options: ['Residential Closings', 'Commercial Closings', 'Refinancing', 'Title Searches', 'Title Insurance', 'Contract Review', 'Boundary/Easement Disputes', 'Landlord-Tenant', 'Zoning'] }
      ]},
      { step_number: 2, title: 'Closings', description: 'How do you handle closings?', fields: [
        { name: 'closing_location', label: 'Where do closings take place?', type: 'multiselect', placeholder: '', required: true, options: ['Our Office', 'Title Company', 'Client\'s Location', 'Remote/Virtual'] },
        { name: 'typical_fee', label: 'Typical residential closing fee', type: 'currency', placeholder: '750', required: false }
      ]},
      { step_number: 3, title: 'Hours', description: 'When is your office available?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
        { name: 'weekend_closings', label: 'Available for weekend closings?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Partnerships', description: 'Who do you work with?', fields: [
        { name: 'agent_referrals', label: 'Do you accept real estate agent referrals?', type: 'toggle', placeholder: '', required: false },
        { name: 'lender_partnerships', label: 'Preferred lender partners', type: 'text', placeholder: 'Local Credit Union, First National Bank', required: false }
      ]}
    ],

    dashboard_widgets: [
      { id: 'upcoming-closings', title: 'Upcoming Closings', description: 'Closings scheduled this week', priority: 1 },
      { id: 'title-searches', title: 'Title Searches in Progress', description: 'Pending title work', priority: 2 },
      { id: 'new-matters', title: 'New Matters', description: 'Recently opened transactions', priority: 3 },
      { id: 'agent-referrals', title: 'Agent Referrals', description: 'New business from real estate agents', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule closing appointment', description: 'Lender cleared to close — coordinate time with buyer, seller, and agents.', category: 'scheduling', difficulty: 'needs-approval' },
      { title: 'Send closing cost breakdown', description: 'Email buyer their estimated closing costs and what to bring.', category: 'client-communication', difficulty: 'automatic' },
      { title: 'Title search follow-up', description: 'Title search revealed a lien — notify client and discuss options.', category: 'case-management', difficulty: 'supervised' },
      { title: 'Thank you to referring agent', description: 'Send thank-you email to agent who referred the new client.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Closings Per Month', unit: 'count', description: 'Number of real estate closings completed', target_suggestion: 15 },
      { name: 'Agent Referrals', unit: 'per month', description: 'New matters from real estate agent referrals', target_suggestion: 8 },
      { name: 'Average Days to Close', unit: 'days', description: 'Average time from contract to closing', target_suggestion: 35 },
      { name: 'Client Satisfaction', unit: 'rating', description: 'Post-closing client feedback rating', target_suggestion: 4.9 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Coordinates closings with all parties', priority: 'essential' },
      { name: 'Qualia', slug: 'qualia', category: 'legal', why: 'Title and closing management platform', priority: 'essential' },
      { name: 'DocuSign', slug: 'docusign', category: 'documents', why: 'Remote signing for documents before closing', priority: 'recommended' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Helps agents find you through Google reviews', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'qualia', 'docusign', 'google-business'],

    email_templates: [
      { name: 'Closing Scheduled', subject: 'Your Closing is Scheduled — {{date}}', body: "Hi {{client_name}},\n\nYour closing is scheduled for:\n\nDate: {{date}}\nTime: {{time}}\nLocation: {{location}}\n\nPlease bring:\n- A valid photo ID\n- A cashier's check for {{amount}} (made payable to {{payee}})\n- Your homeowner's insurance binder\n\nIf you have any questions before closing, call us at {{phone}}.\n\nCongratulations — you're almost there!\n{{business_name}}", trigger: 'closing_scheduled' },
      { name: 'Post-Closing', subject: 'Congratulations on Your Closing!', body: "Hi {{client_name}},\n\nCongratulations on your closing today! Your recorded deed will be mailed to you once it's processed by the county — this usually takes 4-8 weeks.\n\nIf you have any questions in the meantime, don't hesitate to reach out.\n\nAll the best,\n{{business_name}}", trigger: 'post_closing' }
    ],
    sms_templates: [
      { name: 'Closing Reminder', body: "Hi {{client_name}}, reminder: your closing is tomorrow at {{time}} at {{location}}. Bring photo ID and cashier's check for {{amount}}. Call {{phone}} with questions.", trigger: 'closing_reminder' },
      { name: 'Closing Confirmed', body: "Great news, {{client_name}}! Your closing is officially scheduled for {{date}} at {{time}}. We'll send you full details by email shortly.", trigger: 'closing_scheduled' }
    ],

    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2700,
    ideal_plan: 'pro',
    competitor_tools: ['Qualia', 'SoftPro', 'Smokeball']
  },

  {
    id: 'business-law-attorney',
    industry: 'Legal',
    niche: 'Business Law Attorney',
    display_name: 'Business Law Firm',
    emoji: '🏢',
    tagline: 'Help entrepreneurs and small businesses stay protected and grow confidently.',

    demo_greeting: "Hi! I'm your AI assistant for a business law firm. I can help with scheduling consultations about business formation, contracts, disputes, and more. What can I help with?",
    demo_system_prompt: "You are an AI assistant for a business law firm. Help callers understand general business legal topics like entity formation, contracts, and business disputes. NEVER give legal advice. Be professional and efficient — business owners are busy and want clear answers.",
    demo_suggested_messages: [
      "Should I form an LLC or corporation?",
      "I need someone to review a contract",
      "A customer is threatening to sue my business"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a business law firm. You help business owners schedule consultations and understand general business legal concepts. NEVER give legal advice. Be professional and efficient — business owners value their time. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. How can I help your business today?",
    receptionist_system_prompt: "You are the phone receptionist for a business law firm. Determine the caller's need: business formation, contract review, dispute, employment matter, or other. Gather: business name, type of business, nature of the issue, and urgency. Schedule a consultation. Be professional and efficient.",
    receptionist_faqs: [
      { question: "How much does it cost to form an LLC?", answer: "Attorney fees for LLC formation typically run $500-$1,500 depending on the complexity and state requirements. This includes drafting the operating agreement, articles of organization, and other formation documents. State filing fees are additional.", category: "fees" },
      { question: "Can you review a contract for me?", answer: "Absolutely. We review all types of business contracts — leases, vendor agreements, partnership agreements, and more. We can usually turn around a review within a few business days.", category: "services" },
      { question: "I got a cease and desist letter", answer: "Don't ignore it, but don't panic either. Let me schedule a consultation so our attorney can review the letter and advise you on next steps.", category: "disputes" }
    ],
    receptionist_transfer_triggers: [
      "caller is being sued and has a deadline to respond",
      "caller mentions a partner dispute that's escalating",
      "caller needs emergency contract review for a deal closing soon",
      "caller mentions government investigation or regulatory issue"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Firm', description: 'Tell us about your business law practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Atlas Business Law', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 890-1234', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Business Formation (LLC, Corp, etc.)', 'Contract Drafting & Review', 'Business Disputes/Litigation', 'Employment Law', 'Intellectual Property', 'Mergers & Acquisitions', 'Commercial Leases', 'Business Succession Planning', 'Regulatory Compliance'] }
      ]},
      { step_number: 2, title: 'Clients', description: 'Who do you typically serve?', fields: [
        { name: 'client_types', label: 'Typical clients', type: 'multiselect', placeholder: '', required: true, options: ['Startups', 'Small Businesses', 'Mid-Size Companies', 'Franchises', 'Nonprofits', 'Solo Entrepreneurs'] },
        { name: 'industries_served', label: 'Industries you focus on (if any)', type: 'text', placeholder: 'All industries, or specify: tech, construction, healthcare, etc.', required: false }
      ]},
      { step_number: 3, title: 'Fees & Hours', description: 'How you charge and when you\'re available.', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '9:00 AM - 5:30 PM', required: true },
        { name: 'fee_structure', label: 'Primary fee structure', type: 'select', placeholder: '', required: true, options: ['Hourly', 'Flat Fee (for standard services)', 'Monthly Retainer', 'Varies by service'] }
      ]},
      { step_number: 4, title: 'Consultations', description: 'How do new clients get started?', fields: [
        { name: 'consultation_fee', label: 'Initial consultation fee', type: 'currency', placeholder: '200', required: true },
        { name: 'virtual_available', label: 'Virtual meetings available?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Business Inquiries', description: 'Business owners who reached out', priority: 1 },
      { id: 'active-matters', title: 'Active Matters', description: 'Ongoing client work', priority: 2 },
      { id: 'deadlines', title: 'Upcoming Deadlines', description: 'Filing and response deadlines', priority: 3 },
      { id: 'contract-reviews', title: 'Contracts in Review', description: 'Documents being reviewed or drafted', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Respond to LLC formation inquiry', description: 'Business owner wants to form an LLC — send info and schedule consultation.', category: 'leads', difficulty: 'automatic' },
      { title: 'Contract review follow-up', description: 'Client sent a vendor contract for review 3 days ago — send status update.', category: 'client-communication', difficulty: 'automatic' },
      { title: 'Annual filing reminder', description: 'Remind client about upcoming annual report filing deadline.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Demand letter response deadline', description: 'Client received a demand letter — response due in 10 days.', category: 'urgent', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'New Client Inquiries', unit: 'per month', description: 'New business owners reaching out', target_suggestion: 15 },
      { name: 'Matters Opened', unit: 'per month', description: 'New legal matters started', target_suggestion: 8 },
      { name: 'Revenue Per Client', unit: 'dollars', description: 'Average annual revenue per client', target_suggestion: 5000 },
      { name: 'Client Retention', unit: 'percent', description: 'Clients who use you for additional services', target_suggestion: 60 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Clients book consultations online', priority: 'essential' },
      { name: 'Clio', slug: 'clio', category: 'legal', why: 'Manages matters, billing, and client communication', priority: 'essential' },
      { name: 'DocuSign', slug: 'docusign', category: 'documents', why: 'Clients sign contracts and agreements remotely', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'billing', why: 'Tracks billing and generates invoices', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'clio', 'docusign', 'quickbooks'],

    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Business Law Consultation — {{business_name}}', body: "Hi {{client_name}},\n\nYour consultation is confirmed for {{date}} at {{time}}.\n\nTo make the most of our time, please have ready:\n- A brief description of what you need help with\n- Any relevant contracts or documents\n- Your business entity documents (if applicable)\n\nLooking forward to meeting you.\n\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Contract Ready for Review', subject: 'Your Contract is Ready — {{business_name}}', body: "Hi {{client_name}},\n\nWe've completed our review of your {{document_type}}. Please find the marked-up version attached with our notes.\n\nKey points to discuss:\n{{key_points}}\n\nLet's schedule a quick call to walk through our recommendations.\n\n{{business_name}}", trigger: 'contract_review_complete' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, this is {{business_name}}. Your consultation is tomorrow at {{time}}. Please bring any relevant contracts or documents. Call {{phone}} to reschedule.", trigger: 'appointment_reminder' },
      { name: 'Document Ready', body: "Hi {{client_name}}, your {{document_type}} is ready for your review. Check your email for details or call {{phone}} with questions.", trigger: 'document_ready' }
    ],

    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2500,
    ideal_plan: 'pro',
    competitor_tools: ['Clio', 'Smokeball', 'PracticePanther']
  },

  {
    id: 'dui-lawyer',
    industry: 'Legal',
    niche: 'DUI Lawyer',
    display_name: 'DUI Defense Law Firm',
    emoji: '🚗',
    tagline: 'Respond to panicked DUI calls instantly — day or night — and sign more cases.',

    demo_greeting: "Hi! I'm your AI assistant for a DUI defense firm. I can help answer general questions about the DUI process, explain what to expect, and schedule an urgent consultation. How can I help?",
    demo_system_prompt: "You are an AI assistant for a DUI defense law firm. Help callers understand the general DUI process, explain what happens after an arrest, and schedule urgent consultations. NEVER give legal advice or predict outcomes. Be calm and direct — callers are often scared and embarrassed. Many call in the middle of the night after an arrest. Time is critical for DUI cases due to license suspension deadlines.",
    demo_suggested_messages: [
      "I just got a DUI last night — what do I do now?",
      "Will I lose my license?",
      "How much does a DUI lawyer cost?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a DUI defense firm. You help people who've been arrested for DUI schedule urgent consultations and understand the general process. NEVER give legal advice. Be calm and non-judgmental — people are scared and embarrassed. Emphasize urgency: most states have a 10-day window to request a license hearing after a DUI arrest. Business hours: {{business_hours}}. Emergency line: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Were you recently arrested, or are you calling about an existing case?",
    receptionist_system_prompt: "You are the phone receptionist for a DUI defense firm. Determine urgency: when was the arrest? Have they already been to court? Is there a license hearing deadline? Gather: name, date of arrest, any charges, BAC if known, and whether this is a first offense. Schedule a consultation ASAP. NEVER give legal advice. Emphasize that time is critical for license hearings.",
    receptionist_faqs: [
      { question: "Will I go to jail?", answer: "Every case is different, and I can't predict outcomes. But many first-offense DUI cases don't result in jail time. Your attorney will review every detail of your case to fight for the best possible result.", category: "outcomes" },
      { question: "Will I lose my license?", answer: "There's typically a very short window — often 10 days — to request a hearing to fight the license suspension. That's why it's so important to talk to an attorney right away.", category: "license" },
      { question: "How much does this cost?", answer: "Most DUI cases are handled on a flat fee basis, which means you'll know the full cost upfront. The fee depends on whether it's a first offense, the specifics of your case, and your court jurisdiction.", category: "fees" },
      { question: "Is this going to be on my record forever?", answer: "That depends on your state and the outcome of your case. In some cases, expungement may be possible. Your attorney can discuss your options during the consultation.", category: "record" }
    ],
    receptionist_transfer_triggers: [
      "arrest happened within the last 24 hours",
      "caller mentions a license hearing deadline approaching",
      "caller mentions a second or third DUI offense",
      "caller mentions an accident with injuries",
      "caller is currently at the police station or jail"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Firm', description: 'Tell us about your DUI practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Shield DUI Defense', required: true },
        { name: 'phone', label: 'Emergency / Main Phone', type: 'phone', placeholder: '(555) 901-2345', required: true },
        { name: 'case_types', label: 'Types of cases', type: 'multiselect', placeholder: '', required: true, options: ['First Offense DUI', 'Multiple DUI', 'Felony DUI', 'DUI with Accident', 'DUI with Injury', 'Underage DUI', 'Commercial DUI (CDL)', 'Drug DUI', 'License Hearings'] }
      ]},
      { step_number: 2, title: 'Availability', description: 'When can clients reach you?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '8:00 AM - 7:00 PM', required: true },
        { name: 'available_247', label: 'Available 24/7 for new arrests?', type: 'toggle', placeholder: '', required: true, help_text: 'DUI arrests happen at night — being available can win cases' }
      ]},
      { step_number: 3, title: 'Fees', description: 'How you charge for DUI cases.', fields: [
        { name: 'fee_structure', label: 'Fee structure', type: 'select', placeholder: '', required: true, options: ['Flat Fee', 'Flat Fee + Trial Fee', 'Hourly', 'Varies by offense'] },
        { name: 'consultation_fee', label: 'Initial consultation fee', type: 'select', placeholder: '', required: true, options: ['Free', 'Paid — applied to retainer'] },
        { name: 'payment_plans', label: 'Offer payment plans?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Court Info', description: 'Where do you practice?', fields: [
        { name: 'courts', label: 'Courts where you regularly appear', type: 'text', placeholder: 'All courts in Maricopa County', required: true },
        { name: 'license_hearing_deadline', label: 'Your state\'s license hearing deadline (days after arrest)', type: 'number', placeholder: '10', required: false, help_text: 'Used to warn clients about this critical deadline' }
      ]}
    ],

    dashboard_widgets: [
      { id: 'urgent-calls', title: 'Urgent — New Arrests', description: 'People arrested in the last 24-48 hours', priority: 1 },
      { id: 'license-deadlines', title: 'License Hearing Deadlines', description: 'Clients approaching hearing request deadline', priority: 2 },
      { id: 'court-dates', title: 'Upcoming Court Dates', description: 'Hearings and arraignments this week', priority: 3 },
      { id: 'new-leads', title: 'New Inquiries', description: 'Potential clients who reached out', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Urgent: arrest last night', description: 'New caller arrested for DUI at 2 AM — needs consultation today.', category: 'urgent', difficulty: 'automatic' },
      { title: 'License hearing deadline warning', description: 'Client has 3 days left to request their license hearing.', category: 'urgent', difficulty: 'automatic' },
      { title: 'Court date reminder', description: 'Remind client about their arraignment on Thursday morning.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Follow up with consultation no-show', description: 'Potential client scheduled but didn\'t show up — reach out.', category: 'leads', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'New Case Calls', unit: 'per month', description: 'People calling after a DUI arrest', target_suggestion: 25 },
      { name: 'After-Hours Conversions', unit: 'percent', description: 'Night/weekend calls that become clients', target_suggestion: 40 },
      { name: 'Cases Signed', unit: 'per month', description: 'New DUI cases retained', target_suggestion: 12 },
      { name: 'Average Response Time', unit: 'minutes', description: 'Time to respond to new arrest calls', target_suggestion: 10 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages court dates and consultations', priority: 'essential' },
      { name: 'Clio', slug: 'clio', category: 'legal', why: 'Tracks DUI cases, deadlines, and client communication', priority: 'essential' },
      { name: 'Twilio', slug: 'twilio', category: 'communication', why: 'Enables instant text responses to after-hours calls', priority: 'recommended' },
      { name: 'Google Ads', slug: 'google-ads', category: 'marketing', why: 'DUI clients search "DUI lawyer near me" — be there instantly', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'clio', 'twilio', 'google-ads'],

    email_templates: [
      { name: 'Urgent — Post-Arrest Guide', subject: 'Important: What to Do Right Now — {{business_name}}', body: "Hi {{client_name}},\n\nThank you for contacting {{business_name}}. Here's what you need to know right now:\n\n1. Do NOT talk to anyone about your case — especially on social media\n2. Write down everything you remember about the stop and arrest while it's fresh\n3. You may have only {{license_deadline_days}} days to request a hearing to save your license\n4. Your consultation is scheduled for {{date}} at {{time}}\n\nWe're here to help. Call us at {{phone}} anytime.\n\n{{business_name}}", trigger: 'post_arrest' },
      { name: 'Court Date Reminder', subject: 'Court Date Reminder — {{date}}', body: "Hi {{client_name}},\n\nReminder: your court date is {{date}} at {{time}} at {{court_name}}.\n\nPlease arrive 15 minutes early. Dress in business attire. Do not bring any prohibited items.\n\nYour attorney will meet you in the lobby.\n\nCall {{phone}} with any questions.\n\n{{business_name}}", trigger: 'court_reminder' }
    ],
    sms_templates: [
      { name: 'Immediate Response', body: "This is {{business_name}}. We received your message. A DUI attorney will contact you shortly. IMPORTANT: Don't discuss your case with anyone. If this is an emergency, call 911.", trigger: 'new_arrest_inquiry' },
      { name: 'License Deadline Warning', body: "URGENT: {{client_name}}, you have {{days_remaining}} days to request your license hearing. Please call {{phone}} ASAP so we can file on your behalf.", trigger: 'license_deadline' }
    ],

    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3200,
    ideal_plan: 'growth',
    competitor_tools: ['Clio Grow', 'Lawmatics', 'DUI-specific lead services']
  },

  {
    id: 'workers-comp-attorney',
    industry: 'Legal',
    niche: 'Workers Compensation Attorney',
    display_name: "Workers' Comp Law Firm",
    emoji: '🦺',
    tagline: 'Help injured workers get the benefits they deserve — and never miss a deadline.',

    demo_greeting: "Hi! I'm your AI assistant for a workers' compensation law firm. I can help you understand your rights after a workplace injury and schedule a free consultation. How can I help?",
    demo_system_prompt: "You are an AI assistant for a workers' compensation law firm. Help callers understand the general workers' comp process, their right to file a claim, and schedule free consultations. NEVER give legal advice or predict benefits amounts. Be empathetic — these people are hurt, scared about their job, and worried about money.",
    demo_suggested_messages: [
      "I got hurt at work — what are my rights?",
      "My employer denied my workers' comp claim",
      "Can I get fired for filing workers' comp?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a workers' compensation law firm. Help injured workers understand the general claims process and schedule free consultations. NEVER give legal advice or predict benefits. Be compassionate — workers are hurt, worried about their income, and often afraid of retaliation. Reassure them: it's illegal for employers to retaliate for filing a claim. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Were you injured at work, or are you calling about an existing claim?",
    receptionist_system_prompt: "You are the phone receptionist for a workers' comp firm. Gather: caller name, employer name, type of injury, when it happened, whether they've reported it to their employer, and whether the claim has been denied. Schedule a free consultation. Be empathetic. NEVER give legal advice. If the injury just happened, advise them to report it to their employer in writing and get medical treatment.",
    receptionist_faqs: [
      { question: "Do I have to pay for a workers' comp lawyer?", answer: "No — we work on a contingency basis, which means we only get paid if you win benefits. The consultation is free and there's no obligation.", category: "fees" },
      { question: "Can I get fired for filing a claim?", answer: "It's illegal for your employer to retaliate against you for filing a workers' comp claim. If that happens, you may have an additional legal claim. Our attorneys can discuss this during your consultation.", category: "retaliation" },
      { question: "My claim was denied — now what?", answer: "A denied claim doesn't mean you're out of options. Many denied claims are successfully appealed. I'd recommend scheduling a consultation as soon as possible so our attorney can review your denial.", category: "denials" },
      { question: "How long do I get benefits?", answer: "It depends on the severity of your injury and your state's laws. Benefits can include medical treatment, lost wages, and disability payments. Your attorney can explain what you may be entitled to.", category: "benefits" }
    ],
    receptionist_transfer_triggers: [
      "caller says they were just injured today",
      "caller says their employer is threatening them",
      "caller mentions a serious injury (amputation, spinal, TBI)",
      "caller's claim was just denied and has a deadline",
      "caller mentions their employer doesn't have workers' comp insurance"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Firm', description: 'Tell us about your workers\' comp practice.', fields: [
        { name: 'business_name', label: 'Firm Name', type: 'text', placeholder: 'Workers First Law', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 012-3456', required: true },
        { name: 'injury_types', label: 'Types of injuries you handle', type: 'multiselect', placeholder: '', required: true, options: ['Back/Spine Injuries', 'Repetitive Stress', 'Construction Accidents', 'Falls', 'Burns', 'Amputations', 'Head/Brain Injuries', 'Occupational Illness', 'Death Benefits'] }
      ]},
      { step_number: 2, title: 'Consultations', description: 'How do injured workers meet you?', fields: [
        { name: 'consultation_types', label: 'How can clients meet?', type: 'multiselect', placeholder: '', required: true, options: ['In-Office', 'Phone', 'Video Call', 'Hospital/Home Visit'] },
        { name: 'consultation_fee', label: 'Consultation fee', type: 'select', placeholder: '', required: true, options: ['Free', 'Free — contingency only'] }
      ]},
      { step_number: 3, title: 'Hours', description: 'When are you available?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '8:00 AM - 6:00 PM', required: true },
        { name: 'weekend_available', label: 'Available on weekends for injured workers?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 4, title: 'Service Area', description: 'Where do you practice?', fields: [
        { name: 'service_area', label: 'Areas you serve', type: 'text', placeholder: 'Entire state of Illinois', required: true },
        { name: 'languages', label: 'Languages spoken', type: 'multiselect', placeholder: '', required: false, options: ['English', 'Spanish', 'Polish', 'Chinese', 'Korean'] }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-injuries', title: 'New Injury Calls', description: 'Workers who were recently injured', priority: 1 },
      { id: 'denied-claims', title: 'Denied Claims', description: 'Workers whose claims need appeal', priority: 2 },
      { id: 'active-cases', title: 'Active Cases', description: 'Ongoing workers\' comp matters', priority: 3 },
      { id: 'hearings', title: 'Upcoming Hearings', description: 'Scheduled hearings and depositions', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Urgent: workplace injury today', description: 'Worker injured on construction site this morning — schedule immediate consultation.', category: 'urgent', difficulty: 'automatic' },
      { title: 'Denied claim follow-up', description: 'Client\'s claim was denied — schedule appointment to discuss appeal options.', category: 'leads', difficulty: 'automatic' },
      { title: 'Medical appointment reminder', description: 'Remind client about their IME (Independent Medical Exam) appointment.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Status update to client', description: 'Update client that their appeal has been filed and explain next steps.', category: 'client-communication', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'New Injury Calls', unit: 'per month', description: 'Injured workers contacting your firm', target_suggestion: 25 },
      { name: 'Cases Signed', unit: 'per month', description: 'New cases retained', target_suggestion: 10 },
      { name: 'Claim Approval Rate', unit: 'percent', description: 'Percentage of claims that result in benefits', target_suggestion: 80 },
      { name: 'Response Time', unit: 'hours', description: 'Time to return calls from injured workers', target_suggestion: 2 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages consultations, hearings, and medical appointments', priority: 'essential' },
      { name: 'Filevine', slug: 'filevine', category: 'legal', why: 'Case management built for injury/comp practices', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Injured workers search for local attorneys', priority: 'recommended' },
      { name: 'Twilio', slug: 'twilio', category: 'communication', why: 'Text communication for workers who can\'t call during work', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'filevine', 'google-business', 'twilio'],

    email_templates: [
      { name: 'Free Consultation Confirmation', subject: 'Your Free Workers\' Comp Consultation — {{business_name}}', body: "Hi {{client_name}},\n\nYour free consultation is confirmed for {{date}} at {{time}}.\n\nPlease bring (or have ready):\n- Details about how and when the injury happened\n- Any medical records or doctor's notes\n- Your employer's workers' comp insurance info (if you have it)\n- Any correspondence from your employer or their insurance\n\nRemember: everything we discuss is confidential.\n\nWe're here to fight for you.\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Claim Update', subject: 'Update on Your Workers\' Comp Claim — {{business_name}}', body: "Hi {{client_name}},\n\nHere's an update on your claim:\n\n{{claim_update}}\n\nIf you have any questions, call us at {{phone}} or reply to this email.\n\nHang in there — we're working hard for you.\n{{business_name}}", trigger: 'claim_update' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{client_name}}, this is {{business_name}}. Your free consultation is tomorrow at {{time}}. Bring any medical records and injury details. Call {{phone}} to reschedule.", trigger: 'appointment_reminder' },
      { name: 'Urgent Response', body: "Hi {{client_name}}, we got your message about your workplace injury. An attorney will call you back within 2 hours. In the meantime: report the injury to your employer in writing and seek medical treatment.", trigger: 'new_injury' }
    ],

    estimated_hours_saved_weekly: 13,
    estimated_monthly_value: 3000,
    ideal_plan: 'growth',
    competitor_tools: ['Filevine', 'SmartAdvocate', 'Needles']
  }
];
