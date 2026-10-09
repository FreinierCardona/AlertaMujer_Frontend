import { apiClient } from './ApiClient';

export type EmergencyRemoteStatus =
  | 'ACTIVE'
  | 'IN_PROGRESS'
  | 'OFFLINE'
  | 'FINALIZED';

export interface EmergencyResponse {
  emergencyId: string;
  status: EmergencyRemoteStatus;
  previousOperationalStatus: 'ACTIVE' | 'IN_PROGRESS' | null;
  startedAt: string;
  lastHeartbeatAt: string | null;
  finalizedAt: string | null;
}

export interface EmergencyLocationResponse {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: string;
  receivedAt: string;
}

export interface EmergencyDetailResponse extends EmergencyResponse {
  messageSnapshot: string;
  lastConfirmedLocation: EmergencyLocationResponse | null;
}

export interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: string;
}

export interface EmergencyPage {
  items: EmergencyResponse[];
  page: number;
  size: number;
  total: number;
}

export const emergencyApi = {
  createOrRecover: (input: LocationPayload & { message?: string }) =>
    apiClient.request<EmergencyResponse>('/api/v1/emergencies', {
      method: 'POST',
      body: input,
    }),
  active: () => apiClient.request<EmergencyResponse>('/api/v1/emergencies/active'),
  get: (emergencyId: string) =>
    apiClient.request<EmergencyDetailResponse>(`/api/v1/emergencies/${emergencyId}`),
  heartbeat: (emergencyId: string, input: LocationPayload) =>
    apiClient.request<void>(`/api/v1/emergencies/${emergencyId}/heartbeats`, {
      method: 'POST',
      body: input,
    }),
  location: (emergencyId: string, input: LocationPayload) =>
    apiClient.request<void>(`/api/v1/emergencies/${emergencyId}/locations`, {
      method: 'POST',
      body: input,
    }),
  finish: (emergencyId: string) =>
    apiClient.request<void>(`/api/v1/emergencies/${emergencyId}/finish`, {
      method: 'POST',
      body: { confirmedSafe: true },
    }),
  history: (page: number, size: number) =>
    apiClient.request<EmergencyPage>(
      `/api/v1/me/emergencies?page=${page}&size=${size}`,
    ),
};
