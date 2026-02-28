'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Crown, 
  X, 
  Send, 
  Bot, 
  Play, 
  Pause,
  Monitor,
  Code,
  Wrench,
  Shield,
  Zap,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Action[];
}

interface Action {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface EmployeeConfig {
  name: string;
  role: string;
  skills: string[];
  status: 'idle' | 'working' | 'paused';
}

export default function KingMouseAvatar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Greetings! I am King Mouse, your AI orchestrator. I can deploy employees, monitor systems, and manage your workforce. What would you like to do?',
      timestamp: new Date(),
      actions: [
        { label: 'Deploy Employee', icon: <Bot className="w-4 h-4" /> },
        { label: 'View Systems', icon: <Monitor className="w-4 h-4" /> },
        { label: 'Security Check', icon: <Shield className="w-4 h-4" /> },
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [employees, setEmployees] = useState<EmployeeConfig[]>([
    { name: 'Sales Assistant', role: 'Sales', skills: ['Lead Qualification', 'CRM'], status: 'working' },
    { name: 'Support Bot', role: 'Support', skills: ['Tickets', 'Chat'], status: 'idle' },
  ]);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showScreenReplay, setShowScreenReplay] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(inputValue.toLowerCase());
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (input: string): Message => {
    if (input.includes('deploy') || input.includes('hire') || input.includes('create')) {
      setShowDeployModal(true);
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I can help you deploy a new AI employee. What type of employee do you need?',
        timestamp: new Date(),
        actions: [
          { label: 'Sales Agent', icon: <Bot className="w-4 h-4" /> },
          { label: 'Support Agent', icon: <MessageSquare className="w-4 h-4" /> },
          { label: 'Developer', icon: <Code className="w-4 h-4" /> },
          { label: 'Analyst', icon: <Zap className="w-4 h-4" /> },
        ]
      };
    }

    if (input.includes('screen') || input.includes('replay') || input.includes('record')) {
      setShowScreenReplay(true);
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Opening Screen Replay. I can record and playback employee actions for training and debugging.',
        timestamp: new Date(),
      };
    }

    if (input.includes('employee') || input.includes('status') || input.includes('work')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `You currently have ${employees.length} AI employees:\n\n${employees.map(e => `• ${e.name} (${e.role}) - ${e.status}`).join('\n')}\n\nTotal work hours used today: 12.5 hours`,
        timestamp: new Date(),
        actions: [
          { label: 'View Details', icon: <Monitor className="w-4 h-4" /> },
          { label: 'Pause All', icon: <Pause className="w-4 h-4" /> },
        ]
      };
    }

    if (input.includes('security') || input.includes('protect') || input.includes('safe')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Security Status: ✅ All systems protected\n\n• Anti-clone guardrails: Active\n• Rate limiting: Enabled\n• Audit logging: Active\n• Last security scan: 2 minutes ago\n\nNo threats detected.',
        timestamp: new Date(),
        actions: [
          { label: 'View Logs', icon: <Shield className="w-4 h-4" /> },
          { label: 'Run Scan', icon: <Zap className="w-4 h-4" /> },
        ]
      };
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'I can help you with:\n• Deploying AI employees\n• Monitoring work hours\n• Screen recording & replay\n• Security management\n• System orchestration\n\nWhat would you like to do?',
      timestamp: new Date(),
      actions: [
        { label: 'Deploy Employee', icon: <Bot className="w-4 h-4" /> },
        { label: 'Screen Replay', icon: <Monitor className="w-4 h-4" /> },
        { label: 'Security', icon: <Shield className="w-4 h-4" /> },
      ]
    };
  };

  const deployEmployee = (type: string) => {
    const newEmployee: EmployeeConfig = {
      name: `${type} Agent ${employees.length + 1}`,
      role: type,
      skills: type === 'Sales' ? ['Lead Gen', 'CRM'] : type === 'Support' ? ['Tickets', 'Chat'] : ['Coding', 'Debug'],
      status: 'idle'
    };
    setEmployees([...employees, newEmployee]);
    setShowDeployModal(false);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ Successfully deployed ${newEmployee.name}!\n\nRole: ${newEmployee.role}\nSkills: ${newEmployee.skills.join(', ')}\nStatus: Ready to work`,
      timestamp: new Date(),
    }]);
  };

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90' : 'bg-[#1e3a5f] hover:bg-[#2d4a6f] hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Crown className="w-7 h-7 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#1e3a5f] p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">King Mouse</h3>
              <p className="text-blue-200 text-xs">AI Orchestrator</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowScreenReplay(true)}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                title="Screen Replay"
              >
                <Monitor className="w-4 h-4 text-white" />
              </button>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  {message.actions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (action.label.includes('Deploy')) setShowDeployModal(true);
                            if (action.label.includes('Screen')) setShowScreenReplay(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full text-xs font-medium hover:bg-[#1e3a5f]/20 transition-colors"
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-xs opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask King Mouse anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent text-sm"
              />
              <button
                onClick={handleSend}
                className="p-2 bg-[#1e3a5f] text-white rounded-xl hover:bg-[#2d4a6f] transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <button onClick={() => { setInputValue('Deploy employee'); handleSend(); }} className="text-gray-500 hover:text-[#1e3a5f]">Deploy</button>
              <button onClick={() => { setInputValue('Check employees'); handleSend(); }} className="text-gray-500 hover:text-[#1e3a5f]">Status</button>
              <button onClick={() => { setInputValue('Security check'); handleSend(); }} className="text-gray-500 hover:text-[#1e3a5f]">Security</button>
              <button onClick={() => setShowScreenReplay(true)} className="text-gray-500 hover:text-[#1e3a5f]">Replay</button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Employee Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">Deploy AI Employee</h3>
            <p className="text-gray-600 mb-6">Select the type of employee to deploy:</p>
            <div className="grid grid-cols-2 gap-3">
              {['Sales', 'Support', 'Developer', 'Analyst'].map((type) => (
                <button
                  key={type}
                  onClick={() => deployEmployee(type)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-all text-center"
                >
                  <Bot className="w-8 h-8 text-[#1e3a5f] mx-auto mb-2" />
                  <span className="font-medium text-gray-900">{type}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDeployModal(false)}
              className="mt-6 w-full py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Screen Replay Modal */}
      {showScreenReplay && <ScreenReplayModal onClose={() => setShowScreenReplay(false)} employees={employees} />}
    </>
  );
}

function ScreenReplayModal({ onClose, employees }: { onClose: () => void; employees: EmployeeConfig[] }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([
    { id: '1', employee: 'Sales Assistant', duration: '2:34', date: '2 min ago', thumbnail: '📊' },
    { id: '2', employee: 'Support Bot', duration: '5:12', date: '1 hour ago', thumbnail: '💬' },
  ]);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [replayProgress, setReplayProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setRecordings(prev => [{
        id: Date.now().toString(),
        employee: employees[0]?.name || 'New Employee',
        duration: '0:30',
        date: 'Just now',
        thumbnail: '🎥'
      }, ...prev]);
    }, 3000);
  };

  const playRecording = (id: string) => {
    setSelectedRecording(id);
    setIsPlaying(true);
    setReplayProgress(0);
    
    const interval = setInterval(() => {
      setReplayProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#1e3a5f] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-white" />
            <h3 className="text-white font-semibold">Screen Replay</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Recordings List */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <button
                onClick={startRecording}
                disabled={isRecording}
                className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]'
                }`}
              >
                {isRecording ? (
                  <><span className="w-2 h-2 bg-white rounded-full animate-pulse" /> Recording...</>
                ) : (
                  <><Monitor className="w-4 h-4" /> New Recording</>
                )}
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {recordings.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => setSelectedRecording(rec.id)}
                  className={`w-full p-4 text-left hover:bg-gray-100 transition-colors ${selectedRecording === rec.id ? 'bg-blue-50 border-l-4 border-[#1e3a5f]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{rec.thumbnail}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{rec.employee}</p>
                      <p className="text-xs text-gray-500">{rec.duration} • {rec.date}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedRecording ? (
              <div>
                <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">🖥️</div>
                    <p className="text-gray-400">Employee Screen Recording</p>
                  </div>
                  {isPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                      <div 
                        className="h-full bg-[#1e3a5f] transition-all duration-100"
                        style={{ width: `${replayProgress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {recordings.find(r => r.id === selectedRecording)?.employee}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Recorded {recordings.find(r => r.id === selectedRecording)?.date}
                    </p>
                  </div>
                  <button
                    onClick={() => playRecording(selectedRecording)}
                    disabled={isPlaying}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] disabled:opacity-50"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Playing...' : 'Play'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a recording to view</p>
                  <p className="text-sm text-gray-400 mt-2">Record employee screens for training and debugging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
