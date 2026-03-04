import { NextRequest, NextResponse } from 'next/server';
import { vmProvisioner } from '@/lib/vm-provisioner';

// In-memory store for replay sessions (replace with Redis/DB in production)
const replaySessions = new Map<string, {
  vmId: string;
  employeeId: string;
  employeeName: string;
  screenshots: { timestamp: string; url: string }[];
  actions: { timestamp: string; type: string; description: string }[];
  startedAt: string;
  status: 'recording' | 'completed';
}>();

/**
 * GET /api/screen-replay - List all replay sessions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vmId = searchParams.get('vmId');
    const sessionId = searchParams.get('sessionId');

    // Get specific session
    if (sessionId) {
      const session = replaySessions.get(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      // Capture fresh screenshot if session is active
      if (session.status === 'recording' && vmId) {
        const screenshot = await vmProvisioner.captureScreenshot(vmId);
        if (screenshot.success && screenshot.imageUrl) {
          session.screenshots.push({
            timestamp: new Date().toISOString(),
            url: screenshot.imageUrl,
          });
          
          // Keep only last 100 screenshots
          if (session.screenshots.length > 100) {
            session.screenshots = session.screenshots.slice(-100);
          }
        }

        // Get activity log
        const activity = await vmProvisioner.getVMActivity(vmId, 50);
        if (activity.success && activity.activities) {
          session.actions = activity.activities.map((a: any) => ({
            timestamp: a.timestamp,
            type: a.type || 'action',
            description: a.description || a.command || 'Unknown action',
          }));
        }
      }

      return NextResponse.json({ success: true, session });
    }

    // List all sessions
    const sessions = Array.from(replaySessions.entries()).map(([id, session]) => ({
      id,
      vmId: session.vmId,
      employeeId: session.employeeId,
      employeeName: session.employeeName,
      startedAt: session.startedAt,
      status: session.status,
      screenshotCount: session.screenshots.length,
      actionCount: session.actions.length,
      duration: calculateDuration(session.startedAt),
    }));

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Screen replay GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get replay sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/screen-replay - Start a new replay session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vmId, employeeId, employeeName } = body;

    if (!vmId || !employeeId) {
      return NextResponse.json(
        { error: 'vmId and employeeId are required' },
        { status: 400 }
      );
    }

    const sessionId = `replay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Capture initial screenshot
    const screenshot = await vmProvisioner.captureScreenshot(vmId);
    
    replaySessions.set(sessionId, {
      vmId,
      employeeId,
      employeeName: employeeName || 'Unknown Employee',
      screenshots: screenshot.success && screenshot.imageUrl
        ? [{ timestamp: new Date().toISOString(), url: screenshot.imageUrl }]
        : [],
      actions: [],
      startedAt: new Date().toISOString(),
      status: 'recording',
    });

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Replay session started',
    });
  } catch (error) {
    console.error('Screen replay POST error:', error);
    return NextResponse.json(
      { error: 'Failed to start replay session' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/screen-replay - Update session status (stop recording)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, status } = body;

    if (!sessionId || !status) {
      return NextResponse.json(
        { error: 'sessionId and status are required' },
        { status: 400 }
      );
    }

    const session = replaySessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    session.status = status;

    return NextResponse.json({
      success: true,
      message: `Session ${status}`,
    });
  } catch (error) {
    console.error('Screen replay PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

function calculateDuration(startedAt: string): string {
  const start = new Date(startedAt);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}
