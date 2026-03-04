export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ invoices: [], payments: [] });
    }

    // Fetch payments from backend
    const paymentsRes = await fetch(`${API_URL}/stripe/payments/${customerId}`);
    const paymentsData = await paymentsRes.json();

    // Fetch subscription info
    const subRes = await fetch(`${API_URL}/stripe/subscription/${customerId}`);
    const subData = await subRes.json();

    return NextResponse.json({
      invoices: paymentsData.invoices || [],
      payments: paymentsData.payments || [],
      subscription: subData.subscription || null,
    });
  } catch (error: any) {
    console.error('Invoices proxy error:', error);
    return NextResponse.json({ invoices: [], payments: [], error: 'Failed to fetch billing data' });
  }
}
