// POST /api/employees/deploy/batch - Batch deploy multiple employees

import { NextRequest, NextResponse } from 'next/server';
import { deploymentService, DeploymentConfig } from '@/lib/deployment-service';
import { EmployeeRole } from '@/lib/employee-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employees || !Array.isArray(body.employees) || body.employees.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: employees (array)' },
        { status: 400 }
      );
    }

    if (!body.customerId) {
      return NextResponse.json(
        { error: 'Missing required field: customerId' },
        { status: 400 }
      );
    }

    const validRoles: EmployeeRole[] = [
      'sales', 'support', 'research', 'data-entry', 
      'content-writer', 'social-media', 'general', 'developer', 'analyst'
    ];

    // Validate all employees
    for (const emp of body.employees) {
      if (!emp.employeeType || !validRoles.includes(emp.employeeType)) {
        return NextResponse.json(
          { error: `Invalid employeeType: ${emp.employeeType}` },
          { status: 400 }
        );
      }
    }

    // Deploy all employees
    const results = await Promise.allSettled(
      body.employees.map((emp: any) => {
        const config: DeploymentConfig = {
          employeeType: emp.employeeType,
          customerId: body.customerId,
          customerApiKeys: body.customerApiKeys || emp.customerApiKeys || {},
          vmSpecs: emp.vmSpecs || body.vmSpecs,
          integrations: emp.integrations || body.integrations,
          schedule: emp.schedule || body.schedule,
        };

        return deploymentService.deployEmployee(config);
      })
    );

    // Format results
    const formattedResults = results.map((result, index) => {
      const empType = body.employees[index].employeeType;
      
      if (result.status === 'fulfilled') {
        return {
          success: true,
          employeeType: empType,
          employeeId: result.value.employeeId,
          vmId: result.value.vmId,
          vmUrl: result.value.vmUrl,
          status: result.value.status,
        };
      } else {
        return {
          success: false,
          employeeType: empType,
          error: result.reason instanceof Error ? result.reason.message : 'Deployment failed',
        };
      }
    });

    const successCount = formattedResults.filter(r => r.success).length;
    const failedCount = formattedResults.filter(r => !r.success).length;

    return NextResponse.json({
      success: failedCount === 0,
      summary: {
        total: body.employees.length,
        successful: successCount,
        failed: failedCount,
      },
      results: formattedResults,
    }, { status: failedCount === 0 ? 201 : 207 });

  } catch (error) {
    console.error('Batch deployment error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Batch deployment failed' 
      },
      { status: 500 }
    );
  }
}
