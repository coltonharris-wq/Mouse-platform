import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Map frontend field names to backend expected fields
    const backendPayload = {
      plan_type: body.plan_type || body.plan || body.planId || 'starter',
      success_url: body.success_url || body.successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success`,
      cancel_url: body.cancel_url || body.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/cancel`,
      customer_email: body.customer_email || body.email || undefined,
      promo_code: body.promo_code || undefined,
    };

    const response = await fetch(`${API_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Checkout failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Stripe checkout proxy error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 502 });
  }
}
