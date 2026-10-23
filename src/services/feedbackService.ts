import { apiClient } from './apiClient';
import { UserFeedbackSubmission } from '../types';

export const feedbackService = {
  async getFeedbackQuestions(): Promise<any[]> {
    return apiClient<any[]>('/feedback-questionnaire/active');
  },

  async submitFeedback(payload: UserFeedbackSubmission): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/user-feedback/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
