/**
 * Vertical-specific configs for all 30 AI employees.
 * Metrics, capability highlights, and widget mappings.
 */

export const CAPABILITIES = [
  { id: 1, name: "Silent Failure Detector", icon: "🧠" },
  { id: 2, name: "AI Secret Shopper", icon: "🕵️" },
  { id: 3, name: "Real Customer Memory", icon: "🧠" },
  { id: 4, name: "Attention Filter", icon: "⏱️" },
  { id: 5, name: "Urgency Creator", icon: "🔥" },
  { id: 6, name: "System Improvement", icon: "🧩" },
  { id: 7, name: "Owner Brain Clone", icon: "🧬" },
  { id: 8, name: "Asset Builder", icon: "🧨" },
  { id: 9, name: "Strategic Silence", icon: "🧠" },
  { id: 10, name: "Product Idea Machine", icon: "⚡" },
];

export interface VerticalMetric {
  key: string;
  label: string;
  value: string | number;
  format?: "number" | "currency" | "percent";
}

export interface VerticalConfig {
  slug: string;
  name: string;
  icon: string;
  category: string;
  metrics: { key: string; label: string; format?: "number" | "currency" | "percent" }[];
  highlightCapabilities: number[]; // capability IDs to feature
}

export const VERTICAL_CONFIGS: Record<string, VerticalConfig> = {
  "plumber-pro": {
    slug: "plumber-pro",
    name: "Plumber Pro",
    icon: "🪠",
    category: "home-services",
    metrics: [
      { key: "emergency_calls", label: "Emergency Calls", format: "number" },
      { key: "appointments_booked", label: "Appointments Booked", format: "number" },
      { key: "maintenance_plans", label: "Maintenance Plans Sold", format: "number" },
      { key: "revenue", label: "Revenue Generated", format: "currency" },
    ],
    highlightCapabilities: [1, 2, 5],
  },
  "hvac-pro": {
    slug: "hvac-pro",
    name: "HVAC Pro",
    icon: "❄️",
    category: "home-services",
    metrics: [
      { key: "service_calls", label: "Service Calls Booked", format: "number" },
      { key: "maintenance_plans", label: "Maintenance Plans Active", format: "number" },
      { key: "tune_ups", label: "Tune-ups Scheduled", format: "number" },
      { key: "emergency_rate", label: "Emergency Response Rate", format: "percent" },
    ],
    highlightCapabilities: [1, 5],
  },
  "roofer-pro": {
    slug: "roofer-pro",
    name: "Roofer Pro",
    icon: "🏠",
    category: "home-services",
    metrics: [
      { key: "inspections", label: "Inspection Requests", format: "number" },
      { key: "quotes_sent", label: "Quotes Sent", format: "number" },
      { key: "storm_leads", label: "Storm Damage Leads", format: "number" },
      { key: "insurance_claims", label: "Insurance Claims", format: "number" },
    ],
    highlightCapabilities: [5, 10],
  },
  "appliance-pro": {
    slug: "appliance-pro",
    name: "Appliance Pro",
    icon: "🔧",
    category: "home-services",
    metrics: [
      { key: "service_calls", label: "Service Calls", format: "number" },
      { key: "parts_ordered", label: "Parts Ordered", format: "number" },
      { key: "warranty_checks", label: "Warranty Verifications", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [3, 6],
  },
  "lawn-pro": {
    slug: "lawn-pro",
    name: "Lawn Pro",
    icon: "🌳",
    category: "home-services",
    metrics: [
      { key: "programs_enrolled", label: "Programs Enrolled", format: "number" },
      { key: "reschedules", label: "Weather Reschedules", format: "number" },
      { key: "upsells", label: "Hardscape Upsells", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [5, 8],
  },
  "pest-pro": {
    slug: "pest-pro",
    name: "Pest Pro",
    icon: "🐜",
    category: "home-services",
    metrics: [
      { key: "calls_handled", label: "Calls Handled", format: "number" },
      { key: "emergencies", label: "Emergencies Triaged", format: "number" },
      { key: "prevention_plans", label: "Prevention Plans", format: "number" },
      { key: "follow_ups", label: "Follow-ups Scheduled", format: "number" },
    ],
    highlightCapabilities: [1, 4, 5],
  },
  "electrician-pro": {
    slug: "electrician-pro",
    name: "Electrician Pro",
    icon: "🔌",
    category: "home-services",
    metrics: [
      { key: "service_calls", label: "Service Calls", format: "number" },
      { key: "ev_installs", label: "EV Charger Inquiries", format: "number" },
      { key: "permits", label: "Permit Checks", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [4, 10],
  },
  "contractor-pro": {
    slug: "contractor-pro",
    name: "Contractor Pro",
    icon: "🏗️",
    category: "home-services",
    metrics: [
      { key: "projects_qualified", label: "Projects Qualified", format: "number" },
      { key: "quotes_sent", label: "Quotes Sent", format: "number" },
      { key: "permits", label: "Permits Tracked", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [4, 6, 8],
  },
  "dentist-pro": {
    slug: "dentist-pro",
    name: "Dentist Pro",
    icon: "🦷",
    category: "health-wellness",
    metrics: [
      { key: "new_patients", label: "New Patient Calls", format: "number" },
      { key: "appointments", label: "Appointments Scheduled", format: "number" },
      { key: "insurance_verifications", label: "Insurance Verifications", format: "number" },
      { key: "recall_rate", label: "Recall Compliance", format: "percent" },
    ],
    highlightCapabilities: [1, 2, 3],
  },
  "chiro-pro": {
    slug: "chiro-pro",
    name: "Chiro Pro",
    icon: "🦴",
    category: "health-wellness",
    metrics: [
      { key: "new_patients", label: "New Patient Intakes", format: "number" },
      { key: "care_plans", label: "Care Plans Enrolled", format: "number" },
      { key: "reminders", label: "Reminders Sent", format: "number" },
      { key: "retention", label: "Retention Rate", format: "percent" },
    ],
    highlightCapabilities: [3, 5],
  },
  "med-spa-pro": {
    slug: "med-spa-pro",
    name: "Med Spa Pro",
    icon: "💉",
    category: "health-wellness",
    metrics: [
      { key: "consultations", label: "Consultations Booked", format: "number" },
      { key: "memberships", label: "Memberships Enrolled", format: "number" },
      { key: "upsells", label: "Upsells", format: "number" },
      { key: "reviews", label: "Reviews Generated", format: "number" },
    ],
    highlightCapabilities: [3, 5, 8],
  },
  "therapy-pro": {
    slug: "therapy-pro",
    name: "Therapy Pro",
    icon: "🧠",
    category: "health-wellness",
    metrics: [
      { key: "intakes", label: "Intakes Completed", format: "number" },
      { key: "crisis_triage", label: "Crisis Triage", format: "number" },
      { key: "reminders", label: "Session Reminders", format: "number" },
      { key: "retention", label: "Client Retention", format: "percent" },
    ],
    highlightCapabilities: [4, 9],
  },
  "gym-pro": {
    slug: "gym-pro",
    name: "Gym Pro",
    icon: "💪",
    category: "health-wellness",
    metrics: [
      { key: "signups", label: "New Member Sign-ups", format: "number" },
      { key: "class_bookings", label: "Class Bookings", format: "number" },
      { key: "retention", label: "Membership Retention", format: "percent" },
      { key: "pt_inquiries", label: "PT Inquiries", format: "number" },
    ],
    highlightCapabilities: [1, 3, 5],
  },
  "salon-pro": {
    slug: "salon-pro",
    name: "Salon Pro",
    icon: "💇",
    category: "health-wellness",
    metrics: [
      { key: "appointments", label: "Appointments Booked", format: "number" },
      { key: "rebooking_rate", label: "Rebooking Rate", format: "percent" },
      { key: "retail_upsells", label: "Retail Upsells", format: "number" },
      { key: "no_show_rate", label: "No-Show Rate", format: "percent" },
    ],
    highlightCapabilities: [3, 5],
  },
  "attorney-pro": {
    slug: "attorney-pro",
    name: "Attorney Pro",
    icon: "⚖️",
    category: "professional-services",
    metrics: [
      { key: "consultations", label: "Consultation Calls", format: "number" },
      { key: "retainers", label: "Retainers Signed", format: "number" },
      { key: "intakes", label: "Case Intakes", format: "number" },
      { key: "hours_saved", label: "Billable Hours Protected", format: "number" },
    ],
    highlightCapabilities: [4, 3],
  },
  "cpa-pro": {
    slug: "cpa-pro",
    name: "CPA Pro",
    icon: "📊",
    category: "professional-services",
    metrics: [
      { key: "documents", label: "Documents Collected", format: "number" },
      { key: "extensions", label: "Extensions Filed", format: "number" },
      { key: "reminders", label: "Reminders Sent", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [3, 5, 8],
  },
  "insurance-pro": {
    slug: "insurance-pro",
    name: "Insurance Pro",
    icon: "🏢",
    category: "professional-services",
    metrics: [
      { key: "quotes", label: "Quotes Generated", format: "number" },
      { key: "renewals", label: "Renewals Processed", format: "number" },
      { key: "claims", label: "Claims Reported", format: "number" },
      { key: "cross_sells", label: "Cross-sells", format: "number" },
    ],
    highlightCapabilities: [3, 5, 10],
  },
  "realtor-pro": {
    slug: "realtor-pro",
    name: "Realtor Pro",
    icon: "🏡",
    category: "professional-services",
    metrics: [
      { key: "buyers_qualified", label: "Buyers Qualified", format: "number" },
      { key: "showings", label: "Showings Coordinated", format: "number" },
      { key: "contracts", label: "Contracts Tracked", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [4, 6, 8],
  },
  "consultant-pro": {
    slug: "consultant-pro",
    name: "Consultant Pro",
    icon: "💼",
    category: "professional-services",
    metrics: [
      { key: "discovery_calls", label: "Discovery Calls", format: "number" },
      { key: "proposals", label: "Proposals Sent", format: "number" },
      { key: "retainers", label: "Retainers Renewed", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [5, 7, 8],
  },
  "creative-pro": {
    slug: "creative-pro",
    name: "Creative Pro",
    icon: "📸",
    category: "professional-services",
    metrics: [
      { key: "inquiries", label: "Projekt Inquiries", format: "number" },
      { key: "contracts", label: "Contracts Signed", format: "number" },
      { key: "revisions", label: "Revision Rounds", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [8, 5],
  },
  "restaurant-pro": {
    slug: "restaurant-pro",
    name: "Restaurant Pro",
    icon: "🍽️",
    category: "retail-food",
    metrics: [
      { key: "reservations", label: "Reservations Booked", format: "number" },
      { key: "no_show_rate", label: "No-Show Rate", format: "percent" },
      { key: "large_parties", label: "Large Party Inquiries", format: "number" },
      { key: "catering_quotes", label: "Catering Quotes", format: "number" },
    ],
    highlightCapabilities: [1, 5],
  },
  "food-truck-pro": {
    slug: "food-truck-pro",
    name: "Food Truck Pro",
    icon: "🚚",
    category: "retail-food",
    metrics: [
      { key: "location_updates", label: "Location Updates", format: "number" },
      { key: "events_booked", label: "Events Booked", format: "number" },
      { key: "pre_orders", label: "Pre-orders", format: "number" },
      { key: "loyalty_signups", label: "Loyalty Signups", format: "number" },
    ],
    highlightCapabilities: [5, 10],
  },
  "retail-pro": {
    slug: "retail-pro",
    name: "Retail Pro",
    icon: "🛒",
    category: "retail-food",
    metrics: [
      { key: "availability_checks", label: "Availability Checks", format: "number" },
      { key: "appointments", label: "Appointment Shopping", format: "number" },
      { key: "loyalty", label: "Loyalty Enrollments", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [3, 6],
  },
  "dispensary-pro": {
    slug: "dispensary-pro",
    name: "Dispensary Pro",
    icon: "🌿",
    category: "retail-food",
    metrics: [
      { key: "recommendations", label: "Recommendations Given", format: "number" },
      { key: "loyalty_points", label: "Loyalty Points Redeemed", format: "number" },
      { key: "new_drops", label: "New Drop Notifications", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [3, 8],
  },
  "brewery-pro": {
    slug: "brewery-pro",
    name: "Brewery Pro",
    icon: "🍺",
    category: "retail-food",
    metrics: [
      { key: "tours_booked", label: "Tours Booked", format: "number" },
      { key: "events", label: "Private Events", format: "number" },
      { key: "mug_club", label: "Mug Club Signups", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [5, 8],
  },
  "auto-pro": {
    slug: "auto-pro",
    name: "Auto Pro",
    icon: "🚗",
    category: "specialized",
    metrics: [
      { key: "appointments", label: "Service Appointments", format: "number" },
      { key: "reminders", label: "Maintenance Reminders", format: "number" },
      { key: "loaners", label: "Loaner Utilization", format: "percent" },
      { key: "warranty_claims", label: "Warranty Claims", format: "number" },
    ],
    highlightCapabilities: [3, 5],
  },
  "pet-pro": {
    slug: "pet-pro",
    name: "Pet Pro",
    icon: "🐕",
    category: "specialized",
    metrics: [
      { key: "appointments", label: "Appointments Booked", format: "number" },
      { key: "vaccination_reminders", label: "Vaccination Reminders", format: "number" },
      { key: "boarding", label: "Booking Availability", format: "number" },
      { key: "emergencies", label: "Emergencies Triaged", format: "number" },
    ],
    highlightCapabilities: [4, 5],
  },
  "tutor-pro": {
    slug: "tutor-pro",
    name: "Tutor Pro",
    icon: "📚",
    category: "specialized",
    metrics: [
      { key: "sessions_booked", label: "Sessions Booked", format: "number" },
      { key: "packages", label: "Packages Enrolled", format: "number" },
      { key: "progress_updates", label: "Progress Updates", format: "number" },
      { key: "retention", label: "Retention Rate", format: "percent" },
    ],
    highlightCapabilities: [3, 5],
  },
  "event-pro": {
    slug: "event-pro",
    name: "Event Pro",
    icon: "🎉",
    category: "specialized",
    metrics: [
      { key: "inquiries", label: "Event Inquiries", format: "number" },
      { key: "tours", label: "Venue Tours", format: "number" },
      { key: "contracts", label: "Contracts Signed", format: "number" },
      { key: "vendor_tasks", label: "Vendor Tasks", format: "number" },
    ],
    highlightCapabilities: [6, 8],
  },
  "cleaning-pro": {
    slug: "cleaning-pro",
    name: "Cleaning Pro",
    icon: "🧹",
    category: "specialized",
    metrics: [
      { key: "quotes", label: "Quotes Sent", format: "number" },
      { key: "recurring", label: "Recurring Setup", format: "number" },
      { key: "quality_followups", label: "Quality Follow-ups", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
    ],
    highlightCapabilities: [3, 5, 6],
  },
};

export const VERTICAL_SLUGS = Object.keys(VERTICAL_CONFIGS);

export function getVerticalConfig(slug: string): VerticalConfig | null {
  const normalized = slug.replace(/_/g, "-").toLowerCase();
  return VERTICAL_CONFIGS[normalized] ?? null;
}

export function getVerticalConfigBySlugOrName(slugOrName: string): VerticalConfig | null {
  const lower = slugOrName.toLowerCase().replace(/\s+/g, "-");
  for (const config of Object.values(VERTICAL_CONFIGS)) {
    if (config.slug === lower || config.name.toLowerCase().replace(/\s+/g, "-") === lower) return config;
  }
  return null;
}

/** Map internal employee_type (king-mouse, sales, etc.) to vertical slug */
export const EMPLOYEE_TYPE_TO_VERTICAL: Record<string, string> = {
  "king-mouse": "plumber-pro",
  sales: "consultant-pro",
  support: "restaurant-pro",
  developer: "creative-pro",
  analyst: "cpa-pro",
  custom: "consultant-pro",
  "lead-funnel": "realtor-pro",
  "customer-support": "restaurant-pro",
  operations: "contractor-pro",
};

export function getVerticalForEmployeeType(employeeType: string): VerticalConfig {
  const t = (employeeType || "").toLowerCase();
  const bySlug = getVerticalConfigBySlugOrName(employeeType || "");
  if (bySlug) return bySlug;
  const slug = EMPLOYEE_TYPE_TO_VERTICAL[t] || "plumber-pro";
  return VERTICAL_CONFIGS[slug] ?? VERTICAL_CONFIGS["plumber-pro"];
}
