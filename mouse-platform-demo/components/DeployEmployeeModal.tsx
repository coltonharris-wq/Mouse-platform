"use client";

import React, { useState, useEffect } from "react";
import { X, Check, ChevronRight, Server, Calendar, Plug, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface DeployEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (employee: any) => void;
}

type Step = "role" | "schedule" | "integrations" | "review" | "deploying" | "complete";

const ROLES = [
  { id: "sales", name: "Sales Follow-Up Specialist", description: "Follows up with leads, sends emails, and manages CRM", cost: 997, icon: "📞" },
  { id: "support", name: "Customer Support Agent", description: "Answers tickets, resolves issues, and escalates when needed", cost: 997, icon: "🎧" },
  { id: "data-entry", name: "Data Entry Specialist", description: "Processes forms, updates databases, and organizes files", cost: 997, icon: "📊" },
  { id: "ea", name: "Executive Assistant", description: "Manages calendar, drafts emails, and schedules meetings", cost: 997, icon: "📅" },
  { id: "ar", name: "Accounts Receivable Agent", description: "Sends invoices, follows up on payments, and reconciles accounts", cost: 997, icon: "💰" },
];

const SCHEDULES = [
  { id: "business", name: "Business Hours", description: "Mon-Fri, 9AM-5PM EST", multiplier: 1 },
  { id: "extended", name: "Extended Hours", description: "Mon-Fri, 8AM-8PM EST", multiplier: 1.5 },
  { id: "weekends", name: "With Weekends", description: "Mon-Sun, 9AM-5PM EST", multiplier: 1.8 },
  { id: "24-7", name: "24/7 Coverage", description: "Always available", multiplier: 3 },
];

const INTEGRATIONS = [
  { id: "salesforce", name: "Salesforce", category: "CRM", icon: "☁️" },
  { id: "hubspot", name: "HubSpot", category: "CRM", icon: "🎯" },
  { id: "slack", name: "Slack", category: "Communication", icon: "💬" },
  { id: "gmail", name: "Gmail", category: "Email", icon: "✉️" },
  { id: "stripe", name: "Stripe", category: "Payments", icon: "💳" },
  { id: "quickbooks", name: "QuickBooks", category: "Accounting", icon: "📚" },
  { id: "calendly", name: "Calendly", category: "Scheduling", icon: "📆" },
  { id: "zendesk", name: "Zendesk", category: "Support", icon: "🎫" },
];

const DEPLOY_STEPS = [
  "🐭 Mouse is getting dressed for work 👔",
  "🎓 Training your new Mouse employee...",
  "🧀 Packing Mouse's lunchbox...",
  "🔌 Teaching Mouse where the cheese is...",
  "🏃 Mouse is running to their desk...",
];

export default function DeployEmployeeModal({ isOpen, onClose, onDeploy }: DeployEmployeeModalProps) {
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedSchedule, setSelectedSchedule] = useState<string>("business");
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployStepIndex, setDeployStepIndex] = useState(0);
  const [employeeName, setEmployeeName] = useState("");
  const { showToast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("role");
      setSelectedRole("");
      setSelectedSchedule("business");
      setSelectedIntegrations([]);
      setDeployProgress(0);
      setDeployStepIndex(0);
      setEmployeeName("");
    }
  }, [isOpen]);

  // Deployment progress simulation
  useEffect(() => {
    if (step === "deploying") {
      const interval = setInterval(() => {
        setDeployProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep("complete");
            return 100;
          }
          return prev + 2;
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [step]);

  // Update deploy step based on progress
  useEffect(() => {
    const stepIndex = Math.floor((deployProgress / 100) * DEPLOY_STEPS.length);
    setDeployStepIndex(Math.min(stepIndex, DEPLOY_STEPS.length - 1));
  }, [deployProgress]);

  // Complete deployment
  useEffect(() => {
    if (step === "complete" && employeeName) {
      const role = ROLES.find(r => r.id === selectedRole);
      const schedule = SCHEDULES.find(s => s.id === selectedSchedule);
      
      const newEmployee = {
        id: `emp-${Date.now()}`,
        name: employeeName,
        role: role?.name || "AI Employee",
        status: "active",
        fteEquivalent: 0.8,
        costPerMonth: Math.round((role?.cost || 997) * (schedule?.multiplier || 1)),
        tasksToday: 0,
        valueGenerated: 0,
        hoursSaved: 0,
        vmHealth: "healthy",
        lastActive: new Date().toISOString(),
        cpuUsage: 15,
        memoryUsage: 25,
        ipAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        uptime: "Just started",
      };
      
      onDeploy(newEmployee);
      showToast("success", `🎉 ${employeeName} is ready to make you money! 🐭✨`);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [step, employeeName]);

  if (!isOpen) return null;

  const handleNext = () => {
    switch (step) {
      case "role":
        if (!selectedRole) {
          showToast("error", "🐭 Oops! Mouse needs to know what job they're doing! 🎡");
          return;
        }
        // Generate name based on role
        const names = ["Alex", "Jordan", "Morgan", "Riley", "Casey", "Taylor", "Quinn", "Avery"];
        setEmployeeName(names[Math.floor(Math.random() * names.length)]);
        setStep("schedule");
        break;
      case "schedule":
        setStep("integrations");
        break;
      case "integrations":
        setStep("review");
        break;
      case "review":
        setStep("deploying");
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case "schedule":
        setStep("role");
        break;
      case "integrations":
        setStep("schedule");
        break;
      case "review":
        setStep("integrations");
        break;
    }
  };

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const calculateCost = () => {
    const role = ROLES.find(r => r.id === selectedRole);
    const schedule = SCHEDULES.find(s => s.id === selectedSchedule);
    return Math.round((role?.cost || 997) * (schedule?.multiplier || 1));
  };

  const getStepNumber = () => {
    switch (step) {
      case "role": return 1;
      case "schedule": return 2;
      case "integrations": return 3;
      case "review": return 4;
      default: return 0;
    }
  };

  const getTotalSteps = 4;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-mouse-navy">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Server className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Deploy New Employee</h2>
              {step !== "deploying" && step !== "complete" && (
                <p className="text-white/60 text-xs">Step {getStepNumber()} of {getTotalSteps}</p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={step === "deploying"}
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Progress Bar (for steps 1-4) */}
        {step !== "deploying" && step !== "complete" && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    s <= getStepNumber() 
                      ? "bg-orange-500 text-white" 
                      : "bg-gray-200 text-gray-400"
                  }`}>
                    {s < getStepNumber() ? <Check size={16} /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-1 rounded-full transition-colors ${
                      s < getStepNumber() ? "bg-mouse-teal" : "bg-gray-200"
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Role</span>
              <span>Schedule</span>
              <span>Integrations</span>
              <span>Review</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Role */}
          {step === "role" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-mouse-charcoal mb-2">What role will this employee have?</h3>
                <p className="text-gray-500 text-sm">Choose the primary function for your AI employee</p>
              </div>
              <div className="grid gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRole === role.id
                        ? "border-mouse-teal bg-teal-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span className="text-2xl">{role.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-mouse-charcoal">{role.name}</span>
                        <span className="text-mouse-teal font-semibold">${role.cost}/mo</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{role.description}</p>
                    </div>
                    {selectedRole === role.id && (
                      <div className="w-6 h-6 rounded-full bg-mouse-teal flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Work Schedule */}
          {step === "schedule" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-mouse-charcoal mb-2">When should they work?</h3>
                <p className="text-gray-500 text-sm">Select the schedule that fits your business needs</p>
              </div>
              <div className="grid gap-3">
                {SCHEDULES.map((schedule) => (
                  <button
                    key={schedule.id}
                    onClick={() => setSelectedSchedule(schedule.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      selectedSchedule === schedule.id
                        ? "border-mouse-teal bg-teal-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedSchedule === schedule.id ? "bg-mouse-teal" : "bg-gray-100"
                    }`}>
                      <Calendar size={24} className={selectedSchedule === schedule.id ? "text-white" : "text-gray-500"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-mouse-charcoal">{schedule.name}</span>
                        <span className="text-mouse-teal font-semibold">
                          {schedule.multiplier === 1 ? "Base price" : `x${schedule.multiplier}`}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{schedule.description}</p>
                    </div>
                    {selectedSchedule === schedule.id && (
                      <div className="w-6 h-6 rounded-full bg-mouse-teal flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Integrations */}
          {step === "integrations" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-mouse-charcoal mb-2">Connect your tools</h3>
                <p className="text-gray-500 text-sm">Select the integrations your employee will need access to</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INTEGRATIONS.map((integration) => (
                  <button
                    key={integration.id}
                    onClick={() => toggleIntegration(integration.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedIntegrations.includes(integration.id)
                        ? "border-mouse-teal bg-teal-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span className="text-xl">{integration.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-mouse-charcoal text-sm block truncate">{integration.name}</span>
                      <span className="text-xs text-gray-400">{integration.category}</span>
                    </div>
                    {selectedIntegrations.includes(integration.id) && (
                      <Check size={16} className="text-mouse-teal flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              {selectedIntegrations.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">
                  No integrations selected. You can add them later in settings.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === "review" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-mouse-charcoal mb-2">Review your deployment</h3>
                <p className="text-gray-500 text-sm">Double-check everything before launching your new employee</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 bg-mouse-navy rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">{employeeName[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-mouse-charcoal text-lg">{employeeName}</p>
                    <p className="text-gray-500">{ROLES.find(r => r.id === selectedRole)?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Schedule</span>
                    <span className="font-medium">{SCHEDULES.find(s => s.id === selectedSchedule)?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Monthly Cost</span>
                    <span className="font-semibold text-mouse-teal text-lg">${calculateCost().toLocaleString()}</span>
                  </div>
                </div>

                {selectedIntegrations.length > 0 && (
                  <div className="pt-2">
                    <span className="text-gray-500 text-sm block mb-2">Integrations ({selectedIntegrations.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedIntegrations.map(id => {
                        const integration = INTEGRATIONS.find(i => i.id === id);
                        return (
                          <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs border border-gray-200">
                            <span>{integration?.icon}</span>
                            {integration?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
                <DollarSign className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium text-blue-700 text-sm">Billing Note</p>
                  <p className="text-blue-600 text-xs mt-1">
                    You'll be charged ${calculateCost().toLocaleString()} monthly starting today. 
                    You can pause or terminate this employee at any time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Deploying State */}
          {step === "deploying" && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-mouse-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="text-mouse-teal animate-spin" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-mouse-charcoal mb-2">🏃 {employeeName} is getting ready...</h3>
              <p className="text-gray-500 text-sm mb-6">{DEPLOY_STEPS[deployStepIndex]}</p>
              
              {/* Progress Bar */}
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-mouse-teal rounded-full transition-all duration-300"
                    style={{ width: `${deployProgress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Step {Math.min(deployStepIndex + 1, DEPLOY_STEPS.length)} of {DEPLOY_STEPS.length}</span>
                  <span>{Math.round(deployProgress)}%</span>
                </div>
              </div>

              {/* Deployment Steps */}
              <div className="mt-8 space-y-2 max-w-sm mx-auto">
                {DEPLOY_STEPS.map((stepText, idx) => (
                  <div key={idx} className={`flex items-center gap-3 text-sm ${
                    idx <= deployStepIndex ? "text-gray-700" : "text-gray-400"
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      idx < deployStepIndex ? "bg-green-500" : 
                      idx === deployStepIndex ? "bg-mouse-teal" : "bg-gray-200"
                    }`}>
                      {idx < deployStepIndex ? (
                        <Check size={12} className="text-white" />
                      ) : idx === deployStepIndex ? (
                        <Loader2 size={12} className="text-white animate-spin" />
                      ) : null}
                    </div>
                    <span>{stepText}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete State */}
          {step === "complete" && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="text-green-600" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-mouse-charcoal mb-2">🎉 {employeeName} is ready!</h3>
              <p className="text-gray-500 text-sm mb-4">
                🧀 Mission accomplished! Your new {ROLES.find(r => r.id === selectedRole)?.name.toLowerCase()} got the cheese and is ready to work!
              </p>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100 max-w-sm mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-mouse-navy rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">{employeeName[0]}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-mouse-charcoal">{employeeName}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      🐭 On the job and ready to gnaw!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "deploying" && step !== "complete" && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button
              onClick={step === "role" ? onClose : handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              {step === "role" ? "Cancel" : "Back"}
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-mouse-navy text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
            >
              {step === "review" ? "Deploy Employee" : "Continue"}
              {step !== "review" && <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
