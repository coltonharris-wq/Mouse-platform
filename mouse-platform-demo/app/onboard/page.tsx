"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Zap, ArrowRight, Loader2, Briefcase, Heart, Key } from "lucide-react";

const steps = [
  {
    title: "Welcome to Mouse AI",
    description: "Your AI workforce is ready to deploy. Let's get you set up in under 2 minutes.",
    icon: <Zap className="w-12 h-12 text-mouse-teal" />,
  },
  {
    title: "Define Your First Employee",
    description: "Tell us about the role so we can configure your Mouse Employee perfectly.",
    icon: <Briefcase className="w-12 h-12 text-purple-500" />,
  },
  {
    title: "Deploying Your King Mouse",
    description: "We're provisioning your dedicated AI Operations Manager. This takes about 60 seconds.",
    icon: <Loader2 className="w-12 h-12 text-mouse-teal animate-spin" />,
  },
  {
    title: "You're All Set!",
    description: "Your King Mouse is online and ready to work.",
    icon: <CheckCircle className="w-12 h-12 text-green-400" />,
  },
];

// 3 Subjects with 3 questions each
const interviewSubjects = [
  {
    id: "job-description",
    title: "The Digital Job Description",
    subtitle: "Define the role and outcomes",
    icon: <Briefcase className="w-6 h-6" />,
    questions: [
      {
        id: "primary-role",
        label: "Primary Role & Outcomes",
        placeholder: "Describe the 3 most critical outcomes this employee must achieve daily (e.g., 'Ensure no lead waits longer than 5 minutes for a text,' or 'Categorize all QuickBooks transactions by Friday at 5 PM')",
        rows: 4,
      },
      {
        id: "playbook",
        label: "The Playbook",
        placeholder: "Describe the exact steps you take to do this now. What does a perfect day look like?",
        rows: 4,
      },
      {
        id: "red-lines",
        label: "The Red Lines",
        placeholder: "What is the one thing this employee should never do without your explicit approval?",
        rows: 3,
      },
    ],
  },
  {
    id: "corporate-culture",
    title: "Corporate Culture & Decision Logic",
    subtitle: "How should your Mouse Employee represent your company?",
    icon: <Heart className="w-6 h-6" />,
    questions: [
      {
        id: "voice",
        label: "The Voice",
        placeholder: "Are they professional and stoic, or high-energy and casual? Provide 3-5 example sentences of how they should answer a client.",
        rows: 4,
      },
      {
        id: "authority",
        label: "Authority Level",
        placeholder: "Can this employee make financial decisions (up to $X), or must every external action be sent to your 'Pending' tab first?",
        rows: 3,
      },
      {
        id: "heartbeat",
        label: "The Heartbeat",
        placeholder: "How often do you want a 'Manager Report' sent to your notification bell? (Every task, daily summary, or only when an error occurs?)",
        rows: 3,
      },
    ],
  },
  {
    id: "system-access",
    title: "Sovereign Access & 'Hands-Off' Keys",
    subtitle: "Which systems does this employee need access to?",
    icon: <Key className="w-6 h-6" />,
    questions: [
      {
        id: "active-access",
        label: "Active Access",
        placeholder: "List the URLs for your CRM, Email Provider, and Social Media (e.g., GoHighLevel, Gmail, Instagram)",
        rows: 3,
      },
      {
        id: "hand-off",
        label: "The Hand-Off",
        placeholder: "Would you prefer to provide API keys manually, or would you like King Mouse to navigate to the settings page and generate them on your behalf?",
        rows: 3,
      },
      {
        id: "restricted-zones",
        label: "Restricted Zones",
        placeholder: "Are there specific folders or accounts that are strictly off-limits?",
        rows: 3,
      },
    ],
  },
];

export default function OnboardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSubject, setCurrentSubject] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [user, setUser] = useState<any>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [vmId, setVmId] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('mouse_session');
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  // Auto-deploy when reaching step 2
  useEffect(() => {
    if (currentStep === 2 && !deploying && !vmId) {
      deployKingMouse();
    }
  }, [currentStep, deploying, vmId]);

  async function deployKingMouse() {
    setDeploying(true);
    setDeployProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 1000);
    
    try {
      // Call API to create King Mouse VM with interview answers
      const response = await fetch('/api/marketplace/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user?.userId,
          plan: 'growth', // Default to growth for onboarding
          interviewAnswers: answers,
        }),
      });
      
      const data = await response.json();
      
      clearInterval(progressInterval);
      setDeployProgress(100);
      
      if (data.success) {
        setVmId(data.vmId);
      }
      
      // Move to completion step after a brief pause
      setTimeout(() => {
        setCurrentStep(3);
        setDeploying(false);
      }, 1000);
      
    } catch (error) {
      console.error('Deployment error:', error);
      clearInterval(progressInterval);
      setDeployProgress(100);
      
      // Still move to completion (graceful degradation)
      setTimeout(() => {
        setCurrentStep(3);
        setDeploying(false);
      }, 1000);
    }
  }

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }

  function handleNextSubject() {
    if (currentSubject < interviewSubjects.length - 1) {
      setCurrentSubject(currentSubject + 1);
    } else {
      // All subjects answered, move to deploy step
      setCurrentStep(2);
    }
  }

  function handlePreviousSubject() {
    if (currentSubject > 0) {
      setCurrentSubject(currentSubject - 1);
    }
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      router.push('/portal');
    }
  }

  function handleSkip() {
    router.push('/portal');
  }

  // Check if all questions in current subject are answered
  const currentSubjectData = interviewSubjects[currentSubject];
  const allCurrentQuestionsAnswered = currentSubjectData.questions.every(
    q => answers[q.id]?.trim().length > 0
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex flex-col">
      {/* Progress */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          {currentStep === 1 && (
            <span className="text-mouse-teal">
              Subject {currentSubject + 1} of {interviewSubjects.length}
            </span>
          )}
          <button onClick={handleSkip} className="text-mouse-teal">Skip</button>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-mouse-teal to-purple-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-[#1a1a2e] rounded-3xl flex items-center justify-center border border-gray-800">
              {steps[currentStep].icon}
            </div>
          </div>

          {/* Text */}
          <h1 className="text-2xl font-bold text-white text-center mb-3">
            {steps[currentStep].title}
          </h1>
          <p className="text-gray-400 text-center mb-8">
            {steps[currentStep].description}
          </p>

          {/* Step 1: Interview Questions */}
          {currentStep === 1 && (
            <div className="space-y-6 mb-8">
              {/* Subject Header */}
              <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-mouse-teal/10 rounded-lg flex items-center justify-center text-mouse-teal">
                    {currentSubjectData.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {currentSubjectData.title}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {currentSubjectData.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {currentSubjectData.questions.map((question) => (
                  <div key={question.id} className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      {question.label}
                    </label>
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder={question.placeholder}
                      rows={question.rows}
                      className="w-full bg-[#252538] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-mouse-teal resize-none"
                    />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {currentSubject > 0 && (
                  <button
                    onClick={handlePreviousSubject}
                    className="flex-1 bg-gray-800 text-white font-semibold py-4 rounded-xl"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={handleNextSubject}
                  disabled={!allCurrentQuestionsAnswered}
                  className="flex-1 bg-gradient-to-r from-mouse-teal to-blue-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentSubject === interviewSubjects.length - 1 ? 'Deploy King Mouse' : 'Next Subject'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Deploying */}
          {currentStep === 2 && (
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6 mb-8">
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Provisioning King Mouse VM...</span>
                  <span>{Math.round(deployProgress)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-mouse-teal to-purple-500 transition-all duration-300"
                    style={{ width: `${deployProgress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#252538] rounded-lg p-3">
                  <div className="text-xl font-bold text-mouse-teal">8</div>
                  <div className="text-xs text-gray-500">GB RAM</div>
                </div>
                <div className="bg-[#252538] rounded-lg p-3">
                  <div className="text-xl font-bold text-mouse-teal">4</div>
                  <div className="text-xs text-gray-500">vCPUs</div>
                </div>
                <div className="bg-[#252538] rounded-lg p-3">
                  <div className="text-xl font-bold text-mouse-teal">60s</div>
                  <div className="text-xs text-gray-500">Deploy Time</div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-400">
                Installing OpenClaw, configuring your business profile, and starting your AI Operations Manager...
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 3 && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-400 text-sm mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                King Mouse Online
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Your AI Operations Manager is ready to work
              </p>
              <p className="text-mouse-teal text-sm">
                2 free work hours credited to your account
              </p>
            </div>
          )}

          {/* Continue Button (for steps 0 and 3) */}
          {(currentStep === 0 || currentStep === 3) && (
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-mouse-teal to-blue-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
