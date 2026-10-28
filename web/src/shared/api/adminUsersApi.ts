import { webApiClient } from './client';

export type RemoteAccountStatus = 'ENABLED' | 'DISABLED';

export interface AdminUser {
  userId: string;
  username: string;
  firstNames: string;
  lastNames: string;
  email: string;
  phone: string;
  role: string;
  accountStatus: RemoteAccountStatus;
  termsPending?: boolean;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface AuditLog {
  auditLogId: string;
  action: string;
  createdAt: string;
}

export interface AdminRegistrationInput {
  username: string; firstNames: string; lastNames: string; email: string; phone: string; password: string;
}

export const adminUsersApi = {
  create: (body: AdminRegistrationInput) => webApiClient.request<{ registrationRequestId: string; status: 'COMPLETED' }>(
    '/api/v1/admin/users', { method: 'POST', body }),
  list: (page: number, size: number) =>
    webApiClient.request<PageResponse<AdminUser>>(
      `/api/v1/admin/users?page=${page}&size=${size}`,
    ),
  get: (userId: string) =>
    webApiClient.request<AdminUser>(`/api/v1/admin/users/${encodeURIComponent(userId)}`),
  changeStatus: (userId: string, status: RemoteAccountStatus) =>
    webApiClient.request<AdminUser>(
      `/api/v1/admin/users/${encodeURIComponent(userId)}/status`,
      { method: 'PATCH', body: { status } },
    ),
  remove: (userId: string) =>
    webApiClient.request<void>(
      `/api/v1/admin/users/${encodeURIComponent(userId)}/deletion`,
      { method: 'DELETE' },
    ),
  auditLogs: (page: number, size: number) =>
    webApiClient.request<PageResponse<AuditLog>>(
      `/api/v1/admin/audit-logs?page=${page}&size=${size}`,
    ),
};
