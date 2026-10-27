export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Array<{ field?: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const response = await fetch(`/api${path.startsWith('/') ? path : `/${path}`}`, {
    ...rest,
    headers: {
      ...(isForm ? {} : body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(headers ?? {}),
    },
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  const payload: unknown = text ? safeJson(text) : null;
  if (!response.ok) {
    const error = payload as
      | { code?: string; message?: string; details?: Array<{ field?: string; message: string }> }
      | null;
    throw new ApiError(
      response.status,
      error?.code ?? 'REQUEST_FAILED',
      error?.message ?? `Request failed (${response.status})`,
      error?.details,
    );
  }
  return payload as T;
}

export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  const response = await fetch(`/api${path}`, { method: 'POST', body: form });
  const text = await response.text();
  const payload: unknown = text ? safeJson(text) : null;
  if (!response.ok) {
    const error = payload as { code?: string; message?: string } | null;
    throw new ApiError(response.status, error?.code ?? 'UPLOAD_FAILED', error?.message ?? 'Upload failed');
  }
  return payload as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 200) };
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Try again.';
}
