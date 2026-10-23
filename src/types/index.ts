export interface User {
  id: number | string;
  email: string;
  full_name?: string;
  name?: string;
  display_name?: string;
  avatar_url?: string | null;
  role: 'user' | 'admin' | string;
  auth_provider?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  plan?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  message?: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  confirm_password?: string;
  is_age_confirmed?: boolean;
  terms_version_accepted?: string;
  privacy_version_accepted?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
  flow?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  email: string;
  token: string;
  new_password: string;
}

export type WorkspaceStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export interface ValidationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  score?: number | null;
  summary?: string | null;
  completed_at?: string | null;
}

export interface Workspace {
  id: number | string;
  name: string;
  title?: string;
  description?: string;
  industry?: string;
  target_audience?: string;
  business_model?: string;
  status: WorkspaceStatus;
  progress: number;
  current_stage?: string;
  overall_score?: number | null;
  created_at: string;
  updated_at?: string;
  is_archived?: boolean;
  steps?: ValidationStep[];
  mentor_chat_count?: number;
  survey_count?: number;
  attachments_count?: number;
}

export interface CreateWorkspaceDto {
  name: string;
  description: string;
  industry?: string;
  target_audience?: string;
  business_model?: string;
  initial_prompt?: string;
}

export interface MentorMessage {
  id: string | number;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  is_streaming?: boolean;
  suggested_prompts?: string[];
  stage?: string;
}

export interface MentorConversation {
  id: string | number;
  workspace_id: string | number;
  title?: string;
  created_at: string;
  updated_at: string;
  messages: MentorMessage[];
}

export interface SuggestedPrompt {
  id: string;
  text: string;
  category: 'idea' | 'market' | 'finance' | 'validation' | 'general';
}

export interface SurveyQuestion {
  id: string | number;
  question_text: string;
  question_type: 'single_choice' | 'multi_choice' | 'text' | 'rating';
  options?: string[];
  required?: boolean;
}

export interface Survey {
  id: string | number;
  workspace_id: string | number;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed';
  public_url?: string;
  responses_count: number;
  questions: SurveyQuestion[];
  created_at: string;
}

export interface SurveyResponse {
  id: string | number;
  survey_id: string | number;
  respondent_id?: string;
  answers: Record<string, any>;
  submitted_at: string;
}

export interface QuestionnaireQuestion {
  id: string | number;
  step_number: number;
  title: string;
  description?: string;
  question_type: 'text' | 'choice' | 'multi_choice' | 'scale';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface QuestionnaireAnswer {
  question_id: string | number;
  answer: string | string[] | number;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorInsight {
  name: string;
  strengths: string;
  weaknesses: string;
  market_share?: string;
}

export interface ReportScore {
  category: string;
  score: number; // 0 - 100
  benchmark?: number;
  summary: string;
}

export interface ValidationReport {
  id: string | number;
  workspace_id: string | number;
  overall_score: number;
  viability_level: 'High' | 'Moderate' | 'Low';
  executive_summary: string;
  scores: ReportScore[];
  swot: SWOTAnalysis;
  competitors: CompetitorInsight[];
  recommendations: string[];
  risks: string[];
  next_milestones: string[];
  generated_at: string;
  certificate_available: boolean;
}

export interface PlanFeature {
  id: string;
  name: string;
  included: boolean;
  limit_description?: string;
}

export interface Plan {
  id: string;
  name: string;
  code: 'starter' | 'builder' | 'pro' | string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  description: string;
  popular?: boolean;
  features: string[];
  workspace_limit: number;
  mentor_voice_minutes: number;
  mentor_chat_messages: number;
}

export interface MentorUsageInfo {
  voice_minutes_used: number;
  voice_minutes_total: number;
  chat_messages_used: number;
  chat_messages_total: number;
  workspaces_used: number;
  workspaces_total: number;
  active_plan_code: string;
  trial_days_remaining?: number | null;
}

export interface UserFeedbackSubmission {
  rating: number; // 1 - 5
  emoji_reaction?: 'love' | 'happy' | 'neutral' | 'sad' | 'angry';
  category: string;
  comments: string;
  page_context?: string;
}

export interface VoiceLocale {
  code: string;
  label: string;
  native_label: string;
  voice_name: string;
  accent: string;
}

export interface VoiceMessage {
  type: 'text' | 'audio' | 'transcript' | 'status' | 'error';
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}
