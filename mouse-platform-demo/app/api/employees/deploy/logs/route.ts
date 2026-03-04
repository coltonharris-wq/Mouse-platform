// GET /api/employees/deploy/logs - Get deployment logs

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = `${SUPABASE_URL}/rest/v1/deployment_logs?order=timestamp.desc&limit=${limit}`;
    
    if (employeeId) {
      query += `&employee_id=eq.${employeeId}`;
    }
    
    if (customerId) {
      query += `&customer_id=eq.${customerId}`;
    }

    const response = await fetch(query, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch deployment logs');
    }

    const logs = await response.json();

    return NextResponse.json({
      success: true,
      data: logs.map((log: any) => ({
        id: log.id,
        employeeId: log.employee_id,
        customerId: log.customer_id,
        status: log.status,
        message: log.message,
        timestamp: log.timestamp,
        metadata: log.metadata,
      })),
    });

  } catch (error) {
    console.error('Get deployment logs error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch logs' 
      },
      { status: 500 }
    );
  }
}
