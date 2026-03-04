// Example: Employee Chat Component with Tier System
// Shows how to integrate the tier system into the UI

'use client';

import { useState } from 'react';
import { 
  TierProvider, 
  useTieredChat, 
  UpgradePrompt, 
  UsageIndicator,
  useTier 
} from '@/lib/tier-hooks';
import { FEATURE_KEYS } from '@/lib/tier-system';

interface EmployeeChatProps {
  customerId: string;
  employeeId: string;
  employeeName: string;
}

// Main component wrapped with provider
export function EmployeeChat({ customerId, employeeId, employeeName }: EmployeeChatProps) {
  return (
    <TierProvider customerId={customerId}>
      <EmployeeChatInner 
        customerId={customerId}
        employeeId={employeeId}
        employeeName={employeeName}
      />
    </TierProvider>
  );
}

// Inner component that uses tier hooks
function EmployeeChatInner({ customerId, employeeId, employeeName }: EmployeeChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: `Hi! I'm ${employeeName}. How can I help you today?` }
  ]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { 
    sendMessage, 
    isChecking, 
    messagesRemaining, 
    isApproachingLimit,
    isAtLimit 
  } = useTieredChat(customerId, employeeId);
  
  const { isFree, hasFeature } = useTier();

  const handleSend = async () => {
    if (!input.trim() || isAtLimit) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const result = await sendMessage([...messages, userMessage]);

    if (result.success && result.response) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.response.content 
      }]);
    } else if (result.upgradePrompt) {
      setShowUpgrade(true);
    } else {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${result.error || 'Failed to send message'}` 
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto border rounded-lg overflow-hidden bg-white">
      {/* Header with usage indicator */}
      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-mouse-teal rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {employeeName.charAt(0)}
          </div>
          <span className="font-medium text-gray-900">{employeeName}</span>
        </div>
        
        {isFree && (
          <div className="w-32">
            <UsageIndicator />
          </div>
        )}
      </div>

      {/* Upgrade prompt */}
      {showUpgrade && (
        <UpgradePrompt 
          type="message_limit"
          onDismiss={() => setShowUpgrade(false)}
          onUpgrade={() => window.location.href = '/pricing?upgrade=message_limit'}
        />
      )}

      {/* Approaching limit warning */}
      {isApproachingLimit && !showUpgrade && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-800">
          <strong>Warning:</strong> You have {messagesRemaining} free messages remaining this month.
          {' '}
          <a href="/pricing" className="underline">Upgrade to Pro</a> for unlimited messages.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isChecking && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-500 text-sm">
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        {isAtLimit ? (
          <div className="text-center py-3 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-2">You have reached your monthly message limit.</p>
            <a 
              href="/pricing" 
              className="inline-block bg-mouse-orange text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-600"
            >
              Upgrade to Pro
            </a>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              disabled={isChecking}
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mouse-teal"
            />
            <button
              onClick={handleSend}
              disabled={isChecking || !input.trim()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        )}
        
        {isFree && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Free plan: {messagesRemaining} messages remaining this month
            {' · '}
            <a href="/pricing" className="text-mouse-teal hover:underline">Upgrade</a>
          </p>
        )}
      </div>
    </div>
  );
}

// Example: Pro Feature Button (e.g., for starting a call)
export function ProFeatureButton({ 
  customerId, 
  featureKey,
  children,
  onClick,
}: { 
  customerId: string; 
  featureKey: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { hasFeature } = useTier();

  const handleClick = async () => {
    if (!hasFeature(featureKey)) {
      setShowUpgrade(true);
      return;
    }
    onClick();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 bg-mouse-navy text-white px-4 py-2 rounded hover:bg-mouse-teal transition-colors"
      >
        {children}
      </button>
      
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <UpgradePrompt 
              type="pro_limit"
              onDismiss={() => setShowUpgrade(false)}
              onUpgrade={() => window.location.href = '/pricing?upgrade=pro_feature'}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Example: Employee limit indicator
export function EmployeeLimitIndicator({ 
  customerId, 
  currentCount 
}: { 
  customerId: string; 
  currentCount: number;
}) {
  const { hasFeature, isFree, isPro, isEnterprise } = useTier();
  
  if (isEnterprise) {
    return (
      <span className="text-sm text-green-600">
        Unlimited employees
      </span>
    );
  }
  
  if (isPro) {
    const maxEmployees = 10;
    const remaining = maxEmployees - currentCount;
    return (
      <span className={`text-sm ${remaining <= 2 ? 'text-orange-600' : 'text-green-600'}`}>
        {currentCount} / {maxEmployees} employees
      </span>
    );
  }
  
  // Free tier
  const maxEmployees = 1;
  const atLimit = currentCount >= maxEmployees;
  
  return (
    <div className="text-sm">
      {atLimit ? (
        <span className="text-red-600">
          Employee limit reached. 
          {' '}
          <a href="/pricing" className="underline">Upgrade</a> to add more.
        </span>
      ) : (
        <span className="text-green-600">
          {currentCount} / {maxEmployees} employees
        </span>
      )}
    </div>
  );
}
