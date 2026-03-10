export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { cronFromSchedule } from "@/lib/scheduled-actions/types";

/**
 * GET /api/scheduled-actions/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("scheduled_actions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ action: data });
}

/**
 * PATCH /api/scheduled-actions/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseServer();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.name != null) updates.name = body.name;
  if (body.employee_id != null) updates.employee_id = body.employee_id;
  if (body.frequency != null) updates.frequency = body.frequency;
  if (body.schedule_config != null) updates.schedule_config = body.schedule_config;
  if (body.settings != null) updates.settings = body.settings;

  if (body.frequency != null || body.schedule_config != null) {
    const config = body.schedule_config || {};
    updates.cron_expression = cronFromSchedule(
      body.frequency || "daily",
      config
    );
  }

  const { data, error } = await supabase
    .from("scheduled_actions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ action: data });
}

/**
 * DELETE /api/scheduled-actions/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServer();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  const { error } = await supabase.from("scheduled_actions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
