import ResellerSidebar from "@/components/ResellerSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mouse-offwhite">
      <ResellerSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-mouse-slate/20 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <span className="text-mouse-charcoal font-semibold text-base tracking-tight">
            Automio Dashboard
          </span>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-mouse-navy flex items-center justify-center">
              <span className="text-white text-xs font-semibold">A</span>
            </div>
            <span className="text-sm text-mouse-charcoal font-medium">Admin</span>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
