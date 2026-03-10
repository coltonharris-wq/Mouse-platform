"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  Phone,
  MessageSquare,
} from "lucide-react";
import { VERTICAL_CONFIGS } from "@/lib/employee-dashboard/vertical-configs";
import { PAIN_POINTS } from "@/lib/onboarding/pain-points";
import type { VerticalConfig } from "@/lib/employee-dashboard/vertical-configs";

const TOTAL_STEPS = 5;

function getCustomerId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem("mouse_session");
    if (!s) return null;
    const parsed = JSON.parse(s);
    return parsed.customerId || parsed.userId || null;
  } catch {
    return null;
  }
}

export default function OnboardingWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [session, setSession] = useState<{
    id: string;
    current_step: number;
    business_type?: string;
    pain_points?: string[];
    selected_employee_slug?: string;
    setup_data?: Record<string, unknown>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessType, setBusinessType] = useState<string>("");
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<VerticalConfig | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [setup, setSetup] = useState({
    greeting: "",
    hours: { weekdays: true, saturday: false, emergency24: true },
    serviceArea: "Wilmington and 25 mile radius",
  });

  const customerId = getCustomerId();

  useEffect(() => {
    if (!customerId) {
      router.replace("/login");
      return;
    }
    async function load() {
      const res = await fetch("/api/onboarding/session?customerId=" + customerId);
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setStep(data.session.current_step ?? 0);
        setBusinessType(data.session.business_type || "");
        setPainPoints(data.session.pain_points || []);
        if (data.session.selected_employee_slug) {
          setSelectedEmployee(
            VERTICAL_CONFIGS[data.session.selected_employee_slug] || null
          );
        }
        if (data.session.setup_data) {
          setSetup((p) => ({ ...p, ...data.session.setup_data }));
        }
      } else {
        const startRes = await fetch("/api/onboarding/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        });
        const startData = await startRes.json();
        if (startData.session) setSession(startData.session);
      }
      setLoading(false);
    }
    load();
  }, [customerId, router]);

  const togglePainPoint = (id: string) => {
    setPainPoints((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  };

  const saveStep = async (nextStep: number, payload?: Record<string, unknown>) => {
    if (!customerId || !session) return;
    setSaving(true);
    try {
      await fetch("/api/onboarding/step", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          sessionId: session.id,
          step: nextStep,
          business_type: businessType || undefined,
          pain_points: painPoints.length ? painPoints : undefined,
          selected_employee_slug: selectedEmployee?.slug,
          ...payload,
        }),
      });
      setSession((s) => (s ? { ...s, current_step: nextStep } : s));
      setStep(nextStep);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!customerId || !session) return;
    setSaving(true);
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          sessionId: session.id,
          setup_data: setup,
        }),
      });
      setStep(TOTAL_STEPS + 1); // completion screen
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!customerId) return;
    await fetch("/api/onboarding/skip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, sessionId: session?.id }),
    });
    router.push("/portal");
  };

  const verticals = Object.values(VERTICAL_CONFIGS);
  const primaryPain = painPoints[0] || "missed_calls";
  const isMissedCalls = primaryPain === "missed_calls";
  const isGhosting = primaryPain === "ghosting";

  if (loading) {
    return (
      <div className="min-h-screen bg-mouse-offwhite flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-mouse-teal animate-spin" />
      </div>
    );
  }

  // Step 0: Welcome
  if (step === 0) {
    return (
      <div className="min-h-screen bg-mouse-offwhite flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🐭</div>
        <h1 className="text-3xl font-bold text-mouse-navy text-center">
          Welcome to Mouse
        </h1>
        <p className="text-mouse-slate text-center mt-2 max-w-md">
          Your AI employees are about to change how you work.
        </p>
        <ul className="mt-6 space-y-2 text-mouse-charcoal">
          <li className="flex items-center gap-2">• Meet your first AI employee</li>
          <li className="flex items-center gap-2">• See how they solve your biggest problem</li>
          <li className="flex items-center gap-2">• Activate them to start working immediately</li>
        </ul>
        <div className="mt-10 flex flex-col gap-3">
          <button
            onClick={() => saveStep(1)}
            disabled={saving}
            className="px-8 py-3 bg-mouse-teal text-white font-semibold rounded-xl hover:bg-mouse-teal/90 flex items-center gap-2"
          >
            Let&apos;s Go <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleSkip}
            className="text-sm text-mouse-slate hover:underline"
          >
            Skip Setup
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Business Type
  if (step === 1) {
    return (
      <div className="min-h-screen bg-mouse-offwhite p-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-mouse-slate mb-4">Step 1 of {TOTAL_STEPS}</p>
          <h2 className="text-2xl font-bold text-mouse-navy mb-2">
            What type of business do you run?
          </h2>
          <div className="grid grid-cols-4 gap-3 mt-6">
            {verticals.slice(0, 12).map((v) => (
              <button
                key={v.slug}
                onClick={() => setBusinessType(v.slug)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  businessType === v.slug
                    ? "border-mouse-teal bg-mouse-teal/10"
                    : "border-mouse-slate/20 hover:border-mouse-teal/50"
                }`}
              >
                <span className="text-3xl block mb-1">{v.icon}</span>
                <span className="text-sm font-medium text-mouse-charcoal">
                  {v.name.replace(" Pro", "")}
                </span>
              </button>
            ))}
          </div>
          {verticals.length > 12 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {verticals.slice(12, 24).map((v) => (
                <button
                  key={v.slug}
                  onClick={() => setBusinessType(v.slug)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    businessType === v.slug
                      ? "border-mouse-teal bg-mouse-teal/10"
                      : "border-mouse-slate/20 hover:border-mouse-teal/50"
                  }`}
                >
                  <span className="text-3xl block mb-1">{v.icon}</span>
                  <span className="text-sm font-medium text-mouse-charcoal">
                    {v.name.replace(" Pro", "")}
                  </span>
                </button>
              ))}
            </div>
          )}
          {businessType && (
            <p className="mt-4 text-sm text-mouse-slate">
              Selected: {VERTICAL_CONFIGS[businessType]?.icon}{" "}
              {VERTICAL_CONFIGS[businessType]?.name}
            </p>
          )}
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => saveStep(0)}
              className="px-4 py-2 text-mouse-slate hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => saveStep(2)}
              disabled={!businessType || saving}
              className="px-6 py-2 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90 disabled:opacity-50 flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Pain Points
  if (step === 2) {
    return (
      <div className="min-h-screen bg-mouse-offwhite p-6">
        <div className="max-w-xl mx-auto">
          <p className="text-sm text-mouse-slate mb-4">Step 2 of {TOTAL_STEPS}</p>
          <h2 className="text-2xl font-bold text-mouse-navy mb-2">
            What&apos;s your biggest headache right now?
          </h2>
          <p className="text-mouse-slate mb-6">(Select all that apply)</p>
          <div className="space-y-3">
            {PAIN_POINTS.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePainPoint(p.id)}
                className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-3 ${
                  painPoints.includes(p.id)
                    ? "border-mouse-teal bg-mouse-teal/10"
                    : "border-mouse-slate/20 hover:border-mouse-teal/50"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    painPoints.includes(p.id) ? "border-mouse-teal bg-mouse-teal" : ""
                  }`}
                >
                  {painPoints.includes(p.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </span>
                <div>
                  <p className="font-medium text-mouse-charcoal">{p.label}</p>
                  <p className="text-sm text-mouse-slate mt-0.5">{p.sublabel}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => saveStep(1)}
              className="px-4 py-2 text-mouse-slate hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={async () => {
                const res = await fetch(
                  `/api/onboarding/suggestions?businessType=${businessType}&painPoints=${painPoints.join(",")}`
                );
                const data = await res.json();
                const primary = data.primary as VerticalConfig;
                setSelectedEmployee(primary);
                await saveStep(3, {
                  selected_employee_slug: primary?.slug,
                });
              }}
              disabled={painPoints.length === 0 || saving}
              className="px-6 py-2 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90 disabled:opacity-50 flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Meet Your AI Employee
  if (step === 3 && selectedEmployee) {
    const painLabel =
      PAIN_POINTS.find((p) => p.id === primaryPain)?.label || "Missed calls";
    return (
      <div className="min-h-screen bg-mouse-offwhite p-6">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm text-mouse-slate mb-4">Step 3 of {TOTAL_STEPS}</p>
          <h2 className="text-2xl font-bold text-mouse-navy mb-4">
            Based on your answers, meet your first AI employee:
          </h2>
          <div className="text-6xl mb-4">{selectedEmployee.icon}</div>
          <h3 className="text-xl font-bold text-mouse-charcoal">
            {selectedEmployee.name.toUpperCase()}
          </h3>
          <p className="text-mouse-slate mt-4 italic">
            &quot;I handle your calls, follow up with leads, and make sure you
            never miss another opportunity.&quot;
          </p>
          <p className="text-sm text-mouse-slate mt-4">
            Perfect for: {selectedEmployee.category.replace(/-/g, " ")}
          </p>
          <div className="mt-6 p-4 bg-white rounded-xl border border-mouse-slate/20">
            <p className="text-sm font-medium text-mouse-charcoal">
              Here&apos;s how I&apos;ll solve your #1 problem:
            </p>
            <p className="text-mouse-teal font-semibold mt-1">&quot;{painLabel}&quot;</p>
          </div>
          <div className="mt-8 flex gap-3 justify-center">
            <button
              onClick={() => saveStep(2)}
              className="px-4 py-2 text-mouse-slate hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => saveStep(4)}
              disabled={saving}
              className="px-6 py-2 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90 flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Interactive Demo
  if (step === 4 && selectedEmployee) {
    const demoLines = isMissedCalls
      ? [
          { who: "customer", text: "Hi, my basement is flooding!" },
          {
            who: "ai",
            text: "I understand this is urgent. Is anyone in danger? Is the water rising?",
          },
          { who: "customer", text: "No, but it's getting worse" },
          {
            who: "ai",
            text: "I'm sending our emergency tech now. They'll be there in 30 minutes. What's your address?",
          },
          { who: "result", text: "✅ Appointment booked — $2,400 job" },
        ]
      : isGhosting
      ? [
          { who: "day", text: "DAY 1 - Quote sent to john@email.com" },
          { who: "day", text: "DAY 2 - No response" },
          {
            who: "ai",
            text: "Plumber Pro automatically sends: 'Hi John, wanted to follow up on your quote. We have one opening left this week...'",
          },
          { who: "result", text: "✅ John replies: 'Let's do it' — $2,400 job booked" },
        ]
      : [
          { who: "customer", text: "I need a quote for a water heater" },
          {
            who: "ai",
            text: "I'd be happy to help. What's your address and when would work for a visit?",
          },
          { who: "result", text: "✅ Appointment scheduled" },
        ];

    return (
      <div className="min-h-screen bg-mouse-offwhite p-6">
        <div className="max-w-xl mx-auto">
          <p className="text-sm text-mouse-slate mb-4">
            Step 4 of {TOTAL_STEPS} - Interactive Demo
          </p>
          <h2 className="text-xl font-bold text-mouse-navy mb-4">
            Let&apos;s see how {selectedEmployee.name} handles a real scenario:
          </h2>
          <div className="bg-white rounded-xl border border-mouse-slate/20 p-6 space-y-4">
            {demoLines.slice(0, demoStep + 1).map((line, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  line.who === "ai"
                    ? "bg-mouse-teal/10 p-3 rounded-lg"
                    : line.who === "result"
                    ? "bg-green-50 p-3 rounded-lg text-green-800"
                    : ""
                }`}
              >
                {line.who === "customer" && (
                  <Phone className="w-5 h-5 text-mouse-slate flex-shrink-0" />
                )}
                {line.who === "ai" && (
                  <MessageSquare className="w-5 h-5 text-mouse-teal flex-shrink-0" />
                )}
                <p className="text-mouse-charcoal">{line.text}</p>
              </div>
            ))}
            {demoStep < demoLines.length - 1 ? (
              <button
                onClick={() => setDemoStep((s) => s + 1)}
                className="w-full py-3 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90"
              >
                Continue Simulation →
              </button>
            ) : (
              <div className="pt-4">
                <p className="text-sm text-mouse-slate mb-4">
                  👆 You just saw how your AI employee works in real time.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => saveStep(3)}
                    className="px-4 py-2 text-mouse-slate hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => saveStep(5)}
                    disabled={saving}
                    className="px-6 py-2 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90 flex items-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Quick Setup
  if (step === 5 && selectedEmployee) {
    return (
      <div className="min-h-screen bg-mouse-offwhite p-6">
        <div className="max-w-xl mx-auto">
          <p className="text-sm text-mouse-slate mb-4">
            Step 5 of {TOTAL_STEPS} - Activate Your Employee
          </p>
          <h2 className="text-2xl font-bold text-mouse-navy mb-2">
            Let&apos;s get {selectedEmployee.name} working for you right now.
          </h2>
          <p className="text-mouse-slate mb-6">(Takes 2 minutes)</p>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-mouse-charcoal mb-2">
                1. How do you answer your phone?
              </h3>
              <input
                type="text"
                placeholder="e.g. Thanks for calling ABC Plumbing, this is Mike"
                value={setup.greeting}
                onChange={(e) =>
                  setSetup((p) => ({ ...p, greeting: e.target.value }))
                }
                className="w-full px-4 py-2 border border-mouse-slate/20 rounded-lg"
              />
            </div>
            <div>
              <h3 className="font-semibold text-mouse-charcoal mb-2">
                2. What are your service hours?
              </h3>
              <div className="space-y-2">
                {[
                  { key: "weekdays", label: "Mon-Fri 8am-6pm" },
                  { key: "saturday", label: "Sat 9am-2pm" },
                  { key: "emergency24", label: "24/7 Emergency" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={setup.hours[key as keyof typeof setup.hours]}
                      onChange={(e) =>
                        setSetup((p) => ({
                          ...p,
                          hours: {
                            ...p.hours,
                            [key]: e.target.checked,
                          },
                        }))
                      }
                      className="rounded"
                    />
                    <span className="text-mouse-charcoal">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-mouse-charcoal mb-2">
                3. What&apos;s your service area?
              </h3>
              <input
                type="text"
                value={setup.serviceArea}
                onChange={(e) =>
                  setSetup((p) => ({ ...p, serviceArea: e.target.value }))
                }
                className="w-full px-4 py-2 border border-mouse-slate/20 rounded-lg"
              />
            </div>
          </div>

          <p className="mt-6 text-sm text-mouse-teal font-medium">
            ✅ {selectedEmployee.name} is 80% trained
          </p>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => saveStep(4)}
              className="px-4 py-2 text-mouse-slate hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="px-6 py-2 bg-mouse-teal text-white font-semibold rounded-lg hover:bg-mouse-teal/90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Activate Employee"
              )}{" "}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (step > TOTAL_STEPS && selectedEmployee) {
    return (
      <div className="min-h-screen bg-mouse-offwhite flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-mouse-navy text-center">
          {selectedEmployee.name} is Live!
        </h1>
        <p className="text-mouse-slate text-center mt-2 max-w-md">
          Your AI employee is now:
        </p>
        <ul className="mt-4 space-y-1 text-mouse-charcoal">
          <li>✅ Answering calls 24/7</li>
          <li>✅ Following up with leads automatically</li>
          <li>✅ Booking appointments while you sleep</li>
        </ul>
        <p className="text-sm text-mouse-slate mt-6 max-w-md text-center">
          Next call that comes in → {selectedEmployee.name} answers. You&apos;ll
          get a text summary of every conversation. Check your dashboard anytime.
        </p>
        <button
          onClick={() => router.push("/portal")}
          className="mt-10 px-8 py-3 bg-mouse-teal text-white font-semibold rounded-xl hover:bg-mouse-teal/90"
        >
          Go to Dashboard →
        </button>
      </div>
    );
  }

  return null;
}
