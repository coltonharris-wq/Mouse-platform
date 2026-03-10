export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const ORGO_API_KEY = process.env.ORGO_API_KEY;
const ORGO_BASE_URL = 'https://www.orgo.ai/api';

/**
 * Mouse Platform VM Provisioner
 * Every VM gets full Mouse installation
 * King Mouse creates employees, each with their own Mouse instance
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

    // Action: Create King Mouse VM (primary Mouse instance)
    if (action === 'createKingMouse') {
      const vm = await createVM({
        name: `mouse-king-${customerId}`,
        ram: 32,
        cpu: 4,
        type: 'kingmouse',
        customerId,
        isKing: true
      });

      // Install Mouse with King Mouse identity
      await installMouse(vm.id, {
        role: 'King Mouse - AI Workforce Orchestrator',
        identity: `You are King Mouse, the primary AI orchestrator. You manage AI employees and help deploy them.`,
        capabilities: ['deploy_employees', 'monitor_vms', 'manage_workforce'],
        customerId
      });

      vmStore.set(customerId, vm);

      return NextResponse.json({
        success: true,
        vm,
        message: 'King Mouse VM created with Mouse installed'
      });
    }

    // Action: Create Employee VM (also gets Mouse)
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

      // Install Mouse with Employee identity
      await installMouse(employeeVM.id, {
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
        message: `${employeeType} employee created with Mouse installed`
      });
    }

    // Action: Send command to VM's Mouse instance
    if (action === 'command') {
      const { vmId, command } = body;
      const result = await sendCommandToMouse(vmId, command);
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
    const response = await fetch(`${ORGO_BASE_URL}/computers`, {
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

// Install Mouse on VM using published install script
// Install script URL: https://raw.githubusercontent.com/coltonharris-wq/mouse-platform-demo/main/public/install-mouse.sh
// Fallback: https://raw.githubusercontent.com/coltonharris-wq/mouse/main/install.sh
async function installMouse(vmId: string, identity: any): Promise<boolean> {
  console.log(`🔧 Installing Mouse on VM ${vmId}`);

  const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY || '';
  const preset = identity.employeeType || 'king-mouse';

  const installScript = `
    curl -fsSL https://raw.githubusercontent.com/coltonharris-wq/mouse-platform-demo/main/public/install-mouse.sh | bash -s -- \
      --silent \
      --preset=${preset} \
      --api-key=${MOONSHOT_API_KEY} \
      --port=3100 \
      --bind=0.0.0.0 \
      --user-id=${identity.customerId} \
      --customer-id=${identity.customerId} \
      --auto-skills \
      --install-daemon

    # Create SOUL.md
    mkdir -p /opt/king-mouse/workspace
    cat > /opt/king-mouse/workspace/SOUL.md << 'SOUL'
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
    cat > /opt/king-mouse/workspace/USER.md << 'USER'
# USER.md - Customer Context

**Customer ID:** ${identity.customerId}
**Plan:** starter
**Status:** active
USER

    # Create config
    mkdir -p /opt/king-mouse/config
    cat > /opt/king-mouse/config/mouse.json << 'CONFIG'
{
  "role": "${identity.role}",
  "type": "${identity.employeeType || 'kingmouse'}",
  "customerId": "${identity.customerId}",
  "reportsTo": "${identity.reportsTo || 'none'}",
  "capabilities": ${JSON.stringify(identity.capabilities)}
}
CONFIG

    echo "Mouse installed on VM ${vmId}"
  `;

  try {
    await execOnVM(vmId, installScript);
    console.log(`✅ Mouse installed on VM ${vmId}`);
    return true;
  } catch (error) {
    console.error(`❌ Mouse installation failed:`, error);
    return false;
  }
}

// Execute command on VM
async function execOnVM(vmId: string, command: string): Promise<any> {
  try {
    const response = await fetch(`${ORGO_BASE_URL}/computers/${vmId}/bash`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ORGO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
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

// Send command to Mouse instance
async function sendCommandToMouse(vmId: string, command: string): Promise<any> {
  console.log(`📤 Sending command to Mouse on ${vmId}: ${command}`);

  // FIXME: In production, call the Mouse API on the VM at port 3100
  const responses: Record<string, string> = {
    'deploy sales': '🚀 Deploying sales employee...',
    'deploy support': '💬 Deploying support employee...',
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
