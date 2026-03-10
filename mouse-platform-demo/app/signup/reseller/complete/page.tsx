"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

function ResellerCompleteContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [setPasswordLink, setSetPasswordLink] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing payment session. Please try again.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/reseller/complete-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Something went wrong.");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Account created!");
        setSetPasswordLink(data.setPasswordLink || null);
      } catch {
        setStatus("error");
        setMessage("Failed to complete signup.");
      }
    })();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Completing your signup...
            </h1>
            <p className="text-gray-400 text-sm">
              Please wait while we set up your account.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Welcome to the Reseller Program!
            </h1>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            {setPasswordLink ? (
              <a
                href={setPasswordLink}
                className="block w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity"
              >
                Set your password
              </a>
            ) : (
              <Link
                href="/login"
                className="block w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity text-center"
              >
                Go to login
              </Link>
            )}
            <p className="text-gray-500 text-xs mt-4">
              Check your email if you don&apos;t see the button above.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <Link
              href="/signup/reseller"
              className="block w-full bg-gray-700 text-white font-semibold py-4 rounded-xl hover:bg-gray-600 transition-colors text-center"
            >
              Try again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResellerCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-400 animate-spin" />
      </div>
    }>
      <ResellerCompleteContent />
    </Suspense>
  );
}
