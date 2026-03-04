export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * King Mouse Status API
 * Get status and metrics for a customer's King Mouse instance
 */

// Mock response for now - Supabase not fully configured yet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const kingMouseId = searchParams.get('kingMouseId');

    if (!customerId && !kingMouseId) {
      return NextResponse.json(
        { error: 'Missing required parameter: customerId or kingMouseId' },
        { status: 400 }
      );
    }

    // Return mock status for demo/testing
    return NextResponse.json({
      success: true,
      kingMouse: {
        id: kingMouseId || `km-${customerId}`,
        customerId: customerId,
        status: 'active',
        openclawStatus: 'running',
        totalInteractions: 0,
        lastActiveAt: new Date().toISOString(),
        provisionedAt: new Date().toISOString(),
        botLink: 'https://t.me/MouseKingBot',
        botUsername: 'MouseKingBot',
      },
    });

  } catch (error) {
    console.error('King Mouse status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch King Mouse status' },
      { status: 500 }
    );
  }
}

/**
 * Update King Mouse status (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { kingMouseId, status } = body;

    if (!kingMouseId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: kingMouseId, status' },
        { status: 400 }
      );
    }

    const validStatuses = ['provisioning', 'active', 'error', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Mock update
    return NextResponse.json({
      success: true,
      kingMouse: {
        id: kingMouseId,
        status: status,
        updatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('King Mouse update error:', error);
    return NextResponse.json(
      { error: 'Failed to update King Mouse status' },
      { status: 500 }
    );
  }
}
