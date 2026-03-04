export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getTierManager, FEATURE_KEYS } from '@/lib/tier-system';
import { getLLMProviderManager, LLMMessage } from '@/lib/llm-provider';

const tierManager = getTierManager();
const llmManager = getLLMProviderManager();

// POST /api/tier/check - Check if an action is allowed
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, action, featureKey, estimatedCost } = body;

    if (!customerId || !action) {
      return NextResponse.json(
        { error: 'Customer ID and action required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'message':
        result = await tierManager.checkMessageAllowed(customerId);
        break;
      
      case 'pro_feature':
        if (!featureKey) {
          return NextResponse.json(
            { error: 'Feature key required for pro_feature check' },
            { status: 400 }
          );
        }
        result = await tierManager.checkProFeatureAllowed(
          customerId,
          featureKey,
          estimatedCost || 0
        );
        break;

      case 'call':
        result = await tierManager.checkProFeatureAllowed(
          customerId,
          FEATURE_KEYS.CALLS,
          0.05 // Estimated cost per minute
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error checking tier permissions:', error);
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    );
  }
}

// GET /api/tier/check - Get current usage stats
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

    return NextResponse.json({
      tier: status.tier,
      tierStatus: status.tierStatus,
      llmProvider: status.llmProvider,
      usage: {
        messages: {
          used: status.messageUsage?.messageCount || 0,
          remaining: status.limits.messagesRemaining,
          unlimited: status.limits.messagesRemaining === -1,
        },
        proFeatures: {
          used: status.proUsage?.totalUsd || 0,
          remaining: status.limits.proUsageRemaining,
          inGracePeriod: status.limits.inGracePeriod,
          gracePeriodRemaining: status.limits.gracePeriodRemaining,
          unlimited: status.limits.proUsageRemaining === -1,
        },
      },
      features: status.features.filter(f => f.isEnabled).map(f => f.featureKey),
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to get usage stats' },
      { status: 500 }
    );
  }
}
