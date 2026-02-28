/**
 * GET /api/admin/guardrails/config
 * Get current guardrail configuration and status
 */

import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_RATE_LIMITS } from '@/lib/guardrails';

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

  const config = {
    rateLimits: DEFAULT_RATE_LIMITS,
    keywords: {
      highRisk: [
        'clone', 'replicate', 'copy mouse', 'like openclaw',
        'king mouse clone', 'ai employees platform', 'deploy knights'
      ],
      mediumRisk: [
        'multi-tenant', 'orchestration', 'vm orchestration',
        'docker per customer', 'telegram bot factory', 'billing per tenant'
      ]
    },
    codePatterns: [
      'Docker Multi-Customer',
      'VM Orchestration',
      'Telegram Bot Factory',
      'Billing Per Tenant',
      'Multi-Tenant Database',
      'Knight Deployment System',
      'Workspace Isolation',
      'Reseller Infrastructure'
    ],
    admin: {
      alertEmail: process.env.ADMIN_ALERT_EMAIL || 'colton@kingmouse.ai',
      alertThreshold: 'medium',
      cooldownMinutes: 15
    },
    system: {
      version: '1.0.0',
      layers: 6,
      status: 'active'
    }
  };

  return NextResponse.json(config);
}
