/**
 * Vertical-specific widget exports.
 * Each vertical can have custom widgets; lazy-load via dynamic import.
 */
import type { VerticalConfig } from "@/lib/employee-dashboard/vertical-configs";
import { VERTICAL_SLUGS } from "@/lib/employee-dashboard/vertical-configs";

export { VERTICAL_SLUGS };

export type VerticalWidgetProps = {
  config: VerticalConfig;
  metrics: Record<string, number | string>;
};

// Vertical slugs for all 30 employees
export const ALL_VERTICAL_SLUGS = [
  "plumber-pro",
  "hvac-pro",
  "roofer-pro",
  "appliance-pro",
  "lawn-pro",
  "pest-pro",
  "electrician-pro",
  "contractor-pro",
  "dentist-pro",
  "chiro-pro",
  "med-spa-pro",
  "therapy-pro",
  "gym-pro",
  "salon-pro",
  "attorney-pro",
  "cpa-pro",
  "insurance-pro",
  "realtor-pro",
  "consultant-pro",
  "creative-pro",
  "restaurant-pro",
  "food-truck-pro",
  "retail-pro",
  "dispensary-pro",
  "brewery-pro",
  "auto-pro",
  "pet-pro",
  "tutor-pro",
  "event-pro",
  "cleaning-pro",
] as const;
