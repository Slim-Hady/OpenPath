import { Injectable, Logger } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { getEnv } from '../config/env';
import { AppError } from '../common/errors';

/**
 * AES-256-GCM. The plaintext token never leaves this service except to the
 * GitHub client. The key is a base64-encoded 32-byte secret.
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);

  private key(): Buffer {
    const raw = getEnv().GITHUB_TOKEN_ENC_KEY;
    if (!raw) {
      throw new AppError(
        'GITHUB_TOKEN_KEY_MISSING',
        'GitHub token encryption is not configured',
        503,
      );
    }
    const key = Buffer.from(raw, 'base64');
    if (key.length !== 32) {
      throw new AppError(
        'GITHUB_TOKEN_KEY_INVALID',
        'GITHUB_TOKEN_ENC_KEY must decode to exactly 32 bytes',
        503,
      );
    }
    return key;
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
  }

  decrypt(payload: string): string {
    try {
      const [version, ivPart, tagPart, dataPart] = payload.split('.');
      if (version !== 'v1' || !ivPart || !tagPart || !dataPart) throw new Error('bad format');
      const decipher = createDecipheriv('aes-256-gcm', this.key(), Buffer.from(ivPart, 'base64url'));
      decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
      return Buffer.concat([
        decipher.update(Buffer.from(dataPart, 'base64url')),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      this.logger.error('stored GitHub token could not be decrypted');
      throw new AppError(
        'GITHUB_TOKEN_UNREADABLE',
        'Reconnect GitHub to continue',
        409,
      );
    }
  }
}
