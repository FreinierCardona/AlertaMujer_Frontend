import { apiClient } from './ApiClient';

export type UserProfile = { userId: string; username: string; firstNames: string; lastNames: string; email: string; phone: string; role: string; accountStatus: string };
export type SessionResponse = { accessToken: string; refreshToken: string; user: UserProfile; termsPending: boolean };
export type OtpIssued = { expiresAt: string; simulatedSmsCode?: string | null };
export type RegistrationVerification = { status: string; userId?: string | null };
export type PhoneFirstRegistrationStart = {
  registrationRequestId: string;
  stage: 'PHONE_PENDING';
  registrationProof: string;
  expiresAt: string;
  simulatedPhoneCode?: string | null;
};
export type RegistrationStage = {
  stage: 'PHONE_PENDING' | 'PHONE_VERIFIED' | 'EMAIL_PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  simulatedPhoneCode?: string | null;
};
type PhoneFirstChannel = 'PHONE_SIMULATOR' | 'EMAIL';
const registrationProofHeaders = (registrationProof: string) => ({ 'X-Registration-Proof': registrationProof });

export const identityApi = {
  createRegistration: (input: { username: string; firstNames: string; lastNames: string; email: string; phone: string; password: string; acceptedTerms: boolean }) => apiClient.request<{ registrationRequestId: string; status: string }>('/api/v1/registration-requests', { method: 'POST', body: input, authenticated: false }),
  issueRegistrationCode: (registrationRequestId: string, channel: 'EMAIL' | 'SMS') => apiClient.request<OtpIssued>(`/api/v1/registration-requests/${registrationRequestId}/verification-codes`, { method: 'POST', body: { channel }, authenticated: false }),
  verifyRegistrationCode: (registrationRequestId: string, channel: 'EMAIL' | 'SMS', code: string) => apiClient.request<RegistrationVerification>(`/api/v1/registration-requests/${registrationRequestId}/verification-codes/verify`, { method: 'POST', body: { channel, code }, authenticated: false }),
  startPhoneFirstRegistration: (input: { username: string; firstNames: string; lastNames: string; phone: string }) => apiClient.request<PhoneFirstRegistrationStart>('/api/v2/registration-requests', { method: 'POST', body: input, authenticated: false }),
  issuePhoneFirstRegistrationCode: (registrationRequestId: string, registrationProof: string, channel: PhoneFirstChannel) => apiClient.request<RegistrationStage>(`/api/v2/registration-requests/${registrationRequestId}/verification-codes`, { method: 'POST', body: { channel }, headers: registrationProofHeaders(registrationProof), authenticated: false }),
  verifyPhoneFirstRegistrationCode: (registrationRequestId: string, registrationProof: string, channel: PhoneFirstChannel, code: string) => apiClient.request<RegistrationVerification>(`/api/v2/registration-requests/${registrationRequestId}/verification-codes/verify`, { method: 'POST', body: { channel, code }, headers: registrationProofHeaders(registrationProof), authenticated: false }),
  completePhoneFirstRegistrationCredentials: (registrationRequestId: string, registrationProof: string, input: { email: string; password: string; acceptedTerms: boolean }) => apiClient.request<RegistrationStage>(`/api/v2/registration-requests/${registrationRequestId}/credentials`, { method: 'PUT', body: input, headers: registrationProofHeaders(registrationProof), authenticated: false }),
  login: (identifier: string, password: string) => apiClient.request<SessionResponse>('/api/v1/auth/login', { method: 'POST', body: { identifier, password }, authenticated: false }),
  refresh: (refreshToken: string) => apiClient.request<SessionResponse>('/api/v1/auth/refresh', { method: 'POST', body: { refreshToken }, authenticated: false }),
  logout: () => apiClient.request<void>('/api/v1/auth/logout', { method: 'POST' }),
  requestPasswordReset: (email: string) => apiClient.request<void>('/api/v1/auth/password-reset/verification-codes', { method: 'POST', body: { email }, authenticated: false }),
  confirmPasswordReset: (email: string, code: string, newPassword: string) => apiClient.request<void>('/api/v1/auth/password-reset/confirm', { method: 'POST', body: { email, code, newPassword }, authenticated: false }),
  getProfile: () => apiClient.request<UserProfile>('/api/v1/me'),
  updateProfile: (input: Partial<Pick<UserProfile, 'username' | 'firstNames' | 'lastNames'>>) => apiClient.request<UserProfile>('/api/v1/me', { method: 'PATCH', body: input }),
  acceptTerms: () => apiClient.request<void>('/api/v1/me/terms-acceptance', { method: 'POST' }),
  requestContactChange: (field: 'email' | 'phone', value: string) => apiClient.request<OtpIssued>('/api/v1/me/contact-changes', { method: 'POST', body: { field, value } }),
  verifyContactChange: (field: 'email' | 'phone', value: string, code: string) => apiClient.request<void>('/api/v1/me/contact-changes/verify', { method: 'POST', body: { field, value, code } }),
  getEmergencySettings: () => apiClient.request<{ message: string }>('/api/v1/me/emergency-settings'),
  saveEmergencySettings: (message: string) => apiClient.request<{ message: string }>('/api/v1/me/emergency-settings', { method: 'PUT', body: { message } }),
  changePassword: (currentPassword: string, newPassword: string) => apiClient.request<void>('/api/v1/me/password', { method: 'PATCH', body: { currentPassword, newPassword } }),
  deleteAccount: () => apiClient.request<void>('/api/v1/me', { method: 'DELETE' }),
};
