"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CancelContent() {
  const searchParams = useSearchParams();
  const reseller = searchParams.get("reseller");

  return (
    <div className="min-h-screen bg-mouse-offwhite flex flex-col">
      {/* Header */}
      <div className="bg-mouse-navy px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-white font-bold text-xl tracking-tight">
            {reseller || "Automio"}
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-mouse-slate/20 p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-mouse-charcoal mb-2">
            Payment Cancelled
          </h1>
          <p className="text-mouse-slate mb-6">
            Your payment was cancelled. No charges were made to your account.
          </p>

          <div className="space-y-3">
            <a
              href="/login"
              className="block w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-teal-600 transition-colors"
            >
              Try Again
            </a>
            <a
              href="mailto:support@automio.com"
              className="block w-full border border-mouse-slate/30 text-mouse-charcoal py-2.5 rounded-lg font-medium hover:bg-mouse-offwhite transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mouse-offwhite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mouse-teal"></div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}
