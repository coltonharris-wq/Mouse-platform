import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, TOKEN_PACKAGES } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, packageSlug, successUrl, cancelUrl } = body;

    if (!customerId || !packageSlug || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pkg = TOKEN_PACKAGES[packageSlug as keyof typeof TOKEN_PACKAGES];
    if (!pkg) {
      return NextResponse.json(
        { error: 'Invalid package' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(
      customerId,
      packageSlug,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('AI Work Hours purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
