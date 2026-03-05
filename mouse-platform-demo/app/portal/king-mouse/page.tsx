'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Power, Plus, Users, Clock, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hoursCharged?: number;
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
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [instanceStatus, setInstanceStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deployingEmployee, setDeployingEmployee] = useState(false);
  const [hoursBalance, setHoursBalance] = useState<number | null>(null);
  const [depleted, setDepleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getSession = () => {
    try {
      const s = localStorage.getItem('mouse_session');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    checkStatus();
    fetchBalance();
    loadConversationHistory();
  }, []);

  async function loadConversationHistory() {
    const { customerId, userId } = getSession();
    const id = customerId || userId;
    if (!id) {
      setHistoryLoaded(true);
      return;
    }
    try {
      const res = await fetch(`/api/conversations?userId=${id}&portal=customer&limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          const restored: Message[] = data.messages.map((m: any, i: number) => ({
            id: `history-${i}`,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
          }));
          setMessages(restored);
        }
      }
    } catch {}
    setHistoryLoaded(true);
  }

  async function fetchBalance() {
    const { customerId, userId } = getSession();
    const id = customerId || userId;
    if (!id) return;
    try {
      const res = await fetch(`/api/usage-events?customerId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setHoursBalance(data.balance ?? null);
        if (data.balance !== undefined && data.balance <= 0) setDepleted(true);
      }
    } catch {}
  }

  async function checkStatus() {
    const { customerId, userId } = getSession();
    const id = customerId || userId || 'demo-customer';
    try {
      const response = await fetch(`/api/vm-orchestrator?customerId=${id}`);
      const data = await response.json();

      if (data.success && data.kingMouse) {
        setInstanceStatus('active');
        setEmployees(data.employees || []);
      } else {
        setInstanceStatus('active');
      }
    } catch (error) {
      setInstanceStatus('active');
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || depleted) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      const session = getSession();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          userRole: session.role || 'customer',
          userId: session.userId,
          customerId: session.customerId || session.userId,
        }),
      });

      const data = await response.json();

      if (data.depleted) {
        setDepleted(true);
        setHoursBalance(0);
      } else if (data.newBalance !== undefined) {
        setHoursBalance(data.newBalance);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.error || 'Sorry, I encountered an error.',
        timestamp: new Date(),
        hoursCharged: data.workHoursCharged,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Send message failed:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  if (instanceStatus === 'loading' || !historyLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Connecting to King Mouse...</p>
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
                  <p className="text-white/80 text-sm">Your AI Workforce Orchestrator</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {hoursBalance !== null && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      hoursBalance <= 0 ? 'bg-red-500/20 text-red-200' :
                      hoursBalance < 5 ? 'bg-orange-500/20 text-orange-200' :
                      'bg-white/10 text-white/80'
                    }`}>
                      <Clock size={12} />
                      {hoursBalance.toFixed(1)} hrs
                    </div>
                  )}
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Depleted Banner */}
              {depleted && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-3">
                  <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Your work hours have run out</p>
                    <p className="text-xs text-red-600">Purchase more hours to continue using King Mouse.</p>
                  </div>
                  <a href="/portal/work-hours" className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors">
                    Buy Hours
                  </a>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-800 font-semibold text-lg">🖱️ Hey! I'm King Mouse</p>
                    <p className="text-gray-500 text-sm mt-2">I know your account, your team, and your usage. Ask me anything!</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {['How many hours do I have left?', 'Show me my employees', 'What plan am I on?'].map(s => (
                        <button
                          key={s}
                          onClick={() => setInput(s)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                    <div className={`max-w-[80%]`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.hoursCharged !== undefined && message.hoursCharged > 0 && (
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          {message.hoursCharged < 0.01 ? '<0.01' : message.hoursCharged.toFixed(2)} hrs used
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B1F3B] to-mouse-teal flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-gray-500">Thinking...</span>
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
                    placeholder={depleted ? "Purchase more hours to continue..." : "Ask King Mouse anything..."}
                    disabled={depleted}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim() || depleted}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Work Hours Card */}
            {hoursBalance !== null && (
              <div className={`rounded-2xl shadow-lg border p-4 ${
                depleted ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
              }`}>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-mouse-teal" />
                  Work Hours
                </h3>
                <div className={`text-3xl font-bold ${depleted ? 'text-red-500' : hoursBalance < 5 ? 'text-orange-500' : 'text-mouse-teal'}`}>
                  {hoursBalance.toFixed(1)}
                </div>
                <p className="text-xs text-gray-500 mt-1">hours remaining</p>
                {(depleted || hoursBalance < 10) && (
                  <a href="/portal/work-hours" className="mt-3 block w-full text-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
                    Purchase More Hours
                  </a>
                )}
              </div>
            )}

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
                    onClick={() => {}}
                    disabled={deployingEmployee || depleted}
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
                        <p className="text-xs text-gray-500">{emp.status}</p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${depleted ? 'bg-red-400' : 'bg-green-400'}`} />
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
