// VM Provisioner - Handles Orgo API integration and VM lifecycle
// Manages VM creation, provisioning, and OpenClaw installation

const ORGO_API_KEY = process.env.ORGO_API_KEY || '';
const ORGO_API_BASE = 'https://api.orgo.ai/v1';
const ORGO_WORKSPACE_ID = process.env.ORGO_WORKSPACE_ID || '';

export interface VMSpecs {
  name: string;
  ram?: 4 | 8 | 16 | 32 | 64;
  cpu?: 2 | 4 | 8 | 16;
  gpu?: 'none' | 'a10' | 'l40s' | 'a100-40gb' | 'a100-80gb';
  os?: 'linux';
}

export interface VMCreateResult {
  id: string;
  url: string;
  status: 'creating' | 'running' | 'stopped' | 'error';
  vncUrl?: string;
  createdAt: Date;
}

export interface VMConnectionInfo {
  ip: string;
  port: number;
  vncUrl: string;
}

export interface ProvisionConfig {
  employeeId: string;
  customerId: string;
  apiKeys: Record<string, string | undefined>;
  role: string;
}

export class VMProvisioner {
  private apiKey: string;
  private workspaceId: string;

  constructor() {
    this.apiKey = ORGO_API_KEY;
    this.workspaceId = ORGO_WORKSPACE_ID;

    if (!this.apiKey) {
      console.warn('ORGO_API_KEY not set - VM operations will fail');
    }
  }

  /**
   * Create a new VM via Orgo API
   */
  async createVM(specs: VMSpecs): Promise<VMCreateResult> {
    const response = await fetch(`${ORGO_API_BASE}/workspaces/${this.workspaceId}/computers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: specs.name,
        ram_gb: specs.ram || 8,
        cpu_cores: specs.cpu || 4,
        gpu: specs.gpu || 'none',
        os: specs.os || 'linux',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create VM: ${error}`);
    }

    const data = await response.json();
    
    return {
      id: data.id,
      url: data.url,
      status: data.status,
      vncUrl: data.vnc_url,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Get VM details
   */
  async getVM(vmId: string): Promise<VMCreateResult> {
    const response = await fetch(`${ORGO_API_BASE}/computers/${vmId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get VM: ${error}`);
    }

    const data = await response.json();
    
    return {
      id: data.id,
      url: data.url,
      status: data.status,
      vncUrl: data.vnc_url,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Wait for VM to be ready (status = 'running')
   */
  async waitForVMReady(vmId: string, maxAttempts = 60): Promise<VMConnectionInfo> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const vm = await this.getVM(vmId);

      if (vm.status === 'running') {
        // Extract IP and port from URL
        const urlParts = new URL(vm.url);
        return {
          ip: urlParts.hostname,
          port: parseInt(urlParts.port) || 443,
          vncUrl: vm.vncUrl || vm.url,
        };
      }

      if (vm.status === 'error') {
        throw new Error('VM entered error state');
      }

      // Wait 5 seconds between checks
      await this.sleep(5000);
    }

    throw new Error(`VM not ready after ${maxAttempts} attempts`);
  }

  /**
   * Provision OpenClaw on the VM via SSH
   */
  async provisionOpenClaw(vmId: string, config: ProvisionConfig): Promise<void> {
    const steps = [
      { command: this.getSystemUpdateCommand(), name: 'System update' },
      { command: this.getNodeInstallCommand(), name: 'Install Node.js' },
      { command: this.getGitInstallCommand(), name: 'Install Git' },
      { command: this.getCloneCommand(), name: 'Clone OpenClaw' },
      { command: this.getInstallCommand(), name: 'Install dependencies' },
      { command: this.getBuildCommand(), name: 'Build OpenClaw' },
      { command: this.getEnvCommand(config), name: 'Configure environment' },
      { command: this.getStartCommand(), name: 'Start OpenClaw service' },
    ];

    for (const step of steps) {
      const result = await this.executeBash(vmId, step.command);
      
      if (!result.success) {
        throw new Error(`Failed at step '${step.name}': ${result.error}`);
      }

      // Small delay between steps
      await this.sleep(1000);
    }
  }

  /**
   * Update configuration on running VM
   */
  async updateConfig(vmId: string, updates: Record<string, any>): Promise<void> {
    // Create updated .env content
    const envContent = this.generateEnvContent({
      employeeId: updates.customerId || '',
      customerId: updates.customerId || '',
      apiKeys: updates.customerApiKeys || {},
      role: updates.employeeType || 'general',
    });

    // Write to VM
    const command = `cat > /opt/openclaw/.env << 'EOF'\n${envContent}\nEOF`;
    const result = await this.executeBash(vmId, command);

    if (!result.success) {
      throw new Error(`Failed to update config: ${result.error}`);
    }

    // Restart service
    const restartResult = await this.executeBash(vmId, 'cd /opt/openclaw && npm restart');
    
    if (!restartResult.success) {
      throw new Error(`Failed to restart service: ${restartResult.error}`);
    }
  }

  /**
   * Delete a VM
   */
  async deleteVM(vmId: string): Promise<void> {
    const response = await fetch(`${ORGO_API_BASE}/computers/${vmId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete VM: ${error}`);
    }
  }

  /**
   * Stop a VM (preserve state, stop billing)
   */
  async stopVM(vmId: string): Promise<void> {
    const response = await fetch(`${ORGO_API_BASE}/computers/${vmId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to stop VM: ${error}`);
    }
  }

  /**
   * Start a stopped VM
   */
  async startVM(vmId: string): Promise<void> {
    const response = await fetch(`${ORGO_API_BASE}/computers/${vmId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to start VM: ${error}`);
    }
  }

  /**
   * Capture screenshot from VM
   */
  async captureScreenshot(vmId: string): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${ORGO_API_BASE}/computers/${vmId}/screenshot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      const data = await response.json();
      return {
        success: true,
        imageUrl: data.image_url || data.url,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get VM activity log (for screen replay)
   */
  async getVMActivity(vmId: string, limit = 100): Promise<{ success: boolean; activities?: any[]; error?: string }> {
    try {
      const response = await fetch(`${ORGO_API_BASE}/computers/${vmId}/activity?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      const data = await response.json();
      return {
        success: true,
        activities: data.activities || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute bash command on VM
   */
  private async executeBash(vmId: string, command: string, timeout = 300): Promise<{ success: boolean; output?: string; error?: string }> {
    const response = await fetch(`${ORGO_API_BASE}/computers/${vmId}/bash`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command,
        timeout,
      }),
    });

    if (!response.ok) {
      return { success: false, error: await response.text() };
    }

    const data = await response.json();
    
    return {
      success: data.exit_code === 0,
      output: data.stdout,
      error: data.stderr,
    };
  }

  // Private command generators

  private getSystemUpdateCommand(): string {
    return `
      apt-get update && 
      apt-get install -y curl wget git build-essential python3 python3-pip
    `.trim().replace(/\s+/g, ' ');
  }

  private getNodeInstallCommand(): string {
    return `
      curl -fsSL https://deb.nodesource.com/setup_20.x | bash - &&
      apt-get install -y nodejs
    `.trim().replace(/\s+/g, ' ');
  }

  private getGitInstallCommand(): string {
    return 'apt-get install -y git';
  }

  private getCloneCommand(): string {
    const repoUrl = process.env.OPENCLAW_REPO_URL || 'https://github.com/openclaw/openclaw.git';
    return `
      mkdir -p /opt &&
      cd /opt &&
      git clone ${repoUrl} openclaw
    `.trim().replace(/\s+/g, ' ');
  }

  private getInstallCommand(): string {
    return 'cd /opt/openclaw && npm install';
  }

  private getBuildCommand(): string {
    return 'cd /opt/openclaw && npm run build';
  }

  private getEnvCommand(config: ProvisionConfig): string {
    const envContent = this.generateEnvContent(config);
    
    return `cat > /opt/openclaw/.env << 'EOF'\n${envContent}\nEOF`;
  }

  private getStartCommand(): string {
    return `
      cd /opt/openclaw &&
      npm install -g pm2 &&
      pm2 start npm --name "openclaw" -- start &&
      pm2 save &&
      pm2 startup
    `.trim().replace(/\s+/g, ' ');
  }

  private generateEnvContent(config: ProvisionConfig): string {
    const lines = [
      '# OpenClaw Environment Configuration',
      `EMPLOYEE_ID=${config.employeeId}`,
      `CUSTOMER_ID=${config.customerId}`,
      `EMPLOYEE_ROLE=${config.role}`,
      `NODE_ENV=production`,
      '',
      '# API Keys',
    ];

    // Add customer API keys
    for (const [key, value] of Object.entries(config.apiKeys)) {
      if (value) {
        lines.push(`${key.toUpperCase()}_API_KEY=${value}`);
      }
    }

    lines.push('');
    lines.push('# Service Configuration');
    lines.push('PORT=3000');
    lines.push('HOST=0.0.0.0');

    return lines.join('\n');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const vmProvisioner = new VMProvisioner();
