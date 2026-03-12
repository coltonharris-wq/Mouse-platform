/**
 * GET /api/engagement/suggestions?customer_id=xxx
 * Returns 3-5 contextual task suggestions based on integrations, day of week, activity.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

interface Suggestion {
  emoji: string;
  text: string;
  message: string; // What gets sent to King Mouse
}

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    // Get customer info for context
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customerId}&select=industry,niche`
    );

    const customer = customers?.[0] || {};

    // Get connected apps to personalize suggestions
    let connectedApps: string[] = [];
    try {
      const apps = await supabaseQuery(
        'workspace_apps',
        'GET',
        undefined,
        `customer_id=eq.${customerId}&connected=eq.true&select=app_slug`
      );
      connectedApps = (apps || []).map((a: { app_slug: string }) => a.app_slug);
    } catch {
      // Non-fatal
    }

    // Check last activity
    let hoursSinceActivity = 24;
    try {
      const recent = await supabaseQuery(
        'work_sessions',
        'GET',
        undefined,
        `customer_id=eq.${customerId}&order=started_at.desc&limit=1&select=started_at`
      );
      if (recent && recent.length > 0) {
        hoursSinceActivity = (Date.now() - new Date(recent[0].started_at).getTime()) / 3600000;
      }
    } catch {
      // Non-fatal
    }

    const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, ...
    const hour = new Date().getHours();
    const suggestions: Suggestion[] = [];

    // Monday: weekly reports
    if (dayOfWeek === 1) {
      suggestions.push({
        emoji: '\u{1F4CA}',
        text: 'Generate your weekly revenue report',
        message: 'Generate a weekly revenue report for my business',
      });
    }

    // Friday: weekly wrap-up
    if (dayOfWeek === 5) {
      suggestions.push({
        emoji: '\u{1F4CB}',
        text: 'Prepare a weekly summary for the team',
        message: 'Create a weekly summary of everything accomplished this week',
      });
    }

    // Email suggestions if Gmail connected
    if (connectedApps.includes('gmail') || connectedApps.includes('outlook')) {
      suggestions.push({
        emoji: '\u{1F4E7}',
        text: 'Summarize my unread business emails',
        message: 'Summarize my unread business emails and flag anything urgent',
      });
    }

    // Social media if connected
    if (connectedApps.includes('instagram') || connectedApps.includes('facebook')) {
      suggestions.push({
        emoji: '\u{1F4F1}',
        text: 'Draft a social media post for this week',
        message: 'Draft a social media post for my business this week',
      });
    }

    // Google reviews
    if (connectedApps.includes('google-business')) {
      suggestions.push({
        emoji: '\u{2B50}',
        text: 'Check for new Google reviews and respond',
        message: 'Check for new Google reviews and draft responses to them',
      });
    }

    // Calendar if morning
    if (hour < 12) {
      suggestions.push({
        emoji: '\u{1F4C5}',
        text: "Show me today's schedule and priorities",
        message: "What's on my schedule today? List my priorities.",
      });
    }

    // Industry-specific suggestions
    const industry = customer.industry || '';
    if (industry === 'food-service' || industry === 'retail') {
      suggestions.push({
        emoji: '\u{1F4E6}',
        text: 'Check inventory and flag low stock items',
        message: 'Check my inventory levels and flag anything running low',
      });
    }
    if (industry === 'health-beauty' || industry === 'professional-services') {
      suggestions.push({
        emoji: '\u{1F4DE}',
        text: 'Follow up with missed calls and messages',
        message: "Follow up with any missed calls or messages I haven't responded to",
      });
    }

    // Generic always-useful suggestions
    if (hoursSinceActivity > 12) {
      suggestions.push({
        emoji: '\u{1F680}',
        text: 'Catch me up on what happened while I was away',
        message: "Catch me up on everything that happened since I last checked in",
      });
    }

    suggestions.push({
      emoji: '\u{1F4B0}',
      text: "How's my business doing this week?",
      message: 'Give me a quick overview of how my business is doing this week',
    });

    // Return top 5, deduplicated
    const unique = suggestions.filter(
      (s, i) => suggestions.findIndex((x) => x.text === s.text) === i
    );

    return NextResponse.json({ suggestions: unique.slice(0, 5) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ENGAGEMENT_SUGGESTIONS]', message);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
