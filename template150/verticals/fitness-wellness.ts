import type { ProTemplate } from '../schema';

export const fitnessWellnessTemplates: ProTemplate[] = [
  {
    id: 'gym-fitness-center',
    industry: 'Fitness & Wellness',
    niche: 'Gym / Fitness Center',
    display_name: 'Gym & Fitness Center',
    emoji: '🏋️',
    tagline: 'Fill memberships, reduce cancellations, and keep members coming back.',

    demo_greeting: "Hi! I'm your AI assistant for a gym. I can help with membership info, class schedules, personal training inquiries, and more. What can I help with?",
    demo_system_prompt: "You are an AI assistant for a gym and fitness center. Help potential members learn about membership options, class schedules, and amenities. Be energetic and welcoming. Emphasize the free trial or tour when possible. Answer questions about hours, pricing, and what to expect on their first visit.",
    demo_suggested_messages: [
      "What memberships do you offer?",
      "Do you have a free trial?",
      "What group fitness classes do you have?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a gym and fitness center. Help potential members learn about membership options and schedule tours. Help existing members with class schedules, billing questions, and personal training. Be energetic, welcoming, and non-intimidating — many people are nervous about joining a gym. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you interested in joining, or are you a current member?",
    receptionist_system_prompt: "You are the phone receptionist for a gym. For potential members: answer questions about memberships, classes, and amenities. Try to schedule a free tour or trial. For current members: help with class schedules, billing questions, and personal training requests. Be energetic but not pushy.",
    receptionist_faqs: [
      { question: "How much is a membership?", answer: "We have several options depending on what you're looking for — individual, couple, and family plans. The best way to find the right fit is to come in for a free tour. Would you like to schedule one?", category: "pricing" },
      { question: "Can I try before I join?", answer: "Absolutely! We offer a free one-day trial so you can check out the equipment, take a class, and see if it feels right. Want to schedule your trial?", category: "trial" },
      { question: "What are your hours?", answer: "We're open {{business_hours}}. Our busiest times are early morning and right after work. Midday and late evening are usually less crowded.", category: "hours" },
      { question: "Do you have personal trainers?", answer: "Yes! We have certified personal trainers who can create a customized workout plan for you. Many new members start with a few sessions to learn proper form and build a routine.", category: "training" }
    ],
    receptionist_transfer_triggers: [
      "caller wants to cancel their membership",
      "caller has a billing dispute",
      "caller reports an injury at the gym",
      "caller asks about corporate or group rates"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Gym', description: 'Tell us about your fitness center.', fields: [
        { name: 'business_name', label: 'Gym Name', type: 'text', placeholder: 'Iron City Fitness', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 111-2222', required: true },
        { name: 'amenities', label: 'What does your gym offer?', type: 'multiselect', placeholder: '', required: true, options: ['Free Weights', 'Machines', 'Cardio Equipment', 'Group Fitness Classes', 'Personal Training', 'Pool', 'Sauna/Steam Room', 'Basketball Court', 'Childcare', 'Locker Rooms/Showers'] }
      ]},
      { step_number: 2, title: 'Memberships', description: 'What membership options do you offer?', fields: [
        { name: 'membership_types', label: 'Membership types', type: 'multiselect', placeholder: '', required: true, options: ['Individual', 'Couple', 'Family', 'Student', 'Senior', 'Day Pass', 'Class-Only'] },
        { name: 'lowest_price', label: 'Starting monthly price', type: 'currency', placeholder: '29', required: true },
        { name: 'free_trial', label: 'Offer a free trial?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 3, title: 'Hours', description: 'When is your gym open?', fields: [
        { name: 'business_hours', label: 'Regular Hours', type: 'time_range', placeholder: '5:00 AM - 11:00 PM', required: true },
        { name: 'staffed_hours', label: 'Staffed Hours (if different)', type: 'time_range', placeholder: '6:00 AM - 9:00 PM', required: false }
      ]},
      { step_number: 4, title: 'Classes & Training', description: 'Group classes and personal training info.', fields: [
        { name: 'class_types', label: 'Group class types', type: 'multiselect', placeholder: '', required: false, options: ['Yoga', 'Spin/Cycling', 'HIIT', 'Zumba', 'Pilates', 'Boxing', 'Boot Camp', 'Strength Training', 'Stretching/Mobility'] },
        { name: 'personal_training', label: 'Offer personal training?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-leads', title: 'New Membership Inquiries', description: 'People interested in joining', priority: 1 },
      { id: 'tours-scheduled', title: 'Tours Scheduled', description: 'Upcoming gym tours and free trials', priority: 2 },
      { id: 'cancellation-risk', title: 'Cancellation Risk', description: 'Members who haven\'t visited in 2+ weeks', priority: 3 },
      { id: 'class-attendance', title: 'Class Attendance', description: 'Today\'s group fitness class enrollment', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up with tour no-show', description: 'Potential member scheduled a tour but didn\'t come in — send friendly follow-up.', category: 'leads', difficulty: 'automatic' },
      { title: 'Win-back inactive member', description: 'Member hasn\'t checked in for 3 weeks — send encouraging message.', category: 'retention', difficulty: 'automatic' },
      { title: 'Personal training upsell', description: 'New member completed 2 weeks — suggest a personal training intro session.', category: 'upsell', difficulty: 'needs-approval' },
      { title: 'Membership renewal reminder', description: 'Annual membership expiring next month — send renewal offer.', category: 'billing', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Members', unit: 'per month', description: 'New memberships signed', target_suggestion: 25 },
      { name: 'Cancellation Rate', unit: 'percent', description: 'Monthly membership cancellations', target_suggestion: 3 },
      { name: 'Tour-to-Join Rate', unit: 'percent', description: 'Percentage of tours that become memberships', target_suggestion: 50 },
      { name: 'Average Visit Frequency', unit: 'per week', description: 'How often members visit per week', target_suggestion: 3 }
    ],

    suggested_integrations: [
      { name: 'Mindbody', slug: 'mindbody', category: 'gym-management', why: 'Manages memberships, class schedules, and check-ins', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Syncs tour and personal training appointments', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Processes membership payments and handles recurring billing', priority: 'recommended' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Share class highlights and member transformations', priority: 'nice-to-have' }
    ],
    integration_priority: ['mindbody', 'google-calendar', 'stripe', 'instagram'],

    email_templates: [
      { name: 'Tour Confirmation', subject: 'Your Free Tour at {{business_name}}!', body: "Hi {{client_name}},\n\nWe're excited to show you around! Your free tour is scheduled for {{date}} at {{time}}.\n\nWear something comfortable — you're welcome to try out the equipment or take a class during your visit.\n\nWe're at: {{address}}\n\nSee you there!\n{{business_name}}", trigger: 'tour_booked' },
      { name: 'Win-Back', subject: 'We Miss You at {{business_name}}!', body: "Hi {{client_name}},\n\nWe noticed it's been a while since your last visit. No judgment — life gets busy!\n\nJust a reminder: we're here whenever you're ready. Sometimes getting back is the hardest part, so here's an idea — try a group class this week. They're fun and a great way to ease back in.\n\nSee you soon!\n{{business_name}}", trigger: 'inactive_member' }
    ],
    sms_templates: [
      { name: 'Tour Reminder', body: "Hi {{client_name}}! Your free tour at {{business_name}} is tomorrow at {{time}}. Wear comfortable clothes and bring a water bottle. See you there! 💪", trigger: 'tour_reminder' },
      { name: 'Class Reminder', body: "Hey {{client_name}}, your {{class_name}} class is in 2 hours at {{business_name}}. See you on the mat!", trigger: 'class_reminder' }
    ],

    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2400,
    ideal_plan: 'pro',
    competitor_tools: ['Mindbody', 'Gymdesk', 'ClubReady']
  },

  {
    id: 'yoga-studio',
    industry: 'Fitness & Wellness',
    niche: 'Yoga Studio',
    display_name: 'Yoga Studio',
    emoji: '🧘',
    tagline: 'Fill your classes, nurture your community, and grow your studio with ease.',

    demo_greeting: "Hi! I'm your AI assistant for a yoga studio. I can help with class schedules, pricing, and what to expect at your first class. Namaste!",
    demo_system_prompt: "You are a warm AI assistant for a yoga studio. Help potential students learn about class types, schedules, pricing, and what to bring. Be calming and inclusive — emphasize that yoga is for all levels and body types. Encourage beginners to try a class.",
    demo_suggested_messages: [
      "I've never done yoga — where should I start?",
      "What types of yoga classes do you offer?",
      "Do I need to bring my own mat?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a yoga studio. Help students find the right class, understand pricing, and feel welcome. Be warm, calming, and inclusive. Many people are nervous about trying yoga — reassure them that every body is a yoga body and beginners are always welcome. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you interested in trying a class, or are you an existing student?",
    receptionist_system_prompt: "You are the phone receptionist for a yoga studio. Help callers learn about class types, schedules, and pricing. Encourage first-timers to try a beginner or all-levels class. Be warm and calming. For existing students, help with scheduling and membership questions.",
    receptionist_faqs: [
      { question: "I'm a beginner — is that okay?", answer: "Absolutely! Everyone starts somewhere. We have beginner-friendly classes and our instructors always offer modifications. You'll feel right at home.", category: "beginners" },
      { question: "What should I wear/bring?", answer: "Wear comfortable, stretchy clothing. We provide mats, but you're welcome to bring your own. Bring a water bottle and maybe a small towel. That's it!", category: "preparation" },
      { question: "How much does it cost?", answer: "We offer drop-in rates, class packs, and unlimited memberships. Many new students start with our intro special — it's a great way to try multiple classes at a discounted rate.", category: "pricing" },
      { question: "What styles of yoga do you teach?", answer: "We offer a variety of styles including Vinyasa, Hatha, Yin, Restorative, and Hot Yoga. Each style is different — I can help you find the right one based on what you're looking for.", category: "classes" }
    ],
    receptionist_transfer_triggers: [
      "caller asks about teacher training",
      "caller wants to host a private event or corporate session",
      "caller has a specific injury or medical concern",
      "caller wants to discuss a refund"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Studio', description: 'Tell us about your yoga studio.', fields: [
        { name: 'business_name', label: 'Studio Name', type: 'text', placeholder: 'Lotus Flow Yoga', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 222-3333', required: true },
        { name: 'yoga_styles', label: 'Styles you teach', type: 'multiselect', placeholder: '', required: true, options: ['Vinyasa', 'Hatha', 'Yin', 'Restorative', 'Hot Yoga', 'Power Yoga', 'Ashtanga', 'Kundalini', 'Prenatal', 'Chair Yoga', 'Meditation'] }
      ]},
      { step_number: 2, title: 'Pricing', description: 'How do students pay?', fields: [
        { name: 'drop_in_rate', label: 'Single class drop-in rate', type: 'currency', placeholder: '20', required: true },
        { name: 'intro_offer', label: 'New student intro offer', type: 'text', placeholder: '2 weeks unlimited for $40', required: false },
        { name: 'membership_options', label: 'Membership/package options', type: 'multiselect', placeholder: '', required: true, options: ['Unlimited Monthly', '5-Class Pack', '10-Class Pack', '20-Class Pack', 'Annual Membership', 'Student/Senior Discount'] }
      ]},
      { step_number: 3, title: 'Schedule', description: 'When do you hold classes?', fields: [
        { name: 'business_hours', label: 'Studio Hours', type: 'time_range', placeholder: '6:00 AM - 9:00 PM', required: true },
        { name: 'classes_per_day', label: 'Average classes per day', type: 'number', placeholder: '6', required: false }
      ]},
      { step_number: 4, title: 'Amenities', description: 'What do you provide?', fields: [
        { name: 'mats_provided', label: 'Mats available for use?', type: 'toggle', placeholder: '', required: true },
        { name: 'amenities', label: 'Additional amenities', type: 'multiselect', placeholder: '', required: false, options: ['Showers', 'Changing Rooms', 'Props (blocks, straps, bolsters)', 'Tea/Water Bar', 'Retail Shop', 'Parking'] }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-students', title: 'New Student Inquiries', description: 'People interested in trying yoga', priority: 1 },
      { id: 'todays-classes', title: "Today's Classes", description: 'Class schedule and enrollment for today', priority: 2 },
      { id: 'expiring-packs', title: 'Expiring Class Packs', description: 'Students whose class packs are running low', priority: 3 },
      { id: 'inactive-students', title: 'Inactive Students', description: 'Students who haven\'t attended in 2+ weeks', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Welcome new student', description: 'Send welcome email with class recommendations and what to bring.', category: 'onboarding', difficulty: 'automatic' },
      { title: 'Class pack expiring soon', description: 'Student has 1 class left on their 10-pack — suggest renewal or upgrade.', category: 'upsell', difficulty: 'automatic' },
      { title: 'Win back inactive student', description: 'Student hasn\'t attended in 3 weeks — send encouraging message.', category: 'retention', difficulty: 'automatic' },
      { title: 'Workshop promotion', description: 'Send email about upcoming weekend workshop to interested students.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'New Students', unit: 'per month', description: 'First-time students', target_suggestion: 20 },
      { name: 'Class Fill Rate', unit: 'percent', description: 'Average percentage of spots filled per class', target_suggestion: 70 },
      { name: 'Student Retention', unit: 'percent', description: 'Students who return after their first month', target_suggestion: 55 },
      { name: 'Revenue Per Student', unit: 'dollars/month', description: 'Average monthly revenue per active student', target_suggestion: 80 }
    ],

    suggested_integrations: [
      { name: 'Mindbody', slug: 'mindbody', category: 'studio-management', why: 'Manages class schedules, bookings, and memberships', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Syncs private sessions and workshops', priority: 'essential' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Yoga is visual — share class moments and teacher tips', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Send class schedule updates and workshop announcements', priority: 'nice-to-have' }
    ],
    integration_priority: ['mindbody', 'google-calendar', 'instagram', 'mailchimp'],

    email_templates: [
      { name: 'New Student Welcome', subject: 'Welcome to {{business_name}}!', body: "Hi {{client_name}},\n\nWe're so glad you're joining us!\n\nHere's what to know for your first class:\n- Arrive 10-15 minutes early to get settled\n- Wear comfortable clothes you can stretch in\n- We provide mats and props — just bring yourself and a water bottle\n- Don't worry about \"keeping up\" — go at your own pace\n\nWe recommend starting with our {{recommended_class}} class.\n\nSee you on the mat!\n{{business_name}}", trigger: 'new_student' },
      { name: 'Class Pack Running Low', subject: 'Your Class Pack Update — {{business_name}}', body: "Hi {{client_name}},\n\nJust a heads up — you have {{classes_remaining}} class(es) left on your pack.\n\nWant to keep your practice going? Here are your options:\n- Renew your class pack\n- Upgrade to unlimited monthly for even better value\n\nBook your next class: {{booking_link}}\n\nSee you soon!\n{{business_name}}", trigger: 'low_classes' }
    ],
    sms_templates: [
      { name: 'Class Reminder', body: "Hi {{client_name}}, your {{class_name}} class at {{business_name}} is in 2 hours. Arrive 10 min early. See you on the mat!", trigger: 'class_reminder' },
      { name: 'New Student Follow-Up', body: "Hi {{client_name}}, thanks for your first class at {{business_name}}! How did it feel? We'd love to see you again — your intro special is still active.", trigger: 'post_first_class' }
    ],

    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2000,
    ideal_plan: 'pro',
    competitor_tools: ['Mindbody', 'Momoyoga', 'Vagaro']
  },

  {
    id: 'martial-arts-studio',
    industry: 'Fitness & Wellness',
    niche: 'Martial Arts Studio',
    display_name: 'Martial Arts Studio',
    emoji: '🥋',
    tagline: 'Grow your dojo with more signups, better retention, and automated belt test reminders.',

    demo_greeting: "Hi! I'm your AI assistant for a martial arts studio. I can help with class info, pricing, free trial classes, and what to expect. How can I help?",
    demo_system_prompt: "You are an AI assistant for a martial arts studio. Help potential students learn about programs for kids and adults, trial class options, and what to expect. Be enthusiastic but professional. Emphasize discipline, confidence, and fitness benefits — not just fighting.",
    demo_suggested_messages: [
      "Do you have classes for kids?",
      "What martial arts styles do you teach?",
      "Can I try a free class?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a martial arts studio. Help potential students learn about programs and schedule trial classes. Emphasize the benefits of martial arts beyond fighting: discipline, confidence, fitness, and self-defense. Be welcoming to beginners of all ages. For kids' programs, address parents' concerns about safety. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you interested in classes for yourself or for a child?",
    receptionist_system_prompt: "You are the receptionist for a martial arts studio. Determine if the caller is interested in adult or kids' classes. Gather: name, age of student, any prior experience, and what they hope to get out of training. Schedule a free trial class. Be enthusiastic and highlight the life skills benefits, especially for children.",
    receptionist_faqs: [
      { question: "What age do you start kids?", answer: "We have programs starting as young as 4 years old, with age-appropriate classes that focus on coordination, focus, and having fun. Our kids' classes are designed to build confidence and discipline.", category: "kids" },
      { question: "Will my child learn to fight?", answer: "Our program teaches self-defense skills, but the emphasis is on discipline, respect, and confidence. Students learn when and how to avoid conflicts — fighting is always a last resort.", category: "kids" },
      { question: "I have no experience — is that okay?", answer: "Most of our students started as complete beginners! Our instructors are great at working with all skill levels. The free trial class is a perfect way to see if it's a good fit.", category: "beginners" },
      { question: "How much does it cost?", answer: "We have different program options depending on how many classes per week you'd like. The best way to learn about pricing is to come in for a free trial — we'll walk you through everything.", category: "pricing" }
    ],
    receptionist_transfer_triggers: [
      "caller asks about competition/tournament team",
      "caller wants to discuss a bulk or family discount",
      "caller has a child with special needs and wants to discuss accommodations",
      "caller reports an injury during class"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Studio', description: 'Tell us about your martial arts school.', fields: [
        { name: 'business_name', label: 'Studio Name', type: 'text', placeholder: 'Eagle Martial Arts Academy', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 333-4444', required: true },
        { name: 'styles', label: 'Martial arts styles taught', type: 'multiselect', placeholder: '', required: true, options: ['Karate', 'Taekwondo', 'Brazilian Jiu-Jitsu', 'Muay Thai', 'Judo', 'Kung Fu', 'Krav Maga', 'MMA', 'Kickboxing', 'Aikido'] }
      ]},
      { step_number: 2, title: 'Programs', description: 'What programs do you offer?', fields: [
        { name: 'age_groups', label: 'Age groups served', type: 'multiselect', placeholder: '', required: true, options: ['Little Warriors (4-6)', 'Kids (7-12)', 'Teens (13-17)', 'Adults (18+)', 'Family Classes'] },
        { name: 'free_trial', label: 'Offer a free trial class?', type: 'toggle', placeholder: '', required: true },
        { name: 'belt_system', label: 'Do you use a belt ranking system?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 3, title: 'Schedule & Pricing', description: 'When and how much?', fields: [
        { name: 'business_hours', label: 'Class Hours', type: 'time_range', placeholder: '3:00 PM - 9:00 PM', required: true },
        { name: 'starting_price', label: 'Starting monthly tuition', type: 'currency', placeholder: '99', required: true }
      ]},
      { step_number: 4, title: 'Additional Info', description: 'Other details for families.', fields: [
        { name: 'family_discount', label: 'Offer family discounts?', type: 'toggle', placeholder: '', required: false },
        { name: 'competition_team', label: 'Have a competition/tournament team?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],

    dashboard_widgets: [
      { id: 'trial-signups', title: 'Trial Class Signups', description: 'New people trying a class', priority: 1 },
      { id: 'active-students', title: 'Active Students', description: 'Currently enrolled students', priority: 2 },
      { id: 'belt-tests', title: 'Upcoming Belt Tests', description: 'Students eligible for next rank', priority: 3 },
      { id: 'retention', title: 'Retention Alerts', description: 'Students at risk of dropping out', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up after trial class', description: 'Call parent to see how their child enjoyed the trial class and discuss enrollment.', category: 'leads', difficulty: 'needs-approval' },
      { title: 'Belt test eligible notification', description: 'Notify student they\'re eligible for their next belt test.', category: 'student-progress', difficulty: 'automatic' },
      { title: 'Win back absent student', description: 'Student missed 2 weeks of classes — reach out to the family.', category: 'retention', difficulty: 'automatic' },
      { title: 'Tournament registration reminder', description: 'Remind competition team about upcoming tournament registration deadline.', category: 'events', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Trial Signups', unit: 'per month', description: 'New students trying a free class', target_suggestion: 15 },
      { name: 'Trial-to-Enrollment Rate', unit: 'percent', description: 'Trial students who enroll', target_suggestion: 55 },
      { name: 'Monthly Retention', unit: 'percent', description: 'Students who stay month-over-month', target_suggestion: 92 },
      { name: 'Average Student Lifetime', unit: 'months', description: 'How long students stay enrolled', target_suggestion: 18 }
    ],

    suggested_integrations: [
      { name: 'Kicksite', slug: 'kicksite', category: 'studio-management', why: 'Built for martial arts — tracks belts, attendance, and billing', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Syncs class schedules and private lessons', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles monthly tuition and merchandise purchases', priority: 'recommended' },
      { name: 'Facebook', slug: 'facebook', category: 'social', why: 'Parents share their kids\' belt promotions — great organic marketing', priority: 'nice-to-have' }
    ],
    integration_priority: ['kicksite', 'google-calendar', 'stripe', 'facebook'],

    email_templates: [
      { name: 'Trial Class Confirmation', subject: 'Your Free Trial Class at {{business_name}}!', body: "Hi {{client_name}},\n\nWe're excited to welcome you (or your child) for a free trial class!\n\nDate: {{date}}\nTime: {{time}}\n\nWhat to wear: Comfortable workout clothes (no buttons or zippers). Bare feet on the mat.\nWhat to bring: Just yourself and a positive attitude!\n\nArrive 10 minutes early so we can get you set up.\n\nSee you on the mat!\n{{business_name}}", trigger: 'trial_booked' },
      { name: 'Belt Test Invitation', subject: 'Congratulations — You\'re Eligible for Your Next Belt Test!', body: "Hi {{client_name}},\n\nGreat news! Based on your progress and attendance, you're eligible for your next belt test.\n\nBelt Test Date: {{date}}\nTime: {{time}}\nFee: {{test_fee}}\n\nPlease confirm your participation by replying to this email or calling {{phone}}.\n\nKeep up the great work!\n{{business_name}}", trigger: 'belt_test_eligible' }
    ],
    sms_templates: [
      { name: 'Trial Reminder', body: "Hi {{client_name}}, your free trial class at {{business_name}} is tomorrow at {{time}}. Wear comfy clothes, no shoes needed. See you there!", trigger: 'trial_reminder' },
      { name: 'Missed Class Check-In', body: "Hi {{client_name}}, we missed you at {{business_name}} this week! Everything okay? We'd love to see you back on the mat. 🥋", trigger: 'missed_classes' }
    ],

    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2100,
    ideal_plan: 'pro',
    competitor_tools: ['Kicksite', 'Zen Planner', 'Spark Membership']
  },

  {
    id: 'personal-training-studio',
    industry: 'Fitness & Wellness',
    niche: 'Personal Training Studio',
    display_name: 'Personal Training Studio',
    emoji: '💪',
    tagline: 'Fill your training calendar, reduce no-shows, and keep clients motivated.',

    demo_greeting: "Hi! I'm your AI assistant for a personal training studio. I can help with scheduling sessions, learning about our trainers, and getting started with a fitness plan. How can I help?",
    demo_system_prompt: "You are an AI assistant for a personal training studio. Help potential clients understand your services, meet the right trainer, and schedule their first session. Be motivating and supportive — many people are nervous about personal training. Emphasize that programs are customized to each person's level and goals.",
    demo_suggested_messages: [
      "I want to get in shape but don't know where to start",
      "How much do personal training sessions cost?",
      "Do you work with beginners?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a personal training studio. Help potential clients find the right trainer and program. Be motivating and supportive — many people feel intimidated. Emphasize personalization: every workout is designed for their body, goals, and fitness level. No cookie-cutter routines. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you looking to start personal training, or are you an existing client?",
    receptionist_system_prompt: "You are the receptionist for a personal training studio. For potential clients: learn about their fitness goals, experience level, and any injuries or limitations. Match them with a trainer and schedule a consultation or intro session. For existing clients: help with scheduling and rescheduling. Be motivating and non-judgmental.",
    receptionist_faqs: [
      { question: "How much does personal training cost?", answer: "Our rates depend on the package — sessions are less expensive when you buy in bulk. We offer single sessions, 10-packs, and monthly packages. The best way to learn about pricing is to schedule a free consultation.", category: "pricing" },
      { question: "I have a bad back/knee/shoulder — can I still train?", answer: "Absolutely. Our trainers are experienced in working around injuries and limitations. In fact, proper training can often help with those issues. We'll design a program that's safe for your body.", category: "injuries" },
      { question: "How often should I train?", answer: "Most clients see great results with 2-3 sessions per week. Your trainer will recommend a frequency based on your goals and schedule during your consultation.", category: "frequency" },
      { question: "Do you do group training?", answer: "Yes! We offer small group training (2-4 people) at a lower rate per person. It's a great option if you want to train with a friend or partner.", category: "group" }
    ],
    receptionist_transfer_triggers: [
      "caller has a specific medical condition that needs trainer discussion",
      "caller is interested in corporate wellness or group packages",
      "caller wants to cancel or dispute a charge",
      "caller is unhappy with their current trainer"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Studio', description: 'Tell us about your training studio.', fields: [
        { name: 'business_name', label: 'Studio Name', type: 'text', placeholder: 'Peak Performance Training', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 444-5555', required: true },
        { name: 'specialties', label: 'Training specialties', type: 'multiselect', placeholder: '', required: true, options: ['Weight Loss', 'Strength & Muscle Building', 'Sport-Specific Training', 'Post-Rehab/Injury Recovery', 'Senior Fitness', 'Pre/Postnatal', 'Functional Training', 'Bodybuilding/Physique', 'Flexibility/Mobility'] }
      ]},
      { step_number: 2, title: 'Sessions', description: 'How do your sessions work?', fields: [
        { name: 'session_length', label: 'Session length', type: 'select', placeholder: '', required: true, options: ['30 minutes', '45 minutes', '60 minutes', 'Varies'] },
        { name: 'session_types', label: 'Session types', type: 'multiselect', placeholder: '', required: true, options: ['1-on-1 Training', 'Semi-Private (2 people)', 'Small Group (3-4)', 'Online/Virtual Training'] },
        { name: 'starting_price', label: 'Starting per-session price', type: 'currency', placeholder: '65', required: true }
      ]},
      { step_number: 3, title: 'Schedule', description: 'When do you train clients?', fields: [
        { name: 'business_hours', label: 'Training Hours', type: 'time_range', placeholder: '5:30 AM - 8:00 PM', required: true },
        { name: 'weekend_available', label: 'Weekend sessions available?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Getting Started', description: 'How do new clients begin?', fields: [
        { name: 'free_consultation', label: 'Offer a free consultation?', type: 'toggle', placeholder: '', required: true },
        { name: 'assessment_included', label: 'Include a fitness assessment?', type: 'toggle', placeholder: '', required: true, help_text: 'Body composition, movement screening, goal setting' }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-leads', title: 'New Inquiries', description: 'People interested in personal training', priority: 1 },
      { id: 'todays-sessions', title: "Today's Sessions", description: 'Training sessions scheduled today', priority: 2 },
      { id: 'package-renewals', title: 'Packages Expiring', description: 'Clients whose packages are running low', priority: 3 },
      { id: 'no-shows', title: 'Recent No-Shows', description: 'Clients who missed sessions this week', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up with consultation', description: 'Potential client had a consultation but hasn\'t signed up yet.', category: 'leads', difficulty: 'needs-approval' },
      { title: 'Package renewal reminder', description: 'Client has 2 sessions left on their 10-pack.', category: 'upsell', difficulty: 'automatic' },
      { title: 'Session reminder', description: 'Remind client about their training session tomorrow at 6 AM.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Progress check-in', description: 'Client has been training for 4 weeks — schedule a progress assessment.', category: 'client-communication', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Client Consultations', unit: 'per month', description: 'Free consultations scheduled', target_suggestion: 12 },
      { name: 'Consultation-to-Client Rate', unit: 'percent', description: 'Consultations that become paying clients', target_suggestion: 60 },
      { name: 'No-Show Rate', unit: 'percent', description: 'Percentage of sessions that are no-shows', target_suggestion: 5 },
      { name: 'Client Retention', unit: 'percent', description: 'Clients who renew their packages', target_suggestion: 75 }
    ],

    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages the training calendar and avoids double-booking', priority: 'essential' },
      { name: 'Trainerize', slug: 'trainerize', category: 'training', why: 'Delivers workout plans and tracks client progress', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Processes package purchases and recurring payments', priority: 'recommended' },
      { name: 'InBody', slug: 'inbody', category: 'assessment', why: 'Body composition tracking for client progress', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'trainerize', 'stripe', 'inbody'],

    email_templates: [
      { name: 'Consultation Confirmation', subject: 'Your Free Consultation at {{business_name}}', body: "Hi {{client_name}},\n\nYour free consultation is confirmed for {{date}} at {{time}}.\n\nDuring this session, we'll:\n- Discuss your fitness goals\n- Talk about any injuries or limitations\n- Do a quick fitness assessment\n- Match you with the right trainer and program\n\nWear comfortable workout clothes — we may do some light movement.\n\nSee you soon!\n{{business_name}}", trigger: 'consultation_booked' },
      { name: 'Progress Milestone', subject: 'Look How Far You\'ve Come! — {{business_name}}', body: "Hi {{client_name}},\n\nYou've completed {{sessions_completed}} training sessions with us! Here's a look at your progress:\n\n{{progress_summary}}\n\nKeep it up — you're doing amazing things.\n\nYour Trainer,\n{{trainer_name}} at {{business_name}}", trigger: 'progress_milestone' }
    ],
    sms_templates: [
      { name: 'Session Reminder', body: "Hi {{client_name}}, reminder: your training session is tomorrow at {{time}} with {{trainer_name}} at {{business_name}}. See you there!", trigger: 'session_reminder' },
      { name: 'No-Show Follow-Up', body: "Hi {{client_name}}, we missed you at your session today! Everything okay? Let us know if you need to reschedule. Call/text {{phone}}.", trigger: 'no_show' }
    ],

    estimated_hours_saved_weekly: 9,
    estimated_monthly_value: 1900,
    ideal_plan: 'pro',
    competitor_tools: ['Trainerize', 'My PT Hub', 'TrueCoach']
  },

  {
    id: 'pilates-studio',
    industry: 'Fitness & Wellness',
    niche: 'Pilates Studio',
    display_name: 'Pilates Studio',
    emoji: '🤸',
    tagline: 'Fill reformer slots, nurture your community, and grow your studio effortlessly.',

    demo_greeting: "Hi! I'm your AI assistant for a Pilates studio. I can help with class info, equipment classes, pricing, and scheduling. What would you like to know?",
    demo_system_prompt: "You are an AI assistant for a Pilates studio. Help potential clients understand Pilates, the difference between mat and reformer classes, pricing, and how to get started. Be warm and knowledgeable. Emphasize that Pilates is for all fitness levels and is excellent for core strength, flexibility, and injury rehab.",
    demo_suggested_messages: [
      "What's the difference between mat and reformer Pilates?",
      "I've never done Pilates — what should I expect?",
      "Do you offer private sessions?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a Pilates studio. Help clients find the right class and understand the benefits of Pilates. Be warm and knowledgeable. Emphasize: Pilates is for everyone, not just dancers. It's excellent for core strength, posture, flexibility, and rehab. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you interested in trying Pilates, or are you a current client?",
    receptionist_system_prompt: "You are the receptionist for a Pilates studio. Help callers learn about mat vs. reformer classes, private sessions, and pricing. Encourage first-timers to book an intro session. Be warm and professional. For existing clients, help with scheduling.",
    receptionist_faqs: [
      { question: "What's the difference between mat and reformer?", answer: "Mat Pilates uses your body weight and small props on a mat. Reformer Pilates uses a specialized machine that adds resistance with springs — it's a whole different experience. We recommend trying both!", category: "classes" },
      { question: "Is Pilates good for back pain?", answer: "Many people find Pilates very helpful for back pain because it strengthens your core, which supports your spine. We recommend starting with a private session so the instructor can customize the workout to your needs.", category: "benefits" },
      { question: "How much does it cost?", answer: "We have group classes and private sessions at different price points. New clients can take advantage of our intro special to try it out. Would you like to hear about our current offer?", category: "pricing" }
    ],
    receptionist_transfer_triggers: [
      "caller is pregnant and asking about prenatal Pilates",
      "caller has a serious injury or is post-surgical",
      "caller wants to discuss teacher training",
      "caller has a billing dispute"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Studio', description: 'Tell us about your Pilates studio.', fields: [
        { name: 'business_name', label: 'Studio Name', type: 'text', placeholder: 'Core Balance Pilates', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 555-6666', required: true },
        { name: 'class_types', label: 'Class types offered', type: 'multiselect', placeholder: '', required: true, options: ['Mat Pilates', 'Reformer Pilates', 'Tower/Cadillac', 'Chair Pilates', 'Barre', 'Private Sessions', 'Duet Sessions', 'Prenatal Pilates', 'Rehab Pilates'] }
      ]},
      { step_number: 2, title: 'Pricing', description: 'How do clients pay?', fields: [
        { name: 'group_class_rate', label: 'Group class rate', type: 'currency', placeholder: '30', required: true },
        { name: 'private_session_rate', label: 'Private session rate', type: 'currency', placeholder: '85', required: false },
        { name: 'intro_offer', label: 'New client intro offer', type: 'text', placeholder: '3 classes for $75', required: false }
      ]},
      { step_number: 3, title: 'Schedule', description: 'When do you hold classes?', fields: [
        { name: 'business_hours', label: 'Studio Hours', type: 'time_range', placeholder: '6:30 AM - 8:00 PM', required: true },
        { name: 'reformer_count', label: 'Number of reformers', type: 'number', placeholder: '10', required: false, help_text: 'This determines your class capacity' }
      ]},
      { step_number: 4, title: 'Additional Info', description: 'Other details for clients.', fields: [
        { name: 'grip_socks_required', label: 'Grip socks required?', type: 'toggle', placeholder: '', required: true },
        { name: 'grip_socks_sold', label: 'Do you sell grip socks?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-clients', title: 'New Client Inquiries', description: 'People interested in Pilates', priority: 1 },
      { id: 'todays-classes', title: "Today's Schedule", description: 'Classes and availability today', priority: 2 },
      { id: 'waitlist', title: 'Waitlisted Classes', description: 'Full classes with people waiting', priority: 3 },
      { id: 'expiring-packages', title: 'Expiring Packages', description: 'Clients whose class packs expire soon', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Welcome new client', description: 'Send intro email with class recommendations and grip sock reminder.', category: 'onboarding', difficulty: 'automatic' },
      { title: 'Waitlist notification', description: 'Spot opened in reformer class — notify next person on waitlist.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Package renewal', description: 'Client\'s 10-class pack is down to 2 — suggest renewal.', category: 'upsell', difficulty: 'automatic' },
      { title: 'Private session upsell', description: 'Group client might benefit from a private assessment — suggest one.', category: 'upsell', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'New Clients', unit: 'per month', description: 'First-time clients', target_suggestion: 15 },
      { name: 'Class Utilization', unit: 'percent', description: 'Percentage of reformer spots filled', target_suggestion: 80 },
      { name: 'Client Retention', unit: 'percent', description: 'Clients returning after first month', target_suggestion: 60 },
      { name: 'Private Session Bookings', unit: 'per week', description: 'Private/duet sessions booked', target_suggestion: 8 }
    ],

    suggested_integrations: [
      { name: 'Mindbody', slug: 'mindbody', category: 'studio-management', why: 'Manages class bookings, waitlists, and memberships', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Syncs private sessions and instructor schedules', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles class packs and membership billing', priority: 'recommended' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Pilates is visual — reformer videos get great engagement', priority: 'nice-to-have' }
    ],
    integration_priority: ['mindbody', 'google-calendar', 'stripe', 'instagram'],

    email_templates: [
      { name: 'New Client Welcome', subject: 'Welcome to {{business_name}}!', body: "Hi {{client_name}},\n\nWe're so excited to have you!\n\nA few things to know before your first class:\n- Wear fitted, comfortable clothing (loose clothing can get caught in the reformer)\n- {{grip_sock_note}}\n- Arrive 10 minutes early for orientation\n- Avoid a heavy meal right before class\n\nYour first class: {{class_name}} on {{date}} at {{time}}\n\nSee you in the studio!\n{{business_name}}", trigger: 'new_client' },
      { name: 'Package Expiring', subject: 'Your Class Pack is Almost Done — {{business_name}}', body: "Hi {{client_name}},\n\nYou have {{classes_remaining}} class(es) left on your current pack, expiring on {{expiry_date}}.\n\nRenew or upgrade to keep your practice going:\n{{package_options}}\n\nBook your next class: {{booking_link}}\n\n{{business_name}}", trigger: 'package_expiring' }
    ],
    sms_templates: [
      { name: 'Class Reminder', body: "Hi {{client_name}}, your {{class_name}} class at {{business_name}} is tomorrow at {{time}}. Don't forget your grip socks! See you there.", trigger: 'class_reminder' },
      { name: 'Waitlist Spot Open', body: "Great news, {{client_name}}! A spot opened up in the {{class_name}} class on {{date}} at {{time}}. Book it now before it fills again: {{booking_link}}", trigger: 'waitlist_available' }
    ],

    estimated_hours_saved_weekly: 9,
    estimated_monthly_value: 1900,
    ideal_plan: 'pro',
    competitor_tools: ['Mindbody', 'Momoyoga', 'Mariana Tek']
  },

  {
    id: 'crossfit-box',
    industry: 'Fitness & Wellness',
    niche: 'CrossFit Box',
    display_name: 'CrossFit Box',
    emoji: '🏅',
    tagline: 'Grow your box with more members, better retention, and a stronger community.',

    demo_greeting: "Hi! I'm your AI assistant for a CrossFit box. I can help with info about classes, On-Ramp programs, pricing, and what to expect. How can I help?",
    demo_system_prompt: "You are an AI assistant for a CrossFit box. Help potential members learn about classes, the On-Ramp/Foundations program, and what to expect. Be encouraging — many people are intimidated by CrossFit. Emphasize that workouts are scaled to every fitness level. Community is a huge selling point.",
    demo_suggested_messages: [
      "I'm out of shape — is CrossFit for me?",
      "What's an On-Ramp program?",
      "How much does CrossFit cost?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a CrossFit box. Help potential members learn about the community and get started. Be encouraging and welcoming. Many people are intimidated by CrossFit — emphasize that ALL workouts are scaled to each person's ability. Nobody starts at the top. Community and coaching are what set CrossFit apart. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you interested in trying CrossFit, or are you a current member?",
    receptionist_system_prompt: "You are the receptionist for a CrossFit box. Help callers learn about the On-Ramp program, class schedule, and pricing. Be enthusiastic but not aggressive. Address the #1 concern: 'I'm not fit enough for CrossFit.' Answer: every workout is scaled. Schedule them for a free intro class or On-Ramp.",
    receptionist_faqs: [
      { question: "I'm not fit enough for CrossFit", answer: "That's actually the most common thing we hear — and it's never true! Every workout is scaled to your ability. Our coaches modify every movement so you get a great workout at YOUR level. Come try a free intro class and see for yourself.", category: "beginners" },
      { question: "What's On-Ramp?", answer: "On-Ramp is our foundations program for new members. Over a few sessions, you'll learn all the basic movements with a coach before joining regular classes. It's designed to get you comfortable and confident.", category: "onboarding" },
      { question: "How much does it cost?", answer: "We have unlimited membership options. It's more than a regular gym because you get coached every session — it's like having a personal trainer in a group setting. Come try a free class and we'll walk you through the options.", category: "pricing" }
    ],
    receptionist_transfer_triggers: [
      "caller asks about competition or CrossFit Games training",
      "caller wants to discuss a group or corporate rate",
      "caller has a serious injury concern",
      "caller wants to cancel their membership"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Box', description: 'Tell us about your CrossFit box.', fields: [
        { name: 'business_name', label: 'Box Name', type: 'text', placeholder: 'CrossFit Iron Forge', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 666-7777', required: true },
        { name: 'programs', label: 'Programs offered', type: 'multiselect', placeholder: '', required: true, options: ['CrossFit Classes', 'On-Ramp/Foundations', 'Open Gym', 'Olympic Lifting', 'Gymnastics', 'Endurance', 'Competition Team', 'Kids/Teens', 'Masters (50+)'] }
      ]},
      { step_number: 2, title: 'Memberships', description: 'What do you charge?', fields: [
        { name: 'unlimited_price', label: 'Unlimited monthly membership', type: 'currency', placeholder: '175', required: true },
        { name: 'onramp_price', label: 'On-Ramp program price', type: 'currency', placeholder: '200', required: false },
        { name: 'drop_in_rate', label: 'Drop-in rate', type: 'currency', placeholder: '25', required: false }
      ]},
      { step_number: 3, title: 'Schedule', description: 'When do you hold classes?', fields: [
        { name: 'business_hours', label: 'Class Hours', type: 'time_range', placeholder: '5:30 AM - 7:30 PM', required: true },
        { name: 'classes_per_day', label: 'Classes per day', type: 'number', placeholder: '7', required: false }
      ]},
      { step_number: 4, title: 'Community', description: 'What makes your box special?', fields: [
        { name: 'free_intro', label: 'Offer a free intro class?', type: 'toggle', placeholder: '', required: true },
        { name: 'social_events', label: 'Community events', type: 'multiselect', placeholder: '', required: false, options: ['Friday Night Lights', 'Monthly Socials', 'In-House Competitions', 'Charity WODs', 'Bring a Friend Day'] }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-leads', title: 'New Inquiries', description: 'People interested in joining', priority: 1 },
      { id: 'onramp-progress', title: 'On-Ramp Progress', description: 'New members in the foundations program', priority: 2 },
      { id: 'class-attendance', title: 'Class Attendance', description: 'Today\'s WOD attendance by time slot', priority: 3 },
      { id: 'at-risk', title: 'At-Risk Members', description: 'Members whose attendance dropped this month', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up after intro class', description: 'New visitor tried a class — send follow-up and On-Ramp info.', category: 'leads', difficulty: 'automatic' },
      { title: 'On-Ramp completion congratulations', description: 'Member finished On-Ramp — welcome them to regular classes.', category: 'onboarding', difficulty: 'automatic' },
      { title: 'Attendance drop check-in', description: 'Member went from 4x/week to 1x/week — send encouraging check-in.', category: 'retention', difficulty: 'needs-approval' },
      { title: 'Bring a Friend Day promo', description: 'Announce upcoming Bring a Friend Day to all members.', category: 'events', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Members', unit: 'per month', description: 'People who join after On-Ramp', target_suggestion: 8 },
      { name: 'Monthly Retention', unit: 'percent', description: 'Members who stay month-over-month', target_suggestion: 95 },
      { name: 'Average Class Size', unit: 'people', description: 'Average attendance per class', target_suggestion: 12 },
      { name: 'Intro-to-Join Rate', unit: 'percent', description: 'Free intro visitors who sign up', target_suggestion: 50 }
    ],

    suggested_integrations: [
      { name: 'Wodify', slug: 'wodify', category: 'box-management', why: 'Built for CrossFit — tracks WODs, PRs, and memberships', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages intro appointments and special events', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles monthly memberships and drop-in payments', priority: 'recommended' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Share WOD results, member highlights, and community moments', priority: 'recommended' }
    ],
    integration_priority: ['wodify', 'google-calendar', 'stripe', 'instagram'],

    email_templates: [
      { name: 'Free Intro Confirmation', subject: 'Your Free Intro at {{business_name}}!', body: "Hi {{client_name}},\n\nWe're pumped to have you try CrossFit!\n\nYour intro class: {{date}} at {{time}}\n\nWhat to bring:\n- Water bottle\n- Comfortable workout clothes and sneakers\n- A good attitude — that's it!\n\nDon't worry about your fitness level. Everything is scaled, and our coaches will guide you through every movement.\n\nSee you there!\n{{business_name}}", trigger: 'intro_booked' },
      { name: 'On-Ramp Welcome', subject: 'Welcome to On-Ramp — Your CrossFit Journey Starts Now!', body: "Hi {{client_name}},\n\nWelcome to the {{business_name}} family! Your On-Ramp program starts {{date}}.\n\nOver the next {{onramp_sessions}} sessions, you'll learn:\n- Fundamental movements (squat, deadlift, press, etc.)\n- Proper form and scaling options\n- How to read the WOD board\n- What all those acronyms mean (AMRAP, EMOM, RX...)\n\nBy the end, you'll feel confident jumping into any class.\n\nLet's go!\n{{business_name}}", trigger: 'onramp_enrolled' }
    ],
    sms_templates: [
      { name: 'Intro Reminder', body: "Hey {{client_name}}! Your free intro class at {{business_name}} is tomorrow at {{time}}. Bring water and comfy shoes. We'll handle the rest. See you there!", trigger: 'intro_reminder' },
      { name: 'WOD of the Day', body: "Today's WOD at {{business_name}}: {{wod_name}}. Which class are you hitting? Check the schedule: {{schedule_link}}", trigger: 'daily_wod' }
    ],

    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
    competitor_tools: ['Wodify', 'SugarWOD', 'Zen Planner']
  },

  {
    id: 'dance-studio',
    industry: 'Fitness & Wellness',
    niche: 'Dance Studio',
    display_name: 'Dance Studio',
    emoji: '💃',
    tagline: 'Fill your classes, manage recitals, and keep dancers and parents in the loop.',

    demo_greeting: "Hi! I'm your AI assistant for a dance studio. I can help with class info, registration, recital details, and more. How can I help?",
    demo_system_prompt: "You are an AI assistant for a dance studio. Help potential students (or their parents) learn about dance styles, class levels, registration, and recital schedules. Be warm and enthusiastic. For kids' classes, address parent questions about age groups, what to wear, and costs.",
    demo_suggested_messages: [
      "What dance classes do you offer for 5-year-olds?",
      "Do you have adult dance classes?",
      "When is the next recital?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a dance studio. Help students and parents with class info, registration, and recital details. Be warm and enthusiastic about dance. For children's classes, communicate primarily with parents. Make registration easy and welcoming. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}! I'm the virtual assistant. Are you interested in dance classes, or are you calling about an existing student?",
    receptionist_system_prompt: "You are the receptionist for a dance studio. Determine if the caller is looking for child or adult classes. For kids: get the child's age, any dance experience, and styles of interest. For adults: get their experience level and interests. Help with registration, class schedules, and recital info.",
    receptionist_faqs: [
      { question: "What age do you start?", answer: "We have classes for dancers as young as 3! Our youngest classes focus on movement, rhythm, and having fun — no prior experience needed.", category: "kids" },
      { question: "What do they need to wear?", answer: "For the first class, comfortable clothes that allow movement are fine. Once enrolled, we'll provide a dress code for each class — typically a leotard, tights, and appropriate dance shoes.", category: "attire" },
      { question: "When are recitals?", answer: "We hold our main recital in June, with a winter showcase in December. Participation is optional but always a wonderful experience for the dancers and their families.", category: "recitals" },
      { question: "Can adults take classes too?", answer: "Absolutely! We have adult classes in several styles. Many of our adult students had never danced before — it's never too late to start!", category: "adults" }
    ],
    receptionist_transfer_triggers: [
      "caller asks about competitive dance team",
      "caller wants to discuss a costume or recital refund",
      "caller asks about private lessons for a wedding",
      "caller has a child with special needs"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Studio', description: 'Tell us about your dance studio.', fields: [
        { name: 'business_name', label: 'Studio Name', type: 'text', placeholder: 'Rhythm & Grace Dance Studio', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 777-8888', required: true },
        { name: 'dance_styles', label: 'Dance styles taught', type: 'multiselect', placeholder: '', required: true, options: ['Ballet', 'Jazz', 'Tap', 'Hip Hop', 'Contemporary', 'Lyrical', 'Acro', 'Musical Theater', 'Ballroom', 'Salsa/Latin', 'Irish Dance', 'Breakdancing'] }
      ]},
      { step_number: 2, title: 'Students', description: 'Who do you teach?', fields: [
        { name: 'age_groups', label: 'Age groups', type: 'multiselect', placeholder: '', required: true, options: ['Tiny Tots (3-4)', 'Mini (5-7)', 'Junior (8-10)', 'Pre-Teen (11-13)', 'Teen (14-17)', 'Adult (18+)'] },
        { name: 'levels', label: 'Levels offered', type: 'multiselect', placeholder: '', required: true, options: ['Beginner', 'Intermediate', 'Advanced', 'Pre-Professional', 'Recreational Only'] },
        { name: 'competition_team', label: 'Do you have a competition team?', type: 'toggle', placeholder: '', required: false }
      ]},
      { step_number: 3, title: 'Schedule & Pricing', description: 'Class schedule and tuition info.', fields: [
        { name: 'business_hours', label: 'Studio Hours', type: 'time_range', placeholder: '3:00 PM - 9:00 PM', required: true },
        { name: 'monthly_tuition_start', label: 'Starting monthly tuition (1 class/week)', type: 'currency', placeholder: '65', required: true }
      ]},
      { step_number: 4, title: 'Events', description: 'Recitals and performances.', fields: [
        { name: 'recital_month', label: 'Main recital month', type: 'select', placeholder: '', required: false, options: ['May', 'June', 'July', 'December'] },
        { name: 'registration_open', label: 'Is registration currently open?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-registrations', title: 'New Registrations', description: 'Families interested in enrolling', priority: 1 },
      { id: 'class-enrollment', title: 'Class Enrollment', description: 'Current enrollment by class', priority: 2 },
      { id: 'recital-prep', title: 'Recital Countdown', description: 'Days until recital and prep checklist', priority: 3 },
      { id: 'tuition-due', title: 'Tuition Due', description: 'Outstanding tuition payments', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Follow up with new inquiry', description: 'Mom called about ballet classes for her 6-year-old — send class schedule.', category: 'leads', difficulty: 'automatic' },
      { title: 'Costume order reminder', description: 'Recital costume orders due this Friday — remind parents who haven\'t ordered.', category: 'recital', difficulty: 'automatic' },
      { title: 'Tuition reminder', description: 'Monthly tuition due in 3 days — send friendly reminder to outstanding accounts.', category: 'billing', difficulty: 'automatic' },
      { title: 'Summer camp promotion', description: 'Announce summer dance camp registration to current families.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'New Enrollments', unit: 'per month', description: 'New students registered', target_suggestion: 10 },
      { name: 'Retention Rate', unit: 'percent', description: 'Students who re-enroll each season', target_suggestion: 85 },
      { name: 'Classes at Capacity', unit: 'percent', description: 'Percentage of classes that are full', target_suggestion: 75 },
      { name: 'Tuition Collection Rate', unit: 'percent', description: 'On-time tuition payments', target_suggestion: 95 }
    ],

    suggested_integrations: [
      { name: 'DanceStudio-Pro', slug: 'dancestudio-pro', category: 'studio-management', why: 'Built for dance — handles registration, tuition, and costumes', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages class schedules and recital rehearsals', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Processes tuition and costume payments', priority: 'recommended' },
      { name: 'Facebook', slug: 'facebook', category: 'social', why: 'Parents share recital photos — great for word-of-mouth', priority: 'nice-to-have' }
    ],
    integration_priority: ['dancestudio-pro', 'google-calendar', 'stripe', 'facebook'],

    email_templates: [
      { name: 'Registration Confirmation', subject: 'Welcome to {{business_name}}!', body: "Hi {{parent_name}},\n\nWe're so excited to welcome {{student_name}} to {{business_name}}!\n\nClass: {{class_name}}\nDay/Time: {{schedule}}\nStart Date: {{start_date}}\n\nWhat to wear: {{dress_code}}\nWhat to bring: Water bottle and a smile!\n\nPlease arrive 10 minutes early on the first day.\n\nWelcome to the family!\n{{business_name}}", trigger: 'registration_complete' },
      { name: 'Recital Info', subject: 'Recital Details — Mark Your Calendar!', body: "Hi {{parent_name}},\n\nOur annual recital is coming up! Here are the details:\n\nDate: {{recital_date}}\nVenue: {{venue}}\nCall Time: {{call_time}}\nShow Time: {{show_time}}\n\nCostume pickup: {{costume_date}}\nDress rehearsal: {{rehearsal_date}}\n\nTicket info: {{ticket_link}}\n\nWe can't wait to see {{student_name}} shine on stage!\n\n{{business_name}}", trigger: 'recital_announcement' }
    ],
    sms_templates: [
      { name: 'Class Reminder', body: "Hi {{parent_name}}, reminder: {{student_name}}'s {{class_name}} class is tomorrow at {{time}} at {{business_name}}. Don't forget dance shoes!", trigger: 'class_reminder' },
      { name: 'Costume Order Deadline', body: "Reminder: Recital costume orders for {{student_name}}'s class are due {{deadline}}. Order here: {{order_link}} or call {{phone}}.", trigger: 'costume_deadline' }
    ],

    estimated_hours_saved_weekly: 11,
    estimated_monthly_value: 2200,
    ideal_plan: 'pro',
    competitor_tools: ['DanceStudio-Pro', 'Jackrabbit Dance', 'ClassJuggler']
  },

  {
    id: 'swim-school',
    industry: 'Fitness & Wellness',
    niche: 'Swim School',
    display_name: 'Swim School',
    emoji: '🏊',
    tagline: 'Keep your pool full with easy scheduling, level-up notifications, and parent communication.',

    demo_greeting: "Hi! I'm your AI assistant for a swim school. I can help with class levels, scheduling, and what to expect for your child's first lesson. How can I help?",
    demo_system_prompt: "You are an AI assistant for a swim school. Help parents learn about swim levels, class options, and what to bring. Emphasize water safety — drowning prevention is a core mission. Be warm and reassuring, especially for nervous parents enrolling very young children.",
    demo_suggested_messages: [
      "What age can my child start swim lessons?",
      "What level is right for my child?",
      "Do you teach adults too?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a swim school. Help parents find the right class for their child and understand the swim level progression. Emphasize water safety as a life skill. Be warm and reassuring — some parents are nervous. For adult lessons, be encouraging and non-judgmental. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you looking for swim lessons for a child or an adult?",
    receptionist_system_prompt: "You are the receptionist for a swim school. For parents: get the child's age, any swim experience, and comfort level in water. Recommend the right level and schedule a trial. For adults: get their experience level and goals. Emphasize water safety for young children. Be warm and patient.",
    receptionist_faqs: [
      { question: "What age do you start?", answer: "We have parent-and-me classes starting at 6 months! For independent lessons (without a parent in the water), we typically start at age 3. The earlier children learn water safety, the better.", category: "ages" },
      { question: "How long until my child can swim?", answer: "Every child is different, but most kids progress through our beginner levels in 2-3 sessions of lessons. Our instructors will move your child up as soon as they're ready — you'll get a progress report after each session.", category: "progress" },
      { question: "Is the pool warm?", answer: "Yes! Our pool is heated to 88-90°F, which is comfortable for even our youngest swimmers. It's much warmer than a typical pool.", category: "facility" },
      { question: "What do we need to bring?", answer: "A swimsuit, towel, and goggles (optional for beginners). For babies and toddlers, a swim diaper is required. We provide everything else!", category: "preparation" }
    ],
    receptionist_transfer_triggers: [
      "caller asks about private lessons for a child with special needs",
      "caller is interested in a swim team or competitive program",
      "caller wants to discuss a make-up lesson policy",
      "caller reports a safety concern"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Swim School', description: 'Tell us about your facility.', fields: [
        { name: 'business_name', label: 'Swim School Name', type: 'text', placeholder: 'AquaKids Swim School', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 888-9999', required: true },
        { name: 'programs', label: 'Programs offered', type: 'multiselect', placeholder: '', required: true, options: ['Parent & Me (6mo-3yr)', 'Preschool (3-5)', 'School Age (6-12)', 'Teen Lessons', 'Adult Lessons', 'Private Lessons', 'Swim Team Prep', 'Water Safety/Survival Skills'] }
      ]},
      { step_number: 2, title: 'Facility', description: 'About your pool.', fields: [
        { name: 'pool_temp', label: 'Pool temperature', type: 'text', placeholder: '88-90°F', required: false },
        { name: 'pool_type', label: 'Pool type', type: 'select', placeholder: '', required: true, options: ['Indoor heated', 'Outdoor (seasonal)', 'Indoor & Outdoor'] },
        { name: 'max_class_size', label: 'Max students per class', type: 'number', placeholder: '4', required: true }
      ]},
      { step_number: 3, title: 'Schedule & Pricing', description: 'Lesson times and costs.', fields: [
        { name: 'business_hours', label: 'Lesson Hours', type: 'time_range', placeholder: '9:00 AM - 7:00 PM', required: true },
        { name: 'session_length', label: 'Session length', type: 'select', placeholder: '', required: true, options: ['4 weeks', '6 weeks', '8 weeks', 'Monthly ongoing'] },
        { name: 'starting_price', label: 'Starting price per session', type: 'currency', placeholder: '120', required: true }
      ]},
      { step_number: 4, title: 'Policies', description: 'Important info for families.', fields: [
        { name: 'makeup_policy', label: 'Make-up lesson policy', type: 'select', placeholder: '', required: true, options: ['1 make-up per session', '2 make-ups per session', 'Unlimited make-ups', 'No make-ups (credit only)'] },
        { name: 'viewing_area', label: 'Parent viewing area available?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-enrollments', title: 'New Enrollments', description: 'Families signing up for lessons', priority: 1 },
      { id: 'todays-lessons', title: "Today's Lessons", description: 'Lesson schedule and attendance', priority: 2 },
      { id: 'level-ups', title: 'Level-Up Ready', description: 'Students ready to advance', priority: 3 },
      { id: 'session-renewals', title: 'Session Renewals', description: 'Families due to re-enroll', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Welcome new family', description: 'Send new family what to bring, pool rules, and first lesson details.', category: 'onboarding', difficulty: 'automatic' },
      { title: 'Level-up notification', description: 'Student passed Level 2 — notify parents and enroll in Level 3.', category: 'student-progress', difficulty: 'automatic' },
      { title: 'Session renewal reminder', description: 'Current session ends next week — remind family to re-enroll.', category: 'retention', difficulty: 'automatic' },
      { title: 'Progress report', description: 'Send weekly progress update to parents about their child\'s skills.', category: 'communication', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Enrollments', unit: 'per month', description: 'New families signing up', target_suggestion: 15 },
      { name: 'Re-Enrollment Rate', unit: 'percent', description: 'Families who sign up for the next session', target_suggestion: 80 },
      { name: 'Class Fill Rate', unit: 'percent', description: 'Percentage of spots filled', target_suggestion: 90 },
      { name: 'Level Advancement Rate', unit: 'percent', description: 'Students who advance each session', target_suggestion: 70 }
    ],

    suggested_integrations: [
      { name: 'Jackrabbit', slug: 'jackrabbit', category: 'swim-management', why: 'Purpose-built for swim schools — class management and billing', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Syncs lesson times for families and instructors', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles session payments and auto-renewals', priority: 'recommended' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Parents search "swim lessons near me" — be visible', priority: 'nice-to-have' }
    ],
    integration_priority: ['jackrabbit', 'google-calendar', 'stripe', 'google-business'],

    email_templates: [
      { name: 'Welcome to Swim School', subject: 'Welcome to {{business_name}} — First Lesson Info!', body: "Hi {{parent_name}},\n\nWe're excited to welcome {{student_name}} to the pool!\n\nFirst Lesson: {{date}} at {{time}}\nLevel: {{level}}\nInstructor: {{instructor}}\n\nWhat to bring:\n- Swimsuit (one-piece recommended for girls)\n- Towel\n- Goggles (optional)\n- Swim diaper (required for children not potty-trained)\n\nArrive 10 minutes early. Our viewing area is available for parents.\n\nSee you poolside!\n{{business_name}}", trigger: 'enrollment_complete' },
      { name: 'Level-Up Celebration', subject: '🎉 {{student_name}} Passed to the Next Level!', body: "Hi {{parent_name}},\n\nGreat news — {{student_name}} has mastered all the skills in {{current_level}} and is moving up to {{next_level}}!\n\nSkills achieved:\n{{skills_list}}\n\nThe next session of {{next_level}} starts {{start_date}}. Would you like to enroll?\n\nWe're so proud of {{student_name}}'s progress!\n{{business_name}}", trigger: 'level_up' }
    ],
    sms_templates: [
      { name: 'Lesson Reminder', body: "Hi {{parent_name}}, {{student_name}}'s swim lesson at {{business_name}} is tomorrow at {{time}}. Don't forget: swimsuit, towel, and goggles!", trigger: 'lesson_reminder' },
      { name: 'Re-Enrollment Deadline', body: "Hi {{parent_name}}, the next session at {{business_name}} starts {{start_date}}. Enroll {{student_name}} now to keep their spot: {{enrollment_link}}", trigger: 'session_ending' }
    ],

    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2000,
    ideal_plan: 'pro',
    competitor_tools: ['Jackrabbit', 'iClassPro', 'SwimDesk']
  },

  {
    id: 'cycling-studio',
    industry: 'Fitness & Wellness',
    niche: 'Cycling / Spin Studio',
    display_name: 'Cycling Studio',
    emoji: '🚴',
    tagline: 'Fill every bike, build your rider community, and keep members spinning back.',

    demo_greeting: "Hi! I'm your AI assistant for a cycling studio. I can help with class schedules, pricing, and what to expect at your first ride. What can I help with?",
    demo_system_prompt: "You are an AI assistant for an indoor cycling / spin studio. Help potential riders learn about class types, pricing, and what to expect. Be energetic and welcoming. Emphasize that classes are for ALL fitness levels — you control your own resistance.",
    demo_suggested_messages: [
      "I've never done a spin class — what should I expect?",
      "What types of cycling classes do you offer?",
      "Do I need special shoes?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a cycling studio. Help riders find the right class and get started. Be energetic and welcoming. Emphasize that every rider controls their own intensity — no one can see your resistance. First-timers should arrive early for bike setup. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you interested in riding with us, or are you a current member?",
    receptionist_system_prompt: "You are the receptionist for a cycling studio. Help callers with class schedules, pricing, and first-ride info. For new riders: explain what to expect, suggest arriving early for bike setup, and mention the intro offer. Be energetic and welcoming.",
    receptionist_faqs: [
      { question: "I've never done spin before", answer: "No worries at all! Just arrive 15 minutes early and our staff will set up your bike, show you the controls, and make sure you're comfortable before class starts. You control your own resistance, so go at your own pace.", category: "beginners" },
      { question: "Do I need cycling shoes?", answer: "We have bikes that work with both regular sneakers and clip-in cycling shoes. If you have cycling shoes, great! If not, sneakers work perfectly fine.", category: "gear" },
      { question: "How much does it cost?", answer: "We have drop-in rates, class packs, and unlimited memberships. New riders can take advantage of our intro special. Would you like to hear about it?", category: "pricing" }
    ],
    receptionist_transfer_triggers: [
      "caller wants to book a private or corporate event",
      "caller has a billing dispute",
      "caller reports equipment malfunction",
      "caller wants to discuss instructor scheduling"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Studio', description: 'Tell us about your cycling studio.', fields: [
        { name: 'business_name', label: 'Studio Name', type: 'text', placeholder: 'Pedal House Cycling', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 999-0000', required: true },
        { name: 'class_types', label: 'Class types', type: 'multiselect', placeholder: '', required: true, options: ['Rhythm Ride', 'Endurance', 'HIIT Cycling', 'Climb', 'Theme Rides', 'Beginner', 'Low-Impact', 'Cycle & Strength Combo'] }
      ]},
      { step_number: 2, title: 'Pricing', description: 'How do riders pay?', fields: [
        { name: 'drop_in_rate', label: 'Drop-in rate', type: 'currency', placeholder: '28', required: true },
        { name: 'intro_offer', label: 'New rider intro offer', type: 'text', placeholder: 'First ride free', required: false },
        { name: 'unlimited_price', label: 'Unlimited monthly', type: 'currency', placeholder: '179', required: false }
      ]},
      { step_number: 3, title: 'Studio Details', description: 'Your setup.', fields: [
        { name: 'business_hours', label: 'Studio Hours', type: 'time_range', placeholder: '6:00 AM - 8:00 PM', required: true },
        { name: 'bike_count', label: 'Number of bikes', type: 'number', placeholder: '30', required: true },
        { name: 'shoe_rental', label: 'Offer cycling shoe rentals?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Amenities', description: 'What do you provide?', fields: [
        { name: 'amenities', label: 'Amenities', type: 'multiselect', placeholder: '', required: false, options: ['Showers', 'Lockers', 'Towel Service', 'Water Bottles for Sale', 'Retail Shop', 'Smoothie Bar'] }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-riders', title: 'New Rider Signups', description: 'First-time riders this week', priority: 1 },
      { id: 'class-bookings', title: "Today's Bookings", description: 'Bikes booked vs. available per class', priority: 2 },
      { id: 'waitlist', title: 'Waitlisted Classes', description: 'Full classes with riders waiting', priority: 3 },
      { id: 'retention', title: 'Rider Retention', description: 'Members who haven\'t booked recently', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Welcome new rider', description: 'First-timer booked a class — send what-to-expect email.', category: 'onboarding', difficulty: 'automatic' },
      { title: 'Post-first-ride follow-up', description: 'New rider took their first class — ask how it went and share the intro package.', category: 'leads', difficulty: 'automatic' },
      { title: 'Milestone celebration', description: 'Rider hit 50 rides — send congratulations.', category: 'retention', difficulty: 'automatic' },
      { title: 'Class pack expiring', description: 'Rider has 1 class left on their pack — suggest renewal.', category: 'upsell', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Riders', unit: 'per month', description: 'First-time riders', target_suggestion: 25 },
      { name: 'Bike Utilization', unit: 'percent', description: 'Average bikes filled per class', target_suggestion: 75 },
      { name: 'Rider Retention', unit: 'percent', description: 'Riders who return after first month', target_suggestion: 50 },
      { name: 'Revenue Per Rider', unit: 'dollars/month', description: 'Average monthly spend per active rider', target_suggestion: 120 }
    ],

    suggested_integrations: [
      { name: 'Mindbody', slug: 'mindbody', category: 'studio-management', why: 'Manages class bookings, waitlists, and memberships', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Syncs class schedule for riders', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles class packs and memberships', priority: 'recommended' },
      { name: 'Spotify', slug: 'spotify', category: 'experience', why: 'Share instructor playlists to build community', priority: 'nice-to-have' }
    ],
    integration_priority: ['mindbody', 'google-calendar', 'stripe', 'spotify'],

    email_templates: [
      { name: 'First Ride Welcome', subject: 'Your First Ride at {{business_name}} — Here\'s What to Know!', body: "Hi {{client_name}},\n\nWe're so excited for your first ride!\n\nClass: {{class_name}} on {{date}} at {{time}}\n\nWhat to know:\n- Arrive 15 minutes early for bike setup\n- Wear workout clothes and sneakers (or cycling shoes)\n- Bring a water bottle — you'll need it!\n- You control your own resistance — go at your own pace\n\nDon't stress — our instructors take care of first-timers.\n\nLet's ride!\n{{business_name}}", trigger: 'first_ride_booked' },
      { name: 'Milestone Celebration', subject: 'You Hit {{milestone}} Rides! 🎉', body: "Hi {{client_name}},\n\nCongratulations — you just completed your {{milestone}}th ride at {{business_name}}!\n\nThat's an incredible accomplishment. Your dedication inspires everyone in the studio.\n\nKeep crushing it!\n{{business_name}}", trigger: 'ride_milestone' }
    ],
    sms_templates: [
      { name: 'Class Reminder', body: "Hey {{client_name}}, your {{class_name}} class at {{business_name}} is tomorrow at {{time}}. Arrive 10 min early. Bring water! 🚴", trigger: 'class_reminder' },
      { name: 'Waitlist Spot', body: "A bike just opened up in {{class_name}} on {{date}} at {{time}} at {{business_name}}! Book now before it's gone: {{booking_link}}", trigger: 'waitlist_available' }
    ],

    estimated_hours_saved_weekly: 9,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
    competitor_tools: ['Mindbody', 'Mariana Tek', 'Vagaro']
  },

  {
    id: 'wellness-center',
    industry: 'Fitness & Wellness',
    niche: 'Wellness Center',
    display_name: 'Wellness Center',
    emoji: '🌿',
    tagline: 'Coordinate holistic services, fill appointments, and nurture long-term client relationships.',

    demo_greeting: "Hi! I'm your AI assistant for a wellness center. We offer a variety of holistic services. I can help you find the right practitioner, book an appointment, or answer questions. How can I help?",
    demo_system_prompt: "You are an AI assistant for a holistic wellness center offering multiple services like acupuncture, massage, nutrition counseling, and more. Help clients find the right service for their needs and book appointments. Be warm, calm, and knowledgeable. Never make medical claims or diagnose conditions.",
    demo_suggested_messages: [
      "I'm stressed out — what services would help?",
      "Do you offer acupuncture?",
      "What's the difference between your massage types?"
    ],

    soul_template: "You are the AI assistant for {{business_name}}, a holistic wellness center. Help clients find the right service and practitioner for their needs. Be warm, calm, and holistic in your approach. NEVER make medical claims, diagnose conditions, or recommend stopping medical treatment. Wellness services complement — they don't replace — medical care. Business hours: {{business_hours}}. Phone: {{phone}}.",

    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. What are you looking for help with today?",
    receptionist_system_prompt: "You are the receptionist for a holistic wellness center. Help callers understand the services offered and find the right practitioner. Gather: what they're looking for help with, any experience with wellness services, and scheduling preferences. Book appointments. Never make medical claims or diagnose.",
    receptionist_faqs: [
      { question: "What services do you offer?", answer: "We offer a variety of holistic services including massage therapy, acupuncture, nutrition counseling, reiki, naturopathic medicine, and more. What are you looking to address? I can recommend the best service for your needs.", category: "services" },
      { question: "Do you take insurance?", answer: "Some of our services may be covered by insurance, depending on your plan and the practitioner. We recommend checking with your insurance company. We can provide receipts with the codes your insurer needs.", category: "insurance" },
      { question: "What should I expect on my first visit?", answer: "Your first visit will include a thorough intake where the practitioner learns about your health history and goals. Plan for about 90 minutes for the first visit. Wear comfortable clothing.", category: "first-visit" }
    ],
    receptionist_transfer_triggers: [
      "caller describes a medical emergency",
      "caller wants to discuss a specific treatment plan",
      "caller asks about practitioner credentials",
      "caller is unhappy with a service"
    ],

    wizard_steps: [
      { step_number: 1, title: 'Your Center', description: 'Tell us about your wellness center.', fields: [
        { name: 'business_name', label: 'Center Name', type: 'text', placeholder: 'Harmony Wellness Center', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 000-1111', required: true },
        { name: 'services', label: 'Services offered', type: 'multiselect', placeholder: '', required: true, options: ['Massage Therapy', 'Acupuncture', 'Chiropractic', 'Nutrition Counseling', 'Naturopathic Medicine', 'Reiki/Energy Work', 'Yoga/Meditation', 'Functional Medicine', 'IV Therapy', 'Float Therapy', 'Infrared Sauna', 'Life Coaching'] }
      ]},
      { step_number: 2, title: 'Practitioners', description: 'Who works at your center?', fields: [
        { name: 'practitioner_count', label: 'Number of practitioners', type: 'number', placeholder: '5', required: true },
        { name: 'accepts_insurance', label: 'Do any services accept insurance?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 3, title: 'Hours & Pricing', description: 'When are you open and how do you charge?', fields: [
        { name: 'business_hours', label: 'Center Hours', type: 'time_range', placeholder: '9:00 AM - 7:00 PM', required: true },
        { name: 'appointment_types', label: 'Appointment lengths', type: 'multiselect', placeholder: '', required: true, options: ['30 minutes', '60 minutes', '90 minutes', '120 minutes'] }
      ]},
      { step_number: 4, title: 'New Clients', description: 'How do new clients get started?', fields: [
        { name: 'new_client_process', label: 'New client process', type: 'select', placeholder: '', required: true, options: ['Book directly online', 'Free phone consultation first', 'In-person consultation required'] },
        { name: 'intake_forms', label: 'Online intake forms available?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],

    dashboard_widgets: [
      { id: 'new-clients', title: 'New Client Inquiries', description: 'People interested in services', priority: 1 },
      { id: 'todays-appointments', title: "Today's Schedule", description: 'Appointments across all practitioners', priority: 2 },
      { id: 'practitioner-availability', title: 'Practitioner Availability', description: 'Open slots this week by provider', priority: 3 },
      { id: 'follow-up-due', title: 'Follow-Up Appointments Due', description: 'Clients due for their next visit', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Respond to new inquiry', description: 'Potential client asked about acupuncture for back pain — recommend a practitioner.', category: 'leads', difficulty: 'automatic' },
      { title: 'Follow-up appointment reminder', description: 'Client is due for their monthly massage — send booking reminder.', category: 'retention', difficulty: 'automatic' },
      { title: 'New client intake forms', description: 'Send intake forms to new client before their first appointment.', category: 'onboarding', difficulty: 'automatic' },
      { title: 'Seasonal wellness promotion', description: 'Promote stress-relief package during busy holiday season.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'New Clients', unit: 'per month', description: 'First-time clients', target_suggestion: 20 },
      { name: 'Practitioner Utilization', unit: 'percent', description: 'Percentage of available appointment slots booked', target_suggestion: 75 },
      { name: 'Client Return Rate', unit: 'percent', description: 'Clients who book a second appointment', target_suggestion: 65 },
      { name: 'Revenue Per Client', unit: 'dollars/month', description: 'Average monthly spend per active client', target_suggestion: 150 }
    ],

    suggested_integrations: [
      { name: 'Jane App', slug: 'jane-app', category: 'practice-management', why: 'Built for health & wellness — scheduling, charting, billing', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Coordinates multiple practitioners\' schedules', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Processes payments and handles packages/memberships', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Sends wellness tips and seasonal promotions', priority: 'nice-to-have' }
    ],
    integration_priority: ['jane-app', 'google-calendar', 'stripe', 'mailchimp'],

    email_templates: [
      { name: 'New Client Welcome', subject: 'Welcome to {{business_name}} — Your First Visit', body: "Hi {{client_name}},\n\nWe're looking forward to seeing you!\n\nYour appointment: {{service}} with {{practitioner}} on {{date}} at {{time}}\n\nBefore your visit:\n- Please complete your intake forms: {{intake_link}}\n- Wear comfortable, loose clothing\n- Avoid eating a heavy meal right before your appointment\n- Plan to arrive 10 minutes early\n\nFirst visits are typically {{duration}} to allow time for a thorough intake.\n\nSee you soon,\n{{business_name}}", trigger: 'first_appointment' },
      { name: 'Follow-Up Reminder', subject: "Time for Your Next Visit — {{business_name}}", body: "Hi {{client_name}},\n\nIt's been a while since your last visit. Your practitioner, {{practitioner}}, recommends scheduling your next {{service}} to maintain your progress.\n\nBook online: {{booking_link}}\nOr call us: {{phone}}\n\nYour wellness journey is important to us.\n\nBe well,\n{{business_name}}", trigger: 'follow_up_due' }
    ],
    sms_templates: [
      { name: 'Appointment Reminder', body: "Hi {{client_name}}, your {{service}} appointment at {{business_name}} is tomorrow at {{time}} with {{practitioner}}. Wear comfortable clothes. Call {{phone}} to reschedule.", trigger: 'appointment_reminder' },
      { name: 'Follow-Up Booking', body: "Hi {{client_name}}, it's been {{weeks}} weeks since your last visit to {{business_name}}. Ready to book your next session? {{booking_link}}", trigger: 'follow_up_due' }
    ],

    estimated_hours_saved_weekly: 12,
    estimated_monthly_value: 2400,
    ideal_plan: 'pro',
    competitor_tools: ['Jane App', 'Vagaro', 'Mindbody']
  }
];