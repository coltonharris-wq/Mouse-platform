import { notFound } from 'next/navigation';
import { supabaseQuery } from '@/lib/supabase-server';
import NicheDemoChat from '@/components/landing/NicheDemoChat';

interface PageProps {
  params: Promise<{ industry: string; niche: string }>;
}

interface ProTemplate {
  industry: string;
  niche: string;
  display_name: string;
  industry_display: string;
  icon: string | null;
  demo_prompt: string;
}

// Generate initial King Mouse message from demo_prompt
function extractInitialMessage(demoPrompt: string, displayName: string): string {
  // The demo_prompt is a system prompt for the LLM. We generate a sensible
  // opening message based on the niche so the user sees an immediate greeting
  // without waiting for an API call.
  // This mirrors the spec: King Mouse opens with a niche-specific pitch.
  return `I'm Mouse, your AI operations manager built specifically for ${displayName.toLowerCase()} businesses. I handle the operational headaches — scheduling, inventory, supplier coordination, customer follow-ups, and more — so you can focus on what you do best.\n\nWhat's the name of your business, and what's taking up most of your time right now?`;
}

export default async function NicheChatPage({ params }: PageProps) {
  const { industry, niche } = await params;

  // Look up the pro template
  let template: ProTemplate | null = null;
  try {
    const results = await supabaseQuery(
      'pro_templates',
      'GET',
      undefined,
      `industry=eq.${encodeURIComponent(industry)}&niche=eq.${encodeURIComponent(niche)}&active=eq.true&select=industry,niche,display_name,industry_display,icon,demo_prompt&limit=1`
    );
    if (results && results.length > 0) {
      template = results[0];
    }
  } catch (err) {
    console.error('[NICHE_CHAT] Template lookup failed:', err);
  }

  if (!template) {
    notFound();
  }

  const initialMessage = extractInitialMessage(template.demo_prompt, template.display_name);

  return (
    <NicheDemoChat
      industry={template.industry}
      niche={template.niche}
      displayName={template.display_name}
      industryDisplay={template.industry_display}
      icon={template.icon}
      initialMessage={initialMessage}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { industry, niche } = await params;

  let displayName = niche.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  try {
    const results = await supabaseQuery(
      'pro_templates',
      'GET',
      undefined,
      `industry=eq.${encodeURIComponent(industry)}&niche=eq.${encodeURIComponent(niche)}&select=display_name&limit=1`
    );
    if (results && results.length > 0) {
      displayName = results[0].display_name;
    }
  } catch {
    // Use fallback display name
  }

  return {
    title: `Chat with King Mouse — ${displayName} Pro | KingMouse`,
    description: `Talk to your AI operations manager for ${displayName.toLowerCase()} businesses. See how King Mouse can automate your operations.`,
  };
}
