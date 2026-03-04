export const dynamic = 'force-dynamic';

// GET /api/employees/deploy/status - Get detailed deployment and VM status

import { NextRequest, NextResponse } from 'next/server';
import { vmProvisioner } from '@/lib/vm-provisioner';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const customerId = searchParams.get('customerId');

    if (!employeeId && !customerId) {
      return NextResponse.json(
        { error: 'Missing required parameter: employeeId or customerId' },
        { status: 400 }
      );
    }

    // Get employee data
    let employeeQuery = `${SUPABASE_URL}/rest/v1/employees?`;
    if (employeeId) {
      employeeQuery += `id=eq.${employeeId}`;
    } else {
      employeeQuery += `customer_id=eq.${customerId}`;
    }

    const employeeResponse = await fetch(employeeQuery, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
    });

    if (!employeeResponse.ok) {
      throw new Error('Failed to fetch employee data');
    }

    const employees = await employeeResponse.json();

    if (employees.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get detailed status for each employee
    const results = await Promise.all(
      employees.map(async (emp: any) => {
        const status: any = {
          employeeId: emp.id,
          customerId: emp.customer_id,
          role: emp.role,
          status: emp.status,
          vmId: emp.vm_id,
          vmUrl: emp.vm_url,
          createdAt: emp.created_at,
        };

        // Get VM status if VM exists
        if (emp.vm_id) {
          try {
            const vm = await vmProvisioner.getVM(emp.vm_id);
            status.vmStatus = vm.status;
            status.vncUrl = vm.vncUrl;
          } catch (e) {
            status.vmStatus = 'unknown';
          }
        }

        // Get latest deployment log
        const logsResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/deployment_logs?employee_id=eq.${emp.id}&order=timestamp.desc&limit=1`,
          {
            headers: {
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'apikey': SUPABASE_KEY,
            },
          }
        );

        if (logsResponse.ok) {
          const logs = await logsResponse.json();
          if (logs.length > 0) {
            status.lastDeploymentLog = {
              status: logs[0].status,
              message: logs[0].message,
              timestamp: logs[0].timestamp,
            };
          }
        }

        // Get VM assignment details
        if (emp.vm_id) {
          const vmAssignResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/vm_assignments?vm_id=eq.${emp.vm_id}&limit=1`,
            {
              headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY,
              },
            }
          );

          if (vmAssignResponse.ok) {
            const assignments = await vmAssignResponse.json();
            if (assignments.length > 0) {
              status.vmAssignment = {
                ipAddress: assignments[0].ip_address,
                port: assignments[0].port,
                status: assignments[0].status,
              };
            }
          }
        }

        return status;
      })
    );

    return NextResponse.json({
      success: true,
      data: employeeId ? results[0] : results,
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
