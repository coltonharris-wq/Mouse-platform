'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  Play, 
  Pause, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Store
} from 'lucide-react';
import { useEmployees, Employee } from '@/app/context/EmployeeContext';
import KingMouseAvatar from '@/app/components/KingMouseAvatar';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    working: "bg-blue-100 text-blue-700",
    idle: "bg-gray-100 text-gray-600",
    deploying: "bg-yellow-100 text-yellow-700",
    paused: "bg-orange-100 text-orange-700",
    error: "bg-red-100 text-red-700",
  };
  
  const labels: Record<string, string> = {
    active: 'Active',
    working: 'Working',
    idle: 'Available',
    deploying: 'Deploying...',
    paused: 'Paused',
    error: 'Error',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
      styles[status] ?? "bg-gray-100 text-gray-600"
    }`}>
      {status === 'deploying' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'idle' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
      {status === 'working' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
      {status === 'paused' && <Pause className="w-3 h-3" />}
      {status === 'error' && <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
      {labels[status] || status}
    </span>
  );
}

export default function EmployeesPage() {
  const router = useRouter();
  const { employees, isDeploying, deploymentProgress, resetDeploymentState, deploymentStages, startDeployment } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  // Count employees in error state (stuck deployments)
  const errorEmployees = employees.filter(e => e.status === 'error' || e.status === 'deploying');

  const handleDeployClick = async () => {
    setDeployError(null);
    try {
      // Start deployment directly - no modal needed for quick deploy
      // Default to 'sales' role for quick deploy, can be changed later
      await startDeployment('sales');
      console.log('[EmployeesPage] Deployment started successfully');
    } catch (err: any) {
      console.error('[EmployeesPage] Failed to start deployment:', err);
      setDeployError(err.message || 'Failed to start deployment. Redirecting to marketplace...');
      // Only redirect to marketplace on error after a delay
      setTimeout(() => router.push('/dashboard/marketplace'), 2000);
    }
  };

  const handleResetStuckDeployments = () => {
    if (confirm('Reset stuck deployments? This will mark deploying employees as failed.')) {
      resetDeploymentState();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">AI Employees</h1>
          <p className="text-sm text-mouse-slate">
            {employees.length === 0 
              ? "No employees yet. Deploy your first AI employee!"
              : `You have ${employees.length} AI employee${employees.length !== 1 ? 's' : ''} ready to work.`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {errorEmployees.length > 0 && (
            <button
              onClick={handleResetStuckDeployments}
              className="flex items-center gap-2 px-3 py-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-sm"
              title="Reset stuck deployments"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          )}
          <Link
            href="/dashboard/marketplace"
            className="flex items-center gap-2 px-4 py-2 bg-mouse-navy text-white rounded-lg hover:bg-mouse-teal transition-colors"
          >
            <Store className="w-4 h-4" />
            Browse Marketplace
          </Link>
          <button
            onClick={handleDeployClick}
            className="flex items-center gap-2 px-4 py-2 bg-mouse-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Bot className="w-4 h-4" />
            Deploy New Employee
          </button>
        </div>
      </div>

      {/* Error Message */}
      {deployError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{deployError}</span>
        </div>
      )}

      {/* Deployment Progress Banner */}
      {isDeploying && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-mouse-navy animate-spin" />
            <span className="font-medium text-mouse-navy">Deploying new employee...</span>
            <span className="text-sm text-mouse-slate ml-auto">{Math.round(deploymentProgress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-mouse-navy h-2 rounded-full transition-all duration-500"
              style={{ width: `${deploymentProgress}%` }}
            />
          </div>
        </div>
      )}

      {employees.length === 0 ? (
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Deploy your first AI employee to start automating tasks. King Mouse can help you set this up in just a few minutes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-mouse-navy text-white rounded-lg hover:bg-mouse-teal transition-colors"
            >
              <Store className="w-5 h-5" />
              Browse Marketplace
            </Link>
            <button
              onClick={handleDeployClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-mouse-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Bot className="w-5 h-5" />
              Deploy Your First Employee
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-mouse-slate/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mouse-offwhite text-left">
                  <th className="px-6 py-3 text-mouse-slate font-medium">Employee</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Role</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Status</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Skills</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Tasks</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Hours Used</th>
                  <th className="px-6 py-3 text-mouse-slate font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mouse-slate/10">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-mouse-offwhite transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emp.personality.avatar}</span>
                        <div>
                          <div className="font-medium text-mouse-charcoal">{emp.name}</div>
                          <div className="text-xs text-mouse-slate">ID: {emp.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-mouse-charcoal">{emp.roleDisplay}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.skills.slice(0, 2).map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {emp.skills.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                            +{emp.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-mouse-charcoal">{emp.tasksCompleted}</td>
                    <td className="px-6 py-4 text-mouse-charcoal">{emp.hoursUsed.toFixed(1)}h</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-mouse-navy bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Chat
                        </button>
                        <Link
                          href={`/dashboard/employees/${emp.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-mouse-navy hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Details
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Chat Modal */}
      {selectedEmployee && (
        <EmployeeChatModal 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)} 
        />
      )}
    </div>
  );
}

function EmployeeChatModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const { sendMessageToEmployee } = useEmployees();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([
    {
      role: 'assistant',
      content: `${employee.personality.greeting}\n\nI'm ${employee.name}, your ${employee.roleDisplay}. ${employee.personality.signature}`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user' as const, content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendMessageToEmployee(employee.id, input);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      }]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-mouse-navy px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{employee.personality.avatar}</span>
            <div>
              <h3 className="font-semibold text-white">{employee.name}</h3>
              <p className="text-xs text-blue-200">{employee.roleDisplay} • {employee.personality.style} style</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-mouse-navy text-white rounded-br-md' 
                  : 'bg-white border border-gray-200 rounded-bl-md'
              }`}>
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Message ${employee.name}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mouse-navy focus:border-transparent text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-4 py-2 bg-mouse-navy text-white rounded-xl hover:bg-mouse-teal disabled:opacity-50"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Assign tasks, ask questions, or just say hello!
          </p>
        </div>
      </div>
    </div>
  );
}
