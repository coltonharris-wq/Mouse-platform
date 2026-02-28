import { redirect } from 'next/navigation';

// This page redirects to the appropriate dashboard based on user role
export default function DashboardIndex() {
  // Client-side redirect will happen in layout
  // This is a fallback for server-side
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#1e3a5f] font-medium">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
