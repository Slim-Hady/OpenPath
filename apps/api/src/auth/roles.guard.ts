import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@osh/contracts';
import { AppError } from '../common/errors';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../common/decorators';
import type { RequestUser } from '../common/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    if (!request.user) throw AppError.unauthorized();

    if (!roles || roles.length === 0) return true;
    if (!roles.includes(request.user.role)) {
      throw AppError.forbidden('Your role does not allow this action');
    }
    return true;
  }
}
