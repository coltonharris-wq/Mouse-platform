export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import {
  getVerticalConfig,
  getVerticalForEmployeeType,
  VERTICAL_CONFIGS,
} from "@/lib/employee-dashboard/vertical-configs";

/**
 * GET /api/employees/[id]/dashboard
 *
 * Returns dashboard data for an employee:
 * - employee info
 * - vertical config (metrics, capabilities)
 * - metrics (placeholder values until real data)
 * - activity
 * - capabilities
 * - customers
 * - assets
 * - insights
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Employee ID required" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  // 1. Fetch hired employee
  const { data: emp, error: empErr } = await supabase
    .from("hired_employees")
    .select("id, employee_name, employee_type, status, config, created_at, vm_id")
    .eq("id", id)
    .single();

  if (empErr || !emp) {
    // Fallback: return mock data for demo (e.g. when employee comes from context)
    return NextResponse.json(buildMockDashboard(id));
  }

  // 2. Resolve vertical config
  const verticalSlug =
    (emp.config as Record<string, unknown>)?.verticalSlug as string | undefined;
  const employeeType = emp.employee_type as string;
  const config =
    (verticalSlug && getVerticalConfig(verticalSlug)) ||
    getVerticalForEmployeeType(employeeType);

  // 3. Build metrics from config (placeholder until real aggregation)
  const metrics: Record<string, number | string> = {};
  for (const m of config.metrics) {
    metrics[m.key] = 0;
  }

  // 4. Placeholder activity, capabilities, customers, assets, insights
  const activity: Array<{
    id: string;
    activity_type?: string;
    title?: string;
    description?: string;
    customer_phone?: string;
    customer_email?: string;
    impact_value?: number;
    created_at: string;
  }> = [];
  const capabilities = config.highlightCapabilities.map((capId, i) => ({
    capability_number: capId,
    capability_name: undefined,
    enabled: true,
    times_used: 0,
    last_used_at: undefined,
  }));
  // Add all 10 capabilities
  const allCapIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const capSet = new Set(capabilities.map((c) => c.capability_number));
  for (const capId of allCapIds) {
    if (!capSet.has(capId)) {
      capabilities.push({
        capability_number: capId,
        capability_name: undefined,
        enabled: true,
        times_used: 0,
        last_used_at: undefined,
      });
    }
  }
  capabilities.sort((a, b) => a.capability_number - b.capability_number);

  const customers: Array<{
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    tags?: string[];
    note?: string;
    last_value?: number;
  }> = [];
  const assets: Array<{
    id: string;
    name?: string;
    type?: string;
    url?: string;
    created_at?: string;
  }> = [];
  const insights: Array<{ type: "recommendation" | "alert"; title: string; description: string }> = [];

  return NextResponse.json({
    employee: {
      id: emp.id,
      name: emp.employee_name,
      status: emp.status || "active",
      hours_worked: 0,
      conversations_handled: 0,
      last_active_at: emp.created_at,
      created_at: emp.created_at,
    },
    config: {
      slug: config.slug,
      name: config.name,
      icon: config.icon,
      category: config.category,
      metrics: config.metrics,
      highlightCapabilities: config.highlightCapabilities,
    },
    metrics,
    activity,
    capabilities,
    customers,
    assets,
    insights,
  });
}

function buildMockDashboard(id: string) {
  const config = Object.values(VERTICAL_CONFIGS)[0]; // plumber-pro
  const metrics: Record<string, number | string> = {};
  for (const m of config.metrics) {
    metrics[m.key] = 0;
  }
  const capabilities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((capId) => ({
    capability_number: capId,
    capability_name: undefined,
    enabled: true,
    times_used: 0,
    last_used_at: undefined,
  }));

  return {
    employee: {
      id,
      name: "Employee",
      status: "active",
      hours_worked: 0,
      conversations_handled: 0,
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    config: {
      slug: config.slug,
      name: config.name,
      icon: config.icon,
      category: config.category,
      metrics: config.metrics,
      highlightCapabilities: config.highlightCapabilities,
    },
    metrics,
    activity: [],
    capabilities,
    customers: [],
    assets: [],
    insights: [],
  };
}
