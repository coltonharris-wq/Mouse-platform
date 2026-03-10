export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/onboarding/complete
 * Mark onboarding as completed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customerId, sessionId, setup_data } = body;

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

    if (!sessionIdToUse) {
      return NextResponse.json(
        { error: "No onboarding session found" },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (setup_data) updates.setup_data = setup_data;

    const { data: session, error } = await supabase
      .from("onboarding_sessions")
      .update(updates)
      .eq("id", sessionIdToUse)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("onboarding_events").insert({
      session_id: sessionIdToUse,
      event_type: "onboarding_completed",
      step_number: 5,
      metadata: { setup_data },
    });

    return NextResponse.json({ session });
  } catch (e: unknown) {
    console.error("Onboarding complete:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
