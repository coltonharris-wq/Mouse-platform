/**
 * Auto-Doctor Service
 * Runs every 6 hours on each employee VM to check health and auto-fix issues
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Types
export interface DoctorCheck {
  id: string;
  timestamp: string;
  vmId: string;
  employeeId: string;
  status: 'healthy' | 'warning' | 'critical';
  checks: CheckResult[];
  fixesApplied: FixResult[];
  reportUrl?: string;
}

export interface CheckResult {
  name: string;
  category: 'dependencies' | 'config' | 'health' | 'permissions' | 'disk' | 'network';
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  fixable: boolean;
}

export interface FixResult {
  checkName: string;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface DoctorSchedule {
  lastRun: string | null;
  nextRun: string;
  intervalHours: number;
  isRunning: boolean;
}

// Configuration
const DOCTOR_CONFIG = {
  intervalHours: 6,
  logRetentionDays: 30,
  maxLogSizeMB: 100,
  autoFixEnabled: true,
  criticalAlertThreshold: 3,
};

// Storage paths
const DATA_DIR = process.env.OPENCLAW_DATA_DIR || path.join(os.homedir(), '.openclaw');
const DOCTOR_LOG_DIR = path.join(DATA_DIR, 'logs', 'auto-doctor');
const DOCTOR_STATE_FILE = path.join(DATA_DIR, 'auto-doctor-state.json');

// Ensure directories exist
function ensureDirectories(): void {
  if (!fs.existsSync(DOCTOR_LOG_DIR)) {
    fs.mkdirSync(DOCTOR_LOG_DIR, { recursive: true });
  }
}

// State management
interface DoctorState {
  lastRun: string | null;
  runs: DoctorCheck[];
  totalFixesApplied: number;
  consecutiveFailures: number;
}

function loadState(): DoctorState {
  try {
    if (fs.existsSync(DOCTOR_STATE_FILE)) {
      return JSON.parse(fs.readFileSync(DOCTOR_STATE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load doctor state:', e);
  }
  return {
    lastRun: null,
    runs: [],
    totalFixesApplied: 0,
    consecutiveFailures: 0,
  };
}

function saveState(state: DoctorState): void {
  try {
    fs.writeFileSync(DOCTOR_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Failed to save doctor state:', e);
  }
}

// Generate unique ID
function generateId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get current timestamp
function getTimestamp(): string {
  return new Date().toISOString();
}

// Individual health checks
function checkDependencies(): CheckResult {
  const issues: string[] = [];
  
  // Check Node.js version
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      issues.push(`Node.js version ${nodeVersion} is outdated (required: 18+)`);
    }
  } catch (e) {
    issues.push('Unable to detect Node.js version');
  }
  
  // Check if openclaw CLI is available
  try {
    execSync('which openclaw', { stdio: 'ignore' });
  } catch {
    issues.push('🐭 Mouse cannot find their tools! openclaw CLI not found');
  }
  
  // Check required environment variables
  const requiredEnv = ['OPENCLAW_API_KEY', 'OPENCLAW_GATEWAY_URL'];
  const missingEnv = requiredEnv.filter(env => !process.env[env]);
  if (missingEnv.length > 0) {
    issues.push(`🧀 Missing important cheese supplies: ${missingEnv.join(', ')}`);
  }
  
  return {
    name: 'Dependencies Check',
    category: 'dependencies',
    status: issues.length === 0 ? 'pass' : issues.length > 1 ? 'fail' : 'warning',
    message: issues.length === 0 ? '🐭 All Mouse supplies accounted for!' : `${issues.length} Mouse supply issue(s) found`,
    details: issues.join('\n') || undefined,
    fixable: issues.some(i => i.includes('PATH')),
  };
}

function checkConfig(): CheckResult {
  const issues: string[] = [];
  
  // Check config file exists and is valid
  const configPath = path.join(DATA_DIR, 'config.json');
  if (!fs.existsSync(configPath)) {
    issues.push('🐭 Mouse cannot find their map! Configuration file missing');
  } else {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (!config.gatewayUrl) {
        issues.push('🧀 Mouse does not know where the cheese is! Gateway URL not configured');
      }
    } catch (e) {
      issues.push('🐭 Mouse dropped the cheese! Configuration file is corrupted');
    }
  }
  
  // Check permissions on data directory
  try {
    fs.accessSync(DATA_DIR, fs.constants.R_OK | fs.constants.W_OK);
  } catch {
    issues.push('🐭 Mouse is locked out! Insufficient permissions on data directory');
  }
  
  return {
    name: 'Configuration Check',
    category: 'config',
    status: issues.length === 0 ? 'pass' : 'fail',
    message: issues.length === 0 ? '🐭 Mouse has their map and knows where the cheese is!' : `${issues.length} Mouse map issue(s) found`,
    details: issues.join('\n') || undefined,
    fixable: issues.some(i => i.includes('corrupted')),
  };
}

function checkDiskSpace(): CheckResult {
  try {
    const stats = fs.statSync(DATA_DIR);
    // Get disk info (platform-specific)
    let availableGB = 0;
    let totalGB = 0;
    
    if (process.platform === 'darwin' || process.platform === 'linux') {
      try {
        const output = execSync(`df -BG "${DATA_DIR}" | tail -1`, { encoding: 'utf-8' });
        const parts = output.trim().split(/\s+/);
        totalGB = parseInt(parts[1]) || 0;
        availableGB = parseInt(parts[3]) || 0;
      } catch (e) {
        // Fallback
      }
    }
    
    const usedPercent = totalGB > 0 ? ((totalGB - availableGB) / totalGB) * 100 : 0;
    
    if (usedPercent > 90) {
      return {
        name: 'Disk Space Check',
        category: 'disk',
        status: 'fail',
        message: `🏥 Critical: Mouse is running out of cheese storage! ${usedPercent.toFixed(1)}% full`,
        details: `Available: ${availableGB}GB / Total: ${totalGB}GB`,
        fixable: true,
      };
    } else if (usedPercent > 75) {
      return {
        name: 'Disk Space Check',
        category: 'disk',
        status: 'warning',
        message: `⚠️ Mouse cheese storage getting full: ${usedPercent.toFixed(1)}% used`,
        details: `Available: ${availableGB}GB / Total: ${totalGB}GB`,
        fixable: true,
      };
    }
    
    return {
      name: 'Disk Space Check',
      category: 'disk',
      status: 'pass',
      message: `🧀 Plenty of cheese storage available: ${usedPercent.toFixed(1)}% used`,
      details: `Available: ${availableGB}GB / Total: ${totalGB}GB`,
      fixable: false,
    };
  } catch (e) {
    return {
      name: 'Disk Space Check',
      category: 'disk',
      status: 'warning',
      message: 'Unable to check disk space',
      fixable: false,
    };
  }
}

function checkGatewayHealth(): CheckResult {
  try {
    // Check if gateway is responding
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:8080';
    // Use curl or similar for quick health check
    try {
      execSync(`curl -s -o /dev/null -w "%{http_code}" "${gatewayUrl}/health"`, { 
        timeout: 5000,
        stdio: 'pipe'
      });
      return {
        name: 'Gateway Health Check',
        category: 'health',
        status: 'pass',
        message: '🐭 Mouse is healthy and ready to work!',
        fixable: false,
      };
    } catch {
      return {
        name: 'Gateway Health Check',
        category: 'health',
        status: 'fail',
        message: '🏥 Mouse is not feeling well - not responding to treats',
        details: `Gateway URL: ${gatewayUrl}`,
        fixable: true,
      };
    }
  } catch (e) {
    return {
      name: 'Gateway Health Check',
      category: 'health',
      status: 'warning',
      message: 'Unable to check gateway health',
      fixable: false,
    };
  }
}

function checkLogSizes(): CheckResult {
  try {
    let totalSizeMB = 0;
    
    function calculateSize(dir: string): number {
      let size = 0;
      if (!fs.existsSync(dir)) return 0;
      
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          size += calculateSize(filePath);
        } else {
          size += stats.size;
        }
      }
      return size / (1024 * 1024); // Convert to MB
    }
    
    totalSizeMB = calculateSize(DOCTOR_LOG_DIR);
    
    if (totalSizeMB > DOCTOR_CONFIG.maxLogSizeMB) {
      return {
        name: 'Log Size Check',
        category: 'disk',
        status: 'warning',
        message: `🧀 Mouse has been busy! Log files using ${totalSizeMB.toFixed(1)}MB`,
        details: `Threshold: ${DOCTOR_CONFIG.maxLogSizeMB}MB`,
        fixable: true,
      };
    }
    
    return {
      name: 'Log Size Check',
      category: 'disk',
      status: 'pass',
      message: `🧀 Mouse activity logs healthy: ${totalSizeMB.toFixed(1)}MB`,
      fixable: false,
    };
  } catch (e) {
    return {
      name: 'Log Size Check',
      category: 'disk',
      status: 'pass',
      message: 'Unable to check log sizes',
      fixable: false,
    };
  }
}

function checkNetwork(): CheckResult {
  const issues: string[] = [];
  
  // Check internet connectivity
  try {
    execSync('ping -c 1 -W 3 8.8.8.8', { stdio: 'ignore' });
  } catch {
    issues.push('No internet connectivity');
  }
  
  // Check DNS resolution
  try {
    execSync('nslookup google.com', { stdio: 'ignore' });
  } catch {
    issues.push('DNS resolution failing');
  }
  
  return {
    name: 'Network Check',
    category: 'network',
    status: issues.length === 0 ? 'pass' : 'fail',
    message: issues.length === 0 ? '🐭 Mouse can find the cheese online!' : `${issues.length} network tunnel issue(s)`,
    details: issues.join('\n') || undefined,
    fixable: false,
  };
}

// Auto-fix functions
function fixLogCleanup(): boolean {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DOCTOR_CONFIG.logRetentionDays);
    
    if (!fs.existsSync(DOCTOR_LOG_DIR)) return true;
    
    const files = fs.readdirSync(DOCTOR_LOG_DIR);
    let cleaned = 0;
    
    for (const file of files) {
      const filePath = path.join(DOCTOR_LOG_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        cleaned++;
      }
    }
    
    console.log(`🧀 Mouse cleaned up ${cleaned} old cheese crumbs (log files)`);
    return true;
  } catch (e) {
    console.error('🐭 Mouse dropped the cheese while cleaning up:', e);
    return false;
  }
}

function fixConfig(): boolean {
  try {
    const configPath = path.join(DATA_DIR, 'config.json');
    
    // If config is corrupted, create a new one with defaults
    const defaultConfig = {
      gatewayUrl: process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:8080',
      apiKey: process.env.OPENCLAW_API_KEY || '',
      createdAt: getTimestamp(),
    };
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('🐭 Mouse drew a new map with default directions');
    return true;
  } catch (e) {
    console.error('🐭 Mouse could not draw a new map:', e);
    return false;
  }
}

function fixPermissions(): boolean {
  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      execSync(`chmod -R 755 "${DATA_DIR}"`, { stdio: 'ignore' });
      console.log('🐭 Mouse unlocked the cheese storage');
      return true;
    }
    return false;
  } catch (e) {
    console.error('🐭 Mouse could not unlock the cheese storage:', e);
    return false;
  }
}

function fixGatewayRestart(): boolean {
  try {
    // Try to restart the gateway service
    execSync('openclaw gateway restart', { timeout: 30000 });
    console.log('🐭 Mouse had a quick nap and is feeling refreshed!');
    return true;
  } catch (e) {
    console.error('Failed to restart gateway:', e);
    return false;
  }
}

// Apply auto-fixes
function applyFixes(checks: CheckResult[]): FixResult[] {
  const fixes: FixResult[] = [];
  
  if (!DOCTOR_CONFIG.autoFixEnabled) {
    return fixes;
  }
  
  for (const check of checks) {
    if (check.status !== 'pass' && check.fixable) {
      let success = false;
      let message = '';
      
      switch (check.category) {
        case 'disk':
          if (check.name.includes('Log')) {
            success = fixLogCleanup();
            message = success ? 'Cleaned up old log files' : 'Failed to clean up logs';
          }
          break;
          
        case 'config':
          success = fixConfig();
          message = success ? 'Recreated configuration file' : 'Failed to fix configuration';
          break;
          
        case 'permissions':
          success = fixPermissions();
          message = success ? 'Fixed directory permissions' : 'Failed to fix permissions';
          break;
          
        case 'health':
          if (check.name.includes('Gateway')) {
            success = fixGatewayRestart();
            message = success ? 'Restarted gateway service' : 'Failed to restart gateway';
          }
          break;
      }
      
      fixes.push({
        checkName: check.name,
        success,
        message,
        timestamp: getTimestamp(),
      });
    }
  }
  
  return fixes;
}

// Main doctor run
export async function runDoctor(
  vmId: string = 'local',
  employeeId: string = 'system'
): Promise<DoctorCheck> {
  ensureDirectories();
  
  const state = loadState();
  const checks: CheckResult[] = [];
  
  console.log(`[Auto-Doctor] 🏥 Mouse is at the doctor's office for their check-up 👩‍⚕️🩻🩺`);
  
  // Run all checks
  checks.push(checkDependencies());
  checks.push(checkConfig());
  checks.push(checkDiskSpace());
  checks.push(checkGatewayHealth());
  checks.push(checkLogSizes());
  checks.push(checkNetwork());
  
  // Apply auto-fixes
  const fixesApplied = applyFixes(checks);
  
  // Determine overall status
  const hasCritical = checks.some(c => c.status === 'fail');
  const hasWarning = checks.some(c => c.status === 'warning');
  const status = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';
  
  // Create check result
  const doctorCheck: DoctorCheck = {
    id: generateId(),
    timestamp: getTimestamp(),
    vmId,
    employeeId,
    status,
    checks,
    fixesApplied,
  };
  
  // Save log
  const logFile = path.join(DOCTOR_LOG_DIR, `${doctorCheck.id}.json`);
  fs.writeFileSync(logFile, JSON.stringify(doctorCheck, null, 2));
  
  // Update state
  state.lastRun = getTimestamp();
  state.runs.unshift(doctorCheck);
  if (state.runs.length > 100) state.runs.pop(); // Keep last 100 runs
  state.totalFixesApplied += fixesApplied.filter(f => f.success).length;
  state.consecutiveFailures = status === 'critical' ? state.consecutiveFailures + 1 : 0;
  saveState(state);
  
  // Report to dashboard if configured
  await reportToDashboard(doctorCheck);
  
  console.log(`[Auto-Doctor] 🏥 Check-up complete! Mouse is ${status === 'healthy' ? 'healthy and happy 🐭✨' : status} (fixes: ${fixesApplied.length})`);
  
  return doctorCheck;
}

// Report to central dashboard
async function reportToDashboard(check: DoctorCheck): Promise<void> {
  const dashboardUrl = process.env.MAINTENANCE_DASHBOARD_URL;
  if (!dashboardUrl) return;
  
  try {
    const response = await fetch(`${dashboardUrl}/api/maintenance/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(check),
    });
    
    if (!response.ok) {
      console.error('Failed to report to dashboard:', response.statusText);
    }
  } catch (e) {
    console.error('Failed to report to dashboard:', e);
  }
}

// Schedule management
let doctorInterval: NodeJS.Timeout | null = null;

export function startDoctorSchedule(): void {
  if (doctorInterval) {
    console.log('[Auto-Doctor] 🐭 Mouse doctor is already on duty!');
    return;
  }
  
  console.log(`[Auto-Doctor] 🏥 Scheduled Mouse check-ups every ${DOCTOR_CONFIG.intervalHours} hours - keeping your digital employees healthy!`);
  
  // Run immediately
  runDoctor();
  
  // Schedule subsequent runs
  const intervalMs = DOCTOR_CONFIG.intervalHours * 60 * 60 * 1000;
  doctorInterval = setInterval(() => {
    runDoctor();
  }, intervalMs);
}

export function stopDoctorSchedule(): void {
  if (doctorInterval) {
    clearInterval(doctorInterval);
    doctorInterval = null;
    console.log('[Auto-Doctor] 🏥 Mouse doctor has left the building');
  }
}

export function getDoctorSchedule(): DoctorSchedule {
  const state = loadState();
  const nextRun = state.lastRun 
    ? new Date(new Date(state.lastRun).getTime() + DOCTOR_CONFIG.intervalHours * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + DOCTOR_CONFIG.intervalHours * 60 * 60 * 1000).toISOString();
  
  return {
    lastRun: state.lastRun,
    nextRun,
    intervalHours: DOCTOR_CONFIG.intervalHours,
    isRunning: doctorInterval !== null,
  };
}

// Get recent doctor runs
export function getDoctorRuns(limit: number = 10): DoctorCheck[] {
  const state = loadState();
  return state.runs.slice(0, limit);
}

// Get latest doctor check
export function getLatestDoctorCheck(): DoctorCheck | null {
  const state = loadState();
  return state.runs[0] || null;
}

// Get health score (0-100)
export function getHealthScore(): number {
  const latest = getLatestDoctorCheck();
  if (!latest) return 100;
  
  const passed = latest.checks.filter(c => c.status === 'pass').length;
  return Math.round((passed / latest.checks.length) * 100);
}

// Manual trigger
export async function runDoctorNow(vmId?: string, employeeId?: string): Promise<DoctorCheck> {
  return runDoctor(vmId, employeeId);
}

// Auto-start if configured
if (process.env.AUTO_DOCTOR_ENABLED === 'true') {
  startDoctorSchedule();
}
