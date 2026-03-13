import type { ProTemplate } from '../schema';

export const healthcareTemplates: ProTemplate[] = [
  // ─── 1. DENTAL OFFICE ───
  {
    id: 'dental-office',
    industry: 'Healthcare',
    niche: 'Dental Office',
    display_name: 'Dental Office',
    emoji: '🦷',
    tagline: 'Your AI front desk that books appointments, confirms insurance, and reduces no-shows.',
    demo_greeting: "Hi! I'm Mouse, your AI dental office assistant. I book appointments, verify insurance, send reminders, and reduce no-shows. Want to see how I'd handle a new patient calling for a cleaning?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a dental office. Book appointments, explain services, and help with insurance questions. Be warm and reassuring — many people have dental anxiety. Never provide medical advice.",
    demo_suggested_messages: ['I need to schedule a cleaning', 'Do you accept my insurance?', 'I have a toothache', 'How much for teeth whitening?'],
    soul_template: "You are Mouse, the AI front desk for {{business_name}}. You help {{owner_name}} run their dental practice by booking appointments, verifying insurance, sending reminders, and reducing no-shows. Be warm and reassuring — dental anxiety is real. Never provide medical advice. Office hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse! I can help you schedule an appointment, check insurance, or answer questions. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a dental office. Book appointments, verify insurance acceptance, and answer general questions. Be warm. For dental emergencies (severe pain, knocked-out tooth, swelling), offer same-day if available or direct to ER if after hours. Transfer to office manager for billing disputes, insurance claims, or complaints. NEVER provide dental advice.",
    receptionist_faqs: [
      { question: 'Do you accept my insurance?', answer: "We accept most major dental insurance plans including {{insurance_list}}. Give me your plan name and I can verify your coverage right now.", category: 'insurance' },
      { question: 'How much for a cleaning?', answer: "A routine cleaning and exam is {{cleaning_price}} without insurance. With insurance, most plans cover cleanings at 100%. We'll verify your benefits before your visit.", category: 'pricing' },
      { question: 'I have a toothache. Can I come in today?', answer: "I'm sorry you're in pain! Let me check for a same-day opening. If it's severe or you have swelling, we treat that as urgent and will get you in as soon as possible.", category: 'emergency' },
      { question: 'Do you see kids?', answer: "{{kids_answer}} We love making dental visits fun and stress-free for little ones.", category: 'services' },
      { question: 'Do you offer payment plans?', answer: "Yes! For treatments not fully covered by insurance, we offer financing through {{financing_partner}} with affordable monthly payments.", category: 'billing' }
    ],
    receptionist_transfer_triggers: ['billing dispute or insurance claim issue', 'dental emergency with swelling/fever', 'complaint about treatment', 'requesting a specific dentist', 'orthodontic consultation'],
    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: "Let's set up your dental office.", fields: [
        { name: 'business_name', label: 'Practice Name', type: 'text', placeholder: 'Bright Smile Dental', required: true },
        { name: 'owner_name', label: 'Dentist Name', type: 'text', placeholder: 'Dr. Sarah Kim', required: true },
        { name: 'phone', label: 'Office Phone', type: 'phone', placeholder: '(555) 200-0001', required: true },
        { name: 'address', label: 'Office Address', type: 'text', placeholder: '100 Dental Way, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'What services do you offer?', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Cleanings', 'Fillings', 'Crowns', 'Root Canals', 'Extractions', 'Whitening', 'Veneers', 'Implants', 'Invisalign', 'Pediatric Dentistry', 'Emergency Dental', 'Dentures'] },
        { name: 'cleaning_price', label: 'Cleaning & Exam Price (no insurance)', type: 'currency', placeholder: '200', required: true },
        { name: 'insurance_list', label: 'Insurance Plans Accepted', type: 'text', placeholder: 'Delta Dental, Cigna, Aetna, MetLife...', required: true },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: 'Mon-Thu 8am-5pm, Fri 8am-2pm', required: true }
      ]},
      { step_number: 3, title: 'Patient Experience', description: 'How you serve patients.', fields: [
        { name: 'new_patient_process', label: 'New Patient Process', type: 'select', placeholder: 'Select', required: true, options: ['Walk-ins welcome', 'Appointment required', 'Online forms first'] },
        { name: 'financing_partner', label: 'Financing Partner', type: 'text', placeholder: 'CareCredit, Sunbit', required: false },
        { name: 'kids_dentistry', label: 'See Pediatric Patients?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.brightsmiledental.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-schedule', title: "Today's Schedule", description: 'All patient appointments for today.', priority: 1 },
      { id: 'confirmation-status', title: 'Confirmation Status', description: 'Appointments confirmed vs. unconfirmed.', priority: 2 },
      { id: 'recall-due', title: 'Recall Due', description: 'Patients due for 6-month cleaning.', priority: 3 },
      { id: 'production-today', title: "Today's Production", description: 'Expected revenue from today\'s appointments.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send recall reminder', description: 'Text patients due for 6-month cleaning.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Confirm tomorrow\'s appointments', description: 'Send confirmation texts for next-day appointments.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Follow up on unscheduled treatment', description: 'Remind patients who have recommended treatment pending.', category: 'sales', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review request after appointment.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Daily Production', unit: 'dollars', description: 'Revenue generated per day.', target_suggestion: 4000 },
      { name: 'No-Show Rate', unit: 'percentage', description: 'Appointments that no-show.', target_suggestion: 5 },
      { name: 'Case Acceptance Rate', unit: 'percentage', description: 'Recommended treatments that patients accept.', target_suggestion: 70 },
      { name: 'Recall Compliance', unit: 'percentage', description: 'Patients who return for 6-month cleaning.', target_suggestion: 75 }
    ],
    suggested_integrations: [
      { name: 'Dentrix', slug: 'dentrix', category: 'practice-management', why: 'Industry-leading dental practice management.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local dental search visibility.', priority: 'essential' },
      { name: 'CareCredit', slug: 'carecredit', category: 'financing', why: 'Patient financing for dental work.', priority: 'recommended' },
      { name: 'Dental Intel', slug: 'dental-intel', category: 'analytics', why: 'Practice analytics and KPI tracking.', priority: 'recommended' }
    ],
    integration_priority: ['dentrix', 'google-business', 'carecredit', 'dental-intel'],
    email_templates: [
      { name: 'New Patient Welcome', subject: 'Welcome to {{business_name}}!', body: "Dear {{customer_name}},\n\nWelcome! Your first appointment is:\n\nDate: {{date}}\nTime: {{time}}\n\nPlease arrive 15 minutes early to complete paperwork. Bring your insurance card and photo ID.\n\nNew patient forms: {{forms_link}}\n\nAddress: {{address}}\n\nWe look forward to seeing you!\n— {{business_name}}", trigger: 'new_patient_booked' },
      { name: 'Recall Reminder', subject: 'Time for Your Dental Checkup — {{business_name}}', body: "Hi {{customer_name}},\n\nIt's been about 6 months since your last visit. Regular checkups catch problems early and keep your smile healthy!\n\nBook: {{booking_link}}\nCall: {{phone}}\n\n— {{business_name}}", trigger: 'recall_due' }
    ],
    sms_templates: [
      { name: 'Appointment Confirmation', body: "Hi {{customer_name}}, please confirm your dental appointment at {{business_name}} on {{date}} at {{time}}. Reply YES to confirm.", trigger: 'appointment_confirmation' },
      { name: 'Recall Reminder', body: "Hi {{customer_name}}, you're due for your dental cleaning at {{business_name}}! Book: {{booking_link}} or call {{phone}}.", trigger: 'recall_due' },
      { name: 'Review Request', body: "Thanks for visiting {{business_name}}, {{customer_name}}! A review helps others find great dental care: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 18,
    estimated_monthly_value: 5000,
    ideal_plan: 'growth',
    competitor_tools: ['Dentrix', 'Eaglesoft', 'Open Dental', 'RevenueWell']
  },

  // ─── 2. CHIROPRACTOR ───
  {
    id: 'chiropractor',
    industry: 'Healthcare',
    niche: 'Chiropractor',
    display_name: 'Chiropractor',
    emoji: '🦴',
    tagline: 'Your AI office assistant that books adjustments, manages care plans, and keeps patients on track.',
    demo_greeting: "Hi! I'm Mouse, your AI chiropractic assistant. I book adjustments, manage care plans, and keep patients coming back for their scheduled visits. Want to see how I'd handle a new patient with back pain?",
    demo_system_prompt: "You are Mouse, an AI demo for a chiropractic office. Book appointments, explain services, and answer general questions. Be wellness-focused. Never diagnose or provide medical advice. Recommend an initial consultation for all new patients.",
    demo_suggested_messages: ['My back has been hurting', 'Do I need a referral?', 'How much is an adjustment?', 'Do you take walk-ins?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} manage their chiropractic practice by booking adjustments, managing care plans, sending reminders, and keeping patients on schedule. Never diagnose. Office hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse! I can schedule an adjustment, answer questions, or help new patients get started. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a chiropractic office. Book adjustments, schedule new patient exams, verify insurance, and answer general questions. Never diagnose. Transfer to the doctor for clinical questions, injury cases, or patient concerns about their care plan.",
    receptionist_faqs: [
      { question: 'How much is an adjustment?', answer: "A chiropractic adjustment is {{adjustment_price}}. New patient exams including X-rays (if needed) are {{new_patient_price}}. Most insurance plans cover chiropractic care.", category: 'pricing' },
      { question: 'Do I need a referral?', answer: "No referral needed! You can book directly. Most insurance plans allow direct access to chiropractic care.", category: 'general' },
      { question: 'What should I expect at my first visit?', answer: "Your first visit includes a consultation, exam, and possibly X-rays. The doctor will explain their findings and recommend a care plan. Allow about {{first_visit_time}} minutes.", category: 'general' },
      { question: 'Do you accept insurance?', answer: "Yes — we accept {{insurance_list}}. We'll verify your benefits before your first visit.", category: 'insurance' },
      { question: 'Do you do walk-ins?', answer: "{{walkin_answer}} But we always try to accommodate same-day appointments when possible.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['auto accident or work injury case', 'clinical question about treatment', 'patient concern about care plan', 'complaint about treatment', 'personal injury attorney call'],
    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: "Let's set up your chiropractic office.", fields: [
        { name: 'business_name', label: 'Practice Name', type: 'text', placeholder: 'Summit Chiropractic', required: true },
        { name: 'owner_name', label: 'Doctor Name', type: 'text', placeholder: 'Dr. James Bennett', required: true },
        { name: 'phone', label: 'Office Phone', type: 'phone', placeholder: '(555) 200-0002', required: true },
        { name: 'address', label: 'Office Address', type: 'text', placeholder: '200 Spine St, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Chiropractic Adjustment', 'Spinal Decompression', 'Massage Therapy', 'X-Rays', 'Corrective Exercises', 'Nutritional Counseling', 'Auto Accident', 'Work Injury', 'Sports Chiropractic', 'Pediatric Chiropractic'] },
        { name: 'adjustment_price', label: 'Adjustment Price', type: 'currency', placeholder: '65', required: true },
        { name: 'new_patient_price', label: 'New Patient Exam Price', type: 'currency', placeholder: '150', required: true },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-6pm', required: true }
      ]},
      { step_number: 3, title: 'Details', description: 'A few more things.', fields: [
        { name: 'insurance_list', label: 'Insurance Accepted', type: 'text', placeholder: 'Blue Cross, United, Aetna, Cigna...', required: true },
        { name: 'first_visit_time', label: 'First Visit Duration', type: 'select', placeholder: 'Select', required: true, options: ['30 minutes', '45 minutes', '60 minutes'] },
        { name: 'walk_ins', label: 'Accept Walk-Ins?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.summitchiro.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-patients', title: "Today's Patients", description: 'All scheduled adjustments for today.', priority: 1 },
      { id: 'care-plan-compliance', title: 'Care Plan Compliance', description: 'Patients on track vs. falling behind on care plans.', priority: 2 },
      { id: 'new-patient-leads', title: 'New Patient Leads', description: 'Recent inquiries to follow up.', priority: 3 },
      { id: 'weekly-visits', title: 'Weekly Visit Count', description: 'Total patient visits this week.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send care plan reminder', description: 'Remind patients who missed their scheduled adjustment.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Confirm appointments', description: 'Send confirmation for next-day appointments.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Welcome new patient', description: 'Send intake forms and prep info to new patients.', category: 'operations', difficulty: 'automatic' },
      { title: 'Request review', description: 'Ask for review after 5th visit.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Patient Visits Per Day', unit: 'count', description: 'Total adjustments per day.', target_suggestion: 25 },
      { name: 'New Patients Per Month', unit: 'count', description: 'New patient starts per month.', target_suggestion: 20 },
      { name: 'Care Plan Compliance', unit: 'percentage', description: 'Patients completing their recommended care plan.', target_suggestion: 75 },
      { name: 'Patient Visit Average', unit: 'dollars', description: 'Average revenue per visit.', target_suggestion: 65 }
    ],
    suggested_integrations: [
      { name: 'ChiroTouch', slug: 'chirotouch', category: 'ehr', why: 'Chiropractic-specific EHR and practice management.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local chiropractic search visibility.', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Process copays and care plan payments.', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Patient education and wellness newsletters.', priority: 'nice-to-have' }
    ],
    integration_priority: ['chirotouch', 'google-business', 'stripe', 'mailchimp'],
    email_templates: [
      { name: 'New Patient Welcome', subject: 'Welcome to {{business_name}}!', body: "Dear {{customer_name}},\n\nWelcome! Your initial exam is:\n\nDate: {{date}} at {{time}}\nAllow {{first_visit_time}} for your first visit.\n\nPlease complete intake forms: {{forms_link}}\nBring: Insurance card, photo ID\n\nAddress: {{address}}\n\n— {{business_name}}", trigger: 'new_patient_booked' },
      { name: 'Care Plan Reminder', subject: 'Stay on Track — {{business_name}}', body: "Hi {{customer_name}},\n\nWe noticed you've missed your recent scheduled adjustment. Staying consistent with your care plan is key to getting results.\n\nBook your next visit: {{booking_link}}\n\nWe're here for you!\n— {{business_name}}", trigger: 'missed_appointment' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: your adjustment at {{business_name}} is tomorrow at {{time}}. Reply YES to confirm.", trigger: 'appointment_reminder_24h' },
      { name: 'Missed Visit', body: "Hi {{customer_name}}, we missed you at {{business_name}}! Staying on your care plan matters. Book your next visit: {{booking_link}}", trigger: 'missed_appointment' },
      { name: 'Review Request', body: "Feeling better, {{customer_name}}? A review for {{business_name}} helps others find relief: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3500,
    ideal_plan: 'growth',
    competitor_tools: ['ChiroTouch', 'Jane App', 'Genesis', 'EHR 24/7']
  },

  // ─── 3-12 REMAINING HEALTHCARE TEMPLATES ───
  // (Optometrist, PT, Vet, Pharmacy, Mental Health, Urgent Care, Dermatology, Podiatrist, Pediatrician, Home Health)
  // Generating compact versions for the remaining 10

  // ─── 3. OPTOMETRIST ───
  {
    id: 'optometrist', industry: 'Healthcare', niche: 'Optometrist', display_name: 'Optometrist', emoji: '👁️',
    tagline: 'Your AI receptionist that books eye exams, manages frame orders, and keeps patients coming back yearly.',
    demo_greeting: "Hi! I'm Mouse, your AI optometry assistant. I book eye exams, track frame orders, and send annual reminder notices. Want to see how I'd handle a new patient scheduling?",
    demo_system_prompt: "You are Mouse, an AI demo for an optometry office. Book eye exams, explain services, and answer insurance questions. Never provide medical advice. For eye emergencies (chemical splash, sudden vision loss), direct to ER.",
    demo_suggested_messages: ['I need an eye exam', 'Do you accept VSP?', 'My contact lens prescription expired', 'I need new glasses'],
    soul_template: "You are Mouse, the AI receptionist for {{business_name}}. You book eye exams, manage frame orders, send annual reminders, and verify vision insurance. EMERGENCY: Chemical splash or sudden vision loss → direct to ER. Office hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse! I can schedule an eye exam, check insurance, or help with your glasses or contacts order.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, an optometry office. Book eye exams, verify vision insurance, track frame/contact orders, and answer general questions. For eye emergencies: chemical exposure or sudden vision loss → direct to ER. Transfer to doctor for clinical questions or complex contact lens fits.",
    receptionist_faqs: [
      { question: 'How much is an eye exam?', answer: "A comprehensive eye exam is {{exam_price}}. With vision insurance (VSP, EyeMed, etc.), your exam may be fully covered. Let me check your plan.", category: 'pricing' },
      { question: 'Do you accept VSP/EyeMed?', answer: "We accept {{insurance_list}}. I can verify your benefits right now if you have your member ID.", category: 'insurance' },
      { question: 'How often should I get an eye exam?', answer: "Adults should have an eye exam every 1-2 years, or annually if you wear glasses/contacts, have diabetes, or are over 60.", category: 'general' },
      { question: 'Do you fit contacts?', answer: "Yes! We fit all types including daily, monthly, toric, multifocal, and specialty lenses. A contact lens exam includes fitting and trial lenses.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['eye emergency — direct to ER', 'complex contact lens fit', 'complaint about glasses/prescription', 'LASIK consultation', 'pediatric eye concern'],
    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: "Setup.", fields: [
        { name: 'business_name', label: 'Practice Name', type: 'text', placeholder: 'Clear Vision Optometry', required: true },
        { name: 'owner_name', label: 'Doctor Name', type: 'text', placeholder: 'Dr. Amy Chen', required: true },
        { name: 'phone', label: 'Office Phone', type: 'phone', placeholder: '(555) 200-0003', required: true },
        { name: 'address', label: 'Office Address', type: 'text', placeholder: '300 Vision Way', required: true }
      ]},
      { step_number: 2, title: 'Services & Insurance', description: 'Services and plans.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Comprehensive Eye Exam', 'Contact Lens Fitting', 'Glasses Dispensing', 'Pediatric Eye Exam', 'Dry Eye Treatment', 'Glaucoma Screening', 'Diabetic Eye Exam', 'LASIK Co-Management'] },
        { name: 'exam_price', label: 'Eye Exam Price', type: 'currency', placeholder: '175', required: true },
        { name: 'insurance_list', label: 'Insurance Accepted', type: 'text', placeholder: 'VSP, EyeMed, Davis Vision, Spectera', required: true },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: 'Mon-Fri 9am-5pm, Sat 9am-1pm', required: true }
      ]},
      { step_number: 3, title: 'Optical Shop', description: 'Your frame selection.', fields: [
        { name: 'frame_brands', label: 'Frame Brands Carried', type: 'text', placeholder: 'Ray-Ban, Oakley, Kate Spade, Coach...', required: false },
        { name: 'contacts_brands', label: 'Contact Lens Brands', type: 'text', placeholder: 'Acuvue, Dailies, Biofinity...', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.clearvisionoptometry.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-exams', title: "Today's Exams", description: 'Scheduled eye exams.', priority: 1 },
      { id: 'annual-recalls', title: 'Annual Recalls Due', description: 'Patients due for annual exam.', priority: 2 },
      { id: 'frame-orders', title: 'Frame/Contact Orders', description: 'Pending orders with status.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue from exams, frames, and contacts.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send annual exam reminder', description: 'Text patients due for yearly eye exam.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Notify frame order ready', description: 'Text patient when glasses are ready for pickup.', category: 'operations', difficulty: 'automatic' },
      { title: 'Contact lens reorder reminder', description: 'Remind patients when contact supply is running low.', category: 'sales', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review request after exam.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Exams Per Day', unit: 'count', description: 'Eye exams per day.', target_suggestion: 12 },
      { name: 'Capture Rate', unit: 'percentage', description: 'Exam patients who buy glasses/contacts in-office.', target_suggestion: 65 },
      { name: 'Average Patient Revenue', unit: 'dollars', description: 'Average revenue per patient visit.', target_suggestion: 350 },
      { name: 'Annual Recall Rate', unit: 'percentage', description: 'Patients returning for annual exam.', target_suggestion: 60 }
    ],
    suggested_integrations: [
      { name: 'EyeCloud Pro', slug: 'eyecloud', category: 'ehr', why: 'Cloud-based optometry EHR.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local optometrist search visibility.', priority: 'essential' },
      { name: 'ABB Optical', slug: 'abb-optical', category: 'industry', why: 'Contact lens and frame ordering.', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Process copays and frame purchases.', priority: 'recommended' }
    ],
    integration_priority: ['eyecloud', 'google-business', 'abb-optical', 'stripe'],
    email_templates: [
      { name: 'Annual Reminder', subject: 'Time for Your Eye Exam — {{business_name}}', body: "Hi {{customer_name}},\n\nIt's been about a year since your last eye exam. Regular exams detect changes early.\n\nBook: {{booking_link}}\n\n— {{business_name}}", trigger: 'annual_recall' },
      { name: 'Glasses Ready', subject: 'Your Glasses Are Ready! — {{business_name}}', body: "Hi {{customer_name}},\n\nYour new glasses are ready for pickup!\n\nOffice hours: {{business_hours}}\nAddress: {{address}}\n\nWe can't wait for you to see the world in HD!\n\n— {{business_name}}", trigger: 'glasses_ready' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, your eye exam at {{business_name}} is tomorrow at {{time}}. Bring your insurance card and current glasses/contacts. See you then!", trigger: 'appointment_reminder_24h' },
      { name: 'Glasses Ready', body: "{{customer_name}}, your new glasses from {{business_name}} are ready! Stop by during {{business_hours}} to pick them up.", trigger: 'glasses_ready' },
      { name: 'Contact Reorder', body: "Hi {{customer_name}}, your contact lenses from {{business_name}} should be running low. Reorder: {{reorder_link}} or call {{phone}}.", trigger: 'contact_reorder' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3500,
    ideal_plan: 'growth',
    competitor_tools: ['EyeCloud Pro', 'RevolutionEHR', 'Crystal PM', 'Weave']
  },

  // ─── 4. PHYSICAL THERAPY ───
  {
    id: 'physical-therapy', industry: 'Healthcare', niche: 'Physical Therapy', display_name: 'Physical Therapy', emoji: '🏃',
    tagline: 'Your AI front desk that books sessions, tracks care plans, and reduces drop-offs.',
    demo_greeting: "Hi! I'm Mouse, your AI physical therapy assistant. I book sessions, track care plans, and make sure patients complete their prescribed visits. Want to see how I'd onboard a post-surgery patient?",
    demo_system_prompt: "You are Mouse, an AI demo for a physical therapy clinic. Book evaluations and sessions, explain services, handle insurance questions. Never provide medical advice or prescribe exercises.",
    demo_suggested_messages: ['I need PT after knee surgery', 'Do you take my insurance?', 'How many sessions will I need?', 'Do I need a referral?'],
    soul_template: "You are Mouse, the AI front desk for {{business_name}}. You book evaluations and follow-up sessions, track care plan compliance, verify insurance, and reduce patient drop-off. Never provide medical advice. Office hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse! I can help you schedule an evaluation, check insurance, or answer questions about our services.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a physical therapy clinic. Schedule evaluations and follow-up sessions, verify insurance, and explain services. Never provide treatment advice. Transfer to the therapist for clinical questions, care plan changes, or injury assessments.",
    receptionist_faqs: [
      { question: 'Do I need a referral?', answer: "In most states, you can come directly without a referral (direct access). However, some insurance plans may require one. I can check your specific plan.", category: 'general' },
      { question: 'How much does PT cost?', answer: "An initial evaluation is {{eval_price}} and follow-up sessions are {{session_price}} before insurance. Most insurance plans cover PT with a copay.", category: 'pricing' },
      { question: 'How many sessions will I need?', answer: "That depends on your condition and goals. Your therapist will assess you at your first visit and recommend a plan — typically 2-3 visits per week for 4-8 weeks.", category: 'general' },
      { question: 'What should I wear?', answer: "Wear comfortable, loose-fitting clothes that allow movement. Athletic wear works great. We'll provide any equipment needed.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['clinical question about injury', 'care plan modification', 'workers comp or auto injury case', 'complaint about progress', 'doctor/referral coordination'],
    wizard_steps: [
      { step_number: 1, title: 'Your Clinic', description: "Setup.", fields: [
        { name: 'business_name', label: 'Clinic Name', type: 'text', placeholder: 'Peak Performance PT', required: true },
        { name: 'owner_name', label: 'Lead Therapist', type: 'text', placeholder: 'Dr. Mike Torres, DPT', required: true },
        { name: 'phone', label: 'Clinic Phone', type: 'phone', placeholder: '(555) 200-0004', required: true },
        { name: 'address', label: 'Clinic Address', type: 'text', placeholder: '400 Rehab Rd', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Your specialties.', fields: [
        { name: 'specialties', label: 'Specialties', type: 'multiselect', placeholder: 'Select', required: true, options: ['Orthopedic', 'Sports Rehab', 'Post-Surgical', 'Back/Neck Pain', 'Balance/Fall Prevention', 'TMJ', 'Pelvic Floor', 'Pediatric', 'Geriatric', 'Aquatic Therapy', 'Dry Needling', 'Manual Therapy'] },
        { name: 'eval_price', label: 'Initial Eval Price', type: 'currency', placeholder: '175', required: true },
        { name: 'session_price', label: 'Follow-Up Session Price', type: 'currency', placeholder: '125', required: true },
        { name: 'business_hours', label: 'Clinic Hours', type: 'time_range', placeholder: 'Mon-Fri 7am-6pm', required: true }
      ]},
      { step_number: 3, title: 'Insurance', description: 'Plans accepted.', fields: [
        { name: 'insurance_list', label: 'Insurance Accepted', type: 'text', placeholder: 'Blue Cross, United, Aetna, Medicare...', required: true },
        { name: 'direct_access', label: 'Accept Direct Access (no referral)?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.peakperformancept.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-schedule', title: "Today's Schedule", description: 'All PT sessions for today.', priority: 1 },
      { id: 'care-plan-tracker', title: 'Care Plan Tracker', description: 'Patients on track vs. dropping off.', priority: 2 },
      { id: 'authorizations', title: 'Insurance Authorizations', description: 'Pending and expiring authorizations.', priority: 3 },
      { id: 'weekly-visits', title: 'Weekly Visit Count', description: 'Total patient visits this week.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Remind patient of missed session', description: 'Text patients who missed a scheduled PT visit.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Send home exercise reminder', description: 'Remind patients to do their prescribed exercises.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Authorization renewal alert', description: 'Alert when insurance authorization is expiring.', category: 'operations', difficulty: 'automatic' },
      { title: 'Request review', description: 'Ask for review at discharge.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Visits Per Day', unit: 'count', description: 'Patient visits per day.', target_suggestion: 20 },
      { name: 'Plan Completion Rate', unit: 'percentage', description: 'Patients who complete their care plan.', target_suggestion: 70 },
      { name: 'Cancel/No-Show Rate', unit: 'percentage', description: 'Sessions cancelled or no-showed.', target_suggestion: 8 },
      { name: 'New Evals Per Week', unit: 'count', description: 'New patient evaluations per week.', target_suggestion: 8 }
    ],
    suggested_integrations: [
      { name: 'WebPT', slug: 'webpt', category: 'ehr', why: 'Leading PT-specific EHR and documentation.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local PT clinic search visibility.', priority: 'essential' },
      { name: 'Prompt', slug: 'prompt', category: 'analytics', why: 'PT practice analytics and outcomes tracking.', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Process copays and cash-pay patients.', priority: 'recommended' }
    ],
    integration_priority: ['webpt', 'google-business', 'prompt', 'stripe'],
    email_templates: [
      { name: 'New Patient Intake', subject: 'Welcome to {{business_name}} — Your PT Journey', body: "Dear {{customer_name}},\n\nYour initial evaluation is scheduled:\n\nDate: {{date}} at {{time}}\nAllow 60 minutes.\n\nPlease complete forms: {{forms_link}}\nWear comfortable clothes.\nBring: Insurance card, referral (if applicable), imaging reports.\n\n— {{business_name}}", trigger: 'new_patient_booked' },
      { name: 'Care Plan Reminder', subject: "Don't Fall Behind — {{business_name}}", body: "Hi {{customer_name}},\n\nWe noticed you've missed some PT sessions. Consistency is key to your recovery.\n\nYou have {{remaining_visits}} visits remaining in your plan.\n\nBook: {{booking_link}}\n\n— {{business_name}}", trigger: 'care_plan_dropout' }
    ],
    sms_templates: [
      { name: 'Session Reminder', body: "Hi {{customer_name}}, reminder: your PT session at {{business_name}} is tomorrow at {{time}}. Wear comfy clothes!", trigger: 'appointment_reminder_24h' },
      { name: 'Missed Session', body: "Hi {{customer_name}}, we missed you today at {{business_name}}. Staying consistent matters for your recovery. Rebook: {{booking_link}}", trigger: 'missed_appointment' },
      { name: 'Home Exercise', body: "Reminder: do your home exercises today, {{customer_name}}! Consistency between PT sessions speeds up recovery. — {{business_name}}", trigger: 'home_exercise_reminder' }
    ],
    estimated_hours_saved_weekly: 16,
    estimated_monthly_value: 4000,
    ideal_plan: 'growth',
    competitor_tools: ['WebPT', 'Clinicient', 'Prompt', 'Jane App']
  },

  // ─── 5. VETERINARIAN ───
  {
    id: 'veterinarian', industry: 'Healthcare', niche: 'Veterinarian', display_name: 'Veterinarian', emoji: '🐾',
    tagline: 'Your AI vet receptionist that books appointments, sends vaccine reminders, and handles pet parent concerns.',
    demo_greeting: "Hi! I'm Mouse, your AI vet clinic assistant. I book appointments, send vaccine reminders, and handle concerned pet parents with care. Want to see how I'd handle a call about a pet who isn't eating?",
    demo_system_prompt: "You are Mouse, an AI demo for a veterinary clinic. Book appointments, send vaccine reminders, and handle pet health concerns. Be empathetic — pet parents worry. EMERGENCY: difficulty breathing, seizures, ingestion of toxin, hit by car → direct to emergency vet immediately. Never diagnose.",
    demo_suggested_messages: ['My dog isn\'t eating', 'I need to schedule vaccines', 'My cat is vomiting', 'How much for a wellness exam?'],
    soul_template: "You are Mouse, the AI receptionist for {{business_name}}. You book appointments, send vaccine reminders, and handle concerned pet parents. EMERGENCY TRIAGE: Not breathing, seizures, toxin ingestion, hit by car, bloated abdomen → emergency vet NOW. Be empathetic — pets are family. Office hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}. Emergency vet: {{emergency_vet}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse! Is this an emergency, or do you need to schedule an appointment for your pet?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a vet clinic. EMERGENCY TRIAGE FIRST: difficulty breathing, seizures, toxin ingestion, hit by car, bloated/distended abdomen, uncontrolled bleeding → direct to emergency vet {{emergency_vet}} immediately. For non-emergencies: book appointments, answer general questions, send vaccine reminders. Never diagnose. Transfer to vet tech for clinical symptom assessment.",
    receptionist_faqs: [
      { question: 'How much for a wellness exam?', answer: "A wellness exam is {{exam_price}} for dogs and cats. Puppies/kittens may need additional vaccines. We'll create a care plan at your visit.", category: 'pricing' },
      { question: 'My pet isn\'t eating. Should I be worried?', answer: "Loss of appetite can have many causes — some simple, some serious. If it's been more than 24 hours (for dogs) or 12 hours (for cats), or if there are other symptoms, I'd recommend scheduling a visit. Let me get you in.", category: 'general' },
      { question: 'What vaccines does my dog/cat need?', answer: "Core vaccines for dogs include rabies, DHPP, and bordetella. Cats need rabies and FVRCP. Your vet will recommend a schedule at the wellness exam.", category: 'services' },
      { question: 'Do you do surgery?', answer: "Yes — we perform {{surgeries}}. All surgeries include pre-anesthetic bloodwork, anesthesia monitoring, and pain management.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['potential emergency — direct to emergency vet', 'ongoing treatment concern', 'euthanasia discussion — handle with extreme sensitivity', 'complaint about care', 'requesting specific veterinarian'],
    wizard_steps: [
      { step_number: 1, title: 'Your Clinic', description: "Setup.", fields: [
        { name: 'business_name', label: 'Clinic Name', type: 'text', placeholder: 'Happy Paws Veterinary', required: true },
        { name: 'owner_name', label: 'Lead Vet', type: 'text', placeholder: 'Dr. Lisa Park, DVM', required: true },
        { name: 'phone', label: 'Clinic Phone', type: 'phone', placeholder: '(555) 200-0005', required: true },
        { name: 'address', label: 'Clinic Address', type: 'text', placeholder: '500 Pet Care Ln', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Your vet services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Wellness Exams', 'Vaccinations', 'Spay/Neuter', 'Dental Cleaning', 'Surgery', 'X-Ray/Imaging', 'Lab Work', 'Microchipping', 'Prescription Diets', 'Hospice/End of Life', 'Exotic Pets'] },
        { name: 'exam_price', label: 'Wellness Exam Price', type: 'currency', placeholder: '60', required: true },
        { name: 'emergency_vet', label: 'Emergency Vet Referral', type: 'text', placeholder: 'Metro Emergency Animal Hospital (555) 999-9999', required: true },
        { name: 'business_hours', label: 'Clinic Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-6pm, Sat 8am-1pm', required: true }
      ]},
      { step_number: 3, title: 'Details', description: 'More info.', fields: [
        { name: 'surgeries', label: 'Surgeries Offered', type: 'text', placeholder: 'Spay/neuter, soft tissue, dental extractions', required: false },
        { name: 'species_seen', label: 'Species Seen', type: 'multiselect', placeholder: 'Select', required: true, options: ['Dogs', 'Cats', 'Birds', 'Rabbits', 'Reptiles', 'Small Mammals'] }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.happypawsvet.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Appointments", description: 'Scheduled vet visits.', priority: 1 },
      { id: 'vaccine-reminders', title: 'Vaccines Due', description: 'Pets due for vaccines this month.', priority: 2 },
      { id: 'prescription-refills', title: 'Rx Refills Due', description: 'Prescriptions needing renewal.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue by service category.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send vaccine reminder', description: 'Text pet parents when vaccines are due.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Prescription refill reminder', description: 'Alert when heartworm/flea meds are due.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Post-surgery follow-up', description: 'Check in 48 hours after surgery.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review request after visit.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Appointments Per Day', unit: 'count', description: 'Vet appointments per day.', target_suggestion: 20 },
      { name: 'Average Transaction', unit: 'dollars', description: 'Average revenue per visit.', target_suggestion: 200 },
      { name: 'Vaccine Compliance', unit: 'percentage', description: 'Pets current on core vaccines.', target_suggestion: 75 },
      { name: 'New Clients Per Month', unit: 'count', description: 'New pet families per month.', target_suggestion: 25 }
    ],
    suggested_integrations: [
      { name: 'Cornerstone', slug: 'cornerstone', category: 'practice-management', why: 'Leading veterinary practice management.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local vet search visibility.', priority: 'essential' },
      { name: 'VetSource', slug: 'vetsource', category: 'pharmacy', why: 'Online pharmacy and prescription management.', priority: 'recommended' },
      { name: 'PetDesk', slug: 'petdesk', category: 'communication', why: 'Pet parent communication app.', priority: 'recommended' }
    ],
    integration_priority: ['cornerstone', 'google-business', 'vetsource', 'petdesk'],
    email_templates: [
      { name: 'Vaccine Reminder', subject: '{{pet_name}} is Due for Vaccines — {{business_name}}', body: "Hi {{customer_name}},\n\n{{pet_name}} is due for the following vaccines:\n\n{{vaccine_list}}\n\nBook: {{booking_link}}\nCall: {{phone}}\n\nKeeping {{pet_name}} up to date protects them and your family!\n\n— {{business_name}}", trigger: 'vaccine_due' },
      { name: 'Post-Surgery', subject: 'How is {{pet_name}} Doing? — {{business_name}}', body: "Hi {{customer_name}},\n\nIt's been 48 hours since {{pet_name}}'s surgery. How are they doing?\n\nReminders:\n{{post_op_instructions}}\n\nConcerns? Call us at {{phone}} — we're here for you and {{pet_name}}.\n\n— {{business_name}}", trigger: 'post_surgery_48h' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: {{pet_name}}'s appointment at {{business_name}} is tomorrow at {{time}}. See you and {{pet_name}} then!", trigger: 'appointment_reminder_24h' },
      { name: 'Vaccine Due', body: "{{pet_name}} is due for vaccines at {{business_name}}! Book: {{booking_link}} or call {{phone}}.", trigger: 'vaccine_due' },
      { name: 'Rx Refill', body: "{{pet_name}}'s {{medication}} from {{business_name}} is running low. Reorder: {{refill_link}} or call {{phone}}.", trigger: 'rx_refill_due' }
    ],
    estimated_hours_saved_weekly: 16,
    estimated_monthly_value: 4000,
    ideal_plan: 'growth',
    competitor_tools: ['Cornerstone', 'Avimark', 'eVetPractice', 'PetDesk']
  },

  // ─── 6. PHARMACY ───
  {
    id: 'pharmacy', industry: 'Healthcare', niche: 'Pharmacy', display_name: 'Independent Pharmacy', emoji: '💊',
    tagline: 'Your AI pharmacy assistant that handles refill requests, sends medication reminders, and answers questions.',
    demo_greeting: "Hi! I'm Mouse, your AI pharmacy assistant. I handle refill requests, send medication reminders, and answer general pharmacy questions.",
    demo_system_prompt: "You are Mouse, an AI demo for an independent pharmacy. Handle refill requests, medication reminders, and general questions. Never provide medical advice or drug recommendations. For adverse reactions or overdose: call 911.",
    demo_suggested_messages: ['I need to refill my prescription', 'Do you deliver?', 'How much without insurance?', 'When will my prescription be ready?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You handle refill requests, send medication reminders, check prescription status, and answer general questions. NEVER provide medical advice, recommend medications, or discuss dosage changes. For emergencies or adverse reactions: call 911. Hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse! I can help with refills, prescription status, or answer questions.",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for an independent pharmacy. Handle refill requests (get name, DOB, Rx number), check status, and answer general questions. NEVER discuss dosage, drug interactions, or medical advice. Transfer to pharmacist for clinical questions, new prescriptions, or insurance problems.",
    receptionist_faqs: [
      { question: 'How do I refill my prescription?', answer: "I can start your refill right now! I just need your name, date of birth, and the prescription number (it's on your label). Or you can use our app/website.", category: 'services' },
      { question: 'When will my prescription be ready?', answer: "Most refills are ready in {{refill_time}}. New prescriptions and transfers may take a bit longer. I can check the status of yours right now.", category: 'general' },
      { question: 'Do you deliver?', answer: "{{delivery_answer}} We want to make sure you always have your medications on time.", category: 'services' },
      { question: 'Do you accept my insurance?', answer: "We accept most major insurance plans and Medicare Part D. Give me your plan info and I'll verify it.", category: 'insurance' }
    ],
    receptionist_transfer_triggers: ['medication question (dosage, interactions, side effects)', 'adverse reaction — direct to 911 if severe', 'new prescription or transfer issue', 'insurance billing problem', 'controlled substance inquiry'],
    wizard_steps: [
      { step_number: 1, title: 'Your Pharmacy', description: "Setup.", fields: [
        { name: 'business_name', label: 'Pharmacy Name', type: 'text', placeholder: 'Community Care Pharmacy', required: true },
        { name: 'owner_name', label: 'Pharmacist Name', type: 'text', placeholder: 'Dr. Robert Chang, PharmD', required: true },
        { name: 'phone', label: 'Pharmacy Phone', type: 'phone', placeholder: '(555) 200-0006', required: true },
        { name: 'address', label: 'Pharmacy Address', type: 'text', placeholder: '600 Health St', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Your services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Prescription Filling', 'Refills', 'Transfers', 'Compounding', 'Immunizations', 'Delivery', 'Med Sync', 'MTM', 'Blister Packing', 'OTC Products', 'DME'] },
        { name: 'refill_time', label: 'Typical Refill Time', type: 'select', placeholder: 'Select', required: true, options: ['15-20 minutes', '30 minutes', '1 hour', 'Same day'] },
        { name: 'business_hours', label: 'Pharmacy Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-7pm, Sat 9am-3pm', required: true }
      ]},
      { step_number: 3, title: 'Delivery & Extras', description: 'Additional services.', fields: [
        { name: 'offers_delivery', label: 'Offer Delivery?', type: 'toggle', placeholder: '', required: true },
        { name: 'delivery_area', label: 'Delivery Area', type: 'text', placeholder: 'Within 10 miles', required: false },
        { name: 'immunizations', label: 'Immunizations Offered', type: 'text', placeholder: 'Flu, COVID, shingles, pneumonia', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.communitycarerx.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'pending-refills', title: 'Pending Refills', description: 'Refill requests to process.', priority: 1 },
      { id: 'ready-pickup', title: 'Ready for Pickup', description: 'Prescriptions ready and waiting.', priority: 2 },
      { id: 'deliveries', title: 'Deliveries', description: 'Prescriptions out for delivery.', priority: 3 },
      { id: 'refill-reminders', title: 'Refill Reminders Due', description: 'Patients due for medication refill.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send refill reminder', description: 'Text patients when they should be running low on medication.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Notify prescription ready', description: 'Text patient when Rx is ready for pickup.', category: 'operations', difficulty: 'automatic' },
      { title: 'Immunization reminder', description: 'Send seasonal flu shot or vaccine reminders.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Unclaimed Rx follow-up', description: 'Contact patients with prescriptions ready but unclaimed after 3 days.', category: 'operations', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Prescriptions Per Day', unit: 'count', description: 'Total Rx filled per day.', target_suggestion: 150 },
      { name: 'Refill Adherence', unit: 'percentage', description: 'Patients who refill on time.', target_suggestion: 80 },
      { name: 'Immunizations Per Week', unit: 'count', description: 'Immunizations administered weekly.', target_suggestion: 20 },
      { name: 'Delivery Orders Per Day', unit: 'count', description: 'Prescriptions delivered daily.', target_suggestion: 10 }
    ],
    suggested_integrations: [
      { name: 'PioneerRx', slug: 'pioneerrx', category: 'pharmacy-system', why: 'Independent pharmacy management system.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local pharmacy search visibility.', priority: 'essential' },
      { name: 'DoorDash Drive', slug: 'doordash-drive', category: 'delivery', why: 'Prescription delivery service.', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Health newsletters and seasonal reminders.', priority: 'nice-to-have' }
    ],
    integration_priority: ['pioneerrx', 'google-business', 'doordash-drive', 'mailchimp'],
    email_templates: [
      { name: 'Prescription Ready', subject: 'Your Prescription is Ready — {{business_name}}', body: "Hi {{customer_name}},\n\nYour prescription is ready for pickup at {{business_name}}.\n\n{{rx_details}}\n\nPickup hours: {{business_hours}}\nAddress: {{address}}\n\n— {{business_name}}", trigger: 'rx_ready' },
      { name: 'Flu Shot Reminder', subject: 'Flu Season is Here — {{business_name}}', body: "Hi {{customer_name}},\n\nProtect yourself this flu season! Walk-in flu shots available at {{business_name}}.\n\nNo appointment needed. Most insurance covers the flu shot at no cost.\n\n— {{business_name}}", trigger: 'flu_season' }
    ],
    sms_templates: [
      { name: 'Rx Ready', body: "{{customer_name}}, your prescription is ready at {{business_name}}. Pickup: {{business_hours}}. {{delivery_option}}", trigger: 'rx_ready' },
      { name: 'Refill Reminder', body: "Hi {{customer_name}}, your {{medication}} from {{business_name}} should be running low. Reply REFILL to reorder or call {{phone}}.", trigger: 'refill_due' },
      { name: 'Unclaimed Rx', body: "{{customer_name}}, you have a prescription waiting at {{business_name}} for 3+ days. Please pick up soon or call {{phone}} with questions.", trigger: 'unclaimed_rx_3_days' }
    ],
    estimated_hours_saved_weekly: 20,
    estimated_monthly_value: 4500,
    ideal_plan: 'growth',
    competitor_tools: ['PioneerRx', 'QS/1', 'Liberty', 'RxBlu']
  },

  // ─── 7. MENTAL HEALTH PRACTICE ───
  {
    id: 'mental-health', industry: 'Healthcare', niche: 'Mental Health', display_name: 'Mental Health Practice', emoji: '🧠',
    tagline: 'Your AI intake coordinator that screens inquiries, books consultations, and respects the sensitivity of mental health.',
    demo_greeting: "Hi, I'm Mouse, your AI intake coordinator. I help mental health practices manage inquiries, book initial consultations, and handle intake with the sensitivity this work requires.",
    demo_system_prompt: "You are Mouse, an AI demo for a mental health practice. Handle intake inquiries with extreme sensitivity and warmth. CRISIS PROTOCOL: If someone expresses suicidal thoughts, self-harm, or immediate danger, provide 988 Suicide & Crisis Lifeline and 911. Never provide therapy or clinical advice.",
    demo_suggested_messages: ['I think I need to talk to someone', 'Do you take insurance?', 'What types of therapy do you offer?', 'How do I get started?'],
    soul_template: "You are Mouse, the AI intake coordinator for {{business_name}}. You screen inquiries, book initial consultations, and handle communication with extreme sensitivity. CRISIS: Suicidal ideation, self-harm, or danger → 988 Suicide & Crisis Lifeline or 911 immediately. Never provide therapy or clinical advice. Be warm, validating, and non-judgmental. Hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse. I'm here to help you get started or answer any questions. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI intake coordinator for {{business_name}}, a mental health practice. CRISIS PROTOCOL: Active suicidal thoughts → 988 Suicide & Crisis Lifeline. Immediate danger → 911. Be warm, validating, and non-judgmental. Screen intake calls, explain services, book initial consultations. NEVER provide therapy, diagnose, or give clinical advice. Transfer to clinician for clinical questions or crisis assessment.",
    receptionist_faqs: [
      { question: 'How do I get started?', answer: "The first step is a brief phone consultation to understand your needs and match you with the right therapist. It's free and takes about 15 minutes. Would you like to schedule one?", category: 'getting-started' },
      { question: 'Do you take insurance?', answer: "We accept {{insurance_list}}. We also offer sliding scale for those without insurance. Everyone deserves access to care.", category: 'insurance' },
      { question: 'What types of therapy do you offer?', answer: "Our therapists offer {{therapy_types}}. We'll match you with someone who specializes in your specific needs.", category: 'services' },
      { question: 'Is therapy confidential?', answer: "Absolutely. Everything shared in therapy is confidential, protected by law. There are very few exceptions, which your therapist will explain at your first session.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['crisis or suicidal statements — provide 988 first', 'clinical question about treatment approach', 'existing patient requesting therapist', 'complaint about care', 'medication management question'],
    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: "Setup.", fields: [
        { name: 'business_name', label: 'Practice Name', type: 'text', placeholder: 'Clarity Counseling', required: true },
        { name: 'owner_name', label: 'Clinical Director', type: 'text', placeholder: 'Dr. Rachel Green, LCSW', required: true },
        { name: 'phone', label: 'Practice Phone', type: 'phone', placeholder: '(555) 200-0007', required: true },
        { name: 'address', label: 'Office Address', type: 'text', placeholder: '700 Wellness Dr', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Your therapeutic services.', fields: [
        { name: 'therapy_types', label: 'Therapy Types', type: 'multiselect', placeholder: 'Select', required: true, options: ['Individual Therapy', 'Couples Therapy', 'Family Therapy', 'Group Therapy', 'CBT', 'EMDR', 'DBT', 'Play Therapy', 'Medication Management', 'Telehealth'] },
        { name: 'specialties', label: 'Specialties', type: 'multiselect', placeholder: 'Select', required: true, options: ['Anxiety', 'Depression', 'Trauma/PTSD', 'Grief', 'Addiction', 'ADHD', 'OCD', 'Eating Disorders', 'Relationship Issues', 'Life Transitions', 'Anger Management'] },
        { name: 'session_price', label: 'Session Price (out of pocket)', type: 'currency', placeholder: '150', required: true },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: 'Mon-Thu 9am-8pm, Fri 9am-5pm', required: true }
      ]},
      { step_number: 3, title: 'Insurance & Access', description: 'Insurance and accessibility.', fields: [
        { name: 'insurance_list', label: 'Insurance Accepted', type: 'text', placeholder: 'Blue Cross, Aetna, United, Cigna...', required: true },
        { name: 'sliding_scale', label: 'Offer Sliding Scale?', type: 'toggle', placeholder: '', required: true },
        { name: 'telehealth', label: 'Offer Telehealth?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready.", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.claritycounseling.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-sessions', title: "Today's Sessions", description: 'Scheduled therapy sessions.', priority: 1 },
      { id: 'intake-requests', title: 'New Intake Requests', description: 'Pending intake consultations.', priority: 2 },
      { id: 'therapist-availability', title: 'Therapist Availability', description: 'Open slots by clinician.', priority: 3 },
      { id: 'monthly-sessions', title: 'Monthly Session Count', description: 'Total sessions this month.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up on intake inquiry', description: 'Reach out to new inquiries within 24 hours.', category: 'intake', difficulty: 'automatic' },
      { title: 'Send session reminder', description: 'Remind clients of upcoming session.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Missed session outreach', description: 'Gentle check-in after a missed appointment.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Request Psychology Today update', description: 'Remind therapists to update their profiles.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Sessions Per Week', unit: 'count', description: 'Total therapy sessions per week.', target_suggestion: 60 },
      { name: 'Intake Conversion Rate', unit: 'percentage', description: 'Inquiries that become clients.', target_suggestion: 50 },
      { name: 'No-Show Rate', unit: 'percentage', description: 'Sessions that no-show.', target_suggestion: 8 },
      { name: 'Average Clinician Caseload', unit: 'count', description: 'Active clients per therapist.', target_suggestion: 25 }
    ],
    suggested_integrations: [
      { name: 'SimplePractice', slug: 'simplepractice', category: 'ehr', why: 'HIPAA-compliant practice management for therapists.', priority: 'essential' },
      { name: 'Psychology Today', slug: 'psychology-today', category: 'directory', why: 'Leading therapist directory for new clients.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local mental health search visibility.', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Process session payments and copays.', priority: 'recommended' }
    ],
    integration_priority: ['simplepractice', 'psychology-today', 'google-business', 'stripe'],
    email_templates: [
      { name: 'Intake Welcome', subject: 'Your First Steps — {{business_name}}', body: "Dear {{customer_name}},\n\nThank you for reaching out. Taking this step is something to be proud of.\n\nYour initial consultation is scheduled:\nDate: {{date}} at {{time}}\n{{session_format}}\n\nPlease complete intake forms: {{forms_link}}\n\nEverything you share is confidential.\n\nWe're here for you,\n{{business_name}}", trigger: 'intake_scheduled' },
      { name: 'Missed Session', subject: 'We Missed You — {{business_name}}', body: "Dear {{customer_name}},\n\nWe noticed you missed your session today. We hope everything is okay.\n\nYour well-being matters to us. When you're ready, you can rebook: {{booking_link}}\n\nIf you're in crisis, please contact 988 (Suicide & Crisis Lifeline).\n\nWith care,\n{{business_name}}", trigger: 'missed_session' }
    ],
    sms_templates: [
      { name: 'Session Reminder', body: "Hi {{customer_name}}, reminder: your session at {{business_name}} is tomorrow at {{time}}. {{session_format_note}} Take care.", trigger: 'session_reminder_24h' },
      { name: 'Gentle Check-In', body: "Hi {{customer_name}}, we noticed you missed your session. We hope you're doing okay. When ready, rebook: {{booking_link}} In crisis? Call 988. — {{business_name}}", trigger: 'missed_session' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3500,
    ideal_plan: 'growth',
    competitor_tools: ['SimplePractice', 'TherapyNotes', 'Jane App', 'Alma']
  },

  // ─── 8. URGENT CARE ───
  {
    id: 'urgent-care', industry: 'Healthcare', niche: 'Urgent Care', display_name: 'Urgent Care', emoji: '🏥',
    tagline: 'Your AI front desk that manages patient flow, wait times, and follow-up care.',
    demo_greeting: "Hi! I'm Mouse, your AI urgent care assistant. I manage patient check-in, communicate wait times, and handle follow-up care.",
    demo_system_prompt: "You are Mouse, an AI demo for an urgent care clinic. Help with wait times, services offered, and check-in. EMERGENCY TRIAGE: Chest pain, stroke symptoms, severe trauma, difficulty breathing → call 911, go to ER. Urgent care handles non-life-threatening issues.",
    demo_suggested_messages: ['What is the wait time right now?', 'Can you treat a broken bone?', 'Do you do COVID tests?', 'Do you take walk-ins?'],
    soul_template: "You are Mouse, the AI front desk for {{business_name}}. You manage check-in, communicate wait times, and handle follow-ups. EMERGENCY: Chest pain, stroke symptoms (FAST), severe breathing difficulty, major trauma → call 911, go to ER. Hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse! I can tell you our current wait time, what we treat, or help you check in. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, an urgent care clinic. Share wait times, explain services, and assist with check-in. CRITICAL: Chest pain, stroke symptoms, severe breathing issues, major trauma → direct to 911/ER immediately. Transfer to provider for clinical questions.",
    receptionist_faqs: [
      { question: 'What is the wait time?', answer: "Current estimated wait is about {{current_wait}}. You can check in online to save your spot: {{checkin_link}}", category: 'general' },
      { question: 'What do you treat?', answer: "We treat {{conditions}}. For life-threatening emergencies (chest pain, stroke, severe trauma), please call 911 or go to the ER.", category: 'services' },
      { question: 'Do you take walk-ins?', answer: "Yes — no appointment needed! Walk in during our hours or check in online to reserve your spot.", category: 'general' },
      { question: 'Do you accept insurance?', answer: "We accept most major insurance plans. Your copay is typically the same as a specialist visit. We also offer self-pay rates.", category: 'insurance' }
    ],
    receptionist_transfer_triggers: ['potential ER-level emergency — direct to 911', 'clinical question about treatment', 'billing dispute', 'workers comp or auto accident paperwork', 'complaint about wait or care'],
    wizard_steps: [
      { step_number: 1, title: 'Your Clinic', description: "Setup.", fields: [
        { name: 'business_name', label: 'Clinic Name', type: 'text', placeholder: 'QuickCare Urgent Care', required: true },
        { name: 'owner_name', label: 'Medical Director', type: 'text', placeholder: 'Dr. David Park, MD', required: true },
        { name: 'phone', label: 'Clinic Phone', type: 'phone', placeholder: '(555) 200-0008', required: true },
        { name: 'address', label: 'Clinic Address', type: 'text', placeholder: '800 Care Ave', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'What you treat.', fields: [
        { name: 'conditions', label: 'Conditions Treated', type: 'text', placeholder: 'Cold/flu, sprains, cuts, UTI, rash, ear infections, COVID/flu testing, X-rays', required: true },
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Illness Treatment', 'Injury Treatment', 'X-Rays', 'Lab Work', 'Stitches', 'Splinting', 'Physical Exams', 'Drug Testing', 'COVID/Flu Testing', 'Vaccinations', 'Workers Comp', 'DOT Physicals'] },
        { name: 'business_hours', label: 'Clinic Hours', type: 'time_range', placeholder: 'Mon-Sun 8am-8pm', required: true }
      ]},
      { step_number: 3, title: 'Check-In', description: 'Patient flow.', fields: [
        { name: 'online_checkin', label: 'Offer Online Check-In?', type: 'toggle', placeholder: '', required: true },
        { name: 'avg_wait', label: 'Average Wait Time', type: 'select', placeholder: 'Select', required: true, options: ['15-30 minutes', '30-45 minutes', '45-60 minutes'] }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.quickcareuc.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'patient-queue', title: 'Patient Queue', description: 'Current patients and wait times.', priority: 1 },
      { id: 'daily-volume', title: 'Daily Patient Volume', description: 'Patients seen today vs. average.', priority: 2 },
      { id: 'wait-times', title: 'Average Wait Time', description: 'Current and trending wait times.', priority: 3 },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue from today\'s visits.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send follow-up after visit', description: 'Text patient 48 hours after visit to check on recovery.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Post wait time to website', description: 'Update online wait time display.', category: 'operations', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review request after visit.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Flu season promotion', description: 'Promote flu shots and COVID boosters.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Patients Per Day', unit: 'count', description: 'Total patients seen daily.', target_suggestion: 40 },
      { name: 'Average Wait Time', unit: 'minutes', description: 'Door-to-provider wait time.', target_suggestion: 25 },
      { name: 'Revenue Per Patient', unit: 'dollars', description: 'Average revenue per visit.', target_suggestion: 175 },
      { name: 'Patient Satisfaction', unit: 'percentage', description: 'Patients rating 4+ stars.', target_suggestion: 90 }
    ],
    suggested_integrations: [
      { name: 'Practice Velocity', slug: 'practice-velocity', category: 'emr', why: 'Urgent care-specific EMR and management.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local urgent care search visibility.', priority: 'essential' },
      { name: 'Solv', slug: 'solv', category: 'checkin', why: 'Online check-in and wait time management.', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Process copays and self-pay.', priority: 'recommended' }
    ],
    integration_priority: ['practice-velocity', 'google-business', 'solv', 'stripe'],
    email_templates: [
      { name: 'Visit Follow-Up', subject: 'How Are You Feeling? — {{business_name}}', body: "Hi {{customer_name}},\n\nWe hope you're feeling better since your visit to {{business_name}}.\n\nIf symptoms persist or worsen, please come back or contact your primary care doctor.\n\nReview: {{review_link}}\n\n— {{business_name}}", trigger: 'visit_followup_48h' }
    ],
    sms_templates: [
      { name: 'Check-In Confirmation', body: "{{customer_name}}, you're checked in at {{business_name}}! Estimated wait: {{wait_time}}. We'll text you when it's almost your turn.", trigger: 'online_checkin' },
      { name: 'Your Turn', body: "{{customer_name}}, we're ready for you at {{business_name}}! Please come to the front desk.", trigger: 'patient_turn' },
      { name: 'Follow-Up', body: "Hi {{customer_name}}, hope you're feeling better since visiting {{business_name}}. If symptoms persist, come back or see your primary doc. Review: {{review_link}}", trigger: 'visit_followup' }
    ],
    estimated_hours_saved_weekly: 20,
    estimated_monthly_value: 5000,
    ideal_plan: 'enterprise',
    competitor_tools: ['Practice Velocity', 'DocuTAP', 'Solv', 'Experity']
  },

  // ─── 9. DERMATOLOGY ───
  {
    id: 'dermatology', industry: 'Healthcare', niche: 'Dermatology', display_name: 'Dermatology', emoji: '🔬',
    tagline: 'Your AI patient coordinator that books skin checks, manages treatment follow-ups, and reduces no-shows.',
    demo_greeting: "Hi! I'm Mouse, your AI dermatology assistant. I book skin exams, manage treatment follow-ups, and keep your schedule full.",
    demo_system_prompt: "You are Mouse, an AI demo for a dermatology office. Book skin checks, explain services. Never diagnose or advise on skin conditions. Always recommend a professional examination.",
    demo_suggested_messages: ['I need a skin check', 'I have a mole that changed', 'How much for acne treatment?', 'Do you do cosmetic procedures?'],
    soul_template: "You are Mouse, the AI coordinator for {{business_name}}. You book skin exams, manage follow-ups, and handle patient inquiries. Never diagnose. For changing moles or suspicious lesions: schedule promptly. Hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse! I can schedule a skin exam or answer questions about our services.",
    receptionist_system_prompt: "You are Mouse, the receptionist for {{business_name}}, dermatology. Book skin exams, cosmetic consultations, and follow-ups. PRIORITY: Rapidly changing moles or new suspicious lesions → schedule within the week. Never diagnose. Transfer to provider for clinical questions or biopsy results.",
    receptionist_faqs: [
      { question: 'I have a mole that changed. Should I be concerned?', answer: "Any changing mole should be checked by a dermatologist. Let me get you scheduled as soon as possible — we prioritize these appointments.", category: 'services' },
      { question: 'How much for a skin check?', answer: "A full-body skin exam is {{skin_check_price}}. Most insurance covers annual skin checks. We'll verify your benefits.", category: 'pricing' },
      { question: 'Do you treat acne?', answer: "Yes! We offer medical and cosmetic acne treatments including {{acne_treatments}}. An initial consultation helps us create a personalized plan.", category: 'services' },
      { question: 'Do you do cosmetic procedures?', answer: "Yes — we offer {{cosmetic_services}}. Consultations are available to discuss your goals.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['biopsy results inquiry', 'suspected melanoma or rapidly changing mole', 'medication reaction', 'complaint about treatment', 'insurance pre-authorization needed'],
    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: "Setup.", fields: [
        { name: 'business_name', label: 'Practice Name', type: 'text', placeholder: 'SkinFirst Dermatology', required: true },
        { name: 'owner_name', label: 'Dermatologist', type: 'text', placeholder: 'Dr. Nina Patel, MD', required: true },
        { name: 'phone', label: 'Office Phone', type: 'phone', placeholder: '(555) 200-0009', required: true },
        { name: 'address', label: 'Office Address', type: 'text', placeholder: '900 Skin Care Blvd', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Your dermatology services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Skin Cancer Screening', 'Mole Evaluation', 'Acne Treatment', 'Eczema/Psoriasis', 'Rosacea', 'Wart Removal', 'Biopsies', 'Botox', 'Fillers', 'Chemical Peels', 'Laser Treatment', 'Mohs Surgery'] },
        { name: 'skin_check_price', label: 'Skin Check Price', type: 'currency', placeholder: '200', required: true },
        { name: 'acne_treatments', label: 'Acne Treatments Offered', type: 'text', placeholder: 'Topical, oral, Accutane, chemical peels, laser', required: false },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-5pm', required: true }
      ]},
      { step_number: 3, title: 'Cosmetic', description: 'Cosmetic services.', fields: [
        { name: 'cosmetic_services', label: 'Cosmetic Services', type: 'text', placeholder: 'Botox, fillers, chemical peels, laser resurfacing', required: false },
        { name: 'insurance_list', label: 'Insurance Accepted', type: 'text', placeholder: 'Most major plans', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.skinfirstderm.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-patients', title: "Today's Patients", description: 'Scheduled dermatology appointments.', priority: 1 },
      { id: 'biopsy-results', title: 'Pending Biopsy Results', description: 'Biopsies awaiting pathology results.', priority: 2 },
      { id: 'annual-recalls', title: 'Annual Skin Check Recalls', description: 'Patients due for annual screening.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue from medical and cosmetic.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send annual skin check reminder', description: 'Remind patients due for yearly skin exam.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Follow up on treatment plan', description: 'Check in with acne/eczema patients after 6 weeks.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Confirm appointments', description: 'Send next-day confirmation texts.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Request review', description: 'Ask for review after visit.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Patients Per Day', unit: 'count', description: 'Patient visits per day.', target_suggestion: 25 },
      { name: 'No-Show Rate', unit: 'percentage', description: 'Appointments that no-show.', target_suggestion: 5 },
      { name: 'Cosmetic Revenue', unit: 'dollars', description: 'Monthly cosmetic procedure revenue.', target_suggestion: 15000 },
      { name: 'Annual Recall Rate', unit: 'percentage', description: 'Patients returning for annual skin check.', target_suggestion: 60 }
    ],
    suggested_integrations: [
      { name: 'ModMed', slug: 'modmed', category: 'ehr', why: 'Dermatology-specific EHR.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local dermatology search visibility.', priority: 'essential' },
      { name: 'PatientPop', slug: 'patientpop', category: 'marketing', why: 'Patient acquisition and reputation management.', priority: 'recommended' },
      { name: 'CareCredit', slug: 'carecredit', category: 'financing', why: 'Patient financing for cosmetic procedures.', priority: 'recommended' }
    ],
    integration_priority: ['modmed', 'google-business', 'patientpop', 'carecredit'],
    email_templates: [
      { name: 'Annual Skin Check', subject: 'Time for Your Annual Skin Check — {{business_name}}', body: "Hi {{customer_name}},\n\nIt's been about a year since your last skin exam. Annual screenings catch changes early.\n\nBook: {{booking_link}}\n\n— {{business_name}}", trigger: 'annual_recall' },
      { name: 'Treatment Follow-Up', subject: 'How is Your Skin Doing? — {{business_name}}', body: "Hi {{customer_name}},\n\nIt's been {{weeks_since}} weeks since starting your {{treatment_name}}. How are things going?\n\nIf you're seeing improvement, great! If not, let's adjust your plan.\n\nBook a follow-up: {{booking_link}}\n\n— {{business_name}}", trigger: 'treatment_followup' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: your dermatology appointment at {{business_name}} is tomorrow at {{time}}. See you then!", trigger: 'appointment_reminder_24h' },
      { name: 'Annual Recall', body: "Hi {{customer_name}}, you're due for your annual skin check at {{business_name}}. Book: {{booking_link}}", trigger: 'annual_recall' },
      { name: 'Review Request', body: "Thanks for visiting {{business_name}}, {{customer_name}}! A review helps others find quality skin care: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 16,
    estimated_monthly_value: 4500,
    ideal_plan: 'growth',
    competitor_tools: ['ModMed', 'Nextech', 'PatientPop', 'Weave']
  },

  // ─── 10. PODIATRIST ───
  {
    id: 'podiatrist', industry: 'Healthcare', niche: 'Podiatrist', display_name: 'Podiatrist', emoji: '🦶',
    tagline: 'Your AI front desk that books foot & ankle appointments and manages diabetic foot care follow-ups.',
    demo_greeting: "Hi! I'm Mouse, your AI podiatry assistant. I book appointments, manage diabetic foot care follow-ups, and keep your practice running smoothly.",
    demo_system_prompt: "You are Mouse, an AI demo for a podiatry office. Book appointments, explain services. Never diagnose. For diabetic foot ulcers with signs of infection (redness, warmth, drainage), recommend urgent evaluation.",
    demo_suggested_messages: ['I have heel pain', 'I need diabetic foot care', 'How much for custom orthotics?', 'I have an ingrown toenail'],
    soul_template: "You are Mouse, the AI front desk for {{business_name}}. You book appointments, manage diabetic foot care schedules, and handle patient inquiries. URGENT: Diabetic patients with foot wounds showing infection signs → same-day appointment. Hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse! I can schedule a foot or ankle appointment or answer questions about our services.",
    receptionist_system_prompt: "You are Mouse, the receptionist for {{business_name}}, podiatry. Book appointments, explain services. PRIORITY: Diabetic foot with infection signs → urgent same-day. Never diagnose. Transfer to doctor for clinical questions or post-surgical concerns.",
    receptionist_faqs: [
      { question: 'How much for custom orthotics?', answer: "Custom orthotics are {{orthotics_price}} including the evaluation and fitting. Many insurance plans cover a portion.", category: 'pricing' },
      { question: 'I have heel pain. What could it be?', answer: "Heel pain has several causes — plantar fasciitis is most common. A proper evaluation will determine the cause and best treatment. Let me schedule you.", category: 'services' },
      { question: 'Do you treat ingrown toenails?', answer: "Yes! Ingrown toenail treatment is {{ingrown_price}}. We can usually see you within a day or two.", category: 'services' },
      { question: 'Do you accept Medicare?', answer: "Yes — we accept Medicare and most insurance plans. Diabetic foot care is typically covered under Medicare.", category: 'insurance' }
    ],
    receptionist_transfer_triggers: ['diabetic foot wound with infection signs', 'post-surgical complication', 'clinical question about treatment', 'fracture or acute injury', 'complaint about care'],
    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: "Setup.", fields: [
        { name: 'business_name', label: 'Practice Name', type: 'text', placeholder: 'FootFirst Podiatry', required: true },
        { name: 'owner_name', label: 'Podiatrist', type: 'text', placeholder: 'Dr. Kevin Wright, DPM', required: true },
        { name: 'phone', label: 'Office Phone', type: 'phone', placeholder: '(555) 200-0010', required: true },
        { name: 'address', label: 'Office Address', type: 'text', placeholder: '1000 Foot Care Dr', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Podiatry services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Heel Pain', 'Ingrown Toenails', 'Bunions', 'Custom Orthotics', 'Diabetic Foot Care', 'Flat Feet', 'Ankle Sprains', 'Warts', 'Fungal Nails', 'Foot Surgery', 'Sports Medicine', 'Wound Care'] },
        { name: 'orthotics_price', label: 'Custom Orthotics Price', type: 'currency', placeholder: '450', required: false },
        { name: 'ingrown_price', label: 'Ingrown Toenail Treatment Price', type: 'currency', placeholder: '200', required: false },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-5pm', required: true }
      ]},
      { step_number: 3, title: 'Insurance', description: 'Plans accepted.', fields: [
        { name: 'insurance_list', label: 'Insurance Accepted', type: 'text', placeholder: 'Medicare, Blue Cross, Aetna, United...', required: true },
        { name: 'diabetic_program', label: 'Diabetic Foot Care Program?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.footfirstpodiatry.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-patients', title: "Today's Patients", description: 'Scheduled podiatry appointments.', priority: 1 },
      { id: 'diabetic-followups', title: 'Diabetic Follow-Ups', description: 'Diabetic patients due for foot check.', priority: 2 },
      { id: 'orthotics-orders', title: 'Orthotics Orders', description: 'Custom orthotics in production.', priority: 3 },
      { id: 'weekly-production', title: 'Weekly Production', description: 'Revenue for the week.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send diabetic foot care reminder', description: 'Remind diabetic patients of scheduled foot checks.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Orthotics ready notification', description: 'Notify patient when custom orthotics are ready.', category: 'operations', difficulty: 'automatic' },
      { title: 'Appointment reminder', description: 'Confirm next-day appointments.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Request review', description: 'Ask for review after visit.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Patients Per Day', unit: 'count', description: 'Patient visits per day.', target_suggestion: 18 },
      { name: 'Diabetic Compliance', unit: 'percentage', description: 'Diabetic patients keeping scheduled checks.', target_suggestion: 80 },
      { name: 'Average Visit Value', unit: 'dollars', description: 'Average revenue per visit.', target_suggestion: 150 },
      { name: 'Orthotics Conversion', unit: 'percentage', description: 'Patients who order recommended orthotics.', target_suggestion: 55 }
    ],
    suggested_integrations: [
      { name: 'ModMed', slug: 'modmed', category: 'ehr', why: 'Podiatry-specific EHR templates.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local podiatrist search visibility.', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Process copays and orthotics payments.', priority: 'recommended' },
      { name: 'Weave', slug: 'weave', category: 'communication', why: 'Patient communication and reviews.', priority: 'recommended' }
    ],
    integration_priority: ['modmed', 'google-business', 'stripe', 'weave'],
    email_templates: [
      { name: 'Diabetic Foot Check Reminder', subject: 'Diabetic Foot Check Due — {{business_name}}', body: "Hi {{customer_name}},\n\nAs a diabetic patient, regular foot exams are essential. You're due for your {{frequency}} foot check.\n\nBook: {{booking_link}}\n\n— {{business_name}}", trigger: 'diabetic_recall' },
      { name: 'Orthotics Ready', subject: 'Your Custom Orthotics Are Ready — {{business_name}}', body: "Hi {{customer_name}},\n\nYour custom orthotics have arrived! Schedule your fitting: {{booking_link}}\n\n— {{business_name}}", trigger: 'orthotics_ready' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: your podiatry appointment at {{business_name}} is tomorrow at {{time}}.", trigger: 'appointment_reminder_24h' },
      { name: 'Orthotics Ready', body: "{{customer_name}}, your custom orthotics from {{business_name}} are ready! Call {{phone}} to schedule your fitting.", trigger: 'orthotics_ready' },
      { name: 'Diabetic Recall', body: "Hi {{customer_name}}, you're due for your diabetic foot check at {{business_name}}. Book: {{booking_link}}", trigger: 'diabetic_recall' }
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 3000,
    ideal_plan: 'growth',
    competitor_tools: ['ModMed', 'Nextech', 'DrChrono', 'Weave']
  },

  // ─── 11. PEDIATRICIAN ───
  {
    id: 'pediatrician', industry: 'Healthcare', niche: 'Pediatrician', display_name: 'Pediatrician', emoji: '👶',
    tagline: 'Your AI front desk that books well-child visits, sends vaccine reminders, and reassures worried parents.',
    demo_greeting: "Hi! I'm Mouse, your AI pediatric office assistant. I book well-child visits, send vaccine reminders, and help worried parents get quick answers.",
    demo_system_prompt: "You are Mouse, an AI demo for a pediatric office. Book well-child visits, sick visits, and answer general questions. Be warm and reassuring to parents. EMERGENCY: Difficulty breathing, seizure, high fever in infant < 3 months, ingestion of poison → call 911. Never provide medical advice.",
    demo_suggested_messages: ['My baby has a fever', 'I need to schedule vaccines', 'When is the next well-child visit?', 'My child has an ear infection'],
    soul_template: "You are Mouse, the AI front desk for {{business_name}}. You book well-child and sick visits, send vaccine reminders, and reassure worried parents. EMERGENCY: Infant < 3 months with fever > 100.4°F, difficulty breathing, seizure, poisoning → call 911 or go to ER. Never provide medical advice. Hours: {{business_hours}}. Phone: {{phone}}. After-hours line: {{after_hours}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse! Is your little one sick, or do you need to schedule a visit?",
    receptionist_system_prompt: "You are Mouse, the receptionist for {{business_name}}, pediatrics. Book well-child and sick visits. EMERGENCY: Infant < 3 months with fever > 100.4°F → ER immediately. Difficulty breathing, seizure, poisoning → 911. Be warm, reassuring. Transfer to nurse for symptom triage or doctor for clinical questions.",
    receptionist_faqs: [
      { question: 'My baby has a fever. What should I do?', answer: "How old is your baby and what's the temperature? For babies under 3 months with a fever of 100.4°F or higher, please go to the ER right away. For older children, let me check if we have a same-day sick visit available.", category: 'urgent' },
      { question: 'When is the next well-child visit?', answer: "Well-child visits follow the AAP schedule: {{visit_schedule}}. I can check when your child is due and schedule it now.", category: 'services' },
      { question: 'What vaccines does my child need?', answer: "We follow the CDC-recommended schedule. Your child's specific needs depend on their age. I can pull up their record and let you know what's due.", category: 'services' },
      { question: 'Do you accept my insurance?', answer: "We accept {{insurance_list}}. Most plans cover well-child visits and vaccines at 100%.", category: 'insurance' }
    ],
    receptionist_transfer_triggers: ['infant < 3 months with fever — direct to ER', 'parent reporting difficulty breathing', 'clinical symptom assessment needed', 'complaint about care', 'newborn or hospital follow-up'],
    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: "Setup.", fields: [
        { name: 'business_name', label: 'Practice Name', type: 'text', placeholder: 'Little Stars Pediatrics', required: true },
        { name: 'owner_name', label: 'Pediatrician', type: 'text', placeholder: 'Dr. Emily Foster, MD', required: true },
        { name: 'phone', label: 'Office Phone', type: 'phone', placeholder: '(555) 200-0011', required: true },
        { name: 'address', label: 'Office Address', type: 'text', placeholder: '1100 Kids Way', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Your pediatric services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Well-Child Visits', 'Sick Visits', 'Vaccinations', 'Newborn Care', 'ADHD Management', 'Asthma Care', 'Allergy Testing', 'Sports Physicals', 'Developmental Screening', 'Telehealth', 'Same-Day Sick'] },
        { name: 'visit_schedule', label: 'Well-Child Visit Schedule Note', type: 'text', placeholder: '2 weeks, 2/4/6/9/12/15/18/24 months, then annually', required: true },
        { name: 'insurance_list', label: 'Insurance Accepted', type: 'text', placeholder: 'Most major plans, Medicaid, CHIP', required: true },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-5pm, Sat 9am-12pm', required: true }
      ]},
      { step_number: 3, title: 'After Hours', description: 'After-hours support.', fields: [
        { name: 'after_hours', label: 'After-Hours Phone/Service', type: 'text', placeholder: 'After-hours nurse line: (555) 200-0099', required: true },
        { name: 'same_day_sick', label: 'Same-Day Sick Visits?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.littlestarspeds.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-patients', title: "Today's Patients", description: 'Scheduled well-child and sick visits.', priority: 1 },
      { id: 'vaccine-schedule', title: 'Vaccines Due', description: 'Children due for vaccines this month.', priority: 2 },
      { id: 'well-child-recalls', title: 'Well-Child Recalls', description: 'Children due for their next checkup.', priority: 3 },
      { id: 'monthly-visits', title: 'Monthly Visits', description: 'Total patient visits this month.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send vaccine reminder', description: 'Text parents when their child is due for vaccines.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Well-child visit reminder', description: 'Remind parents when next checkup is due.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Send appointment confirmation', description: 'Confirm next-day appointments.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Request review', description: 'Ask for review after visit.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Patients Per Day', unit: 'count', description: 'Patient visits per day.', target_suggestion: 25 },
      { name: 'Vaccine Compliance', unit: 'percentage', description: 'Children current on vaccines.', target_suggestion: 85 },
      { name: 'Well-Child Completion', unit: 'percentage', description: 'Children completing scheduled well-child visits.', target_suggestion: 80 },
      { name: 'Same-Day Availability', unit: 'percentage', description: 'Sick visits seen same day.', target_suggestion: 90 }
    ],
    suggested_integrations: [
      { name: 'PCC', slug: 'pcc', category: 'ehr', why: 'Pediatric-specific EHR.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local pediatrician search visibility.', priority: 'essential' },
      { name: 'Spruce', slug: 'spruce', category: 'communication', why: 'HIPAA-compliant patient messaging.', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Process copays.', priority: 'recommended' }
    ],
    integration_priority: ['pcc', 'google-business', 'spruce', 'stripe'],
    email_templates: [
      { name: 'Well-Child Reminder', subject: "{{child_name}}'s Checkup is Due — {{business_name}}", body: "Hi {{customer_name}},\n\n{{child_name}} is due for their {{visit_type}} visit. These regular checkups are important for tracking growth, development, and staying current on vaccines.\n\nBook: {{booking_link}}\n\n— {{business_name}}", trigger: 'well_child_due' },
      { name: 'Vaccine Reminder', subject: "{{child_name}} is Due for Vaccines — {{business_name}}", body: "Hi {{customer_name}},\n\n{{child_name}} is due for the following vaccines:\n\n{{vaccine_list}}\n\nBook: {{booking_link}}\n\nKeeping vaccinations on schedule protects your child and others.\n\n— {{business_name}}", trigger: 'vaccine_due' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: {{child_name}}'s appointment at {{business_name}} is tomorrow at {{time}}. Bring insurance card and vaccination record!", trigger: 'appointment_reminder_24h' },
      { name: 'Vaccine Due', body: "{{child_name}} is due for vaccines at {{business_name}}! Book: {{booking_link}} or call {{phone}}.", trigger: 'vaccine_due' },
      { name: 'Well-Child Due', body: "Time for {{child_name}}'s checkup at {{business_name}}! Book: {{booking_link}}", trigger: 'well_child_due' }
    ],
    estimated_hours_saved_weekly: 16,
    estimated_monthly_value: 4000,
    ideal_plan: 'growth',
    competitor_tools: ['PCC', 'Office Practicum', 'eClinicalWorks', 'Spruce']
  },

  // ─── 12. HOME HEALTH ───
  {
    id: 'home-health', industry: 'Healthcare', niche: 'Home Health', display_name: 'Home Health Agency', emoji: '🏠',
    tagline: 'Your AI coordinator that manages caregiver schedules, handles family inquiries, and tracks patient care.',
    demo_greeting: "Hi! I'm Mouse, your AI home health coordinator. I manage caregiver schedules, handle family inquiries, and track patient care plans.",
    demo_system_prompt: "You are Mouse, an AI demo for a home health agency. Help families understand services, answer questions about care levels, and schedule consultations. Be compassionate — families seeking home health are often dealing with a loved one's health challenges.",
    demo_suggested_messages: ['My mother needs help at home after surgery', 'What types of care do you provide?', 'How much does home health cost?', 'Do you accept Medicare?'],
    soul_template: "You are Mouse, the AI coordinator for {{business_name}}. You manage caregiver scheduling, handle family inquiries, and coordinate care. Be compassionate — families are dealing with health challenges. EMERGENCY: If a patient has a medical emergency, call 911. Service area: {{service_area}}. Phone: {{phone}}. Hours: {{business_hours}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse. I can help you learn about our home health services, schedule a consultation, or answer questions about caring for your loved one.",
    receptionist_system_prompt: "You are Mouse, the receptionist for {{business_name}}, a home health agency. Help families understand care options, schedule assessments, and answer questions. Be compassionate. For patient emergencies: call 911. Transfer to care coordinator for clinical assessments, medication questions, or care plan changes.",
    receptionist_faqs: [
      { question: 'What types of care do you provide?', answer: "We provide {{care_types}}. We create a custom care plan for each patient based on their needs.", category: 'services' },
      { question: 'How much does it cost?', answer: "Care starts at {{hourly_rate}}/hour. Many services are covered by Medicare, Medicaid, or private insurance. We offer a free in-home assessment to determine your loved one's needs.", category: 'pricing' },
      { question: 'Do you accept Medicare?', answer: "{{medicare_answer}} We also accept Medicaid and most private insurance plans.", category: 'insurance' },
      { question: 'How quickly can you start?', answer: "After an initial assessment, we can typically begin care within {{start_time}}. Emergency or urgent cases may start sooner.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['patient medical emergency — call 911', 'clinical care plan question', 'medication concern', 'complaint about caregiver', 'hospice transition discussion'],
    wizard_steps: [
      { step_number: 1, title: 'Your Agency', description: "Setup.", fields: [
        { name: 'business_name', label: 'Agency Name', type: 'text', placeholder: 'Gentle Care Home Health', required: true },
        { name: 'owner_name', label: 'Administrator', type: 'text', placeholder: 'Patricia Grant, RN', required: true },
        { name: 'phone', label: 'Agency Phone', type: 'phone', placeholder: '(555) 200-0012', required: true },
        { name: 'service_area', label: 'Service Area', type: 'text', placeholder: 'Metro Atlanta area', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Care services offered.', fields: [
        { name: 'care_types', label: 'Care Types', type: 'text', placeholder: 'Skilled nursing, PT/OT, personal care, companionship, medication management', required: true },
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select', required: true, options: ['Skilled Nursing', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Personal Care', 'Companionship', 'Medication Management', 'Wound Care', 'Post-Surgical Care', 'Chronic Disease Management', 'Respite Care', 'Palliative Care'] },
        { name: 'hourly_rate', label: 'Hourly Rate Starting At', type: 'currency', placeholder: '25', required: true },
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: 'Mon-Fri 8am-5pm (care available 24/7)', required: true }
      ]},
      { step_number: 3, title: 'Insurance & Staffing', description: 'Coverage and capacity.', fields: [
        { name: 'accepts_medicare', label: 'Accept Medicare?', type: 'toggle', placeholder: '', required: true },
        { name: 'start_time', label: 'Typical Start Time After Assessment', type: 'select', placeholder: 'Select', required: true, options: ['24 hours', '48 hours', '3-5 days', '1 week'] },
        { name: 'caregiver_count', label: 'Number of Caregivers', type: 'number', placeholder: '30', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "Ready.", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.gentlecarehh.com', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'active-patients', title: 'Active Patients', description: 'All patients receiving care with assigned caregivers.', priority: 1 },
      { id: 'caregiver-schedule', title: 'Caregiver Schedule', description: 'Today\'s caregiver assignments and visits.', priority: 2 },
      { id: 'pending-assessments', title: 'Pending Assessments', description: 'New patient assessments to schedule.', priority: 3 },
      { id: 'care-plan-reviews', title: 'Care Plan Reviews Due', description: 'Patients due for care plan review.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send family update', description: 'Email family members with weekly care summary.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Follow up on new inquiry', description: 'Contact families who inquired about services.', category: 'intake', difficulty: 'automatic' },
      { title: 'Caregiver schedule confirmation', description: 'Confirm caregiver assignments for tomorrow.', category: 'operations', difficulty: 'automatic' },
      { title: 'Care plan review reminder', description: 'Alert when patient is due for care plan review.', category: 'patient-care', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Active Patients', unit: 'count', description: 'Total patients receiving care.', target_suggestion: 50 },
      { name: 'Caregiver Utilization', unit: 'percentage', description: 'Percentage of caregiver hours assigned.', target_suggestion: 85 },
      { name: 'Family Satisfaction', unit: 'percentage', description: 'Families rating 4+ stars.', target_suggestion: 95 },
      { name: 'Intake-to-Start Time', unit: 'days', description: 'Days from inquiry to care start.', target_suggestion: 3 }
    ],
    suggested_integrations: [
      { name: 'Axxess', slug: 'axxess', category: 'ehr', why: 'Home health-specific EHR and billing.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local home health search visibility.', priority: 'essential' },
      { name: 'CareAcademy', slug: 'careacademy', category: 'training', why: 'Caregiver training and compliance.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track billing and payroll.', priority: 'recommended' }
    ],
    integration_priority: ['axxess', 'google-business', 'careacademy', 'quickbooks'],
    email_templates: [
      { name: 'Family Weekly Update', subject: 'Weekly Care Update for {{patient_name}} — {{business_name}}', body: "Dear {{family_member_name}},\n\nHere's your weekly update on {{patient_name}}'s care:\n\n{{care_summary}}\n\nUpcoming visits: {{upcoming_schedule}}\n\nQuestions or concerns? Reply or call {{phone}}.\n\nWith care,\n{{business_name}}", trigger: 'weekly_family_update' },
      { name: 'Initial Consultation', subject: 'Your Home Health Consultation — {{business_name}}', body: "Dear {{family_member_name}},\n\nThank you for contacting {{business_name}}. We've scheduled a free in-home assessment:\n\nDate: {{date}} at {{time}}\nAddress: {{patient_address}}\n\nOur care coordinator will assess needs and recommend a personalized care plan. No obligation.\n\nWe're here to help your family.\n— {{business_name}}", trigger: 'assessment_scheduled' }
    ],
    sms_templates: [
      { name: 'Caregiver Arriving', body: "Hi {{family_member_name}}, {{caregiver_name}} from {{business_name}} will arrive at {{time}} today to care for {{patient_name}}.", trigger: 'caregiver_arriving' },
      { name: 'Assessment Reminder', body: "Reminder: your home health assessment with {{business_name}} is tomorrow at {{time}}. Our care coordinator will be at {{patient_address}}.", trigger: 'assessment_reminder' },
      { name: 'Review Request', body: "How is {{patient_name}}'s care going with {{business_name}}? Your feedback helps families find quality care: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 20,
    estimated_monthly_value: 5000,
    ideal_plan: 'enterprise',
    competitor_tools: ['Axxess', 'WellSky', 'Homecare Homebase', 'MatrixCare']
  }
];
