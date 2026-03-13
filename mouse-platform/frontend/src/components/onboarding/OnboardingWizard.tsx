'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import WizardField from './WizardField';
import type { ProTemplateLight, WizardStep } from '@/types/pro-template';

interface OnboardingWizardProps {
  customerId: string;
}

const GENERIC_STEPS: WizardStep[] = [
  {
    step_number: 1,
    title: 'About Your Business',
    description: 'Tell us the basics',
    fields: [
      { name: 'business_name', label: "What's the name of your business?", type: 'text', placeholder: 'Your Business Name', required: true },
      { name: 'owner_name', label: "What's your name?", type: 'text', placeholder: 'Your Name', required: true },
      { name: 'phone', label: 'Business phone number?', type: 'phone', placeholder: '(555) 123-4567', required: true },
      { name: 'address', label: 'Business address?', type: 'text', placeholder: '123 Main St', required: false },
    ],
  },
  {
    step_number: 2,
    title: 'Hours & Services',
    description: 'When are you open and what do you do?',
    fields: [
      { name: 'business_hours', label: 'Business hours?', type: 'time_range', placeholder: '9:00 AM - 5:00 PM', required: true },
      { name: 'description', label: 'Describe what your business does', type: 'textarea', placeholder: 'We help customers by...', required: false },
    ],
  },
  {
    step_number: 3,
    title: 'What Should King Mouse Handle?',
    description: 'Pick the tasks you want automated',
    fields: [
      { name: 'tasks', label: 'Select tasks for King Mouse', type: 'multiselect', placeholder: '', required: false, options: ['Answer phone calls', 'Schedule appointments', 'Send reminders', 'Handle customer inquiries', 'Manage reviews', 'Send follow-ups', 'Handle billing questions', 'Social media'] },
    ],
  },
  {
    step_number: 4,
    title: 'Review & Launch',
    description: "You're all set! Review and launch King Mouse",
    fields: [
      { name: 'special_instructions', label: 'Anything else King Mouse should know?', type: 'textarea', placeholder: 'Any special instructions or things to keep in mind...', required: false },
    ],
  },
];

export default function OnboardingWizard({ customerId }: OnboardingWizardProps) {
  const [template, setTemplate] = useState<ProTemplateLight | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean | number | string[]>>({});
  const [saving, setSaving] = useState(false);
  const [customerData, setCustomerData] = useState<Record<string, unknown> | null>(null);

  // Fetch customer and template data
  useEffect(() => {
    (async () => {
      try {
        // Fetch customer to get their template ID
        const custRes = await fetch(`/api/customers/${customerId}`);
        const customer = await custRes.json();
        setCustomerData(customer);

        // Pre-fill answers from customer data
        const prefilled: Record<string, string | boolean | number | string[]> = {};
        if (customer.business_name) prefilled.business_name = customer.business_name;
        if (customer.owner_name) prefilled.owner_name = customer.owner_name;
        if (customer.phone) prefilled.phone = customer.phone;
        if (customer.location) prefilled.address = customer.location;
        setAnswers(prefilled);

        if (customer.pro_template_id) {
          const tmplRes = await fetch(`/api/templates/${customer.pro_template_id}`);
          if (tmplRes.ok) {
            const tmpl = await tmplRes.json();
            setTemplate(tmpl);
          }
        }
      } catch {
        // Continue with generic steps
      }
      setLoading(false);
    })();
  }, [customerId]);

  const steps = template?.wizard_steps || GENERIC_STEPS;
  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const setFieldValue = (name: string, value: string | boolean | number | string[]) => {
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const getFieldValue = (name: string, defaultVal?: string | boolean | number) => {
    return answers[name] ?? defaultVal ?? '';
  };

  const validateCurrentStep = () => {
    if (!currentStepData) return true;
    for (const field of currentStepData.fields) {
      if (field.required) {
        const val = answers[field.name];
        if (val === undefined || val === '' || val === null) return false;
        if (Array.isArray(val) && val.length === 0) return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_answers: answers,
          onboarding_complete: true,
          business_name: answers.business_name || customerData?.business_name,
          owner_name: answers.owner_name || customerData?.owner_name,
          phone: answers.phone || customerData?.phone,
          location: answers.address || customerData?.location,
          business_hours: answers.business_hours || null,
        }),
      });
    } catch {
      // Continue to provisioning even if save fails
    }

    // Redirect to provisioning
    window.location.href = `/provisioning?customer_id=${customerId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  const emoji = template?.emoji || '\u{1F42D}';
  const displayName = template?.display_name || (customerData?.niche as string) || 'Your Business';

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            {emoji} Let&apos;s set up King Mouse for your {displayName}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">
              Step {currentStep + 1} of {totalSteps}: {currentStepData?.title}
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-1">{currentStepData?.title}</h2>
          <p className="text-zinc-400 text-sm mb-6">{currentStepData?.description}</p>

          {/* Summary view on last step */}
          {isLastStep && Object.keys(answers).length > 1 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Summary</h3>
              <div className="space-y-1.5">
                {answers.business_name && (
                  <p className="text-sm text-zinc-400"><span className="text-zinc-300">Business:</span> {String(answers.business_name)}</p>
                )}
                {answers.owner_name && (
                  <p className="text-sm text-zinc-400"><span className="text-zinc-300">Owner:</span> {String(answers.owner_name)}</p>
                )}
                {answers.phone && (
                  <p className="text-sm text-zinc-400"><span className="text-zinc-300">Phone:</span> {String(answers.phone)}</p>
                )}
                {answers.business_hours && (
                  <p className="text-sm text-zinc-400"><span className="text-zinc-300">Hours:</span> {String(answers.business_hours)}</p>
                )}
                {Array.isArray(answers.tasks) && answers.tasks.length > 0 && (
                  <p className="text-sm text-zinc-400"><span className="text-zinc-300">Tasks:</span> {answers.tasks.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {currentStepData?.fields.map((field) => (
              <WizardField
                key={field.name}
                field={field}
                value={getFieldValue(field.name, field.default_value)}
                onChange={(val) => setFieldValue(field.name, val)}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-3 text-zinc-400 hover:text-white transition-colors text-base font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Skip for now
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={saving || (!isLastStep && !validateCurrentStep())}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-400 transition-colors disabled:opacity-50 text-base"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isLastStep ? (
                <>
                  <Rocket className="w-4 h-4" />
                  Launch King Mouse
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
