export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// Lazy initialization - only create when needed
let supabase: any = null;

function getSupabase() {
  if (!supabase) {
    // Use dynamic import to avoid build-time errors
    const { createClient } = require('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    
    if (!url || !key || url.includes('mock')) {
      // Return mock client for build or missing config
      return {
        from: () => ({
          select: () => ({
            order: () => ({
              range: () => ({
                eq: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          }),
          insert: () => Promise.resolve({ data: null, error: null }),
        }),
        rpc: () => Promise.resolve({ data: null, error: null }),
      };
    }
    
    supabase = createClient(url, key);
  }
  return supabase;
}

/**
 * King Mouse Logs API
 * Get activity logs for a King Mouse instance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const kingMouseId = searchParams.get('kingMouseId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!customerId && !kingMouseId) {
      return NextResponse.json(
        { error: 'Missing required parameter: customerId or kingMouseId' },
        { status: 400 }
      );
    }

    const client = getSupabase();
    
    // Mock response for now (Supabase not fully configured)
    return NextResponse.json({
      success: true,
      logs: [],
      pagination: {
        limit,
        offset,
        total: 0,
      },
    });

  } catch (error) {
    console.error('King Mouse logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch King Mouse logs' },
      { status: 500 }
    );
  }
}

/**
 * Log a new event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kingMouseId, customerId, eventType, eventData } = body;

    if (!kingMouseId || !customerId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: kingMouseId, customerId, eventType' },
        { status: 400 }
      );
    }

    // Mock response for now
    return NextResponse.json({
      success: true,
      logId: `log-${Date.now()}`,
    });

  } catch (error) {
    console.error('King Mouse log creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create log entry' },
      { status: 500 }
    );
  }
}
