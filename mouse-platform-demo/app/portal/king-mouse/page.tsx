'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Power, Plus, Users } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Employee {
  id: string;
  vmId: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function KingMouseChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [instanceStatus, setInstanceStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deployingEmployee, setDeployingEmployee] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const customerId = 'demo-customer'; // Get from auth

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    checkStatus();
    loadEmployees();
  }, []);

  async function checkStatus() {
    try {
      const response = await fetch(`/api/vm-orchestrator?customerId=${customerId}`);
      const data = await response.json();
      
      if (data.success && data.kingMouse) {
        setInstanceStatus('active');
        setEmployees(data.employees || []);
        
        if (messages.length === 0) {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: `🖱️ Welcome! I'm your King Mouse - your AI workforce orchestrator.\n\nI have OpenClaw installed and can deploy AI employees, each with their own OpenClaw instance.\n\nYour employees can:\n• Work autonomously with their own OpenClaw\n• Execute complex tasks\n• Report back to me\n• Collaborate on projects\n\nTry saying: "Deploy a sales rep"`,
            timestamp: new Date(),
          }]);
        }
      } else {
        setInstanceStatus(data.kingMouse ? 'active' : 'error');
      }
    } catch (error) {
      console.error('Status check failed:', error);
      setInstanceStatus('error');
    }
  }

  async function loadEmployees() {
    try {
      const response = await fetch(`/api/vm-orchestrator?customerId=${customerId}`);
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  }

  async function deployEmployee(type: string) {
    setDeployingEmployee(true);
    
    try {
      const response = await fetch('/api/vm-orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createEmployee',
          customerId,
          employeeType: type,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const newEmployee = data.employee;
        setEmployees(prev => [...prev, newEmployee]);
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ **${type} employee deployed!**\n\nVM ID: ${newEmployee.vmId}\nStatus: ${newEmployee.status}\nOpenClaw: Installed and running\n\nYour employee now has its own OpenClaw instance and can work autonomously. It will report progress to me.`,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Failed to deploy ${type} employee: ${data.error || 'Unknown error'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Deploy failed:', error);
    } finally {
      setDeployingEmployee(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Check for deploy command
      const deployMatch = input.match(/deploy\s+(\w+)/i);
      if (deployMatch) {
        const type = deployMatch[1].toLowerCase();
        await deployEmployee(type);
        setLoading(false);
        return;
      }

      // Send to King Mouse OpenClaw
      const response = await fetch('/api/vm-orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'command',
          vmId: 'king-mouse-vm', // Would get from state
          command: input,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.success 
          ? (data.response || 'I processed your request.')
          : (data.error || 'Sorry, I encountered an error.'),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Send message failed:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  if (instanceStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Initializing your King Mouse with OpenClaw...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Chat */}
          <div className="lg:col-span-2">
            <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0B1F3B] to-mouse-teal p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">King Mouse</h2>
                  <p className="text-white/80 text-sm">OpenClaw Orchestrator</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/80 text-sm">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-[#0B1F3B] to-mouse-teal'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {(loading || deployingEmployee) && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B1F3B] to-mouse-teal flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-gray-500">
                        {deployingEmployee ? 'Deploying employee with OpenClaw...' : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Deploy an employee or ask me anything..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Employees */}
          <div className="space-y-4">
            {/* Deploy New Employee */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Deploy Employee
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['sales', 'support', 'data', 'marketing'].map((type) => (
                  <button
                    key={type}
                    onClick={() => deployEmployee(type)}
                    disabled={deployingEmployee}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm capitalize disabled:opacity-50"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Employee List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Team ({employees.length})
              </h3>
              
              {employees.length === 0 ? (
                <p className="text-gray-500 text-sm">No employees yet. Deploy one!</p>
              ) : (
                <div className="space-y-2">
                  {employees.map((emp) => (
                    <div key={emp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 capitalize">{emp.type}</p>
                        <p className="text-xs text-gray-500">OpenClaw • {emp.status}</p>
                      </div>
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
