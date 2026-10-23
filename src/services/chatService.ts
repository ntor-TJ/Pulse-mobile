import { apiClient } from './apiClient';
import { MentorConversation, MentorMessage, SuggestedPrompt } from '../types';

export const chatService = {
  async getConversations(workspaceId: string | number): Promise<MentorConversation[]> {
    return apiClient<MentorConversation[]>(`/mentor/conversations`, {
      params: { workspace_id: workspaceId },
    });
  },

  async getMessages(workspaceId: string | number, conversationId?: string | number): Promise<MentorMessage[]> {
    return apiClient<MentorMessage[]>(`/mentor/messages`, {
      params: {
        workspace_id: workspaceId,
        conversation_id: conversationId,
      },
    });
  },

  async sendMessage(
    workspaceId: string | number,
    content: string,
    options: { conversation_id?: string | number; stage?: string } = {}
  ): Promise<MentorMessage> {
    return apiClient<MentorMessage>(`/mentor/chat`, {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: workspaceId,
        content,
        conversation_id: options.conversation_id,
        stage: options.stage,
      }),
    });
  },

  async getSuggestedPrompts(workspaceId: string | number, stage?: string): Promise<SuggestedPrompt[]> {
    try {
      return await apiClient<SuggestedPrompt[]>(`/mentor/suggested-prompts`, {
        params: { workspace_id: workspaceId, stage },
      });
    } catch {
      // Fallback default suggestions if endpoint is unavailable
      return [
        { id: '1', text: 'How do I refine my value proposition?', category: 'idea' },
        { id: '2', text: 'What are the main risks in my target market?', category: 'market' },
        { id: '3', text: 'Help me define my go-to-market strategy', category: 'validation' },
        { id: '4', text: 'What metrics should I track for early traction?', category: 'finance' },
      ];
    }
  },

  async clearHistory(workspaceId: string | number): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/mentor/conversations/clear`, {
      method: 'POST',
      body: JSON.stringify({ workspace_id: workspaceId }),
    });
  },
};
