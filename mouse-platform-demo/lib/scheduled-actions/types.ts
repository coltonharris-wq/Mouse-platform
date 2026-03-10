/**
 * Scheduled action types - maps to capabilities 1-10
 */
export const ACTION_TYPES = [
  {
    id: "urgency",
    name: "Urgency Messages",
    icon: "🔥",
    capability: 5,
    description: "Send 'almost full' messages to cold leads",
    bestFor: "Following up on quotes, filling schedule",
    defaultFrequency: "daily",
  },
  {
    id: "secret_shopper",
    name: "Secret Shopper Test",
    icon: "🕵️",
    capability: 2,
    description: "Call your business to test quality",
    bestFor: "Quality assurance, staff training",
    defaultFrequency: "weekly",
  },
  {
    id: "asset_builder",
    name: "Generate FAQ",
    icon: "🧨",
    capability: 8,
    description: "Auto-create help content from conversations",
    bestFor: "Reducing repeat questions, website content",
    defaultFrequency: "weekly",
  },
  {
    id: "silent_failure",
    name: "Silent Failure Check",
    icon: "🧠",
    capability: 1,
    description: "Analyze patterns for business problems",
    bestFor: "Catching issues early",
    defaultFrequency: "daily",
  },
  {
    id: "customer_followup",
    name: "Customer Follow-up",
    icon: "🧠",
    capability: 3,
    description: "Check in with past customers",
    bestFor: "Retention, reviews",
    defaultFrequency: "custom",
  },
  {
    id: "brain_clone",
    name: "Brain Clone Training",
    icon: "🧬",
    capability: 7,
    description: "Review and learn from owner decisions",
    bestFor: "Improving AI accuracy",
    defaultFrequency: "weekly",
  },
  {
    id: "system_improvement",
    name: "System Improvement Scan",
    icon: "🧩",
    capability: 6,
    description: "Analyze complaints for systemic issues",
    bestFor: "Process improvement",
    defaultFrequency: "weekly",
  },
  {
    id: "product_idea",
    name: "Product Idea Scan",
    icon: "⚡",
    capability: 10,
    description: "Detect expansion opportunities",
    bestFor: "Growth ideas",
    defaultFrequency: "monthly",
  },
  {
    id: "strategic_silence",
    name: "Strategic Silence Check",
    icon: "🧠",
    capability: 9,
    description: "Review pending responses for silence opportunities",
    bestFor: "Response optimization",
    defaultFrequency: "custom",
  },
  {
    id: "attention_filter",
    name: "Attention Filter Review",
    icon: "⏱️",
    capability: 4,
    description: "Review filtered conversations for patterns",
    bestFor: "Filter accuracy",
    defaultFrequency: "daily",
  },
] as const;

export function getActionType(id: string) {
  return ACTION_TYPES.find((a) => a.id === id);
}

export function cronFromSchedule(
  frequency: string,
  config: { day?: string; time?: string; date?: number; timezone?: string }
): string {
  const time = config.time || "16:00";
  const [h, m] = time.split(":").map(Number);
  const minute = m ?? 0;
  const hour = h ?? 16;

  switch (frequency) {
    case "daily":
      return `${minute} ${hour} * * *`;
    case "weekly":
      const dayMap: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      };
      const d = config.day ? dayMap[config.day.toLowerCase()] ?? 1 : 1;
      return `${minute} ${hour} * * ${d}`;
    case "monthly":
      const date = config.date ?? 1;
      return `${minute} ${hour} ${date} * *`;
    default:
      return `${minute} ${hour} * * *`;
  }
}
