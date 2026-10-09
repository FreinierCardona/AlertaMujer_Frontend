export class ApiError extends Error {
  constructor(message: string, readonly code: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = { method?: 'GET' | 'POST'; body?: unknown; authenticated?: boolean; retrying?: boolean };
type BackendError = { code?: string; message?: string };
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const webSocketUrl = () => `${BASE_URL.replace(/^http/i, 'ws')}/ws`;

class WebApiClient {
  private accessToken: string | null = null;
  private refresh: (() => Promise<boolean>) | null = null;
  private invalidate: (() => void) | null = null;
  private refreshInFlight: Promise<boolean> | null = null;

  configureSession(refresh: () => Promise<boolean>, invalidate: () => void) {
    this.refresh = refresh;
    this.invalidate = invalidate;
  }

  setAccessToken(token: string | null) { this.accessToken = token; }
  getAccessToken() { return this.accessToken; }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    if (!BASE_URL) throw new ApiError('La URL del servicio no está configurada.', 'CONFIGURATION_ERROR');
    const response = await this.fetch(path, options);
    const payload = await responsePayload(response);
    if (response.status === 401 && (options.authenticated ?? true) && !options.retrying) {
      if (await this.renew()) return this.request<T>(path, { ...options, retrying: true });
      this.invalidate?.();
    }
    if (!response.ok) throw backendError(payload, response.status);
    return payload as T;
  }

  async blob(path: string, retrying = false): Promise<Blob> {
    if (!BASE_URL) throw new ApiError('La URL del servicio no está configurada.', 'CONFIGURATION_ERROR');
    const response = await this.fetch(path, { authenticated: true, retrying });
    if (response.status === 401 && !retrying && await this.renew()) return this.blob(path, true);
    if (!response.ok) {
      const payload = await responsePayload(response);
      if (response.status === 401) this.invalidate?.();
      throw backendError(payload, response.status);
    }
    return response.blob();
  }

  private async fetch(path: string, options: RequestOptions) {
    const authenticated = options.authenticated ?? true;
    return fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(authenticated && this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        'X-Request-Id': `web-${crypto.randomUUID()}`,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  }

  private async renew() {
    if (!this.refresh) return false;
    if (!this.refreshInFlight) this.refreshInFlight = this.refresh().finally(() => { this.refreshInFlight = null; });
    return this.refreshInFlight;
  }
}

async function responsePayload(response: Response): Promise<unknown> {
  const body = await response.text();
  if (!body) return undefined;
  try { return JSON.parse(body) as unknown; } catch { return undefined; }
}

function backendError(payload: unknown, status: number) {
  const error = (payload ?? {}) as BackendError;
  return new ApiError(error.message ?? 'No fue posible completar la operación.', error.code ?? `HTTP_${status}`, status);
}

export const webApiClient = new WebApiClient();
