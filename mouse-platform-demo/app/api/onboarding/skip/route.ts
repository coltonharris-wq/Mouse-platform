export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/onboarding/skip
 * Skip onboarding
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customerId, sessionId } = body;

    const id = sessionId || body.session_id;
    if (!id && !customerId) {
      return NextResponse.json(
        { error: "sessionId or customerId required" },
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

    let sessionIdToUse = id;
    if (!sessionIdToUse && customerId) {
      const { data: s } = await supabase
        .from("onboarding_sessions")
        .select("id")
        .eq("customer_id", customerId)
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      sessionIdToUse = s?.id;
    }

    if (sessionIdToUse) {
      await supabase
        .from("onboarding_sessions")
        .update({
          status: "skipped",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionIdToUse);

      await supabase.from("onboarding_events").insert({
        session_id: sessionIdToUse,
        event_type: "onboarding_skipped",
        step_number: -1,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error("Onboarding skip:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
