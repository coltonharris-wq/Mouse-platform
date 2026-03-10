export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getResellerId(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { resellerId } = auth;

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Scan ID required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: scan, error: scanError } = await supabase
      .from("lead_scans")
      .select("*")
      .eq("id", id)
      .eq("reseller_id", resellerId)
      .single();

    if (scanError || !scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    const { data: businesses, error: bizError } = await supabase
      .from("lead_businesses")
      .select("*")
      .eq("scan_id", id)
      .eq("reseller_id", resellerId)
      .order("pain_score", { ascending: false });

    if (bizError) {
      return NextResponse.json(
        { error: "Failed to load businesses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: scan.id,
      status: scan.status,
      vertical: scan.vertical,
      location: scan.location,
      total_found: scan.total_found ?? 0,
      high_priority_count: scan.high_priority_count ?? 0,
      businesses: (businesses ?? []).map((b) => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        email: b.email,
        website: b.website,
        address: b.address,
        city: b.city,
        state: b.state,
        zip: b.zip,
        google_place_id: b.google_place_id,
        google_rating: b.google_rating,
        google_review_count: b.google_review_count,
        pain_signals: b.pain_signals ?? [],
        pain_score: b.pain_score,
        estimated_monthly_calls: b.estimated_monthly_calls,
        estimated_lost_revenue: b.estimated_lost_revenue,
        pipeline_status: b.pipeline_status ?? "new",
        last_outreach_at: b.last_outreach_at,
        outreach_count: b.outreach_count ?? 0,
        created_at: b.created_at,
        updated_at: b.updated_at,
        vertical: scan.vertical,
      })),
    });
  } catch (error: unknown) {
    console.error("Lead finder scan get error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
