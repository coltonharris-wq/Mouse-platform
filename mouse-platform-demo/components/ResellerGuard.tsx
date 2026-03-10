"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResellerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const session = localStorage.getItem("mouse_session");
      const token = localStorage.getItem("mouse_token");
      if (!session || !token) {
        router.replace("/login");
        return;
      }
      const parsed = JSON.parse(session);
      const isReseller = parsed.role === "reseller" || parsed.resellerId;
      const isAdminSwitching = parsed.canSwitchPortals && window.location.pathname.startsWith("/dashboard");
      if (!isReseller && !isAdminSwitching) {
        router.replace("/login");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-mouse-offwhite flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-mouse-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
