import { webApiClient } from './client';

export type RemoteEmergencyStatus = 'ACTIVE' | 'IN_PROGRESS' | 'OFFLINE' | 'FINALIZED';
export interface RemoteEmergency {
  emergencyId: string;
  status: RemoteEmergencyStatus;
  previousOperationalStatus: 'ACTIVE' | 'IN_PROGRESS' | null;
  startedAt: string;
  lastHeartbeatAt: string | null;
  finalizedAt: string | null;
}
export interface PageResponse<T> { items: T[]; page: number; size: number; total: number; }

export const adminEmergencyApi = {
  list: (page = 0, size = 20, status?: RemoteEmergencyStatus) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set('status', status);
    return webApiClient.request<PageResponse<RemoteEmergency>>(`/api/v1/admin/emergencies?${params}`);
  },
  startAttention: (emergencyId: string) =>
    webApiClient.request<void>(`/api/v1/admin/emergencies/${emergencyId}/attention`, { method: 'POST' }),
};
