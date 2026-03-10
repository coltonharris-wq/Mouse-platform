/**
 * Google Places API (New) integration for Lead Finder.
 * Uses: Text Search, Place Details, Geocoding.
 */

const PLACES_BASE = "https://places.googleapis.com/v1";
const GEOCODING_BASE = "https://maps.googleapis.com/maps/api/geocode";

export interface GeoResult {
  lat: number;
  lng: number;
}

export interface PlaceSearchResult {
  id: string;
  name: string;
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  location?: { latitude: number; longitude: number };
}

export interface PlaceDetails {
  id: string;
  name: string;
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  /** Review text for pain signal detection */
  reviewTexts: string[];
}

function getApiKey(): string {
  const key =
    process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY or GOOGLE_GEOCODING_API_KEY required"
    );
  }
  return key;
}

/**
 * Geocode a location string to lat/lng.
 */
export async function geocode(address: string): Promise<GeoResult> {
  const key =
    process.env.GOOGLE_GEOCODING_API_KEY ?? process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    throw new Error(
      "GOOGLE_GEOCODING_API_KEY or GOOGLE_PLACES_API_KEY required"
    );
  }

  const res = await fetch(
    `${GEOCODING_BASE}/json?address=${encodeURIComponent(address)}&key=${key}`
  );
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.[0]) {
    throw new Error(`Geocoding failed: ${data.status ?? "no results"}`);
  }

  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

/**
 * Search for businesses using Places API (New) Text Search.
 */
export async function searchBusinesses(
  query: string,
  location: { lat: number; lng: number },
  radiusMiles: number
): Promise<PlaceSearchResult[]> {
  const key = getApiKey();
  const radiusMeters = Math.min(50000, radiusMiles * 1609.34);

  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount",
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng,
          },
          radius: radiusMeters,
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Places search failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const places = data.places ?? [];

  return places.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: (p.displayName as { text?: string })?.text ?? "",
    formattedAddress: p.formattedAddress as string | undefined,
    rating: p.rating as number | undefined,
    userRatingCount: p.userRatingCount as number | undefined,
    nationalPhoneNumber: p.nationalPhoneNumber as string | undefined,
    websiteUri: p.websiteUri as string | undefined,
    location: p.location as { latitude: number; longitude: number } | undefined,
  }));
}

/**
 * Get place details including reviews (for pain signal detection).
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const key = getApiKey();

  const res = await fetch(`${PLACES_BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,rating,userRatingCount,reviews",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Place details failed: ${res.status} ${err}`);
  }

  const p = await res.json();
  const reviewTexts = (p.reviews ?? [])
    .map((r: { text?: { text: string } }) => r.text?.text ?? "")
    .filter(Boolean);

  return {
    id: p.id ?? placeId,
    name: p.displayName?.text ?? "",
    formattedAddress: p.formattedAddress,
    rating: p.rating,
    userRatingCount: p.userRatingCount,
    nationalPhoneNumber: p.nationalPhoneNumber,
    websiteUri: p.websiteUri,
    reviewTexts,
  };
}
