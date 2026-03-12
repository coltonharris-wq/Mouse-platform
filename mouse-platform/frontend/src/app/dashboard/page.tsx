'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, BarChart3, X, Wifi, WifiOff } from 'lucide-react';
import DailyWins from '@/components/dashboard/DailyWins';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [vmStatus, setVmStatus] = useState<'checking' | 'running' | 'provisioning' | 'offline'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const customerId = typeof window !== 'undefined'
    ? sessionStorage.getItem('customer_id') || 'demo'
    : 'demo';

  // Check VM status + load chat history on mount
  useEffect(() => {
    (async () => {
      // Check VM status
      try {
        const statusRes = await fetch(`/api/vm/status?customer_id=${customerId}`);
        const statusData = await statusRes.json();
        if (statusData.status === 'running') {
          setVmStatus('running');
        } else if (statusData.status === 'provisioning') {
          setVmStatus('provisioning');
        } else {
          setVmStatus('offline');
        }
      } catch {
        setVmStatus('offline');
      }

      // Load chat history from vm/chat endpoint
      try {
        const histRes = await fetch(`/api/vm/chat?customer_id=${customerId}`);
        const histData = await histRes.json();
        const msgs: Message[] = (histData.messages || []).map((m: { role: string; content: string; timestamp: string }, i: number) => ({
          id: `hist-${i}`,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          created_at: m.timestamp || new Date().toISOString(),
        }));
        setMessages(msgs);
      } catch {
        // No history — that's fine
      }

      setInitialized(true);
    })();
  }, [customerId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (initialized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, initialized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const messageText = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setSending(true);

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
      const res = await fetch('/api/vm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          message: messageText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Remove typing indicator
        setMessages((prev) => prev.filter((m) => m.id !== 'typing'));

        if (res.status === 503) {
          setVmStatus('offline');
          setMessages((prev) => [...prev, {
            id: `sys-${Date.now()}`,
            role: 'system',
            content: 'King Mouse is currently offline. Please check the Help page or wait a moment and try again.',
            created_at: new Date().toISOString(),
          }]);
        } else {
          setMessages((prev) => [...prev, {
            id: `sys-${Date.now()}`,
            role: 'system',
            content: data.error || 'Something went wrong. Please try again.',
            created_at: new Date().toISOString(),
          }]);
        }
        return;
      }

      // Replace typing indicator with response
      const assistantMsg: Message = {
        id: `resp-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== 'typing');
        return [...filtered, assistantMsg];
      });

      // Show actions taken if any
      if (data.actions_taken && data.actions_taken.length > 0) {
        setMessages((prev) => [...prev, {
          id: `actions-${Date.now()}`,
          role: 'system',
          content: `Actions taken: ${data.actions_taken.join(', ')}`,
          created_at: new Date().toISOString(),
        }]);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== 'typing'));
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: 'system',
        content: 'Something went wrong. Please try again.',
        created_at: new Date().toISOString(),
      }]);
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
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
        return (
          <pre key={i} className="bg-gray-800 text-gray-100 rounded-lg p-4 my-3 text-base overflow-x-auto">
            <code>{code}</code>
          </pre>
        );
      }
      const html = part
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1.5 rounded text-base">$1</code>')
        .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
        .replace(/\n/g, '<br/>');
      return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  // Dynamic suggestions from engagement engine
  const [suggestions, setSuggestions] = useState<{ emoji: string; text: string; message: string }[]>([]);
  const [showReportCard, setShowReportCard] = useState(false);
  const [reportCard, setReportCard] = useState<{
    period: string; hours_worked: number; tasks_completed: number;
    calls_handled: number; emails_handled: number; hours_saved: number;
    estimated_money_saved: number; months_active: number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/engagement/suggestions?customer_id=${customerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.suggestions) setSuggestions(data.suggestions);
      })
      .catch(() => {});
  }, [customerId]);

  const openReportCard = async () => {
    setShowReportCard(true);
    if (!reportCard) {
      try {
        const res = await fetch(`/api/engagement/report-card?customer_id=${customerId}&period=monthly`);
        const data = await res.json();
        if (!data.error) setReportCard(data);
      } catch {
        // Ignore
      }
    }
  };

  const hasMessages = messages.length > 0;

  const FALLBACK_SUGGESTIONS = [
    { emoji: '\u{1F4E6}', text: 'Check my inventory levels', message: 'Check my inventory levels and flag anything running low' },
    { emoji: '\u{1F4E7}', text: 'Summarize unread emails', message: 'Summarize my unread business emails' },
    { emoji: '\u{1F4DE}', text: 'Follow up missed calls', message: "Follow up with yesterday's missed calls" },
    { emoji: '\u{1F4CA}', text: 'Weekly revenue report', message: 'Generate a quick revenue report for this week' },
  ];

  const displaySuggestions = suggestions.length > 0
    ? suggestions.slice(0, 4).map((s) => ({ ...s, display: `${s.emoji} ${s.text}` }))
    : FALLBACK_SUGGESTIONS.map((s) => ({ ...s, display: `${s.emoji} ${s.text}` }));

  // VM status indicator
  const vmStatusLabel = vmStatus === 'running' ? 'King Mouse is online'
    : vmStatus === 'provisioning' ? 'King Mouse is starting up...'
    : vmStatus === 'checking' ? 'Checking status...'
    : 'King Mouse is offline';

  const vmStatusColor = vmStatus === 'running' ? 'text-green-600'
    : vmStatus === 'provisioning' ? 'text-yellow-600'
    : vmStatus === 'checking' ? 'text-gray-400'
    : 'text-red-500';

  const vmStatusDot = vmStatus === 'running' ? 'bg-green-500'
    : vmStatus === 'provisioning' ? 'bg-yellow-500'
    : vmStatus === 'checking' ? 'bg-gray-400'
    : 'bg-red-500';

  return (
    <div className="flex flex-col h-full">
      {/* VM Status Indicator */}
      <div className="border-b border-gray-100 px-4 py-2 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${vmStatusDot} ${vmStatus === 'provisioning' ? 'animate-pulse' : ''}`} />
          <span className={`text-sm font-medium ${vmStatusColor}`}>{vmStatusLabel}</span>
        </div>
        {vmStatus === 'offline' && (
          <button
            onClick={() => {
              setVmStatus('checking');
              fetch(`/api/vm/status?customer_id=${customerId}`)
                .then(r => r.json())
                .then(data => {
                  setVmStatus(data.status === 'running' ? 'running' : data.status === 'provisioning' ? 'provisioning' : 'offline');
                })
                .catch(() => setVmStatus('offline'));
            }}
            className="text-sm text-[#0F6B6E] font-medium hover:underline flex items-center gap-1"
          >
            {vmStatus === 'offline' ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            Retry
          </button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          // Empty state — input centered like ChatGPT/Claude
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-lg px-4">
              <DailyWins />
              <div className="text-7xl mb-6">{'\u{1F42D}'}</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">How can I help you today?</h2>
              <p className="text-xl text-gray-500 mb-10">
                I&apos;m KingMouse, your AI operations manager. Tell me what you need and I&apos;ll handle it.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displaySuggestions.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => setInput(s.message)}
                    className="text-left p-4 rounded-xl border border-gray-200 text-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    {s.display}
                  </button>
                ))}
              </div>
              <button
                onClick={openReportCard}
                className="mt-6 inline-flex items-center gap-2 text-lg text-[#0F6B6E] font-medium hover:underline"
              >
                <BarChart3 className="w-5 h-5" />
                View your monthly report card
              </button>
            </div>
          </div>
        ) : (
          // Messages — max-width 768px centered
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-lg">{'\u{1F42D}'}</span>
                  </div>
                )}
                {msg.role === 'system' && (
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-lg">{'\u{26A0}'}</span>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user'
                    ? 'bg-[#0F6B6E] text-white'
                    : msg.role === 'system'
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {msg.id === 'typing' ? (
                    <div className="flex gap-1.5 py-1">
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <div className="text-lg leading-relaxed whitespace-pre-wrap">
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

      {/* Input area — fixed at bottom */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-3 focus-within:border-[#0F6B6E] focus-within:ring-1 focus-within:ring-[#0F6B6E]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message KingMouse..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-lg text-gray-900 placeholder-gray-400 py-1.5 max-h-[200px]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-3 rounded-xl bg-[#0F6B6E] text-white disabled:opacity-30 hover:bg-[#0B5456] transition-colors shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-base text-gray-400 text-center mt-2">
            KingMouse can browse the web, send emails, manage files, and more.
          </p>
        </div>
      </div>

      {/* Monthly Report Card Modal */}
      {showReportCard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative">
            <button onClick={() => setShowReportCard(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{'\u{1F42D}'}</div>
              <h3 className="text-2xl font-bold text-[#0B1F3B]">King Mouse Report Card</h3>
              {reportCard && <p className="text-lg text-gray-500 mt-1">{reportCard.period}</p>}
            </div>
            {!reportCard ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#0F6B6E] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <ReportCardRow emoji="\u{23F0}" label="Hours Worked" value={`${reportCard.hours_worked.toFixed(1)} hrs`} />
                <ReportCardRow emoji="\u{2705}" label="Tasks Completed" value={String(reportCard.tasks_completed)} />
                <ReportCardRow emoji="\u{1F4DE}" label="Calls Handled" value={String(reportCard.calls_handled)} />
                <ReportCardRow emoji="\u{1F4E7}" label="Emails Handled" value={String(reportCard.emails_handled)} />
                <div className="border-t border-gray-200 pt-4">
                  <ReportCardRow emoji="\u{1F4B0}" label="Estimated Money Saved" value={`$${reportCard.estimated_money_saved.toLocaleString()}`} highlight />
                  <ReportCardRow emoji="\u{231B}" label="Hours Saved" value={`${reportCard.hours_saved.toFixed(1)} hrs`} highlight />
                </div>
                {reportCard.months_active > 1 && (
                  <p className="text-center text-lg text-gray-500 pt-2">
                    You&apos;ve been using King Mouse for {reportCard.months_active} months
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCardRow({ emoji, label, value, highlight }: { emoji: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xl text-gray-700 flex items-center gap-2">
        <span>{emoji}</span> {label}
      </span>
      <span className={`text-xl font-bold ${highlight ? 'text-[#0F6B6E]' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}
