export const metadata = {
  title: 'Reseller Portal - Mouse Platform',
  description: 'Reseller dashboard for managing clients and commissions',
};

export default function ResellerLayout({
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
              <h1 className="text-xl font-bold text-white">Reseller Portal</h1>
            </div>
            <nav className="flex space-x-4">
              <a href="/reseller/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
              <a href="/reseller/clients" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Clients</a>
              <a href="/reseller/commissions" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Commissions</a>
              <a href="/reseller/marketing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Marketing</a>
            </nav>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
