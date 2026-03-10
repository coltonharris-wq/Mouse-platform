/**
 * Yelp Fusion API integration for Lead Finder.
 * Backup to Google Places for review data — more reviews = better pain signals.
 */

const YELP_BASE = "https://api.yelp.com/v3";

function getApiKey(): string {
  const key = process.env.YELP_API_KEY;
  if (!key) {
    throw new Error("YELP_API_KEY required");
  }
  return key;
}

export interface YelpBusiness {
  id: string;
  name: string;
  rating?: number;
  review_count?: number;
  display_phone?: string;
  url?: string;
}

export interface YelpReview {
  id: string;
  text: string;
  rating: number;
}

/**
 * Search Yelp for businesses by term and location.
 */
export async function searchYelpBusinesses(
  term: string,
  location: string,
  limit = 5
): Promise<YelpBusiness[]> {
  const key = getApiKey();

  const params = new URLSearchParams({
    term: term.trim(),
    location: location.trim(),
    limit: String(limit),
  });

  const res = await fetch(`${YELP_BASE}/businesses/search?${params}`, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Yelp search failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const businesses = data.businesses ?? [];

  return businesses.map((b: Record<string, unknown>) => ({
    id: b.id as string,
    name: (b.name as string) ?? "",
    rating: b.rating as number | undefined,
    review_count: b.review_count as number | undefined,
    display_phone: b.display_phone as string | undefined,
    url: b.url as string | undefined,
  }));
}

/**
 * Get reviews for a Yelp business (up to 3 excerpts by default).
 */
export async function getYelpReviews(businessId: string): Promise<string[]> {
  const key = getApiKey();

  const res = await fetch(`${YELP_BASE}/businesses/${businessId}/reviews`, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });

  if (!res.ok) {
    if (res.status === 404) return [];
    const err = await res.text();
    throw new Error(`Yelp reviews failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const reviews = data.reviews ?? [];

  return reviews
    .map((r: { text?: string }) => r.text)
    .filter((t: string): t is string => typeof t === "string" && t.length > 0);
}

/**
 * Find Yelp reviews for a business by name + location.
 * Used to enrich Google Places data with additional review text.
 */
export async function getYelpReviewsForBusiness(
  businessName: string,
  location: string
): Promise<string[]> {
  if (!process.env.YELP_API_KEY) return [];
  try {
    const businesses = await searchYelpBusinesses(businessName, location, 1);
    if (businesses.length === 0) return [];

    const reviews = await getYelpReviews(businesses[0].id);
    return reviews;
  } catch {
    return [];
  }
}
