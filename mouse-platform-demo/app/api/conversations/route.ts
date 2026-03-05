export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getConversationHistory } from '@/lib/king-mouse-context';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const portal = searchParams.get('portal') as 'customer' | 'reseller' | 'admin' || 'customer';
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const history = await getConversationHistory(userId, portal, limit);

  return NextResponse.json({ messages: history });
}
