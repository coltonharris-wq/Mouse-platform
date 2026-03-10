/**
 * Outreach templates for Lead Finder.
 * pain_point, competitive, value_prop with professional/casual/urgent tones.
 */

import type { LeadBusiness } from "@/types/lead-finder";

const PAIN_DESCRIPTIONS: Record<string, string> = {
  no_callback: 'several customers mentioned they "never got a call back"',
  no_answer: 'multiple reviews noted that "no one answered the phone"',
  rude_staff: 'a few customers felt the service was "unprofessional"',
  poor_work: 'some mentioned the issue "wasn\'t fully fixed"',
  late_arrival: 'reviews mentioned technicians arriving "late or not at all"',
  overpriced: "some customers felt pricing was higher than expected",
  hidden_fees: "a few mentioned unexpected charges",
  no_website: "you don't have a strong online presence yet",
};

export type TemplateType = "pain_point" | "competitive" | "value_prop";
export type TemplateTone = "professional" | "casual" | "urgent";

export interface OutreachMessage {
  subject: string;
  body: string;
}

function getTopPainDescription(business: LeadBusiness): string {
  const top = business.pain_signals?.[0];
  return top ? PAIN_DESCRIPTIONS[top] : "customers had some concerns about response time";
}

function getLostRevenue(business: LeadBusiness): number {
  return business.estimated_lost_revenue ?? 5000;
}

function getVertical(business: LeadBusiness): string {
  return (business as LeadBusiness & { vertical?: string }).vertical ?? "business";
}

export function generatePainPointEmail(
  business: LeadBusiness,
  tone: TemplateTone
): OutreachMessage {
  const lostRevenue = getLostRevenue(business);
  const painDesc = getTopPainDescription(business);
  const vertical = getVertical(business);

  if (tone === "professional") {
    return {
      subject: `Quick question about ${business.name}`,
      body: `Hi there,

I was looking at reviews for ${business.name} and noticed a pattern - ${painDesc}.

That's frustrating for them, but it's also lost revenue for you.

I help ${vertical} businesses capture every lead automatically. One of my clients (similar size to yours) added $${Math.round(lostRevenue * 0.5).toLocaleString()}/month just by fixing their response time.

Worth a 10-minute conversation?

Best regards`,
    };
  }

  if (tone === "casual") {
    return {
      subject: `${business.name} - quick question`,
      body: `Hey,

Saw some reviews for ${business.name} mentioning response issues. That's rough - losing customers before you even talk to them.

I've got a simple fix that helps ${vertical} owners capture every call/text without hiring more staff. One guy similar to you added like $${Math.round(lostRevenue * 0.5).toLocaleString()}/month.

Got 10 mins to chat?

Cheers`,
    };
  }

  // urgent
  return {
    subject: `${business.name}: You're losing ${Math.round(lostRevenue / 1000)}k/month`,
    body: `Hi,

I ran the numbers on ${business.name}. Based on your review volume and competitors, you're probably losing $${lostRevenue.toLocaleString()}/month to missed calls alone.

That's $${(lostRevenue * 12).toLocaleString()}/year.

I fix this for ${vertical} businesses in 48 hours. No long-term contract.

Can we talk today?`,
  };
}

export function generateCompetitiveEmail(
  business: LeadBusiness,
  tone: TemplateTone
): OutreachMessage {
  const lostRevenue = getLostRevenue(business);
  const vertical = getVertical(business);

  if (tone === "professional") {
    return {
      subject: `How ${business.name} stacks up`,
      body: `Hi there,

I've been looking at ${vertical} businesses in your area. Your competitors are investing in AI to catch every lead — and it's paying off.

${business.name} has room to grow. I help businesses like yours capture calls and texts 24/7 without hiring. One client added $${Math.round(lostRevenue * 0.4).toLocaleString()}/month in the first 90 days.

Worth a quick call to see if it fits?

Best regards`,
    };
  }

  if (tone === "casual") {
    return {
      subject: `Quick question about ${business.name}`,
      body: `Hey,

Saw some other ${vertical} businesses in your area leveling up with AI. Thought you might want to know what they're doing.

I help owners like you capture every call/text without hiring. Simple setup, real results.

Want to chat?`,
    };
  }

  return {
    subject: `Your competitors are ahead — ${business.name}`,
    body: `Hi,

Other ${vertical} businesses in your area are already using AI to capture every lead. They're not missing calls. They're not losing $${lostRevenue.toLocaleString()}/month to voicemail.

I can help ${business.name} catch up. 48-hour setup. No long-term contract.

Can we talk today?`,
  };
}

export function generateValuePropEmail(
  business: LeadBusiness,
  tone: TemplateTone
): OutreachMessage {
  const lostRevenue = getLostRevenue(business);
  const vertical = getVertical(business);

  if (tone === "professional") {
    return {
      subject: `AI workforce for ${business.name}`,
      body: `Hi there,

I help ${vertical} businesses capture every lead automatically — calls, texts, and forms — 24/7.

No hiring. No extra staff. Just AI that handles the first touch so you close more deals.

One of my clients (similar to ${business.name}) added $${Math.round(lostRevenue * 0.5).toLocaleString()}/month in recovered revenue.

Worth a 10-minute conversation?

Best regards`,
    };
  }

  if (tone === "casual") {
    return {
      subject: `Quick idea for ${business.name}`,
      body: `Hey,

I help ${vertical} owners capture every call and text without hiring. AI handles it 24/7.

Simple setup. Real results. One guy added like $${Math.round(lostRevenue * 0.5).toLocaleString()}/month.

Got 10 mins?`,
    };
  }

  return {
    subject: `$${Math.round(lostRevenue / 1000)}k/month — ${business.name}`,
    body: `Hi,

${business.name} is probably leaving $${lostRevenue.toLocaleString()}/month on the table. Missed calls. Unanswered texts.

I fix that with AI. 48-hour setup. No long-term contract.

Can we talk today?`,
  };
}

export function generateOutreach(
  business: LeadBusiness,
  templateType: TemplateType,
  tone: TemplateTone
): OutreachMessage {
  switch (templateType) {
    case "pain_point":
      return generatePainPointEmail(business, tone);
    case "competitive":
      return generateCompetitiveEmail(business, tone);
    case "value_prop":
      return generateValuePropEmail(business, tone);
    default:
      return generatePainPointEmail(business, tone);
  }
}
