import { apiClient } from './ApiClient';
import { contactAlertPaths } from './contactAlertPaths';
import type { PageResponse } from './contactsApi';
import type { EvidenceResponse } from './evidenceApi';

export type ContactAlertStatus = 'ACTIVE' | 'IN_PROGRESS' | 'OFFLINE';

export interface ContactAlertSummary {
  emergencyId: string;
  title: string;
  status: ContactAlertStatus;
  userDisplayName: string;
  message: string;
  startedAt: string;
}

export interface ContactAlertLocation {
  latitude: number;
  longitude: number;
  capturedAt: string;
}

/** Deliberately mirrors only the contact-safe projection from HU-API-022. */
export interface ContactAlertDetail {
  emergencyId: string;
  status: ContactAlertStatus;
  userDisplayName: string;
  startedAt: string;
  messageSnapshot: string;
  lastConfirmedLocation: ContactAlertLocation | null;
  evidences: EvidenceResponse[];
}

export const contactAlertsApi = {
  list: (page = 0, size = 20) =>
    apiClient.request<PageResponse<ContactAlertSummary>>(
      contactAlertPaths.list(page, size),
    ),
  detail: (emergencyId: string) =>
    apiClient.request<ContactAlertDetail>(
      contactAlertPaths.detail(emergencyId),
    ),
  evidences: (emergencyId: string) =>
    apiClient.request<EvidenceResponse[]>(
      contactAlertPaths.evidences(emergencyId),
    ),
  evidenceContent: (emergencyId: string, evidenceId: string) =>
    apiClient.requestBlob(
      contactAlertPaths.evidenceContent(emergencyId, evidenceId),
    ),
};
