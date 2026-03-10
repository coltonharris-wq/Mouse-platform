export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/onboarding/start
 * Create or resume onboarding session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const customerId = body.customerId || request.headers.get("x-customer-id");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Check for existing in-progress session
    const { data: existing } = await supabase
      .from("onboarding_sessions")
      .select("id, current_step, status, business_type, pain_points")
      .eq("customer_id", customerId)
      .eq("status", "in_progress")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        session: existing,
        resumed: true,
      });
    }

    // Create new session
    const { data: session, error } = await supabase
      .from("onboarding_sessions")
      .insert({
        customer_id: customerId,
        current_step: 0,
        status: "in_progress",
      })
      .select()
      .single();

    if (error) {
      console.error("Onboarding start error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Log event
    await supabase.from("onboarding_events").insert({
      session_id: session.id,
      event_type: "session_started",
      step_number: 0,
    });

    return NextResponse.json({ session, resumed: false });
  } catch (e: unknown) {
    console.error("Onboarding start:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
