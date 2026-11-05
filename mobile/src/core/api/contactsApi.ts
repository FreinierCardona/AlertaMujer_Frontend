import { apiClient } from './ApiClient';

export type ContactStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REJECTED';
export type ContactDirection = 'SENT' | 'RECEIVED';
export type ContactAction = 'ACCEPT' | 'REJECT' | 'REINVITE';

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface DirectoryUser {
  username: string;
  firstNames: string;
  lastNames: string;
}

export interface ContactInvitation {
  contactId: string;
  status: ContactStatus;
  expiresAt: string | null;
}

export interface ContactRelationship extends ContactInvitation {
  eligible: boolean;
  counterpart: DirectoryUser;
  direction: ContactDirection;
  allowedActions: ContactAction[];
}

const pageQuery = (page: number, size: number) =>
  `page=${page}&size=${size}`;

export const contactsApi = {
  directory: (query: string, page = 0, size = 20) =>
    apiClient.request<PageResponse<DirectoryUser>>(
      `/api/v1/directory?query=${encodeURIComponent(query)}&${pageQuery(page, size)}`,
    ),
  list: (page = 0, size = 50) =>
    apiClient.request<PageResponse<ContactRelationship>>(
      `/api/v1/contacts?${pageQuery(page, size)}`,
    ),
  invite: (username: string) =>
    apiClient.request<ContactInvitation>('/api/v1/contact-invitations', {
      method: 'POST',
      body: { username },
    }),
  accept: (contactId: string) =>
    apiClient.request<void>(`/api/v1/contact-invitations/${contactId}/accept`, {
      method: 'POST',
    }),
  reject: (contactId: string) =>
    apiClient.request<void>(`/api/v1/contact-invitations/${contactId}/reject`, {
      method: 'POST',
    }),
  reinvite: (contactId: string) =>
    apiClient.request<ContactInvitation>(
      `/api/v1/contact-invitations/${contactId}/reinvite`,
      { method: 'POST' },
    ),
};
