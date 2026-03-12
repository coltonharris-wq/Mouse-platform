'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const customerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('customer_id') || 'demo'
    : 'demo';

  // Get active conversation from shell
  const getActiveConversation = useCallback(() => {
    return (window as unknown as Record<string, unknown>).__km_activeConversationId as string | null;
  }, []);

  // Load messages for active conversation
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages?limit=100`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      // Ignore
    }
  }, []);

  // Watch for conversation changes from sidebar
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
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
        // Update sidebar
        const win = window as unknown as Record<string, (arg?: string) => void>;
        if (win.__km_setActiveConversation) win.__km_setActiveConversation(convId!);
        if (win.__km_loadConversations) win.__km_loadConversations();
      } catch {
        setSending(false);
        return;
      }
    }

    // Optimistic user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Add typing indicator
    const typingMsg: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, typingMsg]);

    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, content: messageText }),
      });
      const data = await res.json();

      // Remove typing indicator and add real messages
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== 'typing');
        // Replace temp user message with real one if returned
        const withoutTemp = filtered.filter((m) => m.id !== tempUserMsg.id);
        const newMessages = [...withoutTemp];
        if (data.user_message) newMessages.push(data.user_message);
        else newMessages.push(tempUserMsg); // Keep optimistic if no return
        if (data.assistant_message) newMessages.push(data.assistant_message);
        return newMessages;
      });

      // Refresh sidebar
      const win2 = window as unknown as Record<string, () => void>;
      if (win2.__km_loadConversations) win2.__km_loadConversations();
    } catch {
      // Remove typing indicator on error
      setMessages((prev) => prev.filter((m) => m.id !== 'typing'));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render markdown-lite (bold, code blocks, lists)
  const renderContent = (text: string) => {
    // Simple markdown: **bold**, `code`, ```blocks```, - lists
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
      // Inline formatting
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
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !conversationId ? (
          // Empty state
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <div className="text-6xl mb-4">&#x1F42D;</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How can I help you today?</h2>
              <p className="text-gray-500 mb-8">
                I&apos;m KingMouse, your AI employee. Tell me what you need done and I&apos;ll handle it.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Check my inventory levels',
                  'Send a follow-up email to recent customers',
                  'Research competitor prices',
                  'Schedule appointments for next week',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-left p-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Messages
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-sm">&#x1F42D;</span>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#0F6B6E] text-white'
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

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2 focus-within:border-[#0F6B6E] focus-within:ring-1 focus-within:ring-[#0F6B6E]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message KingMouse..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-900 placeholder-gray-400 py-1.5 max-h-[150px]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-2 rounded-xl bg-[#0F6B6E] text-white disabled:opacity-30 hover:bg-[#0B5456] transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            KingMouse can browse the web, send emails, manage files, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
