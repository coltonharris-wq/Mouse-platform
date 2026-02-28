export const metadata = {
  title: 'Customer Portal - Mouse Platform',
  description: 'Customer portal for managing your AI employees and account',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="bg-dark-surface border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Customer Portal</h1>
            </div>
            <nav className="flex space-x-4">
              <a href="/portal/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Overview</a>
              <a href="/portal/employees" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">My Employees</a>
              <a href="/portal/billing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Billing</a>
              <a href="/portal/support" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Support</a>
            </nav>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
