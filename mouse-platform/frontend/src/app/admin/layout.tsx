export const metadata = {
  title: 'Admin Portal - Mouse Platform',
  description: 'Admin dashboard for managing the platform',
};

export default function AdminLayout({
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
              <h1 className="text-xl font-bold text-white">Admin Portal</h1>
            </div>
            <nav className="flex space-x-4">
              <a href="/admin/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
              <a href="/admin/users" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Users</a>
              <a href="/admin/orders" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Orders</a>
              <a href="/admin/settings" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Settings</a>
            </nav>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
