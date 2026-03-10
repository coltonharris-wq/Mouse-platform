export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { ACTION_TYPES } from "@/lib/scheduled-actions/types";

/**
 * GET /api/scheduled-actions/types
 * List available action types
 */
export async function GET() {
  return NextResponse.json({ types: ACTION_TYPES });
}
