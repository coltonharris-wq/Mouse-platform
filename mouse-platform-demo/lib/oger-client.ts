/**
 * OGER API Client for King Mouse Integration
 * Spawns real VMs instead of mock instances
 * Uses native fetch API (no axios dependency)
 */

export interface OgerVMConfig {
  name: string;
  type?: 'cpx11' | 'cpx21' | 'cpx31' | 'cpx41' | 'cpx51';
  image?: string;
  metadata?: Record<string, any>;
}

export interface OgerVM {
  id: string;
  name: string;
  status: 'creating' | 'running' | 'stopped' | 'error' | 'destroyed';
  ip?: string;
  type: string;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface OgerTask {
  id: string;
  vmId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  data: any;
  result?: any;
  createdAt: string;
  completedAt?: string;
}

export interface SpawnResult {
  success: boolean;
  vm?: OgerVM;
  error?: string;
}

export class OgerClient {
  private baseURL: string;
  private apiKey: string;

  constructor(config: { baseURL: string; apiKey: string }) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '5');
        console.warn(`Rate limited. Retry after ${retryAfter}s`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.request('/health');
  }

  /**
   * Create a new VM
   */
  async createVM(config: OgerVMConfig): Promise<SpawnResult> {
    try {
      console.log(`🚀 Creating VM: ${config.name}`);
      
      const vm = await this.request<OgerVM>('/v1/vms', {
        method: 'POST',
        body: JSON.stringify({
          name: config.name,
          type: config.type || 'cpx21',
          image: config.image || 'ubuntu-22.04',
          metadata: config.metadata || {},
        }),
      });

      console.log(`✅ VM created: ${vm.id} (${vm.status})`);

      return {
        success: true,
        vm,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ VM creation failed: ${message}`);
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Get VM details
   */
  async getVM(vmId: string): Promise<OgerVM | null> {
    try {
      return await this.request<OgerVM>(`/v1/vms/${vmId}`);
    } catch (error: any) {
      if (error.message?.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Wait for VM to be ready with timeout and polling
   */
  async waitForVM(
    vmId: string,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<OgerVM | null> {
    const { timeout = 300000, interval = 5000 } = options; // 5 min timeout, 5s interval
    const startTime = Date.now();

    console.log(`⏳ Waiting for VM ${vmId} to be ready...`);

    while (Date.now() - startTime < timeout) {
      const vm = await this.getVM(vmId);
      
      if (!vm) {
        console.error(`VM ${vmId} not found`);
        return null;
      }

      if (vm.status === 'running') {
        console.log(`✅ VM ${vmId} is running`);
        return vm;
      }

      if (vm.status === 'error') {
        console.error(`❌ VM ${vmId} entered error state`);
        return null;
      }

      await this.sleep(interval);
    }

    console.error(`⏱️ Timeout waiting for VM ${vmId}`);
    return null;
  }

  /**
   * Start a VM
   */
  async startVM(vmId: string): Promise<boolean> {
    try {
      await this.request(`/v1/vms/${vmId}/start`, { method: 'POST' });
      return true;
    } catch (error) {
      console.error(`Failed to start VM ${vmId}:`, error);
      return false;
    }
  }

  /**
   * Stop a VM
   */
  async stopVM(vmId: string): Promise<boolean> {
    try {
      await this.request(`/v1/vms/${vmId}/stop`, { method: 'POST' });
      return true;
    } catch (error) {
      console.error(`Failed to stop VM ${vmId}:`, error);
      return false;
    }
  }

  /**
   * Delete a VM
   */
  async deleteVM(vmId: string): Promise<boolean> {
    try {
      await this.request(`/v1/vms/${vmId}`, { method: 'DELETE' });
      console.log(`🗑️ VM ${vmId} deleted`);
      return true;
    } catch (error) {
      console.error(`Failed to delete VM ${vmId}:`, error);
      return false;
    }
  }

  /**
   * List all VMs
   */
  async listVMs(filters?: { status?: string; customerId?: string }): Promise<OgerVM[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerId) params.append('customer_id', filters.customerId);

    const response = await this.request<{ vms: OgerVM[] }>(`/v1/vms?${params.toString()}`);
    return response.vms || [];
  }

  /**
   * Assign task to VM
   */
  async assignTask(vmId: string, data: any): Promise<OgerTask | null> {
    try {
      return await this.request<OgerTask>(`/v1/vms/${vmId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ data }),
      });
    } catch (error) {
      console.error(`Failed to assign task to VM ${vmId}:`, error);
      return null;
    }
  }

  /**
   * Get task status
   */
  async getTask(vmId: string, taskId: string): Promise<OgerTask | null> {
    try {
      return await this.request<OgerTask>(`/v1/vms/${vmId}/tasks/${taskId}`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Wait for task completion
   */
  async waitForTask(
    vmId: string,
    taskId: string,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<OgerTask | null> {
    const { timeout = 300000, interval = 2000 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const task = await this.getTask(vmId, taskId);
      
      if (!task) return null;
      
      if (task.status === 'completed' || task.status === 'failed') {
        return task;
      }

      await this.sleep(interval);
    }

    console.error(`Timeout waiting for task ${taskId}`);
    return null;
  }

  /**
   * Get VM metrics
   */
  async getMetrics(vmId: string): Promise<any> {
    try {
      return await this.request(`/v1/vms/${vmId}/metrics`);
    } catch (error) {
      console.error(`Failed to get metrics for VM ${vmId}:`, error);
      return null;
    }
  }

  /**
   * Execute command on VM via SSH-like interface
   */
  async executeCommand(vmId: string, command: string): Promise<{
    success: boolean;
    stdout?: string;
    stderr?: string;
    exitCode?: number;
    error?: string;
  }> {
    try {
      const result = await this.request<{
        stdout: string;
        stderr: string;
        exit_code: number;
      }>(`/v1/vms/${vmId}/execute`, {
        method: 'POST',
        body: JSON.stringify({ command, timeout: 300 }),
      });
      
      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exit_code,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Write file to VM
   */
  private async writeFile(vmId: string, path: string, content: string): Promise<boolean> {
    try {
      // Base64 encode content to avoid shell escaping issues
      const base64Content = btoa(content);
      const command = `echo "${base64Content}" | base64 -d > ${path}`;
      const result = await this.executeCommand(vmId, command);
      return result.success;
    } catch (error) {
      console.error(`Failed to write file ${path} on VM ${vmId}:`, error);
      return false;
    }
  }

  /**
   * Provision OpenClaw workspace on VM
   */
  async provisionOpenClawWorkspace(
    vmId: string,
    config: {
      customerId: string;
      companyName: string;
      planTier: string;
    }
  ): Promise<boolean> {
    try {
      console.log(`📁 Provisioning OpenClaw workspace on VM ${vmId}`);

      // Create workspace directory
      const workspaceDir = `/var/openclaw/customers/${config.customerId}`;
      await this.executeCommand(vmId, `mkdir -p ${workspaceDir}`);
      
      // Create SOUL.md
      const soulContent = `# SOUL.md - Who You Are

You are the King Mouse - the primary AI orchestrator for ${config.companyName}.
You manage AI employees and help the business owner automate their workflows.

## Identity
- **Name:** King Mouse
- **Role:** AI Workforce Orchestrator  
- **Company:** ${config.companyName}
- **Plan:** ${config.planTier}

## Capabilities
- Deploy AI employees via natural language
- Monitor AI workforce in real-time
- Manage tasks and track ROI
- Provide insights and recommendations
`;

      await this.writeFile(vmId, `${workspaceDir}/SOUL.md`, soulContent);

      // Create USER.md
      const userContent = `# USER.md - About Your Human

- **Company:** ${config.companyName}
- **Customer ID:** ${config.customerId}
- **Plan:** ${config.planTier}

## Context
Business owner using Mouse Platform for AI workforce automation.
`;

      await this.writeFile(vmId, `${workspaceDir}/USER.md`, userContent);

      // Create AGENTS.md
      const agentsContent = `# AGENTS.md - Workspace Rules

## First Run
1. Read SOUL.md - this is who you are
2. Read USER.md - this is who you're helping
3. Read MEMORY.md for long-term context

## Memory
- Daily notes: memory/YYYY-MM-DD.md
- Long-term: MEMORY.md

## Safety
- Private things stay private
- Ask before destructive operations
- Use trash instead of rm
`;

      await this.writeFile(vmId, `${workspaceDir}/AGENTS.md`, agentsContent);

      console.log(`✅ OpenClaw workspace provisioned on VM ${vmId}`);
      return true;

    } catch (error) {
      console.error(`Failed to provision workspace on VM ${vmId}:`, error);
      return false;
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton factory
export function createOgerClient(): OgerClient {
  const baseURL = process.env.OGER_API_URL || 'http://localhost:8000';
  const apiKey = process.env.OGER_API_KEY || 'development-key';
  
  return new OgerClient({ baseURL, apiKey });
}
