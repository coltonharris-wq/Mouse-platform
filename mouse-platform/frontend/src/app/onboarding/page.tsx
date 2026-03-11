'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import StepBusinessInfo from '@/components/onboarding/StepBusinessInfo';
import StepNeedsGoals from '@/components/onboarding/StepNeedsGoals';
import StepProSelection from '@/components/onboarding/StepProSelection';
import StepIndustryQuestions from '@/components/onboarding/StepIndustryQuestions';
import StepPayment from '@/components/onboarding/StepPayment';
import { Suspense } from 'react';

function OnboardingFlow() {
  const searchParams = useSearchParams();
  const preselectedPro = searchParams.get('pro') || '';

  const [step, setStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    location: '',
    business_type: '',
  });
  const [needs, setNeeds] = useState<string[]>([]);
  const [proSlug, setProSlug] = useState(preselectedPro);
  const [industryAnswers, setIndustryAnswers] = useState<Record<string, unknown>>({});
  const [planSlug, setPlanSlug] = useState('growth');

  // Store onboarding data in sessionStorage for the success page
  const saveToSession = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboarding_data', JSON.stringify({
        ...businessInfo,
        needs,
        pro_slug: proSlug,
        plan_slug: planSlug,
        onboarding_answers: industryAnswers,
      }));
    }
  };

  const STEPS = ['Business Info', 'Needs & Goals', 'Choose Pro', 'Details', 'Payment'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i + 1 <= step ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <span className={`ml-2 text-sm hidden sm:inline ${
                  i + 1 <= step ? 'text-teal-700 font-medium' : 'text-gray-400'
                }`}>{label}</span>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    i + 1 < step ? 'bg-teal-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        {step === 1 && (
          <StepBusinessInfo
            data={businessInfo}
            onChange={(d) => setBusinessInfo((prev) => ({ ...prev, ...d }))}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepNeedsGoals
            selected={needs}
            onChange={setNeeds}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepProSelection
            selectedSlug={proSlug}
            onChange={setProSlug}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepIndustryQuestions
            proSlug={proSlug}
            answers={industryAnswers}
            onChange={setIndustryAnswers}
            onNext={() => { saveToSession(); setStep(5); }}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && (
          <StepPayment
            selectedPlan={planSlug}
            email={businessInfo.email}
            proSlug={proSlug}
            onChange={setPlanSlug}
            onBack={() => setStep(4)}
          />
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    }>
      <OnboardingFlow />
    </Suspense>
  );
}
