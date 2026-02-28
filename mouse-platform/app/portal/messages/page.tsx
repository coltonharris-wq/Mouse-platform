import { MessageSquare, Inbox, Send, Star, Archive } from "lucide-react";

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  category: "support" | "system" | "promotions";
}

const mockMessages: Message[] = [
  {
    id: "1",
    from: "Mouse Support",
    subject: "Welcome to King Mouse tier!",
    preview: "Congratulations! You've unlocked premium support and exclusive features...",
    timestamp: "2 hours ago",
    unread: true,
    category: "system",
  },
  {
    id: "2",
    from: "Security Team",
    subject: "New login detected",
    preview: "A new device was used to access your account from New York, NY...",
    timestamp: "5 hours ago",
    unread: true,
    category: "system",
  },
  {
    id: "3",
    from: "Billing",
    subject: "Invoice #2026-0028",
    preview: "Your monthly subscription invoice is now available for download...",
    timestamp: "1 day ago",
    unread: false,
    category: "system",
  },
];

export default function MessagesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mouse-charcoal">Messages</h1>
        <p className="text-mouse-slate text-sm mt-1">
          Stay updated with notifications and support messages
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4">
              <button className="w-full bg-mouse-teal text-white py-2.5 rounded-lg font-medium hover:bg-mouse-navy transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                New Message
              </button>
            </div>
            <nav className="px-2 pb-2">
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-mouse-teal/10 text-mouse-teal font-medium">
                <Inbox className="w-4 h-4" />
                <span>Inbox</span>
                <span className="ml-auto bg-mouse-orange text-white text-xs px-2 py-0.5 rounded-full">2</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-mouse-charcoal hover:bg-gray-50 mt-1">
                <Star className="w-4 h-4" />
                <span>Starred</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-mouse-charcoal hover:bg-gray-50 mt-1">
                <Send className="w-4 h-4" />
                <span>Sent</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-mouse-charcoal hover:bg-gray-50 mt-1">
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Message List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-mouse-charcoal">Inbox</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    message.unread ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.category === "support" ? "bg-purple-100" : "bg-blue-100"
                    }`}>
                      <MessageSquare className={`w-5 h-5 ${
                        message.category === "support" ? "text-purple-600" : "text-blue-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-mouse-charcoal">{message.from}</span>
                        {message.unread && (
                          <span className="w-2 h-2 bg-mouse-orange rounded-full" />
                        )}
                        <span className="text-xs text-mouse-slate ml-auto">{message.timestamp}</span>
                      </div>
                      <p className="text-sm font-medium text-mouse-charcoal mb-1">{message.subject}</p>
                      <p className="text-sm text-mouse-slate truncate">{message.preview}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
