export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getTierManager, TierName } from '@/lib/tier-system';

const tierManager = getTierManager();

// GET /api/tier - Get current customer's tier status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      );
    }

    const status = await tierManager.getCustomerTierStatus(customerId);

    if (!status) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error getting tier status:', error);
    return NextResponse.json(
      { error: 'Failed to get tier status' },
      { status: 500 }
    );
  }
}

// POST /api/tier/upgrade - Upgrade customer tier
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, newTier, stripeSubscriptionId } = body;

    if (!customerId || !newTier) {
      return NextResponse.json(
        { error: 'Customer ID and new tier required' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['free', 'pro', 'enterprise'].includes(newTier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }

    const success = await tierManager.upgradeCustomer(
      customerId,
      newTier as TierName,
      stripeSubscriptionId
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Upgrade failed' },
        { status: 500 }
      );
    }

    // Get updated status
    const status = await tierManager.getCustomerTierStatus(customerId);

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${newTier}`,
      status,
    });
  } catch (error) {
    console.error('Error upgrading tier:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade tier' },
      { status: 500 }
    );
  }
}
