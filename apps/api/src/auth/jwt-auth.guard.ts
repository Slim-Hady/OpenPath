import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { getEnv, isProduction } from '../config/env';
import { AppError } from '../common/errors';
import { IS_PUBLIC_KEY } from '../common/decorators';
import type { RequestUser } from '../common/current-user.decorator';
import { AuthService } from './auth.service';
import { SupabaseJwtService } from './supabase-jwt.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseJwt: SupabaseJwtService,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing access token');
    }
    const token = header.slice('Bearer '.length).trim();
    if (!token) throw AppError.unauthorized('Missing access token');

    if (token.startsWith('dev:')) {
      if (isProduction() || !getEnv().AUTH_DEV_MODE) {
        throw AppError.unauthorized('Dev tokens are disabled');
      }
      const email = token.slice('dev:'.length);
      request.user = await this.auth.findDevUser(email);
      return true;
    }

    const claims = await this.supabaseJwt.verify(token);
    request.user = await this.auth.resolveUser(claims);
    return true;
  }
}
