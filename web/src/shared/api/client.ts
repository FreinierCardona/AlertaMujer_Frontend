export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status?: number,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
  retrying?: boolean;
};
type BackendError = { code?: string; message?: string; requestId?: string };
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL ?? '').replace(/\/$/, '');
const timeoutValue = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 15_000);
const REQUEST_TIMEOUT_MS = Number.isFinite(timeoutValue) && timeoutValue > 0 ? timeoutValue : 15_000;

export const webSocketUrl = () => {
  const origin = WS_BASE_URL || BASE_URL.replace(/^http/i, 'ws');
  return origin ? `${origin}/ws` : '';
};

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
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(`${BASE_URL}${path}`, {
        method: options.method ?? 'GET',
        headers: {
          Accept: 'application/json',
          ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(authenticated && this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
          'X-Request-Id': `web-${crypto.randomUUID()}`,
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') {
        throw new ApiError('La solicitud tardó demasiado. Intenta nuevamente.', 'REQUEST_TIMEOUT');
      }
      throw new ApiError('No fue posible conectarse con el servicio.', 'NETWORK_ERROR');
    } finally {
      window.clearTimeout(timeout);
    }
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
  return new ApiError(
    error.message ?? 'No fue posible completar la operación.',
    error.code ?? `HTTP_${status}`,
    status,
    error.requestId,
  );
}

export const webApiClient = new WebApiClient();
