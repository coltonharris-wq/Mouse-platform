import { NextRequest, NextResponse } from 'next/server';
import { searchAvailableNumbers } from '@/lib/twilio-client';

export async function GET(request: NextRequest) {
  try {
    const areaCode = request.nextUrl.searchParams.get('area_code') || '910';
    const numbers = await searchAvailableNumbers(areaCode);
    return NextResponse.json({ numbers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[PHONE_SEARCH]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
