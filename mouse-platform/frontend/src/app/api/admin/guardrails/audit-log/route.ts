/**
 * ANTI-CLONE GUARDRAILS ADMIN API
 * Routes for monitoring and managing guardrail system
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAuditLog,
  getRepeatOffenders,
  isCustomerFlagged,
  DEFAULT_RATE_LIMITS,
  AuditLogEntry
} from '@/lib/guardrails';

// Admin authentication middleware
function isAdmin(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-admin-api-key');
  const expectedKey = process.env.ADMIN_API_KEY;
  
  if (!expectedKey) {
    console.error('ADMIN_API_KEY not configured');
    return false;
  }
  
  return apiKey === expectedKey;
}

// ============================================================================
// GET /api/admin/guardrails/audit-log
// Get audit log entries with filtering
// ============================================================================

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      customerId: searchParams.get('customerId') || undefined,
      eventType: searchParams.get('eventType') || undefined,
      severity: searchParams.get('severity') || undefined,
      since: searchParams.get('since') 
        ? parseInt(searchParams.get('since')!) 
        : undefined
    };

    const limit = parseInt(searchParams.get('limit') || '100');
    
    let entries = getAuditLog(filters);
    
    // Apply limit
    entries = entries.slice(0, limit);
    
    // Calculate statistics
    const stats = {
      total: entries.length,
      bySeverity: {
        critical: entries.filter(e => e.severity === 'critical').length,
        high: entries.filter(e => e.severity === 'high').length,
        medium: entries.filter(e => e.severity === 'medium').length,
        low: entries.filter(e => e.severity === 'low').length
      },
      byEventType: entries.reduce((acc, e) => {
        acc[e.eventType] = (acc[e.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      entries,
      stats,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined)
      )
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit log' },
      { status: 500 }
    );
  }
}
