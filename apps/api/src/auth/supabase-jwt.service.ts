import { Injectable, Logger } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { getEnv } from '../config/env';
import { AppError } from '../common/errors';
import type { SupabaseClaims } from './auth.service';

@Injectable()
export class SupabaseJwtService {
  private readonly logger = new Logger(SupabaseJwtService.name);
  private jwks?: JWTVerifyGetKey;

  private keySet(): JWTVerifyGetKey {
    if (this.jwks) return this.jwks;
    const env = getEnv();
    const url =
      env.SUPABASE_JWKS_URL ??
      `${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`;
    this.jwks = createRemoteJWKSet(new URL(url), { cacheMaxAge: 10 * 60 * 1000 });
    return this.jwks;
  }

  async verify(token: string): Promise<SupabaseClaims> {
    const env = getEnv();
    try {
      const { payload } = await jwtVerify(token, this.keySet(), {
        issuer: `${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/auth/v1`,
        audience: 'authenticated',
        clockTolerance: 30,
        algorithms: ['ES256', 'RS256'],
      });
      if (!payload.sub) throw new Error('token has no subject');
      return payload as SupabaseClaims;
    } catch (error) {
      this.logger.warn(`token rejected: ${error instanceof Error ? error.message : 'unknown'}`);
      throw AppError.unauthorized('Your session is invalid or expired. Sign in again.');
    }
  }
}
