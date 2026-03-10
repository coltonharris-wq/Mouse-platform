"use client";

import ResellerSidebar from "@/components/ResellerSidebar";
import KingMouseAvatar from "@/app/components/KingMouseAvatar";
import PortalSwitcher from "@/components/PortalSwitcher";
import ResellerGuard from "@/components/ResellerGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mouse_session');
      localStorage.removeItem('mouse_token');
      window.location.href = '/login';
    }
  };

  return (
    <ResellerGuard>
    <div className="min-h-screen bg-mouse-offwhite">
      <ResellerSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-mouse-slate/20 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <span className="text-mouse-charcoal font-semibold text-base tracking-tight">
            Automio Dashboard
          </span>
          <div className="flex items-center gap-4">
            <PortalSwitcher />
            <button
              onClick={handleLogout}
              className="text-mouse-slate hover:text-red-600 text-sm font-medium transition-colors"
            >
              Logout
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-mouse-navy flex items-center justify-center">
                <span className="text-white text-xs font-semibold">R</span>
              </div>
              <span className="text-sm text-mouse-charcoal font-medium">Reseller</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
      
      <KingMouseAvatar />
    </div>
    </ResellerGuard>
  );
}
