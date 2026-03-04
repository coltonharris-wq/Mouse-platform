export const dynamic = 'force-dynamic';

// Admin Logs API Routes
// Fetches security logs and system logs from the database

import { NextResponse } from 'next/server';

// Import the real Supabase client when ready
// import { createClient } from '@/lib/supabase-client';

// Mock data for development (will be replaced with real DB calls)
const mockSecurityLogs = [
  {
    id: "log-001",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    event_type: "authentication",
    event: "Failed login attempt",
    user_email: "admin@automio.com",
    severity: "high",
    ip_address: "192.168.1.45",
    details: { reason: "invalid_password", attempt_count: 3 },
  },
  {
    id: "log-002",
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    event_type: "authorization",
    event: "Permission changed",
    user_email: "admin@automio.com",
    severity: "medium",
    ip_address: "192.168.1.10",
    details: { target_user: "reseller@example.com", permission: "reseller_admin" },
  },
  {
    id: "log-003",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    event_type: "fraud",
    event: "Suspicious activity detected",
    user_email: "john.smith@email.com",
    severity: "high",
    ip_address: "203.45.67.89",
    details: { activity: "private_invoice_attempt", flagged_amount: 5000 },
  },
  {
    id: "log-004",
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    event_type: "authentication",
    event: "User login successful",
    user_email: "admin@automio.com",
    severity: "info",
    ip_address: "192.168.1.10",
    details: { method: "password", mfa_used: true },
  },
  {
    id: "log-005",
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    event_type: "access",
    event: "User suspended",
    user_email: "admin@automio.com",
    severity: "medium",
    ip_address: "192.168.1.10",
    details: { target_user: "reseller@example.com", reason: "policy_violation" },
  },
  {
    id: "log-006",
    timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    event_type: "system",
    event: "Settings modified",
    user_email: "admin@automio.com",
    severity: "info",
    ip_address: "192.168.1.10",
    details: { setting: "platform_config", old_value: "v1", new_value: "v2" },
  },
  {
    id: "log-007",
    timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
    event_type: "authentication",
    event: "API key regenerated",
    user_email: "admin@automio.com",
    severity: "medium",
    ip_address: "192.168.1.10",
    details: { key_name: "production_api_key" },
  },
  {
    id: "log-008",
    timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
    event_type: "access",
    event: "Password reset requested",
    user_email: "user@example.com",
    severity: "low",
    ip_address: "198.51.100.42",
    details: { method: "email", expiry: "24h" },
  },
  {
    id: "log-009",
    timestamp: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
    event_type: "authorization",
    event: "Role assigned",
    user_email: "admin@automio.com",
    severity: "low",
    ip_address: "192.168.1.10",
    details: { target_user: "newuser@example.com", role: "reseller" },
  },
  {
    id: "log-010",
    timestamp: new Date(Date.now() - 8 * 60 * 60000).toISOString(),
    event_type: "fraud",
    event: "Multiple failed payments",
    user_email: "suspicious@example.com",
    severity: "high",
    ip_address: "203.0.113.99",
    details: { card_count: 5, transaction_count: 12 },
  },
];

const mockSystemLogs = [
  {
    id: "sys-001",
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    level: "error",
    service: "api-gateway",
    message: "Connection timeout to database pool",
    trace_id: "trace-abc-123",
    metadata: { pool_size: 20, active_connections: 20 },
  },
  {
    id: "sys-002",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    level: "warn",
    service: "worker-queue",
    message: "Queue depth exceeding threshold: 1500 jobs",
    trace_id: "trace-def-456",
    metadata: { queue: "default", threshold: 1000 },
  },
  {
    id: "sys-003",
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    level: "info",
    service: "auth-service",
    message: "Token refresh completed successfully",
    trace_id: "trace-ghi-789",
    metadata: { user_id: "user-001", token_type: "refresh" },
  },
  {
    id: "sys-004",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    level: "info",
    service: "stripe-webhook",
    message: "Payment intent succeeded: pi_123456",
    trace_id: "trace-jkl-012",
    metadata: { amount: 2997, currency: "usd", customer: "cust_001" },
  },
  {
    id: "sys-005",
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    level: "debug",
    service: "fraud-detector",
    message: "Scanning message batch #4521",
    trace_id: "trace-mno-345",
    metadata: { batch_size: 100, scan_duration_ms: 45 },
  },
  {
    id: "sys-006",
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    level: "error",
    service: "vm-provisioner",
    message: "Failed to spawn VM: resource limit exceeded",
    trace_id: "trace-pqr-678",
    metadata: { region: "us-east-1", instance_type: "t3.medium" },
  },
  {
    id: "sys-007",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    level: "warn",
    service: "api-gateway",
    message: "Rate limit approaching for API key",
    trace_id: "trace-stu-901",
    metadata: { api_key: "key_123", usage_percent: 85 },
  },
  {
    id: "sys-008",
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    level: "info",
    service: "deployment-service",
    message: "Employee deployment completed",
    trace_id: "trace-vwx-234",
    metadata: { employee_id: "emp_001", duration_sec: 120 },
  },
  {
    id: "sys-009",
    timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
    level: "info",
    service: "health-monitor",
    message: "Daily health check completed - All systems operational",
    trace_id: "trace-yz1-567",
    metadata: { checks_passed: 15, checks_failed: 0 },
  },
  {
    id: "sys-010",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    level: "error",
    service: "database",
    message: "Slow query detected: 5.2s execution time",
    trace_id: "trace-234-890",
    metadata: { query: "SELECT * FROM large_table", rows_examined: 1000000 },
  },
  {
    id: "sys-011",
    timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
    level: "warn",
    service: "stripe-webhook",
    message: "Webhook delivery failed - retrying",
    trace_id: "trace-567-123",
    metadata: { event_id: "evt_123", attempt: 2, max_attempts: 3 },
  },
  {
    id: "sys-012",
    timestamp: new Date(Date.now() - 55 * 60000).toISOString(),
    level: "info",
    service: "notification-service",
    message: "Email sent successfully",
    trace_id: "trace-890-456",
    metadata: { recipient: "user@example.com", template: "welcome" },
  },
];

interface SecurityLog {
  id: string;
  timestamp: string;
  event_type: string;
  event: string;
  user_email: string;
  severity: string;
  ip_address: string;
  details: Record<string, any>;
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: string;
  service: string;
  message: string;
  trace_id: string;
  metadata: Record<string, any>;
}

// GET /api/logs - Fetch security or system logs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'security'; // 'security' or 'system'
  const severity = searchParams.get('severity') || 'all';
  const eventType = searchParams.get('eventType') || 'all';
  const service = searchParams.get('service') || 'all';
  const search = searchParams.get('search') || '';
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // TODO: Replace with real Supabase query when database is connected
    // const supabase = createClient();
    
    if (type === 'security') {
      let logs = [...mockSecurityLogs];
      
      // Apply filters
      if (severity !== 'all') {
        logs = logs.filter(log => log.severity === severity);
      }
      
      if (eventType !== 'all') {
        logs = logs.filter(log => log.event_type === eventType);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        logs = logs.filter(log => 
          log.event.toLowerCase().includes(searchLower) ||
          log.user_email?.toLowerCase().includes(searchLower) ||
          log.ip_address?.includes(searchLower)
        );
      }
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        logs = logs.filter(log => new Date(log.timestamp) >= fromDate);
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        logs = logs.filter(log => new Date(log.timestamp) <= toDate);
      }
      
      // Sort by timestamp descending
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Get total count before pagination
      const totalCount = logs.length;
      
      // Apply pagination
      logs = logs.slice(offset, offset + limit);
      
      // Get unique event types for filter dropdown
      const eventTypes = Array.from(new Set(mockSecurityLogs.map(log => log.event_type)));
      
      return NextResponse.json({
        logs,
        totalCount,
        offset,
        limit,
        eventTypes,
      });
    } else {
      // System logs
      let logs = [...mockSystemLogs];
      
      // Apply filters
      if (severity !== 'all') {
        logs = logs.filter(log => log.level === severity);
      }
      
      if (service !== 'all') {
        logs = logs.filter(log => log.service === service);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        logs = logs.filter(log => 
          log.message.toLowerCase().includes(searchLower) ||
          log.service.toLowerCase().includes(searchLower) ||
          log.trace_id?.toLowerCase().includes(searchLower)
        );
      }
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        logs = logs.filter(log => new Date(log.timestamp) >= fromDate);
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        logs = logs.filter(log => new Date(log.timestamp) <= toDate);
      }
      
      // Sort by timestamp descending
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Get total count before pagination
      const totalCount = logs.length;
      
      // Apply pagination
      logs = logs.slice(offset, offset + limit);
      
      // Get unique services for filter dropdown
      const services = Array.from(new Set(mockSystemLogs.map(log => log.service)));
      
      return NextResponse.json({
        logs,
        totalCount,
        offset,
        limit,
        services,
      });
    }
  } catch (error) {
    console.error('Logs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/logs - Create a new log entry (for internal services)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...logData } = body;
    
    if (type === 'security') {
      // TODO: Insert into security_logs table
      // const supabase = createClient();
      // const { data, error } = await supabase
      //   .from('security_logs')
      //   .insert([logData])
      //   .select()
      //   .single();
      
      return NextResponse.json({
        success: true,
        message: 'Security log created',
        id: `log-${Date.now()}`,
      });
    } else if (type === 'system') {
      // TODO: Insert into system_logs table
      // const supabase = createClient();
      // const { data, error } = await supabase
      //   .from('system_logs')
      //   .insert([logData])
      //   .select()
      //   .single();
      
      return NextResponse.json({
        success: true,
        message: 'System log created',
        id: `sys-${Date.now()}`,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid log type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Logs API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
