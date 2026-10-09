import { apiClient } from './ApiClient';

export const deviceTokenApi = {
  register: (token: string) =>
    apiClient.request<void>('/api/v1/me/device-tokens', {
      method: 'POST',
      body: { token, platform: 'ANDROID' },
    }),
};
