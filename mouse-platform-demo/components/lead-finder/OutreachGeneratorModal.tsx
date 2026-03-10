"use client";

import { useState } from "react";
import { X, Copy, Mail, Loader2, Check } from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { LeadBusiness } from "@/types/lead-finder";

const TEMPLATES = [
  { value: "pain_point", label: "Pain Point" },
  { value: "competitive", label: "Competitive" },
  { value: "value_prop", label: "Value Prop" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "urgent", label: "Urgent" },
];

interface OutreachMessage {
  business_id: string;
  business_name: string;
  subject: string;
  body: string;
  channel: string;
}

interface Props {
  businesses: LeadBusiness[];
  selectedIds: string[];
  onClose: () => void;
  onSent?: () => void;
}

export default function OutreachGeneratorModal({
  businesses,
  selectedIds,
  onClose,
  onSent,
}: Props) {
  const [template, setTemplate] = useState("pain_point");
  const [tone, setTone] = useState("professional");
  const [messages, setMessages] = useState<OutreachMessage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const selected = businesses.filter((b) => selectedIds.includes(b.id));

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setMessages(null);
    try {
      const res = await fetchWithAuth("/api/reseller/lead-finder/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_ids: selectedIds,
          template,
          tone,
          vertical: businesses[0]?.vertical ?? "business",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setMessages(data.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (msg: OutreachMessage) => {
    const text = `Subject: ${msg.subject}\n\n${msg.body}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(msg.business_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRecordSent = async (msg: OutreachMessage) => {
    try {
      await fetchWithAuth("/api/reseller/lead-finder/send-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: msg.business_id,
          subject: msg.subject,
          body: msg.body,
          channel: "email",
          template_type: template,
          tone,
        }),
      });
      onSent?.();
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-mouse-slate/20">
          <h2 className="text-lg font-semibold text-mouse-charcoal">
            Generate Outreach
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-mouse-slate hover:text-mouse-charcoal rounded-lg hover:bg-mouse-offwhite"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-mouse-slate/20 space-y-4">
          <p className="text-sm text-mouse-slate">
            {selected.length} business{selected.length !== 1 ? "es" : ""} selected
          </p>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-mouse-slate mb-1">
                Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="px-3 py-2 border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-mouse-slate mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="px-3 py-2 border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Generate
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {messages && messages.length > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-2 border-b border-mouse-slate/20 pb-2">
                {messages.map((msg, i) => (
                  <button
                    key={msg.business_id}
                    onClick={() => setActiveTab(i)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === i
                        ? "bg-mouse-teal text-white"
                        : "bg-mouse-offwhite text-mouse-slate hover:bg-mouse-slate/20"
                    }`}
                  >
                    {msg.business_name}
                  </button>
                ))}
              </div>
              {messages[activeTab] && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-mouse-slate mb-1">
                      Subject
                    </label>
                    <p className="text-sm text-mouse-charcoal font-medium">
                      {messages[activeTab].subject}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-mouse-slate mb-1">
                      Body
                    </label>
                    <pre className="text-sm text-mouse-charcoal whitespace-pre-wrap bg-mouse-offwhite p-4 rounded-lg max-h-48 overflow-y-auto">
                      {messages[activeTab].body}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleCopy(messages[activeTab]);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-mouse-offwhite text-mouse-charcoal rounded-lg text-sm font-medium hover:bg-mouse-slate/20"
                    >
                      {copiedId === messages[activeTab].business_id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy
                    </button>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(messages[activeTab].subject)}&body=${encodeURIComponent(messages[activeTab].body)}`}
                      onClick={() => handleRecordSent(messages[activeTab])}
                      className="flex items-center gap-2 px-4 py-2 bg-mouse-teal text-white rounded-lg text-sm font-medium hover:bg-mouse-teal/90"
                    >
                      <Mail className="w-4 h-4" />
                      Open in Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : messages && messages.length === 0 ? (
            <p className="text-sm text-mouse-slate">No messages generated.</p>
          ) : (
            <p className="text-sm text-mouse-slate">
              Select template and tone, then click Generate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
