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

export async function PATCH(
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
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    const body = await request.json();
    const status = body?.status as string | undefined;

    const validStatuses = [
      "new",
      "contacted",
      "pitched",
      "demo",
      "negotiation",
      "closed",
      "lost",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("lead_businesses")
      .update({
        pipeline_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("reseller_id", resellerId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json({ business: data });
  } catch (error: unknown) {
    console.error("Pipeline update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
