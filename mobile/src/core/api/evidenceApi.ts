import { File } from 'expo-file-system';
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
  upload: (emergencyId: string, asset: { uri: string; fileName: string; mimeType: 'image/webp' }) => {
    const form = new FormData();
    // Expo fetch serializa File/Blob, no los objetos { uri, name, type } de React Native.
    form.append('file', new File(asset.uri));
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
