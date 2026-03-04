'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Mic,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
  Briefcase,
  CheckCircle
} from 'lucide-react';
import { AIEmployee } from './EmployeeMarketplace';

interface InterviewModalProps {
  employee: AIEmployee;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'employee';
  content: string;
  timestamp: Date;
}

export default function InterviewModal({ employee, onClose }: InterviewModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [avatarAnimation, setAvatarAnimation] = useState<'idle' | 'talking' | 'listening'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (employee.introMessage) {
      setIsTyping(true);
      setAvatarAnimation('talking');
      
      // Simulate typing delay
      const delay = Math.min(employee.introMessage.length * 20, 2000);
      
      setTimeout(() => {
        setMessages([
          {
            id: '1',
            role: 'employee',
            content: employee.introMessage || `Hi! I'm ${employee.name}. I'm here to help you!`,
            timestamp: new Date(),
          }
        ]);
        setIsTyping(false);
        setAvatarAnimation('idle');
      }, 800);
    }
    
    // Focus input after greeting
    setTimeout(() => {
      inputRef.current?.focus();
    }, 1500);
  }, [employee]);

  // Avatar animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTyping && messages.length > 0) {
        setAvatarAnimation(prev => {
          if (prev === 'idle') return Math.random() > 0.7 ? 'talking' : 'idle';
          return 'idle';
        });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isTyping, messages.length]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAvatarAnimation('listening');

    // Simulate employee response
    setIsTyping(true);
    setTimeout(() => {
      setAvatarAnimation('talking');
      
      const responses = getContextualResponse(inputValue.trim(), employee);
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setTimeout(() => {
        const employeeMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'employee',
          content: randomResponse,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, employeeMessage]);
        setIsTyping(false);
        setAvatarAnimation('idle');
      }, randomResponse.length * 15);
    }, 600);
  };

  const getContextualResponse = (input: string, emp: AIEmployee): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('hour')) {
      return `Great question! I cost ${emp.monthlyWorkHours || 10} work hours per month, and on average I save businesses ${emp.monthlyHoursSaved || 40} hours monthly. That's an effective rate of $${emp.hourlyRate || 4.98} per hour - a fantastic ROI!`;
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('do') || lowerInput.includes('skill')) {
      return `I can help with ${emp.skills.slice(0, 3).join(', ')}, and more! I've already helped ${(emp.totalBusinesses || 0).toLocaleString()} businesses save over ${(emp.totalHoursSaved || 0).toLocaleString()} hours. My success rate is ${emp.successRate || 95}%.`;
    }
    
    if (lowerInput.includes('experience') || lowerInput.includes('business') || lowerInput.includes('company')) {
      return `I've worked with ${(emp.totalBusinesses || 0).toLocaleString()} businesses so far, helping them save a total of ${(emp.totalHoursSaved || 0).toLocaleString()} hours! My track record speaks for itself with a ${emp.successRate || 95}% success rate.`;
    }
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return `Hello! It's wonderful to meet you. I'm excited about the possibility of joining your team. What would you like to know about how I can help your business?`;
    }
    
    if (lowerInput.includes('start') || lowerInput.includes('hire') || lowerInput.includes('deploy')) {
      return `I'd love to get started! Just click the "Start" button on my card to deploy me. I'll begin working immediately and you can monitor my progress in real-time. Let's do this! 🚀`;
    }
    
    // Default responses
    const defaults = [
      `That's an interesting question! As a ${emp.role} specialist, I'm designed to deliver exceptional results. With ${emp.efficiency}% efficiency and experience helping ${(emp.totalBusinesses || 0).toLocaleString()} businesses, I'm confident I can add value to your team.`,
      `Great point! I've successfully completed ${emp.tasksCompleted.toLocaleString()} tasks with a ${emp.successRate || 95}% success rate. I'm here to make your work life easier!`,
      `I appreciate you asking! My focus is on delivering measurable results. Businesses like yours have saved ${(emp.totalHoursSaved || 0).toLocaleString()} hours using employees like me. What specific challenges are you facing?`,
      `Excellent question! I'm part of a new generation of AI employees that are changing how businesses operate. I'm reliable, efficient, and always learning. I'd love the opportunity to prove my value to your business!`,
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Animated Avatar */}
              <div className="relative">
                <div 
                  className={`w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden shadow-lg transition-all duration-500 ${
                    avatarAnimation === 'talking' ? 'scale-110 border-white/60' : ''
                  } ${avatarAnimation === 'listening' ? 'scale-105 border-green-400/50' : ''}`}
                >
                  {employee.avatarUrl ? (
                    <img 
                      src={employee.avatarUrl} 
                      alt={employee.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center text-white text-2xl font-bold">
                      {employee.avatar}
                    </div>
                  )}
                </div>
                
                {/* Animation Indicator */}
                {avatarAnimation === 'talking' && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                    Talking
                  </div>
                )}
                {avatarAnimation === 'listening' && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Listening
                  </div>
                )}
                
                {/* Sound Waves Animation */}
                {avatarAnimation === 'talking' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 rounded-full border-2 border-white/30 animate-ping absolute" />
                    <div className="w-20 h-20 rounded-full border-2 border-white/20 animate-ping absolute" style={{ animationDelay: '0.2s' }} />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {employee.name}
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </h3>
                <p className="text-blue-200 capitalize flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {employee.role} Specialist
                </p>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-300">
                    <CheckCircle className="w-3 h-3" />
                    {employee.efficiency}% Efficient
                  </span>
                  <span className="flex items-center gap-1 text-blue-300">
                    <Clock className="w-3 h-3" />
                    {employee.hoursUsed.toFixed(0)}h Used
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Trust Metrics Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">{(employee.totalBusinesses || 0).toLocaleString()}</span>
              <span className="text-gray-400">businesses</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">{(employee.totalHoursSaved || 0).toLocaleString()}</span>
              <span className="text-gray-400">hours saved</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-gray-600">{employee.successRate || 95}%</span>
              <span className="text-gray-400">success rate</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ${
                message.role === 'user' ? 'bg-gray-300' : ''
              }`}>
                {message.role === 'employee' && employee.avatarUrl ? (
                  <img 
                    src={employee.avatarUrl} 
                    alt={employee.name}
                    className="w-full h-full object-cover"
                  />
                ) : message.role === 'employee' ? (
                  <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold">
                    {employee.avatar}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                    You
                  </div>
                )}
              </div>
              
              {/* Message Bubble */}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                  message.role === 'user'
                    ? 'bg-[#1e3a5f] text-white rounded-tr-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {employee.avatarUrl ? (
                  <img 
                    src={employee.avatarUrl} 
                    alt={employee.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold">
                    {employee.avatar}
                  </div>
                )}
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
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
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about how I can help..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-6 py-3 bg-[#1e3a5f] text-white rounded-xl hover:bg-[#2d4a6f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          
          {/* Suggested Questions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {['What can you help with?', 'How much do you cost?', 'What is your experience?', 'How do I get started?'].map((question) => (
              <button
                key={question}
                onClick={() => {
                  setInputValue(question);
                  inputRef.current?.focus();
                }}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}