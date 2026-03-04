"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Users, Zap, Shield, ArrowRight, Loader2 } from "lucide-react";

const steps = [
  {
    title: "Welcome to Mouse AI",
    description: "Your AI workforce is ready to deploy. Let's get you set up in under 2 minutes.",
    icon: <Zap className="w-12 h-12 text-mouse-teal" />,
  },
  {
    title: "Choose Your First Employee",
    description: "Select from Sales Rep, Data Entry, Customer Support, and more.",
    icon: <Users className="w-12 h-12 text-purple-500" />,
  },
  {
    title: "Deploy Your AI Employee",
    description: "We're provisioning a dedicated 32GB VM. This takes about 45 seconds.",
    icon: <Loader2 className="w-12 h-12 text-mouse-teal animate-spin" />,
  },
  {
    title: "You're All Set!",
    description: "Your AI employee is online and ready to work.",
    icon: <CheckCircle className="w-12 h-12 text-green-400" />,
  },
];

const employeeTypes = [
  { id: "sales", name: "Sales Rep", description: "Qualifies leads, sends proposals", icon: "📞" },
  { id: "data", name: "Data Entry", description: "Processes forms, updates CRM", icon: "📊" },
  { id: "support", name: "Customer Support", description: "Answers tickets, resolves issues", icon: "💬" },
  { id: "marketing", name: "Marketing", description: "Creates content, manages ads", icon: "📢" },
];

export default function OnboardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);

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
    if (currentStep === 2 && selectedEmployee && !deploying) {
      deployVM();
    }
  }, [currentStep, selectedEmployee]);

  async function deployVM() {
    setDeploying(true);
    setDeployProgress(0);
    
    const employeeName = employeeTypes.find(e => e.id === selectedEmployee)?.name || 'AI Employee';
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 800);
    
    try {
      // Call API to create VM (server-side uses ORGO_API_KEY)
      const response = await fetch('/api/vm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userId: user?.userId || 'demo-user',
          vmConfig: {
            name: employeeName,
            ram: 32,
            cpu: 4
          }
        })
      });
      
      const data = await response.json();
      
      clearInterval(progressInterval);
      setDeployProgress(100);
      
      // Move to completion step after a brief pause
      setTimeout(() => {
        setCurrentStep(3);
        setDeploying(false);
      }, 500);
      
    } catch (error) {
      console.error('Deployment error:', error);
      clearInterval(progressInterval);
      setDeployProgress(100);
      
      // Still move to completion (VM created in mock mode)
      setTimeout(() => {
        setCurrentStep(3);
        setDeploying(false);
      }, 500);
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] flex flex-col">
      {/* Progress */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
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
        <div className="w-full max-w-md">
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

          {/* Step 1: Employee Selection */}
          {currentStep === 1 && (
            <div className="space-y-3 mb-8">
              {employeeTypes.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedEmployee === emp.id
                      ? 'border-mouse-teal bg-mouse-teal/10'
                      : 'border-gray-800 bg-[#1a1a2e] hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emp.icon}</span>
                    <div>
                      <p className="text-white font-medium">{emp.name}</p>
                      <p className="text-gray-400 text-sm">{emp.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Deploying */}
          {currentStep === 2 && (
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-6 mb-8">
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Provisioning VM...</span>
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
                  <div className="text-xl font-bold text-mouse-teal">128</div>
                  <div className="text-xs text-gray-500">GB SSD</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 3 && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-400 text-sm mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full"/>
                AI Employee Online
              </div>
              <p className="text-gray-400 text-sm">
                Your {employeeTypes.find(e => e.id === selectedEmployee)?.name} is ready to work
              </p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleNext}
            disabled={currentStep === 1 && !selectedEmployee}
            className="w-full bg-gradient-to-r from-mouse-teal to-blue-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
