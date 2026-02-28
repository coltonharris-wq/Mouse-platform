'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  ChevronDown, 
  Sparkles,
  Command,
  Monitor,
  Users,
  Settings,
  Activity,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: QuickAction[];
}

interface QuickAction {
  label: string;
  icon: React.ElementType;
  command: string;
}

const quickActions: QuickAction[] = [
  { label: 'Deploy Employee', icon: Users, command: '/deploy' },
  { label: 'View VMs', icon: Monitor, command: '/vms' },
  { label: 'Assign Task', icon: Command, command: '/task' },
  { label: 'Monitor Activity', icon: Activity, command: '/monitor' },
];

const mockResponses: Record<string, string> = {
  '/deploy': 'I can help you deploy a new AI employee! What role do you need?\n\n• Web Developer\n• Sales Representative\n• Customer Support\n• Data Analyst\n• Social Media Manager',
  '/vms': 'Here are your current VMs:\n\n🟢 VM-001: Web Developer Knight\n   Status: Running | Uptime: 14d 6h\n\n🟢 VM-002: Support Agent Alice\n   Status: Running | Uptime: 7d 2h\n\n🟡 VM-003: Data Analyst Bob\n   Status: Paused | Last active: 2h ago',
  '/task': 'What task would you like to assign? I can:\n\n• Create a new task\n• View task queue\n• Check task status\n• Reassign tasks',
  '/monitor': '📊 Current Activity Monitor:\n\nActive Employees: 3/3\nTasks in Queue: 12\nCompleted Today: 47\nAvg Response Time: 2.3s\n\nAll systems operating normally! ✅',
  'hello': 'Hello! I\'m King Mouse 👑🐭\n\nYour AI workforce orchestrator. I can help you:\n\n• Deploy and manage AI employees\n• Monitor VM activity\n• Assign tasks\n• Check security logs\n• Purchase work hours\n\nWhat would you like to do?',
  'help': 'Here are my available commands:\n\n/deploy - Deploy a new AI employee\n/vms - View and manage VMs\n/task - Assign or manage tasks\n/monitor - Check system activity\n/hours - Check work hours balance\n/buy - Purchase more work hours\n/security - Security status\n\nOr just ask me anything!',
};

export default function KingMouseAvatar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m King Mouse 👑🐭\n\nYour AI workforce orchestrator. How can I help you today?',
      timestamp: new Date(),
      actions: quickActions,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const lowerInput = inputValue.toLowerCase();
      let responseContent = mockResponses['hello'];

      // Check for command matches
      for (const [cmd, response] of Object.entries(mockResponses)) {
        if (lowerInput.includes(cmd) || lowerInput.startsWith(cmd)) {
          responseContent = response;
          break;
        }
      }

      // Check for keywords
      if (lowerInput.includes('deploy') || lowerInput.includes('hire')) {
        responseContent = mockResponses['/deploy'];
      } else if (lowerInput.includes('vm') || lowerInput.includes('computer')) {
        responseContent = mockResponses['/vms'];
      } else if (lowerInput.includes('task') || lowerInput.includes('work')) {
        responseContent = mockResponses['/task'];
      } else if (lowerInput.includes('monitor') || lowerInput.includes('status')) {
        responseContent = mockResponses['/monitor'];
      } else if (lowerInput.includes('help')) {
        responseContent = mockResponses['help'];
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        actions: quickActions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputValue(action.command);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="relative">
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-[#1e3a5f] rounded-full animate-ping opacity-20" />
          
          {/* Avatar button */}
          <div className="relative w-14 h-14 bg-[#1e3a5f] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110">
            <span className="text-3xl">🐭</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with King Mouse
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'w-72' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-2xl">🐭</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1e3a5f]" />
            </div>
            <div>
              <h3 className="font-semibold">King Mouse</h3>
              <p className="text-xs text-blue-200">AI Orchestrator</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-[420px] overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-[#1e3a5f] text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-line text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {/* Quick Actions */}
                    {message.actions && message.role === 'assistant' && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.actions.map((action) => (
                          <button
                            key={action.command}
                            onClick={() => handleQuickAction(action)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-gray-50 hover:border-[#1e3a5f] transition-colors"
                          >
                            <action.icon className="w-3 h-3" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
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
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message or command..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-[#1e3a5f] text-white rounded-xl hover:bg-[#2d4a6f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Try typing /help for available commands
              </p>
            </div>
          </>
        )}

        {isMinimized && (
          <div className="p-4 bg-gray-50">
            <p className="text-sm text-gray-600">👋 Click to expand and chat with King Mouse!</p>
          </div>
        )}
      </div>
    </div>
  );
}
