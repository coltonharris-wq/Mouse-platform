"use client";

import { useState, useRef, useEffect } from "react";
import { Crown, X, Send, Bot, User, ChevronRight, Plus, Minus, Play, Pause, RotateCcw } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: Action[];
}

interface Action {
  label: string;
  action: string;
}

const mockResponses: Record<string, { content: string; actions?: Action[] }> = {
  default: {
    content: "Greetings! I'm King Mouse, the sovereign of this digital workforce. How may I assist you today?",
    actions: [
      { label: "Deploy new employee", action: "deploy" },
      { label: "Manage existing team", action: "manage" },
      { label: "Check work hours", action: "hours" },
      { label: "View analytics", action: "analytics" },
    ],
  },
  deploy: {
    content: "What type of employee would you like to deploy?",
    actions: [
      { label: "Sales Follow-Up Specialist", action: "deploy_sales" },
      { label: "Accounts Receivable Agent", action: "deploy_ar" },
      { label: "Data Entry Specialist", action: "deploy_data" },
      { label: "Executive Assistant", action: "deploy_ea" },
    ],
  },
  deploy_sales: {
    content: "Excellent choice! A Sales Follow-Up Specialist will cost $997/month. This employee will:\n\n• Log into your CRM and identify leads requiring follow-up\n• Draft personalized emails and send SMS reminders\n• Update pipeline stages and contact records\n\nWould you like to proceed?",
    actions: [
      { label: "Yes, deploy now", action: "confirm_deploy" },
      { label: "View pricing options", action: "pricing" },
      { label: "Go back", action: "deploy" },
    ],
  },
  manage: {
    content: "Your current workforce:\n\n🟢 Alex (Sales) - Active\n🟢 Jordan (AR) - Working\n🟡 Morgan (Data) - Idle\n\nWhat would you like to do?",
    actions: [
      { label: "View Alex's details", action: "view_alex" },
      { label: "Pause an employee", action: "pause" },
      { label: "Reassign tasks", action: "reassign" },
    ],
  },
  hours: {
    content: "Your work hours balance:\n\n💼 Current Balance: 47.5 hours\n📊 Used This Month: 22.5 hours\n⏰ Hours Remaining: 25 hours\n\nYou're on the Growth Plan with 70 hours/month. Would you like to purchase additional hours?",
    actions: [
      { label: "Buy 20 hours - $97", action: "buy_20" },
      { label: "Buy 70 hours - $297", action: "buy_70" },
      { label: "Buy 125 hours - $497", action: "buy_125" },
      { label: "View usage history", action: "usage" },
    ],
  },
  buy_20: {
    content: "Perfect! 20 additional hours for $97.\n\nNew balance will be: 67.5 hours\n\nProceed to checkout?",
    actions: [
      { label: "Pay with card", action: "checkout" },
      { label: "Use account balance", action: "pay_balance" },
    ],
  },
};

interface KingMouseAvatarProps {
  variant?: "portal" | "admin" | "dashboard";
}

export default function KingMouseAvatar({ variant = "portal" }: KingMouseAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleBotResponse("default");
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBotResponse = (key: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const response = mockResponses[key] || mockResponses.default;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: response.content,
          actions: response.actions,
        },
      ]);
      setIsTyping(false);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    }, 800);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: input },
    ]);
    
    const lowerInput = input.toLowerCase();
    setInput("");
    
    setTimeout(() => {
      if (lowerInput.includes("deploy") || lowerInput.includes("hire")) {
        handleBotResponse("deploy");
      } else if (lowerInput.includes("manage") || lowerInput.includes("team")) {
        handleBotResponse("manage");
      } else if (lowerInput.includes("hour") || lowerInput.includes("balance")) {
        handleBotResponse("hours");
      } else {
        setIsTyping(true);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "I can help you deploy employees, manage your team, check work hours, or view analytics. What would you like to do?",
              actions: mockResponses.default.actions,
            },
          ]);
          setIsTyping(false);
        }, 600);
      }
    }, 300);
  };

  const handleAction = (action: string) => {
    handleBotResponse(action);
  };

  return (
    <>
      {/* Floating Avatar Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-mouse-navy to-mouse-teal shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      >
        <div className="relative">
          <Crown className="w-8 h-8 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-mouse-orange text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-mouse-slate/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-mouse-navy to-mouse-teal px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">King Mouse</h3>
                <p className="text-mouse-slate text-xs">Your AI Workforce Monarch</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-mouse-offwhite">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-mouse-teal" : "bg-mouse-navy"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Crown className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 ${msg.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-mouse-teal text-white rounded-tr-sm"
                        : "bg-white border border-mouse-slate/20 text-mouse-charcoal rounded-tl-sm shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.actions && msg.role === "assistant" && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.actions.map((action) => (
                        <button
                          key={action.action}
                          onClick={() => handleAction(action.action)}
                          className="px-3 py-1.5 bg-mouse-navy/10 hover:bg-mouse-navy hover:text-white text-mouse-navy text-xs font-medium rounded-full transition-colors flex items-center gap-1"
                        >
                          {action.label}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-mouse-navy flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-mouse-slate/20 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-mouse-slate rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-mouse-slate rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-mouse-slate rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-mouse-slate/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask King Mouse anything..."
                className="flex-1 px-4 py-2.5 bg-mouse-offwhite border border-mouse-slate/20 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-mouse-teal/50 text-mouse-charcoal"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 bg-mouse-teal text-white rounded-full flex items-center justify-center hover:bg-mouse-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
