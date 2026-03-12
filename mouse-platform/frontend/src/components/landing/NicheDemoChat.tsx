'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SignupModal from './SignupModal';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface NicheDemoChatProps {
  industry: string;
  niche: string;
  displayName: string;
  industryDisplay: string;
  icon: string | null;
  initialMessage: string;
}

function getSessionToken(industry: string, niche: string): string {
  const key = `demo_session_${industry}_${niche}`;
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

function getStoredMessages(industry: string, niche: string): ChatMessage[] | null {
  const key = `demo_messages_${industry}_${niche}`;
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function storeMessages(industry: string, niche: string, messages: ChatMessage[]) {
  const key = `demo_messages_${industry}_${niche}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(messages));
  }
}

// Try to extract business name from user's first message in the chat
function extractBusinessName(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === 'user');
  if (!firstUserMsg) return '';
  // Look for patterns like "Tony's Pizza", "called X", "name is X", or quoted names
  const patterns = [
    /(?:called|named?|it's|we're|I'm|I run|I own)\s+["']?([A-Z][A-Za-z\s'&.-]+)/,
    /^([A-Z][A-Za-z\s'&.-]{2,30})(?:,|\.|!|\s-\s)/,
  ];
  for (const p of patterns) {
    const match = firstUserMsg.content.match(p);
    if (match) return match[1].trim();
  }
  return '';
}

export default function NicheDemoChat({
  industry,
  niche,
  displayName,
  industryDisplay,
  icon,
  initialMessage,
}: NicheDemoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showSignup, setShowSignup] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sessionTokenRef = useRef('');

  // Initialize from localStorage or use initial message
  useEffect(() => {
    sessionTokenRef.current = getSessionToken(industry, niche);
    const stored = getStoredMessages(industry, niche);
    if (stored && stored.length > 0) {
      setMessages(stored);
      // Count user messages for signup trigger
      const userMsgCount = stored.filter((m) => m.role === 'user').length;
      setMessageCount(userMsgCount);
      if (userMsgCount >= 4) setShowSignup(true);
    } else {
      const initial: ChatMessage[] = [{ role: 'assistant', content: initialMessage }];
      setMessages(initial);
      storeMessages(industry, niche, initial);
    }
  }, [industry, niche, initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const updatedMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    storeMessages(industry, niche, updatedMessages);
    setSending(true);

    try {
      const res = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          industry,
          niche,
          session_token: sessionTokenRef.current,
        }),
      });
      const data = await res.json();
      const reply = data.response || data.error || 'Something went wrong.';
      const withReply: ChatMessage[] = [...updatedMessages, { role: 'assistant', content: reply }];
      setMessages(withReply);
      storeMessages(industry, niche, withReply);

      if (data.messageCount !== undefined) {
        setMessageCount(data.messageCount);
      }
      if (data.promptSignup) {
        setShowSignup(true);
      }
    } catch {
      const errorReply: ChatMessage[] = [
        ...updatedMessages,
        { role: 'assistant', content: "Sorry, I'm having trouble right now. Try again in a moment!" },
      ];
      setMessages(errorReply);
      storeMessages(industry, niche, errorReply);
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, industry, niche]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0F6B6E] text-white px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-2xl">{icon || '\u{1F42D}'}</span>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base truncate">
              King Mouse — {displayName} Pro
            </h1>
            <p className="text-teal-100 text-xs">{industryDisplay}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#0F6B6E] flex items-center justify-center shrink-0 mt-1">
                  <span className="text-sm text-white">{icon || '\u{1F42D}'}</span>
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#0F6B6E] text-white'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0F6B6E] flex items-center justify-center shrink-0">
                <span className="text-sm text-white">{icon || '\u{1F42D}'}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
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
      </div>

      {/* Signup Prompt Banner */}
      {showSignup && !signupModalOpen && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <p className="text-sm text-gray-600 flex-1 text-center sm:text-left">
              Ready to set up your AI operations dashboard?
            </p>
            <button
              onClick={() => setSignupModalOpen(true)}
              className="bg-[#0F6B6E] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0B5456] transition-colors whitespace-nowrap"
            >
              Create Account — 30 seconds
            </button>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {signupModalOpen && (
        <SignupModal
          industry={industry}
          niche={niche}
          sessionToken={sessionTokenRef.current}
          chatTranscript={messages.map((m) => ({ role: m.role, content: m.content }))}
          businessNameHint={extractBusinessName(messages)}
          onClose={() => setSignupModalOpen(false)}
        />
      )}

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none outline-none text-sm text-gray-900 placeholder-gray-400 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus:border-[#0F6B6E] focus:ring-1 focus:ring-[#0F6B6E]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl bg-[#0F6B6E] text-white disabled:opacity-30 hover:bg-[#0B5456] transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
