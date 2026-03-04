"use client";

import AdminSidebar from "@/components/AdminSidebar";
import KingMouseAvatar from "@/app/components/KingMouseAvatar";
import PortalSwitcher from "@/components/PortalSwitcher";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mouse-offwhite">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <header className="bg-mouse-navy px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <span className="text-white font-semibold text-base tracking-tight">
            Admin Console
          </span>
          <div className="flex items-center gap-4">
            <PortalSwitcher />
            <span className="text-xs text-white font-medium bg-white/20 px-3 py-1 rounded-full">
              Platform Owner
            </span>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
      
      {/* King Mouse Avatar - Floating */}
      <KingMouseAvatar />
    </div>
  );
}
