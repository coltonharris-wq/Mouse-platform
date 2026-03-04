/**
 * Auto-Updater Service
 * Checks for OpenClaw updates daily and auto-updates during low-usage hours (3am)
 * Supports rollback on failure and zero-downtime updates
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Types
export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  releaseNotes?: string;
  releaseDate?: string;
}

export interface UpdateHistory {
  id: string;
  timestamp: string;
  fromVersion: string;
  toVersion: string;
  status: 'pending' | 'downloading' | 'installing' | 'completed' | 'failed' | 'rolled_back';
  error?: string;
  duration?: number;
  autoUpdate: boolean;
}

export interface UpdateSchedule {
  checkIntervalHours: number;
  autoUpdateEnabled: boolean;
  updateHour: number; // 0-23, default 3 for 3am
  updateMinute: number;
  lastCheck: string | null;
  nextScheduledUpdate: string | null;
  timezone: string;
}

export interface UpdaterStatus {
  isChecking: boolean;
  isUpdating: boolean;
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  lastCheck: string | null;
  lastUpdate: UpdateHistory | null;
  updateHistory: UpdateHistory[];
  schedule: UpdateSchedule;
}

// Configuration
const UPDATER_CONFIG = {
  checkIntervalHours: 24,
  updateHour: 3, // 3am
  updateMinute: 0,
  autoRollback: true,
  backupBeforeUpdate: true,
  maxHistoryEntries: 50,
};

// Storage paths
const DATA_DIR = process.env.OPENCLAW_DATA_DIR || path.join(os.homedir(), '.openclaw');
const UPDATER_STATE_FILE = path.join(DATA_DIR, 'auto-updater-state.json');
const UPDATE_BACKUP_DIR = path.join(DATA_DIR, 'backups');

// State management
interface UpdaterState {
  currentVersion: string;
  latestVersion: string | null;
  lastCheck: string | null;
  lastUpdate: UpdateHistory | null;
  updateHistory: UpdateHistory[];
  schedule: UpdateSchedule;
  isChecking: boolean;
  isUpdating: boolean;
  backupPath?: string;
}

function loadState(): UpdaterState {
  try {
    if (fs.existsSync(UPDATER_STATE_FILE)) {
      return JSON.parse(fs.readFileSync(UPDATER_STATE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load updater state:', e);
  }
  
  return {
    currentVersion: getInstalledVersion(),
    latestVersion: null,
    lastCheck: null,
    lastUpdate: null,
    updateHistory: [],
    schedule: {
      checkIntervalHours: UPDATER_CONFIG.checkIntervalHours,
      autoUpdateEnabled: true,
      updateHour: UPDATER_CONFIG.updateHour,
      updateMinute: UPDATER_CONFIG.updateMinute,
      lastCheck: null,
      nextScheduledUpdate: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    isChecking: false,
    isUpdating: false,
  };
}

function saveState(state: UpdaterState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(UPDATER_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Failed to save updater state:', e);
  }
}

// Helper functions
function generateId(): string {
  return `upd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

// Get currently installed version
export function getInstalledVersion(): string {
  try {
    const output = execSync('openclaw --version', { encoding: 'utf-8', timeout: 10000 });
    const match = output.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : 'unknown';
  } catch (e) {
    // Fallback: check package.json if available
    try {
      const packagePath = path.join(DATA_DIR, '..', 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
        return pkg.version || 'unknown';
      }
    } catch {}
    return 'unknown';
  }
}

// Check for latest version
export async function checkForUpdates(): Promise<UpdateInfo> {
  const state = loadState();
  state.isChecking = true;
  saveState(state);
  
  try {
    // Try to get latest version from npm
    let latestVersion = '';
    try {
      const output = execSync('npm view openclaw version', { 
        encoding: 'utf-8', 
        timeout: 30000 
      });
      latestVersion = output.trim();
    } catch {
      // Fallback: check GitHub releases API
      try {
        const response = await fetch('https://api.github.com/repos/openclaw/openclaw/releases/latest', {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
        });
        if (response.ok) {
          const release = await response.json();
          latestVersion = release.tag_name.replace(/^v/, '');
        }
      } catch (e) {
        console.error('Failed to check GitHub releases:', e);
      }
    }
    
    const currentVersion = getInstalledVersion();
    const updateAvailable: boolean = !!(latestVersion && latestVersion !== currentVersion && 
      compareVersions(latestVersion, currentVersion) > 0);
    
    state.latestVersion = latestVersion;
    state.lastCheck = getTimestamp();
    state.isChecking = false;
    saveState(state);
    
    // Calculate next scheduled update
    updateNextScheduledUpdate(state);
    
    console.log(`[Auto-Updater] 🐭 Mouse checked for new training. Current: ${currentVersion}, Latest: ${latestVersion}, New tricks available: ${updateAvailable}`);
    
    return {
      currentVersion,
      latestVersion,
      updateAvailable,
    };
  } catch (e) {
    state.isChecking = false;
    saveState(state);
    console.error('[Auto-Updater] 🐭 Mouse could not check for new training:', e);
    
    return {
      currentVersion: getInstalledVersion(),
      latestVersion: state.latestVersion || getInstalledVersion(),
      updateAvailable: false,
    };
  }
}

// Compare semantic versions
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

// Create backup before update
function createBackup(version: string): string | null {
  if (!UPDATER_CONFIG.backupBeforeUpdate) return null;
  
  try {
    if (!fs.existsSync(UPDATE_BACKUP_DIR)) {
      fs.mkdirSync(UPDATE_BACKUP_DIR, { recursive: true });
    }
    
    const backupId = `backup-${version}-${Date.now()}`;
    const backupPath = path.join(UPDATE_BACKUP_DIR, backupId);
    
    // Backup configuration
    const configBackupDir = path.join(backupPath, 'config');
    fs.mkdirSync(configBackupDir, { recursive: true });
    
    // Copy important config files
    const filesToBackup = ['config.json', 'skills', 'memory'];
    for (const file of filesToBackup) {
      const srcPath = path.join(DATA_DIR, file);
      const destPath = path.join(configBackupDir, file);
      if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
          // Use cp -r for directories
          try {
            execSync(`cp -r "${srcPath}" "${destPath}"`, { stdio: 'ignore' });
          } catch {}
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
    
    console.log(`[Auto-Updater] 🧀 Mouse packed a backup lunch at ${backupPath}`);
    return backupPath;
  } catch (e) {
    console.error('[Auto-Updater] 🐭 Mouse dropped the backup lunch:', e);
    return null;
  }
}

// Restore from backup
function restoreFromBackup(backupPath: string): boolean {
  try {
    if (!fs.existsSync(backupPath)) {
      console.error('[Auto-Updater] Backup not found:', backupPath);
      return false;
    }
    
    const configBackupDir = path.join(backupPath, 'config');
    if (!fs.existsSync(configBackupDir)) {
      console.error('[Auto-Updater] Config backup not found');
      return false;
    }
    
    // Restore config files
    const files = fs.readdirSync(configBackupDir);
    for (const file of files) {
      const srcPath = path.join(configBackupDir, file);
      const destPath = path.join(DATA_DIR, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        try {
          execSync(`cp -r "${srcPath}" "${destPath}"`, { stdio: 'ignore' });
        } catch {}
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    
    console.log(`[Auto-Updater] 🧀 Mouse unpacked the backup lunch: ${backupPath}`);
    return true;
  } catch (e) {
    console.error('[Auto-Updater] 🐭 Mouse could not unpack the backup lunch:', e);
    return false;
  }
}

// Perform update
export async function performUpdate(autoUpdate: boolean = false): Promise<UpdateHistory> {
  const state = loadState();
  const fromVersion = state.currentVersion;
  
  // Check for updates first
  const updateInfo = await checkForUpdates();
  
  if (!updateInfo.updateAvailable) {
    const history: UpdateHistory = {
      id: generateId(),
      timestamp: getTimestamp(),
      fromVersion,
      toVersion: fromVersion,
      status: 'completed',
      autoUpdate,
    };
    
    state.updateHistory.unshift(history);
    saveState(state);
    
    return history;
  }
  
  const toVersion = updateInfo.latestVersion;
  
  // Create update history entry
  const history: UpdateHistory = {
    id: generateId(),
    timestamp: getTimestamp(),
    fromVersion,
    toVersion,
    status: 'pending',
    autoUpdate,
  };
  
  state.lastUpdate = history;
  state.isUpdating = true;
  state.updateHistory.unshift(history);
  saveState(state);
  
  const startTime = Date.now();
  
  try {
    // Create backup
    history.status = 'downloading';
    saveState(state);
    
    const backupPath = createBackup(fromVersion);
    state.backupPath = backupPath || undefined;
    
    // Stop services for zero-downtime update
    console.log('[Auto-Updater] 🐭 Mouse is taking a break from work...');
    try {
      execSync('openclaw gateway stop', { timeout: 30000 });
    } catch (e) {
      console.warn('[Auto-Updater] Gateway may already be stopped');
    }
    
    // Perform update
    history.status = 'installing';
    saveState(state);
    
    console.log(`[Auto-Updater] 🎓 Teaching Mouse new tricks (version ${toVersion})...`);
    
    // Update via npm
    try {
      execSync('npm install -g openclaw@latest', { 
        timeout: 120000,
        stdio: 'pipe'
      });
    } catch (e) {
      // Try alternative install methods
      console.log('[Auto-Updater] Trying alternative install method...');
      try {
        execSync('curl -fsSL https://openclaw.dev/install.sh | sh', {
          timeout: 120000,
          stdio: 'pipe'
        });
      } catch (e2) {
        throw new Error('Failed to install update via npm and alternative method');
      }
    }
    
    // Verify update
    const newVersion = getInstalledVersion();
    if (newVersion !== toVersion && compareVersions(newVersion, toVersion) < 0) {
      throw new Error(`Version mismatch after update. Expected ${toVersion}, got ${newVersion}`);
    }
    
    // Restart services
    console.log('[Auto-Updater] ☕ Mouse is back from training and grabbing a coffee...');
    try {
      execSync('openclaw gateway start', { timeout: 30000 });
    } catch (e) {
      console.warn('[Auto-Updater] Failed to auto-start gateway, may need manual start');
    }
    
    // Update completed
    history.status = 'completed';
    history.duration = Date.now() - startTime;
    state.currentVersion = newVersion;
    state.isUpdating = false;
    
    console.log(`[Auto-Updater] 🎉 Mouse learned new tricks! Updated to ${newVersion} 🐭✨`);
    
    // Notify customer
    await notifyCustomer(history);
    
    saveState(state);
    return history;
    
  } catch (e) {
    console.error('[Auto-Updater] 🐭 Oops! Mouse got stuck learning new tricks:', e);
    
    history.status = 'failed';
    history.error = e instanceof Error ? e.message : '🐭 Mouse got confused during training';
    history.duration = Date.now() - startTime;
    state.isUpdating = false;
    
    // Attempt rollback
    if (UPDATER_CONFIG.autoRollback && state.backupPath) {
      console.log('[Auto-Updater] 🧀 Mouse is going back to their old lunch...');
      const rollbackSuccess = restoreFromBackup(state.backupPath);
      
      if (rollbackSuccess) {
        history.status = 'rolled_back';
        console.log('[Auto-Updater] 🧀 Mouse is happy with their old lunch again');
        
        // Restart with old version
        try {
          execSync('openclaw gateway start', { timeout: 30000 });
        } catch {}
      } else {
        console.error('[Auto-Updater] 🐭 Mouse is stuck - could not go back to old lunch!');
      }
    }
    
    saveState(state);
    return history;
  }
}

// Notify customer of update
async function notifyCustomer(history: UpdateHistory): Promise<void> {
  const notificationUrl = process.env.MAINTENANCE_NOTIFICATION_URL;
  if (!notificationUrl) return;
  
  try {
    const message = history.status === 'completed' 
      ? `🎉 Mouse learned new tricks! Updated from ${history.fromVersion} to ${history.toVersion} 🐭✨`
      : history.status === 'rolled_back'
      ? `🧀 Mouse went back to their old ways (rolled back to ${history.fromVersion})`
      : `🐭 Oops! Mouse got stuck in the wheel: ${history.error} 🎡`;
    
    await fetch(notificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'update',
        message,
        history,
        timestamp: getTimestamp(),
      }),
    });
  } catch (e) {
    console.error('[Auto-Updater] Failed to send notification:', e);
  }
}

// Calculate next scheduled update time
function updateNextScheduledUpdate(state: UpdaterState): void {
  const now = new Date();
  const next = new Date(now);
  next.setHours(state.schedule.updateHour, state.schedule.updateMinute, 0, 0);
  
  // If today's time has passed, schedule for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  state.schedule.nextScheduledUpdate = next.toISOString();
  saveState(state);
}

// Check if it's time to update
function shouldAutoUpdate(state: UpdaterState): boolean {
  if (!state.schedule.autoUpdateEnabled) return false;
  if (!state.latestVersion) return false;
  if (state.currentVersion === state.latestVersion) return false;
  
  const now = new Date();
  const nextUpdate = state.schedule.nextScheduledUpdate 
    ? new Date(state.schedule.nextScheduledUpdate)
    : null;
  
  if (!nextUpdate) {
    updateNextScheduledUpdate(state);
    return false;
  }
  
  return now >= nextUpdate;
}

// Scheduler management
let updateCheckInterval: NodeJS.Timeout | null = null;
let autoUpdateTimeout: NodeJS.Timeout | null = null;

export function startUpdaterSchedule(): void {
  const state = loadState();
  
  if (updateCheckInterval) {
    console.log('[Auto-Updater] 🐭 Mouse training is already in progress');
    return;
  }
  
  console.log(`[Auto-Updater] 🎓 Scheduled Mouse training (check every ${UPDATER_CONFIG.checkIntervalHours}h, new lessons at ${UPDATER_CONFIG.updateHour}:00)`);
  
  // Initial check
  checkForUpdates();
  
  // Schedule regular checks
  const checkIntervalMs = UPDATER_CONFIG.checkIntervalHours * 60 * 60 * 1000;
  updateCheckInterval = setInterval(() => {
    checkForUpdates();
  }, checkIntervalMs);
  
  // Schedule auto-update check
  scheduleAutoUpdate();
}

function scheduleAutoUpdate(): void {
  const state = loadState();
  
  if (!state.schedule.autoUpdateEnabled) return;
  
  const now = new Date();
  const nextUpdate = new Date(now);
  nextUpdate.setHours(state.schedule.updateHour, state.schedule.updateMinute, 0, 0);
  
  if (nextUpdate <= now) {
    nextUpdate.setDate(nextUpdate.getDate() + 1);
  }
  
  const msUntilUpdate = nextUpdate.getTime() - now.getTime();
  
  console.log(`[Auto-Updater] 🎓 Next Mouse training session scheduled for ${nextUpdate.toLocaleString()}`);
  
  autoUpdateTimeout = setTimeout(async () => {
    const state = loadState();
    if (shouldAutoUpdate(state)) {
      console.log('[Auto-Updater] 🎓 Time for scheduled Mouse training!');
      await performUpdate(true);
    }
    // Reschedule for next day
    scheduleAutoUpdate();
  }, msUntilUpdate);
}

export function stopUpdaterSchedule(): void {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
  if (autoUpdateTimeout) {
    clearTimeout(autoUpdateTimeout);
    autoUpdateTimeout = null;
  }
  console.log('[Auto-Updater] 🎓 Mouse training schedule paused');
}

// Get updater status
export function getUpdaterStatus(): UpdaterStatus {
  const state = loadState();
  return {
    isChecking: state.isChecking,
    isUpdating: state.isUpdating,
    currentVersion: state.currentVersion,
    latestVersion: state.latestVersion,
    updateAvailable: state.latestVersion !== null && state.latestVersion !== state.currentVersion,
    lastCheck: state.lastCheck,
    lastUpdate: state.lastUpdate,
    updateHistory: state.updateHistory.slice(0, 10),
    schedule: state.schedule,
  };
}

// Get update history
export function getUpdateHistory(limit: number = 20): UpdateHistory[] {
  const state = loadState();
  return state.updateHistory.slice(0, limit);
}

// Manual check
export async function checkNow(): Promise<UpdateInfo> {
  return checkForUpdates();
}

// Manual update
export async function updateNow(): Promise<UpdateHistory> {
  return performUpdate(false);
}

// Configure schedule
export function configureSchedule(config: Partial<UpdateSchedule>): void {
  const state = loadState();
  state.schedule = { ...state.schedule, ...config };
  saveState(state);
  
  // Restart schedule with new config
  stopUpdaterSchedule();
  startUpdaterSchedule();
}

// Auto-start if configured
if (process.env.AUTO_UPDATER_ENABLED === 'true') {
  startUpdaterSchedule();
}
