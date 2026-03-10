/**
 * Map vertical slugs to Google Places search queries.
 */
import type { Vertical } from "@/types/lead-finder";

export const VERTICAL_QUERIES: Record<Vertical, string> = {
  plumbing: "plumbing companies plumbers",
  dental: "dental offices dentists",
  hvac: "HVAC heating cooling contractors",
  electrical: "electricians electrical contractors",
  roofing: "roofing contractors roofers",
  landscaping: "landscaping companies landscapers",
  cleaning: "cleaning services",
  real_estate: "real estate agencies realtors",
  legal: "law firms attorneys",
  accounting: "accounting firms CPA",
  auto_repair: "auto repair mechanics",
  restaurant: "restaurants",
  other: "local businesses",
};
