// Auto-Deployment Service for OpenClaw Employee Instances
// Orchestrates VM creation, provisioning, and configuration

import { VMProvisioner, VMConnectionInfo } from './vm-provisioner';
import { EmployeeConfig, EmployeeRole, generateEmployeeId } from './employee-config';

export type DeploymentStatus = 
  | 'pending'
  | 'creating_vm'
  | 'provisioning'
  | 'installing_deps'
  | 'cloning_repo'
  | 'building'
  | 'configuring'
  | 'starting'
  | 'ready'
  | 'failed'
  | 'terminated';

export interface DeploymentConfig {
  employeeType: EmployeeRole;
  customerId: string;
  customerApiKeys: {
    openai?: string;
    anthropic?: string;
    moonshot?: string;
    gmail?: string;
    notion?: string;
    telegram?: string;
    slack?: string;
    hubspot?: string;
    salesforce?: string;
  };
  vmSpecs?: {
    ram?: 4 | 8 | 16 | 32 | 64;
    cpu?: 2 | 4 | 8 | 16;
    gpu?: 'none' | 'a10' | 'l40s' | 'a100-40gb' | 'a100-80gb';
  };
  integrations?: string[];
  schedule?: {
    timezone: string;
    workHours: { start: string; end: string };
    workDays: number[]; // 0 = Sunday, 6 = Saturday
  };
}

export interface DeploymentResult {
  employeeId: string;
  vmId: string;
  vmUrl: string;
  ipAddress: string;
  port: number;
  status: DeploymentStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface DeploymentLog {
  id: string;
  employeeId: string;
  customerId: string;
  status: DeploymentStatus;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class DeploymentService {
  private provisioner: VMProvisioner;
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.provisioner = new VMProvisioner();
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
  }

  /**
   * Deploy a new employee VM
   */
  async deployEmployee(config: DeploymentConfig): Promise<DeploymentResult> {
    const employeeId = generateEmployeeId(config.employeeType);
    const startedAt = new Date();

    try {
      // 1. Log deployment start
      await this.logDeployment({
        id: this.generateLogId(),
        employeeId,
        customerId: config.customerId,
        status: 'pending',
        message: `🐭 Mouse is getting dressed for work 👔 - Starting ${config.employeeType} deployment`,
        timestamp: new Date(),
        metadata: { vmSpecs: config.vmSpecs }
      });

      // 2. Create VM via Orgo
      await this.updateDeploymentStatus(employeeId, 'creating_vm', '🎓 Training your new Mouse employee...');
      
      const vmResult = await this.provisioner.createVM({
        name: `employee-${employeeId}`,
        ram: config.vmSpecs?.ram || 8,
        cpu: config.vmSpecs?.cpu || 4,
        gpu: config.vmSpecs?.gpu || 'none',
      });

      await this.logDeployment({
        id: this.generateLogId(),
        employeeId,
        customerId: config.customerId,
        status: 'creating_vm',
        message: `VM created: ${vmResult.id}`,
        timestamp: new Date(),
        metadata: { vmId: vmResult.id, vmUrl: vmResult.url }
      });

      // 3. Wait for VM to be ready
      await this.updateDeploymentStatus(employeeId, 'provisioning', '🧀 Packing Mouse\'s lunchbox...');
      const connectionInfo = await this.provisioner.waitForVMReady(vmResult.id);

      // 4. Provision the VM with OpenClaw
      await this.updateDeploymentStatus(employeeId, 'provisioning', '🔌 Teaching Mouse where the cheese is...');
      await this.provisioner.provisionOpenClaw(vmResult.id, {
        employeeId,
        customerId: config.customerId,
        apiKeys: config.customerApiKeys,
        role: config.employeeType,
      });

      // 5. Generate employee configuration
      const employeeConfig = new EmployeeConfig({
        employeeId,
        customerId: config.customerId,
        role: config.employeeType,
        vmId: vmResult.id,
        vmUrl: vmResult.url,
        integrations: config.integrations || [],
        schedule: config.schedule,
      });

      await employeeConfig.save();

      // 6. Save to database
      await this.saveEmployeeRecord({
        id: employeeId,
        customer_id: config.customerId,
        vm_id: vmResult.id,
        vm_url: vmResult.url,
        status: 'idle',
        role: config.employeeType,
        created_at: startedAt.toISOString(),
      });

      await this.saveVMAssignment({
        vm_id: vmResult.id,
        employee_id: employeeId,
        ip_address: connectionInfo.ip,
        port: connectionInfo.port,
      });

      // 7. Mark as ready
      await this.updateDeploymentStatus(employeeId, 'ready', '🧀 Mission accomplished! Mouse got the cheese! 🎉');

      return {
        employeeId,
        vmId: vmResult.id,
        vmUrl: vmResult.url,
        ipAddress: connectionInfo.ip,
        port: connectionInfo.port,
        status: 'ready',
        startedAt,
        completedAt: new Date(),
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.logDeployment({
        id: this.generateLogId(),
        employeeId,
        customerId: config.customerId,
        status: 'failed',
        message: `🐭 Oops! Mouse got stuck in the wheel 🎡 - ${errorMessage}`,
        timestamp: new Date(),
        metadata: { error: errorMessage }
      });

      await this.updateDeploymentStatus(employeeId, 'failed', `🚑 Calling the Mouse paramedics... ${errorMessage}`);

      throw new Error(`Deployment failed: ${errorMessage}`);
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(employeeId: string): Promise<DeploymentStatus> {
    const response = await fetch(`${this.supabaseUrl}/rest/v1/deployment_logs?employee_id=eq.${employeeId}&order=timestamp.desc&limit=1`, {
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'apikey': this.supabaseKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch deployment status');
    }

    const logs = await response.json();
    return logs[0]?.status || 'pending';
  }

  /**
   * Terminate an employee VM
   */
  async terminateEmployee(employeeId: string): Promise<void> {
    try {
      // Get VM ID from database
      const employee = await this.getEmployeeRecord(employeeId);
      
      if (!employee?.vm_id) {
        throw new Error('No VM associated with this employee');
      }

      await this.logDeployment({
        id: this.generateLogId(),
        employeeId,
        customerId: employee.customer_id,
        status: 'terminated',
        message: '👋 Mouse is retiring to the cheese farm 🏡🧀',
        timestamp: new Date(),
      });

      // Delete VM via Orgo
      await this.provisioner.deleteVM(employee.vm_id);

      // Update employee status
      await this.updateEmployeeStatus(employeeId, 'terminated');

      // Remove VM assignment
      await this.deleteVMAssignment(employee.vm_id);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Termination failed: ${errorMessage}`);
    }
  }

  /**
   * Update employee configuration
   */
  async updateEmployeeConfig(employeeId: string, updates: Partial<DeploymentConfig>): Promise<void> {
    const employee = await this.getEmployeeRecord(employeeId);
    
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Update configuration via SSH
    if (employee.vm_id) {
      await this.provisioner.updateConfig(employee.vm_id, updates);
    }

    // Update database
    await this.updateEmployeeRecord(employeeId, {
      role: updates.employeeType || employee.role,
      updated_at: new Date().toISOString(),
    });

    await this.logDeployment({
      id: this.generateLogId(),
      employeeId,
      customerId: employee.customer_id,
      status: 'ready',
      message: 'Employee configuration updated',
      timestamp: new Date(),
      metadata: updates,
    });
  }

  // Private helper methods

  private async logDeployment(log: DeploymentLog): Promise<void> {
    const response = await fetch(`${this.supabaseUrl}/rest/v1/deployment_logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'apikey': this.supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        id: log.id,
        employee_id: log.employeeId,
        customer_id: log.customerId,
        status: log.status,
        message: log.message,
        timestamp: log.timestamp.toISOString(),
        metadata: log.metadata,
      }),
    });

    if (!response.ok) {
      console.error('Failed to log deployment:', await response.text());
    }
  }

  private async updateDeploymentStatus(employeeId: string, status: DeploymentStatus, message: string): Promise<void> {
    const employee = await this.getEmployeeRecord(employeeId);
    
    if (employee) {
      await this.logDeployment({
        id: this.generateLogId(),
        employeeId,
        customerId: employee.customer_id,
        status,
        message,
        timestamp: new Date(),
      });
    }
  }

  private async saveEmployeeRecord(record: Record<string, any>): Promise<void> {
    const response = await fetch(`${this.supabaseUrl}/rest/v1/employees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'apikey': this.supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      throw new Error(`Failed to save employee: ${await response.text()}`);
    }
  }

  private async saveVMAssignment(record: Record<string, any>): Promise<void> {
    const response = await fetch(`${this.supabaseUrl}/rest/v1/vm_assignments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'apikey': this.supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      throw new Error(`Failed to save VM assignment: ${await response.text()}`);
    }
  }

  private async getEmployeeRecord(employeeId: string): Promise<any> {
    const response = await fetch(`${this.supabaseUrl}/rest/v1/employees?id=eq.${employeeId}&limit=1`, {
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'apikey': this.supabaseKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employee record');
    }

    const records = await response.json();
    return records[0];
  }

  private async updateEmployeeRecord(employeeId: string, updates: Record<string, any>): Promise<void> {
    const response = await fetch(`${this.supabaseUrl}/rest/v1/employees?id=eq.${employeeId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'apikey': this.supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update employee: ${await response.text()}`);
    }
  }

  private async updateEmployeeStatus(employeeId: string, status: string): Promise<void> {
    await this.updateEmployeeRecord(employeeId, { 
      status,
      updated_at: new Date().toISOString(),
    });
  }

  private async deleteVMAssignment(vmId: string): Promise<void> {
    const response = await fetch(`${this.supabaseUrl}/rest/v1/vm_assignments?vm_id=eq.${vmId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'apikey': this.supabaseKey,
      },
    });

    if (!response.ok) {
      console.error('Failed to delete VM assignment:', await response.text());
    }
  }

  private generateLogId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const deploymentService = new DeploymentService();
