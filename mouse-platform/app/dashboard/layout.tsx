'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    
    // Validate role-based access
    const allowedPaths: Record<string, string[]> = {
      admin: ['/dashboard/admin'],
      sales: ['/dashboard/sales'],
      reseller: ['/dashboard/reseller'],
      customer: ['/dashboard/customer'],
    };

    const userAllowedPaths = allowedPaths[userData.role] || [];
    const isAllowed = userAllowedPaths.some(path => pathname.startsWith(path));

    if (!isAllowed && pathname !== '/dashboard') {
      // Redirect to their appropriate dashboard
      router.push(`/dashboard/${userData.role}`);
      return;
    }

    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#1e3a5f] font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
