/**
 * Mouse Platform API Client
 * Connects Next.js frontend to FastAPI backend on port 8000
 * All methods return typed responses with error handling
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add auth token if available (browser-side)
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('mouse_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.token) {
            headers['Authorization'] = `Bearer ${parsed.token}`;
          }
        } catch {}
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: data?.detail || data?.error || `Request failed (${response.status})`,
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (error: any) {
    console.error(`[API] ${path} failed:`, error.message);
    return { error: error.message || 'Network error', status: 0 };
  }
}

// ============================================
// AUTH
// ============================================
export const auth = {
  signup: (email: string, password: string, company?: string, firstName?: string, lastName?: string) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, company_name: company, first_name: firstName, last_name: lastName }),
    }),

  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  verify: (token: string) =>
    apiRequest('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  switchPortal: (userId: string, portal: string, token: string) =>
    apiRequest('/auth/switch-portal', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId, portal }),
    }),

  logout: (token: string) =>
    apiRequest('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ============================================
// STRIPE / PAYMENTS
// ============================================
export const payments = {
  createCheckout: (planId: string, userId: string, successUrl: string, cancelUrl: string) =>
    apiRequest('/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, user_id: userId, success_url: successUrl, cancel_url: cancelUrl }),
    }),

  purchaseHours: (userId: string, packageId: string, successUrl: string, cancelUrl: string) =>
    apiRequest('/stripe/purchase-hours', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, package_id: packageId, success_url: successUrl, cancel_url: cancelUrl }),
    }),

  getSubscription: (userId: string) =>
    apiRequest(`/stripe/subscription/${userId}`),

  getPayments: (userId: string) =>
    apiRequest(`/stripe/payments/${userId}`),

  getConfig: () =>
    apiRequest('/stripe/config'),

  createPortal: (userId: string, returnUrl: string) =>
    apiRequest('/stripe/portal', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, return_url: returnUrl }),
    }),
};

// ============================================
// WORK HOURS
// ============================================
export const workHours = {
  getStatus: (userId: string) =>
    apiRequest(`/work-hours/status/${userId}`),

  getUsageHistory: (userId: string) =>
    apiRequest(`/work-hours/usage-history/${userId}`),

  getPricing: () =>
    apiRequest('/work-hours/pricing'),

  logUsage: (userId: string, featureType: string, rawCost: number, description: string) =>
    apiRequest('/work-hours/log-usage', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, feature_type: featureType, raw_cost: rawCost, description }),
    }),

  setAlertThreshold: (userId: string, threshold: number) =>
    apiRequest(`/work-hours/set-alert-threshold/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ threshold }),
    }),
};

// ============================================
// MARKETPLACE
// ============================================
export const marketplace = {
  getEmployees: (category?: string) =>
    apiRequest(`/marketplace/employees${category ? `?category=${encodeURIComponent(category)}` : ''}`),

  getEmployee: (templateId: string) =>
    apiRequest(`/marketplace/employees/${templateId}`),

  hire: (customerId: string, templateId: string, employeeName?: string) =>
    apiRequest('/marketplace/hire', {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId, template_id: templateId, employee_name: employeeName }),
    }),

  startInterview: (templateId: string) =>
    apiRequest('/marketplace/interview/start', {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId }),
    }),

  sendInterviewMessage: (sessionId: string, message: string) =>
    apiRequest('/marketplace/interview/message', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, message }),
    }),

  endInterview: (sessionId: string) =>
    apiRequest('/marketplace/interview/end', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),

  getMyEmployees: (customerId: string) =>
    apiRequest(`/marketplace/my-employees/${customerId}`),
};

// ============================================
// LEADS
// ============================================
export const leads = {
  search: (query: string, location?: string, radius?: number, industry?: string) =>
    apiRequest('/leads/search', {
      method: 'POST',
      body: JSON.stringify({ query, location, radius_miles: radius, industry }),
    }),

  getAll: () =>
    apiRequest('/leads/'),

  updateStatus: (leadId: string, status: string) =>
    apiRequest(`/leads/${leadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  addActivity: (leadId: string, activityType: string, notes: string) =>
    apiRequest(`/leads/${leadId}/activity`, {
      method: 'POST',
      body: JSON.stringify({ activity_type: activityType, notes }),
    }),

  save: (leadId: string, leadData: any) =>
    apiRequest('/leads/save', {
      method: 'POST',
      body: JSON.stringify({ lead_id: leadId, ...leadData }),
    }),
};

// ============================================
// RESELLER
// ============================================
export const reseller = {
  configure: (resellerId: string, config: any) =>
    apiRequest('/reseller/configure', {
      method: 'POST',
      body: JSON.stringify({ reseller_id: resellerId, ...config }),
    }),

  getConfig: (resellerId: string) =>
    apiRequest(`/reseller/configs/${resellerId}`),

  createInvite: (resellerId: string, email: string) =>
    apiRequest('/reseller/invite', {
      method: 'POST',
      body: JSON.stringify({ reseller_id: resellerId, email }),
    }),

  getInvite: (token: string) =>
    apiRequest(`/reseller/invite/${token}`),

  claimInvite: (token: string, userId: string) =>
    apiRequest(`/reseller/invite/${token}/claim`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),

  getCommissions: (resellerId: string) =>
    apiRequest(`/reseller/commissions/${resellerId}`),

  getCustomers: (resellerId: string) =>
    apiRequest(`/reseller/my-customers/${resellerId}`),
};

// ============================================
// SALES PIPELINE
// ============================================
export const sales = {
  createDeal: (deal: any) =>
    apiRequest('/sales/deals', {
      method: 'POST',
      body: JSON.stringify(deal),
    }),

  getDeals: () =>
    apiRequest('/sales/deals'),

  getDeal: (dealId: string) =>
    apiRequest(`/sales/deals/${dealId}`),

  updateStage: (dealId: string, stage: string) =>
    apiRequest(`/sales/deals/${dealId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    }),

  addActivity: (dealId: string, activityType: string, notes: string) =>
    apiRequest(`/sales/deals/${dealId}/activity`, {
      method: 'POST',
      body: JSON.stringify({ activity_type: activityType, notes }),
    }),

  logTask: (task: any) =>
    apiRequest('/sales/tasks/log', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  getTasks: () =>
    apiRequest('/sales/tasks'),

  getMetrics: () =>
    apiRequest('/sales/metrics'),

  getDashboard: () =>
    apiRequest('/sales/dashboard'),

  recordMetric: (metric: any) =>
    apiRequest('/sales/metrics/record', {
      method: 'POST',
      body: JSON.stringify(metric),
    }),
};

// ============================================
// VM / DEPLOYMENT
// ============================================
export const vm = {
  provision: (customerId: string, employeeId: string, role: string) =>
    apiRequest('/vm/provision', {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId, employee_id: employeeId, role }),
    }),

  getStatus: (vmId: string) =>
    apiRequest(`/vm/status/${vmId}`),

  screenshot: (vmId: string) =>
    apiRequest(`/vm/screenshot/${vmId}`, { method: 'POST' }),

  delete: (vmId: string) =>
    apiRequest(`/vm/${vmId}`, { method: 'DELETE' }),
};

// ============================================
// HEALTH
// ============================================
export const health = {
  check: () => apiRequest('/health'),
};

// Default export for convenience
const api = { auth, payments, workHours, marketplace, leads, reseller, sales, vm, health };
export default api;
