"use client";

import PortalSidebar from "@/components/PortalSidebar";
import KingMouseAvatar from "@/app/components/KingMouseAvatar";
import PortalSwitcher from "@/components/PortalSwitcher";
import { ToastProvider } from "@/components/ToastProvider";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-mouse-offwhite">
        <PortalSidebar />

        <div className="ml-64 flex flex-col min-h-screen">
          {/* Top summary bar */}
          <div className="bg-white border-b border-gray-200 w-full">
            <div className="px-6 py-3 flex items-center gap-6 flex-wrap">
              {/* Portal Switcher (admin only) */}
              <PortalSwitcher />

              <div className="flex items-center gap-2">
                <span className="text-mouse-slate text-xs">Employees Active:</span>
                <span className="text-mouse-charcoal text-sm font-semibold">0</span>
              </div>

              <div className="w-px h-4 bg-gray-200" />

              <div className="flex items-center gap-2">
                <span className="text-mouse-slate text-xs">Tasks Today:</span>
                <span className="text-mouse-charcoal text-sm font-semibold">0</span>
              </div>

              <div className="w-px h-4 bg-gray-200" />

              <div className="flex items-center gap-2">
                <span className="text-mouse-slate text-xs">Hours Saved:</span>
                <span className="text-mouse-green text-sm font-semibold">0</span>
              </div>

              <div className="w-px h-4 bg-gray-200" />

              <div className="flex items-center gap-2">
                <span className="text-mouse-slate text-xs">Status:</span>
                <span className="text-mouse-teal text-sm font-semibold">Ready</span>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6">{children}</main>
        </div>

        <KingMouseAvatar />
      </div>
    </ToastProvider>
  );
}
