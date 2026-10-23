import { apiClient } from './apiClient';
import { QuestionnaireAnswer, QuestionnaireQuestion } from '../types';

export const questionnaireService = {
  async getQuestions(workspaceId: string | number): Promise<QuestionnaireQuestion[]> {
    return apiClient<QuestionnaireQuestion[]>(`/interactive-questionnaire/${workspaceId}/questions`);
  },

  async submitAnswers(
    workspaceId: string | number,
    answers: QuestionnaireAnswer[]
  ): Promise<{ message: string; completion_score?: number }> {
    return apiClient<{ message: string; completion_score?: number }>(
      `/interactive-questionnaire/${workspaceId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }
    );
  },

  async getSavedAnswers(workspaceId: string | number): Promise<Record<string, any>> {
    return apiClient<Record<string, any>>(`/interactive-questionnaire/${workspaceId}/answers`);
  },
};
