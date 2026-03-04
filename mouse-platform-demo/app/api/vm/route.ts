export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const ORGO_API_KEY = process.env.ORGO_API_KEY;
const ORGO_BASE_URL = process.env.ORGO_BASE_URL || 'https://api.orgo.ai';

// Simple in-memory store for VMs per user (replace with DB in production)
const userVMs: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, vmConfig } = body;

    if (!ORGO_API_KEY) {
      // Fallback: create mock VM for demo
      console.log('ORGO_API_KEY not set, creating mock VM');
      const mockVM = {
        id: `mock-vm-${Date.now()}`,
        userId,
        status: 'running',
        name: vmConfig?.name || 'AI Employee',
        specs: {
          ram: vmConfig?.ram || 32,
          cpu: vmConfig?.cpu || 4,
          disk: 128
        },
        url: 'https://demo.mouseplatform.com/vm',
        createdAt: new Date().toISOString(),
        mock: true
      };
      userVMs[userId] = mockVM;
      return NextResponse.json({ success: true, vm: mockVM });
    }

    if (action === 'create') {
      // Call Orgo API to create VM
      const response = await fetch(`${ORGO_BASE_URL}/v1/computers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ORGO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: vmConfig?.name || 'AI Employee',
          os: 'linux',
          ram: vmConfig?.ram || 32,
          cpu: vmConfig?.cpu || 4,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Orgo API error:', error);
        
        // Fallback to mock VM on error
        const mockVM = {
          id: `fallback-vm-${Date.now()}`,
          userId,
          status: 'running',
          name: vmConfig?.name || 'AI Employee',
          specs: { ram: 32, cpu: 4, disk: 128 },
          url: 'https://demo.mouseplatform.com/vm',
          createdAt: new Date().toISOString(),
          mock: true
        };
        userVMs[userId] = mockVM;
        return NextResponse.json({ success: true, vm: mockVM });
      }

      const vmData = await response.json();
      userVMs[userId] = vmData;
      return NextResponse.json({ success: true, vm: vmData });
    }

    if (action === 'get') {
      const vm = userVMs[userId];
      if (!vm) {
        return NextResponse.json({ error: 'No VM found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, vm });
    }

    if (action === 'screenshot') {
      const vm = userVMs[userId];
      if (!vm) {
        return NextResponse.json({ error: 'No VM found' }, { status: 404 });
      }

      if (vm.mock) {
        // Return mock screenshot
        return NextResponse.json({ 
          success: true, 
          screenshot: generateMockScreenshot()
        });
      }

      // Get real screenshot from Orgo
      const response = await fetch(`${ORGO_BASE_URL}/v1/computers/${vm.id}/screenshot`, {
        headers: {
          'Authorization': `Bearer ${ORGO_API_KEY}`,
        },
      });

      if (!response.ok) {
        return NextResponse.json({ 
          success: true, 
          screenshot: generateMockScreenshot()
        });
      }

      const data = await response.json();
      return NextResponse.json({ success: true, screenshot: data.screenshot_base64 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('VM API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate a mock desktop screenshot as base64
function generateMockScreenshot(): string {
  // Create a simple canvas with desktop-like content
  const svg = `
    <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="500" fill="#1a1a2e"/>
      <rect x="0" y="0" width="800" height="30" fill="#252538"/>
      <text x="10" y="20" fill="#fff" font-family="sans-serif" font-size="12">AI Employee Desktop</text>
      <text x="650" y="20" fill="#888" font-family="sans-serif" font-size="10">${new Date().toLocaleTimeString()}</text>
      <rect x="50" y="80" width="200" height="150" fill="#2d2d44" stroke="#00d4ff" stroke-width="2" rx="8"/>
      <text x="70" y="110" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold">Chrome</text>
      <rect x="70" y="130" width="160" height="8" fill="#444" rx="4"/>
      <rect x="70" y="145" width="120" height="8" fill="#444" rx="4"/>
      <rect x="70" y="160" width="140" height="8" fill="#444" rx="4"/>
      <rect x="70" y="175" width="100" height="8" fill="#444" rx="4"/>
      <rect x="280" y="80" width="200" height="150" fill="#2d2d44" stroke="#7b2cbf" stroke-width="2" rx="8"/>
      <text x="300" y="110" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold">Gmail</text>
      <rect x="300" y="130" width="160" height="8" fill="#444" rx="4"/>
      <rect x="300" y="145" width="120" height="8" fill="#444" rx="4"/>
      <rect x="300" y="160" width="140" height="8" fill="#444" rx="4"/>
      <text x="50" y="280" fill="#00d4ff" font-family="sans-serif" font-size="12">Status: Working...</text>
      <text x="50" y="300" fill="#888" font-family="sans-serif" font-size="10">Last activity: ${new Date().toLocaleTimeString()}</text>
    </svg>
  `;
  
  // Convert SVG to base64 (simplified - in production use proper canvas)
  return btoa(svg);
}

// GET - Check if user has a VM
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const vm = userVMs[userId];
  if (!vm) {
    return NextResponse.json({ hasVM: false });
  }

  return NextResponse.json({ hasVM: true, vm });
}
