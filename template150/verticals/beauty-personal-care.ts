import type { ProTemplate } from '../schema';

export const beautyPersonalCareTemplates: ProTemplate[] = [
  // ─── 1. HAIR SALON ───
  {
    id: 'hair-salon',
    industry: 'Beauty & Personal Care',
    niche: 'Hair Salon',
    display_name: 'Hair Salon',
    emoji: '💇',
    tagline: 'Your AI salon manager that books appointments, reduces no-shows, and keeps your chairs full.',
    demo_greeting: "Hey! I'm Mouse, your AI salon manager. I handle bookings, send reminders, and keep your chairs full all week long. Want to see how I'd handle a new client looking for a color appointment?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a hair salon. Show how you handle appointment booking, service recommendations, and client management. Be warm, stylish, and knowledgeable about hair services. Help clients feel excited about their appointment.",
    demo_suggested_messages: ['I want to book a color appointment', 'How much is a haircut?', 'I need a last-minute blowout', 'Do you do balayage?'],
    soul_template: "You are Mouse, the AI salon manager for {{business_name}}. You help {{owner_name}} run their hair salon by booking appointments, managing the schedule, sending reminders, and keeping clients coming back. You're warm, welcoming, and know the difference between highlights and balayage. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! I can help you book an appointment, check availability, or answer questions about our services. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a hair salon. Book appointments, explain services and pricing, and help clients choose the right stylist. Be warm and welcoming. Transfer to the salon owner for complaints, refund requests, or bridal party bookings of 5+.",
    receptionist_faqs: [
      { question: 'How much is a haircut?', answer: "Our women's cuts start at {{womens_cut_price}} and men's cuts at {{mens_cut_price}}. That includes a shampoo, cut, and style. Want me to book you in?", category: 'pricing' },
      { question: 'How much is color?', answer: "Single-process color starts at {{color_price}}. Highlights and balayage start at {{highlights_price}}. A consultation is always free if you're not sure what you want!", category: 'pricing' },
      { question: 'Do I need a consultation first?', answer: "For major color changes, we recommend a free consultation so your stylist can give you an accurate quote and timeline. For cuts and basic services, you can book directly!", category: 'services' },
      { question: 'What if I need to cancel?', answer: "We ask for at least {{cancellation_notice}} notice for cancellations. Late cancellations may be subject to a fee. Life happens though — just let us know as soon as you can!", category: 'policies' },
      { question: 'Do you do bridal hair?', answer: "Yes! We offer bridal styling packages including trials, day-of styling, and bridal party services. Let me connect you with our bridal coordinator for details.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['bridal party of 5+ people', 'complaint about a service', 'refund or redo request', 'wants a specific stylist who is unavailable', 'color correction consultation'],
    wizard_steps: [
      { step_number: 1, title: 'Your Salon', description: "Let's set up your salon.", fields: [
        { name: 'business_name', label: 'Salon Name', type: 'text', placeholder: 'Luxe Hair Studio', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Maria Santos', required: true },
        { name: 'phone', label: 'Salon Phone', type: 'phone', placeholder: '(555) 111-2222', required: true },
        { name: 'address', label: 'Salon Address', type: 'text', placeholder: '100 Style Ave, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your core services.', fields: [
        { name: 'services', label: 'Services Offered', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Haircuts', 'Color', 'Highlights', 'Balayage', 'Blowouts', 'Keratin Treatment', 'Extensions', 'Updos', 'Perms', 'Bridal'] },
        { name: 'womens_cut_price', label: "Women's Cut Starting Price", type: 'currency', placeholder: '55', required: true },
        { name: 'mens_cut_price', label: "Men's Cut Starting Price", type: 'currency', placeholder: '30', required: true },
        { name: 'color_price', label: 'Color Starting Price', type: 'currency', placeholder: '85', required: true }
      ]},
      { step_number: 3, title: 'Schedule & Policies', description: 'Hours and booking rules.', fields: [
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Tue-Sat 9am-7pm', required: true },
        { name: 'cancellation_notice', label: 'Cancellation Notice Required', type: 'select', placeholder: 'Select', required: true, options: ['24 hours', '48 hours', 'Same day OK'] },
        { name: 'highlights_price', label: 'Highlights Starting Price', type: 'currency', placeholder: '120', required: false }
      ]},
      { step_number: 4, title: 'Get Started', description: "You're ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.luxehairstudio.com', required: false },
        { name: 'instagram', label: 'Instagram', type: 'text', placeholder: '@luxehairstudio', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Appointments", description: 'Full schedule with stylist assignments and services.', priority: 1 },
      { id: 'no-show-tracker', title: 'No-Show Tracker', description: 'Clients who missed appointments this week.', priority: 2 },
      { id: 'rebooking-rate', title: 'Rebooking Rate', description: 'Percentage of clients who rebook before leaving.', priority: 3 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue by stylist and service type.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send appointment reminder', description: 'Text clients 24 hours before their appointment.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Follow up for rebooking', description: 'Text clients who left without rebooking after 2 weeks.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Send birthday discount', description: 'Email clients a birthday month discount.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Request Google review', description: 'Ask for a review 24 hours after appointment.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Chair Utilization', unit: 'percentage', description: 'Percentage of available appointment slots booked.', target_suggestion: 80 },
      { name: 'Average Ticket', unit: 'dollars', description: 'Average revenue per client visit.', target_suggestion: 95 },
      { name: 'No-Show Rate', unit: 'percentage', description: 'Percentage of booked appointments that no-show.', target_suggestion: 5 },
      { name: 'Rebooking Rate', unit: 'percentage', description: 'Clients who book their next appointment before leaving.', target_suggestion: 60 }
    ],
    suggested_integrations: [
      { name: 'Vagaro', slug: 'vagaro', category: 'booking', why: 'Salon scheduling, POS, and client management.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up in local salon searches.', priority: 'essential' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Showcase your work and attract new clients.', priority: 'recommended' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Process payments and track sales by stylist.', priority: 'recommended' }
    ],
    integration_priority: ['vagaro', 'google-business', 'instagram', 'square'],
    email_templates: [
      { name: 'Appointment Confirmation', subject: 'Your Appointment at {{business_name}}', body: "Hi {{customer_name}},\n\nYou're booked!\n\nDate: {{date}}\nTime: {{time}}\nStylist: {{stylist_name}}\nService: {{service}}\n\nPlease arrive 5 minutes early. Need to reschedule? Call {{phone}} or reply to this email.\n\nSee you soon!\n— {{business_name}}", trigger: 'appointment_booked' },
      { name: 'Rebooking Nudge', subject: "It's Been a While! — {{business_name}}", body: "Hi {{customer_name}},\n\nIt's been {{weeks_since}} weeks since your last visit. Time for a refresh?\n\nBook online: {{booking_link}}\nOr call: {{phone}}\n\nWe'd love to see you!\n— {{business_name}}", trigger: 'no_rebook_14_days' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}! Reminder: your appointment at {{business_name}} is tomorrow at {{time}} with {{stylist_name}}. See you then!", trigger: 'appointment_reminder_24h' },
      { name: 'Review Request', body: "Thanks for visiting {{business_name}}, {{customer_name}}! Love your new look? A quick review would mean so much: {{review_link}}", trigger: 'review_request_24h' },
      { name: 'Birthday Offer', body: "Happy Birthday, {{customer_name}}! 🎂 Enjoy {{birthday_discount}} off your next visit at {{business_name}} this month. Book: {{booking_link}}", trigger: 'birthday_month' }
    ],
    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2800,
    ideal_plan: 'pro',
    competitor_tools: ['Vagaro', 'Fresha', 'Boulevard', 'GlossGenius']
  },

  // ─── 2. BARBERSHOP ───
  {
    id: 'barbershop',
    industry: 'Beauty & Personal Care',
    niche: 'Barbershop',
    display_name: 'Barbershop',
    emoji: '💈',
    tagline: 'Your AI shop manager that keeps the chairs full, wait times low, and clients coming back.',
    demo_greeting: "What's up! I'm Mouse, your AI barbershop manager. I handle bookings, manage the wait list, and keep your barbers busy. Want to see how I'd handle a walk-in checking wait times?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a barbershop. Handle walk-in waitlist management, appointment booking, and service questions. Be cool, confident, and efficient — barbershop vibe.",
    demo_suggested_messages: ['How long is the wait right now?', 'I want to book with my usual barber', 'How much for a fade?', 'Do you do beard trims?'],
    soul_template: "You are Mouse, the AI manager for {{business_name}}. You help {{owner_name}} run their barbershop by managing the wait list, booking appointments, keeping the schedule tight, and bringing clients back. You match the barbershop vibe — cool, efficient, no fuss. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "{{business_name}}, this is Mouse! Need to check the wait, book an appointment, or got a question? What's up?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a barbershop. Manage the waitlist, book appointments, answer pricing questions. Keep it efficient and match the shop's vibe. Transfer to the shop owner for complaints or group booking (5+ cuts).",
    receptionist_faqs: [
      { question: 'How much for a haircut?', answer: "A standard cut is {{cut_price}}. Fade with lineup is {{fade_price}}. Kids cuts are {{kids_price}}. All cuts include a hot towel and neck shave.", category: 'pricing' },
      { question: 'How long is the wait?', answer: "Let me check — right now the wait is approximately {{current_wait}}. Want me to add you to the list or book a time later today?", category: 'general' },
      { question: 'Do I need an appointment?', answer: "Walk-ins are always welcome! But booking ahead guarantees your spot with your favorite barber and skips the wait.", category: 'general' },
      { question: 'Do you do beard trims?', answer: "Absolutely. Beard trim is {{beard_price}}, or add it to your cut for {{combo_price}} total.", category: 'pricing' },
      { question: 'Do you take kids?', answer: "Yes! Kids 12 and under are {{kids_price}}. We're patient and good with little ones.", category: 'pricing' }
    ],
    receptionist_transfer_triggers: ['group booking for 5+ people', 'complaint about a cut', 'asking about renting a chair', 'event or wedding party booking', 'media or sponsorship inquiry'],
    wizard_steps: [
      { step_number: 1, title: 'Your Shop', description: "Let's set up your barbershop.", fields: [
        { name: 'business_name', label: 'Shop Name', type: 'text', placeholder: "King's Barbershop", required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Marcus King', required: true },
        { name: 'phone', label: 'Shop Phone', type: 'phone', placeholder: '(555) 222-3333', required: true },
        { name: 'address', label: 'Shop Address', type: 'text', placeholder: '200 Barber Blvd, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'What do you charge?', fields: [
        { name: 'cut_price', label: 'Standard Cut Price', type: 'currency', placeholder: '30', required: true },
        { name: 'fade_price', label: 'Fade + Lineup Price', type: 'currency', placeholder: '35', required: true },
        { name: 'beard_price', label: 'Beard Trim Price', type: 'currency', placeholder: '15', required: true },
        { name: 'kids_price', label: 'Kids Cut Price', type: 'currency', placeholder: '20', required: true }
      ]},
      { step_number: 3, title: 'Hours & Setup', description: 'When are you open?', fields: [
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Tue-Sat 9am-7pm', required: true },
        { name: 'walk_ins', label: 'Accept Walk-Ins?', type: 'toggle', placeholder: '', required: true },
        { name: 'barber_count', label: 'Number of Barbers', type: 'number', placeholder: '4', required: true }
      ]},
      { step_number: 4, title: 'Go Live', description: "You're set!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.kingsbarbershop.com', required: false },
        { name: 'combo_price', label: 'Cut + Beard Combo Price', type: 'currency', placeholder: '45', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'waitlist', title: 'Current Waitlist', description: 'Walk-in queue with estimated wait times.', priority: 1 },
      { id: 'todays-appointments', title: "Today's Appointments", description: 'Booked appointments by barber.', priority: 2 },
      { id: 'daily-cuts', title: 'Cuts Today', description: 'Total haircuts completed today by barber.', priority: 3 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue by barber and service.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send appointment reminder', description: 'Text clients about upcoming appointments.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Notify walk-in their turn is next', description: 'Text the next person on the waitlist.', category: 'operations', difficulty: 'automatic' },
      { title: 'Send "time for a cut" reminder', description: 'Text regulars who haven\'t been in for 4+ weeks.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Request review after cut', description: 'Send review link after service.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Cuts Per Day', unit: 'count', description: 'Total haircuts across all barbers per day.', target_suggestion: 35 },
      { name: 'Average Wait Time', unit: 'minutes', description: 'Average walk-in wait time.', target_suggestion: 15 },
      { name: 'Client Return Rate', unit: 'percentage', description: 'Clients who return within 5 weeks.', target_suggestion: 70 },
      { name: 'Average Ticket', unit: 'dollars', description: 'Average spend per client.', target_suggestion: 38 }
    ],
    suggested_integrations: [
      { name: 'Booksy', slug: 'booksy', category: 'booking', why: 'Leading barbershop booking platform.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Show up in local barbershop searches.', priority: 'essential' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Fast checkout and tip processing.', priority: 'recommended' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Show off fresh cuts and shop vibe.', priority: 'recommended' }
    ],
    integration_priority: ['booksy', 'google-business', 'square', 'instagram'],
    email_templates: [
      { name: 'Appointment Confirmation', subject: "You're Booked at {{business_name}}", body: "What's up {{customer_name}},\n\nYou're locked in:\n\nDate: {{date}}\nTime: {{time}}\nBarber: {{barber_name}}\n\nSee you at {{address}}.\n\n— {{business_name}}", trigger: 'appointment_booked' },
      { name: 'Time for a Cut', subject: "Looking a Little Shaggy? — {{business_name}}", body: "Hey {{customer_name}},\n\nIt's been {{weeks_since}} weeks. Time for a fresh cut?\n\nBook your spot: {{booking_link}}\n\nSee you in the chair!\n— {{business_name}}", trigger: 'no_visit_4_weeks' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "{{customer_name}}, reminder: you're booked at {{business_name}} tomorrow at {{time}} with {{barber_name}}. See you there!", trigger: 'appointment_reminder_24h' },
      { name: 'Waitlist Update', body: "{{customer_name}}, you're up next at {{business_name}}! Head over now.", trigger: 'waitlist_next' },
      { name: 'Come Back', body: "Hey {{customer_name}}, it's been a minute! Time for a fresh cut at {{business_name}}? Book: {{booking_link}}", trigger: 'no_visit_4_weeks' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
    competitor_tools: ['Booksy', 'Squire', 'Fresha', 'The Cut App']
  },

  // ─── 3. NAIL SALON ───
  {
    id: 'nail-salon',
    industry: 'Beauty & Personal Care',
    niche: 'Nail Salon',
    display_name: 'Nail Salon',
    emoji: '💅',
    tagline: 'Your AI receptionist that books nail appointments, manages walk-ins, and fills every station.',
    demo_greeting: "Hi! I'm Mouse, your AI nail salon assistant. I book appointments, manage walk-ins, and keep every station busy. Want to see how I'd help someone book a gel manicure?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a nail salon. Help clients book nail services, choose between options, and understand pricing. Be friendly, helpful, and knowledgeable about nail services.",
    demo_suggested_messages: ['I want to book a gel manicure', 'How much for a pedicure?', "What's the difference between gel and dip?", 'Do you do nail art?'],
    soul_template: "You are Mouse, the AI receptionist for {{business_name}}. You help {{owner_name}} run their nail salon by booking appointments, managing walk-ins, explaining services, and keeping clients coming back. You know the difference between gel, dip, acrylic, and regular polish. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! I can book your appointment or answer any questions about our nail services. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a nail salon. Book appointments, explain service differences (gel vs dip vs acrylic), provide pricing, and manage the walk-in waitlist. Be warm and helpful. Transfer to the salon manager for group bookings (bridal, parties), complaints, or gift card issues.",
    receptionist_faqs: [
      { question: 'How much is a gel manicure?', answer: "A gel manicure is {{gel_mani_price}}. Regular polish manicure is {{reg_mani_price}}. Both include shaping, cuticle care, and hand massage.", category: 'pricing' },
      { question: "What's the difference between gel and dip?", answer: "Gel is cured under a UV light and lasts 2-3 weeks. Dip powder doesn't need a light and can last 3-4 weeks with a more natural feel. Both look great — it comes down to preference!", category: 'services' },
      { question: 'How much for a pedicure?', answer: "Our classic pedicure is {{pedi_price}}. Spa pedicure with extra pampering is {{spa_pedi_price}}. Both include soak, scrub, massage, and polish.", category: 'pricing' },
      { question: 'Do you do walk-ins?', answer: "Yes! Walk-ins are welcome based on availability. Booking ahead guarantees your time slot. Current wait is about {{current_wait}}.", category: 'general' },
      { question: 'Do you do nail art?', answer: "Yes! Simple nail art starts at {{nail_art_price}} per nail. Custom designs vary — bring your inspiration photos and we'll quote you!", category: 'services' }
    ],
    receptionist_transfer_triggers: ['bridal or party group booking', 'complaint about service', 'gift card issue', 'allergic reaction concern', 'wants specific technician unavailable today'],
    wizard_steps: [
      { step_number: 1, title: 'Your Salon', description: "Let's set up your nail salon.", fields: [
        { name: 'business_name', label: 'Salon Name', type: 'text', placeholder: 'Polished Nail Bar', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Lisa Nguyen', required: true },
        { name: 'phone', label: 'Salon Phone', type: 'phone', placeholder: '(555) 333-4444', required: true },
        { name: 'address', label: 'Salon Address', type: 'text', placeholder: '300 Nail Ln, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your nail services.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Regular Manicure', 'Gel Manicure', 'Dip Powder', 'Acrylic', 'Classic Pedicure', 'Spa Pedicure', 'Nail Art', 'Nail Repair', 'Waxing', 'Eyelash Extensions'] },
        { name: 'reg_mani_price', label: 'Regular Manicure Price', type: 'currency', placeholder: '25', required: true },
        { name: 'gel_mani_price', label: 'Gel Manicure Price', type: 'currency', placeholder: '40', required: true },
        { name: 'pedi_price', label: 'Classic Pedicure Price', type: 'currency', placeholder: '35', required: true }
      ]},
      { step_number: 3, title: 'Schedule', description: 'When are you open?', fields: [
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 9:30am-7pm, Sun 11am-5pm', required: true },
        { name: 'spa_pedi_price', label: 'Spa Pedicure Price', type: 'currency', placeholder: '55', required: false },
        { name: 'nail_art_price', label: 'Nail Art Starting Price (per nail)', type: 'currency', placeholder: '5', required: false }
      ]},
      { step_number: 4, title: 'Final Details', description: "Almost there!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.polishednailbar.com', required: false },
        { name: 'instagram', label: 'Instagram', type: 'text', placeholder: '@polishednailbar', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Appointments", description: 'All booked appointments with technician and service.', priority: 1 },
      { id: 'walk-in-queue', title: 'Walk-In Queue', description: 'Current walk-in waitlist.', priority: 2 },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue from all services today.', priority: 3 },
      { id: 'rebooking', title: 'Rebooking Rate', description: 'Percentage of clients who rebook.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send appointment reminder', description: 'Text clients about tomorrow\'s appointments.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Send rebooking reminder', description: 'Text clients who haven\'t been in for 3+ weeks.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Post nail art to Instagram', description: 'Share photos of today\'s best nail designs.', category: 'marketing', difficulty: 'needs-approval' },
      { title: 'Request review after visit', description: 'Send review request day after appointment.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Station Utilization', unit: 'percentage', description: 'Percentage of station time booked.', target_suggestion: 75 },
      { name: 'Average Ticket', unit: 'dollars', description: 'Average spend per client visit.', target_suggestion: 52 },
      { name: 'Walk-In Conversion', unit: 'percentage', description: 'Walk-ins that become repeat clients.', target_suggestion: 40 },
      { name: 'No-Show Rate', unit: 'percentage', description: 'Booked appointments that no-show.', target_suggestion: 8 }
    ],
    suggested_integrations: [
      { name: 'Vagaro', slug: 'vagaro', category: 'booking', why: 'Nail salon scheduling and POS.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local nail salon search visibility.', priority: 'essential' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Showcase nail art and attract clients.', priority: 'recommended' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Fast payments and tip processing.', priority: 'recommended' }
    ],
    integration_priority: ['vagaro', 'google-business', 'instagram', 'square'],
    email_templates: [
      { name: 'Appointment Confirmation', subject: 'Your Nail Appointment at {{business_name}}', body: "Hi {{customer_name}},\n\nYou're booked!\n\nDate: {{date}}\nTime: {{time}}\nService: {{service}}\n\nAddress: {{address}}\n\nSee you soon!\n— {{business_name}}", trigger: 'appointment_booked' },
      { name: 'Rebooking Reminder', subject: 'Time for Fresh Nails! — {{business_name}}', body: "Hi {{customer_name}},\n\nIt's been {{weeks_since}} weeks — your nails are probably ready for some love!\n\nBook your next appointment: {{booking_link}}\n\n— {{business_name}}", trigger: 'no_rebook_3_weeks' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}! Your nail appointment at {{business_name}} is tomorrow at {{time}}. See you there!", trigger: 'appointment_reminder_24h' },
      { name: 'Rebooking', body: "Hi {{customer_name}}, time for fresh nails? Book at {{business_name}}: {{booking_link}} 💅", trigger: 'no_rebook_3_weeks' },
      { name: 'Review Request', body: "Thanks for visiting {{business_name}}, {{customer_name}}! Love your nails? A review means the world: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
    competitor_tools: ['Vagaro', 'Fresha', 'Booksy', 'GlossGenius']
  },

  // ─── 4. DAY SPA ───
  {
    id: 'day-spa',
    industry: 'Beauty & Personal Care',
    niche: 'Day Spa',
    display_name: 'Day Spa',
    emoji: '🧖',
    tagline: 'Your AI spa coordinator that books treatments, sells packages, and creates a seamless guest experience.',
    demo_greeting: "Hi there! I'm Mouse, your AI spa coordinator. I book treatments, sell spa packages, and make sure every guest has a relaxing experience from the moment they call. Want to see how I'd help someone plan a spa day?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a day spa. Help guests choose treatments, understand packages, and book their visit. Create a sense of calm and luxury in your communication. Be knowledgeable about massage types, facials, and body treatments.",
    demo_suggested_messages: ['I want to book a massage', "What's included in a spa day package?", 'I need a gift certificate for my wife', 'What facial do you recommend?'],
    soul_template: "You are Mouse, the AI coordinator for {{business_name}}. You help {{owner_name}} run their day spa by booking treatments, selling packages and gift certificates, managing therapist schedules, and ensuring a premium guest experience. You create calm and luxury in every interaction. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse. I'd love to help you book a treatment, learn about our packages, or answer any questions. How can I help you relax today?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a day spa. Book treatments, explain services and packages, sell gift certificates, and create a luxurious phone experience. Speak softly and warmly. Transfer to the spa director for medical-grade treatments, group bookings of 6+, or complaints.",
    receptionist_faqs: [
      { question: 'What massage types do you offer?', answer: "We offer Swedish (relaxation), Deep Tissue (muscle tension), Hot Stone (therapeutic heat), and {{specialty_massage}}. Sessions are available in 60 or 90 minutes.", category: 'services' },
      { question: "What's included in a spa day package?", answer: "Our signature spa day is {{spa_day_price}} and includes a 60-minute massage, facial, and access to our relaxation lounge. Upgrades are available too!", category: 'packages' },
      { question: 'Do you sell gift certificates?', answer: "Yes! Gift certificates are available in any amount or for specific services. We can email them instantly or mail a beautiful card.", category: 'gifts' },
      { question: 'What should I wear / bring?', answer: "Just bring yourself! We provide robes, slippers, and everything you need. Arrive 15 minutes early to settle in and enjoy our relaxation area.", category: 'general' },
      { question: 'How much is a facial?', answer: "Our classic facial is {{facial_price}} (60 min). We also offer {{specialty_facial}} starting at {{specialty_facial_price}}.", category: 'pricing' }
    ],
    receptionist_transfer_triggers: ['group booking of 6+ people', 'medical-grade treatment consultation', 'complaint about a treatment', 'bridal spa party planning', 'corporate event inquiry'],
    wizard_steps: [
      { step_number: 1, title: 'Your Spa', description: "Let's set up your day spa.", fields: [
        { name: 'business_name', label: 'Spa Name', type: 'text', placeholder: 'Tranquil Day Spa', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Sarah Mitchell', required: true },
        { name: 'phone', label: 'Spa Phone', type: 'phone', placeholder: '(555) 444-5555', required: true },
        { name: 'address', label: 'Spa Address', type: 'text', placeholder: '400 Serenity Way, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'Your treatment menu.', fields: [
        { name: 'services', label: 'Services Offered', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Swedish Massage', 'Deep Tissue', 'Hot Stone', 'Couples Massage', 'Classic Facial', 'Anti-Aging Facial', 'Body Wrap', 'Body Scrub', 'Manicure', 'Pedicure', 'Waxing', 'Aromatherapy'] },
        { name: 'massage_60_price', label: '60-Min Massage Starting Price', type: 'currency', placeholder: '95', required: true },
        { name: 'facial_price', label: 'Classic Facial Price', type: 'currency', placeholder: '85', required: true },
        { name: 'spa_day_price', label: 'Spa Day Package Price', type: 'currency', placeholder: '225', required: false }
      ]},
      { step_number: 3, title: 'Details', description: 'A few more things.', fields: [
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 9am-8pm, Sun 10am-6pm', required: true },
        { name: 'specialty_massage', label: 'Specialty Massage (if any)', type: 'text', placeholder: 'Prenatal, Thai, Sports...', required: false },
        { name: 'specialty_facial', label: 'Specialty Facial (if any)', type: 'text', placeholder: 'Microdermabrasion, LED, Chemical Peel...', required: false }
      ]},
      { step_number: 4, title: 'Launch', description: "You're ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.tranquildayspa.com', required: false },
        { name: 'specialty_facial_price', label: 'Specialty Facial Starting Price', type: 'currency', placeholder: '120', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-schedule', title: "Today's Schedule", description: 'All booked treatments by therapist and room.', priority: 1 },
      { id: 'gift-cert-sales', title: 'Gift Certificate Sales', description: 'Gift certificates sold this month.', priority: 2 },
      { id: 'package-sales', title: 'Package Sales', description: 'Spa packages and memberships sold.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue by service category.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send appointment reminder', description: 'Text guests about upcoming treatments.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Sell gift certificates for holidays', description: 'Email past guests about gift certificates before major holidays.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Follow up after first visit', description: 'Send thank-you and rebooking offer to first-time guests.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Promote seasonal treatment', description: 'Announce new seasonal treatment to mailing list.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Treatment Room Utilization', unit: 'percentage', description: 'Percentage of room hours booked.', target_suggestion: 75 },
      { name: 'Average Guest Spend', unit: 'dollars', description: 'Average revenue per guest visit.', target_suggestion: 140 },
      { name: 'Gift Certificate Revenue', unit: 'dollars', description: 'Monthly gift certificate sales.', target_suggestion: 3000 },
      { name: 'Guest Return Rate', unit: 'percentage', description: 'Guests who return within 90 days.', target_suggestion: 45 }
    ],
    suggested_integrations: [
      { name: 'Mangomint', slug: 'mangomint', category: 'booking', why: 'Premium spa management and booking.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local spa search visibility.', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Gift certificate and package sales online.', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Seasonal promotions and gift certificate campaigns.', priority: 'recommended' }
    ],
    integration_priority: ['mangomint', 'google-business', 'stripe', 'mailchimp'],
    email_templates: [
      { name: 'Booking Confirmation', subject: 'Your Spa Appointment — {{business_name}}', body: "Dear {{customer_name}},\n\nWe look forward to welcoming you:\n\nDate: {{date}}\nTime: {{time}}\nTreatment: {{service}}\nTherapist: {{therapist_name}}\n\nPlease arrive 15 minutes early to enjoy our relaxation lounge. Wear comfortable clothing — we provide everything else.\n\nAddress: {{address}}\n\nSee you soon,\n{{business_name}}", trigger: 'appointment_booked' },
      { name: 'Gift Certificate', subject: 'A Gift of Relaxation from {{sender_name}} — {{business_name}}', body: "Dear {{recipient_name}},\n\nSomeone special ({{sender_name}}) has given you the gift of relaxation!\n\nGift Certificate: {{gift_amount}}\nCode: {{gift_code}}\n\nBook your treatment: {{booking_link}}\n\nWe can't wait to pamper you.\n— {{business_name}}", trigger: 'gift_certificate_purchased' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: your {{service}} at {{business_name}} is tomorrow at {{time}}. Please arrive 15 min early. See you then!", trigger: 'appointment_reminder_24h' },
      { name: 'First Visit Follow-Up', body: "Thank you for visiting {{business_name}}, {{customer_name}}! We hope you left feeling amazing. Book your next treatment and enjoy {{return_offer}}: {{booking_link}}", trigger: 'first_visit_followup' },
      { name: 'Holiday Gift Promo', body: "Give the gift of relaxation! {{business_name}} gift certificates — instant delivery by email or a beautiful card by mail. Shop: {{gift_link}}", trigger: 'holiday_gift_promo' }
    ],
    estimated_hours_saved_weekly: 14,
    estimated_monthly_value: 3200,
    ideal_plan: 'growth',
    competitor_tools: ['Mangomint', 'Booker by Mindbody', 'Zenoti', 'Vagaro']
  },

  // ─── 5. MED SPA ───
  {
    id: 'med-spa',
    industry: 'Beauty & Personal Care',
    niche: 'Med Spa',
    display_name: 'Med Spa',
    emoji: '💉',
    tagline: 'Your AI patient coordinator that books consultations, follows up on treatments, and grows your practice.',
    demo_greeting: "Hi! I'm Mouse, your AI patient coordinator. I book consultations, follow up on treatment plans, and help grow your med spa practice. Want to see how I'd handle a patient asking about Botox for the first time?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a med spa. Help patients understand treatments like Botox, fillers, laser treatments, and body contouring. Be professional but warm. Never diagnose or prescribe — always recommend a consultation for personalized treatment plans. Be sensitive to aesthetic concerns.",
    demo_suggested_messages: ['How much is Botox?', 'I want to get rid of fine lines', 'What laser treatments do you offer?', 'Is there any downtime?'],
    soul_template: "You are Mouse, the AI patient coordinator for {{business_name}}. You help {{owner_name}} run their med spa by booking consultations, following up on treatment plans, explaining procedures, and converting inquiries to booked appointments. You're professional, warm, and discreet. You never diagnose or prescribe. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse. I can help you learn about our treatments, book a consultation, or check on your appointment. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a med spa. Help patients understand treatments, book consultations, and answer general questions about procedures. Be professional and discreet. Never give medical advice or promise specific results. Transfer to the medical director for adverse reactions, medical questions, or treatment modifications.",
    receptionist_faqs: [
      { question: 'How much is Botox?', answer: "Botox is {{botox_price}} per unit. Most people need 20-40 units for common areas like forehead and crow's feet. We can give you an exact quote at your free consultation.", category: 'pricing' },
      { question: 'How much are fillers?', answer: "Dermal fillers start at {{filler_price}} per syringe. The number of syringes depends on your goals. We'll create a custom treatment plan at your consultation.", category: 'pricing' },
      { question: 'Is there downtime?', answer: "It varies by treatment. Botox and fillers have minimal downtime — maybe slight swelling for a day. Laser treatments can range from no downtime to a few days. We'll explain everything during your consultation.", category: 'general' },
      { question: 'Do you offer financing?', answer: "Yes! We partner with {{financing_partner}} for interest-free payment plans. We also offer package discounts when you bundle treatments.", category: 'billing' },
      { question: 'Do I need a consultation first?', answer: "Yes — all new patients start with a complimentary consultation. Our medical team will assess your goals and create a personalized plan. It takes about 30 minutes.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['reporting an adverse reaction', 'medical question about a procedure', 'wants to modify a current treatment plan', 'complaint about results', 'asking for medical director specifically'],
    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: "Let's set up your med spa.", fields: [
        { name: 'business_name', label: 'Practice Name', type: 'text', placeholder: 'Glow Med Spa', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Dr. Jennifer Lee', required: true },
        { name: 'phone', label: 'Practice Phone', type: 'phone', placeholder: '(555) 555-6666', required: true },
        { name: 'address', label: 'Practice Address', type: 'text', placeholder: '500 Beauty Blvd, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Treatments', description: 'What treatments do you offer?', fields: [
        { name: 'services', label: 'Treatments Offered', type: 'multiselect', placeholder: 'Select treatments', required: true, options: ['Botox', 'Dermal Fillers', 'Chemical Peels', 'Microneedling', 'Laser Hair Removal', 'IPL/Photofacial', 'CoolSculpting', 'PRP/Vampire Facial', 'Skin Tightening', 'IV Therapy', 'Kybella', 'Semaglutide/Weight Loss'] },
        { name: 'botox_price', label: 'Botox Per Unit Price', type: 'currency', placeholder: '12', required: true },
        { name: 'filler_price', label: 'Filler Per Syringe Starting Price', type: 'currency', placeholder: '650', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 9am-6pm, Sat 9am-3pm', required: true }
      ]},
      { step_number: 3, title: 'Patient Experience', description: 'How you serve patients.', fields: [
        { name: 'consultation_type', label: 'Consultation Approach', type: 'select', placeholder: 'Select', required: true, options: ['Free in-person', 'Free virtual', 'Both in-person and virtual', 'Paid consultation ($50-100)'] },
        { name: 'financing_partner', label: 'Financing Partner', type: 'text', placeholder: 'CareCredit, Cherry, PatientFi', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "You're ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.glowmedspa.com', required: false },
        { name: 'instagram', label: 'Instagram', type: 'text', placeholder: '@glowmedspa', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-schedule', title: "Today's Schedule", description: 'All consultations and treatments today.', priority: 1 },
      { id: 'pending-consultations', title: 'Pending Consultations', description: 'Inquiries that need consultation scheduling.', priority: 2 },
      { id: 'treatment-followups', title: 'Treatment Follow-Ups', description: 'Patients due for follow-up or next treatment.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue by treatment type.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up after Botox treatment', description: 'Check in with patient 2 weeks after Botox to assess results.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Send consultation reminder', description: 'Text patients about upcoming consultation.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Promote seasonal special', description: 'Email list about seasonal treatment promotions.', category: 'marketing', difficulty: 'needs-approval' },
      { title: 'Convert consultation to booking', description: 'Follow up with patients who had consultations but haven\'t booked.', category: 'sales', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Consultation-to-Treatment Rate', unit: 'percentage', description: 'Consultations that convert to booked treatments.', target_suggestion: 65 },
      { name: 'Average Treatment Value', unit: 'dollars', description: 'Average revenue per patient treatment.', target_suggestion: 450 },
      { name: 'Patient Retention Rate', unit: 'percentage', description: 'Patients who return for additional treatments.', target_suggestion: 55 },
      { name: 'Monthly New Patients', unit: 'count', description: 'New patients per month.', target_suggestion: 30 }
    ],
    suggested_integrations: [
      { name: 'Aesthetic Record', slug: 'aesthetic-record', category: 'emr', why: 'HIPAA-compliant patient records and photos.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local med spa search visibility.', priority: 'essential' },
      { name: 'CareCredit', slug: 'carecredit', category: 'financing', why: 'Patient financing for treatments.', priority: 'recommended' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Before/after photos and treatment showcases.', priority: 'recommended' }
    ],
    integration_priority: ['aesthetic-record', 'google-business', 'carecredit', 'instagram'],
    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Consultation at {{business_name}}', body: "Dear {{customer_name}},\n\nYour consultation is confirmed:\n\nDate: {{date}}\nTime: {{time}}\nType: {{consultation_type}}\n\nPlease arrive 10 minutes early to complete your intake form. Bring a list of any medications and your aesthetic goals — we want to make the most of your time.\n\nAddress: {{address}}\n\nWe look forward to meeting you,\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Post-Treatment Follow-Up', subject: 'How Are You Feeling? — {{business_name}}', body: "Hi {{customer_name}},\n\nIt's been {{days_since}} days since your {{treatment_name}} treatment. We wanted to check in!\n\nAre you happy with your results so far? Remember, {{treatment_name}} can take {{full_effect_timeline}} to show full results.\n\nQuestions or concerns? Reply here or call {{phone}}.\n\n— {{business_name}}", trigger: 'post_treatment_followup' }
    ],
    sms_templates: [
      { name: 'Consultation Reminder', body: "Hi {{customer_name}}, reminder: your consultation at {{business_name}} is tomorrow at {{time}}. Please arrive 10 min early. See you then!", trigger: 'consultation_reminder_24h' },
      { name: 'Botox Reminder', body: "Hi {{customer_name}}, it's been about 3 months since your last Botox at {{business_name}}. Time for a touch-up? Book: {{booking_link}}", trigger: 'botox_due_90_days' },
      { name: 'Review Request', body: "Thank you for choosing {{business_name}}, {{customer_name}}! If you're loving your results, a review would mean so much: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 16,
    estimated_monthly_value: 4500,
    ideal_plan: 'growth',
    competitor_tools: ['Aesthetic Record', 'PatientNow', 'Zenoti', 'Boulevard']
  },

  // ─── 6. WAXING STUDIO ───
  {
    id: 'waxing-studio',
    industry: 'Beauty & Personal Care',
    niche: 'Waxing Studio',
    display_name: 'Waxing Studio',
    emoji: '🍯',
    tagline: 'Your AI studio assistant that books waxing appointments, sends growth-cycle reminders, and reduces no-shows.',
    demo_greeting: "Hi! I'm Mouse, your AI waxing studio assistant. I book appointments, send timely reminders based on hair growth cycles, and keep your schedule full. Want to see how I'd help a first-time client?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a waxing studio. Help clients book services, understand what to expect (especially first-timers), and answer questions about waxing. Be warm, matter-of-fact, and put nervous first-timers at ease.",
    demo_suggested_messages: ["I've never been waxed before — what should I expect?", 'How much for a Brazilian?', 'How often should I come in?', 'Do you use hard wax or soft wax?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} run their waxing studio by booking appointments, sending growth-cycle reminders, putting first-timers at ease, and keeping the schedule full. You're warm, body-positive, and matter-of-fact about waxing. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! I can help you book a waxing appointment or answer any questions. What can I do for you?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a waxing studio. Book appointments, explain services, put first-time clients at ease, and answer pricing questions. Be warm and body-positive. Transfer to the studio manager for complaints, adverse reactions, or group bookings.",
    receptionist_faqs: [
      { question: 'How much for a Brazilian?', answer: "A Brazilian wax is {{brazilian_price}}. First-time clients should allow about 30 minutes. Returning clients are usually done in 15-20.", category: 'pricing' },
      { question: "What should I expect for my first wax?", answer: "It's totally normal to be nervous! Let your hair grow about 2 weeks since your last shave. Our waxers are pros — they'll make you comfortable and work quickly. It gets easier every time!", category: 'general' },
      { question: 'How often should I come in?', answer: "Every 4-6 weeks is ideal. We'll send you a reminder when it's time. Keeping a regular schedule makes each visit easier.", category: 'services' },
      { question: 'Do you use hard wax or soft wax?', answer: "{{wax_type_answer}} We choose the best wax for each body area to minimize discomfort and get the best results.", category: 'services' },
      { question: 'What areas do you wax?', answer: "We wax everything! Face (brows, lip, chin), body (arms, legs, back, chest), and bikini area (bikini line, Brazilian, full). Check our full menu for pricing.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['adverse skin reaction', 'complaint about service', 'requesting a specific esthetician', 'group booking for 4+', 'burn or injury concern'],
    wizard_steps: [
      { step_number: 1, title: 'Your Studio', description: "Let's set up your waxing studio.", fields: [
        { name: 'business_name', label: 'Studio Name', type: 'text', placeholder: 'Bare Waxing Studio', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Ashley Brooks', required: true },
        { name: 'phone', label: 'Studio Phone', type: 'phone', placeholder: '(555) 666-7777', required: true },
        { name: 'address', label: 'Studio Address', type: 'text', placeholder: '600 Smooth St, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your waxing menu.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Eyebrow Wax', 'Lip Wax', 'Full Face', 'Underarm', 'Full Arm', 'Half Leg', 'Full Leg', 'Bikini Line', 'Brazilian', 'Back', 'Chest', 'Full Body'] },
        { name: 'brazilian_price', label: 'Brazilian Wax Price', type: 'currency', placeholder: '55', required: true },
        { name: 'brow_price', label: 'Eyebrow Wax Price', type: 'currency', placeholder: '18', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 9am-7pm', required: true }
      ]},
      { step_number: 3, title: 'Your Approach', description: 'A little about how you work.', fields: [
        { name: 'wax_type', label: 'Primary Wax Type', type: 'select', placeholder: 'Select', required: true, options: ['Hard wax only', 'Soft wax only', 'Both (area-dependent)'] },
        { name: 'cancellation_notice', label: 'Cancellation Notice', type: 'select', placeholder: 'Select', required: true, options: ['24 hours', '12 hours', '4 hours'] }
      ]},
      { step_number: 4, title: 'Go Live', description: "You're ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.barewaxingstudio.com', required: false },
        { name: 'instagram', label: 'Instagram', type: 'text', placeholder: '@barewaxing', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Appointments", description: 'All waxing appointments for today.', priority: 1 },
      { id: 'growth-cycle-reminders', title: 'Growth Cycle Reminders', description: 'Clients due for their next wax this week.', priority: 2 },
      { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue from all services today.', priority: 3 },
      { id: 'no-show-rate', title: 'No-Show Rate', description: 'Current no-show percentage.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send growth-cycle reminder', description: 'Text clients when they\'re due for their next wax (4-6 weeks).', category: 'marketing', difficulty: 'automatic' },
      { title: 'First-time client prep text', description: 'Send prep instructions to first-time clients before their appointment.', category: 'operations', difficulty: 'automatic' },
      { title: 'Appointment reminder', description: 'Remind clients 24 hours before their wax.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Request review', description: 'Ask for a review after appointment.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Appointments Per Day', unit: 'count', description: 'Total waxing appointments per day.', target_suggestion: 15 },
      { name: 'Average Ticket', unit: 'dollars', description: 'Average spend per client visit.', target_suggestion: 55 },
      { name: 'Client Return Rate', unit: 'percentage', description: 'Clients who return within 6 weeks.', target_suggestion: 70 },
      { name: 'No-Show Rate', unit: 'percentage', description: 'Percentage of booked appointments that no-show.', target_suggestion: 5 }
    ],
    suggested_integrations: [
      { name: 'Fresha', slug: 'fresha', category: 'booking', why: 'Free booking software for beauty businesses.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local waxing studio search visibility.', priority: 'essential' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Fast payments and tip processing.', priority: 'recommended' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Attract new clients and showcase results.', priority: 'nice-to-have' }
    ],
    integration_priority: ['fresha', 'google-business', 'square', 'instagram'],
    email_templates: [
      { name: 'First-Time Prep Guide', subject: 'Your First Wax at {{business_name}} — What to Know', body: "Hi {{customer_name}},\n\nWe're excited to see you for your first waxing appointment! Here's what to know:\n\n• Let hair grow about 2 weeks since your last shave\n• Gently exfoliate the area the day before\n• Avoid caffeine right before (it can increase sensitivity)\n• Wear comfortable, loose-fitting clothing\n\nYour appointment: {{date}} at {{time}}\n\nYou're in great hands — our team does this all day, every day!\n\n— {{business_name}}", trigger: 'first_time_client_booked' },
      { name: 'Growth Cycle Reminder', subject: "Time for Your Next Wax — {{business_name}}", body: "Hi {{customer_name}},\n\nIt's been about {{weeks_since}} weeks since your last visit. Your hair should be at the perfect length for your next wax!\n\nBook now: {{booking_link}}\n\nKeeping a regular schedule makes each visit faster and more comfortable.\n\n— {{business_name}}", trigger: 'growth_cycle_due' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: your waxing appointment at {{business_name}} is tomorrow at {{time}}. See you then!", trigger: 'appointment_reminder_24h' },
      { name: 'Growth Cycle Reminder', body: "Hi {{customer_name}}, it's been {{weeks_since}} weeks — time for your next wax at {{business_name}}! Book: {{booking_link}}", trigger: 'growth_cycle_due' },
      { name: 'First Visit Prep', body: "Hi {{customer_name}}! For your first wax at {{business_name}} tomorrow: let hair grow ~2 weeks, exfoliate gently today, wear comfy clothes. You'll do great! See you at {{time}}.", trigger: 'first_time_reminder' }
    ],
    estimated_hours_saved_weekly: 8,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
    competitor_tools: ['Fresha', 'Vagaro', 'Booksy', 'GlossGenius']
  },

  // ─── 7. LASH & BROW STUDIO ───
  {
    id: 'lash-brow-studio',
    industry: 'Beauty & Personal Care',
    niche: 'Lash & Brow Studio',
    display_name: 'Lash & Brow Studio',
    emoji: '👁️',
    tagline: 'Your AI studio assistant that books lash and brow appointments, sends fill reminders, and grows your client list.',
    demo_greeting: "Hi! I'm Mouse, your AI lash and brow assistant. I book appointments, send fill reminders at the perfect time, and keep your schedule packed. Want to see how I'd help someone choose between classic and volume lashes?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a lash and brow studio. Help clients choose lash styles, book appointments, and understand maintenance. Be knowledgeable about the difference between classic, hybrid, and volume lashes, and various brow services.",
    demo_suggested_messages: ["What's the difference between classic and volume?", 'How much are lash extensions?', 'I want to try microblading', 'How often do I need fills?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} run their lash and brow studio by booking appointments, sending fill reminders, helping clients choose the right style, and keeping the schedule full. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! I can help you book a lash or brow appointment, learn about our services, or answer questions. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a lash and brow studio. Book appointments, explain lash types and brow services, and provide pricing. Transfer to the owner for complaints, allergic reactions, or microblading consultations.",
    receptionist_faqs: [
      { question: "What's the difference between classic and volume?", answer: "Classic lashes are one extension per natural lash — a natural, elegant look. Volume uses ultra-light fans of 2-6 lashes per natural lash for a fuller, more dramatic look. Hybrid is a mix of both!", category: 'services' },
      { question: 'How much are lash extensions?', answer: "Full sets start at {{classic_price}} for classic and {{volume_price}} for volume. Fills are {{fill_price}} (recommended every 2-3 weeks).", category: 'pricing' },
      { question: 'How often do I need fills?', answer: "Every 2-3 weeks to keep them looking full. We'll send you a reminder when it's time!", category: 'services' },
      { question: 'How much is microblading?', answer: "Microblading is {{microblading_price}}, which includes the initial session and a touch-up 6-8 weeks later. Results last 1-2 years.", category: 'pricing' },
      { question: 'Will lash extensions damage my natural lashes?', answer: "Not when applied properly! Our artists are certified and use appropriate weight for your natural lashes. We prioritize lash health.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['allergic reaction to adhesive', 'complaint about lash application', 'microblading consultation needed', 'wants a specific artist', 'group booking for bridal party'],
    wizard_steps: [
      { step_number: 1, title: 'Your Studio', description: "Let's set up your studio.", fields: [
        { name: 'business_name', label: 'Studio Name', type: 'text', placeholder: 'Flutter Lash Studio', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Mia Chen', required: true },
        { name: 'phone', label: 'Studio Phone', type: 'phone', placeholder: '(555) 777-8888', required: true },
        { name: 'address', label: 'Studio Address', type: 'text', placeholder: '700 Lash Lane, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your service menu.', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Classic Lash Extensions', 'Volume Lash Extensions', 'Hybrid Lash Extensions', 'Lash Lift & Tint', 'Lash Fills', 'Brow Wax', 'Brow Tint', 'Brow Lamination', 'Microblading', 'Ombre Brows'] },
        { name: 'classic_price', label: 'Classic Full Set Price', type: 'currency', placeholder: '150', required: true },
        { name: 'volume_price', label: 'Volume Full Set Price', type: 'currency', placeholder: '200', required: true },
        { name: 'fill_price', label: 'Fill Price (2-3 week)', type: 'currency', placeholder: '65', required: true }
      ]},
      { step_number: 3, title: 'Schedule', description: 'When are you open?', fields: [
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 9am-7pm', required: true },
        { name: 'microblading_price', label: 'Microblading Price', type: 'currency', placeholder: '450', required: false },
        { name: 'cancellation_notice', label: 'Cancellation Notice', type: 'select', placeholder: 'Select', required: true, options: ['24 hours', '48 hours'] }
      ]},
      { step_number: 4, title: 'Launch', description: "Let's go!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.flutterlash.com', required: false },
        { name: 'instagram', label: 'Instagram', type: 'text', placeholder: '@flutterlash', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Appointments", description: 'All booked lash and brow appointments.', priority: 1 },
      { id: 'fill-reminders', title: 'Fill Reminders Due', description: 'Clients due for a fill this week.', priority: 2 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue by service type.', priority: 3 },
      { id: 'new-clients', title: 'New Clients This Month', description: 'First-time clients booked this month.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send fill reminder', description: 'Text clients 2 weeks after their last full set or fill.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Send aftercare instructions', description: 'Text new clients lash care tips after their first set.', category: 'operations', difficulty: 'automatic' },
      { title: 'Appointment reminder', description: 'Remind clients 24 hours before.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Request review', description: 'Send review link after appointment.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Client Retention Rate', unit: 'percentage', description: 'Clients who return for regular fills.', target_suggestion: 65 },
      { name: 'Average Ticket', unit: 'dollars', description: 'Average revenue per appointment.', target_suggestion: 85 },
      { name: 'Appointments Per Day', unit: 'count', description: 'Total appointments completed per day.', target_suggestion: 8 },
      { name: 'No-Show Rate', unit: 'percentage', description: 'Booked appointments that no-show.', target_suggestion: 5 }
    ],
    suggested_integrations: [
      { name: 'GlossGenius', slug: 'glossgenius', category: 'booking', why: 'Beautiful booking for beauty professionals.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local search visibility.', priority: 'essential' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Showcase lash work and attract clients.', priority: 'recommended' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Process payments and sell gift cards.', priority: 'recommended' }
    ],
    integration_priority: ['glossgenius', 'google-business', 'instagram', 'square'],
    email_templates: [
      { name: 'Aftercare Guide', subject: 'Your Lash Aftercare Guide — {{business_name}}', body: "Hi {{customer_name}},\n\nCongrats on your new lashes! Here's how to keep them looking amazing:\n\n• Avoid water for 24 hours\n• Don't use oil-based products near your eyes\n• Brush gently with your spoolie daily\n• Sleep on your back or side when possible\n• Come in for a fill every 2-3 weeks\n\nWe'll remind you when it's time for your fill!\n\n— {{business_name}}", trigger: 'first_set_completed' },
      { name: 'Fill Reminder', subject: 'Time for a Lash Fill! — {{business_name}}', body: "Hi {{customer_name}},\n\nIt's been about {{weeks_since}} weeks since your last appointment. Your lashes are probably ready for a fill!\n\nBook now: {{booking_link}}\n\nRegular fills keep your lashes looking full and gorgeous.\n\n— {{business_name}}", trigger: 'fill_due' }
    ],
    sms_templates: [
      { name: 'Fill Reminder', body: "Hi {{customer_name}}, it's been {{weeks_since}} weeks — time for a lash fill at {{business_name}}! Book: {{booking_link}}", trigger: 'fill_due' },
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: your lash appointment at {{business_name}} is tomorrow at {{time}}. Come with clean, makeup-free lashes!", trigger: 'appointment_reminder_24h' },
      { name: 'Review Request', body: "Loving your new lashes from {{business_name}}? A quick review means the world: {{review_link}} Thank you, {{customer_name}}!", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 8,
    estimated_monthly_value: 2000,
    ideal_plan: 'pro',
    competitor_tools: ['GlossGenius', 'Vagaro', 'Booksy', 'Fresha']
  },

  // ─── 8. TANNING SALON ───
  {
    id: 'tanning-salon',
    industry: 'Beauty & Personal Care',
    niche: 'Tanning Salon',
    display_name: 'Tanning Salon',
    emoji: '☀️',
    tagline: 'Your AI tanning assistant that sells memberships, manages sessions, and keeps your beds full.',
    demo_greeting: "Hey! I'm Mouse, your AI tanning salon assistant. I sell memberships, manage tanning sessions, and help clients pick the right package. Want to see how I'd help a first-time tanner?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a tanning salon. Help clients choose between UV tanning and spray tans, understand membership options, and book sessions. Be knowledgeable about tanning safety and skin types.",
    demo_suggested_messages: ["I've never tanned before — where do I start?", 'How much are your memberships?', 'Do you do spray tans?', "What's the difference between your bed levels?"],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} run their tanning salon by selling memberships, booking sessions, educating clients about tanning safety, and keeping the beds busy. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! I can help you book a tanning session, learn about memberships, or answer questions. What can I do for you?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a tanning salon. Sell memberships, book sessions, explain bed levels, and provide spray tan info. Always mention skin type assessment for first-timers. Transfer to manager for complaints, skin reaction concerns, or membership cancellations.",
    receptionist_faqs: [
      { question: 'How much are your memberships?', answer: "Our unlimited tanning memberships start at {{basic_membership}} for basic beds and {{premium_membership}} for premium beds. Single sessions are also available!", category: 'pricing' },
      { question: "What's the difference between bed levels?", answer: "Our Level 1 beds are standard UV. Level 2 has stronger lamps for faster results. Level 3 is our premium bed with facial tanners and cooling. Higher levels mean less time needed per session.", category: 'services' },
      { question: 'Do you do spray tans?', answer: "Yes! Custom spray tans are {{spray_tan_price}}. We use {{spray_brand}} for a natural, streak-free finish. Great for events or if you prefer UV-free!", category: 'services' },
      { question: 'How long should my first session be?', answer: "For first-timers, we start with a shorter session (usually 5-8 minutes) based on your skin type. We'll do a quick skin type assessment to find the perfect starting time for you.", category: 'general' },
      { question: 'Do I need to bring anything?', answer: "Just yourself! We provide protective eyewear (required), towels, and after-tan lotion samples. You can also purchase premium lotions at the front desk.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['skin reaction or burn concern', 'membership cancellation', 'complaint about bed cleanliness', 'under 18 without parental consent', 'equipment malfunction'],
    wizard_steps: [
      { step_number: 1, title: 'Your Salon', description: "Let's set up your tanning salon.", fields: [
        { name: 'business_name', label: 'Salon Name', type: 'text', placeholder: 'Sun Kissed Tanning', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Brittany Adams', required: true },
        { name: 'phone', label: 'Salon Phone', type: 'phone', placeholder: '(555) 888-9999', required: true },
        { name: 'address', label: 'Salon Address', type: 'text', placeholder: '800 Sunset Dr, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services', description: 'What do you offer?', fields: [
        { name: 'services', label: 'Services', type: 'multiselect', placeholder: 'Select services', required: true, options: ['Level 1 UV Beds', 'Level 2 UV Beds', 'Level 3 Premium Beds', 'Stand-Up Booth', 'Spray Tan', 'Red Light Therapy', 'Tanning Lotions'] },
        { name: 'basic_membership', label: 'Basic Membership Monthly Price', type: 'currency', placeholder: '29.99', required: true },
        { name: 'premium_membership', label: 'Premium Membership Monthly Price', type: 'currency', placeholder: '49.99', required: true },
        { name: 'spray_tan_price', label: 'Spray Tan Price', type: 'currency', placeholder: '35', required: false }
      ]},
      { step_number: 3, title: 'Hours', description: 'When are you open?', fields: [
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Fri 7am-9pm, Sat-Sun 9am-6pm', required: true },
        { name: 'spray_brand', label: 'Spray Tan Brand', type: 'text', placeholder: 'Norvell, VersaSpa, etc.', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "You're ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.sunkissedtanning.com', required: false },
        { name: 'min_age', label: 'Minimum Tanning Age', type: 'number', placeholder: '16', required: true, help_text: 'With parental consent if under 18' }
      ]}
    ],
    dashboard_widgets: [
      { id: 'bed-status', title: 'Bed Availability', description: 'Real-time status of all tanning beds.', priority: 1 },
      { id: 'membership-stats', title: 'Membership Stats', description: 'Active members, new sign-ups, churn.', priority: 2 },
      { id: 'daily-sessions', title: "Today's Sessions", description: 'Total tanning sessions today.', priority: 3 },
      { id: 'lotion-sales', title: 'Lotion & Product Sales', description: 'Product sales this week.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send membership renewal reminder', description: 'Alert members before their billing date.', category: 'billing', difficulty: 'automatic' },
      { title: 'Win back lapsed members', description: 'Send a special offer to cancelled members after 60 days.', category: 'marketing', difficulty: 'needs-approval' },
      { title: 'Promote spray tan for prom/events', description: 'Send seasonal spray tan promotions.', category: 'marketing', difficulty: 'automatic' },
      { title: 'New member welcome', description: 'Send welcome email with tanning tips to new members.', category: 'operations', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Active Memberships', unit: 'count', description: 'Total active tanning members.', target_suggestion: 200 },
      { name: 'Daily Sessions', unit: 'count', description: 'Average tanning sessions per day.', target_suggestion: 40 },
      { name: 'Membership Churn', unit: 'percentage', description: 'Monthly membership cancellation rate.', target_suggestion: 8 },
      { name: 'Product Revenue', unit: 'dollars', description: 'Monthly lotion and product sales.', target_suggestion: 2000 }
    ],
    suggested_integrations: [
      { name: 'SunLync', slug: 'sunlync', category: 'pos', why: 'Tanning salon POS and bed management.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local tanning salon search visibility.', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Membership billing and product sales.', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Seasonal promotions and member updates.', priority: 'nice-to-have' }
    ],
    integration_priority: ['sunlync', 'google-business', 'stripe', 'mailchimp'],
    email_templates: [
      { name: 'New Member Welcome', subject: 'Welcome to {{business_name}}!', body: "Hi {{customer_name}},\n\nWelcome to the {{business_name}} family! Your unlimited tanning membership is active.\n\nPlan: {{plan_name}} — {{membership_price}}/month\n\nTanning tips for best results:\n• Start slow and build your base tan\n• Always wear protective eyewear\n• Use quality tanning lotion for better results and skin health\n• Wait 24-48 hours between sessions\n\nSee you at the salon!\n— {{business_name}}", trigger: 'membership_created' },
      { name: 'Spray Tan Prep', subject: 'Spray Tan Prep — {{business_name}}', body: "Hi {{customer_name}},\n\nYour spray tan is tomorrow! Here's how to prep:\n\n• Exfoliate and shave the night before\n• No lotions, deodorant, or perfume on the day\n• Wear dark, loose-fitting clothes\n• Avoid water for 8 hours after\n\nSee you at {{time}}!\n— {{business_name}}", trigger: 'spray_tan_reminder' }
    ],
    sms_templates: [
      { name: 'Session Reminder', body: "Hi {{customer_name}}, don't forget your tanning session at {{business_name}} today! We're open until {{closing_time}}. See you!", trigger: 'session_reminder' },
      { name: 'Membership Renewal', body: "Hi {{customer_name}}, your {{business_name}} tanning membership renews on {{renewal_date}}. No action needed — just keep glowing!", trigger: 'renewal_reminder' },
      { name: 'Win-Back', body: "We miss you at {{business_name}}, {{customer_name}}! Come back and get your first month for just {{promo_price}}. Reply YES to reactivate!", trigger: 'winback_60_days' }
    ],
    estimated_hours_saved_weekly: 8,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
    competitor_tools: ['SunLync', 'TanTrack', 'SalonBiz']
  },

  // ─── 9. TATTOO STUDIO ───
  {
    id: 'tattoo-studio',
    industry: 'Beauty & Personal Care',
    niche: 'Tattoo Studio',
    display_name: 'Tattoo Studio',
    emoji: '🎨',
    tagline: 'Your AI studio manager that books consultations, manages the waitlist, and handles walk-in inquiries.',
    demo_greeting: "Hey! I'm Mouse, your AI tattoo studio manager. I handle consultation bookings, manage the artist waitlist, and answer questions from potential clients. Want to see how I'd handle someone asking about their first tattoo?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a tattoo studio. Help clients with consultation bookings, pricing expectations, and general tattoo questions. Be cool, artistic, and reassuring — especially for first-timers. Never quote exact prices without a consultation since every tattoo is custom.",
    demo_suggested_messages: ['I want to get my first tattoo', 'How much does a tattoo cost?', 'How do I book with a specific artist?', 'What should I know before my appointment?'],
    soul_template: "You are Mouse, the AI studio manager for {{business_name}}. You help {{owner_name}} run their tattoo studio by booking consultations, managing the artist waitlist, answering inquiries, and handling aftercare follow-ups. You respect the art and the process. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Hey, thanks for calling {{business_name}}, this is Mouse! I can help you book a consultation, check artist availability, or answer questions. What's up?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a tattoo studio. Help with consultation booking, general pricing guidance, artist availability, and walk-in inquiries. Never give exact pricing — always say it depends on the design and recommend a consultation. Transfer to an artist for design discussions or to the owner for complaints.",
    receptionist_faqs: [
      { question: 'How much does a tattoo cost?', answer: "Every tattoo is custom, so pricing depends on size, detail, placement, and time. Our minimum is {{minimum_price}}. The best way to get an accurate quote is a free consultation where the artist can see your idea.", category: 'pricing' },
      { question: 'How do I book with a specific artist?', answer: "Each of our artists has their own style and availability. Tell me what style you're looking for and I'll match you with the right artist, or if you have someone in mind, I'll check their availability.", category: 'booking' },
      { question: 'Do you do walk-ins?', answer: "{{walkin_answer}} For larger pieces, we recommend booking a consultation first so your artist can prepare a custom design.", category: 'general' },
      { question: 'Does it hurt?', answer: "Everyone's different, but most people describe it as an annoying scratching sensation. Some areas are more sensitive than others. Our artists are great at helping you stay comfortable!", category: 'general' },
      { question: 'How should I prepare?', answer: "Eat a good meal beforehand, stay hydrated, get a good night's sleep, and don't drink alcohol for 24 hours before. Wear comfortable clothes that allow easy access to the area being tattooed.", category: 'general' }
    ],
    receptionist_transfer_triggers: ['design discussion or reference review', 'cover-up consultation needed', 'complaint about a tattoo', 'asking about apprenticeship', 'medical condition affecting tattoo safety'],
    wizard_steps: [
      { step_number: 1, title: 'Your Studio', description: "Let's set up your tattoo studio.", fields: [
        { name: 'business_name', label: 'Studio Name', type: 'text', placeholder: 'Black Ink Tattoo', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Alex Rivera', required: true },
        { name: 'phone', label: 'Studio Phone', type: 'phone', placeholder: '(555) 999-0000', required: true },
        { name: 'address', label: 'Studio Address', type: 'text', placeholder: '900 Art District, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services & Artists', description: 'Your studio details.', fields: [
        { name: 'styles', label: 'Styles Offered', type: 'multiselect', placeholder: 'Select styles', required: true, options: ['Traditional', 'Neo-Traditional', 'Realism', 'Blackwork', 'Japanese', 'Watercolor', 'Fine Line', 'Geometric', 'Tribal', 'Lettering', 'Cover-Ups', 'Custom'] },
        { name: 'minimum_price', label: 'Shop Minimum', type: 'currency', placeholder: '80', required: true },
        { name: 'artist_count', label: 'Number of Artists', type: 'number', placeholder: '4', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Tue-Sat 12pm-9pm', required: true }
      ]},
      { step_number: 3, title: 'Booking Style', description: 'How do you book?', fields: [
        { name: 'walkin_policy', label: 'Walk-In Policy', type: 'select', placeholder: 'Select', required: true, options: ['Walk-ins welcome daily', 'Walk-ins on specific days', 'Appointment only'] },
        { name: 'deposit_required', label: 'Deposit Required?', type: 'toggle', placeholder: '', required: true },
        { name: 'deposit_amount', label: 'Deposit Amount', type: 'currency', placeholder: '50', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "You're set!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.blackinktattoo.com', required: false },
        { name: 'instagram', label: 'Instagram', type: 'text', placeholder: '@blackinktattoo', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-appointments', title: "Today's Schedule", description: 'Booked sessions by artist.', priority: 1 },
      { id: 'consultation-requests', title: 'Consultation Requests', description: 'Pending consultation requests to schedule.', priority: 2 },
      { id: 'artist-waitlists', title: 'Artist Waitlists', description: 'Wait time by artist.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue by artist.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send consultation confirmation', description: 'Confirm consultation booking with prep instructions.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Send aftercare instructions', description: 'Text aftercare guide after tattoo session.', category: 'operations', difficulty: 'automatic' },
      { title: 'Follow up on healing', description: 'Check in with client 2 weeks after tattoo.', category: 'operations', difficulty: 'automatic' },
      { title: 'Share new artist portfolio work', description: 'Post recent work to social media.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Consultations Per Week', unit: 'count', description: 'Consultation requests per week.', target_suggestion: 15 },
      { name: 'Consultation-to-Booking Rate', unit: 'percentage', description: 'Consultations that become booked sessions.', target_suggestion: 75 },
      { name: 'Average Session Revenue', unit: 'dollars', description: 'Average revenue per tattoo session.', target_suggestion: 350 },
      { name: 'Artist Utilization', unit: 'percentage', description: 'Percentage of artist hours booked.', target_suggestion: 70 }
    ],
    suggested_integrations: [
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local tattoo studio search visibility.', priority: 'essential' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Essential for showcasing artist portfolios.', priority: 'essential' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Deposits and payment processing.', priority: 'recommended' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manage artist schedules.', priority: 'recommended' }
    ],
    integration_priority: ['google-business', 'instagram', 'square', 'google-calendar'],
    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Tattoo Consultation at {{business_name}}', body: "Hey {{customer_name}},\n\nYour consultation is booked:\n\nDate: {{date}}\nTime: {{time}}\nArtist: {{artist_name}}\n\nBring any reference images or ideas. The more detail, the better your artist can prepare.\n\nAddress: {{address}}\n\nSee you then!\n— {{business_name}}", trigger: 'consultation_booked' },
      { name: 'Aftercare Guide', subject: 'Tattoo Aftercare — {{business_name}}', body: "Hey {{customer_name}},\n\nCongrats on your new ink! Here's how to take care of it:\n\n• Leave the bandage on for {{bandage_time}}\n• Wash gently with unscented soap\n• Apply thin layer of {{aftercare_product}}\n• Don't pick, scratch, or soak it\n• Avoid sun exposure for 2-4 weeks\n• No swimming or hot tubs for 2 weeks\n\nHealing takes 2-4 weeks. If anything looks off, don't hesitate to reach out.\n\n— {{business_name}}", trigger: 'session_completed' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hey {{customer_name}}, reminder: your tattoo session at {{business_name}} is tomorrow at {{time}} with {{artist_name}}. Eat well, stay hydrated, no alcohol. See you!", trigger: 'appointment_reminder_24h' },
      { name: 'Healing Check-In', body: "Hey {{customer_name}}, how's your tattoo healing? It's been 2 weeks — should be past the peeling stage. Any questions, hit us up! — {{business_name}}", trigger: 'healing_checkin_14_days' },
      { name: 'Review Request', body: "Hey {{customer_name}}, loving your new ink? Drop us a review and help others find great tattoo work: {{review_link}} — {{business_name}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2400,
    ideal_plan: 'pro',
    competitor_tools: ['TattooPro', 'Ink Planner', 'REV23']
  },

  // ─── 10. MASSAGE THERAPY ───
  {
    id: 'massage-therapy',
    industry: 'Beauty & Personal Care',
    niche: 'Massage Therapy',
    display_name: 'Massage Therapy',
    emoji: '💆',
    tagline: 'Your AI scheduler that books sessions, sends wellness reminders, and keeps your practice thriving.',
    demo_greeting: "Hi! I'm Mouse, your AI massage therapy assistant. I book sessions, send wellness reminders, and help clients choose the right type of massage. Want to see how I'd help someone with chronic back pain find the right treatment?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a massage therapy practice. Help clients understand different massage modalities, book sessions, and choose the right treatment. Be calm, wellness-focused, and knowledgeable. Never diagnose conditions.",
    demo_suggested_messages: ['My back has been killing me', 'What type of massage do you recommend?', 'How much for a 90-minute massage?', 'Do you take insurance?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} run their massage therapy practice by booking sessions, sending wellness reminders, helping clients choose the right modality, and keeping the schedule full. You're calm, wellness-focused, and never diagnose. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}, this is Mouse. I can help you book a massage, learn about our services, or answer questions. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a massage therapy practice. Book sessions, explain massage types, provide pricing. Be calm and wellness-oriented. Never diagnose conditions. Transfer to the therapist for medical questions, insurance billing issues, or specific treatment plan discussions.",
    receptionist_faqs: [
      { question: 'What types of massage do you offer?', answer: "We offer Swedish (relaxation), Deep Tissue (muscle tension), Sports Massage (athletic recovery), {{specialty_modalities}}. Each targets different needs — I can help you find the right one!", category: 'services' },
      { question: 'How much is a massage?', answer: "60-minute sessions are {{sixty_min_price}} and 90-minute sessions are {{ninety_min_price}}. We also offer packages if you'd like to save on regular visits.", category: 'pricing' },
      { question: 'Do you take insurance?', answer: "{{insurance_answer}} We can provide a superbill for you to submit to your insurance for possible reimbursement.", category: 'billing' },
      { question: 'How often should I get a massage?', answer: "For general wellness, once a month is great. If you're dealing with chronic tension or recovering from an injury, every 2 weeks is ideal. We'll help find the right schedule for you.", category: 'general' },
      { question: 'Is deep tissue painful?', answer: "Deep tissue uses firmer pressure to reach deeper muscle layers. It shouldn't be painful — your therapist will check in about pressure throughout. Some tenderness after is normal and resolves in a day or two.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['specific medical condition discussion', 'insurance billing dispute', 'wants a treatment plan consultation', 'complaint about a session', 'prenatal massage for high-risk pregnancy'],
    wizard_steps: [
      { step_number: 1, title: 'Your Practice', description: "Let's set up your practice.", fields: [
        { name: 'business_name', label: 'Practice Name', type: 'text', placeholder: 'Restore Massage Therapy', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Jennifer Walsh, LMT', required: true },
        { name: 'phone', label: 'Practice Phone', type: 'phone', placeholder: '(555) 100-2000', required: true },
        { name: 'address', label: 'Practice Address', type: 'text', placeholder: '1000 Wellness Way, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Services & Pricing', description: 'Your massage menu.', fields: [
        { name: 'modalities', label: 'Modalities Offered', type: 'multiselect', placeholder: 'Select modalities', required: true, options: ['Swedish', 'Deep Tissue', 'Sports Massage', 'Hot Stone', 'Prenatal', 'Trigger Point', 'Myofascial Release', 'Cupping', 'Reflexology', 'Lymphatic Drainage', 'Thai Massage', 'Couples Massage'] },
        { name: 'sixty_min_price', label: '60-Minute Session Price', type: 'currency', placeholder: '90', required: true },
        { name: 'ninety_min_price', label: '90-Minute Session Price', type: 'currency', placeholder: '120', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 9am-7pm', required: true }
      ]},
      { step_number: 3, title: 'Practice Details', description: 'A few more things.', fields: [
        { name: 'accepts_insurance', label: 'Accept Insurance?', type: 'toggle', placeholder: '', required: true },
        { name: 'specialty_modalities', label: 'Specialty Modalities', type: 'text', placeholder: 'Craniosacral, Ashiatsu, etc.', required: false },
        { name: 'package_available', label: 'Offer Session Packages?', type: 'toggle', placeholder: '', required: false, help_text: 'e.g., Buy 5 get 1 free' }
      ]},
      { step_number: 4, title: 'Go Live', description: "You're ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.restoremassage.com', required: false },
        { name: 'license_number', label: 'License Number', type: 'text', placeholder: 'LMT-12345', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-sessions', title: "Today's Sessions", description: 'All booked massage sessions for today.', priority: 1 },
      { id: 'wellness-reminders', title: 'Wellness Reminders Due', description: 'Clients due for their next session.', priority: 2 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue from sessions and packages.', priority: 3 },
      { id: 'client-notes', title: 'Session Notes Due', description: 'Sessions needing post-session notes.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send wellness reminder', description: 'Text clients who haven\'t booked in 4+ weeks.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Appointment reminder', description: 'Send reminder 24 hours before session.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Send package expiration notice', description: 'Alert clients whose session package is expiring.', category: 'billing', difficulty: 'automatic' },
      { title: 'Request review', description: 'Ask for a review after session.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Sessions Per Week', unit: 'count', description: 'Total massage sessions per week.', target_suggestion: 25 },
      { name: 'Average Session Value', unit: 'dollars', description: 'Average revenue per session.', target_suggestion: 100 },
      { name: 'Client Retention', unit: 'percentage', description: 'Clients who return within 6 weeks.', target_suggestion: 60 },
      { name: 'Schedule Utilization', unit: 'percentage', description: 'Percentage of available hours booked.', target_suggestion: 75 }
    ],
    suggested_integrations: [
      { name: 'MassageBook', slug: 'massagebook', category: 'booking', why: 'Purpose-built for massage therapists.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local massage therapy search visibility.', priority: 'essential' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Process payments and sell packages.', priority: 'recommended' },
      { name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', why: 'Track income and deductions for tax time.', priority: 'nice-to-have' }
    ],
    integration_priority: ['massagebook', 'google-business', 'square', 'quickbooks'],
    email_templates: [
      { name: 'Booking Confirmation', subject: 'Your Massage at {{business_name}}', body: "Hi {{customer_name}},\n\nYour massage is confirmed:\n\nDate: {{date}}\nTime: {{time}}\nType: {{massage_type}} ({{duration}} minutes)\n\nPlease arrive 10 minutes early. Drink plenty of water before and after.\n\nAddress: {{address}}\n\nSee you soon,\n{{business_name}}", trigger: 'appointment_booked' },
      { name: 'Wellness Reminder', subject: 'Your Body Will Thank You — {{business_name}}', body: "Hi {{customer_name}},\n\nIt's been {{weeks_since}} weeks since your last massage. Regular massage helps maintain the progress we've made.\n\nBook your next session: {{booking_link}}\n\nYour body will thank you!\n— {{business_name}}", trigger: 'wellness_reminder' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: your massage at {{business_name}} is tomorrow at {{time}}. Drink water and arrive 10 min early. See you then!", trigger: 'appointment_reminder_24h' },
      { name: 'Wellness Reminder', body: "Hi {{customer_name}}, it's been {{weeks_since}} weeks. Time for another massage! Book at {{business_name}}: {{booking_link}}", trigger: 'wellness_reminder' },
      { name: 'Review Request', body: "Thank you for your visit to {{business_name}}, {{customer_name}}! A review helps others find relief too: {{review_link}}", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 8,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
    competitor_tools: ['MassageBook', 'Vagaro', 'Mindbody', 'Fresha']
  },

  // ─── 11. SKINCARE CLINIC ───
  {
    id: 'skincare-clinic',
    industry: 'Beauty & Personal Care',
    niche: 'Skincare Clinic',
    display_name: 'Skincare Clinic',
    emoji: '🧴',
    tagline: 'Your AI clinic coordinator that books facials, follows up on treatment plans, and sells skincare products.',
    demo_greeting: "Hi! I'm Mouse, your AI skincare clinic coordinator. I book facials, follow up on treatment plans, and help clients build the right skincare routine. Want to see how I'd help someone dealing with acne?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a skincare clinic. Help clients understand facial treatments, skincare concerns, and product recommendations. Be knowledgeable but never diagnose — always recommend a consultation for personalized advice.",
    demo_suggested_messages: ['I struggle with acne', 'What facial is right for me?', 'How much is a chemical peel?', 'Do you sell skincare products?'],
    soul_template: "You are Mouse, the AI coordinator for {{business_name}}. You help {{owner_name}} run their skincare clinic by booking facials, following up on treatment plans, recommending products, and educating clients. You're knowledgeable about skincare but never diagnose — you recommend consultations. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}, this is Mouse! I can help you book a facial, learn about our treatments, or answer skincare questions. How can I help?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a skincare clinic. Book facials and consultations, explain treatments, and provide general skincare guidance. Never diagnose skin conditions. Transfer to the esthetician for specific skin concerns, adverse reactions, or treatment plan modifications.",
    receptionist_faqs: [
      { question: 'What facial is right for me?', answer: "It depends on your skin type and concerns! We recommend starting with a skin consultation ({{consultation_price}}) where our esthetician assesses your skin and creates a personalized plan. Or, our Classic Facial ({{classic_facial_price}}) is great for most skin types.", category: 'services' },
      { question: 'How much is a chemical peel?', answer: "Chemical peels start at {{peel_price}}. We offer light, medium, and deeper peels depending on your goals. A consultation helps us recommend the right one for your skin.", category: 'pricing' },
      { question: 'Do you sell skincare products?', answer: "Yes! We carry {{product_lines}} and can recommend products based on your skin type and treatment plan. We also offer product consultations.", category: 'products' },
      { question: 'How often should I get a facial?', answer: "For most people, every 4-6 weeks is ideal to work with your skin's natural renewal cycle. If you're targeting specific concerns, we might recommend more frequently at first.", category: 'general' },
      { question: 'Is there downtime after treatments?', answer: "Basic facials have no downtime. Chemical peels may have 2-7 days of peeling depending on depth. Microneedling may have 1-3 days of redness. We'll explain everything before your treatment.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['adverse reaction to treatment', 'specific skin condition diagnosis question', 'treatment plan modification', 'complaint about results', 'medical-grade treatment consultation'],
    wizard_steps: [
      { step_number: 1, title: 'Your Clinic', description: "Let's set up your skincare clinic.", fields: [
        { name: 'business_name', label: 'Clinic Name', type: 'text', placeholder: 'Radiance Skincare Clinic', required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Dr. Kara Mitchell', required: true },
        { name: 'phone', label: 'Clinic Phone', type: 'phone', placeholder: '(555) 200-3000', required: true },
        { name: 'address', label: 'Clinic Address', type: 'text', placeholder: '1100 Glow Dr, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Treatments', description: 'Your treatment menu.', fields: [
        { name: 'services', label: 'Treatments Offered', type: 'multiselect', placeholder: 'Select treatments', required: true, options: ['Classic Facial', 'Anti-Aging Facial', 'Acne Facial', 'Chemical Peel', 'Microneedling', 'Dermaplaning', 'LED Light Therapy', 'Hydrafacial', 'Oxygen Facial', 'Extraction Facial'] },
        { name: 'classic_facial_price', label: 'Classic Facial Price', type: 'currency', placeholder: '85', required: true },
        { name: 'peel_price', label: 'Chemical Peel Starting Price', type: 'currency', placeholder: '120', required: true },
        { name: 'consultation_price', label: 'Skin Consultation Price', type: 'text', placeholder: 'Free or $50', required: true }
      ]},
      { step_number: 3, title: 'Details', description: 'A few more things.', fields: [
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Mon-Sat 9am-6pm', required: true },
        { name: 'product_lines', label: 'Product Lines Carried', type: 'text', placeholder: 'SkinCeuticals, Obagi, ZO Skin Health...', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "You're ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.radianceskincare.com', required: false },
        { name: 'instagram', label: 'Instagram', type: 'text', placeholder: '@radianceskincare', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-schedule', title: "Today's Schedule", description: 'All booked treatments for today.', priority: 1 },
      { id: 'treatment-followups', title: 'Treatment Follow-Ups', description: 'Clients due for their next treatment.', priority: 2 },
      { id: 'product-sales', title: 'Product Sales', description: 'Skincare product sales this month.', priority: 3 },
      { id: 'monthly-revenue', title: 'Monthly Revenue', description: 'Revenue from treatments and products.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send treatment follow-up', description: 'Check in with client after chemical peel or advanced treatment.', category: 'patient-care', difficulty: 'automatic' },
      { title: 'Send rebooking reminder', description: 'Remind clients when they\'re due for their next facial.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Product reorder reminder', description: 'Remind clients when their skincare products should be running low.', category: 'sales', difficulty: 'automatic' },
      { title: 'Request review', description: 'Ask for a review after facial.', category: 'marketing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Treatment Room Utilization', unit: 'percentage', description: 'Percentage of available treatment hours booked.', target_suggestion: 75 },
      { name: 'Average Client Spend', unit: 'dollars', description: 'Average revenue per visit including products.', target_suggestion: 130 },
      { name: 'Product-to-Service Ratio', unit: 'percentage', description: 'Product revenue as percentage of total.', target_suggestion: 30 },
      { name: 'Client Retention', unit: 'percentage', description: 'Clients who return within 8 weeks.', target_suggestion: 55 }
    ],
    suggested_integrations: [
      { name: 'Vagaro', slug: 'vagaro', category: 'booking', why: 'Booking, POS, and client management.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local skincare clinic search visibility.', priority: 'essential' },
      { name: 'Shopify', slug: 'shopify', category: 'ecommerce', why: 'Sell skincare products online.', priority: 'recommended' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Showcase results and educate about skincare.', priority: 'recommended' }
    ],
    integration_priority: ['vagaro', 'google-business', 'shopify', 'instagram'],
    email_templates: [
      { name: 'Post-Treatment Care', subject: 'Post-Treatment Care Guide — {{business_name}}', body: "Hi {{customer_name}},\n\nThank you for your {{treatment_name}} today! Here's what to do over the next few days:\n\n{{aftercare_instructions}}\n\nYour next treatment is recommended in {{next_treatment_weeks}} weeks.\n\nQuestions? Reply here or call {{phone}}.\n\n— {{business_name}}", trigger: 'treatment_completed' },
      { name: 'Skin Consultation Follow-Up', subject: 'Your Personalized Skin Plan — {{business_name}}', body: "Hi {{customer_name}},\n\nThank you for your skin consultation! Based on our assessment, here's your recommended plan:\n\n{{treatment_plan}}\n\nReady to get started? Book your first treatment: {{booking_link}}\n\n— {{business_name}}", trigger: 'consultation_completed' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{customer_name}}, reminder: your facial at {{business_name}} is tomorrow at {{time}}. Come with clean skin (no makeup if possible). See you then!", trigger: 'appointment_reminder_24h' },
      { name: 'Rebooking Reminder', body: "Hi {{customer_name}}, it's time for your next facial at {{business_name}}! Book: {{booking_link}}", trigger: 'rebooking_due' },
      { name: 'Product Reorder', body: "Hi {{customer_name}}, your {{product_name}} from {{business_name}} should be running low. Reorder: {{product_link}} or pick up at your next visit!", trigger: 'product_reorder' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2400,
    ideal_plan: 'pro',
    competitor_tools: ['Vagaro', 'Boulevard', 'Mangomint', 'AestheticsPro']
  },

  // ─── 12. BRAIDING SALON ───
  {
    id: 'braiding-salon',
    industry: 'Beauty & Personal Care',
    niche: 'Braiding Salon',
    display_name: 'Braiding Salon',
    emoji: '✨',
    tagline: 'Your AI salon assistant that books braiding appointments, manages the long-session schedule, and keeps clients coming back.',
    demo_greeting: "Hey! I'm Mouse, your AI braiding salon assistant. I book braiding appointments, manage the schedule for long sessions, and help clients choose their style. Want to see how I'd help someone pick a protective style?",
    demo_system_prompt: "You are Mouse, an AI assistant demo for a braiding salon. Help clients choose braiding styles, understand pricing and time commitments, and book appointments. Be knowledgeable about protective styles and hair care. Be culturally aware and respectful.",
    demo_suggested_messages: ['How much for box braids?', 'How long does a braiding appointment take?', 'I want to try knotless braids', 'Do you do kids braids?'],
    soul_template: "You are Mouse, the AI assistant for {{business_name}}. You help {{owner_name}} run their braiding salon by booking appointments, managing long-session scheduling, helping clients choose styles, and keeping the business organized. You understand protective styling and its importance. Business hours: {{business_hours}}. Location: {{address}}. Phone: {{phone}}.",
    receptionist_greeting: "Hey, thanks for calling {{business_name}}, this is Mouse! I can help you book a braiding appointment, check availability, or answer questions about styles and pricing. What can I do for you?",
    receptionist_system_prompt: "You are Mouse, the AI receptionist for {{business_name}}, a braiding salon. Book appointments (note: braiding sessions are typically 3-8 hours), explain styles and pricing, answer questions about hair prep. Transfer to the braider for custom style consultations, color matching, or complaints.",
    receptionist_faqs: [
      { question: 'How much for box braids?', answer: "Box braids start at {{box_braid_price}}. Price depends on length, size, and whether you want knotless. Medium length, medium size is our most popular at {{popular_braid_price}}.", category: 'pricing' },
      { question: 'How long does it take?', answer: "It depends on the style! Box braids typically take 4-7 hours. Cornrows are 2-4 hours. Knotless braids take 5-8 hours. We'll give you a time estimate when you book.", category: 'general' },
      { question: 'Do I need to bring hair?', answer: "{{hair_policy}} We use quality {{hair_brand}} braiding hair. If you prefer a specific brand or color, just let us know!", category: 'general' },
      { question: 'How should I prep my hair?', answer: "Come with clean, detangled, and blow-dried or stretched hair. This helps us start right away and gives you the best results. Don't apply heavy products.", category: 'general' },
      { question: 'How long do braids last?', answer: "Most braiding styles last 4-8 weeks with proper care. We'll give you maintenance tips to keep them looking fresh as long as possible.", category: 'services' }
    ],
    receptionist_transfer_triggers: ['custom style design consultation', 'color-matching for extensions', 'complaint about a service', 'wants to discuss hair damage concern', 'booking for a wedding or event group'],
    wizard_steps: [
      { step_number: 1, title: 'Your Salon', description: "Let's set up your braiding salon.", fields: [
        { name: 'business_name', label: 'Salon Name', type: 'text', placeholder: "Queen's Braids", required: true },
        { name: 'owner_name', label: 'Your Name', type: 'text', placeholder: 'Fatima Johnson', required: true },
        { name: 'phone', label: 'Salon Phone', type: 'phone', placeholder: '(555) 300-4000', required: true },
        { name: 'address', label: 'Salon Address', type: 'text', placeholder: '1200 Crown St, Anytown, USA', required: true }
      ]},
      { step_number: 2, title: 'Styles & Pricing', description: 'Your braiding menu.', fields: [
        { name: 'styles', label: 'Styles Offered', type: 'multiselect', placeholder: 'Select styles', required: true, options: ['Box Braids', 'Knotless Braids', 'Cornrows', 'Feed-In Braids', 'Goddess Locs', 'Faux Locs', 'Twist Outs', 'Passion Twists', 'Crochet Braids', 'Stitch Braids', 'Fulani Braids', 'Kids Braids'] },
        { name: 'box_braid_price', label: 'Box Braids Starting Price', type: 'currency', placeholder: '150', required: true },
        { name: 'popular_braid_price', label: 'Most Popular Style Price', type: 'currency', placeholder: '200', required: true },
        { name: 'business_hours', label: 'Business Hours', type: 'time_range', placeholder: 'Tue-Sat 8am-6pm', required: true }
      ]},
      { step_number: 3, title: 'Hair & Policies', description: 'Your hair and booking policies.', fields: [
        { name: 'hair_included', label: 'Hair Included in Price?', type: 'toggle', placeholder: '', required: true },
        { name: 'hair_brand', label: 'Preferred Hair Brand', type: 'text', placeholder: 'Xpression, Sensationnel, etc.', required: false },
        { name: 'deposit_required', label: 'Deposit Required?', type: 'toggle', placeholder: '', required: true },
        { name: 'deposit_amount', label: 'Deposit Amount', type: 'currency', placeholder: '50', required: false }
      ]},
      { step_number: 4, title: 'Go Live', description: "You're ready!", fields: [
        { name: 'website', label: 'Website', type: 'url', placeholder: 'www.queensbraids.com', required: false },
        { name: 'instagram', label: 'Instagram', type: 'text', placeholder: '@queensbraids', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'todays-clients', title: "Today's Clients", description: 'Booked braiding sessions for today with estimated times.', priority: 1 },
      { id: 'weekly-schedule', title: 'Weekly Schedule', description: 'Full week view with time blocks for long sessions.', priority: 2 },
      { id: 'weekly-revenue', title: 'Weekly Revenue', description: 'Revenue from services and hair sales.', priority: 3 },
      { id: 'maintenance-reminders', title: 'Maintenance Due', description: 'Clients due for redo or takedown.', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Send maintenance reminder', description: 'Text clients when their braids are approaching 6-8 weeks.', category: 'marketing', difficulty: 'automatic' },
      { title: 'Send prep instructions', description: 'Text clients hair prep instructions 2 days before appointment.', category: 'operations', difficulty: 'automatic' },
      { title: 'Collect deposit for booking', description: 'Send deposit payment link when appointment is booked.', category: 'billing', difficulty: 'automatic' },
      { title: 'Post finished style to Instagram', description: 'Share photos of completed braids.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Clients Per Week', unit: 'count', description: 'Total braiding clients per week.', target_suggestion: 10 },
      { name: 'Average Service Price', unit: 'dollars', description: 'Average revenue per braiding client.', target_suggestion: 200 },
      { name: 'Client Return Rate', unit: 'percentage', description: 'Clients who come back for their next style.', target_suggestion: 70 },
      { name: 'No-Show Rate', unit: 'percentage', description: 'Booked appointments that no-show.', target_suggestion: 5 }
    ],
    suggested_integrations: [
      { name: 'Booksy', slug: 'booksy', category: 'booking', why: 'Popular booking platform for braiding salons.', priority: 'essential' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Local braiding salon search visibility.', priority: 'essential' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Essential for showcasing braiding styles.', priority: 'essential' },
      { name: 'CashApp / Zelle', slug: 'cashapp', category: 'payments', why: 'Collect deposits and payments easily.', priority: 'recommended' }
    ],
    integration_priority: ['booksy', 'google-business', 'instagram', 'cashapp'],
    email_templates: [
      { name: 'Booking Confirmation', subject: 'Your Braiding Appointment — {{business_name}}', body: "Hey {{customer_name}},\n\nYou're booked!\n\nDate: {{date}}\nTime: {{time}}\nStyle: {{style}}\nEstimated Time: {{estimated_hours}} hours\n\nPrep your hair: come with clean, detangled, blow-dried or stretched hair. No heavy products.\n\n{{hair_note}}\n\nDeposit of {{deposit_amount}} secures your spot.\n\nSee you then!\n— {{business_name}}", trigger: 'appointment_booked' },
      { name: 'Maintenance Reminder', subject: 'Time for Fresh Braids? — {{business_name}}', body: "Hey {{customer_name}},\n\nIt's been about {{weeks_since}} weeks since your last braids. Time for a fresh set or a different style?\n\nBook your next appointment: {{booking_link}}\n\nLet's keep your hair healthy and looking amazing!\n— {{business_name}}", trigger: 'maintenance_due' }
    ],
    sms_templates: [
      { name: 'Prep Instructions', body: "Hey {{customer_name}}! Your braiding appointment at {{business_name}} is in 2 days. Please come with clean, detangled, blow-dried hair. No heavy products. See you {{day}} at {{time}}!", trigger: 'prep_reminder_2_days' },
      { name: 'Maintenance Reminder', body: "Hey {{customer_name}}, your braids are about {{weeks_since}} weeks old. Time for a fresh set? Book at {{business_name}}: {{booking_link}}", trigger: 'maintenance_due' },
      { name: 'Review Request', body: "{{customer_name}}, love your new braids from {{business_name}}? Share a photo and review: {{review_link}} Thank you!", trigger: 'review_request' }
    ],
    estimated_hours_saved_weekly: 8,
    estimated_monthly_value: 2000,
    ideal_plan: 'pro',
    competitor_tools: ['Booksy', 'Styleseat', 'Fresha', 'Vagaro']
  }
];
