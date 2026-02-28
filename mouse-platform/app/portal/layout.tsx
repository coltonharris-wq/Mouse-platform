import PortalSidebar from "@/components/PortalSidebar";
import KingMouseAvatar from "@/components/KingMouseAvatar";
import { portalStats } from "@/lib/seed-data";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mouse-offwhite">
      <PortalSidebar />

      {/* Main content area offset by sidebar width */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top summary bar */}
        <div className="bg-white border-b border-gray-200 w-full">
          <div className="px-6 py-3 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-mouse-slate text-xs">Employees Active:</span>
              <span className="text-mouse-charcoal text-sm font-semibold">
                {portalStats.employeesActive}
              </span>
            </div>

            <div className="w-px h-4 bg-gray-200" />

            <div className="flex items-center gap-2">
              <span className="text-mouse-slate text-xs">Tasks Today:</span>
              <span className="text-mouse-charcoal text-sm font-semibold">
                {portalStats.tasksToday}
              </span>
            </div>

            <div className="w-px h-4 bg-gray-200" />

            <div className="flex items-center gap-2">
              <span className="text-mouse-slate text-xs">Hours Saved:</span>
              <span className="text-mouse-green text-sm font-semibold">
                {portalStats.hoursSaved}
              </span>
            </div>

            <div className="w-px h-4 bg-gray-200" />

            <div className="flex items-center gap-2">
              <span className="text-mouse-slate text-xs">Value Generated:</span>
              <span className="text-mouse-green text-sm font-semibold">
                ${portalStats.valueGenerated.toLocaleString()}
              </span>
            </div>

            <div className="w-px h-4 bg-gray-200" />

            <div className="flex items-center gap-2">
              <span className="text-mouse-slate text-xs">ROI:</span>
              <span className="text-mouse-green text-sm font-semibold">
                {portalStats.roiPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* King Mouse Avatar - Floating */}
      <KingMouseAvatar variant="portal" />
    </div>
  );
}
