import type {
  User,
  UserProfile,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  Source,
  SourceCategory,
  Scan,
  Match,
  RemovalRequest,
  MonitoringPlan,
  MonitoringEvent,
  Notification,
  NotificationPreference,
  Plan,
  Subscription,
  Invoice,
  DashboardStats,
  PaginatedResponse,
} from './api.types';

// Configure API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private authToken?: string;

  constructor() {
    // Try to load token from localStorage and cookie on init
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.authToken = token;
      }
    }
  }

  setAuthToken(token: string) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      // Set cookie with proper options for middleware
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
  }

  clearAuthToken() {
    this.authToken = undefined;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Clear cookie by setting it with max-age=0
      document.cookie = 'auth_token=; path=/; max-age=0';
    }
  }

  getAuthToken() {
    return this.authToken;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    retryCount = 0
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryCount === 0 && typeof window !== 'undefined') {
        try {
          await this.refreshToken();
          // Retry the original request with the new token
          return this.request<T>(method, endpoint, body, retryCount + 1);
        } catch {
          // Refresh failed - clear auth and let user re-login
          this.clearAuthToken();
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          const error = {
            code: 'HTTP_401',
            message: 'Authentication required',
            details: { code: 'token_expired', detail: 'Session expired. Please login again.' },
          };
          throw error;
        }
      }

      const errorData = await response.json().catch(() => null);

      // Extract error message from Django's custom format
      let errorMessage = response.statusText;
      if (errorData?.error?.detail) {
        // Django validation errors: {error: {detail: {field: [errors]}}}
        errorMessage = JSON.stringify(errorData.error.detail);
      } else if (errorData?.error?.detail) {
        errorMessage = errorData.error.detail;
      }

      const error = {
        code: `HTTP_${response.status}`,
        message: errorMessage,
        details: errorData?.error?.detail || errorData,
      };
      throw error;
    }

    return response.json();
  }

  // ── Authentication ─────────────────────────────────────────────────────

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: {
        access: string;
        refresh: string;
        user: User;
      };
    }>('POST', '/auth/login/', data);
    
    if (response.data?.access) {
      this.setAuthToken(response.data.access);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      return {
        access: response.data.access,
        refresh: response.data.refresh,
        user: response.data.user,
      };
    }
    throw new Error('Login failed - no tokens received');
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: {
        access: string;
        refresh: string;
        user: User;
      };
    }>('POST', '/auth/register/', data);
    
    if (response.data?.access) {
      this.setAuthToken(response.data.access);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
    }
    return response.data.user;
  }

  async logout(): Promise<void> {
    try {
      await this.request<Record<string, never>>('POST', '/auth/logout/', {
        refresh: localStorage.getItem('refresh_token'),
      });
    } finally {
      this.clearAuthToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refresh_token');
      }
    }
  }

  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Use fetch directly to avoid infinite loop with request()
    const url = `${API_BASE}/auth/token/refresh/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    if (data.access) {
      this.setAuthToken(data.access);
      // Also save the new refresh token if provided
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
    }
    return data;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('GET', '/auth/profile/');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('PATCH', '/auth/profile/details/', data);
  }

  async changePassword(data: { current_password: string; new_password: string }): Promise<void> {
    return this.request<void>('POST', '/auth/password/change/', data);
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    return this.request<void>('POST', '/auth/password/reset/', data);
  }

  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<void> {
    return this.request<void>('POST', '/auth/password/reset/confirm/', data);
  }

  async verifyEmail(token: string): Promise<void> {
    return this.request<void>('POST', '/auth/verify-email/', { token });
  }

  // ── Dashboard ──────────────────────────────────────────────────────────

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('GET', '/dashboard/stats/');
  }

  // ── Scans ──────────────────────────────────────────────────────────────

  async listScans(params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<PaginatedResponse<Scan>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.page_size) query.set('page_size', params.page_size.toString());
    if (params?.status) query.set('status', params.status);
    return this.request<PaginatedResponse<Scan>>('GET', `/scans/?${query}`);
  }

  async getScan(id: string): Promise<Scan> {
    return this.request<Scan>('GET', `/scans/${id}/`);
  }

  async createScan(data: {
    source_ids?: string[];
    scan_type?: 'full' | 'partial' | 'monitoring';
    identity_id?: string;
  }): Promise<Scan> {
    return this.request<Scan>('POST', '/scans/', data);
  }

  async cancelScan(id: string): Promise<Scan> {
    return this.request<Scan>('POST', `/scans/${id}/cancel/`);
  }

  // ── Sources ────────────────────────────────────────────────────────────

  async listSources(params?: {
    page?: number;
    category?: string;
    risk_level?: string;
  }): Promise<PaginatedResponse<Source>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.category) query.set('category', params.category);
    if (params?.risk_level) query.set('risk_level', params.risk_level);
    return this.request<PaginatedResponse<Source>>('GET', `/sources/?${query}`);
  }

  async listCategories(): Promise<SourceCategory[]> {
    return this.request<SourceCategory[]>('GET', '/sources/categories/');
  }

  // ── Matches ────────────────────────────────────────────────────────────

  async listMatches(params?: {
    page?: number;
    status?: string;
    source?: string;
    risk_min?: number;
    risk_max?: number;
  }): Promise<PaginatedResponse<Match>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.source) query.set('source', params.source);
    if (params?.risk_min) query.set('risk_min', params.risk_min.toString());
    if (params?.risk_max) query.set('risk_max', params.risk_max.toString());
    return this.request<PaginatedResponse<Match>>('GET', `/matches/?${query}`);
  }

  async getMatch(id: string): Promise<Match> {
    return this.request<Match>('GET', `/matches/${id}/`);
  }

  async updateMatchStatus(id: string, status: Match['status']): Promise<Match> {
    return this.request<Match>('POST', `/matches/${id}/update_status/`, { status });
  }

  // ── Removals ───────────────────────────────────────────────────────────

  async listRemovals(params?: {
    page?: number;
    status?: string;
    priority?: string;
  }): Promise<PaginatedResponse<RemovalRequest>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    return this.request<PaginatedResponse<RemovalRequest>>('GET', `/removals/?${query}`);
  }

  async createRemoval(matchId: string): Promise<RemovalRequest> {
    return this.request<RemovalRequest>('POST', '/removals/', { match: matchId });
  }

  // ── Monitoring ─────────────────────────────────────────────────────────

  async listMonitoringPlans(): Promise<MonitoringPlan[]> {
    return this.request<MonitoringPlan[]>('GET', '/monitoring/plans/');
  }

  async createMonitoringPlan(data: Partial<MonitoringPlan>): Promise<MonitoringPlan> {
    return this.request<MonitoringPlan>('POST', '/monitoring/plans/', data);
  }

  async listMonitoringEvents(params?: {
    page?: number;
    acknowledged?: boolean;
  }): Promise<PaginatedResponse<MonitoringEvent>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.acknowledged !== undefined) query.set('acknowledged', params.acknowledged.toString());
    return this.request<PaginatedResponse<MonitoringEvent>>('GET', `/monitoring/events/?${query}`);
  }

  async acknowledgeEvent(id: string): Promise<MonitoringEvent> {
    return this.request<MonitoringEvent>('POST', `/monitoring/events/${id}/acknowledge/`);
  }

  // ── Notifications ──────────────────────────────────────────────────────

  async listNotifications(params?: {
    page?: number;
    unread_only?: boolean;
  }): Promise<PaginatedResponse<Notification>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.unread_only) query.set('unread_only', 'true');
    return this.request<PaginatedResponse<Notification>>('GET', `/notifications/?${query}`);
  }

  async markNotificationRead(id: string): Promise<Notification> {
    return this.request<Notification>('POST', `/notifications/${id}/mark_read/`);
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.request<void>('POST', '/notifications/mark_all_read/');
  }

  async getNotificationPreferences(): Promise<NotificationPreference> {
    return this.request<NotificationPreference>('GET', '/notifications/preferences/');
  }

  async updateNotificationPreferences(data: Partial<NotificationPreference>): Promise<NotificationPreference> {
    return this.request<NotificationPreference>('PATCH', '/notifications/preferences/', data);
  }

  // ── Billing ────────────────────────────────────────────────────────────

  async listPlans(): Promise<Plan[]> {
    return this.request<Plan[]>('GET', '/billing/plans/');
  }

  async getSubscription(): Promise<Subscription> {
    return this.request<Subscription>('GET', '/billing/subscription/');
  }

  async createSubscription(planId: string): Promise<Subscription> {
    return this.request<Subscription>('POST', '/billing/subscription/', { plan: planId });
  }

  async cancelSubscription(): Promise<Subscription> {
    return this.request<Subscription>('POST', '/billing/subscription/cancel/');
  }

  async listInvoices(): Promise<PaginatedResponse<Invoice>> {
    return this.request<PaginatedResponse<Invoice>>('GET', '/billing/invoices/');
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances if needed
export { ApiClient };
