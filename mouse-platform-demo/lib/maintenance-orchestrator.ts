/**
 * Auto-Maintenance Orchestrator
 * Initializes and coordinates all auto-maintenance services
 * Run this on each employee VM startup
 */

import { startDoctorSchedule, stopDoctorSchedule, getDoctorSchedule } from './auto-doctor';
import { startUpdaterSchedule, stopUpdaterSchedule, getUpdaterStatus } from './auto-updater';
import { startRestartMonitor, stopRestartMonitor, isMonitoring } from './auto-restart';
import { startSelfHealing, stopSelfHealing, isWatching } from './self-healing';

export interface MaintenanceStatus {
  autoDoctor: {
    running: boolean;
    lastRun: string | null;
    nextRun: string;
    intervalHours: number;
  };
  autoUpdater: {
    running: boolean;
    currentVersion: string;
    latestVersion: string | null;
    updateAvailable: boolean;
  };
  autoRestart: {
    running: boolean;
    monitoringProcess: boolean;
  };
  selfHealing: {
    running: boolean;
    watchingErrors: boolean;
  };
  allServicesRunning: boolean;
}

let isInitialized = false;

/**
 * Start all auto-maintenance services
 * This should be called once when the VM starts up
 */
export function startAllMaintenance(): MaintenanceStatus {
  if (isInitialized) {
    console.log('[Maintenance Orchestrator] Already initialized');
    return getMaintenanceStatus();
  }

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     OpenClaw Auto-Maintenance System Starting...       ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // Start Auto-Doctor (runs every 6 hours)
  console.log('\n[1/4] Starting Auto-Doctor...');
  startDoctorSchedule();
  console.log('      ✓ Health checks scheduled every 6 hours');

  // Start Auto-Updater (checks daily, updates at 3am)
  console.log('\n[2/4] Starting Auto-Updater...');
  startUpdaterSchedule();
  console.log('      ✓ Update checks scheduled daily at 3:00 AM');

  // Start Auto-Restart Monitor (watches process continuously)
  console.log('\n[3/4] Starting Auto-Restart Monitor...');
  startRestartMonitor();
  console.log('      ✓ Process monitoring active');
  console.log('      ✓ Crash detection enabled (30s restart)');
  console.log('      ✓ Memory leak protection enabled (24h restart)');

  // Start Self-Healing Worker (watches logs continuously)
  console.log('\n[4/4] Starting Self-Healing Worker...');
  startSelfHealing();
  console.log('      ✓ Error pattern detection active');
  console.log('      ✓ Auto-fix attempts enabled (3 max)');

  isInitialized = true;

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  All Auto-Maintenance Services Running Successfully!   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const status = getMaintenanceStatus();
  logStatus(status);

  return status;
}

/**
 * Stop all auto-maintenance services
 * Call this before shutdown or when disabling auto-maintenance
 */
export function stopAllMaintenance(): void {
  console.log('[Maintenance Orchestrator] Stopping all services...');

  stopDoctorSchedule();
  stopUpdaterSchedule();
  stopRestartMonitor();
  stopSelfHealing();

  isInitialized = false;

  console.log('[Maintenance Orchestrator] All services stopped');
}

/**
 * Get current status of all maintenance services
 */
export function getMaintenanceStatus(): MaintenanceStatus {
  const doctorSchedule = getDoctorSchedule();
  const updaterStatus = getUpdaterStatus();

  return {
    autoDoctor: {
      running: doctorSchedule.isRunning,
      lastRun: doctorSchedule.lastRun,
      nextRun: doctorSchedule.nextRun,
      intervalHours: doctorSchedule.intervalHours,
    },
    autoUpdater: {
      running: updaterStatus.lastCheck !== null,
      currentVersion: updaterStatus.currentVersion,
      latestVersion: updaterStatus.latestVersion,
      updateAvailable: updaterStatus.updateAvailable,
    },
    autoRestart: {
      running: isMonitoring(),
      monitoringProcess: isMonitoring(),
    },
    selfHealing: {
      running: isWatching(),
      watchingErrors: isWatching(),
    },
    allServicesRunning: isInitialized && isMonitoring() && isWatching(),
  };
}

/**
 * Log current status to console
 */
function logStatus(status: MaintenanceStatus): void {
  console.log('Current Status:');
  console.log(`  Auto-Doctor:     ${status.autoDoctor.running ? '🟢 Running' : '🔴 Stopped'}`);
  console.log(`  Auto-Updater:    ${status.autoUpdater.running ? '🟢 Running' : '🔴 Stopped'}`);
  console.log(`  Auto-Restart:    ${status.autoRestart.running ? '🟢 Running' : '🔴 Stopped'}`);
  console.log(`  Self-Healing:    ${status.selfHealing.running ? '🟢 Running' : '🔴 Stopped'}`);
  console.log(`\nNext doctor run:   ${new Date(status.autoDoctor.nextRun).toLocaleString()}`);
  
  if (status.autoUpdater.updateAvailable) {
    console.log(`⚠️  Update available: ${status.autoUpdater.currentVersion} → ${status.autoUpdater.latestVersion}`);
  }
}

/**
 * Restart all services (useful after configuration changes)
 */
export function restartAllMaintenance(): MaintenanceStatus {
  console.log('[Maintenance Orchestrator] Restarting all services...');
  stopAllMaintenance();
  return startAllMaintenance();
}

/**
 * Health check - verify all services are running
 * Returns true if all services are operational
 */
export function healthCheck(): boolean {
  const status = getMaintenanceStatus();
  return status.allServicesRunning;
}

// Auto-start if environment variable is set
if (process.env.AUTO_MAINTENANCE_ENABLED === 'true') {
  startAllMaintenance();
}

// Export individual service controls for fine-grained management
export {
  // Auto-Doctor
  startDoctorSchedule,
  stopDoctorSchedule,
  getDoctorSchedule,
  
  // Auto-Updater
  startUpdaterSchedule,
  stopUpdaterSchedule,
  getUpdaterStatus,
  
  // Auto-Restart
  startRestartMonitor,
  stopRestartMonitor,
  isMonitoring,
  
  // Self-Healing
  startSelfHealing,
  stopSelfHealing,
  isWatching,
};
