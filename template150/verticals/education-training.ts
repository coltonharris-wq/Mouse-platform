import type { ProTemplate } from '../schema';

export const educationTrainingTemplates: ProTemplate[] = [
  {
    id: 'tutoring-center',
    industry: 'Education & Training',
    niche: 'Tutoring Center',
    display_name: 'Tutoring Center',
    emoji: '📚',
    tagline: 'Enroll more students, match them with the right tutor, and keep parents informed.',
    demo_greeting: "Hi! I'm your AI assistant for a tutoring center. I can help with finding the right tutor, scheduling, and answering questions. How can I help?",
    demo_system_prompt: "You are an AI assistant for a tutoring center. Help parents find the right tutor for their child's needs, understand programs, and schedule sessions. Be warm and encouraging. Focus on student success, not just grades.",
    demo_suggested_messages: ["My child is struggling with math", "Do you offer SAT/ACT prep?", "How much does tutoring cost?"],
    soul_template: "You are the AI assistant for {{business_name}}, a tutoring center. Help parents find the right program and schedule sessions. Be encouraging — parents are often worried about their child's progress. Focus on building confidence, not just improving grades. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you looking for tutoring for a student?",
    receptionist_system_prompt: "You are the receptionist for a tutoring center. Learn: student's grade, subject(s) needing help, specific challenges, and goals. Schedule an assessment or trial session. Be warm and reassuring to parents.",
    receptionist_faqs: [
      { question: "How much does tutoring cost?", answer: "Rates depend on the subject, frequency, and whether it's one-on-one or small group. We offer packages that bring the per-session cost down. Schedule a free assessment and we'll recommend the best plan for your child.", category: "pricing" },
      { question: "How do you match students with tutors?", answer: "We match based on the subject, learning style, and personality. We want your child to feel comfortable and confident with their tutor — the right match makes all the difference.", category: "process" },
      { question: "How quickly will we see improvement?", answer: "Most students show improvement within 4-6 sessions, but it depends on the subject and where they're starting. We track progress and share updates with you regularly.", category: "results" }
    ],
    receptionist_transfer_triggers: ["parent mentions learning disability or IEP", "student has a test in the next 48 hours", "parent is very upset about grades"],
    wizard_steps: [
      { step_number: 1, title: 'Your Center', description: 'Tell us about your tutoring business.', fields: [
        { name: 'business_name', label: 'Center Name', type: 'text', placeholder: 'BrightMinds Tutoring', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-1001', required: true },
        { name: 'subjects', label: 'Subjects offered', type: 'multiselect', placeholder: '', required: true, options: ['Math', 'Reading/English', 'Science', 'History/Social Studies', 'Writing', 'SAT/ACT Prep', 'AP Courses', 'Foreign Languages', 'Study Skills', 'Homework Help'] }
      ]},
      { step_number: 2, title: 'Programs', description: 'What programs do you offer?', fields: [
        { name: 'grade_levels', label: 'Grade levels served', type: 'multiselect', placeholder: '', required: true, options: ['K-2', '3-5', '6-8 (Middle School)', '9-12 (High School)', 'College'] },
        { name: 'formats', label: 'Tutoring formats', type: 'multiselect', placeholder: '', required: true, options: ['One-on-One', 'Small Group (2-4)', 'Online/Virtual', 'In-Center', 'In-Home'] }
      ]},
      { step_number: 3, title: 'Pricing & Hours', description: 'Costs and availability.', fields: [
        { name: 'business_hours', label: 'Center Hours', type: 'time_range', placeholder: '3:00 PM - 8:00 PM', required: true },
        { name: 'hourly_rate', label: 'Starting hourly rate', type: 'currency', placeholder: '50', required: true }
      ]},
      { step_number: 4, title: 'Assessment', description: 'How do new students start?', fields: [
        { name: 'free_assessment', label: 'Offer a free assessment?', type: 'toggle', placeholder: '', required: true },
        { name: 'trial_session', label: 'Offer a trial session?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Inquiries', description: 'Parents looking for tutoring', priority: 1 },
      { id: 'todays-sessions', title: "Today's Sessions", description: 'Tutoring sessions scheduled today', priority: 2 },
      { id: 'progress-reports', title: 'Progress Reports Due', description: 'Students needing progress updates', priority: 3 },
      { id: 'expiring-packages', title: 'Expiring Packages', description: 'Students whose session packs are running low', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule assessment', description: 'Parent called about math tutoring — schedule free assessment.', category: 'leads', difficulty: 'automatic' },
      { title: 'Progress report', description: 'Send bi-weekly progress update to parent.', category: 'communication', difficulty: 'automatic' },
      { title: 'Package renewal', description: 'Student has 2 sessions left — remind parent to renew.', category: 'upsell', difficulty: 'automatic' },
      { title: 'Exam prep reminder', description: 'Finals coming up — suggest extra sessions to current students.', category: 'marketing', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'New Students', unit: 'per month', description: 'New students enrolled', target_suggestion: 8 },
      { name: 'Session Utilization', unit: 'percent', description: 'Scheduled time slots that are filled', target_suggestion: 80 },
      { name: 'Student Retention', unit: 'percent', description: 'Students who continue beyond first month', target_suggestion: 75 },
      { name: 'Parent Satisfaction', unit: 'rating', description: 'Parent satisfaction survey score', target_suggestion: 4.8 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages tutor schedules and student sessions', priority: 'essential' },
      { name: 'TutorCruncher', slug: 'tutorcruncher', category: 'tutoring', why: 'Purpose-built for tutoring businesses — scheduling, billing, matching', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles session packs and recurring payments', priority: 'recommended' },
      { name: 'Zoom', slug: 'zoom', category: 'virtual', why: 'Powers online tutoring sessions', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'tutorcruncher', 'stripe', 'zoom'],
    email_templates: [
      { name: 'Assessment Confirmation', subject: 'Student Assessment at {{business_name}}', body: "Hi {{parent_name}},\n\nWe're looking forward to meeting {{student_name}}!\n\nAssessment: {{date}} at {{time}}\n\nThe assessment takes about 30-45 minutes. We'll evaluate {{student_name}}'s skills, identify areas for growth, and recommend a tutoring plan.\n\nNo prep needed — just bring a good attitude!\n\n{{business_name}}", trigger: 'assessment_booked' },
      { name: 'Progress Report', subject: '{{student_name}}\'s Progress Report — {{business_name}}', body: "Hi {{parent_name}},\n\nHere's an update on {{student_name}}'s progress:\n\n{{progress_summary}}\n\nAreas of improvement:\n{{improvements}}\n\nFocus for upcoming sessions:\n{{next_focus}}\n\nQuestions? Call {{phone}} or reply here.\n\nKeep up the great work, {{student_name}}!\n{{business_name}}", trigger: 'progress_report' }
    ],
    sms_templates: [
      { name: 'Session Reminder', body: "Hi {{parent_name}}, {{student_name}}'s tutoring session at {{business_name}} is tomorrow at {{time}}. See you there!", trigger: 'session_reminder' },
      { name: 'Package Running Low', body: "Hi {{parent_name}}, {{student_name}} has {{sessions_remaining}} tutoring sessions left. Renew to keep the momentum going! Call {{phone}} or reply to this text.", trigger: 'low_sessions' }
    ],
    estimated_hours_saved_weekly: 10,
    estimated_monthly_value: 2000,
    ideal_plan: 'pro',
    competitor_tools: ['TutorCruncher', 'Tutor.com (competitor)', 'Wyzant (competitor)']
  },

  {
    id: 'driving-school',
    industry: 'Education & Training', niche: 'Driving School', display_name: 'Driving School', emoji: '🚗',
    tagline: 'Fill your instructor calendar, automate scheduling, and get new drivers on the road.',
    demo_greeting: "Hi! I'm your AI assistant for a driving school. I can help with scheduling lessons, answering questions about the process, and getting you on the road!",
    demo_system_prompt: "You are an AI assistant for a driving school. Help students and parents understand the driver's ed process, schedule lessons, and answer common questions. Be patient and encouraging.",
    demo_suggested_messages: ["How do I get my learner's permit?", "How many lessons do I need?", "How much does driver's ed cost?"],
    soul_template: "You are the AI assistant for {{business_name}}, a driving school. Help students schedule lessons and understand the process. Be patient and encouraging — new drivers are nervous. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you looking to start driving lessons?",
    receptionist_system_prompt: "You are the receptionist for a driving school. Determine: student's age, whether they have a permit, what they need (classroom, behind-the-wheel, or both), and schedule accordingly.",
    receptionist_faqs: [
      { question: "How much does driver's ed cost?", answer: "We offer packages that include classroom and behind-the-wheel instruction. The full program is a set price, and we also offer lessons individually. I can walk you through the options.", category: "pricing" },
      { question: "How many lessons do I need?", answer: "Our state requires a minimum number of behind-the-wheel hours. Most students complete the program in 6-10 lessons. We'll tailor the schedule to your learning pace.", category: "requirements" },
      { question: "Do you provide a car for the driving test?", answer: "Yes! Students can use our vehicle for the road test. We'll make sure you're comfortable in the car before test day.", category: "testing" }
    ],
    receptionist_transfer_triggers: ["parent wants to discuss a student with anxiety about driving", "caller asking about a commercial driving license (CDL)", "caller has a tight deadline before their permit expires"],
    wizard_steps: [
      { step_number: 1, title: 'Your School', description: 'Tell us about your driving school.', fields: [
        { name: 'business_name', label: 'School Name', type: 'text', placeholder: 'SafeStart Driving Academy', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-1002', required: true },
        { name: 'programs', label: 'Programs offered', type: 'multiselect', placeholder: '', required: true, options: ['Teen Driver\'s Ed (Classroom)', 'Behind-the-Wheel Lessons', 'Adult Driving Lessons', 'Road Test Preparation', 'Defensive Driving', 'Refresher Courses', 'Road Test Vehicle Rental'] }
      ]},
      { step_number: 2, title: 'Scheduling', description: 'When do you offer lessons?', fields: [
        { name: 'business_hours', label: 'Office Hours', type: 'time_range', placeholder: '8:00 AM - 7:00 PM', required: true },
        { name: 'weekend_lessons', label: 'Weekend lessons available?', type: 'toggle', placeholder: '', required: true },
        { name: 'pickup_service', label: 'Pickup/drop-off service?', type: 'toggle', placeholder: '', required: true, help_text: 'Pick students up from home or school for lessons' }
      ]},
      { step_number: 3, title: 'Pricing', description: 'Your rates.', fields: [
        { name: 'package_price', label: 'Full program price', type: 'currency', placeholder: '450', required: true },
        { name: 'per_lesson_price', label: 'Single lesson price', type: 'currency', placeholder: '75', required: true }
      ]},
      { step_number: 4, title: 'Vehicles', description: 'Your training vehicles.', fields: [
        { name: 'dual_controls', label: 'Vehicles have dual controls?', type: 'toggle', placeholder: '', required: true },
        { name: 'test_vehicle', label: 'Provide vehicle for road test?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-enrollments', title: 'New Enrollments', description: 'Students signing up', priority: 1 },
      { id: 'todays-lessons', title: "Today's Lessons", description: 'Lessons scheduled today', priority: 2 },
      { id: 'road-tests', title: 'Upcoming Road Tests', description: 'Students with tests this week', priority: 3 },
      { id: 'instructor-schedule', title: 'Instructor Availability', description: 'Open slots by instructor', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule first lesson', description: 'New student got their permit — schedule behind-the-wheel lesson.', category: 'scheduling', difficulty: 'automatic' },
      { title: 'Road test prep reminder', description: 'Student\'s road test is next week — suggest a prep session.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Progress update to parent', description: 'Send parent an update on their teen\'s driving progress.', category: 'communication', difficulty: 'automatic' },
      { title: 'Completion certificate', description: 'Student finished the program — send completion certificate.', category: 'completion', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Enrollments', unit: 'per month', description: 'New students enrolled', target_suggestion: 15 },
      { name: 'Lesson Completion Rate', unit: 'percent', description: 'Students who complete the full program', target_suggestion: 90 },
      { name: 'Road Test Pass Rate', unit: 'percent', description: 'Students who pass on first attempt', target_suggestion: 85 },
      { name: 'Instructor Utilization', unit: 'percent', description: 'Booked vs. available instructor hours', target_suggestion: 75 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages instructor and student schedules', priority: 'essential' },
      { name: 'ScheduleOnce', slug: 'scheduleonce', category: 'booking', why: 'Students book lessons online', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles package payments and individual lessons', priority: 'recommended' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Parents search "driving school near me"', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'scheduleonce', 'stripe', 'google-business'],
    email_templates: [
      { name: 'Enrollment Welcome', subject: 'Welcome to {{business_name}}!', body: "Hi {{parent_name}},\n\nWelcome! {{student_name}} is enrolled and ready to learn to drive.\n\nFirst lesson: {{date}} at {{time}}\n{{pickup_info}}\n\nWhat to bring:\n- Learner's permit\n- Comfortable shoes (no flip-flops)\n- Glasses/contacts if needed\n\nWe'll take great care of {{student_name}}!\n{{business_name}}", trigger: 'enrollment_complete' },
      { name: 'Road Test Prep', subject: 'Road Test Preparation — {{business_name}}', body: "Hi {{parent_name}},\n\n{{student_name}}'s road test is coming up on {{test_date}}! Here are some tips:\n\n- Practice parallel parking and 3-point turns\n- Review mirror and signal habits\n- Get plenty of rest the night before\n- Arrive 15 minutes early\n\nWant a prep session before the test? Call {{phone}} to schedule.\n\nYou've got this, {{student_name}}!\n{{business_name}}", trigger: 'road_test_approaching' }
    ],
    sms_templates: [
      { name: 'Lesson Reminder', body: "Hi {{student_name}}, your driving lesson with {{business_name}} is tomorrow at {{time}}. {{pickup_info}} Bring your permit and wear comfy shoes!", trigger: 'lesson_reminder' },
      { name: 'Road Test Good Luck', body: "Good luck on your road test today, {{student_name}}! You've practiced hard and you're ready. {{business_name}} is cheering for you! 🚗", trigger: 'test_day' }
    ],
    estimated_hours_saved_weekly: 9,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
    competitor_tools: ['DriversEd.com (competitor)', 'ScheduleOnce', 'Acuity Scheduling']
  },

  {
    id: 'music-lessons',
    industry: 'Education & Training', niche: 'Music Lessons', display_name: 'Music School', emoji: '🎵',
    tagline: 'Fill your lesson calendar, manage recitals, and keep students practicing.',
    demo_greeting: "Hi! I'm your AI assistant for a music school. I can help with lesson info, scheduling, and instrument programs. How can I help?",
    demo_system_prompt: "You are an AI assistant for a music school offering lessons in various instruments and voice. Help students and parents find the right program and schedule lessons. Be passionate about music education.",
    demo_suggested_messages: ["I want my child to learn piano", "Do you offer guitar lessons for adults?", "How much are music lessons?"],
    soul_template: "You are the AI assistant for {{business_name}}, a music school. Help students of all ages find the right instrument and teacher. Be passionate about music. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you interested in music lessons?",
    receptionist_system_prompt: "You are the receptionist for a music school. Determine: student age, instrument interest, experience level, and schedule preferences. Schedule a trial lesson.",
    receptionist_faqs: [
      { question: "What age can my child start?", answer: "We have programs for children as young as 4 for piano and violin. Guitar typically starts around age 6-7. We'll help find the right fit for your child's age and interests.", category: "ages" },
      { question: "Do I need my own instrument?", answer: "For the first few lessons, we can usually provide an instrument. If your child wants to continue, we can help you rent or purchase one at a discounted rate through our partners.", category: "instruments" },
      { question: "How much are lessons?", answer: "Lesson rates depend on the length (30, 45, or 60 minutes) and whether it's private or group. We offer monthly tuition for consistent scheduling.", category: "pricing" }
    ],
    receptionist_transfer_triggers: ["caller asks about a performance or competition program", "caller wants to discuss group/ensemble programs", "caller has a child with special needs"],
    wizard_steps: [
      { step_number: 1, title: 'Your School', description: 'Tell us about your music school.', fields: [
        { name: 'business_name', label: 'School Name', type: 'text', placeholder: 'Harmony Music Academy', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-1003', required: true },
        { name: 'instruments', label: 'Instruments taught', type: 'multiselect', placeholder: '', required: true, options: ['Piano', 'Guitar', 'Violin', 'Voice/Singing', 'Drums', 'Bass', 'Ukulele', 'Flute', 'Saxophone', 'Trumpet', 'Cello', 'Music Theory/Composition'] }
      ]},
      { step_number: 2, title: 'Lessons', description: 'How do you teach?', fields: [
        { name: 'lesson_types', label: 'Lesson formats', type: 'multiselect', placeholder: '', required: true, options: ['Private (1-on-1)', 'Semi-Private (2 students)', 'Group Classes', 'Online/Virtual', 'Rock Band/Ensemble'] },
        { name: 'lesson_lengths', label: 'Lesson lengths', type: 'multiselect', placeholder: '', required: true, options: ['30 minutes', '45 minutes', '60 minutes'] },
        { name: 'business_hours', label: 'Lesson Hours', type: 'time_range', placeholder: '2:00 PM - 8:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Pricing', description: 'How you charge.', fields: [
        { name: 'monthly_tuition', label: 'Monthly tuition (30-min weekly lessons)', type: 'currency', placeholder: '120', required: true },
        { name: 'trial_lesson', label: 'Offer a trial lesson?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Events', description: 'Performances and recitals.', fields: [
        { name: 'recitals', label: 'How often do you hold recitals?', type: 'select', placeholder: '', required: false, options: ['Twice a year', 'Once a year', 'Quarterly', 'No formal recitals'] },
        { name: 'instrument_rental', label: 'Help with instrument rental?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-students', title: 'New Student Inquiries', description: 'People interested in lessons', priority: 1 },
      { id: 'todays-lessons', title: "Today's Schedule", description: 'Lessons scheduled today', priority: 2 },
      { id: 'recital-prep', title: 'Recital Countdown', description: 'Days until next recital', priority: 3 },
      { id: 'tuition-due', title: 'Tuition Due', description: 'Outstanding tuition payments', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule trial lesson', description: 'Parent wants piano lessons for 7-year-old — book trial.', category: 'leads', difficulty: 'automatic' },
      { title: 'Tuition reminder', description: 'Monthly tuition due in 3 days — send reminder.', category: 'billing', difficulty: 'automatic' },
      { title: 'Recital sign-up', description: 'Send recital registration to all current students.', category: 'events', difficulty: 'automatic' },
      { title: 'Practice tip', description: 'Send weekly practice tip to parents.', category: 'engagement', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Students', unit: 'per month', description: 'Students who start lessons', target_suggestion: 8 },
      { name: 'Retention Rate', unit: 'percent', description: 'Students who continue month-over-month', target_suggestion: 90 },
      { name: 'Instructor Utilization', unit: 'percent', description: 'Booked vs. available lesson slots', target_suggestion: 80 },
      { name: 'Tuition Collection', unit: 'percent', description: 'On-time tuition payments', target_suggestion: 95 }
    ],
    suggested_integrations: [
      { name: 'My Music Staff', slug: 'my-music-staff', category: 'music-school', why: 'Built for music schools — scheduling, billing, and practice tracking', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Syncs lesson schedules for teachers and families', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles monthly tuition and recital fees', priority: 'recommended' },
      { name: 'Zoom', slug: 'zoom', category: 'virtual', why: 'Powers virtual lessons', priority: 'nice-to-have' }
    ],
    integration_priority: ['my-music-staff', 'google-calendar', 'stripe', 'zoom'],
    email_templates: [
      { name: 'Trial Lesson Confirmation', subject: 'Your Trial Lesson at {{business_name}}!', body: "Hi {{parent_name}},\n\n{{student_name}}'s trial {{instrument}} lesson is confirmed!\n\nDate: {{date}}\nTime: {{time}}\nTeacher: {{teacher_name}}\n\nNo instrument needed for the trial — we'll provide one.\n\nWe can't wait to share the joy of music!\n{{business_name}}", trigger: 'trial_booked' },
      { name: 'Recital Invitation', subject: 'Recital Day is Coming! — {{business_name}}', body: "Hi {{parent_name}},\n\nOur {{season}} recital is coming up!\n\nDate: {{date}}\nTime: {{time}}\nVenue: {{venue}}\n\nWould {{student_name}} like to perform? Please sign up by {{deadline}}.\n\nPerforming builds confidence and is a wonderful milestone!\n{{business_name}}", trigger: 'recital_announcement' }
    ],
    sms_templates: [
      { name: 'Lesson Reminder', body: "Hi {{parent_name}}, {{student_name}}'s {{instrument}} lesson is tomorrow at {{time}} at {{business_name}}. See you there! 🎵", trigger: 'lesson_reminder' },
      { name: 'Practice Encouragement', body: "Practice tip from {{business_name}}: Even 10 minutes a day makes a difference! Keep it up, {{student_name}}! 🎶", trigger: 'weekly_practice' }
    ],
    estimated_hours_saved_weekly: 9,
    estimated_monthly_value: 1800,
    ideal_plan: 'pro',
    competitor_tools: ['My Music Staff', 'Fons', 'Music Teacher\'s Helper']
  },

  {
    id: 'art-classes',
    industry: 'Education & Training', niche: 'Art Classes', display_name: 'Art Studio & Classes', emoji: '🎨',
    tagline: 'Fill your classes, manage supplies, and nurture creative growth.',
    demo_greeting: "Hi! I'm your AI assistant for an art studio. I can help with class info, registration, and creative programs. How can I help?",
    demo_system_prompt: "You are an AI assistant for an art studio offering classes. Help students find the right class, understand what's included, and register. Be creative and welcoming.",
    demo_suggested_messages: ["Do you have painting classes for beginners?", "What classes do you offer for kids?", "Do I need to bring my own supplies?"],
    soul_template: "You are the AI assistant for {{business_name}}, an art studio. Help students find creative classes. Be warm, creative, and inclusive — art is for everyone. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! I'm the virtual assistant. Are you looking for art classes?",
    receptionist_system_prompt: "You are the receptionist for an art studio. Determine: age group (kids/teens/adults), medium of interest (painting, drawing, ceramics, etc.), experience level, and schedule. Register for classes or schedule a trial.",
    receptionist_faqs: [
      { question: "Do I need experience?", answer: "Not at all! We have classes for complete beginners and experienced artists alike. Our instructors guide you step by step.", category: "beginners" },
      { question: "Are supplies included?", answer: "Yes — all materials and supplies are included in the class fee. Just show up ready to create!", category: "supplies" },
      { question: "Do you have classes for kids?", answer: "We do! We have age-appropriate classes for kids as young as 5, plus teen programs and adult classes.", category: "kids" }
    ],
    receptionist_transfer_triggers: ["caller wants to host a private party or corporate event", "caller asks about selling artwork", "caller wants to discuss a long-term program or scholarship"],
    wizard_steps: [
      { step_number: 1, title: 'Your Studio', description: 'Tell us about your art studio.', fields: [
        { name: 'business_name', label: 'Studio Name', type: 'text', placeholder: 'Canvas & Clay Studio', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-1004', required: true },
        { name: 'mediums', label: 'Art forms taught', type: 'multiselect', placeholder: '', required: true, options: ['Painting (Acrylic)', 'Painting (Oil)', 'Watercolor', 'Drawing', 'Ceramics/Pottery', 'Sculpture', 'Mixed Media', 'Photography', 'Printmaking', 'Digital Art', 'Jewelry Making'] }
      ]},
      { step_number: 2, title: 'Classes', description: 'What do you offer?', fields: [
        { name: 'class_types', label: 'Class formats', type: 'multiselect', placeholder: '', required: true, options: ['Ongoing Weekly Classes', 'Workshops (single session)', 'Multi-Week Courses', 'Open Studio', 'Private Lessons', 'Birthday Parties', 'Corporate Events', 'Paint & Sip'] },
        { name: 'age_groups', label: 'Age groups', type: 'multiselect', placeholder: '', required: true, options: ['Kids (5-8)', 'Tweens (9-12)', 'Teens (13-17)', 'Adults'] }
      ]},
      { step_number: 3, title: 'Pricing & Hours', description: 'Costs and schedule.', fields: [
        { name: 'business_hours', label: 'Studio Hours', type: 'time_range', placeholder: '10:00 AM - 8:00 PM', required: true },
        { name: 'class_price', label: 'Starting class price', type: 'currency', placeholder: '35', required: true },
        { name: 'supplies_included', label: 'Supplies included in price?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Events', description: 'Special events.', fields: [
        { name: 'art_shows', label: 'Host student art shows?', type: 'toggle', placeholder: '', required: false },
        { name: 'parties', label: 'Host private parties?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-registrations', title: 'New Registrations', description: 'People signing up for classes', priority: 1 },
      { id: 'todays-classes', title: "Today's Classes", description: 'Classes and enrollment today', priority: 2 },
      { id: 'party-bookings', title: 'Party Bookings', description: 'Upcoming private events', priority: 3 },
      { id: 'supply-inventory', title: 'Supply Check', description: 'Supplies running low', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Welcome new student', description: 'New student registered for watercolor class — send welcome info.', category: 'onboarding', difficulty: 'automatic' },
      { title: 'Class reminder', description: 'Remind students about tomorrow\'s pottery class.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Workshop promotion', description: 'New weekend workshop added — promote to past students.', category: 'marketing', difficulty: 'needs-approval' },
      { title: 'Party inquiry follow-up', description: 'Parent asked about a birthday party — send package options.', category: 'leads', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Registrations', unit: 'per month', description: 'New class registrations', target_suggestion: 20 },
      { name: 'Class Fill Rate', unit: 'percent', description: 'Spots filled per class', target_suggestion: 70 },
      { name: 'Student Retention', unit: 'percent', description: 'Students who take another class', target_suggestion: 50 },
      { name: 'Party Bookings', unit: 'per month', description: 'Private event bookings', target_suggestion: 4 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages class schedule and events', priority: 'essential' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Handles class registrations and retail sales', priority: 'essential' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Art is visual — share student work', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Promote new classes and workshops', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'square', 'instagram', 'mailchimp'],
    email_templates: [
      { name: 'Class Confirmation', subject: 'You\'re Registered! — {{business_name}}', body: "Hi {{client_name}},\n\nYou're all set for {{class_name}}!\n\nDate: {{date}}\nTime: {{time}}\n\nAll supplies are included — just bring your creativity!\n\nWear clothes you don't mind getting messy.\n\nSee you in the studio!\n{{business_name}}", trigger: 'registration_complete' },
      { name: 'New Workshop Announcement', subject: 'New Workshop: {{workshop_name}} — {{business_name}}', body: "Hi {{client_name}},\n\nWe're excited to announce a new workshop:\n\n{{workshop_name}}\nDate: {{date}}\nTime: {{time}}\nPrice: {{price}} (all supplies included)\n\n{{workshop_description}}\n\nSpots are limited — register now: {{registration_link}}\n\n{{business_name}}", trigger: 'new_workshop' }
    ],
    sms_templates: [
      { name: 'Class Reminder', body: "Hi {{client_name}}, your {{class_name}} class at {{business_name}} is tomorrow at {{time}}. Wear clothes you don't mind getting messy! 🎨", trigger: 'class_reminder' },
      { name: 'Workshop Promo', body: "New at {{business_name}}: {{workshop_name}} on {{date}}! Supplies included. Spots limited. Register: {{link}}", trigger: 'workshop_promo' }
    ],
    estimated_hours_saved_weekly: 8, estimated_monthly_value: 1600, ideal_plan: 'pro',
    competitor_tools: ['Square', 'Amilia', 'CourseStorm']
  },

  {
    id: 'language-school',
    industry: 'Education & Training', niche: 'Language School', display_name: 'Language School', emoji: '🗣️',
    tagline: 'Enroll more students, place them at the right level, and keep them progressing.',
    demo_greeting: "Hi! I'm your AI assistant for a language school. I can help with class info, placement, and scheduling. What language are you interested in learning?",
    demo_system_prompt: "You are an AI assistant for a language school. Help potential students choose a language, understand class levels, and enroll. Be enthusiastic about language learning.",
    demo_suggested_messages: ["I want to learn Spanish", "Do you offer group or private classes?", "What level am I?"],
    soul_template: "You are the AI assistant for {{business_name}}, a language school. Help students find the right class and level. Be enthusiastic about the joy of learning a new language. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! What language would you like to learn?",
    receptionist_system_prompt: "You are the receptionist for a language school. Determine: which language, current level, goals, and schedule preferences. Suggest a placement test or trial class.",
    receptionist_faqs: [
      { question: "What languages do you teach?", answer: "We offer classes in several languages including Spanish, French, Mandarin, German, and more. What language interests you?", category: "languages" },
      { question: "How do I know my level?", answer: "We offer a free placement assessment to find your exact level. This ensures you're in a class that's challenging but not overwhelming.", category: "placement" },
      { question: "How long until I'm fluent?", answer: "It depends on the language, your starting level, and how much you practice. With regular classes and practice, most students reach conversational proficiency in 6-12 months.", category: "timeline" }
    ],
    receptionist_transfer_triggers: ["caller needs corporate language training", "caller wants translation services", "caller asks about study abroad programs"],
    wizard_steps: [
      { step_number: 1, title: 'Your School', description: 'Tell us about your language school.', fields: [
        { name: 'business_name', label: 'School Name', type: 'text', placeholder: 'Global Language Center', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-1005', required: true },
        { name: 'languages', label: 'Languages taught', type: 'multiselect', placeholder: '', required: true, options: ['Spanish', 'French', 'Mandarin Chinese', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'English (ESL)'] }
      ]},
      { step_number: 2, title: 'Classes', description: 'How do you teach?', fields: [
        { name: 'class_types', label: 'Class formats', type: 'multiselect', placeholder: '', required: true, options: ['Group Classes', 'Private Lessons', 'Semi-Private (2-3)', 'Online/Virtual', 'Immersion Programs', 'Conversation Practice', 'Corporate Training'] },
        { name: 'business_hours', label: 'School Hours', type: 'time_range', placeholder: '9:00 AM - 9:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Levels', description: 'How do you structure levels?', fields: [
        { name: 'levels', label: 'Levels offered', type: 'multiselect', placeholder: '', required: true, options: ['Complete Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced', 'Proficiency/Fluent'] },
        { name: 'placement_test', label: 'Free placement test?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Pricing', description: 'How you charge.', fields: [
        { name: 'group_rate', label: 'Group class rate per month', type: 'currency', placeholder: '200', required: true },
        { name: 'private_rate', label: 'Private lesson rate per hour', type: 'currency', placeholder: '60', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-students', title: 'New Inquiries', description: 'People interested in language classes', priority: 1 },
      { id: 'placement-tests', title: 'Placement Tests', description: 'Students needing level assessment', priority: 2 },
      { id: 'class-enrollment', title: 'Class Enrollment', description: 'Current enrollment by class', priority: 3 },
      { id: 'level-ups', title: 'Level Advancement', description: 'Students ready to move up', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule placement test', description: 'New student wants to learn French — schedule assessment.', category: 'leads', difficulty: 'automatic' },
      { title: 'Level advancement', description: 'Student completed Intermediate — enroll in Upper Intermediate.', category: 'progression', difficulty: 'automatic' },
      { title: 'Class reminder', description: 'Remind students about tomorrow\'s Spanish class.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Session renewal', description: 'Current session ending — remind students to re-enroll.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'New Enrollments', unit: 'per month', description: 'New students starting classes', target_suggestion: 12 },
      { name: 'Retention Rate', unit: 'percent', description: 'Students who continue to next session', target_suggestion: 70 },
      { name: 'Class Fill Rate', unit: 'percent', description: 'Seats filled per class', target_suggestion: 75 },
      { name: 'Level Completion', unit: 'percent', description: 'Students who complete their level', target_suggestion: 80 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages class schedules and private lessons', priority: 'essential' },
      { name: 'Amilia', slug: 'amilia', category: 'registration', why: 'Class registration and enrollment management', priority: 'essential' },
      { name: 'Zoom', slug: 'zoom', category: 'virtual', why: 'Powers online language classes', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles tuition payments', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'amilia', 'zoom', 'stripe'],
    email_templates: [
      { name: 'Placement Test', subject: 'Your Language Assessment — {{business_name}}', body: "Hi {{client_name}},\n\nYour {{language}} placement assessment is scheduled:\n\nDate: {{date}}\nTime: {{time}}\n\nThe assessment takes about 20 minutes and helps us find the perfect class for your level.\n\nNo preparation needed!\n\n{{business_name}}", trigger: 'placement_booked' },
      { name: 'Level Up', subject: '🎉 You\'re Moving Up! — {{business_name}}', body: "Hi {{client_name}},\n\nCongratulations — you've completed {{current_level}} {{language}}!\n\nYou're now ready for {{next_level}}. The next session starts {{start_date}}.\n\nEnroll: {{enrollment_link}}\n\nKeep up the amazing progress!\n{{business_name}}", trigger: 'level_complete' }
    ],
    sms_templates: [
      { name: 'Class Reminder', body: "Hi {{client_name}}, your {{language}} class at {{business_name}} is tomorrow at {{time}}. See you there! 🗣️", trigger: 'class_reminder' },
      { name: 'Enrollment Open', body: "Hi {{client_name}}, the next session of {{language}} classes at {{business_name}} starts {{start_date}}. Enroll now to keep your spot: {{link}}", trigger: 'enrollment_open' }
    ],
    estimated_hours_saved_weekly: 9, estimated_monthly_value: 1800, ideal_plan: 'pro',
    competitor_tools: ['Amilia', 'CourseStorm', 'Duolingo (consumer competitor)']
  },

  {
    id: 'test-prep-center',
    industry: 'Education & Training', niche: 'Test Prep Center', display_name: 'Test Prep Center', emoji: '📝',
    tagline: 'Boost enrollment, track student scores, and celebrate results.',
    demo_greeting: "Hi! I'm your AI assistant for a test prep center. I can help with SAT, ACT, GRE, and other test prep programs. What test are you preparing for?",
    demo_system_prompt: "You are an AI assistant for a test prep center. Help students and parents find the right program for SAT, ACT, GRE, GMAT, LSAT, MCAT, and other standardized tests. Be encouraging and results-focused.",
    demo_suggested_messages: ["I need SAT prep — where do I start?", "What score improvement can I expect?", "How much does test prep cost?"],
    soul_template: "You are the AI assistant for {{business_name}}, a test prep center. Help students choose the right program and schedule. Be encouraging and results-oriented. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! What test are you preparing for?",
    receptionist_system_prompt: "You are the receptionist for a test prep center. Determine: which test, test date, current score (if known), target score, and schedule preferences. Recommend a program and schedule a consultation.",
    receptionist_faqs: [
      { question: "How much does test prep cost?", answer: "Pricing depends on the program — group classes, private tutoring, or a combo. We offer a free consultation to assess your needs and recommend the best plan.", category: "pricing" },
      { question: "How much can I improve my score?", answer: "Most students improve 150-200+ points on the SAT and 3-5 points on the ACT with our program. Results depend on starting point and dedication to practice.", category: "results" },
      { question: "When should I start preparing?", answer: "Ideally 3-4 months before your test date. But even 6-8 weeks can make a significant difference. The sooner you start, the better!", category: "timing" }
    ],
    receptionist_transfer_triggers: ["caller has a test in less than 2 weeks", "caller is interested in group rates for a school", "caller asks about guaranteed score improvement"],
    wizard_steps: [
      { step_number: 1, title: 'Your Center', description: 'Tell us about your test prep business.', fields: [
        { name: 'business_name', label: 'Center Name', type: 'text', placeholder: 'ScoreUp Test Prep', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-1006', required: true },
        { name: 'tests', label: 'Tests you prep for', type: 'multiselect', placeholder: '', required: true, options: ['SAT', 'ACT', 'PSAT', 'GRE', 'GMAT', 'LSAT', 'MCAT', 'AP Exams', 'ISEE/SSAT', 'GED'] }
      ]},
      { step_number: 2, title: 'Programs', description: 'What programs do you offer?', fields: [
        { name: 'formats', label: 'Program formats', type: 'multiselect', placeholder: '', required: true, options: ['Group Classes', 'Private Tutoring', 'Online/Virtual', 'Self-Paced', 'Intensive Boot Camp', 'Practice Tests'] },
        { name: 'business_hours', label: 'Center Hours', type: 'time_range', placeholder: '3:00 PM - 9:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Pricing', description: 'How you charge.', fields: [
        { name: 'group_course_price', label: 'Group course price', type: 'currency', placeholder: '699', required: true },
        { name: 'private_rate', label: 'Private tutoring hourly rate', type: 'currency', placeholder: '100', required: false }
      ]},
      { step_number: 4, title: 'Assessment', description: 'How students get started.', fields: [
        { name: 'diagnostic_test', label: 'Free diagnostic test?', type: 'toggle', placeholder: '', required: true },
        { name: 'score_guarantee', label: 'Offer a score improvement guarantee?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Inquiries', description: 'Students interested in test prep', priority: 1 },
      { id: 'upcoming-tests', title: 'Upcoming Test Dates', description: 'Students with tests coming up', priority: 2 },
      { id: 'practice-scores', title: 'Practice Test Scores', description: 'Recent practice test results', priority: 3 },
      { id: 'enrollments', title: 'Active Enrollments', description: 'Students currently in programs', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule diagnostic test', description: 'Student wants SAT prep — schedule free diagnostic.', category: 'leads', difficulty: 'automatic' },
      { title: 'Practice test results', description: 'Send student their practice test score report.', category: 'communication', difficulty: 'automatic' },
      { title: 'Test date reminder', description: 'Remind student their SAT is in 2 weeks.', category: 'reminders', difficulty: 'automatic' },
      { title: 'Score celebration', description: 'Student improved 200 points — send congratulations and request testimonial.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Enrollments', unit: 'per month', description: 'New students enrolled', target_suggestion: 10 },
      { name: 'Average Score Improvement', unit: 'points', description: 'Average improvement across students', target_suggestion: 180 },
      { name: 'Referral Rate', unit: 'percent', description: 'Students from referrals', target_suggestion: 30 },
      { name: 'Completion Rate', unit: 'percent', description: 'Students who complete the full program', target_suggestion: 85 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages class schedules and tutoring sessions', priority: 'essential' },
      { name: 'TutorCruncher', slug: 'tutorcruncher', category: 'tutoring', why: 'Student management and scheduling', priority: 'essential' },
      { name: 'Zoom', slug: 'zoom', category: 'virtual', why: 'Online tutoring sessions', priority: 'recommended' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles course payments', priority: 'recommended' }
    ],
    integration_priority: ['google-calendar', 'tutorcruncher', 'zoom', 'stripe'],
    email_templates: [
      { name: 'Diagnostic Results', subject: 'Your {{test}} Diagnostic Results — {{business_name}}', body: "Hi {{client_name}},\n\nHere are your diagnostic test results:\n\nOverall Score: {{score}}\n{{section_breakdown}}\n\nBased on these results, we recommend:\n{{recommended_program}}\n\nWith our program, most students improve {{typical_improvement}} points.\n\nReady to get started? {{enrollment_link}}\n\n{{business_name}}", trigger: 'diagnostic_complete' },
      { name: 'Score Celebration', subject: '🎉 Amazing Score Improvement! — {{business_name}}', body: "Hi {{client_name}},\n\nCONGRATULATIONS! Your official {{test}} score is in:\n\n{{final_score}} (up from {{starting_score}} — that's a {{improvement}}-point improvement!)\n\nYour hard work paid off. We're so proud of you!\n\nIf you'd be willing to share a testimonial, it would mean the world: {{testimonial_link}}\n\n{{business_name}}", trigger: 'score_received' }
    ],
    sms_templates: [
      { name: 'Class Reminder', body: "Hi {{client_name}}, your {{test}} prep class at {{business_name}} is tomorrow at {{time}}. Bring your practice book!", trigger: 'class_reminder' },
      { name: 'Test Day', body: "Good luck on your {{test}} today, {{client_name}}! You've put in the work — trust your preparation. You've got this! — {{business_name}} 📝", trigger: 'test_day' }
    ],
    estimated_hours_saved_weekly: 10, estimated_monthly_value: 2200, ideal_plan: 'pro',
    competitor_tools: ['TutorCruncher', 'Kaplan (competitor)', 'Princeton Review (competitor)']
  },

  {
    id: 'daycare-center',
    industry: 'Education & Training', niche: 'Daycare Center', display_name: 'Daycare Center', emoji: '👶',
    tagline: 'Simplify enrollment, communicate with parents instantly, and fill every spot.',
    demo_greeting: "Hi! I'm your AI assistant for a daycare center. I can help with enrollment, programs, and answering parents' questions. How can I help?",
    demo_system_prompt: "You are an AI assistant for a daycare center. Help parents learn about childcare programs, enrollment, and daily routines. Be warm, trustworthy, and safety-focused. Parents are trusting you with their most precious people.",
    demo_suggested_messages: ["Do you have openings for infants?", "What's your daily schedule like?", "How much does daycare cost?"],
    soul_template: "You are the AI assistant for {{business_name}}, a daycare center. Help parents with enrollment and program info. Be warm and trustworthy — parents are making one of the most important decisions for their family. Emphasize safety, curriculum, and caregiver qualifications. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}. I'm the virtual assistant. Are you looking for childcare?",
    receptionist_system_prompt: "You are the receptionist for a daycare center. Determine: child's age, care schedule needed (full-time, part-time, days), and any special needs. Check availability and schedule a tour. Be warm and reassuring.",
    receptionist_faqs: [
      { question: "Do you have openings?", answer: "Availability depends on the age group and schedule you need. Let me check for you — what's your child's age and what days do you need care?", category: "availability" },
      { question: "How much does daycare cost?", answer: "Rates depend on your child's age and whether you need full-time or part-time care. Infant care is typically higher due to the lower caregiver-to-child ratios. I can give you exact rates during a tour.", category: "pricing" },
      { question: "What's your caregiver ratio?", answer: "We follow or exceed state-mandated ratios. For infants, that's typically 1:4. For toddlers, 1:6. For preschool, 1:10. Safety and attention are our top priorities.", category: "safety" }
    ],
    receptionist_transfer_triggers: ["caller has a child with severe allergies or medical needs", "caller asks about emergency procedures", "caller wants to discuss a concern about their child's care", "caller mentions financial assistance or subsidy"],
    wizard_steps: [
      { step_number: 1, title: 'Your Center', description: 'Tell us about your daycare center.', fields: [
        { name: 'business_name', label: 'Center Name', type: 'text', placeholder: 'Sunshine Daycare', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-1007', required: true },
        { name: 'programs', label: 'Age groups served', type: 'multiselect', placeholder: '', required: true, options: ['Infant (6 weeks - 12 months)', 'Toddler (1-2 years)', 'Twos (2-3 years)', 'Preschool (3-4 years)', 'Pre-K (4-5 years)', 'School Age (before/after school)', 'Summer Camp'] }
      ]},
      { step_number: 2, title: 'Details', description: 'Center details.', fields: [
        { name: 'business_hours', label: 'Operating Hours', type: 'time_range', placeholder: '6:30 AM - 6:00 PM', required: true },
        { name: 'licensed', label: 'State licensed?', type: 'toggle', placeholder: '', required: true },
        { name: 'meals_included', label: 'Meals/snacks included?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 3, title: 'Enrollment', description: 'How enrollment works.', fields: [
        { name: 'enrollment_fee', label: 'Enrollment/registration fee', type: 'currency', placeholder: '100', required: false },
        { name: 'waitlist', label: 'Do you maintain a waitlist?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Tours', description: 'How parents visit.', fields: [
        { name: 'tour_available', label: 'Offer facility tours?', type: 'toggle', placeholder: '', required: true },
        { name: 'subsidies', label: 'Accept childcare subsidies?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'new-inquiries', title: 'New Inquiries', description: 'Families looking for childcare', priority: 1 },
      { id: 'tours-scheduled', title: 'Tours Scheduled', description: 'Upcoming facility tours', priority: 2 },
      { id: 'enrollment-status', title: 'Enrollment', description: 'Current enrollment by age group', priority: 3 },
      { id: 'waitlist', title: 'Waitlist', description: 'Families waiting for openings', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule tour', description: 'Parent inquiring about infant care — schedule facility tour.', category: 'leads', difficulty: 'automatic' },
      { title: 'Waitlist update', description: 'Spot opened in toddler room — notify next family on waitlist.', category: 'enrollment', difficulty: 'automatic' },
      { title: 'Daily report', description: 'Send daily activity/nap/meal report to parents.', category: 'communication', difficulty: 'automatic' },
      { title: 'Re-enrollment reminder', description: 'Annual re-enrollment forms due — remind families.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Tour Requests', unit: 'per month', description: 'Families scheduling tours', target_suggestion: 10 },
      { name: 'Tour-to-Enroll Rate', unit: 'percent', description: 'Tours that become enrollments', target_suggestion: 50 },
      { name: 'Enrollment Rate', unit: 'percent', description: 'Capacity utilization', target_suggestion: 95 },
      { name: 'Parent Satisfaction', unit: 'rating', description: 'Annual parent survey score', target_suggestion: 4.8 }
    ],
    suggested_integrations: [
      { name: 'Brightwheel', slug: 'brightwheel', category: 'childcare', why: 'Purpose-built for daycare — check-in, daily reports, billing', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages tours and staff schedules', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles tuition auto-pay', priority: 'recommended' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Parents search "daycare near me"', priority: 'recommended' }
    ],
    integration_priority: ['brightwheel', 'google-calendar', 'stripe', 'google-business'],
    email_templates: [
      { name: 'Tour Confirmation', subject: 'Your Tour at {{business_name}}', body: "Hi {{parent_name}},\n\nWe're looking forward to showing you around!\n\nTour: {{date}} at {{time}}\n\nYou'll see our classrooms, outdoor play area, and meet our teachers. Feel free to bring {{child_name}} — we'd love to meet them!\n\nParking is available at {{parking_info}}.\n\nSee you soon!\n{{business_name}}", trigger: 'tour_booked' },
      { name: 'Enrollment Welcome', subject: 'Welcome to the {{business_name}} Family!', body: "Hi {{parent_name}},\n\nWe're thrilled to welcome {{child_name}} to {{business_name}}!\n\nStart Date: {{start_date}}\nClassroom: {{classroom}}\nTeacher: {{teacher_name}}\n\nPlease complete the enrollment packet and bring it on the first day, along with:\n- Completed medical form\n- Emergency contact information\n- A change of clothes labeled with {{child_name}}'s name\n\nWe can't wait to meet {{child_name}}!\n{{business_name}}", trigger: 'enrollment_complete' }
    ],
    sms_templates: [
      { name: 'Tour Reminder', body: "Hi {{parent_name}}, your tour at {{business_name}} is tomorrow at {{time}}. Feel free to bring {{child_name}}! We look forward to meeting your family.", trigger: 'tour_reminder' },
      { name: 'Spot Available', body: "Great news, {{parent_name}}! A spot has opened up in our {{age_group}} room at {{business_name}}. Call {{phone}} ASAP to secure it — these fill quickly!", trigger: 'waitlist_opening' }
    ],
    estimated_hours_saved_weekly: 12, estimated_monthly_value: 2400, ideal_plan: 'growth',
    competitor_tools: ['Brightwheel', 'HiMama', 'Procare']
  },

  {
    id: 'preschool',
    industry: 'Education & Training', niche: 'Preschool', display_name: 'Preschool', emoji: '🏫',
    tagline: 'Fill classrooms, streamline enrollment, and keep families engaged.',
    demo_greeting: "Hi! I'm your AI assistant for a preschool. I can help with enrollment, programs, and answering parents' questions.",
    demo_system_prompt: "You are an AI assistant for a preschool. Help parents learn about programs, curriculum, and enrollment. Be warm, educational, and safety-focused.",
    demo_suggested_messages: ["What curriculum do you use?", "What ages do you serve?", "Do you have a Pre-K program?"],
    soul_template: "You are the AI assistant for {{business_name}}, a preschool. Help families with enrollment and program info. Be warm, educational, and focused on child development. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thank you for calling {{business_name}}! Are you looking for preschool for your child?",
    receptionist_system_prompt: "You are the receptionist for a preschool. Learn about the child's age, schedule needs, and what's important to the family. Schedule a tour. Be warm and educational.",
    receptionist_faqs: [
      { question: "What curriculum do you use?", answer: "We use a play-based, developmentally appropriate curriculum that prepares children for kindergarten through hands-on learning, social skills, and creative exploration. You'll see it in action during your tour!", category: "curriculum" },
      { question: "Is my child ready for preschool?", answer: "Most children are ready between ages 2.5-4, depending on the program. Signs of readiness include interest in other children, basic independence (toileting, eating), and comfort being away from parents for a few hours.", category: "readiness" },
      { question: "Do you require potty training?", answer: "It depends on the age group and program. Our youngest classes don't require it, but our 3+ programs typically do. We work with families on the transition.", category: "potty-training" }
    ],
    receptionist_transfer_triggers: ["caller's child has an IEP or developmental concern", "caller asks about financial aid or tuition assistance", "caller wants to discuss a religious/faith-based curriculum"],
    wizard_steps: [
      { step_number: 1, title: 'Your School', description: 'Tell us about your preschool.', fields: [
        { name: 'business_name', label: 'School Name', type: 'text', placeholder: 'Little Learners Academy', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-1008', required: true },
        { name: 'programs', label: 'Programs offered', type: 'multiselect', placeholder: '', required: true, options: ['2-Year-Old Program', '3-Year-Old Preschool', '4-Year-Old Pre-K', 'Full-Day Program', 'Half-Day Program', 'Extended Care (before/after)', 'Summer Program'] }
      ]},
      { step_number: 2, title: 'Curriculum', description: 'Your approach to learning.', fields: [
        { name: 'curriculum', label: 'Curriculum type', type: 'select', placeholder: '', required: true, options: ['Play-Based', 'Montessori', 'Reggio Emilia', 'Creative Curriculum', 'Academic-Focused', 'Faith-Based', 'Hybrid'] },
        { name: 'business_hours', label: 'School Hours', type: 'time_range', placeholder: '7:00 AM - 6:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Enrollment', description: 'How enrollment works.', fields: [
        { name: 'enrollment_period', label: 'Enrollment cycle', type: 'select', placeholder: '', required: true, options: ['Year-round enrollment', 'Fall enrollment only', 'Semester-based'] },
        { name: 'tuition_range', label: 'Monthly tuition starting at', type: 'currency', placeholder: '800', required: true }
      ]},
      { step_number: 4, title: 'Facility', description: 'Your facility details.', fields: [
        { name: 'outdoor_space', label: 'Outdoor playground?', type: 'toggle', placeholder: '', required: true },
        { name: 'meals', label: 'Meals/snacks provided?', type: 'toggle', placeholder: '', required: true }
      ]}
    ],
    dashboard_widgets: [
      { id: 'inquiries', title: 'New Inquiries', description: 'Families interested in enrollment', priority: 1 },
      { id: 'tours', title: 'Upcoming Tours', description: 'Scheduled family tours', priority: 2 },
      { id: 'enrollment', title: 'Enrollment Status', description: 'Spots available by program', priority: 3 },
      { id: 'waitlist', title: 'Waitlist', description: 'Families waiting for spots', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Schedule tour', description: 'Family interested in Pre-K — schedule campus tour.', category: 'leads', difficulty: 'automatic' },
      { title: 'Enrollment packet follow-up', description: 'Sent enrollment forms — check if they need help completing them.', category: 'enrollment', difficulty: 'automatic' },
      { title: 'Parent newsletter', description: 'Send monthly classroom update to families.', category: 'communication', difficulty: 'needs-approval' },
      { title: 'Re-enrollment reminder', description: 'Next year registration opens soon — remind current families.', category: 'retention', difficulty: 'automatic' }
    ],
    kpis: [
      { name: 'Tour Requests', unit: 'per month', description: 'Families scheduling tours', target_suggestion: 8 },
      { name: 'Enrollment Rate', unit: 'percent', description: 'Capacity utilization', target_suggestion: 95 },
      { name: 'Re-Enrollment Rate', unit: 'percent', description: 'Families who re-enroll', target_suggestion: 85 },
      { name: 'Parent Satisfaction', unit: 'rating', description: 'Annual survey score', target_suggestion: 4.8 }
    ],
    suggested_integrations: [
      { name: 'Brightwheel', slug: 'brightwheel', category: 'childcare', why: 'Daily reports, check-in, and parent communication', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages tours and school events', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles tuition and fees', priority: 'recommended' },
      { name: 'Google Business Profile', slug: 'google-business', category: 'marketing', why: 'Families search for preschool by location', priority: 'recommended' }
    ],
    integration_priority: ['brightwheel', 'google-calendar', 'stripe', 'google-business'],
    email_templates: [
      { name: 'Tour Confirmation', subject: 'Your Preschool Tour at {{business_name}}', body: "Hi {{parent_name}},\n\nWe're excited to show you our school!\n\nTour: {{date}} at {{time}}\n\nYou'll see our classrooms, meet our teachers, and learn about our {{curriculum}} curriculum. Feel free to bring {{child_name}}!\n\nWe look forward to meeting your family.\n{{business_name}}", trigger: 'tour_booked' },
      { name: 'Enrollment Complete', subject: 'Welcome to {{business_name}}!', body: "Hi {{parent_name}},\n\n{{child_name}} is officially enrolled at {{business_name}}!\n\nStart Date: {{start_date}}\nClassroom: {{classroom}}\nTeacher: {{teacher_name}}\n\nWe'll send a detailed first-day guide closer to the start date.\n\nWelcome to our family!\n{{business_name}}", trigger: 'enrollment_complete' }
    ],
    sms_templates: [
      { name: 'Tour Reminder', body: "Hi {{parent_name}}, your tour at {{business_name}} is tomorrow at {{time}}. We'd love for you to bring {{child_name}}! See you soon.", trigger: 'tour_reminder' },
      { name: 'Spot Available', body: "Hi {{parent_name}}, a spot just opened in our {{program}} at {{business_name}}! Call {{phone}} to secure it before it fills.", trigger: 'waitlist_opening' }
    ],
    estimated_hours_saved_weekly: 11, estimated_monthly_value: 2200, ideal_plan: 'growth',
    competitor_tools: ['Brightwheel', 'HiMama', 'Procare']
  },

  {
    id: 'after-school-program',
    industry: 'Education & Training', niche: 'After-School Program', display_name: 'After-School Program', emoji: '🎒',
    tagline: 'Fill your program, automate pickup logistics, and keep parents informed.',
    demo_greeting: "Hi! I'm your AI assistant for an after-school program. I can help with enrollment, schedules, and activities.",
    demo_system_prompt: "You are an AI assistant for an after-school program. Help parents learn about activities, scheduling, and enrollment. Be safety-focused and organized.",
    demo_suggested_messages: ["What activities do you offer?", "What time is pickup?", "How much does after-school care cost?"],
    soul_template: "You are the AI assistant for {{business_name}}, an after-school program. Help parents with enrollment and program details. Safety and communication are top priorities. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! Are you looking for after-school care?",
    receptionist_system_prompt: "You are the receptionist for an after-school program. Learn: child's age/grade, school, needed days, and pickup arrangements. Help with enrollment.",
    receptionist_faqs: [
      { question: "What time does the program run?", answer: "We run from school dismissal until 6:00 PM. We provide transportation from partner schools and parents pick up at our facility.", category: "hours" },
      { question: "What do kids do after school?", answer: "We start with a snack, then homework help, followed by enrichment activities like art, STEM, sports, and free play. Every day is different!", category: "activities" },
      { question: "Do you provide transportation from school?", answer: "Yes! We pick up from several local schools. Let me check if your child's school is on our route.", category: "transportation" }
    ],
    receptionist_transfer_triggers: ["caller has a child with special needs or medical requirements", "caller asks about financial assistance", "caller needs emergency/same-day care"],
    wizard_steps: [
      { step_number: 1, title: 'Your Program', description: 'Tell us about your after-school program.', fields: [
        { name: 'business_name', label: 'Program Name', type: 'text', placeholder: 'KidZone After-School', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-1009', required: true },
        { name: 'activities', label: 'Activities offered', type: 'multiselect', placeholder: '', required: true, options: ['Homework Help', 'STEM/Coding', 'Arts & Crafts', 'Sports/Physical Activity', 'Music', 'Drama', 'Reading', 'Cooking', 'Outdoor Play', 'Field Trips'] }
      ]},
      { step_number: 2, title: 'Logistics', description: 'How it works.', fields: [
        { name: 'hours', label: 'Program Hours', type: 'time_range', placeholder: '2:30 PM - 6:00 PM', required: true },
        { name: 'school_pickup', label: 'Provide school pickup?', type: 'toggle', placeholder: '', required: true },
        { name: 'grades_served', label: 'Grades served', type: 'multiselect', placeholder: '', required: true, options: ['K', '1st', '2nd', '3rd', '4th', '5th', '6th-8th'] }
      ]},
      { step_number: 3, title: 'Pricing', description: 'Your rates.', fields: [
        { name: 'weekly_rate', label: 'Weekly rate (5 days)', type: 'currency', placeholder: '150', required: true },
        { name: 'daily_rate', label: 'Daily drop-in rate', type: 'currency', placeholder: '40', required: false },
        { name: 'snack_included', label: 'Snack included?', type: 'toggle', placeholder: '', required: true }
      ]},
      { step_number: 4, title: 'Safety', description: 'Safety and communication.', fields: [
        { name: 'licensed', label: 'State licensed?', type: 'toggle', placeholder: '', required: true },
        { name: 'parent_app', label: 'Use a parent communication app?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'daily-attendance', title: 'Daily Attendance', description: 'Kids checked in today', priority: 1 },
      { id: 'pickups', title: 'Pickup Status', description: 'Kids awaiting pickup', priority: 2 },
      { id: 'new-enrollments', title: 'New Enrollments', description: 'Families signing up', priority: 3 },
      { id: 'capacity', title: 'Program Capacity', description: 'Available spots by day', priority: 4 }
    ],
    sample_tasks: [
      { title: 'New enrollment inquiry', description: 'Parent needs after-school care M-W-F — send info.', category: 'leads', difficulty: 'automatic' },
      { title: 'Late pickup notification', description: 'Parent hasn\'t picked up by 5:45 — call emergency contact.', category: 'safety', difficulty: 'automatic' },
      { title: 'Weekly activity update', description: 'Send parents next week\'s activity schedule.', category: 'communication', difficulty: 'automatic' },
      { title: 'School dismissal change', description: 'Early dismissal Friday — notify all families.', category: 'logistics', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Enrollment', unit: 'count', description: 'Total enrolled students', target_suggestion: 50 },
      { name: 'Daily Attendance', unit: 'percent', description: 'Average daily attendance rate', target_suggestion: 85 },
      { name: 'Parent Satisfaction', unit: 'rating', description: 'Parent satisfaction score', target_suggestion: 4.7 },
      { name: 'Re-Enrollment Rate', unit: 'percent', description: 'Families who return each year', target_suggestion: 80 }
    ],
    suggested_integrations: [
      { name: 'Brightwheel', slug: 'brightwheel', category: 'childcare', why: 'Check-in/check-out, parent communication, billing', priority: 'essential' },
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages activities and field trips', priority: 'essential' },
      { name: 'Stripe', slug: 'stripe', category: 'payments', why: 'Handles weekly tuition and fees', priority: 'recommended' },
      { name: 'Google Maps', slug: 'google-maps', category: 'transportation', why: 'Routes for school pickup', priority: 'nice-to-have' }
    ],
    integration_priority: ['brightwheel', 'google-calendar', 'stripe', 'google-maps'],
    email_templates: [
      { name: 'Enrollment Welcome', subject: 'Welcome to {{business_name}}!', body: "Hi {{parent_name}},\n\n{{child_name}} is enrolled at {{business_name}}!\n\nSchedule: {{schedule}}\nSchool Pickup: {{pickup_info}}\nParent Pickup: By {{closing_time}}\n\nPlease complete the emergency contact form: {{form_link}}\n\nWe're excited to have {{child_name}} join us!\n{{business_name}}", trigger: 'enrollment_complete' },
      { name: 'Weekly Update', subject: 'This Week at {{business_name}}', body: "Hi {{parent_name}},\n\nHere's what's happening this week at {{business_name}}:\n\n{{weekly_activities}}\n\nReminders:\n{{reminders}}\n\nQuestions? Reply or call {{phone}}.\n\n{{business_name}}", trigger: 'weekly_update' }
    ],
    sms_templates: [
      { name: 'Check-In Notification', body: "{{child_name}} has been safely checked in at {{business_name}}. Pickup by {{closing_time}}. Call {{phone}} for early pickup.", trigger: 'check_in' },
      { name: 'Pickup Reminder', body: "Reminder: {{business_name}} closes at {{closing_time}}. If you'll be late picking up {{child_name}}, please call {{phone}} ASAP.", trigger: 'pickup_reminder' }
    ],
    estimated_hours_saved_weekly: 10, estimated_monthly_value: 2000, ideal_plan: 'pro',
    competitor_tools: ['Brightwheel', 'HiMama', 'Sawyer']
  },

  {
    id: 'cooking-classes',
    industry: 'Education & Training', niche: 'Cooking Classes', display_name: 'Cooking School', emoji: '👨‍🍳',
    tagline: 'Fill every class, manage registrations, and turn one-time students into regulars.',
    demo_greeting: "Hi! I'm your AI assistant for a cooking school. I can help with class info, registration, and menus. What cuisine interests you?",
    demo_system_prompt: "You are an AI assistant for a cooking school. Help potential students find the right class, understand what's included, and register. Be passionate about food and cooking.",
    demo_suggested_messages: ["What cooking classes do you offer?", "Can I book a private group class?", "Do I need cooking experience?"],
    soul_template: "You are the AI assistant for {{business_name}}, a cooking school. Help students find classes and register. Be passionate about food and inclusive — cooking is for everyone. Business hours: {{business_hours}}. Phone: {{phone}}.",
    receptionist_greeting: "Thanks for calling {{business_name}}! Are you interested in a cooking class?",
    receptionist_system_prompt: "You are the receptionist for a cooking school. Determine: individual or group, dietary restrictions, cuisine interest, and experience level. Help with class selection and registration.",
    receptionist_faqs: [
      { question: "Do I need cooking experience?", answer: "Not at all! We have classes for all levels — from complete beginners to experienced home cooks looking to refine their skills.", category: "experience" },
      { question: "What's included?", answer: "All ingredients, equipment, recipes, and of course you eat what you make! Just bring yourself and an appetite.", category: "included" },
      { question: "Can I book a private class?", answer: "Yes! We offer private classes for groups — great for date nights, team building, birthdays, and bachelorette parties. Let me get you pricing.", category: "private" }
    ],
    receptionist_transfer_triggers: ["caller wants a corporate team-building event", "caller asks about catering services", "caller has serious food allergies"],
    wizard_steps: [
      { step_number: 1, title: 'Your School', description: 'Tell us about your cooking school.', fields: [
        { name: 'business_name', label: 'School Name', type: 'text', placeholder: 'The Kitchen Studio', required: true },
        { name: 'phone', label: 'Main Phone', type: 'phone', placeholder: '(555) 200-1010', required: true },
        { name: 'cuisines', label: 'Cuisines/topics taught', type: 'multiselect', placeholder: '', required: true, options: ['Italian', 'French', 'Mexican', 'Asian', 'Indian', 'BBQ/Grilling', 'Baking/Pastry', 'Sushi', 'Vegan/Plant-Based', 'Healthy Cooking', 'Kids Cooking', 'Wine Pairing', 'Knife Skills'] }
      ]},
      { step_number: 2, title: 'Classes', description: 'What do you offer?', fields: [
        { name: 'class_types', label: 'Class types', type: 'multiselect', placeholder: '', required: true, options: ['Group Classes', 'Private Lessons', 'Date Night', 'Team Building/Corporate', 'Kids Classes', 'Multi-Week Courses', 'One-Time Workshops', 'Online/Virtual'] },
        { name: 'business_hours', label: 'Kitchen Hours', type: 'time_range', placeholder: '10:00 AM - 9:00 PM', required: true }
      ]},
      { step_number: 3, title: 'Pricing', description: 'Your rates.', fields: [
        { name: 'class_price', label: 'Per-person class price', type: 'currency', placeholder: '75', required: true },
        { name: 'private_group_price', label: 'Private group starting price', type: 'currency', placeholder: '500', required: false }
      ]},
      { step_number: 4, title: 'Details', description: 'Other details.', fields: [
        { name: 'dietary', label: 'Accommodate dietary restrictions?', type: 'toggle', placeholder: '', required: true },
        { name: 'byob', label: 'BYOB allowed?', type: 'toggle', placeholder: '', required: false }
      ]}
    ],
    dashboard_widgets: [
      { id: 'upcoming-classes', title: 'Upcoming Classes', description: 'Classes this week and enrollment', priority: 1 },
      { id: 'new-registrations', title: 'New Registrations', description: 'People signing up', priority: 2 },
      { id: 'private-events', title: 'Private Events', description: 'Upcoming group bookings', priority: 3 },
      { id: 'waitlist', title: 'Waitlisted Classes', description: 'Full classes with people waiting', priority: 4 }
    ],
    sample_tasks: [
      { title: 'Respond to class inquiry', description: 'Couple interested in a date night cooking class — send options.', category: 'leads', difficulty: 'automatic' },
      { title: 'Class prep checklist', description: 'Tomorrow\'s Italian class — generate ingredient prep list.', category: 'operations', difficulty: 'automatic' },
      { title: 'Post-class follow-up', description: 'Send recipes and photos to attendees from last night\'s class.', category: 'engagement', difficulty: 'automatic' },
      { title: 'Corporate event inquiry', description: 'Company wants team-building cooking event — send private event packages.', category: 'leads', difficulty: 'needs-approval' }
    ],
    kpis: [
      { name: 'Registrations', unit: 'per month', description: 'Individual class registrations', target_suggestion: 40 },
      { name: 'Class Fill Rate', unit: 'percent', description: 'Spots filled per class', target_suggestion: 80 },
      { name: 'Repeat Students', unit: 'percent', description: 'Students who take another class', target_suggestion: 40 },
      { name: 'Private Events', unit: 'per month', description: 'Private group bookings', target_suggestion: 4 }
    ],
    suggested_integrations: [
      { name: 'Google Calendar', slug: 'google-calendar', category: 'scheduling', why: 'Manages class schedule and events', priority: 'essential' },
      { name: 'Square', slug: 'square', category: 'payments', why: 'Handles registrations and gift card sales', priority: 'essential' },
      { name: 'Instagram', slug: 'instagram', category: 'social', why: 'Food is visual — share class photos', priority: 'recommended' },
      { name: 'Mailchimp', slug: 'mailchimp', category: 'email', why: 'Promote new classes and share recipes', priority: 'nice-to-have' }
    ],
    integration_priority: ['google-calendar', 'square', 'instagram', 'mailchimp'],
    email_templates: [
      { name: 'Class Confirmation', subject: 'Your Cooking Class at {{business_name}}!', body: "Hi {{client_name}},\n\nYou're registered for:\n\n{{class_name}}\nDate: {{date}}\nTime: {{time}}\n\nWhat to bring: Just yourself and an appetite!\nWhat to wear: Comfortable clothes and closed-toe shoes\nDietary needs: Let us know by replying to this email\n\nAll ingredients, equipment, and recipes are provided. You'll eat everything you make!\n\nBon appétit!\n{{business_name}}", trigger: 'registration_complete' },
      { name: 'Post-Class Recipes', subject: 'Recipes from Last Night\'s Class — {{business_name}}', body: "Hi {{client_name}},\n\nThank you for joining us for {{class_name}}! Here are your recipes from last night:\n\n{{recipes}}\n\nPhotos from the class: {{photo_link}}\n\nWe'd love to see you again! Upcoming classes: {{upcoming_link}}\n\n{{business_name}}", trigger: 'post_class' }
    ],
    sms_templates: [
      { name: 'Class Reminder', body: "Hi {{client_name}}, your cooking class at {{business_name}} is tomorrow at {{time}}! Wear comfy clothes and closed-toe shoes. Come hungry! 👨‍🍳", trigger: 'class_reminder' },
      { name: 'New Class Alert', body: "New at {{business_name}}: {{class_name}} on {{date}}! Spots are limited. Register: {{link}}", trigger: 'new_class' }
    ],
    estimated_hours_saved_weekly: 8, estimated_monthly_value: 1600, ideal_plan: 'pro',
    competitor_tools: ['Square', 'CourseStorm', 'Punchpass']
  }
];
