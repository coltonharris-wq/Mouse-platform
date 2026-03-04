'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWorkHours } from './WorkHoursContext';
import { WORK_HOURS_COSTS } from '@/lib/work-hours-costs';
import { useSecurity } from './SecurityContext';

export type EmployeeRole = 'sales' | 'support' | 'developer' | 'analyst' | 'custom';
export type EmployeeStatus = 'idle' | 'deploying' | 'working' | 'paused' | 'error';
export type CommunicationStyle = 'professional' | 'friendly' | 'formal' | 'casual';

export interface EmployeePersonality {
  name: string;
  avatar: string;
  style: CommunicationStyle;
  greeting: string;
  signature: string;
}

export interface DeploymentStage {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number;
  message: string;
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  roleDisplay: string;
  status: EmployeeStatus;
  skills: string[];
  personality: EmployeePersonality;
  vmId?: string;
  vmIp?: string;
  openclayUrl?: string;
  tasksCompleted: number;
  hoursUsed: number;
  efficiency: number;
  createdAt: Date;
  deployedAt?: Date;
  deploymentStages?: DeploymentStage[];
  config?: Record<string, any>;
}

// Employee name pools for different roles
const NAME_POOLS: Record<EmployeeRole, string[]> = {
  sales: ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery'],
  support: ['Sam', 'Jamie', 'Drew', 'Parker', 'Reese', 'Sage', 'Blake', 'Hayden'],
  developer: ['Charlie', 'Skyler', 'Dakota', 'Emerson', 'Finley', 'Harper', 'Kendall', 'Lane'],
  analyst: ['Bailey', 'Cameron', 'Dale', 'Ellis', 'Frankie', 'Gray', 'Harley', 'Indigo'],
  custom: ['Phoenix', 'River', 'Sawyer', 'Tatum', 'Umber', 'Val', 'Wren', 'Zephyr'],
};

// Avatar URLs for employees
const AVATAR_POOLS: Record<EmployeeRole, string[]> = {
  sales: ['👔', '💼', '🤝', '📈', '💎', '🎯', '🏆', '🌟'],
  support: ['🎧', '💬', '🆘', '🤲', '🌈', '💙', '🙋', '📞'],
  developer: ['💻', '⚡', '🔧', '🚀', '🐛', '☕', '📱', '🔨'],
  analyst: ['📊', '📈', '🔍', '🧮', '📉', '🎲', '🧪', '📋'],
  custom: ['🎨', '🎭', '🎪', '🎬', '🎮', '🎲', '🎯', '🎪'],
};

const COMMUNICATION_STYLES: Record<EmployeeRole, CommunicationStyle> = {
  sales: 'friendly',
  support: 'professional',
  developer: 'casual',
  analyst: 'formal',
  custom: 'friendly',
};

interface EmployeeContextType {
  employees: Employee[];
  activeEmployee: Employee | null;
  isDeploying: boolean;
  deploymentProgress: number;
  deploymentStages: DeploymentStage[];
  startDeployment: (role: EmployeeRole, customName?: string) => Promise<Employee>;
  cancelDeployment: () => void;
  resetDeploymentState: () => void;
  setEmployeeStatus: (id: string, status: EmployeeStatus) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  setActiveEmployee: (employee: Employee | null) => void;
  sendMessageToEmployee: (employeeId: string, message: string) => Promise<string>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Initial deployment stages - FIXED MESSAGES
const getInitialDeploymentStages = (): DeploymentStage[] => [
  { name: 'create_vm', status: 'pending', progress: 0, message: 'Creating VM...' },
  { name: 'install_mouse_ai', status: 'pending', progress: 0, message: 'Installing Mouse AI...' },
  { name: 'configure_agent', status: 'pending', progress: 0, message: 'Configuring agent...' },
  { name: 'connect_dashboard', status: 'pending', progress: 0, message: 'Connecting to your dashboard...' },
  { name: 'activate', status: 'pending', progress: 0, message: 'Activating employee...' },
];

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentStages, setDeploymentStages] = useState<DeploymentStage[]>([]);
  const [currentDeploymentId, setCurrentDeploymentId] = useState<string | null>(null);
  
  const { balance, useHours } = useWorkHours();
  const { checkRateLimit, logEvent } = useSecurity();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Load employees from backend + localStorage on mount
  useEffect(() => {
    async function loadEmployees() {
      // Try backend first
      try {
        const session = localStorage.getItem('mouse_session');
        const customerId = session ? JSON.parse(session).customerId : null;
        if (customerId) {
          const res = await fetch(`${API_URL}/marketplace/my-employees/${customerId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.employees && data.employees.length > 0) {
              const backendEmployees = data.employees.map((e: any) => ({
                id: e.id,
                name: e.name || e.employee_name || 'AI Employee',
                role: (e.role || e.category || 'custom').toLowerCase() as EmployeeRole,
                roleDisplay: e.title || e.role_summary || 'AI Employee',
                status: (e.status === 'active' ? 'working' : e.status === 'stopped' ? 'paused' : 'idle') as EmployeeStatus,
                skills: e.skills || [],
                personality: {
                  name: e.name || 'Agent',
                  avatar: e.name?.charAt(0) || '🤖',
                  style: 'professional' as CommunicationStyle,
                  greeting: 'Hello! Ready to help.',
                  signature: 'Your AI Employee',
                },
                vmId: e.vm_id,
                tasksCompleted: e.tasks_completed || 0,
                hoursUsed: e.hours_used || 0,
                efficiency: 95,
                createdAt: new Date(e.created_at || Date.now()),
                deployedAt: e.deployed_at ? new Date(e.deployed_at) : undefined,
              }));
              setEmployees(backendEmployees);
              localStorage.setItem('mouse_employees', JSON.stringify(backendEmployees));
              console.log(`[EmployeeContext] Loaded ${backendEmployees.length} employees from backend`);
              return;
            }
          }
        }
      } catch (err) {
        console.log('[EmployeeContext] Backend fetch failed, falling back to localStorage');
      }

      // Fallback to localStorage
      const saved = localStorage.getItem('mouse_employees');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const roleDisplayFallback: Record<string, string> = {
            sales: 'Sales Follow-Up Specialist',
            support: 'Customer Support Agent',
            developer: 'Code Assistant',
            analyst: 'Data Analyst',
            custom: 'Custom Agent',
          };
          const validEmployees = parsed
            .filter((e: any) => e && e.id && e.name)
            .map((e: any) => ({
              ...e,
              status: e.status === 'deploying' ? 'error' : e.status,
              createdAt: new Date(e.createdAt),
              deployedAt: e.deployedAt ? new Date(e.deployedAt) : undefined,
              roleDisplay: e.roleDisplay || roleDisplayFallback[e.role] || 'AI Employee',
            }));
          setEmployees(validEmployees);
          console.log(`[EmployeeContext] Loaded ${validEmployees.length} employees from localStorage`);
        } catch (e) {
          console.error('[EmployeeContext] Failed to load employees:', e);
          setEmployees([]);
        }
      }
    }
    loadEmployees();
  }, []);

  // Save employees to localStorage on change
  useEffect(() => {
    localStorage.setItem('mouse_employees', JSON.stringify(employees));
  }, [employees]);

  const generatePersonality = (role: EmployeeRole): EmployeePersonality => {
    const names = NAME_POOLS[role];
    const avatars = AVATAR_POOLS[role];
    const name = names[Math.floor(Math.random() * names.length)];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    const style = COMMUNICATION_STYLES[role];
    
    const greetings: Record<EmployeeRole, string[]> = {
      sales: [
        "Hey there! Ready to close some deals?",
        "Hi! Let's turn leads into customers!",
        "Hello! Your sales champion is here!",
      ],
      support: [
        "Hello! I'm here to help your customers.",
        "Hi there! Ready to solve some problems?",
        "Greetings! Your support specialist reporting for duty.",
      ],
      developer: [
        "Hey! Ready to ship some code?",
        "Hi! Let's build something awesome.",
        "Hello! Your coding companion is online.",
      ],
      analyst: [
        "Greetings. I am ready to analyze.",
        "Hello. Data insights await.",
        "Hi. Prepared for analytical operations.",
      ],
      custom: [
        "Hello! I'm ready to help.",
        "Hi there! Let's get to work.",
        "Greetings! Ready when you are.",
      ],
    };
    
    const signatures: Record<EmployeeRole, string[]> = {
      sales: ["Let's make it happen!", "To your success!", "Happy selling!"],
      support: ["Here to help!", "Have a great day!", "Customer first!"],
      developer: ["Keep coding!", "Ship it!", "Bug-free vibes!"],
      analyst: ["Data-driven decisions.", "Insights delivered.", "Analysis complete."],
      custom: ["Ready to assist.", "At your service.", "Let's do this!"],
    };
    
    return {
      name,
      avatar,
      style,
      greeting: greetings[role][Math.floor(Math.random() * greetings[role].length)],
      signature: signatures[role][Math.floor(Math.random() * signatures[role].length)],
    };
  };

  const startDeployment = async (role: EmployeeRole, customName?: string): Promise<Employee> => {
    try {
      // Validate role
      if (!role || !['sales', 'support', 'developer', 'analyst', 'custom'].includes(role)) {
        throw new Error(`Invalid employee role: ${role}. Must be one of: sales, support, developer, analyst, custom`);
      }

      if (!checkRateLimit('deploy')) {
        throw new Error('Rate limit exceeded. Please wait before deploying more employees.');
      }

      const deployCost = WORK_HOURS_COSTS.deployAiEmployee;
      if (balance < deployCost) {
        throw new Error(`Insufficient work hours. Need ${deployCost}h, have ${balance.toFixed(1)}h. Please purchase more hours.`);
      }

      const success = useHours(deployCost, `Deploy ${role} employee`, customName);
      if (!success) {
        throw new Error('Failed to deduct work hours. Please try again.');
      }

      // Clear any previous deployment state
      if (currentDeploymentId) {
        console.log('[EmployeeContext] Cleaning up previous deployment:', currentDeploymentId);
        setEmployees(prev => prev.filter(e => e.id !== currentDeploymentId));
      }

      setIsDeploying(true);
      setDeploymentProgress(0);
      const stages = getInitialDeploymentStages();
      setDeploymentStages(stages);

      const personality = generatePersonality(role);
      const roleDisplays: Record<EmployeeRole, string> = {
        sales: 'Sales Follow-Up Specialist',
        support: 'Customer Support Agent',
        developer: 'Code Assistant',
        analyst: 'Data Analyst',
        custom: 'Custom Agent',
      };

      const newEmployee: Employee = {
        id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: customName?.trim() || personality.name,
        role,
        roleDisplay: roleDisplays[role],
        status: 'deploying',
        skills: getSkillsForRole(role),
        personality,
        tasksCompleted: 0,
        hoursUsed: 0,
        efficiency: 95,
        createdAt: new Date(),
        deploymentStages: stages,
      };

      setCurrentDeploymentId(newEmployee.id);
      setEmployees(prev => [...prev, newEmployee]);

      console.log('[EmployeeContext] Starting deployment:', newEmployee.id, newEmployee.name);

      logEvent({
        type: 'system',
        severity: 'low',
        message: `Started deployment of ${role} employee: ${newEmployee.name}`,
      });

      // Start deployment simulation
      await simulateDeployment(newEmployee.id, stages);

      return newEmployee;
    } catch (error: any) {
      console.error('[EmployeeContext] Deployment failed:', error);
      setIsDeploying(false);
      setDeploymentProgress(0);
      throw error;
    }
  };

  const simulateDeployment = async (employeeId: string, stages: DeploymentStage[]) => {
    const stageDuration = 3000; // 3 seconds per stage (5 stages = ~15 seconds total) - faster for better UX
    
    try {
      for (let i = 0; i < stages.length; i++) {
        // Check if employee still exists (might have been deleted during deployment)
        const currentEmp = employees.find(e => e.id === employeeId);
        if (!currentEmp) {
          console.log('[EmployeeContext] Employee deleted during deployment, stopping simulation');
          setIsDeploying(false);
          setDeploymentProgress(0);
          setCurrentDeploymentId(null);
          return;
        }

        // Update current stage to in_progress
        setDeploymentStages(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'in_progress' };
          return updated;
        });

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, stageDuration / 5));
          
          setDeploymentStages(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], progress };
            return updated;
          });
          
          setDeploymentProgress(((i * 100) + progress) / stages.length);
        }

        // Mark stage as completed
        setDeploymentStages(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'completed', progress: 100 };
          return updated;
        });

        // Update employee with stage progress
        setEmployees(prev => prev.map(emp => {
          if (emp.id === employeeId) {
            return { ...emp, deploymentStages: stages };
          }
          return emp;
        }));
      }

      // Deployment complete - generate VM details
      const vmId = `vm-${Math.random().toString(36).substr(2, 9)}`;
      const vmIp = `10.0.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
      const openclayUrl = `https://${vmId}.mouse.internal`;

      // Log the deployed employee name before clearing state
      const deployedEmp = employees.find(e => e.id === employeeId);
      if (deployedEmp) {
        logEvent({
          type: 'system',
          severity: 'low',
          message: `Deployment complete for employee: ${deployedEmp.name}`,
        });
      }

      // Update employee to idle status (ready to work)
      setEmployees(prev => prev.map(emp => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            status: 'idle' as EmployeeStatus,
            vmId,
            vmIp,
            openclayUrl,
            deployedAt: new Date(),
          };
        }
        return emp;
      }));

      setIsDeploying(false);
      setDeploymentProgress(100);
      setCurrentDeploymentId(null);

    } catch (error: any) {
      console.error('[EmployeeContext] Deployment simulation failed:', error);
      
      // Mark employee as error state
      setEmployees(prev => prev.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, status: 'error' as EmployeeStatus };
        }
        return emp;
      }));
      
      setIsDeploying(false);
      setDeploymentProgress(0);
      setCurrentDeploymentId(null);
      
      throw new Error(`Deployment failed: ${error.message}`);
    }
  };

  const cancelDeployment = () => {
    if (currentDeploymentId) {
      setEmployees(prev => prev.filter(emp => emp.id !== currentDeploymentId));
      setCurrentDeploymentId(null);
    }
    setIsDeploying(false);
    setDeploymentProgress(0);
    setDeploymentStages([]);
  };

  const resetDeploymentState = () => {
    console.log('[EmployeeContext] Resetting deployment state');
    setIsDeploying(false);
    setDeploymentProgress(0);
    setDeploymentStages([]);
    setCurrentDeploymentId(null);
    // Also clean up any stuck 'deploying' employees
    setEmployees(prev => prev.map(emp => 
      emp.status === 'deploying' ? { ...emp, status: 'error' } : emp
    ));
  };

  const setEmployeeStatus = (id: string, status: EmployeeStatus) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        logEvent({
          type: 'system',
          severity: 'low',
          message: `${emp.name} status changed to ${status}`,
        });
        return { ...emp, status };
      }
      return emp;
    }));
  };

  const deleteEmployee = (id: string) => {
    try {
      const emp = employees.find(e => e.id === id);
      if (!emp) {
        console.warn('[EmployeeContext] Employee not found for deletion:', id);
        return;
      }

      console.log('[EmployeeContext] Deleting employee:', id, emp.name);

      logEvent({
        type: 'system',
        severity: 'medium',
        message: `Deleted employee: ${emp.name}`,
      });

      // Calculate updated employees first
      const updatedEmployees = employees.filter(e => e.id !== id);

      // Remove from state
      setEmployees(updatedEmployees);
      console.log('[EmployeeContext] Employees after deletion:', updatedEmployees.length);

      // Clear active employee if needed
      if (activeEmployee?.id === id) {
        setActiveEmployee(null);
      }

      // Clear current deployment if deleting the deploying employee
      if (currentDeploymentId === id) {
        setCurrentDeploymentId(null);
        setIsDeploying(false);
        setDeploymentProgress(0);
      }

      // Force save to localStorage immediately with the correct filtered list
      localStorage.setItem('mouse_employees', JSON.stringify(updatedEmployees));
      console.log('[EmployeeContext] Saved to localStorage after deletion');

    } catch (error: any) {
      console.error('[EmployeeContext] Failed to delete employee:', error);
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  };

  const getEmployeeById = (id: string) => {
    return employees.find(e => e.id === id);
  };

  const sendMessageToEmployee = async (employeeId: string, message: string): Promise<string> => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    if (employee.status !== 'idle' && employee.status !== 'working') {
      throw new Error('Employee is not available');
    }

    // Simulate employee response based on role and personality
    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses = getEmployeeResponses(employee);
    const response = responses[Math.floor(Math.random() * responses.length)];

    // Update employee stats
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          tasksCompleted: emp.tasksCompleted + 1,
          hoursUsed: emp.hoursUsed + 0.1,
        };
      }
      return emp;
    }));

    return response;
  };

  return (
    <EmployeeContext.Provider value={{
      employees,
      activeEmployee,
      isDeploying,
      deploymentProgress,
      deploymentStages,
      startDeployment,
      cancelDeployment,
      resetDeploymentState,
      setEmployeeStatus,
      deleteEmployee,
      getEmployeeById,
      setActiveEmployee,
      sendMessageToEmployee,
    }}>
      {children}
    </EmployeeContext.Provider>
  );
}

function getSkillsForRole(role: EmployeeRole): string[] {
  const skills: Record<EmployeeRole, string[]> = {
    sales: ['Lead Qualification', 'Email Outreach', 'CRM Management', 'Demo Scheduling', 'Follow-up Automation'],
    support: ['Ticket Resolution', 'Live Chat', 'Knowledge Base', 'Escalation Handling', 'Customer Satisfaction'],
    developer: ['Code Review', 'Bug Fixing', 'Documentation', 'Testing', 'API Integration'],
    analyst: ['Report Generation', 'Data Visualization', 'SQL Queries', 'Forecasting', 'Trend Analysis'],
    custom: ['Task Automation', 'Workflow Optimization', 'Custom Integrations', 'Process Management'],
  };
  return skills[role];
}

function getEmployeeResponses(employee: Employee): string[] {
  const style = employee.personality.style;
  const role = employee.role;

  const baseResponses: Record<EmployeeRole, string[]> = {
    sales: [
      "I've identified 5 hot leads that need follow-up today.",
      "Just scheduled 3 demos for next week!",
      "Updated the CRM with today's activities.",
      "Sent personalized outreach to 12 prospects.",
      "Pipeline looking strong - $45K in potential deals.",
    ],
    support: [
      "Resolved 8 tickets this morning. Customer satisfaction is at 94%.",
      "I've documented the new FAQ entries you requested.",
      "Escalated 2 complex issues to the senior team.",
      "Average response time is now under 2 minutes.",
      "Created a new knowledge base article for the common login issue.",
    ],
    developer: [
      "Fixed that bug in the authentication flow.",
      "Code review complete - left some comments on the PR.",
      "Just deployed the new feature to staging.",
      "Updated the API documentation with the new endpoints.",
      "All tests passing! Ready to ship.",
    ],
    analyst: [
      "Q3 revenue forecast shows 23% growth potential.",
      "Customer churn rate decreased by 2.1% this month.",
      "I've identified 3 key trends in the sales data.",
      "Dashboard updated with this week's metrics.",
      "A/B test results are in - variant B performed 15% better.",
    ],
    custom: [
      "Task completed successfully.",
      "I've processed your request.",
      "Workflow automation is now active.",
      "Integration configured and tested.",
      "Ready for the next assignment.",
    ],
  };

  // Adjust tone based on communication style
  const toneModifiers: Record<CommunicationStyle, string> = {
    professional: "Let me know if you need anything else.",
    friendly: "Let me know if there's anything else I can help with!",
    formal: "Please advise if further assistance is required.",
    casual: "Hit me up if you need anything else!",
  };

  return baseResponses[role].map(r => `${r} ${toneModifiers[style]}`);
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
}
