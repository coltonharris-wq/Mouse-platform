"use client";

import { useState } from "react";

const TOTAL_STEPS = 5;

const STEP_QUESTIONS: Record<number, string> = {
  1: "What's your business type?",
  2: "How many employees do you have?",
  3: "What's your biggest operational bottleneck?",
  4: "How many hours/week do you spend on manual admin tasks?",
  5: "What would you do with 20 extra hours/week?",
};

const STEP_SUBTEXTS: Record<number, string> = {
  1: "Help us recommend the right AI Employees for your needs.",
  2: "This helps us understand your team's automation potential.",
  3: "We will match you with AI Employees built for this exact problem.",
  4: "Drag the slider to your best estimate.",
  5: "Tell us what matters most to your business.",
};

const SELECT_OPTIONS: Record<number, string[]> = {
  1: [
    "Construction",
    "Healthcare",
    "Real Estate",
    "Professional Services",
    "Retail",
    "Other",
  ],
  2: ["1-5", "6-20", "21-50", "51-200", "200+"],
  3: [
    "Admin/Data Entry",
    "Sales Follow-Up",
    "Invoicing & AR",
    "Customer Onboarding",
    "Other",
  ],
};

function calculateROI(sliderHours: number) {
  const weeklyHoursSaved = Math.round(sliderHours * 0.7);
  const fteEquivalent = (sliderHours / 40).toFixed(1);
  const monthlyValue = Math.round(weeklyHoursSaved * 52 * 65 / 12);
  return { weeklyHoursSaved, fteEquivalent, monthlyValue };
}

export default function OnboardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string | number>>({
    4: 32,
  });
  const [submitted, setSubmitted] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");

  const progressPercent = ((currentStep - 1) / TOTAL_STEPS) * 100;

  function handleSelectAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  }

  function handleNext() {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    } else {
      setSubmitted(true);
    }
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }

  const isSelectStep = [1, 2, 3].includes(currentStep);
  const isSliderStep = currentStep === 4;
  const isTextareaStep = currentStep === 5;

  const canProceed =
    isSliderStep ||
    (isSelectStep && Boolean(answers[currentStep])) ||
    (isTextareaStep && textareaValue.trim().length > 0);

  const sliderValue = Number(answers[4]) || 32;

  if (submitted) {
    const roi = calculateROI(sliderValue);
    return (
      <div className="min-h-screen bg-mouse-offwhite flex flex-col">
        {/* Navy header */}
        <div className="bg-mouse-navy px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <span className="text-white font-bold text-xl tracking-tight">
              Mouse
            </span>
            <span className="text-mouse-slate text-xs">
              AI Workforce Intake
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-mouse-slate/20 p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-mouse-navy mb-2">
                Your ROI Estimate
              </h1>
              <p className="text-mouse-slate text-sm">
                Based on your {sliderValue} hours/week of manual admin tasks,
                here is what AI automation could mean for your business.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-mouse-offwhite rounded-xl border border-mouse-slate/20 p-5 text-center">
                <div className="text-mouse-green text-3xl font-bold mb-1">
                  ~{roi.weeklyHoursSaved}
                </div>
                <div className="text-mouse-charcoal text-xs font-medium leading-tight">
                  Hours Saved Weekly
                </div>
              </div>
              <div className="bg-mouse-offwhite rounded-xl border border-mouse-slate/20 p-5 text-center">
                <div className="text-mouse-green text-3xl font-bold mb-1">
                  {roi.fteEquivalent}x
                </div>
                <div className="text-mouse-charcoal text-xs font-medium leading-tight">
                  FTE Equivalent
                </div>
              </div>
              <div className="bg-mouse-offwhite rounded-xl border border-mouse-slate/20 p-5 text-center">
                <div className="text-mouse-green text-3xl font-bold mb-1">
                  ${roi.monthlyValue.toLocaleString()}
                </div>
                <div className="text-mouse-charcoal text-xs font-medium leading-tight">
                  Estimated Value/mo
                </div>
              </div>
            </div>

            <p className="text-mouse-slate text-xs text-center mb-6">
              Estimate based on {sliderValue} hrs/week at $65/hr average rate,
              applied across 52 weeks. Actual results vary by role and
              complexity.
            </p>

            <a
              href="https://calendly.com/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-mouse-orange text-white py-4 rounded-lg font-semibold text-base hover:bg-orange-600 transition-colors mb-3"
            >
              Book Your Strategy Call
            </a>

            <div className="text-center">
              <a
                href="mailto:hello@mouse.ai"
                className="text-mouse-teal text-sm hover:underline"
              >
                Questions? Contact us
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mouse-offwhite flex flex-col">
      {/* Navy header bar */}
      <div className="bg-mouse-navy px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-white font-bold text-xl tracking-tight">
            Mouse
          </span>
          <span className="text-mouse-slate text-xs">AI Workforce Intake</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-mouse-slate text-sm">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
              <span className="text-mouse-slate text-sm">
                {Math.round(progressPercent)}% complete
              </span>
            </div>
            <div className="h-2 bg-mouse-slate/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-mouse-teal rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-mouse-slate/20 shadow-sm p-8">
            {/* Question */}
            <h2 className="text-2xl font-bold text-mouse-charcoal mb-1">
              {STEP_QUESTIONS[currentStep]}
            </h2>
            <p className="text-mouse-slate text-sm mb-7">
              {STEP_SUBTEXTS[currentStep]}
            </p>

            {/* Step 1, 2, 3 — card select */}
            {isSelectStep && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SELECT_OPTIONS[currentStep].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`p-4 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                      answers[currentStep] === opt
                        ? "border-mouse-teal bg-mouse-teal/5 text-mouse-charcoal"
                        : "border-mouse-slate/30 text-mouse-charcoal hover:border-mouse-teal/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Step 4 — slider */}
            {isSliderStep && (
              <div className="space-y-6">
                <div className="text-center">
                  <span
                    className="text-5xl font-bold"
                    style={{ color: "#0F6B6E" }}
                  >
                    {sliderValue}
                  </span>
                  <span className="text-mouse-charcoal text-lg ml-2">
                    hours/week
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={80}
                  step={5}
                  value={sliderValue}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      4: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                  style={{ accentColor: "#0F6B6E" }}
                />
                <div className="flex justify-between text-mouse-slate text-xs">
                  <span>5 hrs</span>
                  <span>80 hrs</span>
                </div>
                <p className="text-mouse-slate text-xs text-center">
                  Include time spent on email follow-ups, data entry, invoicing,
                  scheduling, and repetitive admin work.
                </p>
              </div>
            )}

            {/* Step 5 — textarea */}
            {isTextareaStep && (
              <div>
                <textarea
                  rows={5}
                  placeholder="Tell us what matters most to your business..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  className="w-full border-2 border-mouse-slate/30 rounded-xl px-4 py-3 text-mouse-charcoal text-sm focus:outline-none focus:border-mouse-teal resize-none"
                />
                <p className="text-mouse-slate text-xs mt-1.5 text-right">
                  {textareaValue.length} characters
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-mouse-charcoal hover:text-mouse-navy disabled:opacity-30 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="px-8 py-2.5 rounded-lg bg-mouse-orange text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-40 transition-colors"
              >
                {currentStep === TOTAL_STEPS ? "See My ROI" : "Next"}
              </button>
            </div>
          </div>

          <p className="text-center text-mouse-slate text-xs mt-5">
            No credit card required. No commitment.
          </p>
        </div>
      </div>
    </div>
  );
}
