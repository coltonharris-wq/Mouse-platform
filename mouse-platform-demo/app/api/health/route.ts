import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    return NextResponse.json({ ...data, frontend: 'healthy', backend_connected: true });
  } catch (error: any) {
    return NextResponse.json({
      status: 'degraded',
      frontend: 'healthy',
      backend_connected: false,
      error: error.message,
    });
  }
}
