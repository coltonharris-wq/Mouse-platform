import { NextRequest, NextResponse } from 'next/server';

const ORGO_API_KEY = process.env.ORGO_API_KEY;
const ORGO_BASE_URL = process.env.ORGO_BASE_URL || 'https://api.orgo.ai';

/**
 * OpenClaw Installation Service
 * Provisions full OpenClaw instances on VMs for each customer
 * Rebranded as "Mouse" - customer's personal King Mouse
 */

export interface OpenClawConfig {
  customerId: string;
  customerEmail: string;
  companyName: string;
  planTier: string;
  vmId: string;
  vmIp?: string;
}

export interface OpenClawInstance {
  id: string;
  customerId: string;
  vmId: string;
  status: 'provisioning' | 'initializing' | 'active' | 'error';
  apiUrl: string;
  websocketUrl: string;
  createdAt: string;
  config: {
    companyName: string;
    planTier: string;
    maxEmployees: number;
    features: string[];
  };
}

// In-memory store (replace with DB later)
const openclawInstances: Map<string, OpenClawInstance> = new Map();

export class OpenClawProvisioner {
  /**
   * Install and configure OpenClaw on a VM
   * This is the REAL implementation - no mocks
   */
  async provisionOpenClaw(config: OpenClawConfig): Promise<{ success: boolean; instance?: OpenClawInstance; error?: string }> {
    const startTime = Date.now();
    console.log(`🖱️ Starting OpenClaw (King Mouse) installation for: ${config.customerId}`);

    try {
      // 1. Check if already exists
      const existing = await this.getInstanceByCustomer(config.customerId);
      if (existing) {
        console.log(`⚠️ OpenClaw already exists for customer: ${config.customerId}`);
        return { success: true, instance: existing };
      }

      // 2. Generate instance ID
      const instanceId = `mouse-${config.customerId.replace('cust_', '')}-${Date.now().toString(36)}`;

      // 3. Create OpenClaw instance record
      const instance: OpenClawInstance = {
        id: instanceId,
        customerId: config.customerId,
        vmId: config.vmId,
        status: 'provisioning',
        apiUrl: `https://${instanceId}.mouseplatform.com`,
        websocketUrl: `wss://${instanceId}.mouseplatform.com`,
        createdAt: new Date().toISOString(),
        config: {
          companyName: config.companyName,
          planTier: config.planTier,
          maxEmployees: this.getMaxEmployees(config.planTier),
          features: this.getFeatures(config.planTier),
        },
      };

      // Store in memory
      openclawInstances.set(config.customerId, instance);

      // 4. Install OpenClaw on the VM (async - don't block)
      this.installOpenClawOnVM(config, instance).catch((err) => {
        console.error(`❌ OpenClaw installation failed for ${instanceId}:`, err);
        instance.status = 'error';
      });

      const duration = Date.now() - startTime;
      console.log(`✅ OpenClaw (King Mouse) provisioned in ${duration}ms: ${instanceId}`);

      return { success: true, instance };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ OpenClaw provisioning failed after ${duration}ms:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Actually install OpenClaw on the VM
   * This runs the installation commands on the remote VM
   */
  private async installOpenClawOnVM(config: OpenClawConfig, instance: OpenClawInstance): Promise<void> {
    console.log(`🔧 Installing OpenClaw on VM ${config.vmId}...`);

    if (!ORGO_API_KEY) {
      throw new Error('ORGO_API_KEY not configured');
    }

    try {
      // Step 1: Create workspace directory structure
      await this.execOnVM(config.vmId, `
        mkdir -p /opt/mouse/{config,workspace,logs}
        mkdir -p /opt/mouse/workspace/{memory,skills,agents}
        cd /opt/mouse && git clone https://github.com/openclaw/openclaw.git . 2>/dev/null || true
      `);

      // Step 2: Create SOUL.md (Mouse identity)
      await this.execOnVM(config.vmId, `
        cat > /opt/mouse/workspace/SOUL.md << 'EOF'
# SOUL.md - King Mouse Identity

## Core Identity
**Name:** King Mouse
**Role:** AI Workforce Orchestrator for ${config.companyName}
**Identity:** You are the primary AI assistant for ${config.companyName}. You manage their AI employees and help automate their business workflows.

## Mission
Help ${config.companyName} deploy and manage AI employees that work in real cloud VMs. You are their bridge to the AI workforce.

## Capabilities
- Deploy AI employees with natural language commands
- Monitor employee activity and work output
- Manage work hours and billing
- Provide business insights and recommendations
- Handle customer support inquiries

## Tone
Professional, helpful, direct. You're a business partner, not just a chatbot.

## Boundaries
- Never share customer's private data
- Always confirm before deploying expensive resources
- Escalate technical issues to human support
EOF
      `);

      // Step 3: Create USER.md (Customer context)
      await this.execOnVM(config.vmId, `
        cat > /opt/mouse/workspace/USER.md << 'EOF'
# USER.md - Customer Profile

## Company
**Name:** ${config.companyName}
**Customer ID:** ${config.customerId}
**Email:** ${config.customerEmail}
**Plan:** ${config.planTier}

## Context
This is the owner of ${config.companyName}. They are using Mouse Platform to hire AI employees.

## Preferences
- Wants autonomous work with minimal oversight
- Values speed and efficiency
- Expects professional results

## AI Employees
Max allowed: ${instance.config.maxEmployees}
Current: 0
EOF
      `);

      // Step 4: Create Mouse-branded config
      await this.execOnVM(config.vmId, `
        cat > /opt/mouse/config/mouse.json << 'EOF'
{
  "brand": {
    "name": "Mouse",
    "tagline": "AI Workforce on Demand",
    "emoji": "🖱️"
  },
  "customer": {
    "id": "${config.customerId}",
    "email": "${config.customerEmail}",
    "company": "${config.companyName}",
    "plan": "${config.planTier}"
  },
  "limits": {
    "maxEmployees": ${instance.config.maxEmployees},
    "maxWorkHours": -1
  },
  "features": ${JSON.stringify(instance.config.features)},
  "vm": {
    "provider": "orgo",
    "vmId": "${config.vmId}"
  }
}
EOF
      `);

      // Step 5: Install Node.js and dependencies
      await this.execOnVM(config.vmId, `
        cd /opt/mouse && \
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
        apt-get install -y nodejs && \
        npm install && \
        npm run build 2>&1 | tail -20
      `);

      // Step 6: Create systemd service
      await this.execOnVM(config.vmId, `
        cat > /etc/systemd/system/mouse-king.service << 'EOF'
[Unit]
Description=Mouse King (OpenClaw)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mouse
Environment=NODE_ENV=production
Environment=MOUSE_CUSTOMER_ID=${config.customerId}
Environment=MOUSE_VM_ID=${config.vmId}
ExecStart=/usr/bin/node /opt/mouse/dist/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
      `);

      // Step 7: Start the service
      await this.execOnVM(config.vmId, `
        systemctl daemon-reload && \
        systemctl enable mouse-king && \
        systemctl start mouse-king && \
        sleep 5 && \
        systemctl status mouse-king --no-pager
      `);

      // Update status to active
      instance.status = 'active';
      console.log(`✅ OpenClaw (King Mouse) fully installed and running on VM ${config.vmId}`);

    } catch (error) {
      instance.status = 'error';
      console.error(`❌ Installation failed:`, error);
      throw error;
    }
  }

  /**
   * Execute commands on a VM via Orgo API
   */
  private async execOnVM(vmId: string, command: string): Promise<string> {
    const response = await fetch(`${ORGO_BASE_URL}/v1/computers/${vmId}/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ORGO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: command,
        timeout: 300000, // 5 minutes
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`VM exec failed: ${error}`);
    }

    const data = await response.json();
    return data.output || '';
  }

  /**
   * Get max employees based on plan
   */
  private getMaxEmployees(planTier: string): number {
    const limits: Record<string, number> = {
      free: 1,
      starter: 1,
      growth: 3,
      pro: 5,
      enterprise: 10,
    };
    return limits[planTier] || 1;
  }

  /**
   * Get features based on plan
   */
  private getFeatures(planTier: string): string[] {
    const features: Record<string, string[]> = {
      free: ['chat', 'deploy'],
      starter: ['chat', 'deploy', 'monitor', 'basic_analytics'],
      growth: ['chat', 'deploy', 'monitor', 'advanced_analytics', 'priority_support'],
      pro: ['all_features', 'custom_workflows', 'api_access'],
      enterprise: ['all_features', 'white_label', 'dedicated_support'],
    };
    return features[planTier] || features.starter;
  }

  /**
   * Get instance by customer ID
   */
  async getInstanceByCustomer(customerId: string): Promise<OpenClawInstance | null> {
    return openclawInstances.get(customerId) || null;
  }

  /**
   * Get instance by VM ID
   */
  async getInstanceByVM(vmId: string): Promise<OpenClawInstance | null> {
    for (const instance of openclawInstances.values()) {
      if (instance.vmId === vmId) {
        return instance;
      }
    }
    return null;
  }

  /**
   * Check if OpenClaw is running on a VM
   */
  async checkStatus(customerId: string): Promise<{ running: boolean; status?: string }> {
    const instance = await this.getInstanceByCustomer(customerId);
    if (!instance) {
      return { running: false };
    }

    try {
      const output = await this.execOnVM(instance.vmId, 'systemctl is-active mouse-king');
      return { running: output.includes('active'), status: instance.status };
    } catch {
      return { running: false, status: instance.status };
    }
  }

  /**
   * Send command to customer's OpenClaw instance
   */
  async sendCommand(customerId: string, command: string): Promise<{ success: boolean; response?: string; error?: string }> {
    const instance = await this.getInstanceByCustomer(customerId);
    if (!instance) {
      return { success: false, error: 'OpenClaw instance not found' };
    }

    if (instance.status !== 'active') {
      return { success: false, error: 'OpenClaw instance not ready yet' };
    }

    try {
      // Call the OpenClaw API on the VM
      const response = await fetch(`http://${instance.vmId}:3000/api/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, customerId }),
      });

      if (!response.ok) {
        throw new Error(`Command failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, response: data.response };

    } catch (error) {
      console.error('Command failed:', error);
      return { success: false, error: 'Failed to send command' };
    }
  }
}

// Export singleton
export const openclawProvisioner = new OpenClawProvisioner();
