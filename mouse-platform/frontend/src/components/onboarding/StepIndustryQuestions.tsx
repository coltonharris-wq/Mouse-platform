'use client';

import { useEffect, useState } from 'react';

interface OnboardingQuestion {
  question: string;
  field_name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean';
  options?: string[];
}

interface StepIndustryQuestionsProps {
  proSlug: string;
  answers: Record<string, unknown>;
  onChange: (answers: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepIndustryQuestions({ proSlug, answers, onChange, onNext, onBack }: StepIndustryQuestionsProps) {
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!proSlug) return;
    fetch(`/api/pro-profiles/${proSlug}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.onboarding_questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [proSlug]);

  const updateAnswer = (field: string, value: unknown) => {
    onChange({ ...answers, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">A few more details</h2>
      <p className="text-gray-600 mb-8">This helps your AI employee get started right away.</p>

      <div className="space-y-5">
        {questions.map((q) => (
          <div key={q.field_name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{q.question}</label>

            {q.type === 'text' && (
              <input
                type="text"
                value={(answers[q.field_name] as string) || ''}
                onChange={(e) => updateAnswer(q.field_name, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            )}

            {q.type === 'textarea' && (
              <textarea
                value={(answers[q.field_name] as string) || ''}
                onChange={(e) => updateAnswer(q.field_name, e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            )}

            {q.type === 'number' && (
              <input
                type="number"
                value={(answers[q.field_name] as number) || ''}
                onChange={(e) => updateAnswer(q.field_name, parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            )}

            {q.type === 'select' && q.options && (
              <select
                value={(answers[q.field_name] as string) || ''}
                onChange={(e) => updateAnswer(q.field_name, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {q.type === 'boolean' && (
              <div className="flex gap-4">
                <button
                  onClick={() => updateAnswer(q.field_name, true)}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                    answers[q.field_name] === true
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => updateAnswer(q.field_name, false)}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                    answers[q.field_name] === false
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  No
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
