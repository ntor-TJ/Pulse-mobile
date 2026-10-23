import { apiClient, getApiBaseUrl, getAuthToken } from './apiClient';
import { ValidationReport, ValidationStep } from '../types';

export const validationService = {
  async getValidationSteps(workspaceId: string | number): Promise<ValidationStep[]> {
    return apiClient<ValidationStep[]>(`/orchestration/${workspaceId}/steps`);
  },

  async triggerValidationStep(workspaceId: string | number, stepId: string): Promise<ValidationStep> {
    return apiClient<ValidationStep>(`/orchestration/${workspaceId}/steps/${stepId}/execute`, {
      method: 'POST',
    });
  },

  async runFullValidation(workspaceId: string | number): Promise<{ job_id: string; status: string }> {
    return apiClient<{ job_id: string; status: string }>(`/orchestration/${workspaceId}/run-all`, {
      method: 'POST',
    });
  },

  async getValidationReport(workspaceId: string | number): Promise<ValidationReport> {
    return apiClient<ValidationReport>(`/reports/${workspaceId}`);
  },

  async getCertificateBlob(workspaceId: string | number): Promise<Blob> {
    const token = await getAuthToken();
    const baseUrl = await getApiBaseUrl();

    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/certificate`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download certificate with status ${response.status}`);
    }

    return response.blob();
  },
};
