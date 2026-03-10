export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geocode, searchBusinesses, getPlaceDetails } from "@/lib/lead-finder/google-places";
import { getYelpReviewsForBusiness } from "@/lib/lead-finder/yelp";
import { detectPainSignals } from "@/lib/lead-finder/pain-detector";
import {
  estimateMonthlyCalls,
  estimateLostRevenue,
} from "@/lib/lead-finder/calculations";
import { VERTICAL_QUERIES } from "@/lib/lead-finder/vertical-queries";
import type { Vertical } from "@/types/lead-finder";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const MAX_BUSINESSES = 15;
const HIGH_PRIORITY_THRESHOLD = 6;

async function getResellerId(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { error: "Unauthorized", status: 401 as const };

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) return { error: "Invalid token", status: 401 as const };

  const { data: reseller } = await supabase
    .from("resellers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!reseller) return { error: "Reseller account required", status: 403 as const };
  return { resellerId: reseller.id };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getResellerId(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { resellerId } = auth;

    const body = await request.json();
    const vertical = (body?.vertical ?? "plumbing") as Vertical;
    const location = body?.location ?? "";
    const radius = Math.min(50, Math.max(5, Number(body?.radius) || 25));

    if (!location.trim()) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: scan, error: scanError } = await supabase
      .from("lead_scans")
      .insert({
        reseller_id: resellerId,
        vertical,
        location: location.trim(),
        radius_miles: radius,
        status: "running",
      })
      .select("id")
      .single();

    if (scanError || !scan) {
      console.error("Lead scan insert error:", scanError);
      return NextResponse.json(
        { error: "Failed to create scan" },
        { status: 500 }
      );
    }

    const scanId = scan.id;

    try {
      const coords = await geocode(location.trim());
      const query = `${VERTICAL_QUERIES[vertical]} in ${location.trim()}`;
      const places = await searchBusinesses(query, coords, radius);

      const limited = places.slice(0, MAX_BUSINESSES);
      let highPriorityCount = 0;

      for (const place of limited) {
        let details;
        try {
          details = await getPlaceDetails(place.id);
        } catch {
          details = null;
        }

        let reviewTexts = details?.reviewTexts ?? [];
        if (process.env.YELP_API_KEY) {
          try {
            const yelpReviews = await getYelpReviewsForBusiness(
              place.name || details?.name || "",
              location.trim()
            );
            reviewTexts = [...reviewTexts, ...yelpReviews];
          } catch {
            // Yelp optional — continue with Google only
          }
        }
        const { signals, score } = detectPainSignals(reviewTexts);

        const allSignals = [...signals];
        if (!place.websiteUri && !details?.websiteUri) {
          allSignals.push("no_website");
        }

        const reviewCount = place.userRatingCount ?? details?.userRatingCount ?? 0;
        const monthlyCalls = estimateMonthlyCalls(reviewCount);
        const lostRevenue = estimateLostRevenue(reviewCount, vertical);

        if (score >= HIGH_PRIORITY_THRESHOLD || allSignals.includes("no_website")) {
          highPriorityCount++;
        }

        await supabase.from("lead_businesses").insert({
          scan_id: scanId,
          reseller_id: resellerId,
          name: place.name || details?.name || "Unknown",
          phone: place.nationalPhoneNumber ?? details?.nationalPhoneNumber,
          website: place.websiteUri ?? details?.websiteUri,
          address: place.formattedAddress ?? details?.formattedAddress,
          google_place_id: place.id,
          google_rating: place.rating ?? details?.rating,
          google_review_count: reviewCount,
          pain_signals: allSignals,
          pain_score: score,
          estimated_monthly_calls: monthlyCalls,
          estimated_lost_revenue: lostRevenue,
          pipeline_status: "new",
        });
      }

      await supabase
        .from("lead_scans")
        .update({
          status: "completed",
          total_found: limited.length,
          high_priority_count: highPriorityCount,
          completed_at: new Date().toISOString(),
        })
        .eq("id", scanId);
    } catch (err) {
      console.error("Lead scan execution error:", err);
      await supabase
        .from("lead_scans")
        .update({ status: "failed" })
        .eq("id", scanId);
      return NextResponse.json(
        {
          error: "Scan failed",
          detail: err instanceof Error ? err.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scan_id: scanId,
      status: "completed",
      estimated_time: "30 seconds",
    });
  } catch (error: unknown) {
    console.error("Lead finder scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
