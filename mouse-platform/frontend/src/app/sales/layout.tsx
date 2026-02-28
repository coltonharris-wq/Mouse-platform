export const metadata = {
  title: 'Sales Portal - Mouse Platform',
  description: 'Sales dashboard for managing leads and opportunities',
};

export default function SalesLayout({
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
              <h1 className="text-xl font-bold text-white">Sales Portal</h1>
            </div>
            <nav className="flex space-x-4">
              <a href="/sales/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
              <a href="/sales/leads" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Leads</a>
              <a href="/sales/opportunities" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Opportunities</a>
              <a href="/sales/forecast" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Forecast</a>
            </nav>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
