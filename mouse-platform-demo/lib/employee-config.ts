// Employee Configuration System
// Generates IDs, roles, permissions, schedules, and integrations

export type EmployeeRole = 
  | 'sales'
  | 'support'
  | 'research'
  | 'data-entry'
  | 'content-writer'
  | 'social-media'
  | 'general'
  | 'developer'
  | 'analyst';

export type Permission = 
  | 'read:emails'
  | 'write:emails'
  | 'read:calendar'
  | 'write:calendar'
  | 'read:contacts'
  | 'write:contacts'
  | 'read:crm'
  | 'write:crm'
  | 'read:sheets'
  | 'write:sheets'
  | 'read:social'
  | 'write:social'
  | 'send:messages'
  | 'browse:web'
  | 'code:execute'
  | 'file:access';

export interface EmployeePermissions {
  allowed: Permission[];
  restricted: Permission[];
}

export interface WorkSchedule {
  timezone: string;
  workHours: {
    start: string; // HH:mm format
    end: string;
  };
  workDays: number[]; // 0 = Sunday, 6 = Saturday
  lunchBreak?: {
    start: string;
    end: string;
  };
}

export interface IntegrationConfig {
  gmail?: {
    enabled: boolean;
    labels?: string[];
    autoReply?: boolean;
  };
  calendar?: {
    enabled: boolean;
    createEvents?: boolean;
    checkAvailability?: boolean;
  };
  notion?: {
    enabled: boolean;
    databases?: string[];
  };
  telegram?: {
    enabled: boolean;
    botToken?: string;
    chatId?: string;
  };
  slack?: {
    enabled: boolean;
    workspace?: string;
    channels?: string[];
  };
  hubspot?: {
    enabled: boolean;
    pipelineId?: string;
  };
  salesforce?: {
    enabled: boolean;
    objects?: string[];
  };
  sheets?: {
    enabled: boolean;
    spreadsheetIds?: string[];
  };
}

export interface EmployeeConfiguration {
  employeeId: string;
  customerId: string;
  role: EmployeeRole;
  vmId: string;
  vmUrl: string;
  permissions: EmployeePermissions;
  schedule: WorkSchedule;
  integrations: IntegrationConfig;
  settings: {
    responseTime: number; // seconds
    maxConcurrentTasks: number;
    autoEscalation: boolean;
    workingLanguage: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeConfigOptions {
  employeeId: string;
  customerId: string;
  role: EmployeeRole;
  vmId: string;
  vmUrl: string;
  integrations?: string[];
  schedule?: WorkSchedule;
}

// Role-based permission presets
const ROLE_PERMISSIONS: Record<EmployeeRole, EmployeePermissions> = {
  sales: {
    allowed: [
      'read:emails', 'write:emails',
      'read:calendar', 'write:calendar',
      'read:contacts', 'write:contacts',
      'read:crm', 'write:crm',
      'send:messages',
      'browse:web',
      'file:access',
    ],
    restricted: ['code:execute', 'read:social', 'write:social'],
  },
  support: {
    allowed: [
      'read:emails', 'write:emails',
      'read:calendar',
      'read:contacts',
      'read:crm', 'write:crm',
      'send:messages',
      'browse:web',
      'file:access',
    ],
    restricted: ['code:execute', 'write:calendar', 'read:social', 'write:social'],
  },
  research: {
    allowed: [
      'read:emails',
      'browse:web',
      'read:sheets', 'write:sheets',
      'file:access',
      'code:execute',
    ],
    restricted: ['write:emails', 'send:messages', 'write:crm', 'write:social'],
  },
  'data-entry': {
    allowed: [
      'read:sheets', 'write:sheets',
      'read:crm', 'write:crm',
      'file:access',
    ],
    restricted: ['send:messages', 'browse:web', 'code:execute', 'write:emails'],
  },
  'content-writer': {
    allowed: [
      'read:emails',
      'browse:web',
      'write:social',
      'file:access',
    ],
    restricted: ['code:execute', 'write:emails', 'write:crm', 'read:crm'],
  },
  'social-media': {
    allowed: [
      'read:social', 'write:social',
      'browse:web',
      'file:access',
      'send:messages',
    ],
    restricted: ['code:execute', 'write:emails', 'write:crm', 'read:emails'],
  },
  general: {
    allowed: [
      'read:emails', 'write:emails',
      'read:calendar', 'write:calendar',
      'browse:web',
      'file:access',
    ],
    restricted: ['code:execute', 'write:crm'],
  },
  developer: {
    allowed: [
      'read:emails', 'write:emails',
      'browse:web',
      'code:execute',
      'file:access',
      'read:sheets', 'write:sheets',
    ],
    restricted: ['write:crm', 'send:messages'],
  },
  analyst: {
    allowed: [
      'read:emails',
      'browse:web',
      'code:execute',
      'file:access',
      'read:sheets', 'write:sheets',
      'read:crm',
    ],
    restricted: ['write:emails', 'send:messages', 'write:crm'],
  },
};

// Role-based integration presets
const ROLE_INTEGRATIONS: Record<EmployeeRole, string[]> = {
  sales: ['gmail', 'calendar', 'crm', 'telegram'],
  support: ['gmail', 'calendar', 'crm', 'telegram'],
  research: ['gmail', 'sheets', 'notion'],
  'data-entry': ['sheets', 'crm'],
  'content-writer': ['gmail', 'sheets', 'social'],
  'social-media': ['social', 'gmail', 'telegram'],
  general: ['gmail', 'calendar'],
  developer: ['gmail', 'sheets', 'notion'],
  analyst: ['gmail', 'sheets', 'crm', 'notion'],
};

// Default work schedule
const DEFAULT_SCHEDULE: WorkSchedule = {
  timezone: 'America/New_York',
  workHours: { start: '09:00', end: '17:00' },
  workDays: [1, 2, 3, 4, 5], // Monday - Friday
  lunchBreak: { start: '12:00', end: '13:00' },
};

// Role-based settings
const ROLE_SETTINGS: Record<EmployeeRole, EmployeeConfiguration['settings']> = {
  sales: {
    responseTime: 60,
    maxConcurrentTasks: 5,
    autoEscalation: true,
    workingLanguage: 'en',
    timezone: 'America/New_York',
  },
  support: {
    responseTime: 120,
    maxConcurrentTasks: 8,
    autoEscalation: true,
    workingLanguage: 'en',
    timezone: 'America/New_York',
  },
  research: {
    responseTime: 300,
    maxConcurrentTasks: 3,
    autoEscalation: false,
    workingLanguage: 'en',
    timezone: 'America/New_York',
  },
  'data-entry': {
    responseTime: 60,
    maxConcurrentTasks: 10,
    autoEscalation: false,
    workingLanguage: 'en',
    timezone: 'America/New_York',
  },
  'content-writer': {
    responseTime: 600,
    maxConcurrentTasks: 2,
    autoEscalation: false,
    workingLanguage: 'en',
    timezone: 'America/New_York',
  },
  'social-media': {
    responseTime: 300,
    maxConcurrentTasks: 4,
    autoEscalation: false,
    workingLanguage: 'en',
    timezone: 'America/New_York',
  },
  general: {
    responseTime: 120,
    maxConcurrentTasks: 5,
    autoEscalation: false,
    workingLanguage: 'en',
    timezone: 'America/New_York',
  },
  developer: {
    responseTime: 600,
    maxConcurrentTasks: 3,
    autoEscalation: false,
    workingLanguage: 'en',
    timezone: 'America/New_York',
  },
  analyst: {
    responseTime: 300,
    maxConcurrentTasks: 4,
    autoEscalation: false,
    workingLanguage: 'en',
    timezone: 'America/New_York',
  },
};

// Integration defaults
const DEFAULT_INTEGRATIONS: IntegrationConfig = {
  gmail: { enabled: true },
  calendar: { enabled: true, createEvents: true, checkAvailability: true },
  notion: { enabled: false },
  telegram: { enabled: false },
  slack: { enabled: false },
  hubspot: { enabled: false },
  salesforce: { enabled: false },
  sheets: { enabled: false },
};

/**
 * Generate a unique employee ID
 */
export function generateEmployeeId(role: EmployeeRole): string {
  const prefix = role.substring(0, 3).toLowerCase();
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Employee Configuration Manager
 */
export class EmployeeConfig {
  private config: EmployeeConfiguration;
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(options: EmployeeConfigOptions) {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

    const roleIntegrations = ROLE_INTEGRATIONS[options.role];
    const integrationConfig = this.buildIntegrationConfig(roleIntegrations, options.integrations);

    this.config = {
      employeeId: options.employeeId,
      customerId: options.customerId,
      role: options.role,
      vmId: options.vmId,
      vmUrl: options.vmUrl,
      permissions: ROLE_PERMISSIONS[options.role],
      schedule: options.schedule || DEFAULT_SCHEDULE,
      integrations: integrationConfig,
      settings: ROLE_SETTINGS[options.role],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Save configuration to database
   */
  async save(): Promise<void> {
    // Save to employee_configs table
    const response = await fetch(`${this.supabaseUrl}/rest/v1/employee_configs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'apikey': this.supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        employee_id: this.config.employeeId,
        customer_id: this.config.customerId,
        role: this.config.role,
        permissions: this.config.permissions,
        schedule: this.config.schedule,
        integrations: this.config.integrations,
        settings: this.config.settings,
        created_at: this.config.createdAt.toISOString(),
        updated_at: this.config.updatedAt.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save config: ${await response.text()}`);
    }
  }

  /**
   * Load configuration from database
   */
  static async load(employeeId: string): Promise<EmployeeConfiguration> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

    const response = await fetch(`${supabaseUrl}/rest/v1/employee_configs?employee_id=eq.${employeeId}&limit=1`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load config');
    }

    const records = await response.json();
    
    if (records.length === 0) {
      throw new Error('Configuration not found');
    }

    const record = records[0];
    
    return {
      employeeId: record.employee_id,
      customerId: record.customer_id,
      role: record.role,
      vmId: record.vm_id,
      vmUrl: record.vm_url,
      permissions: record.permissions,
      schedule: record.schedule,
      integrations: record.integrations,
      settings: record.settings,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }

  /**
   * Update configuration
   */
  async update(updates: Partial<EmployeeConfiguration>): Promise<void> {
    this.config = { ...this.config, ...updates, updatedAt: new Date() };

    const response = await fetch(`${this.supabaseUrl}/rest/v1/employee_configs?employee_id=eq.${this.config.employeeId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'apikey': this.supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        role: this.config.role,
        permissions: this.config.permissions,
        schedule: this.config.schedule,
        integrations: this.config.integrations,
        settings: this.config.settings,
        updated_at: this.config.updatedAt.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update config: ${await response.text()}`);
    }
  }

  /**
   * Generate environment variables for the VM
   */
  generateEnvVars(): Record<string, string> {
    return {
      EMPLOYEE_ID: this.config.employeeId,
      EMPLOYEE_ROLE: this.config.role,
      CUSTOMER_ID: this.config.customerId,
      VM_ID: this.config.vmId,
      WORKING_LANGUAGE: this.config.settings.workingLanguage,
      TIMEZONE: this.config.settings.timezone,
      RESPONSE_TIME_TARGET: this.config.settings.responseTime.toString(),
      MAX_CONCURRENT_TASKS: this.config.settings.maxConcurrentTasks.toString(),
      AUTO_ESCALATION: this.config.settings.autoEscalation.toString(),
      PERMISSIONS_ALLOWED: this.config.permissions.allowed.join(','),
      PERMISSIONS_RESTRICTED: this.config.permissions.restricted.join(','),
      WORK_DAYS: this.config.schedule.workDays.join(','),
      WORK_HOURS_START: this.config.schedule.workHours.start,
      WORK_HOURS_END: this.config.schedule.workHours.end,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): EmployeeConfiguration {
    return this.config;
  }

  /**
   * Check if employee has permission
   */
  hasPermission(permission: Permission): boolean {
    if (this.config.permissions.restricted.includes(permission)) {
      return false;
    }
    return this.config.permissions.allowed.includes(permission);
  }

  /**
   * Check if employee is currently working (based on schedule)
   */
  isWorking(now: Date = new Date()): boolean {
    const localTime = this.toTimezone(now, this.config.schedule.timezone);
    const day = localTime.getDay();
    const hour = localTime.getHours();
    const minute = localTime.getMinutes();
    const currentTime = hour * 60 + minute;

    // Check if working day
    if (!this.config.schedule.workDays.includes(day)) {
      return false;
    }

    // Parse work hours
    const [startHour, startMinute] = this.config.schedule.workHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.config.schedule.workHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    // Check if within work hours
    if (currentTime < startTime || currentTime >= endTime) {
      return false;
    }

    // Check lunch break
    if (this.config.schedule.lunchBreak) {
      const [lunchStartHour, lunchStartMinute] = this.config.schedule.lunchBreak.start.split(':').map(Number);
      const [lunchEndHour, lunchEndMinute] = this.config.schedule.lunchBreak.end.split(':').map(Number);
      const lunchStart = lunchStartHour * 60 + lunchStartMinute;
      const lunchEnd = lunchEndHour * 60 + lunchEndMinute;

      if (currentTime >= lunchStart && currentTime < lunchEnd) {
        return false;
      }
    }

    return true;
  }

  /**
   * Build integration config from role and custom integrations
   */
  private buildIntegrationConfig(roleIntegrations: string[], customIntegrations?: string[]): IntegrationConfig {
    const integrations = JSON.parse(JSON.stringify(DEFAULT_INTEGRATIONS));

    const enabledIntegrations = customIntegrations || roleIntegrations;

    for (const integration of enabledIntegrations) {
      switch (integration) {
        case 'gmail':
          integrations.gmail = { enabled: true };
          break;
        case 'calendar':
          integrations.calendar = { enabled: true, createEvents: true, checkAvailability: true };
          break;
        case 'notion':
          integrations.notion = { enabled: true };
          break;
        case 'telegram':
          integrations.telegram = { enabled: true };
          break;
        case 'slack':
          integrations.slack = { enabled: true };
          break;
        case 'crm':
          integrations.hubspot = { enabled: true };
          integrations.salesforce = { enabled: true };
          break;
        case 'sheets':
          integrations.sheets = { enabled: true };
          break;
        case 'social':
          // Social media integrations handled separately
          break;
      }
    }

    return integrations;
  }

  /**
   * Convert date to timezone
   */
  private toTimezone(date: Date, timezone: string): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  }
}

// Utility exports
export { ROLE_PERMISSIONS, ROLE_INTEGRATIONS, DEFAULT_SCHEDULE, ROLE_SETTINGS };
