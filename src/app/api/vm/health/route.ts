import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, string> = {};

  // Check env vars
  const hasOrgoKey = !!process.env.ORGO_API_KEY;
  const hasOrgoWorkspace = !!process.env.ORGO_WORKSPACE_ID;
  results.envVars = hasOrgoKey && hasOrgoWorkspace ? 'ok' : 'missing';

  if (!hasOrgoKey || !hasOrgoWorkspace) {
    results.detail = `ORGO_API_KEY: ${hasOrgoKey ? 'set' : 'MISSING'}, ORGO_WORKSPACE_ID: ${hasOrgoWorkspace ? 'set' : 'MISSING'}`;
    return NextResponse.json(results, { status: 500 });
  }

  // Test Orgo API connectivity by listing workspace
  try {
    const resp = await fetch(`https://www.orgo.ai/api/workspaces/${process.env.ORGO_WORKSPACE_ID}`, {
      headers: { Authorization: `Bearer ${process.env.ORGO_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    });

    if (resp.ok) {
      results.orgo = 'ok';
    } else {
      const body = await resp.text();
      results.orgo = 'error';
      results.orgoStatus = String(resp.status);
      results.orgoDetail = body.slice(0, 200);
    }
  } catch (err) {
    results.orgo = 'error';
    results.orgoDetail = err instanceof Error ? err.message : 'Unknown error';
  }

  const status = results.orgo === 'ok' ? 200 : 502;
  return NextResponse.json(results, { status });
}
