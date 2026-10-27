import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppError } from '../common/errors';
import type { RequestUser } from '../common/current-user.decorator';
import type { Role } from '@osh/contracts';

export interface SupabaseClaims {
  sub: string;
  email?: string;
  email_verified?: boolean;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveUser(claims: SupabaseClaims): Promise<RequestUser> {
    const authId = claims.sub;
    const email =
      claims.email ??
      (typeof claims.user_metadata?.email === 'string' ? claims.user_metadata.email : undefined) ??
      `${authId}@users.noreply.localhost`;

    const existing = await this.prisma.user.findUnique({ where: { authId } });
    if (existing) {
      const needsSeen = !existing.lastSeenAt || Date.now() - existing.lastSeenAt.getTime() > 60_000;
      if (needsSeen) {
        await this.prisma.user.update({ where: { id: existing.id }, data: { lastSeenAt: new Date() } });
      }
      return {
        id: existing.id,
        authId: existing.authId,
        email: existing.email,
        name: existing.name,
        role: existing.role as Role,
      };
    }

    const byEmail = await this.prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      if (!canLinkByEmail(claims)) {
        throw AppError.forbidden(
          'Verify this email address before linking it to an existing account.',
        );
      }
      const linked = await this.prisma.user.update({
        where: { id: byEmail.id },
        data: { authId, lastSeenAt: new Date() },
      });
      return {
        id: linked.id,
        authId: linked.authId,
        email: linked.email,
        name: linked.name,
        role: linked.role as Role,
      };
    }

    const metadata = claims.user_metadata ?? {};
    const name =
      firstString(metadata.full_name, metadata.name, metadata.user_name) ?? email.split('@')[0] ?? 'Developer';
    const avatarUrl = firstString(metadata.avatar_url);
    const githubLogin = firstString(metadata.user_name, metadata.preferred_username);
    const created = await this.prisma.user.create({
      data: {
        authId,
        email,
        name,
        avatarUrl,
        githubLogin,
        lastSeenAt: new Date(),
        profile: { create: {} },
        notificationPrefs: {
          create: { channels: ['IN_APP'], frequency: 'INSTANT', eventTypes: {} },
        },
      },
    });

    return {
      id: created.id,
      authId: created.authId,
      email: created.email,
      name: created.name,
      role: created.role as Role,
    };
  }

  async findDevUser(email: string): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error(`Dev user ${email} is not seeded`);
    }
    return {
      id: user.id,
      authId: user.authId,
      email: user.email,
      name: user.name,
      role: user.role as Role,
    };
  }
}

export function canLinkByEmail(claims: SupabaseClaims): boolean {
  return claims.user_metadata?.email_verified === true || claims.email_verified === true;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
}
