export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkProvisionStatus } from '@/lib/mouse-os-provision';

/**
 * GET /api/vm/provision-status?computer_id=xxx
 * 
 * Check if Mouse OS provisioning is complete on a VM
 */
export async function GET(request: NextRequest) {
  const computerId = request.nextUrl.searchParams.get('computer_id');
  if (!computerId) {
    return NextResponse.json({ error: 'computer_id required' }, { status: 400 });
  }

  try {
    const status = await checkProvisionStatus(computerId);
    return NextResponse.json({
      computer_id: computerId,
      ...status,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
