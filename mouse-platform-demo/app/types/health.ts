// Employee Health Monitoring Types

export type HealthStatus = 'healthy' | 'warning' | 'down' | 'paused';
export type VMStatus = 'running' | 'stopped' | 'restarting' | 'error';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  timestamp: string;
}

export interface APICallMetrics {
  total: number;
  successful: number;
  failed: number;
  averageResponseTime: number;
  timestamp: string;
}

export interface HealthCheck {
  id: string;
  employeeId: string;
  employeeName: string;
  vmId: string;
  status: HealthStatus;
  vmStatus: VMStatus;
  lastPing: string;
  uptimePercentage: number;
  metrics: SystemMetrics;
  apiMetrics: APICallMetrics;
  alerts: HealthAlert[];
  costSavings: number;
  isIdle: boolean;
  idleSince?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthAlert {
  id: string;
  employeeId: string;
  severity: AlertSeverity;
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  acknowledged: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface RecoveryAction {
  id: string;
  employeeId: string;
  action: 'restart_vm' | 'restart_service' | 'spawn_replacement' | 'migrate_data';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  reason: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface DailyHealthReport {
  date: string;
  totalEmployees: number;
  healthyCount: number;
  warningCount: number;
  downCount: number;
  pausedCount: number;
  totalUptime: number;
  totalAlerts: number;
  costSavings: number;
  topIssues: string[];
}

export interface CostOptimizationMetrics {
  employeeId: string;
  autoPausedCount: number;
  autoResumedCount: number;
  idleHoursSaved: number;
  estimatedSavings: number;
  lastActivity: string;
}

export interface HealthMonitorConfig {
  pingInterval: number;
  alertThresholds: {
    cpuWarning: number;
    cpuCritical: number;
    memoryWarning: number;
    memoryCritical: number;
    diskWarning: number;
    diskCritical: number;
    responseTimeWarning: number;
    responseTimeCritical: number;
  };
  autoRecovery: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
  };
  costOptimization: {
    enabled: boolean;
    idleTimeout: number;
    terminationTimeout: number;
  };
  notifications: {
    emailEnabled: boolean;
    emailDownThreshold: number;
    dailyReportEnabled: boolean;
  };
}

// Health check history for trend analysis
export interface HealthCheckHistory {
  employeeId: string;
  checks: {
    timestamp: string;
    status: HealthStatus;
    cpu: number;
    memory: number;
    disk: number;
    responseTime: number;
  }[];
}

// Aggregated dashboard data
export interface HealthDashboardData {
  overallStatus: HealthStatus;
  totalEmployees: number;
  healthy: number;
  warning: number;
  down: number;
  paused: number;
  uptimePercentage: number;
  activeAlerts: HealthAlert[];
  recentRecoveries: RecoveryAction[];
  costSavingsTotal: number;
  employees: HealthCheck[];
}
