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
                <span className="text-gray-500 text-sm font-medium">Employees Active:</span>
                <span className="text-gray-900 text-base font-bold">0</span>
              </div>

              <div className="w-px h-5 bg-gray-300" />

              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm font-medium">Tasks Today:</span>
                <span className="text-gray-900 text-base font-bold">0</span>
              </div>

              <div className="w-px h-5 bg-gray-300" />

              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm font-medium">Hours Saved:</span>
                <span className="text-green-600 text-base font-bold">0</span>
              </div>

              <div className="w-px h-5 bg-gray-300" />

              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm font-medium">Status:</span>
                <span className="text-teal-600 text-base font-bold">Ready</span>
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
