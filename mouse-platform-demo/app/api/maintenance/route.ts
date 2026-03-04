export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { 
  runDoctorNow, 
  getDoctorRuns, 
  getHealthScore,
  getDoctorSchedule 
} from '@/lib/auto-doctor';
import { 
  getUpdaterStatus, 
  checkNow, 
  updateNow,
  getUpdateHistory 
} from '@/lib/auto-updater';
import { 
  getProcessStatus, 
  getRestartLogs, 
  getRestartStats,
  restartNow,
  isMonitoring 
} from '@/lib/auto-restart';
import { 
  getHealingStats, 
  getRecentIssues, 
  getPendingIssues,
  isWatching 
} from '@/lib/self-healing';

// GET /api/maintenance - Get full maintenance status
export async function GET() {
  try {
    const [doctorRuns, updaterStatus, processStatus, restartLogs, restartStats, healingStats, recentIssues] = await Promise.all([
      Promise.resolve(getDoctorRuns(10)),
      Promise.resolve(getUpdaterStatus()),
      Promise.resolve(getProcessStatus()),
      Promise.resolve(getRestartLogs(10)),
      Promise.resolve(getRestartStats()),
      Promise.resolve(getHealingStats()),
      Promise.resolve(getRecentIssues(10)),
    ]);

    return NextResponse.json({
      health: {
        overallScore: calculateOverallScore(doctorRuns, updaterStatus, restartStats, healingStats),
        doctorScore: getHealthScore(),
        updaterScore: updaterStatus.updateAvailable ? 80 : 100,
        restartScore: restartStats.failedRestarts === 0 ? 98 : 70,
        healingScore: healingStats.totalIssues > 0 
          ? Math.round((healingStats.autoFixed / healingStats.totalIssues) * 100)
          : 100,
      },
      services: {
        autoDoctor: {
          isRunning: getDoctorSchedule().isRunning,
          lastRun: getDoctorSchedule().lastRun,
          nextRun: getDoctorSchedule().nextRun,
        },
        autoUpdater: {
          isChecking: updaterStatus.isChecking,
          isUpdating: updaterStatus.isUpdating,
          currentVersion: updaterStatus.currentVersion,
          latestVersion: updaterStatus.latestVersion,
          updateAvailable: updaterStatus.updateAvailable,
        },
        autoRestart: {
          isMonitoring: isMonitoring(),
          processStatus,
        },
        selfHealing: {
          isWatching: isWatching(),
        },
      },
      data: {
        doctorRuns,
        updateHistory: updaterStatus.updateHistory,
        restartLogs,
        restartStats,
        healingStats,
        recentIssues,
        pendingIssues: getPendingIssues(),
      },
    });
  } catch (error) {
    console.error('Maintenance status error:', error);
    return NextResponse.json(
      { error: 'Failed to get maintenance status' },
      { status: 500 }
    );
  }
}

// POST /api/maintenance - Perform maintenance action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'runDoctor': {
        const result = await runDoctorNow(body.vmId, body.employeeId);
        return NextResponse.json({ success: true, result });
      }

      case 'checkUpdates': {
        const result = await checkNow();
        return NextResponse.json({ success: true, result });
      }

      case 'update': {
        const result = await updateNow();
        return NextResponse.json({ success: true, result });
      }

      case 'restartService': {
        const result = await restartNow('manual');
        return NextResponse.json({ success: true, result });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Maintenance action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform maintenance action' },
      { status: 500 }
    );
  }
}

// Calculate overall health score
function calculateOverallScore(
  doctorRuns: any[],
  updaterStatus: any,
  restartStats: any,
  healingStats: any
): number {
  let score = 100;
  
  // Deduct for failed doctor checks
  const failedChecks = doctorRuns.filter(r => r.status === 'critical').length;
  score -= failedChecks * 10;
  
  // Deduct for pending updates
  if (updaterStatus.updateAvailable) score -= 10;
  
  // Deduct for failed restarts
  score -= restartStats.failedRestarts * 5;
  
  // Deduct for unhealed issues
  const unhealedRate = healingStats.totalIssues > 0 
    ? (healingStats.manualFixRequired / healingStats.totalIssues)
    : 0;
  score -= Math.round(unhealedRate * 20);
  
  return Math.max(0, Math.min(100, score));
}
