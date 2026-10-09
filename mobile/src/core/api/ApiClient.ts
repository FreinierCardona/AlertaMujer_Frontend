import appConfig from '@core/config/appConfig';

export type ApiFieldErrors = Record<string, string>;

export class ApiError extends Error {
  constructor(message: string, readonly code: string, readonly status?: number, readonly fields: ApiFieldErrors = {}, readonly requestId?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type RequestOptions = { method?: Method; body?: unknown; authenticated?: boolean; retrying?: boolean };
type BackendError = { code?: string; message?: string; requestId?: string; fields?: { field?: string; message?: string }[] | Record<string, string> };
const TIMEOUT_MS = 15_000;

class ApiClient {
  private accessToken: string | null = null;
  private refreshSession: (() => Promise<boolean>) | null = null;
  private invalidateSession: (() => void) | null = null;
  private refreshInFlight: Promise<boolean> | null = null;
  setAccessToken(accessToken: string | null) { this.accessToken = accessToken; }
  configureSession(options: { refreshSession: () => Promise<boolean>; invalidateSession: () => void }) { this.refreshSession = options.refreshSession; this.invalidateSession = options.invalidateSession; }
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    if (!appConfig.apiBaseUrl) throw new ApiError('La URL del servicio no está configurada en esta compilación.', 'CONFIGURATION_ERROR');
    const method = options.method ?? 'GET';
    const authenticated = options.authenticated ?? true;
    const requestId = createRequestId();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`${appConfig.apiBaseUrl.replace(/\/$/, '')}${path}`, {
        method,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Request-Id': requestId, ...(authenticated && this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}) },
        body: options.body === undefined ? undefined : JSON.stringify(options.body), signal: controller.signal,
      });
      const payload = await readPayload(response);
      if (response.status === 401 && authenticated && !options.retrying) {
        const canRetry = method === 'GET' && (await this.coordinatedRefresh());
        if (canRetry) return this.request<T>(path, { ...options, retrying: true });
        this.invalidateSession?.();
      }
      if (!response.ok) throw toApiError(payload, response.status, response.headers.get('X-Request-Id') ?? requestId);
      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const timedOut = error instanceof Error && error.name === 'AbortError';
      throw new ApiError(timedOut ? 'La solicitud tardó demasiado. Verifica tu conexión e inténtalo nuevamente.' : 'No fue posible conectar con el servicio. Verifica tu conexión e inténtalo nuevamente.', timedOut ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR');
    } finally { clearTimeout(timeout); }
  }
  private async coordinatedRefresh() {
    if (!this.refreshSession) return false;
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.refreshSession().finally(() => {
        this.refreshInFlight = null;
      });
    }
    return this.refreshInFlight;
  }
}
async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try { return JSON.parse(text) as unknown; } catch { return undefined; }
}
function toApiError(payload: unknown, status: number, fallbackRequestId: string) {
  const error = (payload ?? {}) as BackendError;
  const fields = Array.isArray(error.fields) ? Object.fromEntries(error.fields.filter((item) => item.field && item.message).map((item) => [item.field as string, item.message as string])) : (error.fields ?? {});
  return new ApiError(error.message ?? 'No fue posible completar la operación.', error.code ?? `HTTP_${status}`, status, fields, error.requestId ?? fallbackRequestId);
}
function createRequestId() { return `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; }
export const apiClient = new ApiClient();
