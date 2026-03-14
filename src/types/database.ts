// ── Database row types ──────────────────────────────────────────────────────

export type MembershipRole = "owner" | "admin" | "member";
export type CallStatus = "ringing" | "in_progress" | "completed" | "missed" | "failed";
export type UrgencyLevel = "low" | "medium" | "high";
export type MessageDirection = "inbound" | "outbound";
export type MessageRole = "ai" | "caller" | "system";
export type NotificationType = "new_call" | "missed_call" | "urgent_call" | "system";
export type PhoneNumberStatus = "active" | "inactive" | "pending";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  timezone: string;
  greeting: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  org_id: string;
  role: MembershipRole;
  created_at: string;
}

export interface PhoneNumber {
  id: string;
  org_id: string;
  phone_number: string;
  friendly_name: string | null;
  status: PhoneNumberStatus;
  twilio_sid: string | null;
  created_at: string;
}

export interface Call {
  id: string;
  org_id: string;
  phone_number_id: string | null;
  twilio_call_sid: string | null;
  caller_number: string;
  caller_name: string | null;
  to_number: string | null;
  status: CallStatus;
  urgency: UrgencyLevel;
  duration_seconds: number;
  summary: string | null;
  intent: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  call_id: string;
  role: MessageRole;
  direction: MessageDirection;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  org_id: string;
  call_id: string | null;
  type: NotificationType;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

export interface OfficeHours {
  id: string;
  org_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

export interface OrgSettings {
  id: string;
  org_id: string;
  ai_active: boolean;
  sms_followup: boolean;
  twilio_account_sid: string | null;
  twilio_auth_token: string | null;
  after_hours_message: string | null;
  created_at: string;
  updated_at: string;
}

// ── View types ──────────────────────────────────────────────────────────────

export interface DailyCallStats {
  org_id: string;
  call_date: string;
  total_calls: number;
  completed_calls: number;
  missed_calls: number;
  high_urgency_calls: number;
  avg_duration_seconds: number | null;
}

// ── Membership with joined profile (for team pages) ─────────────────────────

export interface MembershipWithProfile extends Membership {
  profiles: Profile;
}

// ── Call with messages (for detail pages) ────────────────────────────────────

export interface CallWithMessages extends Call {
  messages: Message[];
}
