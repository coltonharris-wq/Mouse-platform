export const dynamic = 'force-dynamic';

// POST /api/employees/deploy - Deploy a new employee VM
// GET /api/employees/deploy?employeeId=xxx - Check deployment status
// DELETE /api/employees/deploy?employeeId=xxx - Terminate employee VM
// PATCH /api/employees/deploy - Update employee configuration

import { NextRequest, NextResponse } from 'next/server';
import { deploymentService, DeploymentConfig } from '@/lib/deployment-service';
import { EmployeeRole } from '@/lib/employee-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.employeeType || !body.customerId) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeType, customerId' },
        { status: 400 }
      );
    }

    // Validate employee type
    const validRoles: EmployeeRole[] = [
      'sales', 'support', 'research', 'data-entry', 
      'content-writer', 'social-media', 'general', 'developer', 'analyst'
    ];
    
    if (!validRoles.includes(body.employeeType)) {
      return NextResponse.json(
        { error: `Invalid employeeType. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Build deployment config
    const config: DeploymentConfig = {
      employeeType: body.employeeType,
      customerId: body.customerId,
      customerApiKeys: body.customerApiKeys || {},
      vmSpecs: body.vmSpecs,
      integrations: body.integrations,
      schedule: body.schedule,
    };

    // Start deployment
    const result = await deploymentService.deployEmployee(config);

    return NextResponse.json({
      success: true,
      data: {
        employeeId: result.employeeId,
        vmId: result.vmId,
        vmUrl: result.vmUrl,
        ipAddress: result.ipAddress,
        port: result.port,
        status: result.status,
        startedAt: result.startedAt,
        completedAt: result.completedAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Deployment error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Deployment failed' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Missing required parameter: employeeId' },
        { status: 400 }
      );
    }

    const status = await deploymentService.getDeploymentStatus(employeeId);

    return NextResponse.json({
      success: true,
      data: {
        employeeId,
        status,
      },
    });

  } catch (error) {
    console.error('Get deployment status error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get status' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Missing required parameter: employeeId' },
        { status: 400 }
      );
    }

    await deploymentService.terminateEmployee(employeeId);

    return NextResponse.json({
      success: true,
      message: 'Employee VM terminated successfully',
    });

  } catch (error) {
    console.error('Termination error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Termination failed' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId) {
      return NextResponse.json(
        { error: 'Missing required field: employeeId' },
        { status: 400 }
      );
    }

    const updates: Partial<DeploymentConfig> = {};

    if (body.employeeType) updates.employeeType = body.employeeType;
    if (body.customerApiKeys) updates.customerApiKeys = body.customerApiKeys;
    if (body.vmSpecs) updates.vmSpecs = body.vmSpecs;
    if (body.integrations) updates.integrations = body.integrations;
    if (body.schedule) updates.schedule = body.schedule;

    await deploymentService.updateEmployeeConfig(body.employeeId, updates);

    return NextResponse.json({
      success: true,
      message: 'Employee configuration updated successfully',
    });

  } catch (error) {
    console.error('Update config error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Update failed' 
      },
      { status: 500 }
    );
  }
}
