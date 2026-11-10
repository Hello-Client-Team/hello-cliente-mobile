import { Platform } from 'react-native';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333').replace(/\/$/, '');
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

let token: string | null = null;
let refreshing: Promise<string | null> | null = null;
let expired: (() => void) | undefined;

export function onSessionExpired(callback: () => void) {
  expired = callback;
  return () => {
    if (expired === callback) expired = undefined;
  };
}

export function setAccessToken(value: string | null) {
  token = value;
}

async function request(path: string, init: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      ...init,
      // The refresh token lives in the HttpOnly cookie kept by the native cookie store.
      credentials: 'include',
      headers: {
        ...init.headers,
        // The API rejects auth POSTs without an allowed Origin; native clients do not send one.
        ...(Platform.OS !== 'web' ? { Origin: WEB_URL } : {}),
      },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Não foi possível conectar ao servidor. Tente novamente.');
  }
  const body = response.status === 204 ? undefined : await response.json().catch(() => undefined);
  if (!response.ok)
    throw new ApiError(
      response.status,
      body?.error?.code ?? 'REQUEST_FAILED',
      body?.error?.message ?? 'Não foi possível concluir a solicitação.',
    );
  return body?.data;
}

// The refresh token rotates on every use, so concurrent renewals must share one request.
export function refreshSession(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const data = await request('/auth/refresh', { method: 'POST' });
      token = data.accessToken;
      return token;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const hadSession = token !== null;
        token = null;
        if (hadSession) expired?.();
        return null;
      }
      throw error;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const auth = options.auth ?? true;
  const run = () =>
    request(path, {
      method: options.method ?? 'GET',
      headers: {
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  try {
    return await run();
  } catch (error) {
    if (!auth || !(error instanceof ApiError) || error.status !== 401) throw error;
    if (!(await refreshSession())) throw error;
    return run();
  }
}

export async function allPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const result = await api<{ items: T[]; total: number }>(`${path}?page=${page}&limit=50`);
    items.push(...result.items);
    if (!result.items.length || items.length >= result.total) return items;
  }
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return value.trim().startsWith('+') ? `+${digits}` : `+55${digits}`;
}
