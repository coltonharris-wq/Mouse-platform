import { NextRequest, NextResponse } from 'next/server';
import { openclawProvisioner } from '@/lib/openclaw-provisioner';

/**
 * OpenClaw (King Mouse) API
 * Provision and manage full OpenClaw instances for customers
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'provision': {
        const { customerId, customerEmail, companyName, planTier, vmId } = body;

        if (!customerId || !customerEmail || !vmId) {
          return NextResponse.json(
            { error: 'Missing required fields: customerId, customerEmail, vmId' },
            { status: 400 }
          );
        }

        const result = await openclawProvisioner.provisionOpenClaw({
          customerId,
          customerEmail,
          companyName: companyName || customerEmail.split('@')[0] + ' Co',
          planTier: planTier || 'starter',
          vmId,
        });

        return NextResponse.json(result);
      }

      case 'command': {
        const { customerId, command } = body;

        if (!customerId || !command) {
          return NextResponse.json(
            { error: 'Missing required fields: customerId, command' },
            { status: 400 }
          );
        }

        const result = await openclawProvisioner.sendCommand(customerId, command);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    console.error('OpenClaw API error:', error);
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

    if (!customerId && !vmId) {
      return NextResponse.json(
        { error: 'Missing customerId or vmId' },
        { status: 400 }
      );
    }

    let instance = null;
    if (customerId) {
      instance = await openclawProvisioner.getInstanceByCustomer(customerId);
    } else if (vmId) {
      instance = await openclawProvisioner.getInstanceByVM(vmId);
    }

    if (!instance) {
      return NextResponse.json(
        { error: 'OpenClaw instance not found' },
        { status: 404 }
      );
    }

    // Check status
    const status = await openclawProvisioner.checkStatus(instance.customerId);

    return NextResponse.json({
      success: true,
      instance: {
        ...instance,
        running: status.running,
      },
    });

  } catch (error) {
    console.error('OpenClaw GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
