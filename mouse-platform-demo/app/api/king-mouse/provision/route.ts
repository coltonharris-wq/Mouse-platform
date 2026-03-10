export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { kingMouseService } from '@/lib/king-mouse-service';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * King Mouse Provision API
 * Manually trigger King Mouse provisioning (admin only)
 */

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { customerId, customerEmail, companyName, planTier, resellerId } = body;

    if (!customerId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, customerEmail' },
        { status: 400 }
      );
    }

    console.log(`🤖 Manual King Mouse provisioning triggered for: ${customerId}`);

    const result = await kingMouseService.provisionKingMouse({
      customerId,
      customerEmail,
      companyName: companyName || 'Unknown Company',
      planTier: planTier || 'starter',
      resellerId,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'King Mouse provisioned successfully',
        kingMouse: result.instance,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Provisioning failed' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('King Mouse provision error:', error);
    return NextResponse.json(
      { error: 'Failed to provision King Mouse' },
      { status: 500 }
    );
  }
}

/**
 * Deprovision King Mouse (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing required parameter: customerId' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Manual King Mouse deprovisioning triggered for: ${customerId}`);

    const result = await kingMouseService.deprovisionKingMouse(customerId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'King Mouse deprovisioned successfully',
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Deprovisioning failed' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('King Mouse deprovision error:', error);
    return NextResponse.json(
      { error: 'Failed to deprovision King Mouse' },
      { status: 500 }
    );
  }
}
