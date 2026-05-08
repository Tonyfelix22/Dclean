// ============================================================
// Django Privacy SaaS API Types
// Matches the Django backend models exactly
// ============================================================

// ── Auth & User Types ────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user' | 'staff';
  is_verified: boolean;
  date_joined: string;
}

export interface UserProfile {
  id: string;
  user: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  avatar?: string;
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  password: string;
  password2: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

// ── Sources Types ────────────────────────────────────────────────────────

export interface SourceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Source {
  id: string;
  name: string;
  domain: string;
  url: string;
  category: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  description?: string;
  icon?: string;
  stats?: {
    total_scans: number;
    success_rate: number;
    avg_removal_days: number;
  };
}

export interface RemovalTemplate {
  id: string;
  source: string;
  method: 'email' | 'form' | 'api' | 'manual';
  contact_email?: string;
  contact_url?: string;
  email_template?: string;
  turnaround_days?: number;
  instructions?: string;
}

// ── Scans Types ──────────────────────────────────────────────────────────

export interface SearchIdentity {
  id: string;
  user: string;
  full_name?: string;
  alias_names?: string[];
  emails?: string[];
  phones?: string[];
  addresses?: string[];
  usernames?: string[];
  is_active: boolean;
}

export interface Scan {
  id: string;
  user: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  scan_type: 'full' | 'partial' | 'monitoring';
  progress: number;
  sources_count: number;
  matches_found: number;
  started_at: string;
  completed_at?: string;
  created_at: string;
  celery_task_id?: string;
}

export interface ScanTarget {
  id: string;
  scan: string;
  source: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  matches_found: number;
}

// ── Matches Types ────────────────────────────────────────────────────────

export interface Match {
  id: string;
  scan: string;
  source: string;
  user: string;
  url: string;
  title?: string;
  confidence_score: number;
  risk_score: number;
  status: 'active' | 'removal_pending' | 'removed' | 'unresolvable' | 'disputed' | 'false_positive';
  detected_fields: string[];
  raw_data?: Record<string, any>;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

export interface MatchSnapshot {
  id: string;
  match: string;
  snapshot_data: Record<string, any>;
  created_at: string;
}

export interface MatchTag {
  id: string;
  match: string;
  tag: string;
  created_by: string;
  created_at: string;
}

// ── Removals Types ───────────────────────────────────────────────────────

export interface RemovalRequest {
  id: string;
  match: string;
  user: string;
  source: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'confirmed' | 'failed' | 'escalated' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  method: 'email' | 'form' | 'api' | 'manual';
  attempts_count: number;
  assigned_to?: string;
  submitted_at?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface RemovalAttempt {
  id: string;
  removal: string;
  attempt_number: number;
  method: string;
  response_code?: number;
  response_body?: string;
  success: boolean;
  created_at: string;
}

export interface RemovalLog {
  id: string;
  removal: string;
  action: string;
  details?: string;
  created_at: string;
  created_by?: string;
}

// ── Monitoring Types ─────────────────────────────────────────────────────

export interface MonitoringPlan {
  id: string;
  user: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  sources?: string[];
  email_notifications: boolean;
  in_app_notifications: boolean;
  next_run_at?: string;
  last_run_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonitoringEvent {
  id: string;
  plan: string;
  user: string;
  event_type: 'new_match' | 'reappearance' | 'removal_confirmed' | 'score_change';
  details: Record<string, any>;
  acknowledged: boolean;
  acknowledged_at?: string;
  created_at: string;
}

// ── Notifications Types ──────────────────────────────────────────────────

export interface Notification {
  id: string;
  user: string;
  type: 'scan_complete' | 'new_match' | 'removal_update' | 'reappearance' | 'identity_verified' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  scan_alerts: boolean;
  removal_updates: boolean;
  new_match_alerts: boolean;
  reappearance_alerts: boolean;
  weekly_digest: boolean;
}

// ── Billing Types ────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: Record<string, any>;
  scan_limit?: number;
  match_limit?: number;
  source_limit?: number;
  removal_limit?: number;
  stripe_price_id?: string;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user: string;
  plan: string;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';
  stripe_subscription_id?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  user: string;
  subscription: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  stripe_invoice_id?: string;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
  pdf_url?: string;
}

// ── Audit Types ──────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  user?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  changes?: Record<string, any>;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  user?: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address?: string;
  details?: Record<string, any>;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

// ── API Pagination ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── API Error ────────────────────────────────────────────────────────────

export interface ApiError {
  success: false;
  error: {
    code?: string;
    message: string;
    details?: Record<string, any>;
  };
}

// ── Dashboard Stats ──────────────────────────────────────────────────────

export interface DashboardStats {
  total_scans: number;
  total_matches: number;
  total_removals: number;
  active_removals: number;
  risk_score: number;
  recent_scans: Scan[];
  recent_matches: Match[];
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    created_at: string;
  }>;
}
