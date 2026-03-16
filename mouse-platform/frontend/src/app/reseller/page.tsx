'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';

const RESELLER_SYSTEM_PROMPT = `You are King Mouse, an AI sales assistant for a Mouse Platform reseller. Your job is to help them find leads, write sales scripts, close deals, and maximize their earnings. You have access to their pipeline, customer list, and commission data. Be direct, actionable, and focused on helping them make money. Speak like a sales coach, not a chatbot.`;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ResellerChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resellerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('reseller_id') || ''
    : '';

  const getActiveConversation = useCallback(() => {
    return (window as unknown as Record<string, unknown>).__km_activeConversationId as string | null;
  }, []);

  // Load messages for active conversation
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages?limit=100`);
      const data = await res.json();
      setMessages((data.messages || []).map((m: { id: string; role: string; content: string }) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const active = getActiveConversation();
      if (active && active !== conversationId) {
        setConversationId(active);
        loadMessages(active);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [conversationId, getActiveConversation, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const messageText = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setSending(true);

    let convId = conversationId;
    const customerId = `reseller_${resellerId}`;

    // Create conversation if none active
    if (!convId) {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_id: customerId }),
        });
        const data = await res.json();
        convId = data.id;
        setConversationId(convId);
        const win = window as unknown as Record<string, (arg?: string) => void>;
        if (win.__km_setActiveConversation) win.__km_setActiveConversation(convId!);
        if (win.__km_loadConversations) win.__km_loadConversations();
      } catch {
        setSending(false);
        return;
      }
    }

    // Add user message optimistically
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: 'user', content: messageText }]);
    setMessages((prev) => [...prev, { id: 'typing', role: 'assistant', content: '' }]);

    // Set thinking status
    const win = window as unknown as Record<string, (arg?: string) => void>;
    if (win.__km_setStatus) win.__km_setStatus('thinking');

    try {
      // Route to demo chat with reseller system prompt
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history,
          system_prompt: RESELLER_SYSTEM_PROMPT,
        }),
      });
      const data = await res.json();
      const response = data.response || 'Sorry, I encountered an error. Please try again.';

      // Save messages to conversation
      if (convId) {
        await fetch(`/api/conversations/${convId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_id: customerId, content: messageText }),
        }).catch(() => {});
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== 'typing');
        return [...filtered, { id: `resp-${Date.now()}`, role: 'assistant', content: response }];
      });

      const win2 = window as unknown as Record<string, () => void>;
      if (win2.__km_loadConversations) win2.__km_loadConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== 'typing'));
    } finally {
      setSending(false);
      if (win.__km_setStatus) win.__km_setStatus('idle');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
        return (
          <pre key={i} className="bg-gray-800 text-gray-100 rounded-lg p-3 my-2 text-sm overflow-x-auto">
            <code>{code}</code>
          </pre>
        );
      }
      const html = part
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded text-sm">$1</code>')
        .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
        .replace(/\n/g, '<br/>');
      return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !conversationId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <div className="text-8xl mb-6">{'\u{1F42D}'}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">What can I help you sell?</h2>
              <p className="text-gray-500 mb-8">
                I&apos;m King Mouse, your AI sales assistant. I find leads, write scripts, and help you close.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Find me hot leads',
                  'Write a cold call script for a [niche]',
                  'What deals should I follow up on today?',
                  'Show me my earnings projection',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-left p-3 rounded-xl border border-gray-200 border-l-2 border-l-[#F07020] text-sm text-gray-600 hover:bg-orange-50 hover:border-gray-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-sm">{'\u{1F42D}'}</span>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#F07020] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {msg.id === 'typing' ? (
                    <div className="flex gap-1 py-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2 focus-within:border-[#F07020] focus-within:ring-1 focus-within:ring-[#F07020]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message King Mouse..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-900 placeholder-gray-400 py-1.5 max-h-[150px]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-2 rounded-xl bg-[#F07020] text-white disabled:opacity-30 hover:bg-[#d85f18] transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            King Mouse helps you find leads, write scripts, and close deals.
          </p>
        </div>
      </div>
    </div>
  );
}
