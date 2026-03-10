/**
 * Pain signal detection from business reviews.
 * Detects SMB pain points that indicate opportunity for AI employee solutions.
 */

export const PAIN_SIGNALS: Record<
  string,
  { keywords: string[]; weight: number }
> = {
  // Communication Issues
  no_callback: {
    keywords: [
      "never called back",
      "didn't call",
      "no call back",
      "never heard back",
    ],
    weight: 3,
  },
  no_answer: {
    keywords: [
      "no one answered",
      "didn't answer",
      "phone rang",
      "voicemail",
      "couldn't reach",
      "couldn't get through",
    ],
    weight: 3,
  },
  rude_staff: {
    keywords: ["rude", "unprofessional", "attitude", "yelled", "disrespectful"],
    weight: 2,
  },

  // Quality Issues
  poor_work: {
    keywords: [
      "didn't fix",
      "broke again",
      "still leaking",
      "worse than before",
      "had to call back",
    ],
    weight: 2,
  },
  late_arrival: {
    keywords: [
      "late",
      "never showed",
      "no show",
      "waited hours",
      "didn't come",
      "never showed up",
    ],
    weight: 2,
  },

  // Business Issues
  overpriced: {
    keywords: [
      "overpriced",
      "too expensive",
      "rip off",
      "charged too much",
      "overcharged",
    ],
    weight: 1,
  },
  hidden_fees: {
    keywords: [
      "hidden fee",
      "unexpected charge",
      "more than quoted",
      "surprise cost",
      "extra charges",
    ],
    weight: 2,
  },
};

export interface PainDetectionResult {
  signals: string[];
  score: number;
}

/**
 * Detect pain signals from review text.
 * Returns array of signal keys and a normalized 0-10 score.
 */
export function detectPainSignals(reviews: string[]): PainDetectionResult {
  const signals: string[] = [];
  let score = 0;

  for (const [signal, config] of Object.entries(PAIN_SIGNALS)) {
    const matches = reviews.filter((review) =>
      config.keywords.some((kw) => review.toLowerCase().includes(kw))
    ).length;

    if (matches > 0) {
      signals.push(signal);
      score += config.weight * matches;
    }
  }

  // Normalize to 0-10
  const normalizedScore = Math.min(10, Math.round((score / 3) * 10) / 10);

  return { signals, score: normalizedScore };
}
