'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Crown, Loader2, Wifi, WifiOff, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ChatMode = 'checking' | 'vm' | 'fallback';

export default function KingMouseChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('checking');
  const [vmStatus, setVmStatus] = useState<string | null>(null);
  const [vmId, setVmId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getSession = () => {
    try {
      const s = localStorage.getItem('mouse_session');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  };

  const getUserId = useCallback(() => {
    const session = getSession();
    return session.customerId || session.resellerId || session.userId || null;
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if customer has a VM on mount
  useEffect(() => {
    checkVmAvailability();
    loadHistory();
  }, []);

  async function checkVmAvailability() {
    const id = getUserId();
    if (!id) {
      setChatMode('fallback');
      return;
    }

    try {
      const res = await fetch(`/api/vm/chat?customerId=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.available) {
          setChatMode('vm');
          setVmStatus(data.vmStatus);
          setVmId(data.vmId);
        } else {
          setChatMode('fallback');
        }
      } else {
        setChatMode('fallback');
      }
    } catch {
      setChatMode('fallback');
    }
  }

  async function loadHistory() {
    const id = getUserId();
    if (!id) {
      setHistoryLoaded(true);
      return;
    }
    try {
      const res = await fetch(`/api/conversations?userId=${id}&portal=customer&limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages.map((m: any, i: number) => ({
            id: `history-${i}`,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
          })));
        }
      }
    } catch {}
    setHistoryLoaded(true);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      const session = getSession();
      const userId = session.customerId || session.resellerId || session.userId;
      let reply: string;

      if (chatMode === 'vm') {
        // Route through VM chat bridge (full King Mouse agent)
        reply = await sendViaVm(userInput, userId);
      } else {
        // Fallback to direct LLM chat
        reply = await sendViaFallback(userInput, session);
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendViaVm(message: string, customerId: string): Promise<string> {
    const res = await fetch('/api/vm/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, customerId }),
    });
    const data = await res.json();

    // If VM not available, fall back
    if (data.fallback) {
      setChatMode('fallback');
      const session = getSession();
      return sendViaFallback(message, session);
    }

    if (data.error && !data.reply) {
      return data.error;
    }

    return data.reply || 'No response from King Mouse.';
  }

  async function sendViaFallback(message: string, session: any): Promise<string> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        userRole: session.userRole || 'customer',
        userId: session.customerId || session.userId,
        customerId: session.customerId,
      }),
    });
    const data = await res.json();
    return data.reply || data.error || 'No response';
  }

  if (!historyLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-mouse-teal" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-mouse-teal to-[#0B1F3B] rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-mouse-navy">King Mouse</h1>
            <p className="text-sm text-mouse-slate">Your AI Operations Manager</p>
          </div>
        </div>

        {/* Connection status badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          chatMode === 'vm'
            ? 'bg-green-100 text-green-700'
            : chatMode === 'fallback'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-500'
        }`}>
          {chatMode === 'vm' ? (
            <>
              <Zap className="w-3 h-3" />
              Live VM
            </>
          ) : chatMode === 'fallback' ? (
            <>
              <Wifi className="w-3 h-3" />
              Cloud Mode
            </>
          ) : (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting...
            </>
          )}
        </div>
      </div>

      {/* VM mode info banner */}
      {chatMode === 'vm' && (
        <div className="mb-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
          🐭 Connected to your dedicated King Mouse instance — full memory, tools, and learning enabled.
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-mouse-slate/20 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-800 font-semibold">🐭 Hey! I&apos;m King Mouse</p>
            <p className="text-gray-500 text-sm mt-1">
              {chatMode === 'vm'
                ? "I'm your AI Operations Manager. I learn your business and handle the work."
                : "I can help with your business operations. Ask me anything!"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {[
                'What can you help me with?',
                "What's on my plate today?",
                'Show me my team status',
                'Help me with ordering',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                {chatMode === 'vm' && (
                  <span className="text-xs text-gray-400 ml-1">King Mouse is thinking...</span>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={chatMode === 'vm'
            ? "Talk to King Mouse — your AI Operations Manager..."
            : "Ask King Mouse about your business..."}
          className="flex-1 px-4 py-3 border border-mouse-slate/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mouse-teal/30"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
