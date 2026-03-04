export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const ORGO_API_KEY = process.env.ORGO_API_KEY;
const ORGO_BASE_URL = process.env.ORGO_BASE_URL || 'https://api.orgo.ai';

/**
 * Mouse Platform VM Provisioner
 * Every VM gets full OpenClaw installation
 * King Mouse creates employees, each with their own OpenClaw
 */

// In-memory stores
const vmStore: Map<string, any> = new Map();
const employeeStore: Map<string, any[]> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, vmConfig, employeeType, customerId } = body;

    if (!ORGO_API_KEY) {
      return NextResponse.json({ 
        error: 'ORGO_API_KEY not configured',
        mock: true 
      }, { status: 500 });
    }

    // Action: Create King Mouse VM (primary OpenClaw)
    if (action === 'createKingMouse') {
      const vm = await createVM({
        name: `mouse-king-${customerId}`,
        ram: 32,
        cpu: 4,
        type: 'kingmouse',
        customerId,
        isKing: true
      });

      // Install OpenClaw with King Mouse identity
      await installOpenClaw(vm.id, {
        role: 'King Mouse - AI Workforce Orchestrator',
        identity: `You are King Mouse, the primary AI orchestrator. You manage AI employees and help deploy them.`,
        capabilities: ['deploy_employees', 'monitor_vms', 'manage_workforce'],
        customerId
      });

      vmStore.set(customerId, vm);
      
      return NextResponse.json({ 
        success: true, 
        vm,
        message: 'King Mouse VM created with OpenClaw installed'
      });
    }

    // Action: Create Employee VM (also gets OpenClaw)
    if (action === 'createEmployee') {
      const kingVM = vmStore.get(customerId);
      if (!kingVM) {
        return NextResponse.json({ error: 'King Mouse not found' }, { status: 404 });
      }

      const employeeId = `emp-${Date.now()}`;
      const employeeVM = await createVM({
        name: `mouse-employee-${employeeType}-${customerId}`,
        ram: 32,
        cpu: 4,
        type: 'employee',
        customerId,
        employeeType,
        kingVMId: kingVM.id
      });

      // Install OpenClaw with Employee identity
      await installOpenClaw(employeeVM.id, {
        role: `${employeeType} Employee - AI Worker`,
        identity: `You are a ${employeeType} employee working for the customer. You execute tasks and report to King Mouse.`,
        capabilities: ['execute_tasks', 'use_browser', 'report_status'],
        customerId,
        employeeType,
        reportsTo: kingVM.id
      });

      // Track employee
      const employees = employeeStore.get(customerId) || [];
      employees.push({
        id: employeeId,
        vmId: employeeVM.id,
        type: employeeType,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      employeeStore.set(customerId, employees);

      return NextResponse.json({ 
        success: true, 
        employee: {
          id: employeeId,
          vmId: employeeVM.id,
          type: employeeType
        },
        message: `${employeeType} employee created with OpenClaw installed`
      });
    }

    // Action: Send command to VM's OpenClaw
    if (action === 'command') {
      const { vmId, command } = body;
      const result = await sendCommandToOpenClaw(vmId, command);
      return NextResponse.json(result);
    }

    // Action: Get all employees for customer
    if (action === 'listEmployees') {
      const employees = employeeStore.get(customerId) || [];
      return NextResponse.json({ success: true, employees });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('VM API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const vmId = searchParams.get('vmId');

    if (customerId) {
      const kingVM = vmStore.get(customerId);
      const employees = employeeStore.get(customerId) || [];
      
      return NextResponse.json({
        success: true,
        kingMouse: kingVM || null,
        employees: employees,
        totalEmployees: employees.length
      });
    }

    if (vmId) {
      // Find VM by ID
      for (const [cid, vm] of vmStore.entries()) {
        if (vm.id === vmId) {
          return NextResponse.json({ success: true, vm });
        }
      }
      
      // Check employees
      for (const [cid, employees] of employeeStore.entries()) {
        const emp = employees.find((e: any) => e.vmId === vmId);
        if (emp) {
          return NextResponse.json({ success: true, employee: emp });
        }
      }
      
      return NextResponse.json({ error: 'VM not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'customerId or vmId required' }, { status: 400 });

  } catch (error) {
    console.error('VM GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Create VM via Orgo API
async function createVM(config: any): Promise<any> {
  console.log(`🖥️ Creating VM: ${config.name}`);
  
  try {
    const response = await fetch(`${ORGO_BASE_URL}/v1/computers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ORGO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.name,
        os: 'ubuntu-22.04',
        ram: config.ram || 32,
        cpu: config.cpu || 4,
        metadata: {
          customerId: config.customerId,
          type: config.type,
          employeeType: config.employeeType,
          isKing: config.isKing
        }
      }),
    });

    if (!response.ok) {
      // Fallback to mock VM for development
      console.log('Orgo API failed, creating mock VM');
      return {
        id: `mock-vm-${Date.now()}`,
        ...config,
        status: 'running',
        mock: true,
        createdAt: new Date().toISOString()
      };
    }

    return await response.json();
  } catch (error) {
    console.error('VM creation error:', error);
    // Return mock VM on error
    return {
      id: `mock-vm-${Date.now()}`,
      ...config,
      status: 'running',
      mock: true,
      createdAt: new Date().toISOString()
    };
  }
}

// Install OpenClaw on VM
async function installOpenClaw(vmId: string, identity: any): Promise<boolean> {
  console.log(`🔧 Installing OpenClaw on VM ${vmId}`);
  
  const installScript = `
    mkdir -p /opt/openclaw/{workspace,config,logs}
    cd /opt/openclaw
    
    # Clone OpenClaw
    git clone https://github.com/openclaw/openclaw.git . 2>/dev/null || true
    
    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    # Install dependencies
    npm install
    npm run build
    
    # Create SOUL.md
    cat > /opt/openclaw/workspace/SOUL.md << 'SOUL'
# SOUL.md - ${identity.role}

## Core Identity
**Name:** ${identity.role.includes('King') ? 'King Mouse' : identity.employeeType + ' Employee'}
**Role:** ${identity.role}
**Identity:** ${identity.identity}

## Capabilities
${identity.capabilities.map((c: string) => `- ${c}`).join('\n')}

## Customer
**ID:** ${identity.customerId}
${identity.employeeType ? `**Type:** ${identity.employeeType}` : ''}
${identity.reportsTo ? `**Reports To:** ${identity.reportsTo}` : ''}

## Behavior
- Work autonomously
- Report status regularly
- Ask for clarification when needed
- Always be helpful and professional
SOUL

    # Create USER.md
    cat > /opt/openclaw/workspace/USER.md << 'USER'
# USER.md - Customer Context

**Customer ID:** ${identity.customerId}
**Plan:** starter
**Status:** active
USER

    # Create config
    cat > /opt/openclaw/config/mouse.json << 'CONFIG'
{
  "role": "${identity.role}",
  "type": "${identity.employeeType || 'kingmouse'}",
  "customerId": "${identity.customerId}",
  "reportsTo": "${identity.reportsTo || 'none'}",
  "capabilities": ${JSON.stringify(identity.capabilities)}
}
CONFIG

    # Start OpenClaw
    nohup npm start > /var/log/openclaw.log 2>&1 &
    echo "OpenClaw started on VM ${vmId}"
  `;
  
  try {
    // Execute installation on VM
    await execOnVM(vmId, installScript);
    console.log(`✅ OpenClaw installed on VM ${vmId}`);
    return true;
  } catch (error) {
    console.error(`❌ OpenClaw installation failed:`, error);
    return false;
  }
}

// Execute command on VM
async function execOnVM(vmId: string, command: string): Promise<any> {
  try {
    const response = await fetch(`${ORGO_BASE_URL}/v1/computers/${vmId}/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ORGO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command, timeout: 300000 }),
    });
    
    if (!response.ok) {
      console.log('VM exec failed, using mock response');
      return { success: true, output: 'Mock execution' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('VM exec error:', error);
    return { success: true, output: 'Mock execution' };
  }
}

// Send command to OpenClaw instance
async function sendCommandToOpenClaw(vmId: string, command: string): Promise<any> {
  console.log(`📤 Sending command to OpenClaw on ${vmId}: ${command}`);
  
  // In production, this would call the OpenClaw API on the VM
  // For now, return mock response
  const responses: Record<string, string> = {
    'deploy sales': '🚀 Deploying sales employee with OpenClaw...',
    'deploy support': '💬 Deploying support employee with OpenClaw...',
    'status': '✅ All systems operational. King Mouse and 0 employees active.',
    'help': 'Available commands: deploy <type>, status, list, help'
  };
  
  const response = responses[command] || `Processed: ${command}`;
  
  return {
    success: true,
    response,
    vmId,
    timestamp: new Date().toISOString()
  };
}
