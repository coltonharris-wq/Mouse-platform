// Employee Health Monitor Service
// Monitors VM health, performs auto-recovery, and manages cost optimization

import type {
  HealthCheck,
  HealthAlert,
  RecoveryAction,
  DailyHealthReport,
  CostOptimizationMetrics,
  HealthMonitorConfig,
  HealthDashboardData,
  HealthStatus,
  VMStatus,
  AlertSeverity,
  SystemMetrics,
  APICallMetrics,
} from '@/app/types/health';

// Default configuration
const DEFAULT_CONFIG: HealthMonitorConfig = {
  pingInterval: 30000, // 30 seconds
  alertThresholds: {
    cpuWarning: 70,
    cpuCritical: 90,
    memoryWarning: 80,
    memoryCritical: 90,
    diskWarning: 80,
    diskCritical: 90,
    responseTimeWarning: 1000,
    responseTimeCritical: 3000,
  },
  autoRecovery: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 60000, // 1 minute
  },
  costOptimization: {
    enabled: true,
    idleTimeout: 7200000, // 2 hours
    terminationTimeout: 604800000, // 7 days
  },
  notifications: {
    emailEnabled: true,
    emailDownThreshold: 300000, // 5 minutes
    dailyReportEnabled: true,
  },
};

// In-memory storage (replace with database in production)
let healthChecks: Map<string, HealthCheck> = new Map();
let alerts: Map<string, HealthAlert> = new Map();
let recoveryActions: Map<string, RecoveryAction> = new Map();
let costMetrics: Map<string, CostOptimizationMetrics> = new Map();
let healthHistory: Map<string, { timestamp: string; status: HealthStatus }[]> = new Map();
let config: HealthMonitorConfig = DEFAULT_CONFIG;

// Simulated employee VM data - Our hard working mice! 🐭
const EMPLOYEES = [
  { id: 'emp-001', name: 'Alex', vmId: 'vm-alex-001', customerId: 'cust-001' },
  { id: 'emp-002', name: 'Jordan', vmId: 'vm-jordan-001', customerId: 'cust-001' },
  { id: 'emp-003', name: 'Morgan', vmId: 'vm-morgan-001', customerId: 'cust-001' },
  { id: 'emp-004', name: 'Riley', vmId: 'vm-riley-001', customerId: 'cust-002' },
  { id: 'emp-005', name: 'Casey', vmId: 'vm-casey-001', customerId: 'cust-006' },
];

// Helper functions
function generateId(): string {
  return `hc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getNow(): string {
  return new Date().toISOString();
}

// Simulate VM health check
async function checkVMHealth(vmId: string): Promise<{
  status: VMStatus;
  openclawStatus: 'running' | 'stopped' | 'error';
  metrics: SystemMetrics;
  apiMetrics: APICallMetrics;
}> {
  // In production, this would make actual API calls to the VM
  // Simulating realistic data for demo
  const now = getNow();
  
  // Simulate occasional issues for demo purposes
  const random = Math.random();
  let status: VMStatus = 'running';
  let openclawStatus: 'running' | 'stopped' | 'error' = 'running';
  
  if (vmId === 'vm-casey-001') {
    status = Math.random() > 0.7 ? 'error' : 'running';
    openclawStatus = status === 'error' ? 'error' : 'running';
  } else if (random > 0.95) {
    status = 'restarting';
  }
  
  return {
    status,
    openclawStatus,
    metrics: {
      cpu: Math.floor(Math.random() * 60) + (status === 'error' ? 30 : 10),
      memory: Math.floor(Math.random() * 70) + 20,
      disk: Math.floor(Math.random() * 50) + 30,
      timestamp: now,
    },
    apiMetrics: {
      total: Math.floor(Math.random() * 1000) + 100,
      successful: Math.floor(Math.random() * 950) + 90,
      failed: Math.floor(Math.random() * 10),
      averageResponseTime: Math.floor(Math.random() * 500) + 100,
      timestamp: now,
    },
  };
}

// Determine health status from metrics
function determineHealthStatus(
  vmStatus: VMStatus,
  openclawStatus: string,
  metrics: SystemMetrics,
  apiMetrics: APICallMetrics
): HealthStatus {
  if (vmStatus === 'error' || openclawStatus === 'error') return 'down';
  if (vmStatus === 'stopped') return 'paused';
  if (vmStatus === 'restarting') return 'warning';
  
  const { alertThresholds } = config;
  
  if (
    metrics.cpu >= alertThresholds.cpuCritical ||
    metrics.memory >= alertThresholds.memoryCritical ||
    metrics.disk >= alertThresholds.diskCritical ||
    apiMetrics.averageResponseTime >= alertThresholds.responseTimeCritical
  ) {
    return 'warning';
  }
  
  if (
    metrics.cpu >= alertThresholds.cpuWarning ||
    metrics.memory >= alertThresholds.memoryWarning ||
    metrics.disk >= alertThresholds.diskWarning ||
    apiMetrics.averageResponseTime >= alertThresholds.responseTimeWarning
  ) {
    return 'warning';
  }
  
  return 'healthy';
}

// Calculate uptime percentage from history
function calculateUptime(employeeId: string, hours: number = 24): number {
  const history = healthHistory.get(employeeId) || [];
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const relevantChecks = history.filter(h => h.timestamp >= cutoff);
  
  if (relevantChecks.length === 0) return 100;
  
  const upChecks = relevantChecks.filter(h => h.status === 'healthy' || h.status === 'warning').length;
  return Math.round((upChecks / relevantChecks.length) * 100);
}

// Create alert
function createAlert(
  employeeId: string,
  severity: AlertSeverity,
  message: string,
  metric: string,
  threshold: number,
  currentValue: number
): HealthAlert {
  const alert: HealthAlert = {
    id: generateId(),
    employeeId,
    severity,
    message,
    metric,
    threshold,
    currentValue,
    acknowledged: false,
    createdAt: getNow(),
  };
  
  alerts.set(alert.id, alert);
  return alert;
}

// Check for alert conditions
function checkAlertConditions(
  employeeId: string,
  metrics: SystemMetrics,
  apiMetrics: APICallMetrics
): HealthAlert[] {
  const newAlerts: HealthAlert[] = [];
  const { alertThresholds } = config;
  
  // CPU alerts
  if (metrics.cpu >= alertThresholds.cpuCritical) {
    newAlerts.push(
      createAlert(
        employeeId,
        'critical',
        `CPU usage is ${metrics.cpu.toFixed(1)}%, exceeding critical threshold of ${alertThresholds.cpuCritical}%`,
        'cpu',
        alertThresholds.cpuCritical,
        metrics.cpu
      )
    );
  } else if (metrics.cpu >= alertThresholds.cpuWarning) {
    newAlerts.push(
      createAlert(
        employeeId,
        'warning',
        `CPU usage is ${metrics.cpu.toFixed(1)}%, exceeding warning threshold of ${alertThresholds.cpuWarning}%`,
        'cpu',
        alertThresholds.cpuWarning,
        metrics.cpu
      )
    );
  }
  
  // Memory alerts
  if (metrics.memory >= alertThresholds.memoryCritical) {
    newAlerts.push(
      createAlert(
        employeeId,
        'critical',
        `Memory usage is ${metrics.memory.toFixed(1)}%, exceeding critical threshold`,
        'memory',
        alertThresholds.memoryCritical,
        metrics.memory
      )
    );
  }
  
  // Disk alerts
  if (metrics.disk >= alertThresholds.diskWarning) {
    newAlerts.push(
      createAlert(
        employeeId,
        'warning',
        `Disk usage is ${metrics.disk.toFixed(1)}%`,
        'disk',
        alertThresholds.diskWarning,
        metrics.disk
      )
    );
  }
  
  return newAlerts;
}

// Perform health check for single employee
export async function performHealthCheck(employeeId: string): Promise<HealthCheck> {
  const employee = EMPLOYEES.find(e => e.id === employeeId);
  if (!employee) throw new Error(`Employee ${employeeId} not found`);
  
  const vmHealth = await checkVMHealth(employee.vmId);
  const status = determineHealthStatus(
    vmHealth.status,
    vmHealth.openclawStatus,
    vmHealth.metrics,
    vmHealth.apiMetrics
  );
  
  // Update history
  const history = healthHistory.get(employeeId) || [];
  history.push({ timestamp: getNow(), status });
  // Keep last 24 hours of history (assuming 30s checks = 2880 entries)
  if (history.length > 3000) history.shift();
  healthHistory.set(employeeId, history);
  
  // Check for alerts
  const newAlerts = checkAlertConditions(employeeId, vmHealth.metrics, vmHealth.apiMetrics);
  
  // Get existing health check or create new
  const existing = healthChecks.get(employeeId);
  const allAlerts = [...(existing?.alerts || []), ...newAlerts];
  
  const healthCheck: HealthCheck = {
    id: existing?.id || generateId(),
    employeeId,
    employeeName: employee.name,
    vmId: employee.vmId,
    status,
    vmStatus: vmHealth.status,
    lastPing: getNow(),
    uptimePercentage: calculateUptime(employeeId),
    metrics: vmHealth.metrics,
    apiMetrics: vmHealth.apiMetrics,
    alerts: allAlerts.filter(a => !a.acknowledged),
    costSavings: existing?.costSavings || 0,
    isIdle: existing?.isIdle || false,
    idleSince: existing?.idleSince,
    createdAt: existing?.createdAt || getNow(),
    updatedAt: getNow(),
  };
  
  healthChecks.set(employeeId, healthCheck);
  
  // Trigger auto-recovery if needed
  if (config.autoRecovery.enabled && status === 'down') {
    await triggerAutoRecovery(employeeId, 'VM unresponsive');
  }
  
  return healthCheck;
}

// Perform health checks for all employees
export async function performAllHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];
  for (const employee of EMPLOYEES) {
    try {
      const check = await performHealthCheck(employee.id);
      checks.push(check);
    } catch (error) {
      console.error(`Failed to check health for ${employee.id}:`, error);
    }
  }
  return checks;
}

// Auto-recovery functions
export async function triggerAutoRecovery(
  employeeId: string,
  reason: string,
  action?: 'restart_vm' | 'restart_service' | 'spawn_replacement'
): Promise<RecoveryAction> {
  const recovery: RecoveryAction = {
    id: generateId(),
    employeeId,
    action: action || 'restart_vm',
    status: 'pending',
    reason,
    startedAt: getNow(),
  };
  
  recoveryActions.set(recovery.id, recovery);
  
  // Simulate recovery action
  setTimeout(() => {
    recovery.status = 'in_progress';
    
    setTimeout(() => {
      recovery.status = 'completed';
      recovery.completedAt = getNow();
    }, 30000); // 30 second recovery time
  }, 1000);
  
  return recovery;
}

// VM control functions
export async function restartVM(employeeId: string): Promise<void> {
  const healthCheck = healthChecks.get(employeeId);
  if (!healthCheck) throw new Error('Employee not found');
  
  await triggerAutoRecovery(employeeId, 'Manual VM restart', 'restart_vm');
}

export async function restartOpenClawService(employeeId: string): Promise<void> {
  await triggerAutoRecovery(employeeId, 'Mouse AI service restart', 'restart_service');
}

export async function spawnReplacementVM(employeeId: string): Promise<void> {
  await triggerAutoRecovery(employeeId, 'Spawning replacement VM', 'spawn_replacement');
}

export async function migrateData(sourceEmployeeId: string, targetEmployeeId: string): Promise<void> {
  const recovery: RecoveryAction = {
    id: generateId(),
    employeeId: sourceEmployeeId,
    action: 'migrate_data',
    status: 'in_progress',
    reason: `Migrating data to ${targetEmployeeId}`,
    startedAt: getNow(),
  };
  
  recoveryActions.set(recovery.id, recovery);
  
  // Simulate migration
  setTimeout(() => {
    recovery.status = 'completed';
    recovery.completedAt = getNow();
  }, 60000);
}

// Pause/Resume for cost optimization
export async function pauseEmployee(employeeId: string): Promise<void> {
  const healthCheck = healthChecks.get(employeeId);
  if (!healthCheck) return;
  
  healthCheck.isIdle = true;
  healthCheck.idleSince = getNow();
  healthCheck.status = 'paused';
  healthCheck.vmStatus = 'stopped';
  
  // Calculate cost savings (approx $0.50/hour for a small VM)
  healthCheck.costSavings += 0.5;
  
  healthChecks.set(employeeId, healthCheck);
}

export async function resumeEmployee(employeeId: string): Promise<void> {
  const healthCheck = healthChecks.get(employeeId);
  if (!healthCheck) return;
  
  healthCheck.isIdle = false;
  healthCheck.idleSince = undefined;
  healthCheck.status = 'healthy';
  healthCheck.vmStatus = 'running';
  
  healthChecks.set(employeeId, healthCheck);
}

// Cost optimization check
export async function checkIdleEmployees(): Promise<void> {
  if (!config.costOptimization.enabled) return;
  
  const now = Date.now();
  const idleTimeout = config.costOptimization.idleTimeout;
  
  for (const [employeeId, healthCheck] of healthChecks) {
    if (healthCheck.status === 'healthy' && !healthCheck.isIdle) {
      // Check if employee has been idle for too long
      const lastActivity = new Date(healthCheck.apiMetrics.timestamp).getTime();
      const idleTime = now - lastActivity;
      
      if (idleTime > idleTimeout) {
        await pauseEmployee(employeeId);
        
        // Update cost metrics
        const metrics = costMetrics.get(employeeId) || {
          employeeId,
          autoPausedCount: 0,
          autoResumedCount: 0,
          idleHoursSaved: 0,
          estimatedSavings: 0,
          lastActivity: healthCheck.apiMetrics.timestamp,
        };
        
        metrics.autoPausedCount++;
        metrics.idleHoursSaved += 2; // 2 hour blocks
        metrics.estimatedSavings += 1.0; // $1 per 2 hours
        costMetrics.set(employeeId, metrics);
      }
    }
  }
}

// Alert management
export async function acknowledgeAlert(alertId: string): Promise<void> {
  const alert = alerts.get(alertId);
  if (alert) {
    alert.acknowledged = true;
    alerts.set(alertId, alert);
  }
}

export async function resolveAlert(alertId: string): Promise<void> {
  const alert = alerts.get(alertId);
  if (alert) {
    alert.acknowledged = true;
    alert.resolvedAt = getNow();
    alerts.set(alertId, alert);
  }
}

// Get all active alerts
export function getActiveAlerts(): HealthAlert[] {
  return Array.from(alerts.values()).filter(a => !a.acknowledged);
}

// Get recent recovery actions
export function getRecentRecoveries(limit: number = 10): RecoveryAction[] {
  return Array.from(recoveryActions.values())
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}

// Get cost optimization metrics
export function getCostMetrics(): CostOptimizationMetrics[] {
  return Array.from(costMetrics.values());
}

// Generate daily health report
export function generateDailyReport(): DailyHealthReport {
  const allChecks = Array.from(healthChecks.values());
  const now = new Date();
  
  const healthyCount = allChecks.filter(h => h.status === 'healthy').length;
  const warningCount = allChecks.filter(h => h.status === 'warning').length;
  const downCount = allChecks.filter(h => h.status === 'down').length;
  const pausedCount = allChecks.filter(h => h.status === 'paused').length;
  
  // Calculate total uptime
  const totalUptime = allChecks.reduce((sum, h) => sum + h.uptimePercentage, 0) / (allChecks.length || 1);
  
  // Count alerts from last 24 hours
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const recentAlerts = Array.from(alerts.values()).filter(a => a.createdAt >= cutoff);
  
  // Calculate cost savings
  const costSavings = allChecks.reduce((sum, h) => sum + h.costSavings, 0);
  
  // Top issues
  const issueCount: Record<string, number> = {};
  recentAlerts.forEach(a => {
    issueCount[a.metric] = (issueCount[a.metric] || 0) + 1;
  });
  
  const topIssues = Object.entries(issueCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([metric, count]) => `${metric}: ${count} alerts`);
  
  return {
    date: now.toISOString().split('T')[0],
    totalEmployees: allChecks.length,
    healthyCount,
    warningCount,
    downCount,
    pausedCount,
    totalUptime: Math.round(totalUptime),
    totalAlerts: recentAlerts.length,
    costSavings: Math.round(costSavings * 100) / 100,
    topIssues,
  };
}

// Get dashboard data
export function getDashboardData(): HealthDashboardData {
  const allChecks = Array.from(healthChecks.values());
  
  const healthy = allChecks.filter(h => h.status === 'healthy').length;
  const warning = allChecks.filter(h => h.status === 'warning').length;
  const down = allChecks.filter(h => h.status === 'down').length;
  const paused = allChecks.filter(h => h.status === 'paused').length;
  
  let overallStatus: HealthStatus = 'healthy';
  if (down > 0) overallStatus = 'down';
  else if (warning > 0) overallStatus = 'warning';
  
  const totalUptime = allChecks.reduce((sum, h) => sum + h.uptimePercentage, 0) / (allChecks.length || 1);
  const costSavingsTotal = allChecks.reduce((sum, h) => sum + h.costSavings, 0);
  
  return {
    overallStatus,
    totalEmployees: allChecks.length,
    healthy,
    warning,
    down,
    paused,
    uptimePercentage: Math.round(totalUptime),
    activeAlerts: getActiveAlerts(),
    recentRecoveries: getRecentRecoveries(),
    costSavingsTotal: Math.round(costSavingsTotal * 100) / 100,
    employees: allChecks,
  };
}

// Get health check for specific employee
export function getEmployeeHealth(employeeId: string): HealthCheck | undefined {
  return healthChecks.get(employeeId);
}

// Get all health checks
export function getAllHealthChecks(): HealthCheck[] {
  return Array.from(healthChecks.values());
}

// Update configuration
export function updateConfig(newConfig: Partial<HealthMonitorConfig>): void {
  config = { ...config, ...newConfig };
}

// Get current configuration
export function getConfig(): HealthMonitorConfig {
  return config;
}

// Start continuous monitoring
export function startMonitoring(): void {
  // Initial check
  performAllHealthChecks();
  
  // Set up interval
  setInterval(() => {
    performAllHealthChecks();
  }, config.pingInterval);
  
  // Cost optimization check every 5 minutes
  setInterval(() => {
    checkIdleEmployees();
  }, 300000);
}

// Initialize on module load if in browser
if (typeof window !== 'undefined') {
  startMonitoring();
}
