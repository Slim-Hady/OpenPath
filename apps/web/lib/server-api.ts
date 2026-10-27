export class ServerApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function publicApi<T>(path: string): Promise<T> {
  const base = process.env.API_URL ?? 'http://localhost:4000';
  const response = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    cache: 'no-store',
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed (${response.status})`;
    throw new ServerApiError(response.status, message);
  }
  return payload as T;
}
