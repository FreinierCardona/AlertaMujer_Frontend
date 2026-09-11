import appConfig from '@core/config/appConfig';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestOptions<TBody = unknown> {
  body?: TBody;
  headers?: Record<string, string>;
  method?: HttpMethod;
}

export async function httpClient<TResponse>(
  path: string,
  options: HttpRequestOptions = {}
): Promise<TResponse> {
  if (!appConfig.apiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured.');
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    method: options.method ?? 'GET',
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`);
  }

  return response.json() as Promise<TResponse>;
}
