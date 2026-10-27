import { SetMetadata } from '@nestjs/common';
import type { Role } from '@osh/contracts';

export const IS_PUBLIC_KEY = 'osh:isPublic';
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'osh:roles';
export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
