/**
 * Self-Healing Worker
 * Watches for common errors and attempts automatic fixes:
 * - API key expired → alert customer
 * - Disk full → auto-cleanup old logs
 * - Memory full → restart service
 * - Network issues → retry with backoff
 * - Dependencies missing → auto-install
 * Attempts 3 auto-fixes before alerting
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Types
export interface ErrorPattern {
  id: string;
  pattern: RegExp;
  category: 'api_key' | 'disk' | 'memory' | 'network' | 'dependencies' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFixable: boolean;
  description: string;
}

export interface DetectedIssue {
  id: string;
  timestamp: string;
  pattern: ErrorPattern;
  source: string;
  context: string;
  status: 'detected' | 'fixing' | 'fixed' | 'failed' | 'alerted';
  fixAttempts: FixAttempt[];
  alertSent?: boolean;
}

export interface FixAttempt {
  timestamp: string;
  action: string;
  success: boolean;
  message: string;
}

export interface HealingStats {
  totalIssues: number;
  autoFixed: number;
  manualFixRequired: number;
  issuesByCategory: Record<string, number>;
  averageFixTime: number;
}

export interface HealingConfig {
  maxAutoFixAttempts: number;
  alertAfterFailures: number;
  retryBackoffMs: number;
  maxBackoffMs: number;
  logRetentionDays: number;
  memoryThresholdPercent: number;
  diskThresholdPercent: number;
}

// Configuration
const HEALING_CONFIG: HealingConfig = {
  maxAutoFixAttempts: 3,
  alertAfterFailures: 3,
  retryBackoffMs: 5000, // 5 seconds
  maxBackoffMs: 300000, // 5 minutes
  logRetentionDays: 7,
  memoryThresholdPercent: 90,
  diskThresholdPercent: 85,
};

// Error patterns to watch for
const ERROR_PATTERNS: ErrorPattern[] = [
  {
    id: 'api-key-expired',
    pattern: /api[_-]?key.*expired|token.*expired|unauthorized.*key|401.*api|authentication.*failed/i,
    category: 'api_key',
    severity: 'high',
    autoFixable: false,
    description: 'API key has expired or is invalid',
  },
  {
    id: 'api-key-missing',
    pattern: /api[_-]?key.*missing|no.*api[_-]?key|api[_-]?key.*required/i,
    category: 'api_key',
    severity: 'critical',
    autoFixable: false,
    description: 'API key is missing from configuration',
  },
  {
    id: 'disk-full',
    pattern: /disk.*full|no.*space.*left|enospc|write.*error.*disk/i,
    category: 'disk',
    severity: 'critical',
    autoFixable: true,
    description: 'Disk space is full or nearly full',
  },
  {
    id: 'memory-full',
    pattern: /out.*of.*memory|oom|memory.*exhausted|cannot.*allocate.*memory/i,
    category: 'memory',
    severity: 'critical',
    autoFixable: true,
    description: 'System memory is exhausted',
  },
  {
    id: 'network-timeout',
    pattern: /timeout|etimedout|request.*timeout|connection.*timed.*out/i,
    category: 'network',
    severity: 'medium',
    autoFixable: true,
    description: 'Network request timed out',
  },
  {
    id: 'network-unreachable',
    pattern: /network.*unreachable|enonet|no.*route.*to.*host|connection.*refused/i,
    category: 'network',
    severity: 'high',
    autoFixable: true,
    description: 'Network is unreachable or host refused connection',
  },
  {
    id: 'dependency-missing',
    pattern: /module.*not.*found|cannot.*find.*module|import.*error|package.*not.*found/i,
    category: 'dependencies',
    severity: 'high',
    autoFixable: true,
    description: 'Required dependency is missing',
  },
  {
    id: 'dependency-version',
    pattern: /version.*mismatch|incompatible.*version|requires.*version/i,
    category: 'dependencies',
    severity: 'medium',
    autoFixable: true,
    description: 'Dependency version mismatch',
  },
  {
    id: 'dns-failure',
    pattern: /getaddrinfo|dns.*lookup|name.*resolution/i,
    category: 'network',
    severity: 'high',
    autoFixable: true,
    description: 'DNS resolution failed',
  },
];

// Storage paths
const DATA_DIR = process.env.OPENCLAW_DATA_DIR || path.join(os.homedir(), '.openclaw');
const HEALING_STATE_FILE = path.join(DATA_DIR, 'self-healing-state.json');
const HEALING_LOG_DIR = path.join(DATA_DIR, 'logs', 'self-healing');

// State management
interface HealingState {
  issues: DetectedIssue[];
  stats: HealingStats;
  isWatching: boolean;
  lastCleanup: string | null;
}

function loadState(): HealingState {
  try {
    if (fs.existsSync(HEALING_STATE_FILE)) {
      return JSON.parse(fs.readFileSync(HEALING_STATE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load healing state:', e);
  }
  
  return {
    issues: [],
    stats: {
      totalIssues: 0,
      autoFixed: 0,
      manualFixRequired: 0,
      issuesByCategory: {},
      averageFixTime: 0,
    },
    isWatching: false,
    lastCleanup: null,
  };
}

function saveState(state: HealingState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(HEALING_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Failed to save healing state:', e);
  }
}

// Helper functions
function generateId(): string {
  return `heal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function ensureLogDirectory(): void {
  if (!fs.existsSync(HEALING_LOG_DIR)) {
    fs.mkdirSync(HEALING_LOG_DIR, { recursive: true });
  }
}

// Match error against patterns
function matchErrorPattern(error: string, context: string): ErrorPattern | null {
  const combined = `${error} ${context}`;
  
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.pattern.test(combined)) {
      return pattern;
    }
  }
  
  return null;
}

// Auto-fix implementations
async function fixDiskFull(): Promise<FixAttempt> {
  const startTime = Date.now();
  
  try {
    console.log('[Self-Healing] Attempting to free disk space...');
    
    // Clean up old logs
    const logDirs = [
      path.join(DATA_DIR, 'logs'),
      '/var/log/openclaw',
    ];
    
    let cleaned = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - HEALING_CONFIG.logRetentionDays);
    
    for (const logDir of logDirs) {
      if (!fs.existsSync(logDir)) continue;
      
      const files = fs.readdirSync(logDir);
      for (const file of files) {
        const filePath = path.join(logDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile() && stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            cleaned++;
          }
        } catch {}
      }
    }
    
    // Clean npm cache
    try {
      execSync('npm cache clean --force', { stdio: 'ignore', timeout: 30000 });
    } catch {}
    
    // Clean temp files
    const tempDirs = [os.tmpdir(), path.join(DATA_DIR, 'temp')];
    for (const tempDir of tempDirs) {
      if (!fs.existsSync(tempDir)) continue;
      
      try {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          if (file.includes('openclaw') || file.startsWith('tmp')) {
            const filePath = path.join(tempDir, file);
            try {
              const stats = fs.statSync(filePath);
              if (stats.isFile() && stats.mtime < cutoffDate) {
                fs.unlinkSync(filePath);
                cleaned++;
              }
            } catch {}
          }
        }
      } catch {}
    }
    
    return {
      timestamp: getTimestamp(),
      action: 'disk_cleanup',
      success: true,
      message: `🧀 Mouse cleaned up ${cleaned} old cheese crumbs and caches`,
    };
  } catch (e) {
    return {
      timestamp: getTimestamp(),
      action: 'disk_cleanup',
      success: false,
      message: e instanceof Error ? e.message : 'Disk cleanup failed',
    };
  }
}

async function fixMemoryFull(): Promise<FixAttempt> {
  try {
    console.log('[Self-Healing] Attempting to free memory...');
    
    // Restart OpenClaw service to free memory
    try {
      execSync('openclaw gateway restart', { timeout: 60000 });
      
      return {
        timestamp: getTimestamp(),
        action: 'service_restart',
        success: true,
        message: '😴 Mouse took a nap and is feeling refreshed - memory freed!',
      };
    } catch (e) {
      return {
        timestamp: getTimestamp(),
        action: 'service_restart',
        success: false,
        message: '🐭 Mouse is having trouble waking up from their nap',
      };
    }
  } catch (e) {
    return {
      timestamp: getTimestamp(),
      action: 'memory_cleanup',
      success: false,
      message: e instanceof Error ? e.message : 'Memory cleanup failed',
    };
  }
}

async function fixNetworkIssue(issue: DetectedIssue): Promise<FixAttempt> {
  const attemptCount = issue.fixAttempts.length;
  const backoffMs = Math.min(
    HEALING_CONFIG.retryBackoffMs * Math.pow(2, attemptCount),
    HEALING_CONFIG.maxBackoffMs
  );
  
  try {
    console.log(`[Self-Healing] Retrying after ${backoffMs}ms backoff...`);
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, backoffMs));
    
    // Test connectivity
    try {
      execSync('ping -c 1 -W 5 8.8.8.8', { stdio: 'ignore' });
      
      return {
        timestamp: getTimestamp(),
        action: 'network_retry',
        success: true,
        message: `🐭 Mouse found the cheese tunnel after ${backoffMs}ms - network recovered!`,
      };
    } catch {
      // Try DNS flush
      if (process.platform === 'darwin') {
        try {
          execSync('dscacheutil -flushcache', { stdio: 'ignore' });
        } catch {}
      } else if (process.platform === 'linux') {
        try {
          execSync('systemd-resolve --flush-caches', { stdio: 'ignore' });
        } catch {}
      }
      
      return {
        timestamp: getTimestamp(),
        action: 'network_retry',
        success: false,
        message: '🐭 Mouse cannot find the cheese tunnel - network still unreachable',
      };
    }
  } catch (e) {
    return {
      timestamp: getTimestamp(),
      action: 'network_retry',
      success: false,
      message: e instanceof Error ? e.message : 'Network fix failed',
    };
  }
}

async function fixDependencies(issue: DetectedIssue): Promise<FixAttempt> {
  try {
    console.log('[Self-Healing] Attempting to install missing dependencies...');
    
    // Extract module name from error context if possible
    const moduleMatch = issue.context.match(/['"`]([^'"`]+)['"`]/);
    const moduleName = moduleMatch ? moduleMatch[1] : null;
    
    if (moduleName) {
      try {
        execSync(`npm install ${moduleName}`, { 
          timeout: 120000,
          stdio: 'pipe'
        });
        
        return {
          timestamp: getTimestamp(),
          action: 'dependency_install',
          success: true,
          message: `🧀 Mouse found the missing cheese: ${moduleName}`,
        };
      } catch (e) {
        // Try global install
        try {
          execSync(`npm install -g ${moduleName}`, { 
            timeout: 120000,
            stdio: 'pipe'
          });
          
          return {
            timestamp: getTimestamp(),
            action: 'dependency_install_global',
            success: true,
            message: `🧀 Mouse found the missing cheese (global): ${moduleName}`,
          };
        } catch {}
      }
    }
    
    // Try reinstalling all dependencies
    try {
      execSync('npm install', { 
        timeout: 180000,
        stdio: 'pipe'
      });
      
      return {
        timestamp: getTimestamp(),
        action: 'dependency_reinstall',
        success: true,
        message: '🧀 Mouse restocked the entire cheese pantry!',
      };
    } catch (e) {
      return {
        timestamp: getTimestamp(),
        action: 'dependency_reinstall',
        success: false,
        message: '🐭 Mouse could not restock the cheese pantry',
      };
    }
  } catch (e) {
    return {
      timestamp: getTimestamp(),
      action: 'dependency_fix',
      success: false,
      message: e instanceof Error ? e.message : 'Dependency fix failed',
    };
  }
}

// Apply fix based on category
async function applyFix(issue: DetectedIssue): Promise<FixAttempt> {
  issue.status = 'fixing';
  
  switch (issue.pattern.category) {
    case 'disk':
      return fixDiskFull();
      
    case 'memory':
      return fixMemoryFull();
      
    case 'network':
      return fixNetworkIssue(issue);
      
    case 'dependencies':
      return fixDependencies(issue);
      
    default:
      return {
        timestamp: getTimestamp(),
        action: 'none',
        success: false,
        message: '🐭 Mouse is not trained to fix this type of problem',
      };
  }
}

// Send alert to customer
async function sendAlert(issue: DetectedIssue): Promise<void> {
  const alertUrl = process.env.MAINTENANCE_ALERT_URL;
  if (!alertUrl) {
    console.log(`[Self-Healing] ALERT: ${issue.pattern.description} - Manual intervention required`);
    return;
  }
  
  try {
    await fetch(alertUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'self_healing_alert',
        severity: issue.pattern.severity,
        issue: {
          id: issue.id,
          category: issue.pattern.category,
          description: issue.pattern.description,
          source: issue.source,
          context: issue.context,
          fixAttempts: issue.fixAttempts.length,
        },
        timestamp: getTimestamp(),
        message: `🚑 Calling the Mouse paramedics after ${HEALING_CONFIG.maxAutoFixAttempts} attempts. Your digital employee needs help!`,
      }),
    });
    
    issue.alertSent = true;
    console.log(`[Self-Healing] Alert sent for issue ${issue.id}`);
  } catch (e) {
    console.error('[Self-Healing] Failed to send alert:', e);
  }
}

// Process an error
export async function processError(
  error: string,
  source: string = 'system',
  context: string = ''
): Promise<DetectedIssue | null> {
  const pattern = matchErrorPattern(error, context);
  
  if (!pattern) {
    return null; // Not a recognized error pattern
  }
  
  console.log(`[Self-Healing] 🐭 Mouse detected ${pattern.category} issue: ${pattern.description}`);
  
  const state = loadState();
  
  // Check if similar issue already exists and is unresolved
  const existingIssue = state.issues.find(
    i => i.pattern.id === pattern.id && 
    !['fixed', 'alerted'].includes(i.status)
  );
  
  if (existingIssue) {
    // Continue fixing existing issue
    if (existingIssue.fixAttempts.length < HEALING_CONFIG.maxAutoFixAttempts) {
      const fixResult = await applyFix(existingIssue);
      existingIssue.fixAttempts.push(fixResult);
      
      if (fixResult.success) {
        existingIssue.status = 'fixed';
        state.stats.autoFixed++;
      } else if (existingIssue.fixAttempts.length >= HEALING_CONFIG.maxAutoFixAttempts) {
        existingIssue.status = 'failed';
        await sendAlert(existingIssue);
        existingIssue.status = 'alerted';
        state.stats.manualFixRequired++;
      }
      
      saveState(state);
      return existingIssue;
    }
    
    return existingIssue;
  }
  
  // Create new issue
  const issue: DetectedIssue = {
    id: generateId(),
    timestamp: getTimestamp(),
    pattern,
    source,
    context: `${error} ${context}`.trim(),
    status: 'detected',
    fixAttempts: [],
  };
  
  // For API key issues, alert immediately (not auto-fixable)
  if (pattern.category === 'api_key') {
    issue.status = 'alerted';
    await sendAlert(issue);
    state.stats.manualFixRequired++;
  } else if (pattern.autoFixable) {
    // Attempt auto-fix
    const fixResult = await applyFix(issue);
    issue.fixAttempts.push(fixResult);
    
    if (fixResult.success) {
      issue.status = 'fixed';
      state.stats.autoFixed++;
    } else {
      issue.status = 'failed';
    }
  } else {
    issue.status = 'alerted';
    await sendAlert(issue);
    state.stats.manualFixRequired++;
  }
  
  // Update stats
  state.stats.totalIssues++;
  state.stats.issuesByCategory[pattern.category] = 
    (state.stats.issuesByCategory[pattern.category] || 0) + 1;
  
  // Add to issues list
  state.issues.unshift(issue);
  if (state.issues.length > 100) {
    state.issues.pop();
  }
  
  saveState(state);
  
  // Log the issue
  ensureLogDirectory();
  const logFile = path.join(HEALING_LOG_DIR, `${issue.id}.json`);
  fs.writeFileSync(logFile, JSON.stringify(issue, null, 2));
  
  return issue;
}

// Watch logs for errors
async function watchLogs(): Promise<void> {
  const logFiles = [
    path.join(DATA_DIR, 'logs', 'openclaw.log'),
    path.join(DATA_DIR, 'logs', 'gateway.log'),
    '/var/log/openclaw/error.log',
  ];
  
  for (const logFile of logFiles) {
    if (!fs.existsSync(logFile)) continue;
    
    try {
      // Read last 100 lines
      const output = execSync(`tail -n 100 "${logFile}"`, { encoding: 'utf-8' });
      const lines = output.split('\n');
      
      for (const line of lines) {
        // Look for error indicators
        if (/error|fail|exception|crash/i.test(line)) {
          await processError(line, logFile);
        }
      }
    } catch (e) {
      // Ignore read errors
    }
  }
}

// Check system health proactively
async function checkSystemHealth(): Promise<void> {
  // Check disk space
  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      const output = execSync('df / | tail -1', { encoding: 'utf-8' });
      const parts = output.trim().split(/\s+/);
      const usedPercent = parseInt(parts[4].replace('%', ''));
      
      if (usedPercent > HEALING_CONFIG.diskThresholdPercent) {
        await processError(
          `disk full: ${usedPercent}% used`,
          'system_monitor',
          'disk space warning'
        );
      }
    }
  } catch {}
  
  // Check memory
  try {
    if (process.platform === 'darwin') {
      const output = execSync('vm_stat | grep "Pages active"', { encoding: 'utf-8' });
      // Parse memory info
    } else if (process.platform === 'linux') {
      const output = execSync('free | grep Mem', { encoding: 'utf-8' });
      const parts = output.trim().split(/\s+/);
      const total = parseInt(parts[1]);
      const used = parseInt(parts[2]);
      const usedPercent = (used / total) * 100;
      
      if (usedPercent > HEALING_CONFIG.memoryThresholdPercent) {
        await processError(
          `out of memory: ${usedPercent.toFixed(1)}% used`,
          'system_monitor',
          'memory warning'
        );
      }
    }
  } catch {}
}

// Monitoring
let watchInterval: NodeJS.Timeout | null = null;
let healthCheckInterval: NodeJS.Timeout | null = null;

// Start watching
export function startSelfHealing(): void {
  const state = loadState();
  
  if (state.isWatching) {
    console.log('[Self-Healing] 🐭 Mouse medic is already on duty!');
    return;
  }
  
  console.log('[Self-Healing] 🐭 Mouse medic is on duty, watching for problems!');
  
  state.isWatching = true;
  saveState(state);
  
  // Watch logs every 30 seconds
  watchInterval = setInterval(() => {
    watchLogs();
  }, 30000);
  
  // Check system health every 5 minutes
  healthCheckInterval = setInterval(() => {
    checkSystemHealth();
  }, 300000);
  
  // Initial checks
  watchLogs();
  checkSystemHealth();
}

// Stop watching
export function stopSelfHealing(): void {
  const state = loadState();
  
  if (watchInterval) {
    clearInterval(watchInterval);
    watchInterval = null;
  }
  
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
  
  state.isWatching = false;
  saveState(state);
  
  console.log('[Self-Healing] 🏥 Mouse medic has left the building');
}

// Get healing stats
export function getHealingStats(): HealingStats {
  const state = loadState();
  return state.stats;
}

// Get recent issues
export function getRecentIssues(limit: number = 20, status?: DetectedIssue['status']): DetectedIssue[] {
  const state = loadState();
  let issues = state.issues;
  
  if (status) {
    issues = issues.filter(i => i.status === status);
  }
  
  return issues.slice(0, limit);
}

// Get pending issues that need attention
export function getPendingIssues(): DetectedIssue[] {
  const state = loadState();
  return state.issues.filter(
    i => i.status === 'failed' || i.status === 'alerted'
  );
}

// Acknowledge/resolve an issue
export function resolveIssue(issueId: string): void {
  const state = loadState();
  const issue = state.issues.find(i => i.id === issueId);
  
  if (issue) {
    issue.status = 'fixed';
    saveState(state);
    console.log(`[Self-Healing] Issue ${issueId} resolved`);
  }
}

// Check if watching
export function isWatching(): boolean {
  const state = loadState();
  return state.isWatching;
}

// Configure healing
export function configureHealing(config: Partial<HealingConfig>): void {
  Object.assign(HEALING_CONFIG, config);
  console.log('[Self-Healing] 🐭 Mouse medic updated their training manual');
}

// Add custom error pattern
export function addErrorPattern(pattern: Omit<ErrorPattern, 'id'>): ErrorPattern {
  const newPattern: ErrorPattern = {
    ...pattern,
    id: `custom-${Date.now()}`,
  };
  ERROR_PATTERNS.push(newPattern);
  return newPattern;
}

// Auto-start if configured
if (process.env.SELF_HEALING_ENABLED === 'true') {
  startSelfHealing();
}
