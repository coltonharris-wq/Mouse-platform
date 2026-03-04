export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  PRICING_TIERS,
  calculateCost,
  calculateTextChatCost,
  calculateVoiceChatCost,
  calculateImageGenerationCost,
  calculateVideoGenerationCost,
  calculateScreenRecordingCost,
  calculateApiCallCost,
  formatWorkHoursCost,
  FeatureType,
} from '@/lib/work-hours-costs';

// GET /api/work-hours/cost?feature=text_chat&units=1&balance=100
// Calculate cost for a feature usage
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature') as FeatureType;
    const units = parseFloat(searchParams.get('units') || '1');
    const balance = parseFloat(searchParams.get('balance') || '0');

    if (!feature || !PRICING_TIERS[feature]) {
      return NextResponse.json(
        { 
          error: 'Invalid feature type',
          validFeatures: Object.keys(PRICING_TIERS),
        },
        { status: 400 }
      );
    }

    const calculation = calculateCost(feature, units, balance);

    return NextResponse.json({
      success: true,
      calculation: {
        featureType: calculation.featureType,
        displayName: PRICING_TIERS[feature].displayName,
        units: calculation.units,
        workHoursRequired: calculation.workHoursRequired,
        formattedCost: formatWorkHoursCost(calculation.workHoursRequired),
        canAfford: calculation.canAfford,
        currentBalance: calculation.currentBalance,
        balanceAfter: calculation.balanceAfter,
        unit: PRICING_TIERS[feature].unit,
        multiplier: PRICING_TIERS[feature].multiplier,
      },
    });
  } catch (error) {
    console.error('Error calculating cost:', error);
    return NextResponse.json(
      { error: 'Failed to calculate cost' },
      { status: 500 }
    );
  }
}

// POST /api/work-hours/calculate
// Batch cost calculation for multiple features
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, balance = 0 } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array required' },
        { status: 400 }
      );
    }

    const calculations = items.map((item: { feature: FeatureType; units: number }) => {
      const calc = calculateCost(item.feature, item.units, balance);
      return {
        featureType: calc.featureType,
        displayName: PRICING_TIERS[item.feature].displayName,
        units: calc.units,
        workHoursRequired: calc.workHoursRequired,
        formattedCost: formatWorkHoursCost(calc.workHoursRequired),
        canAfford: calc.canAfford,
      };
    });

    const totalRequired = calculations.reduce((sum, calc) => sum + calc.workHoursRequired, 0);
    const canAffordAll = balance >= totalRequired;

    return NextResponse.json({
      success: true,
      calculations,
      summary: {
        totalRequired,
        formattedTotal: formatWorkHoursCost(totalRequired),
        currentBalance: balance,
        canAffordAll,
        balanceAfter: balance - totalRequired,
      },
    });
  } catch (error) {
    console.error('Error in batch cost calculation:', error);
    return NextResponse.json(
      { error: 'Failed to calculate costs' },
      { status: 500 }
    );
  }
}
