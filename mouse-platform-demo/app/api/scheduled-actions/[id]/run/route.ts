export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/scheduled-actions/[id]/run
 * Manual trigger - run now
 */
export async function POST(
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

  const { data: action, error: fetchErr } = await supabase
    .from("scheduled_actions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !action) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: "Run triggered. Backend cron will execute this action.",
    run_id: null,
  });
}
