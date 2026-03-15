'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, Conversation } from '@/lib/types';

/* ------------------------------------------------------------------ */
/*  Default fallback quick actions (used when no vertical config)      */
/* ------------------------------------------------------------------ */
const DEFAULT_QUICK_ACTIONS = [
  { label: 'Follow up on leads', prompt: 'Help me follow up on my recent leads' },
  { label: 'Check my schedule', prompt: 'Show me my schedule for today' },
  { label: 'Run ads report', prompt: 'Give me a summary of my current ad performance' },
  { label: 'Send invoices', prompt: 'Help me send out pending invoices' },
  { label: 'Post to social media', prompt: 'Help me create and post social media content' },
];

const DEFAULT_GREETING = 'Your AI employee is ready. Ask anything about your business.';

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
      <path d="M5 10v2a7 7 0 0 0 12 5.29" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Typing indicator                                                   */
/* ------------------------------------------------------------------ */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0' }}>
      <div
        style={{
          background: '#2a2a34',
          borderRadius: '16px 16px 16px 4px',
          padding: '14px 20px',
          display: 'flex',
          gap: 5,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#888',
              display: 'inline-block',
              animation: 'typingDot 1.4s infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Date grouping helpers                                              */
/* ------------------------------------------------------------------ */
function groupConversationsByDate(conversations: Conversation[]) {
  const groups: { label: string; items: Conversation[] }[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const todayItems: Conversation[] = [];
  const yesterdayItems: Conversation[] = [];
  const last7Items: Conversation[] = [];
  const last30Items: Conversation[] = [];
  const olderItems: Conversation[] = [];

  for (const c of conversations) {
    const d = new Date(c.updated_at || c.created_at);
    if (d >= today) todayItems.push(c);
    else if (d >= yesterday) yesterdayItems.push(c);
    else if (d >= sevenDaysAgo) last7Items.push(c);
    else if (d >= thirtyDaysAgo) last30Items.push(c);
    else olderItems.push(c);
  }

  if (todayItems.length) groups.push({ label: 'Today', items: todayItems });
  if (yesterdayItems.length) groups.push({ label: 'Yesterday', items: yesterdayItems });
  if (last7Items.length) groups.push({ label: 'Previous 7 days', items: last7Items });
  if (last30Items.length) groups.push({ label: 'Previous 30 days', items: last30Items });
  if (olderItems.length) groups.push({ label: 'Older', items: olderItems });

  return groups;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatTimestamp(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */
export default function KingMousePage() {
  /* ---- State ---- */
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickActions, setQuickActions] = useState(DEFAULT_QUICK_ACTIONS);
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const tokenRef = useRef<string | null>(null);

  /* ---- Scroll to bottom on new messages ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* ---- Auto-resize textarea ---- */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputText]);

  /* ---- Init: get auth token, load config + conversations ---- */
  useEffect(() => {
    async function init() {
      const { createBrowserClient } = await import('@/lib/supabase-browser');
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      tokenRef.current = session?.access_token || null;

      const headers: Record<string, string> = {};
      if (tokenRef.current) headers['Authorization'] = `Bearer ${tokenRef.current}`;

      // Load config
      try {
        const res = await fetch('/api/vm/chat?config=true', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.kingMouse) {
            if (data.kingMouse.greeting) setGreeting(data.kingMouse.greeting);
            if (data.kingMouse.quickActions?.length) setQuickActions(data.kingMouse.quickActions);
          }
        }
      } catch {
        // Fall back to defaults silently
      }
      setConfigLoaded(true);

      // Load conversations
      try {
        const res = await fetch('/api/vm/chat?conversations=true', { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.conversations)) {
            setConversations(data.conversations);
          }
        }
      } catch {
        // silently fail
      }
    }
    init();
  }, []);

  /* ---- Load messages for a conversation ---- */
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (tokenRef.current) headers['Authorization'] = `Bearer ${tokenRef.current}`;
      const res = await fetch(`/api/vm/chat?conversation_id=${conversationId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch {
      // silently fail
    }
  }, []);

  /* ---- Select conversation ---- */
  const selectConversation = useCallback(
    (conversationId: string) => {
      setActiveConversationId(conversationId);
      loadMessages(conversationId);
    },
    [loadMessages]
  );

  /* ---- New chat ---- */
  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setInputText('');
  }, []);

  /* ---- Send message ---- */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // Optimistically add user message
      const userMsg: Message = {
        id: 'temp-' + Date.now(),
        user_id: '',
        conversation_id: activeConversationId || '',
        role: 'user',
        content: trimmed,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsLoading(true);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      try {
        const res = await fetch('/api/vm/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
          },
          body: JSON.stringify({
            message: trimmed,
            conversation_id: activeConversationId,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          // Update conversation id if new
          if (data.conversation_id && !activeConversationId) {
            setActiveConversationId(data.conversation_id);
            // Refresh sidebar
            const convHeaders: Record<string, string> = {};
            if (tokenRef.current) convHeaders['Authorization'] = `Bearer ${tokenRef.current}`;
            const convRes = await fetch('/api/vm/chat?conversations=true', { headers: convHeaders });
            if (convRes.ok) {
              const convData = await convRes.json();
              if (Array.isArray(convData.conversations)) {
                setConversations(convData.conversations);
              }
            }
          }

          // Add assistant response
          if (data.reply) {
            const assistantMsg: Message = {
              id: data.message_id || 'reply-' + Date.now(),
              user_id: '',
              conversation_id: data.conversation_id || activeConversationId || '',
              role: 'assistant',
              content: data.reply,
              created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
          }
        } else if (data.error === 'king_mouse_down' || data.error === 'no_vm') {
          // King Mouse is down or VM not ready — show support contact
          const supportMsg: Message = {
            id: 'support-' + Date.now(),
            user_id: '',
            conversation_id: data.conversation_id || activeConversationId || '',
            role: 'assistant',
            content: data.support_message || 'King Mouse is temporarily unavailable. Please call (910) 515-8927 for immediate human support.',
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, supportMsg]);
        } else {
          // Other error
          const errorMsg: Message = {
            id: 'error-' + Date.now(),
            user_id: '',
            conversation_id: activeConversationId || '',
            role: 'assistant',
            content: data.error === 'Insufficient work hours. Please purchase more hours.'
              ? 'You have used all your work hours. Please purchase more hours to continue.'
              : 'Something went wrong. Please try again or call (910) 515-8927 for support.',
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      } catch {
        const errorMsg: Message = {
          id: 'error-' + Date.now(),
          user_id: '',
          conversation_id: activeConversationId || '',
          role: 'assistant',
          content: 'Unable to reach King Mouse. Please check your connection and try again.',
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }

      setIsLoading(false);
    },
    [isLoading, activeConversationId]
  );

  /* ---- Voice chat: mic toggle ---- */
  const toggleVoiceRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setVoiceState('thinking');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Send to Whisper on VM for STT
        try {
          setVoiceState('thinking');
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const sttRes = await fetch('/api/vm/voice-to-text', {
            method: 'POST',
            body: formData,
          });

          if (sttRes.ok) {
            const { text } = await sttRes.json();
            if (text?.trim()) {
              setInputText(text.trim());
              // Auto-send the transcribed text
              sendMessage(text.trim());
            }
          }
        } catch (err) {
          console.error('Voice transcription failed:', err);
        }
        setVoiceState('idle');
      };

      mediaRecorder.start();
      setIsRecording(true);
      setVoiceState('listening');
    } catch (err) {
      console.error('Mic access denied:', err);
      setVoiceState('idle');
    }
  }, [isRecording, sendMessage]);

  /* ---- Keyboard handler ---- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  /* ---- Derived ---- */
  const hasMessages = messages.length > 0;
  const conversationGroups = groupConversationsByDate(conversations);

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 40px)',
        background: '#1a1a22',
        overflow: 'hidden',
      }}
    >
      {/* ============================================================ */}
      {/*  LEFT SIDEBAR - Conversation History                         */}
      {/* ============================================================ */}
      <div
        style={{
          width: sidebarOpen ? 240 : 0,
          minWidth: sidebarOpen ? 240 : 0,
          background: '#14141b',
          borderRight: sidebarOpen ? '1px solid #2a2a34' : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.2s ease, min-width 0.2s ease',
        }}
      >
        {/* New chat button */}
        <div style={{ padding: '16px 14px 8px' }}>
          <button
            onClick={startNewChat}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'transparent',
              border: '1px solid #333',
              borderRadius: 8,
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#F07020';
              e.currentTarget.style.background = 'rgba(240,112,32,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <PlusIcon />
            New chat
          </button>
        </div>

        {/* Conversations list */}
        <div
          className="sidebar-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 8px 16px',
          }}
        >
          {conversationGroups.map((group) => (
            <div key={group.label} style={{ marginTop: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#777',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '4px 8px 6px',
                }}
              >
                {group.label}
              </div>
              {group.items.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      background: isActive ? 'rgba(29,158,117,0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      color: isActive ? '#fff' : '#aaa',
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s, color 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = '#ddd';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#aaa';
                      }
                    }}
                  >
                    <span style={{ flexShrink: 0, opacity: 0.5 }}>
                      <ChatIcon />
                    </span>
                    <span
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conv.title || 'Untitled'}
                    </span>
                    <span style={{ fontSize: 11, color: '#666', flexShrink: 0 }}>
                      {formatTime(conv.updated_at || conv.created_at)}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {conversations.length === 0 && (
            <div
              style={{
                padding: '32px 12px',
                textAlign: 'center',
                color: '#555',
                fontSize: 13,
              }}
            >
              No conversations yet.
              <br />
              Start a new chat to begin.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  MAIN CHAT AREA                                              */}
      {/* ============================================================ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minWidth: 0,
        }}
      >
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 10,
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#888';
            e.currentTarget.style.background = 'transparent';
          }}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          <SidebarIcon />
        </button>

        {/* ----- Chat header (shown when conversation is active) ----- */}
        {hasMessages && (
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '0.5px solid #2a2a34',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingLeft: 52,
            }}
          >
            {/* King Mouse avatar */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #1a3a4a, #1D9E75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>M</span>
            </div>
            {/* Name + subtitle */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', lineHeight: 1.3 }}>
                King Mouse
              </div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.3 }}>
                Your AI workforce orchestrator
              </div>
            </div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <span
                style={{
                  background: '#E1F5EE',
                  color: '#0F6E56',
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: 999,
                  lineHeight: 1.3,
                }}
              >
                Online
              </span>
              <span
                style={{
                  background: '#2a2a34',
                  color: '#666',
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: 999,
                  lineHeight: 1.3,
                }}
              >
                2.0 hrs
              </span>
            </div>
          </div>
        )}

        {/* ----- Empty state (no messages) ----- */}
        {!hasMessages && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
            }}
          >
            {/* King Mouse avatar */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a3a4a, #1D9E75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>M</span>
            </div>

            {/* Main greeting */}
            <h1
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: '#ffffff',
                margin: '0 0 10px',
                letterSpacing: '-0.3px',
              }}
            >
              What can I do for you?
            </h1>

            {/* Subtitle from config */}
            <p
              style={{
                fontSize: 15,
                color: '#999',
                margin: '0 0 36px',
                maxWidth: 480,
                textAlign: 'center',
                lineHeight: 1.5,
                opacity: configLoaded ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            >
              {greeting}
            </p>

            {/* Quick action pills */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                justifyContent: 'center',
                maxWidth: 600,
              }}
            >
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action.prompt)}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '0.5px solid #2a2a34',
                    borderRadius: 999,
                    color: '#fff',
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#F07020';
                    e.currentTarget.style.background = 'rgba(240,112,32,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a34';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ----- Messages area ----- */}
        {hasMessages && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 24px 8px',
            }}
          >
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ maxWidth: '80%' }}>
                      <div
                        style={{
                          background: isUser ? '#1D9E75' : '#2a2a34',
                          color: '#fff',
                          padding: '12px 18px',
                          borderRadius: isUser
                            ? '16px 16px 4px 16px'
                            : '16px 16px 16px 4px',
                          fontSize: 15,
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.content}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#666',
                          marginTop: 4,
                          textAlign: isUser ? 'right' : 'left',
                          paddingLeft: isUser ? 0 : 4,
                          paddingRight: isUser ? 4 : 0,
                        }}
                      >
                        {formatTimestamp(msg.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* ----- Input area ----- */}
        <div
          style={{
            padding: hasMessages ? '8px 24px 20px' : '0 24px 40px',
            width: '100%',
            maxWidth: hasMessages ? 768 : 640,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 10,
              background: '#2a2a34',
              borderRadius: 14,
              padding: '10px 12px 10px 18px',
              border: '1px solid #333',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#555';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#333';
            }}
          >
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask King Mouse anything..."
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: 15,
                lineHeight: 1.5,
                resize: 'none',
                maxHeight: 200,
                fontFamily: 'inherit',
              }}
            />
            {/* Mic button for voice chat */}
            <button
              onClick={toggleVoiceRecording}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: 'none',
                background: isRecording ? '#ef4444' : '#3a3a44',
                color: isRecording ? '#fff' : '#999',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s, color 0.15s',
                animation: isRecording ? 'pulse-ring 1.5s ease-in-out infinite' : 'none',
              }}
              title={isRecording ? 'Stop recording' : 'Voice chat — speak to King Mouse'}
            >
              {isRecording ? <MicOffIcon /> : <MicIcon />}
            </button>
            {/* Voice state indicator */}
            {voiceState !== 'idle' && (
              <div style={{
                position: 'absolute',
                top: -32,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#2a2a34',
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 12,
                color: voiceState === 'listening' ? '#ef4444' : voiceState === 'thinking' ? '#F07020' : '#1D9E75',
                whiteSpace: 'nowrap',
              }}>
                {voiceState === 'listening' ? 'Listening...' : voiceState === 'thinking' ? 'Thinking...' : 'Speaking...'}
              </div>
            )}
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: 'none',
                background: inputText.trim() && !isLoading ? '#F07020' : '#3a3a44',
                color: inputText.trim() && !isLoading ? '#fff' : '#666',
                cursor: inputText.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (inputText.trim() && !isLoading) {
                  e.currentTarget.style.background = '#d85a10';
                }
              }}
              onMouseLeave={(e) => {
                if (inputText.trim() && !isLoading) {
                  e.currentTarget.style.background = '#F07020';
                }
              }}
            >
              <SendIcon />
            </button>
          </div>

          <div
            style={{
              textAlign: 'center',
              fontSize: 11,
              color: '#555',
              marginTop: 8,
            }}
          >
            King Mouse may occasionally make mistakes. Verify important information.
          </div>
        </div>
      </div>
    </div>
  );
}
