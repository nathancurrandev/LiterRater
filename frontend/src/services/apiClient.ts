export const BASE_URL = process.env.API_URL ?? 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const body: unknown = await res.json();
  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new ApiError(res.status, errorBody.error ?? 'Request failed');
  }
  return (body as { data: T }).data;
}

async function requestRaw<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const body: unknown = await res.json();
  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new ApiError(res.status, errorBody.error ?? 'Request failed');
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  getRaw: <T>(path: string) => requestRaw<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export { ApiError };
