import { apiClient } from './apiClient';
import { Survey, SurveyQuestion, SurveyResponse } from '../types';

export const surveyService = {
  async getSurveys(workspaceId: string | number): Promise<Survey[]> {
    return apiClient<Survey[]>(`/surveys/`, {
      params: { workspace_id: workspaceId },
    });
  },

  async getSurveyById(surveyId: string | number): Promise<Survey> {
    return apiClient<Survey>(`/surveys/${surveyId}`);
  },

  async createSurvey(workspaceId: string | number, payload: { title: string; description?: string; questions: SurveyQuestion[] }): Promise<Survey> {
    return apiClient<Survey>(`/surveys/`, {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: workspaceId,
        ...payload,
      }),
    });
  },

  async getSurveyResponses(surveyId: string | number): Promise<SurveyResponse[]> {
    return apiClient<SurveyResponse[]>(`/surveys/${surveyId}/responses`);
  },

  async submitPublicResponse(surveyId: string | number, answers: Record<string, any>): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/surveys/public/${surveyId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};
