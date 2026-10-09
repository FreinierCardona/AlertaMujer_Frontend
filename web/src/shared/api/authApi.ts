import { webApiClient } from './client';

export interface RemoteUser {
  userId: string;
  username: string;
  firstNames: string;
  lastNames: string;
  email: string;
  role: string;
  accountStatus: string;
}

export interface RemoteSession {
  accessToken: string;
  refreshToken: string;
  user: RemoteUser;
  termsPending: boolean;
}

export const authApi = {
  login: (identifier: string, password: string) =>
    webApiClient.request<RemoteSession>('/api/v1/auth/login', { method: 'POST', body: { identifier, password }, authenticated: false }),
  refresh: (refreshToken: string) =>
    webApiClient.request<RemoteSession>('/api/v1/auth/refresh', { method: 'POST', body: { refreshToken }, authenticated: false }),
  logout: () => webApiClient.request<void>('/api/v1/auth/logout', { method: 'POST' }),
};
