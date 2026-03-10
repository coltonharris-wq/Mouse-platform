"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirect /employees/[id] to /portal/employees/[id]
 * Main dashboard lives at portal for layout (sidebar, etc.)
 */
export default function EmployeeDashboardRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/portal/employees/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-pulse text-mouse-slate">Redirecting...</div>
    </div>
  );
}
