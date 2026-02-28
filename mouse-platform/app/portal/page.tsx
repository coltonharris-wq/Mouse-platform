import { activityFeed, portalStats } from "@/lib/seed-data";

interface ActivityItem {
  id: string;
  employeeId: string;
  action: string;
  timestamp: string;
  status: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Success
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      Error
    </span>
  );
}

export default function PortalPage() {
  const recentActivity: ActivityItem[] = activityFeed.slice(0, 8);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mouse-charcoal">
          Workforce Command Center
        </h1>
        <p className="text-mouse-slate text-sm mt-1">
          Redwood Construction Co. — Real-time operations overview
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-5">
          <div className="text-2xl font-bold text-mouse-charcoal">
            {portalStats.employeesActive}
          </div>
          <div className="text-mouse-slate text-xs mt-1">Employees Active</div>
        </div>

        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-5">
          <div className="text-2xl font-bold text-mouse-charcoal">
            {portalStats.tasksToday}
          </div>
          <div className="text-mouse-slate text-xs mt-1">
            Tasks Completed Today
          </div>
        </div>

        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-5">
          <div className="text-2xl font-bold text-mouse-green">
            {portalStats.hoursSaved}
          </div>
          <div className="text-mouse-slate text-xs mt-1">
            Hours Saved This Month
          </div>
        </div>

        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-5">
          <div className="text-2xl font-bold text-mouse-green">
            ${portalStats.valueGenerated.toLocaleString()}
          </div>
          <div className="text-mouse-slate text-xs mt-1">Value Generated</div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-mouse-slate/20">
          <h2 className="font-semibold text-mouse-charcoal text-base">
            Recent Activity
          </h2>
        </div>

        <div className="divide-y divide-mouse-slate/10 overflow-y-auto max-h-[480px]">
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="px-5 py-3.5 flex items-start gap-3"
            >
              {/* Teal dot indicator */}
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                  item.status === "success"
                    ? "bg-mouse-teal"
                    : "bg-mouse-red"
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="text-mouse-charcoal text-sm leading-snug">
                  {item.action}
                </div>
                <div className="text-mouse-slate text-xs mt-0.5">
                  {formatTime(item.timestamp)}
                </div>
              </div>

              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
