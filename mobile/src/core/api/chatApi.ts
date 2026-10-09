import { apiClient } from './ApiClient';

export interface ChatMessageResponse {
  messageId: number;
  clientMessageId: string;
  senderUserId: string;
  senderRole: 'USER' | 'ENTITY_ADMIN';
  content: string;
  sentAt: string;
}

export const chatApi = {
  list: (emergencyId: string, after: number, size = 50) =>
    apiClient.request<ChatMessageResponse[]>(
      `/api/v1/emergencies/${emergencyId}/messages?after=${after}&size=${size}`,
    ),
};
