/**
 * POST /api/admin/promo-codes
 * Create a Stripe coupon + promotion code programmatically.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { code, amount_off_cents, percent_off, duration, max_redemptions } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'code required' }, { status: 400 });
    }

    if (!amount_off_cents && !percent_off) {
      return NextResponse.json({ error: 'amount_off_cents or percent_off required' }, { status: 400 });
    }

    const stripe = getStripe();

    // Create coupon
    const coupon = amount_off_cents
      ? await stripe.coupons.create({
          amount_off: amount_off_cents,
          currency: 'usd',
          duration: duration || 'once',
          name: `${code} Coupon`,
        })
      : await stripe.coupons.create({
          percent_off: percent_off,
          duration: duration || 'once',
          name: `${code} Coupon`,
        });

    // Create promotion code
    const promoCode = max_redemptions
      ? await stripe.promotionCodes.create({
          coupon: coupon.id,
          code: code.toUpperCase(),
          max_redemptions,
        })
      : await stripe.promotionCodes.create({
          coupon: coupon.id,
          code: code.toUpperCase(),
        });

    return NextResponse.json({
      success: true,
      coupon_id: coupon.id,
      promo_code_id: promoCode.id,
      code: promoCode.code,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ADMIN_PROMO_CODES]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
