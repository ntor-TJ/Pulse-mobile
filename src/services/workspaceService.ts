import { apiClient, getApiBaseUrl, getAuthToken } from './apiClient';
import { CreateWorkspaceDto, Workspace } from '../types';

export const workspaceService = {
  async getWorkspaces(params: { include_archived?: boolean } = {}): Promise<Workspace[]> {
    return apiClient<Workspace[]>('/workspace/', {
      params: { include_archived: params.include_archived },
    });
  },

  async getWorkspaceById(id: string | number): Promise<Workspace> {
    return apiClient<Workspace>(`/workspace/${id}`);
  },

  async createWorkspace(payload: CreateWorkspaceDto): Promise<Workspace> {
    return apiClient<Workspace>('/workspace/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateWorkspace(id: string | number, payload: Partial<CreateWorkspaceDto>): Promise<Workspace> {
    return apiClient<Workspace>(`/workspace/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteWorkspace(id: string | number, options: { hard_delete?: boolean } = {}): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/workspace/${id}`, {
      method: 'DELETE',
      params: { hard_delete: options.hard_delete },
    });
  },

  async archiveWorkspace(id: string | number): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/workspace/${id}/archive`, {
      method: 'POST',
    });
  },

  async restoreWorkspace(id: string | number): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/workspace/${id}/restore`, {
      method: 'POST',
    });
  },

  async getArchivedWorkspaces(): Promise<Workspace[]> {
    return apiClient<Workspace[]>('/workspace/archive');
  },

  async getAttachments(workspaceId: string | number): Promise<any[]> {
    return apiClient<any[]>(`/workspace/${workspaceId}/attachments`);
  },

  async uploadAttachment(workspaceId: string | number, file: { uri: string; name: string; type: string }): Promise<any> {
    const token = await getAuthToken();
    const baseUrl = await getApiBaseUrl();
    const formData = new FormData();

    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type || 'application/octet-stream',
    } as any);

    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    return response.json();
  },

  getCertificateDownloadUrl(workspaceId: string | number): string {
    return `/workspace/${workspaceId}/certificate`;
  },
};
