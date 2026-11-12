/**
 * RRMS Super Admin API Integration Client
 * Connects DemoRRMSFE with Spring Boot backend (rmsBE-main).
 */

const TOKEN_KEY = 'rrms_jwt_token';
const API_BASE = '/api';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore storage errors */
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson?.message) errorMsg = errJson.message;
      else if (errJson?.error?.message) errorMsg = errJson.error.message;
      else if (typeof errJson === 'string') errorMsg = errJson;
    } catch {
      /* ignore JSON parse failure on error */
    }
    const error = new Error(errorMsg);
    (error as any).status = response.status;
    throw error;
  }

  // Handle empty responses (204 No Content or void endpoints)
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────
export const authApi = {
  async superAdminLogin(email: string, password: string) {
    try {
      const res = await request<{
        accessToken?: string;
        token?: string;
        refreshToken?: string;
        mustChangePassword?: boolean;
        mfaRequired?: boolean;
      }>('/auth/superadmin/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const token = res.accessToken || res.token;
      if (token) {
        setAuthToken(token);
      }
      return res;
    } catch (err: any) {
      // Fallback attempt to general login if superadmin endpoint rejected
      const res = await request<{
        accessToken?: string;
        token?: string;
        refreshToken?: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const token = res.accessToken || res.token;
      if (token) {
        setAuthToken(token);
      }
      return res;
    }
  },

  async getCurrentUser() {
    return request<any>('/auth/me');
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },
};

// ─────────────────────────────────────────────────────────────
// Super Admin Platform API
// ─────────────────────────────────────────────────────────────
export const superAdminApi = {
  // Check if backend is reachable
  async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/tenants`, { method: 'GET' });
      return res.status < 500;
    } catch {
      return false;
    }
  },

  // Overview
  async getOverviewStats() {
    return request<{
      totalTenants: number;
      activeTenants: number;
      suspendedTenants: number;
      totalOwners: number;
      openTickets: number;
      criticalTickets: number;
      cpuUsagePercent: number;
      memoryUsagePercent: number;
      maintenanceMode: boolean;
    }>('/overview/stats');
  },

  async getOverviewActivity() {
    return request<{
      recentTickets: any[];
      recentAuditLogs: any[];
      activeAlerts: string[];
    }>('/overview/activity');
  },

  // Tenants
  async getTenants() {
    return request<any[]>('/tenants');
  },

  async getTenant(id: string) {
    return request<any>(`/tenants/${id}`);
  },

  async createTenant(payload: {
    resortName: string;
    tenantCode: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone?: string;
    ownerPassword?: string;
    tier?: string;
    location?: string;
    address?: string;
    city?: string;
    state?: string;
    resortPhone?: string;
    roomsCount?: number;
  }) {
    // Map location into city/state if needed
    let city = payload.city;
    let state = payload.state;
    if (!city && payload.location) {
      const parts = payload.location.split(',').map((p) => p.trim());
      city = parts[0] || 'Candolim';
      state = parts[1] || 'Goa';
    }

    return request<any>('/tenants', {
      method: 'POST',
      body: JSON.stringify({
        resortName: payload.resortName,
        tenantCode: payload.tenantCode,
        ownerName: payload.ownerName,
        ownerEmail: payload.ownerEmail,
        ownerPhone: payload.ownerPhone || '9876543210',
        ownerPassword: payload.ownerPassword || 'Resort@123',
        tier: payload.tier || 'Enterprise',
        address: payload.address || payload.location || 'Candolim Beach Road',
        city: city || 'Candolim',
        state: state || 'Goa',
        resortPhone: payload.resortPhone || '9876543210',
        roomsCount: payload.roomsCount || 24,
      }),
    });
  },

  async updateTenant(
    id: string,
    payload: {
      resortName?: string;
      tier?: string;
      address?: string;
      city?: string;
      state?: string;
      phone?: string;
      roomsCount?: number;
    },
  ) {
    return request<any>(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async updateTenantStatus(id: string, status: string, reason?: string) {
    return request<any>(`/tenants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: status.toUpperCase(),
        reason: reason || 'Updated by Super Admin',
      }),
    });
  },

  // Owners
  async getOwners() {
    return request<any[]>('/owners');
  },

  async updateOwner(
    id: string,
    payload: {
      name?: string;
      email?: string;
      phone?: string;
      status?: string;
    },
  ) {
    return request<any>(`/owners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async resetOwnerPassword(id: string) {
    return request<{ ownerId: string; temporaryPassword?: string; message?: string }>(
      `/owners/${id}/reset-password`,
      { method: 'POST' },
    );
  },

  // Tickets
  async getTickets() {
    return request<any[]>('/tickets');
  },

  async getTicket(id: string) {
    return request<any>(`/tickets/${id}`);
  },

  async createTicket(payload: {
    tenantCode: string;
    title: string;
    category: string;
    priority: string;
    description: string;
    resortName?: string;
    ownerName?: string;
    ownerEmail?: string;
  }) {
    // Normalise category to match backend TicketCategory enum
    let category = payload.category.toUpperCase().replace(/\s+/g, '_');
    const validCategories = [
      'INFRASTRUCTURE',
      'BILLING',
      'AUTHENTICATION',
      'DATA_CORRUPTION',
      'FEATURE_REQUEST',
      'GENERAL_SUPPORT',
      'PAYMENTS',
      'INTEGRATIONS',
      'SECURITY',
      'SYSTEM',
    ];
    if (!validCategories.includes(category)) {
      if (category.includes('TECH') || category.includes('BUG')) category = 'SYSTEM';
      else if (category.includes('INTEGRAT')) category = 'INTEGRATIONS';
      else if (category.includes('PAY') || category.includes('BILL')) category = 'PAYMENTS';
      else if (category.includes('SEC')) category = 'SECURITY';
      else category = 'GENERAL_SUPPORT';
    }

    return request<any>('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        tenantCode: payload.tenantCode,
        resortName: payload.resortName || payload.tenantCode,
        ownerName: payload.ownerName || 'Platform Admin',
        ownerEmail: payload.ownerEmail || 'admin@rrms.com',
        title: payload.title,
        category,
        priority: payload.priority.toUpperCase(),
        description: payload.description,
      }),
    });
  },

  async updateTicket(
    id: string,
    payload: {
      status?: string;
      priority?: string;
      resolutionNotes?: string;
      assigneeName?: string;
    },
  ) {
    return request<any>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: payload.status ? payload.status.toUpperCase() : undefined,
        priority: payload.priority ? payload.priority.toUpperCase() : undefined,
        resolutionNotes: payload.resolutionNotes,
        assigneeName: payload.assigneeName,
      }),
    });
  },

  async addTicketReply(
    id: string,
    payload: {
      message: string;
      senderName?: string;
      senderRole?: string;
    },
  ) {
    return request<any>(`/tickets/${id}/replies`, {
      method: 'POST',
      body: JSON.stringify({
        message: payload.message,
        senderName: payload.senderName || 'Super Admin',
        senderRole: payload.senderRole || 'SUPER_ADMIN',
      }),
    });
  },

  // Config
  async getConfig() {
    return request<any>('/config');
  },

  async updateConfig(payload: any) {
    return request<any>('/config', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async toggleMaintenance() {
    return request<any>('/config/maintenance/toggle', { method: 'POST' });
  },

  // Audit
  async getAuditLogs(params?: {
    action?: string;
    actor?: string;
    tenantCode?: string;
    severity?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.actor) query.set('actor', params.actor);
    if (params?.tenantCode) query.set('tenantCode', params.tenantCode);
    if (params?.severity) query.set('severity', params.severity.toUpperCase());
    const qs = query.toString();
    return request<any[]>(`/audit${qs ? `?${qs}` : ''}`);
  },

  async recordAuditEvent(payload: {
    actor: string;
    action: string;
    details?: string;
    severity: string;
    tenantCode?: string;
    ipAddress?: string;
  }) {
    return request<any>('/audit', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        severity: payload.severity.toUpperCase(),
      }),
    });
  },

  async exportAuditCsv(): Promise<Blob> {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/audit/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to export audit logs');
    return res.blob();
  },

  // Monitoring
  async getTelemetry() {
    return request<{
      activeTenants: number;
      totalRoomsManaged: number;
      cpuUsagePercent: number;
      memoryUsagePercent: number;
      openCriticalTickets: number;
      apiRequestsPerMinute: number;
      uptimeSeconds: number;
      activeThreads: number;
      totalTenants: number;
      totalUsers: number;
      timestamp: string;
    }>('/monitoring/telemetry');
  },

  async syncCluster() {
    return request<{ message: string; timestamp: string }>('/monitoring/sync', {
      method: 'POST',
    });
  },
};

