/**
 * Orgo API Client - VM infrastructure for Mouse Platform
 * Handles VM lifecycle: create, configure, start, stop, delete
 * Plus bash execution for provisioning
 */

const ORGO_API = 'https://www.orgo.ai/api';

interface OrgoResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Computer {
  id: string;
  name: string;
  status: string;
  workspace_id: string;
}

async function orgoFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<OrgoResponse<T>> {
  const apiKey = process.env.ORGO_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'ORGO_API_KEY not configured' };
  }

  try {
    const res = await fetch(`${ORGO_API}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `Orgo API ${res.status}: ${text}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createComputer(
  workspaceId: string,
  name: string,
  ram: number = 8,
  cpu: number = 4
): Promise<OrgoResponse<Computer>> {
  return orgoFetch('/v1/computers', {
    method: 'POST',
    body: JSON.stringify({
      workspace_id: workspaceId,
      name,
      ram,
      cpu,
      os: 'linux',
    }),
  });
}

export async function getComputer(id: string): Promise<OrgoResponse<Computer>> {
  return orgoFetch(`/v1/computers/${id}`);
}

export async function deleteComputer(id: string): Promise<OrgoResponse> {
  return orgoFetch(`/v1/computers/${id}`, { method: 'DELETE' });
}

export async function bashExec(
  computerId: string,
  command: string,
  timeout: number = 300
): Promise<OrgoResponse<{ output: string; exit_code: number }>> {
  return orgoFetch(`/v1/computers/${computerId}/bash`, {
    method: 'POST',
    body: JSON.stringify({ command, timeout }),
  });
}

export async function uploadFile(
  workspaceId: string,
  computerId: string,
  filePath: string,
  content: string
): Promise<OrgoResponse> {
  return orgoFetch(`/v1/workspaces/${workspaceId}/computers/${computerId}/files`, {
    method: 'POST',
    body: JSON.stringify({ file_path: filePath, content }),
  });
}

export async function takeScreenshot(
  computerId: string
): Promise<OrgoResponse<{ url: string }>> {
  return orgoFetch(`/v1/computers/${computerId}/screenshot`, {
    method: 'POST',
  });
}
