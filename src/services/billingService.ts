import { apiClient } from './apiClient';
import { MentorUsageInfo, Plan } from '../types';

export interface PlanFeatureItem {
  label: string;
  comingSoon?: boolean;
}

export function formatStorageSize(limitMB: number | null | undefined): string {
  if (limitMB == null || limitMB <= 0) return '200 MB';
  if (limitMB >= 1024) {
    const gb = Math.round((limitMB / 1024) * 10) / 10;
    return `${gb} GB`;
  }
  return `${limitMB} MB`;
}

export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getPlanFeatureItems(plan: any): PlanFeatureItem[] {
  const items: PlanFeatureItem[] = [];
  const add = (label: string | null | false | undefined, comingSoon = false) => {
    if (label) items.push(comingSoon ? { label, comingSoon } : { label });
  };
  const code = (plan.code ?? '').toLowerCase();
  const isFree = plan.price_monthly === 0 || code === 'starter' || code === 'free';
  const minutes = plan.mentor_minutes;
  const advanced = Boolean(plan.advanced_intelligence);
  const survey = Boolean(plan.survey_intelligence);

  if (isFree) {
    add('1 Complete AI Idea Validation');
    add(minutes != null ? `${minutes} Minutes AI Mentor` : '5 Minutes AI Mentor');
    add('Entrepreneurship & Idea Validation Certificate');
    add('Idea Validation Score');
    add('Key Risks & Strengths');
    add('Recommended Next Steps');
    add('7-Day Workspace Access');
    return items;
  }

  add(minutes != null ? `${minutes} Minutes AI Mentor / Month` : 'AI Mentor Voice & Chat');
  const ws = plan.workspace_limit;
  add(ws != null ? `${ws} Idea Workspaces` : 'Unlimited Idea Workspaces');
  add('Full AI Idea Validation');
  if (advanced) {
    add('AI Market Research & Survey Intelligence');
    add('Advanced Market & Competitor Intelligence', true);
    add('Advanced Survey Intelligence', true);
    add('Investor-Ready Insights & Reports', true);
  } else {
    add(plan.market_research && 'AI-Powered Market Research');
    add(survey && 'Survey Intelligence');
    add(survey && 'AI Survey Generation');
  }
  const regen = plan.regeneration_limit;
  if (survey && regen != null && regen > 0) {
    add(`${regen} Survey Regenerations / Workspace`);
  }
  const reruns = plan.stage_rerun;
  if (reruns != null && reruns > 0) {
    add(`${reruns} Validation Reruns / Workspace`);
  }
  const responses = plan.survey_response_cap;
  if (survey && responses != null && responses > 0) {
    add(`Up to ${responses.toLocaleString('en-IN')} Survey Responses / Workspace`);
  }
  if (plan.export_enabled) {
    add('Validation Report Export');
  }
  if (plan.priority_processing) {
    add('Priority AI Processing', true);
  }
  if (plan.storage_limit != null) {
    add(`${formatStorageSize(plan.storage_limit)} Storage`);
  }
  return items;
}

export const billingService = {
  async getPlans(): Promise<Plan[]> {
    try {
      const res = await apiClient<{ plans?: Plan[] } | Plan[]>('/plans');
      if (Array.isArray(res)) return res;
      if (res && res.plans && Array.isArray(res.plans)) return res.plans;
      return [];
    } catch {
      return [];
    }
  },

  async getAccountStatus(): Promise<{
    active_plan: string;
    has_active_subscription: boolean;
    trial_days_left: number;
    can_create_workspace: boolean;
    mentor_minutes_remaining?: number;
  }> {
    try {
      return await apiClient('/billing/status');
    } catch {
      return {
        active_plan: 'starter',
        has_active_subscription: false,
        trial_days_left: 7,
        can_create_workspace: true,
        mentor_minutes_remaining: 5,
      };
    }
  },

  async getMentorUsage(): Promise<MentorUsageInfo> {
    try {
      return await apiClient<MentorUsageInfo>('/billing/usage/mentor');
    } catch {
      return {
        voice_minutes_used: 0,
        voice_minutes_total: 5,
        chat_messages_used: 0,
        chat_messages_total: 100,
        workspaces_used: 1,
        workspaces_total: 1,
        active_plan_code: 'starter',
        trial_days_remaining: 7,
      };
    }
  },

  async selectFreeTrial(planCode: string = 'starter'): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/billing/subscription/starter', {
      method: 'POST',
      body: JSON.stringify({ plan_code: planCode }),
    });
  },

  async cancelSubscription(): Promise<{ success: boolean; data?: any; message?: string }> {
    return apiClient('/billing/cancel', {
      method: 'POST',
    });
  },
};
