/**
 * GET /api/admin/guardrails/repeat-offenders
 * Get list of customers with multiple security events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRepeatOffenders } from '@/lib/guardrails';

// Admin authentication
function isAdmin(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-admin-api-key');
  const expectedKey = process.env.ADMIN_API_KEY;
  return apiKey === expectedKey;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const minAttempts = parseInt(searchParams.get('minAttempts') || '3');
    
    const offenders = getRepeatOffenders(minAttempts);
    
    // Enrich with additional risk indicators
    const enriched = offenders.map(offender => ({
      ...offender,
      riskLevel: offender.count >= 10 ? 'critical' : 
                 offender.count >= 5 ? 'high' : 'medium',
      lastAttemptAgo: Date.now() - offender.lastAttempt,
      recommendedAction: offender.count >= 10 ? 'suspend_account' :
                        offender.count >= 5 ? 'require_verification' :
                        'monitor_closely'
    }));

    return NextResponse.json({
      offenders: enriched,
      count: enriched.length,
      thresholds: {
        minAttempts,
        critical: 10,
        high: 5,
        medium: 3
      }
    });
  } catch (error) {
    console.error('Error fetching repeat offenders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repeat offenders' },
      { status: 500 }
    );
  }
}
