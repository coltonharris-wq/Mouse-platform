/**
 * Revenue and opportunity estimates for lead businesses.
 * Heuristics based on review volume and vertical.
 */

const AVG_JOB_VALUE_BY_VERTICAL: Record<string, number> = {
  plumbing: 350,
  hvac: 450,
  electrical: 300,
  roofing: 1200,
  dental: 200,
  landscaping: 250,
  cleaning: 150,
  real_estate: 500,
  legal: 800,
  accounting: 400,
  auto_repair: 400,
  restaurant: 100,
  other: 250,
};

const MISSED_CALL_RATE = 0.3; // ~30% of calls go unanswered for SMBs

/**
 * Estimate monthly call volume from review count.
 * Reviews correlate with customer volume; assume ~2 calls per review per month.
 */
export function estimateMonthlyCalls(reviewCount: number): number {
  return Math.max(10, Math.min(500, Math.round(reviewCount * 2)));
}

/**
 * Estimate lost revenue from missed calls.
 * Based on vertical avg job value, monthly calls, and typical miss rate.
 */
export function estimateLostRevenue(
  reviewCount: number,
  vertical: string
): number {
  const monthlyCalls = estimateMonthlyCalls(reviewCount);
  const avgJobValue =
    AVG_JOB_VALUE_BY_VERTICAL[vertical] ??
    AVG_JOB_VALUE_BY_VERTICAL.other;
  return Math.round(monthlyCalls * avgJobValue * MISSED_CALL_RATE);
}
