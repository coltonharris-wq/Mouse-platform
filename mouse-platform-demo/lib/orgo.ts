/**
 * Orgo API Client — Clean wrapper for VM lifecycle
 * Base URL: https://www.orgo.ai/api
 * Auth: Bearer token
 */

const ORGO_API_KEY = (process.env.ORGO_API_KEY || '').trim();
const ORGO_BASE = 'https://www.orgo.ai/api';
const ORGO_WORKSPACE_ID = (process.env.ORGO_WORKSPACE_ID || '').trim();

export type VMStatus = 'starting' | 'running' | 'stopped' | 'error';

export interface OrgoComputer {
  id: string;
  name: string;
  workspace_id?: string;
  project_id?: string;
  os: string;
  ram: number;
  cpu: number;
  gpu?: string;
  status: VMStatus;
  url: string;
  created_at: string;
}

export interface CreateComputerOpts {
  name: string;
  ram?: 4 | 8 | 16 | 32 | 64;
  cpu?: 2 | 4 | 8 | 16;
  gpu?: 'none' | 'a10' | 'l40s' | 'a100-40gb' | 'a100-80gb';
}

async function orgoFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const url = `${ORGO_BASE}${path}`;
  return fetch(url, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${ORGO_API_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
}

// ─── Workspace ──────────────────────────────────────────────

export async function listWorkspaces() {
  const res = await orgoFetch('/workspaces');
  if (!res.ok) throw new Error(`List workspaces failed: ${res.status}`);
  return res.json();
}

// ─── Computers (VMs) ────────────────────────────────────────

export async function createComputer(opts: CreateComputerOpts): Promise<OrgoComputer> {
  const res = await orgoFetch('/computers', {
    method: 'POST',
    body: JSON.stringify({
      workspace_id: ORGO_WORKSPACE_ID,
      name: opts.name,
      os: 'linux',
      ram: opts.ram || 4,
      cpu: opts.cpu || 2,
      gpu: opts.gpu || 'none',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create computer failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function getComputer(id: string): Promise<OrgoComputer> {
  const res = await orgoFetch(`/computers/${id}`);
  if (!res.ok) throw new Error(`Get computer failed: ${res.status}`);
  return res.json();
}

export async function deleteComputer(id: string): Promise<void> {
  const res = await orgoFetch(`/computers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Delete computer failed: ${res.status}`);
}

export async function startComputer(id: string): Promise<void> {
  const res = await orgoFetch(`/computers/${id}/start`, { method: 'POST' });
  if (!res.ok) throw new Error(`Start computer failed: ${res.status}`);
}

export async function stopComputer(id: string): Promise<void> {
  const res = await orgoFetch(`/computers/${id}/stop`, { method: 'POST' });
  if (!res.ok) throw new Error(`Stop computer failed: ${res.status}`);
}

export async function getVncPassword(id: string): Promise<string> {
  const res = await orgoFetch(`/computers/${id}/vnc-password`);
  if (!res.ok) throw new Error(`Get VNC password failed: ${res.status}`);
  const data = await res.json();
  return data.password;
}

// ─── Actions ────────────────────────────────────────────────

export async function takeScreenshot(id: string): Promise<string> {
  const res = await orgoFetch(`/computers/${id}/screenshot`);
  if (!res.ok) throw new Error(`Screenshot failed: ${res.status}`);
  const data = await res.json();
  return data.image; // base64 data URI
}

export async function executeBash(id: string, command: string): Promise<{ output: string; success: boolean }> {
  const res = await orgoFetch(`/computers/${id}/bash`, {
    method: 'POST',
    body: JSON.stringify({ command }),
  });
  if (!res.ok) throw new Error(`Bash exec failed: ${res.status}`);
  return res.json();
}

export async function executePython(id: string, code: string, timeout = 30): Promise<{ output: string; success: boolean }> {
  const res = await orgoFetch(`/computers/${id}/exec`, {
    method: 'POST',
    body: JSON.stringify({ code, timeout }),
  });
  if (!res.ok) throw new Error(`Python exec failed: ${res.status}`);
  return res.json();
}

// ─── Streaming ──────────────────────────────────────────────

export async function startStream(id: string, connectionName?: string): Promise<void> {
  const res = await orgoFetch(`/computers/${id}/stream/start`, {
    method: 'POST',
    body: JSON.stringify({ connection_name: connectionName || 'default' }),
  });
  if (!res.ok) throw new Error(`Start stream failed: ${res.status}`);
}

export async function getStreamStatus(id: string): Promise<{ status: string; start_time?: string }> {
  const res = await orgoFetch(`/computers/${id}/stream/status`);
  if (!res.ok) throw new Error(`Stream status failed: ${res.status}`);
  return res.json();
}

export async function stopStream(id: string): Promise<void> {
  const res = await orgoFetch(`/computers/${id}/stream/stop`, { method: 'POST' });
  if (!res.ok) throw new Error(`Stop stream failed: ${res.status}`);
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * Wait for a computer to reach 'running' status.
 * Polls every 5s, up to maxWaitMs (default 5 min).
 */
export async function waitForReady(id: string, maxWaitMs = 300_000): Promise<OrgoComputer> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const computer = await getComputer(id);
    if (computer.status === 'running') return computer;
    if (computer.status === 'error') throw new Error('Computer entered error state');
    await new Promise(r => setTimeout(r, 5000));
  }
  throw new Error(`Computer ${id} not ready after ${maxWaitMs / 1000}s`);
}

/**
 * Estimate hourly cost for a VM config (rough Orgo pricing).
 * Used for billing calculations.
 */
export function estimateHourlyCost(ram: number, cpu: number, gpu: string = 'none'): number {
  // Base cost: ~$0.02/hr for 4GB/2CPU
  let cost = (ram / 4) * 0.01 + (cpu / 2) * 0.005;
  
  // GPU surcharge
  const gpuCosts: Record<string, number> = {
    'none': 0,
    'a10': 0.50,
    'l40s': 1.00,
    'a100-40gb': 2.00,
    'a100-80gb': 3.50,
  };
  cost += gpuCosts[gpu] || 0;
  
  return cost;
}
