export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * PATCH /api/onboarding/step
 * Update step progress and answers
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      customerId,
      sessionId,
      step,
      business_type,
      pain_points,
      selected_employee_slug,
      setup_data,
    } = body;

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
      updated_at: new Date().toISOString(),
    };
    if (step != null) updates.current_step = step;
    if (business_type != null) updates.business_type = business_type;
    if (pain_points != null) updates.pain_points = pain_points;
    if (selected_employee_slug != null)
      updates.selected_employee_slug = selected_employee_slug;
    if (setup_data != null) updates.setup_data = setup_data;

    const { data: session, error } = await supabase
      .from("onboarding_sessions")
      .update(updates)
      .eq("id", sessionIdToUse)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log event
    await supabase.from("onboarding_events").insert({
      session_id: sessionIdToUse,
      event_type: "step_completed",
      step_number: step ?? session.current_step,
      metadata: { business_type, pain_points, selected_employee_slug },
    });

    return NextResponse.json({ session });
  } catch (e: unknown) {
    console.error("Onboarding step:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
