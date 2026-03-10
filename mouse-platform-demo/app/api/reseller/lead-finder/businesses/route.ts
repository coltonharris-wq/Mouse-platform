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

/**
 * GET all lead businesses for the reseller (for pipeline board).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getResellerId(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { resellerId } = auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase
      .from("lead_businesses")
      .select("*")
      .eq("reseller_id", resellerId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("pipeline_status", status);
    }

    const { data: businesses, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to load businesses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ businesses: businesses ?? [] });
  } catch (error: unknown) {
    console.error("Businesses get error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
