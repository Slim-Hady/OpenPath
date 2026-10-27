import { Injectable, Logger } from '@nestjs/common';
import { getEnv } from '../config/env';
import { AppError } from '../common/errors';

/**
 * Supabase Storage, private bucket. The service role key is only used here.
 * Uploads use the REST endpoint so the API does not ship a Supabase SDK.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  private base(): string {
    return getEnv().NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
  }

  private headers(): Record<string, string> {
    const key = getEnv().SUPABASE_SERVICE_ROLE_KEY;
    return { apikey: key, Authorization: `Bearer ${key}` };
  }

  async upload(path: string, buffer: Buffer, contentType: string): Promise<void> {
    const bucket = getEnv().STORAGE_BUCKET;
    const response = await fetch(`${this.base()}/storage/v1/object/${bucket}/${encodeURI(path)}`, {
      method: 'POST',
      headers: {
        ...this.headers(),
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: new Uint8Array(buffer),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      this.logger.error(`storage upload failed: ${response.status} ${text.slice(0, 120)}`);
      throw new AppError(
        'STORAGE_UNAVAILABLE',
        'The file could not be stored. Try again or contact support.',
        503,
      );
    }
  }

  async download(path: string): Promise<Buffer> {
    const bucket = getEnv().STORAGE_BUCKET;
    const response = await fetch(`${this.base()}/storage/v1/object/${bucket}/${encodeURI(path)}`, {
      headers: this.headers(),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new AppError('FILE_UNAVAILABLE', 'The stored CV could not be read', 404);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  async remove(path: string): Promise<void> {
    const bucket = getEnv().STORAGE_BUCKET;
    await fetch(`${this.base()}/storage/v1/object/${bucket}/${encodeURI(path)}`, {
      method: 'DELETE',
      headers: this.headers(),
      signal: AbortSignal.timeout(15_000),
    }).catch(() => undefined);
  }
}
