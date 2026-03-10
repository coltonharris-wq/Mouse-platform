"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  LayoutDashboard,
  Activity,
  Users,
  Package,
  BarChart3,
} from "lucide-react";
import { useEmployees } from "@/app/context/EmployeeContext";
import DashboardHeader from "@/components/employee-dashboard/DashboardHeader";
import CapabilityGrid from "@/components/employee-dashboard/CapabilityGrid";
import ActivityFeed from "@/components/employee-dashboard/ActivityFeed";
import InsightsSection from "@/components/employee-dashboard/InsightsSection";
import CustomerMemoryCard from "@/components/employee-dashboard/CustomerMemoryCard";
import AssetList from "@/components/employee-dashboard/AssetList";
import AnalyticsChart from "@/components/employee-dashboard/AnalyticsChart";
import VerticalWidgets from "@/components/employee-dashboard/VerticalWidgets";
import type { VerticalConfig } from "@/lib/employee-dashboard/vertical-configs";
import { getVerticalConfigBySlugOrName } from "@/lib/employee-dashboard/vertical-configs";

type TabId = "overview" | "activity" | "customers" | "assets" | "analytics";

interface DashboardData {
  employee: {
    id: string;
    name?: string;
    status?: string;
    hours_worked?: number;
    conversations_handled?: number;
    last_active_at?: string;
    created_at?: string;
  };
  config: VerticalConfig;
  metrics: Record<string, number | string>;
  activity: Array<{
    id: string;
    activity_type?: string;
    title?: string;
    description?: string;
    customer_phone?: string;
    customer_email?: string;
    impact_value?: number;
    created_at: string;
  }>;
  capabilities: Array<{
    capability_number: number;
    capability_name?: string;
    enabled: boolean;
    times_used?: number;
    last_used_at?: string;
  }>;
  customers: Array<{
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    tags?: string[];
    note?: string;
    last_value?: number;
  }>;
  assets: Array<{
    id: string;
    name?: string;
    type?: string;
    url?: string;
    created_at?: string;
  }>;
  insights: Array<{
    type: "recommendation" | "alert";
    title: string;
    description: string;
  }>;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "customers", label: "Customers", icon: Users },
  { id: "assets", label: "Assets", icon: Package },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function EmployeeDashboardPage() {
  const params = useParams();
  const id = params.id as string;
  const { getEmployeeById } = useEmployees();
  const [tab, setTab] = useState<TabId>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/employees/${id}/dashboard`);
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setLoading(false);
          return;
        }
        // Build from context employee if API fails
        const ctx = getEmployeeById?.(id);
        if (ctx) {
            const config =
              getVerticalConfigBySlugOrName(ctx.roleDisplay) ||
              getVerticalConfigBySlugOrName(ctx.role) ||
              getVerticalConfigBySlugOrName("plumber-pro");
            if (config) {
              const metrics: Record<string, number | string> = {};
              for (const m of config.metrics) {
                metrics[m.key] = 0;
              }
              setData({
                employee: {
                  id: ctx.id,
                  name: ctx.name,
                  status: ctx.status,
                  hours_worked: ctx.hoursUsed || 0,
                  conversations_handled: ctx.tasksCompleted || 0,
                  created_at: ctx.createdAt?.toISOString(),
                },
                config,
                metrics,
                activity: [],
                capabilities: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
                  capability_number: n,
                  enabled: true,
                  times_used: 0,
                })),
                customers: [],
                assets: [],
                insights: [],
              });
            } else {
              setNotFound(true);
            }
        } else {
          setNotFound(true);
        }
      } catch {
        if (cancelled) return;
        const ctx = getEmployeeById?.(id);
        if (ctx) {
          const config =
            getVerticalConfigBySlugOrName(ctx.roleDisplay) ||
            getVerticalConfigBySlugOrName("plumber-pro");
          if (config) {
            const metrics: Record<string, number | string> = {};
            for (const m of config.metrics) {
              metrics[m.key] = 0;
            }
            setData({
              employee: {
                id: ctx.id,
                name: ctx.name,
                status: ctx.status,
                hours_worked: ctx.hoursUsed || 0,
                conversations_handled: ctx.tasksCompleted || 0,
                created_at: ctx.createdAt?.toISOString(),
              },
              config,
              metrics,
              activity: [],
              capabilities: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
                capability_number: n,
                enabled: true,
                times_used: 0,
              })),
              customers: [],
              assets: [],
              insights: [],
            });
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [id, getEmployeeById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-mouse-slate animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium text-mouse-charcoal mb-2">
          Employee not found
        </p>
        <p className="text-sm text-mouse-slate mb-4">
          This AI employee may not be deployed yet.
        </p>
        <Link
          href="/portal/employees"
          className="text-sm text-mouse-teal hover:underline"
        >
          ← Back to My Employees
        </Link>
      </div>
    );
  }

  const { employee, config, metrics, activity, capabilities, customers, assets, insights } = data;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/portal/employees"
          className="inline-flex items-center gap-1 text-sm text-mouse-teal hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Employees
        </Link>
      </div>

      <DashboardHeader
        config={config}
        employee={employee}
        metrics={metrics}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-mouse-slate/20 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "text-mouse-teal border-b-2 border-mouse-teal -mb-px"
                  : "text-mouse-slate hover:text-mouse-charcoal"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-6">
          <VerticalWidgets config={config} metrics={metrics} />
          <CapabilityGrid capabilities={capabilities} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityFeed activities={activity} maxItems={8} />
            <InsightsSection insights={insights} />
          </div>
        </div>
      )}

      {tab === "activity" && (
        <ActivityFeed activities={activity} maxItems={50} />
      )}

      {tab === "customers" && (
        <CustomerMemoryCard
          customers={customers}
          title="Customer Memory"
          viewAllHref="#"
        />
      )}

      {tab === "assets" && <AssetList assets={assets} />}

      {tab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalyticsChart
            title={`${config.name} Metrics`}
            data={config.metrics.map((m) => ({
              label: m.label,
              value: Number(metrics[m.key] ?? 0),
            }))}
          />
        </div>
      )}
    </div>
  );
}
