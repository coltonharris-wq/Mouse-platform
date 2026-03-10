export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { cronFromSchedule } from "@/lib/scheduled-actions/types";

function getCustomerId(req: NextRequest): string | null {
  const auth = req.headers.get("x-customer-id");
  if (auth) return auth;
  return null;
}

/**
 * GET /api/scheduled-actions?customerId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId") || getCustomerId(request);

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

    const { data, error } = await supabase
      .from("scheduled_actions")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ actions: data || [] });
  } catch (e: unknown) {
    console.error("Scheduled actions list:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scheduled-actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      customerId,
      employeeId,
      name,
      action_type,
      capability_number,
      frequency,
      schedule_config,
      settings,
    } = body;

    const cid = customerId || getCustomerId(request);
    if (!cid) {
      return NextResponse.json(
        { error: "customerId required" },
        { status: 400 }
      );
    }

    if (!action_type || !name) {
      return NextResponse.json(
        { error: "action_type and name required" },
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

    const config = schedule_config || {};
    const cron = cronFromSchedule(frequency || "daily", config);

    // Compute next_run_at (simplified - would use proper cron parser in production)
    const nextRun = new Date();
    nextRun.setHours(config.time ? parseInt(config.time.split(":")[0], 10) : 16, config.time ? parseInt(config.time.split(":")[1], 10) : 0, 0, 0);
    if (nextRun <= new Date()) nextRun.setDate(nextRun.getDate() + 1);

    const { data, error } = await supabase
      .from("scheduled_actions")
      .insert({
        customer_id: cid,
        employee_id: employeeId || null,
        name,
        action_type,
        capability_number: capability_number ?? null,
        frequency: frequency || "daily",
        schedule_config: config,
        cron_expression: cron,
        settings: settings || {},
        status: "active",
        next_run_at: nextRun.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ action: data });
  } catch (e: unknown) {
    console.error("Scheduled actions create:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
