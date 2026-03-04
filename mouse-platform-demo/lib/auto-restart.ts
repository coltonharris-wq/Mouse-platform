/**
 * Auto-Restart Service
 * Monitors OpenClaw process and handles:
 * - Crash detection and auto-restart within 30 seconds
 * - Memory leak detection with graceful restart every 24h
 * - Unresponsive process handling with hard restart
 * - Comprehensive restart logging
 */

import { execSync, spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Types
export interface ProcessStatus {
  pid: number | null;
  status: 'running' | 'stopped' | 'crashed' | 'unresponsive' | 'restarting';
  uptime: number; // milliseconds
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  lastHeartbeat: string;
  startTime: string;
}

export interface RestartLog {
  id: string;
  timestamp: string;
  type: 'crash' | 'memory_leak' | 'unresponsive' | 'scheduled' | 'manual';
  previousUptime: number;
  previousPid: number | null;
  newPid: number | null;
  success: boolean;
  error?: string;
  memoryAtRestart?: number;
  triggeredBy: 'auto' | 'manual';
}

export interface RestartConfig {
  crashRestartDelay: number; // ms
  memoryThresholdMB: number;
  memoryCheckInterval: number; // ms
  gracefulRestartInterval: number; // ms (24h default)
  unresponsiveTimeout: number; // ms
  heartbeatInterval: number; // ms
  maxRestartsPerHour: number;
}

export interface RestartStats {
  totalRestarts: number;
  crashRestarts: number;
  memoryRestarts: number;
  unresponsiveRestarts: number;
  scheduledRestarts: number;
  failedRestarts: number;
  lastRestart: string | null;
  averageUptime: number;
}

// Configuration
const RESTART_CONFIG: RestartConfig = {
  crashRestartDelay: 30000, // 30 seconds
  memoryThresholdMB: 2048, // 2GB
  memoryCheckInterval: 60000, // 1 minute
  gracefulRestartInterval: 24 * 60 * 60 * 1000, // 24 hours
  unresponsiveTimeout: 60000, // 1 minute
  heartbeatInterval: 10000, // 10 seconds
  maxRestartsPerHour: 10,
};

// Storage paths
const DATA_DIR = process.env.OPENCLAW_DATA_DIR || path.join(os.homedir(), '.openclaw');
const RESTART_LOG_DIR = path.join(DATA_DIR, 'logs', 'restarts');
const RESTART_STATE_FILE = path.join(DATA_DIR, 'auto-restart-state.json');

// State management
interface RestartState {
  processStatus: ProcessStatus;
  restartLogs: RestartLog[];
  stats: RestartStats;
  restartHistory: number[]; // timestamps of recent restarts
  isMonitoring: boolean;
  lastGracefulRestart: string | null;
}

function loadState(): RestartState {
  try {
    if (fs.existsSync(RESTART_STATE_FILE)) {
      return JSON.parse(fs.readFileSync(RESTART_STATE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load restart state:', e);
  }
  
  return {
    processStatus: {
      pid: null,
      status: 'stopped',
      uptime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      lastHeartbeat: new Date(0).toISOString(),
      startTime: new Date(0).toISOString(),
    },
    restartLogs: [],
    stats: {
      totalRestarts: 0,
      crashRestarts: 0,
      memoryRestarts: 0,
      unresponsiveRestarts: 0,
      scheduledRestarts: 0,
      failedRestarts: 0,
      lastRestart: null,
      averageUptime: 0,
    },
    restartHistory: [],
    isMonitoring: false,
    lastGracefulRestart: null,
  };
}

function saveState(state: RestartState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(RESTART_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Failed to save restart state:', e);
  }
}

// Ensure log directory exists
function ensureLogDirectory(): void {
  if (!fs.existsSync(RESTART_LOG_DIR)) {
    fs.mkdirSync(RESTART_LOG_DIR, { recursive: true });
  }
}

// Helper functions
function generateId(): string {
  return `rst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

// Get OpenClaw process info
function getOpenClawProcess(): { pid: number | null; memoryMB: number; cpuPercent: number } | null {
  try {
    // Try different methods to find the process
    let output = '';
    
    if (process.platform === 'darwin' || process.platform === 'linux') {
      try {
        output = execSync('pgrep -f "openclaw gateway" | head -1', { encoding: 'utf-8' });
      } catch {
        // Try alternative
        try {
          output = execSync('ps aux | grep "openclaw" | grep -v grep | awk \'{print $2}\' | head -1', { 
            encoding: 'utf-8' 
          });
        } catch {}
      }
    }
    
    const pid = parseInt(output.trim());
    if (!pid || isNaN(pid)) return null;
    
    // Get process stats
    let memoryMB = 0;
    let cpuPercent = 0;
    
    if (process.platform === 'darwin') {
      try {
        const memOutput = execSync(`ps -o rss= -p ${pid}`, { encoding: 'utf-8' });
        memoryMB = parseInt(memOutput.trim()) / 1024;
        
        const cpuOutput = execSync(`ps -o %cpu= -p ${pid}`, { encoding: 'utf-8' });
        cpuPercent = parseFloat(cpuOutput.trim()) || 0;
      } catch {}
    } else if (process.platform === 'linux') {
      try {
        const memOutput = execSync(`cat /proc/${pid}/status | grep VmRSS | awk '{print $2}'`, { 
          encoding: 'utf-8' 
        });
        memoryMB = parseInt(memOutput.trim()) / 1024;
      } catch {}
    }
    
    return { pid, memoryMB, cpuPercent };
  } catch (e) {
    return null;
  }
}

// Check if process is responsive
async function checkProcessResponsive(pid: number): Promise<boolean> {
  try {
    // Check if process exists
    process.kill(pid, 0);
    
    // Check gateway health endpoint
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:8080';
    try {
      const response = await fetch(`${gatewayUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

// Log restart event
function logRestart(log: RestartLog): void {
  ensureLogDirectory();
  
  const logFile = path.join(RESTART_LOG_DIR, `${log.id}.json`);
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  
  const state = loadState();
  state.restartLogs.unshift(log);
  if (state.restartLogs.length > 100) {
    state.restartLogs.pop();
  }
  
  // Update stats
  state.stats.totalRestarts++;
  state.stats.lastRestart = log.timestamp;
  
  switch (log.type) {
    case 'crash':
      state.stats.crashRestarts++;
      break;
    case 'memory_leak':
      state.stats.memoryRestarts++;
      break;
    case 'unresponsive':
      state.stats.unresponsiveRestarts++;
      break;
    case 'scheduled':
      state.stats.scheduledRestarts++;
      break;
  }
  
  if (!log.success) {
    state.stats.failedRestarts++;
  }
  
  // Update uptime average
  if (log.previousUptime > 0) {
    const totalUptime = state.stats.averageUptime * (state.stats.totalRestarts - 1) + log.previousUptime;
    state.stats.averageUptime = totalUptime / state.stats.totalRestarts;
  }
  
  // Track restart history for rate limiting
  state.restartHistory.push(Date.now());
  // Keep only last hour
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  state.restartHistory = state.restartHistory.filter(t => t > oneHourAgo);
  
  saveState(state);
  
  console.log(`[Auto-Restart] Logged ${log.type} restart (success: ${log.success})`);
}

// Check restart rate limit
function checkRateLimit(): boolean {
  const state = loadState();
  return state.restartHistory.length < RESTART_CONFIG.maxRestartsPerHour;
}

// Perform restart
async function performRestart(
  type: RestartLog['type'],
  triggeredBy: 'auto' | 'manual' = 'auto'
): Promise<RestartLog> {
  const state = loadState();
  const oldStatus = state.processStatus;
  
  console.log(`[Auto-Restart] 😴 Mouse is taking a quick nap... 💤🛌 (${type})`);
  
  const log: RestartLog = {
    id: generateId(),
    timestamp: getTimestamp(),
    type,
    previousUptime: oldStatus.uptime,
    previousPid: oldStatus.pid,
    newPid: null,
    success: false,
    memoryAtRestart: oldStatus.memoryUsage,
    triggeredBy,
  };
  
  // Check rate limit
  if (!checkRateLimit() && triggeredBy === 'auto') {
    log.error = '🐭 Mouse has had too many naps today - needs rest!';
    logRestart(log);
    console.error('[Auto-Restart] 🐭 Mouse has had too many naps today, letting them rest');
    return log;
  }
  
  // Update status to restarting
  state.processStatus.status = 'restarting';
  saveState(state);
  
  try {
    // Stop existing process
    if (oldStatus.pid) {
      try {
        // Graceful shutdown first
        process.kill(oldStatus.pid, 'SIGTERM');
        
        // Wait for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check if still running
        try {
          process.kill(oldStatus.pid, 0);
          // Still running, force kill
          process.kill(oldStatus.pid, 'SIGKILL');
        } catch {
          // Already stopped
        }
      } catch (e) {
        // Process may already be gone
      }
    }
    
    // Start new process
    console.log('[Auto-Restart] ☕ Mouse is grabbing a coffee...');
    
    const child = spawn('openclaw', ['gateway', 'start'], {
      detached: true,
      stdio: 'ignore',
    });
    
    child.unref();
    
    // Wait a moment for process to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify new process started
    const newProcess = getOpenClawProcess();
    
    if (newProcess && newProcess.pid) {
      log.newPid = newProcess.pid;
      log.success = true;
      
      // Update process status
      state.processStatus = {
        pid: newProcess.pid,
        status: 'running',
        uptime: 0,
        memoryUsage: newProcess.memoryMB,
        cpuUsage: newProcess.cpuPercent,
        lastHeartbeat: getTimestamp(),
        startTime: getTimestamp(),
      };
      
      console.log(`[Auto-Restart] 🎉 Mouse is refreshed and back at it! 🐭✨ (PID: ${newProcess.pid})`);
    } else {
      log.error = '🐭 Mouse is still waking up...';
      state.processStatus.status = 'stopped';
      console.error('[Auto-Restart] 🐁 Mouse is having trouble waking up from their nap');
    }
    
  } catch (e) {
    log.error = e instanceof Error ? e.message : '🐭 Oops! Mouse got stuck in the wheel 🎡';
    state.processStatus.status = 'stopped';
    console.error('[Auto-Restart] 🐁 Mouse is having a bad fur day:', e);
  }
  
  logRestart(log);
  saveState(state);
  
  return log;
}

// Monitoring loops
let monitoringInterval: NodeJS.Timeout | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

// Main monitoring function
async function monitorProcess(): Promise<void> {
  const state = loadState();
  const processInfo = getOpenClawProcess();
  
  if (processInfo && processInfo.pid) {
    // Process is running
    const isResponsive = await checkProcessResponsive(processInfo.pid);
    
    if (!isResponsive) {
      // Process exists but not responsive
      if (state.processStatus.status === 'running') {
        console.error(`[Auto-Restart] 🐭 Mouse ${processInfo.pid} is not responding to treats`);
        state.processStatus.status = 'unresponsive';
        saveState(state);
        
        // Trigger restart
        await performRestart('unresponsive');
      }
    } else {
      // Update status
      const uptime = state.processStatus.startTime 
        ? Date.now() - new Date(state.processStatus.startTime).getTime()
        : 0;
      
      state.processStatus = {
        pid: processInfo.pid,
        status: 'running',
        uptime,
        memoryUsage: processInfo.memoryMB,
        cpuUsage: processInfo.cpuPercent,
        lastHeartbeat: getTimestamp(),
        startTime: state.processStatus.startTime || getTimestamp(),
      };
      
      // Check for memory leak
      if (processInfo.memoryMB > RESTART_CONFIG.memoryThresholdMB) {
        console.warn(`[Auto-Restart] 🐭 Mouse ate too much cheese! Memory: ${processInfo.memoryMB.toFixed(1)}MB`);
        await performRestart('memory_leak');
      }
      
      saveState(state);
    }
  } else {
    // Process not found - crashed
    if (state.processStatus.status !== 'stopped' && state.processStatus.status !== 'restarting') {
      console.error('[Auto-Restart] 🐭 Mouse has wandered off!');
      state.processStatus.status = 'crashed';
      saveState(state);
      
      // Wait configured delay before restart
      console.log(`[Auto-Restart] 😴 Mouse is taking a quick nap before returning... 💤`);
      await new Promise(resolve => setTimeout(resolve, RESTART_CONFIG.crashRestartDelay));
      
      await performRestart('crash');
    }
  }
}

// Scheduled graceful restart check
function checkScheduledRestart(): void {
  const state = loadState();
  
  if (!state.lastGracefulRestart) {
    state.lastGracefulRestart = getTimestamp();
    saveState(state);
    return;
  }
  
  const lastRestart = new Date(state.lastGracefulRestart).getTime();
  const now = Date.now();
  
  if (now - lastRestart >= RESTART_CONFIG.gracefulRestartInterval) {
    console.log('[Auto-Restart] 🐭 Mouse is at the spa for their daily grooming 💆‍♀️✨');
    performRestart('scheduled');
    state.lastGracefulRestart = getTimestamp();
    saveState(state);
  }
}

// Start monitoring
export function startRestartMonitor(): void {
  const state = loadState();
  
  if (state.isMonitoring) {
    console.log('[Auto-Restart] 🐭 Mouse watcher is already on duty');
    return;
  }
  
  console.log('[Auto-Restart] 🐭 Starting Mouse watcher - keeping an eye on your digital employees!');
  
  state.isMonitoring = true;
  saveState(state);
  
  // Initial check
  monitorProcess();
  
  // Set up monitoring interval
  monitoringInterval = setInterval(() => {
    monitorProcess();
    checkScheduledRestart();
  }, RESTART_CONFIG.memoryCheckInterval);
  
  // Set up heartbeat
  heartbeatInterval = setInterval(() => {
    const state = loadState();
    if (state.processStatus.status === 'running') {
      state.processStatus.lastHeartbeat = getTimestamp();
      saveState(state);
    }
  }, RESTART_CONFIG.heartbeatInterval);
}

// Stop monitoring
export function stopRestartMonitor(): void {
  const state = loadState();
  
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  
  state.isMonitoring = false;
  saveState(state);
  
  console.log('[Auto-Restart] ⏸️ Mouse watcher is taking a break ☕');
}

// Get current status
export function getProcessStatus(): ProcessStatus {
  const state = loadState();
  const processInfo = getOpenClawProcess();
  
  if (processInfo) {
    const uptime = state.processStatus.startTime 
      ? Date.now() - new Date(state.processStatus.startTime).getTime()
      : 0;
    
    return {
      pid: processInfo.pid,
      status: 'running',
      uptime,
      memoryUsage: processInfo.memoryMB,
      cpuUsage: processInfo.cpuPercent,
      lastHeartbeat: getTimestamp(),
      startTime: state.processStatus.startTime,
    };
  }
  
  return state.processStatus;
}

// Get restart logs
export function getRestartLogs(limit: number = 20): RestartLog[] {
  const state = loadState();
  return state.restartLogs.slice(0, limit);
}

// Get restart stats
export function getRestartStats(): RestartStats {
  const state = loadState();
  return state.stats;
}

// Manual restart
export async function restartNow(triggeredBy: 'auto' | 'manual' = 'manual'): Promise<RestartLog> {
  return performRestart('manual', triggeredBy);
}

// Manual trigger crash restart
export async function restartAfterCrash(): Promise<RestartLog> {
  return performRestart('crash', 'manual');
}

// Check if monitoring is active
export function isMonitoring(): boolean {
  const state = loadState();
  return state.isMonitoring;
}

// Configure restart settings
export function configureRestart(config: Partial<RestartConfig>): void {
  Object.assign(RESTART_CONFIG, config);
  console.log('[Auto-Restart] Configuration updated');
}

// Auto-start if configured
if (process.env.AUTO_RESTART_ENABLED === 'true') {
  startRestartMonitor();
}
