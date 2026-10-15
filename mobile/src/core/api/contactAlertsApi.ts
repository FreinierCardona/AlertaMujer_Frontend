import { apiClient } from './ApiClient';
import type { PageResponse } from './contactsApi';

export type ContactAlertStatus = 'ACTIVE' | 'IN_PROGRESS' | 'OFFLINE';

export interface ContactAlertSummary {
  emergencyId: string;
  title: string;
  status: ContactAlertStatus;
  userDisplayName: string;
  message: string;
  startedAt: string;
}

export const contactAlertsApi = {
  list: (page = 0, size = 20) =>
    apiClient.request<PageResponse<ContactAlertSummary>>(
      `/api/v1/me/contact-alerts?page=${page}&size=${size}`,
    ),
};
