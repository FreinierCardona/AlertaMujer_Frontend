import { apiClient } from './ApiClient';

export interface EvidenceResponse {
  evidenceId: string;
  mimeType: 'image/webp';
  sizeBytes: number;
  receivedAt: string;
}

export const evidenceApi = {
  list: (emergencyId: string) =>
    apiClient.request<EvidenceResponse[]>(`/api/v1/emergencies/${emergencyId}/evidences`),
  upload: (emergencyId: string, asset: { uri: string; fileName?: string | null; mimeType?: string | null }) => {
    const form = new FormData();
    form.append('file', {
      uri: asset.uri,
      name: asset.fileName || `evidence-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    } as unknown as Blob);
    return apiClient.requestMultipart<EvidenceResponse>(`/api/v1/emergencies/${emergencyId}/evidences`, form);
  },
  content: (evidenceId: string) =>
    apiClient.requestBlob(`/api/v1/evidences/${evidenceId}/content`),
};

export async function evidenceDataUri(evidenceId: string): Promise<string> {
  const blob = await evidenceApi.content(evidenceId);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No fue posible leer la fotografía protegida.'));
    reader.onloadend = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('No fue posible leer la fotografía protegida.'));
    reader.readAsDataURL(blob);
  });
}
