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
    description: "We're provisioning your dedicated AI Operations Manager. This takes 5-10 minutes.",
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
  const [deployError, setDeployError] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('mouse_session');
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  // Auto-deploy when reaching step 2 (but only if user is loaded)
  useEffect(() => {
    if (currentStep === 2 && !deploying && !vmId && user) {
      deployKingMouse();
    }
  }, [currentStep, deploying, vmId, user]);

  async function deployKingMouse() {
    setDeploying(true);
    setDeployProgress(10);
    
    try {
      // Step 1: Call API to create King Mouse VM
      const response = await fetch('/api/marketplace/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user?.customerId || user?.userId,
          plan: 'growth',
          isOnboarding: true,
          interviewAnswers: answers,
        }),
      });
      
      const data = await response.json();
      
      // Check for actual VM creation, not just success flag
      // The API returns success:true even when VM fails (orgoError is set instead)
      if (!response.ok || !data.success || !data.vm || data.orgoError) {
        const errorMsg = data.error || data.orgoError || `Failed to deploy: ${response.status}`;
        console.error('Deployment failed:', errorMsg, data);
        setDeployError(errorMsg);
        setDeploying(false);
        return;
      }
      
      const computerId = data.vm?.computer_id || data.vm?.id;
      if (!computerId) {
        setDeployError('VM created but no computer ID returned');
        setDeploying(false);
        return;
      }
      
      setVmId(computerId);
      setDeployProgress(30);
      
      // Step 2: Trigger provision
      const triggerResponse = await fetch('/api/vm/provision-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ computerId }),
      });
      
      if (!triggerResponse.ok) {
        console.error('Provision trigger failed:', await triggerResponse.text());
        setDeployError('Failed to start VM provisioning');
        setDeploying(false);
        return;
      }
      
      setDeployProgress(50);
      
      // Step 3: Poll for provision status (up to 5 minutes)
      const maxAttempts = 60; // 60 * 5 seconds = 5 minutes
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const statusResponse = await fetch(`/api/vm/provision-status?computer_id=${computerId}`);
        const statusData = await statusResponse.json();
        
        console.log('Provision status:', statusData);
        
        if (statusData.status === 'ready') {
          setDeployProgress(100);
          // Only move to completion when actually ready
          setTimeout(() => {
            setCurrentStep(3);
            setDeploying(false);
          }, 1000);
          return;
        } else if (statusData.status === 'error') {
          setDeployError('VM provisioning failed. Please try again.');
          setDeploying(false);
          return;
        }
        
        // Update progress (50-90% while waiting)
        attempts++;
        setDeployProgress(50 + Math.min((attempts / maxAttempts) * 40, 40));
      }
      
      // Timeout
      setDeployError('Provisioning is taking longer than expected. Your VM is still being set up — you can check your portal in a few minutes.');
      setDeploying(false);
      
    } catch (error: any) {
      console.error('Deployment error:', error);
      setDeployError(error?.message || 'Network error during deployment. Please try again.');
      setDeploying(false);
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
          {currentStep !== 2 && (
            <button onClick={handleSkip} className="text-mouse-teal">Skip</button>
          )}
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
              {deployError ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full text-red-400 text-sm mb-4">
                    <div className="w-2 h-2 bg-red-400 rounded-full"/>
                    Deployment Failed
                  </div>
                  <p className="text-red-300 text-sm mb-4">{deployError}</p>
                  <button
                    onClick={() => {
                      setDeployError(null);
                      deployKingMouse();
                    }}
                    className="bg-mouse-teal text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-mouse-teal/80 transition-colors"
                  >
                    Retry Deployment
                  </button>
                </div>
              ) : (
                <>
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
                      <div className="text-xl font-bold text-mouse-teal">32</div>
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
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400 mb-2">
                      Installing King Mouse, configuring your business profile, and starting your AI Operations Manager...
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-mouse-teal/10 rounded-lg text-mouse-teal text-xs font-medium">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      This typically takes 5–10 minutes
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      You can leave this page — we’ll keep provisioning in the background. Check your portal or we’ll notify you when King Mouse is ready.
                    </p>
                    <a href="/portal" className="inline-block mt-3 text-mouse-teal text-sm font-medium hover:underline">
                      Go to portal →
                    </a>
                  </div>
                </>
              )}
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
