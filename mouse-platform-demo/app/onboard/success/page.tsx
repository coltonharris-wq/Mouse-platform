"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";


interface ResellerBranding {
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fromEmail?: string;
}

function OnboardSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branding, setBranding] = useState<ResellerBranding | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("Invalid session");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/onboarding/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify payment");
        }

        setCustomerData(data.customer);
        setBranding(data.branding);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mouse-offwhite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mouse-teal mx-auto mb-4"></div>
          <p className="text-mouse-slate">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mouse-offwhite px-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-mouse-charcoal mb-2">Something went wrong</h1>
          <p className="text-mouse-slate mb-6">{error}</p>
          <a
            href="/login"
            className="inline-block bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-600 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const primaryColor = branding?.primaryColor || "#0F6B6E";
  const companyName = branding?.companyName || "Automio";

  return (
    <div className="min-h-screen bg-mouse-offwhite flex flex-col">
      <div 
        className="px-6 py-4"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt={companyName} className="h-8" />
          ) : (
            <span className="text-white font-bold text-xl tracking-tight">
              {companyName}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-mouse-slate/20 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-mouse-charcoal mb-2">
            Welcome to {companyName}!
          </h1>
          <p className="text-mouse-slate mb-6">
            Your payment was successful. Your AI workforce account is now active.
          </p>

          <div className="bg-mouse-offwhite rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-mouse-charcoal mb-4">Your Account Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-mouse-slate">Business:</span>
                <span className="font-medium text-mouse-charcoal">{customerData?.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mouse-slate">Email:</span>
                <span className="font-medium text-mouse-charcoal">{customerData?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mouse-slate">Plan:</span>
                <span className="font-medium text-mouse-charcoal capitalize">{customerData?.planTier}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Check your email!</strong> We&apos;ve sent your login credentials to {customerData?.email}
            </p>
          </div>

          <a
            href="/login"
            className="block w-full text-white py-3 rounded-lg font-semibold text-base transition-colors mb-3"
            style={{ backgroundColor: primaryColor }}
          >
            Log In to Your Account
          </a>

          <p className="text-mouse-slate text-sm">
            Questions? Contact{" "}
            <a href={`mailto:${branding?.fromEmail || 'support@automio.com'}`} className="text-mouse-teal hover:underline">
              {branding?.fromEmail || 'support@automio.com'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mouse-offwhite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mouse-teal mx-auto mb-4"></div>
          <p className="text-mouse-slate">Loading...</p>
        </div>
      </div>
    }>
      <OnboardSuccessContent />
    </Suspense>
  );
}
