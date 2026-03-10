"use client";

import type { VerticalConfig } from "@/lib/employee-dashboard/vertical-configs";
import { CAPABILITIES } from "@/lib/employee-dashboard/vertical-configs";

interface Props {
  config: VerticalConfig;
  metrics: Record<string, number | string>;
}

/**
 * Renders vertical-specific capability highlights.
 * Uses the 10 spec examples as templates; others get a generic view.
 */
export default function VerticalWidgets({ config, metrics }: Props) {
  const highlights = config.highlightCapabilities.map((id) =>
    CAPABILITIES.find((c) => c.id === id)
  ).filter(Boolean);

  return (
    <div className="space-y-4">
      {highlights.map((cap) => (
        <div
          key={cap!.id}
          className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{cap!.icon}</span>
            <h3 className="font-semibold text-mouse-charcoal">{cap!.name}</h3>
            <span className="ml-auto text-xs text-green-600 font-medium">● Active</span>
          </div>
          <VerticalCapabilityContent
            verticalSlug={config.slug}
            capabilityId={cap!.id}
            metrics={metrics}
          />
        </div>
      ))}
    </div>
  );
}

function VerticalCapabilityContent({
  verticalSlug,
  capabilityId,
  metrics,
}: {
  verticalSlug: string;
  capabilityId: number;
  metrics: Record<string, number | string>;
}) {
  // Vertical-specific content for the 10 spec examples
  const content = getVerticalContent(verticalSlug, capabilityId, metrics);
  if (content) {
    return (
      <div className="text-sm text-mouse-slate space-y-2">
        {content}
        <div className="pt-2 flex gap-2">
          <button className="text-xs text-mouse-teal hover:underline font-medium">
            View Details
          </button>
          <button className="text-xs text-mouse-slate hover:underline">
            Adjust
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-mouse-slate">
      <p>Capability active. Activity will populate here.</p>
      <button className="text-xs text-mouse-teal hover:underline font-medium mt-2">
        View Details
      </button>
    </div>
  );
}

function getVerticalContent(
  slug: string,
  capId: number,
  metrics: Record<string, number | string>
): React.ReactNode | null {
  const m = (k: string) => metrics[k] ?? 0;
  switch (slug) {
    case "plumber-pro":
      if (capId === 1)
        return (
          <>
            <p className="font-medium text-mouse-charcoal">This Week&apos;s Alerts:</p>
            <ul className="list-disc list-inside text-mouse-slate">
              <li>No callback complaints detected</li>
              <li>Average response time: —</li>
            </ul>
          </>
        );
      if (capId === 2)
        return (
          <>
            <p>Latest Test: —</p>
            <p>Overall Score: —/10</p>
          </>
        );
      if (capId === 5)
        return (
          <>
            <p>This Month: {m("revenue")} revenue recovered</p>
            <p>Urgency messages: —</p>
          </>
        );
      break;
    case "dentist-pro":
      if (capId === 1)
        return (
          <>
            <p className="font-medium text-mouse-charcoal">Alerts This Week:</p>
            <ul className="list-disc list-inside text-mouse-slate">
              <li>Long wait time mentions</li>
              <li>Insurance confusion trends</li>
            </ul>
          </>
        );
      if (capId === 2)
        return (
          <>
            <p>Latest Test: New Patient Inquiry</p>
            <p>Score: —/10</p>
          </>
        );
      if (capId === 3)
        return (
          <>
            <p>Patient profiles: High priority today</p>
            <p>Recall compliance: {m("recall_rate")}%</p>
          </>
        );
      break;
    case "hvac-pro":
      if (capId === 1)
        return (
          <>
            <p>Seasonal Alert: Service calls —</p>
            <p>Maintenance plans: {m("maintenance_plans")}</p>
          </>
        );
      if (capId === 5)
        return (
          <>
            <p>Spring Tune-up Campaign</p>
            <p>Service calls booked: {m("service_calls")}</p>
          </>
        );
      break;
    case "attorney-pro":
      if (capId === 4)
        return (
          <>
            <p>This Week: Calls screened —</p>
            <p>Qualified consultations: {m("consultations")}</p>
          </>
        );
      if (capId === 3)
        return (
          <>
            <p>Conflict Check System</p>
            <p>Retainers signed: {m("retainers")}</p>
          </>
        );
      break;
    case "restaurant-pro":
      if (capId === 1)
        return (
          <>
            <p>Review Alert: Slow service mentions</p>
            <p>No-show rate: {m("no_show_rate")}%</p>
          </>
        );
      if (capId === 5)
        return (
          <>
            <p>Reservations: {m("reservations")}</p>
            <p>Large party inquiries: {m("large_parties")}</p>
          </>
        );
      break;
    case "salon-pro":
      if (capId === 3)
        return (
          <>
            <p>Client Profiles: Today&apos;s VIPs</p>
            <p>Rebooking rate: {m("rebooking_rate")}%</p>
          </>
        );
      if (capId === 5)
        return (
          <>
            <p>Retail upsells: {m("retail_upsells")}</p>
            <p>No-show rate: {m("no_show_rate")}%</p>
          </>
        );
      break;
    case "gym-pro":
      if (capId === 1)
        return (
          <>
            <p>Member sentiment alerts</p>
            <p>Signups: {m("signups")}</p>
          </>
        );
      if (capId === 3)
        return (
          <>
            <p>Member retention: {m("retention")}%</p>
            <p>Class bookings: {m("class_bookings")}</p>
          </>
        );
      if (capId === 5)
        return (
          <>
            <p>PT inquiries: {m("pt_inquiries")}</p>
          </>
        );
      break;
    case "roofer-pro":
      if (capId === 5)
        return (
          <>
            <p>Storm damage leads: {m("storm_leads")}</p>
            <p>Quotes sent: {m("quotes_sent")}</p>
          </>
        );
      if (capId === 10)
        return (
          <>
            <p>Insurance claims: {m("insurance_claims")}</p>
            <p>Inspections: {m("inspections")}</p>
          </>
        );
      break;
    case "auto-pro":
      if (capId === 3)
        return (
          <>
            <p>Service appointments: {m("appointments")}</p>
            <p>Maintenance reminders: {m("reminders")}</p>
          </>
        );
      if (capId === 5)
        return (
          <>
            <p>Loaner utilization: {m("loaners")}%</p>
            <p>Warranty claims: {m("warranty_claims")}</p>
          </>
        );
      break;
    case "event-pro":
      if (capId === 6)
        return (
          <>
            <p>Event inquiries: {m("inquiries")}</p>
            <p>Venue tours: {m("tours")}</p>
          </>
        );
      if (capId === 8)
        return (
          <>
            <p>Contracts signed: {m("contracts")}</p>
            <p>Vendor tasks: {m("vendor_tasks")}</p>
          </>
        );
      break;
    default:
      // Generic for other 20 verticals
      return (
        <p>
          {Object.entries(metrics)
            .slice(0, 2)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" • ")}
        </p>
      );
  }
  return null;
}

