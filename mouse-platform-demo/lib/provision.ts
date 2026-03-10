import { supabaseQuery } from './supabase-server'
import { createComputer, getComputer, executeBash } from './orgo'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function updateProvisionStatus(
  customerId: string,
  progress: number,
  message: string
) {
  console.log(`[provision ${customerId}] ${progress}% - ${message}`)
  // Upsert: try PATCH first, then POST if not found
  try {
    await supabaseQuery(
      'provision_status',
      'PATCH',
      { progress, message, updated_at: new Date().toISOString() },
      `customer_id=eq.${customerId}`
    )
  } catch {
    await supabaseQuery('provision_status', 'POST', {
      customer_id: customerId,
      progress,
      message,
      updated_at: new Date().toISOString(),
    })
  }
}

export async function provisionCustomer(customerId: string) {
  const WORKSPACE_ID = process.env.ORGO_WORKSPACE_ID!
  const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY!

  // STEP A: Update status (5%)
  await updateProvisionStatus(customerId, 5, 'Creating your account...')

  // STEP B: Get customer data
  const customers = await supabaseQuery(
    'customers',
    'GET',
    undefined,
    `id=eq.${customerId}&select=*`
  )
  const customer = customers?.[0]
  if (!customer) throw new Error('Customer not found')

  // STEP C: Provision Orgo VM (10-40%)
  await updateProvisionStatus(customerId, 10, 'Spinning up your AI workspace...')

  const computer = await createComputer({
    name: `mouse-${customerId}`,
    ram: 8,
    cpu: 4,
  })

  // Poll until VM is ready
  let ready = false
  let attempts = 0
  while (!ready && attempts < 60) {
    const vm = await getComputer(computer.id)
    if (vm.status === 'running') {
      ready = true
    } else {
      attempts++
      const progress = 10 + Math.min(30, attempts)
      await updateProvisionStatus(
        customerId,
        progress,
        'Setting up your AI workspace...'
      )
      await sleep(3000)
    }
  }
  if (!ready) throw new Error('VM provision timeout')

  // Save VM info
  await supabaseQuery(
    'customers',
    'PATCH',
    { vm_id: computer.id, workspace_id: WORKSPACE_ID },
    `id=eq.${customerId}`
  )

  // STEP D: Install Mouse on VM (40-70%)
  await updateProvisionStatus(customerId, 45, 'Installing King Mouse...')

  // Install script URL: https://raw.githubusercontent.com/coltonharris-wq/mouse-platform-demo/main/public/install-mouse.sh
  // Fallback: https://raw.githubusercontent.com/coltonharris-wq/mouse/main/install.sh
  const installCmd = `curl -fsSL https://raw.githubusercontent.com/coltonharris-wq/mouse-platform-demo/main/public/install-mouse.sh | bash -s -- --silent --preset=king-mouse --api-key=${MOONSHOT_API_KEY} --port=3100 --bind=0.0.0.0 --user-id=${customerId} --auto-skills --install-daemon`

  await executeBash(computer.id, installCmd)

  await updateProvisionStatus(customerId, 65, 'Configuring King Mouse...')

  // Verify Mouse installed
  const installCheck = await executeBash(
    computer.id,
    'cat /root/.mouse/.status 2>/dev/null || echo "NOT_INSTALLED"'
  )
  if (installCheck.output?.includes('NOT_INSTALLED')) {
    // Retry once
    await executeBash(computer.id, installCmd)
  }

  // STEP E: Get gateway token + endpoint info (70-80%)
  await updateProvisionStatus(customerId, 75, 'Securing your connection...')

  const tokenOutput = await executeBash(
    computer.id,
    'cat /root/.mouse/mouse.json 2>/dev/null | grep -o \'"token":"[^"]*"\' | head -1'
  )
  const gatewayToken =
    tokenOutput.output?.match(/"token":"([^"]*)"/)?.[1] || ''

  const vmInfo = await getComputer(computer.id)
  const vmEndpoint =
    (vmInfo as any)?.ip || (vmInfo as any)?.hostname || ''

  // Install noVNC
  await updateProvisionStatus(customerId, 78, 'Setting up screen viewer...')
  await executeBash(
    computer.id,
    `apt-get update -qq && apt-get install -y -qq xvfb x11vnc novnc websockify chromium-browser 2>/dev/null;
     nohup Xvfb :99 -screen 0 1920x1080x24 &
     nohup x11vnc -display :99 -forever -nopw -rfbport 5900 &
     nohup websockify --web /usr/share/novnc 6080 localhost:5900 &`
  )

  // STEP F: Send onboarding config (80-90%)
  await updateProvisionStatus(
    customerId,
    80,
    'Teaching King Mouse about your business...'
  )

  if (vmEndpoint && gatewayToken) {
    try {
      await fetch(`http://${vmEndpoint}:3100/api/onboard-config`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gatewayToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: customer.company_name,
          owner_name: customer.name,
          industry: customer.industry,
          needs: customer.needs,
          custom_instructions: customer.custom_instructions || '',
        }),
      })
    } catch (err) {
      console.error('[provision] Config send failed:', err)
    }
  }

  // STEP G: Health check (90-95%)
  await updateProvisionStatus(customerId, 90, 'Almost ready...')

  let healthy = false
  if (vmEndpoint) {
    for (let i = 0; i < 5; i++) {
      try {
        const health = await fetch(`http://${vmEndpoint}:3100/health`, {
          signal: AbortSignal.timeout(5000),
        })
        if (health.ok) {
          healthy = true
          break
        }
      } catch {}
      await sleep(3000)
    }
  }

  // STEP H: Save everything (95-100%)
  await updateProvisionStatus(customerId, 95, 'Finalizing...')

  if (healthy) {
    await supabaseQuery(
      'customers',
      'PATCH',
      {
        status: 'active',
        mousecore_endpoint: `http://${vmEndpoint}:3100`,
        gateway_token: gatewayToken,
        novnc_endpoint: `http://${vmEndpoint}:6080`,
      },
      `id=eq.${customerId}`
    )
  } else {
    await supabaseQuery(
      'customers',
      'PATCH',
      {
        status: 'active_fallback',
        mousecore_endpoint: 'API_FALLBACK',
      },
      `id=eq.${customerId}`
    )
  }

  await updateProvisionStatus(customerId, 100, 'King Mouse is ready!')
}
