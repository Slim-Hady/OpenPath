import type { ZodType } from 'zod';
import { ApiErrorSchema } from '@osh/contracts';

export class ServerApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function publicApi<T>(path: string, schema?: ZodType<T>): Promise<T> {
  const base = process.env.API_URL ?? 'http://localhost:4000';
  const response = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    cache: 'no-store',
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const parsed = ApiErrorSchema.safeParse(payload);
    throw new ServerApiError(
      response.status,
      parsed.success ? parsed.data.message : `Request failed (${response.status})`,
    );
  }
  return schema ? schema.parse(payload) : (payload as T);
}
