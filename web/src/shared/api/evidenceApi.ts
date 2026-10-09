import { webApiClient } from './client';

export interface EvidenceResponse { evidenceId: string; mimeType: 'image/webp'; sizeBytes: number; receivedAt: string; }
export const evidenceApi = {
  list: (emergencyId: string) => webApiClient.request<EvidenceResponse[]>(`/api/v1/emergencies/${emergencyId}/evidences`),
  content: (evidenceId: string) => webApiClient.blob(`/api/v1/evidences/${evidenceId}/content`),
};
