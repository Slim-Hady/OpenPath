import { Injectable } from '@nestjs/common';
import type { AiFeature, AiSettings } from '@osh/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { getEnv } from '../../config/env';

@Injectable()
export class AiSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<AiSettings & { updatedById: string | null }> {
    const existing = await this.prisma.aiSetting.findUnique({ where: { id: 'global' } });
    if (existing) {
      return {
        maxTokensPerUser: existing.maxTokensPerUser,
        temperature: existing.temperature,
        usageLimitUsd: existing.usageLimitUsd,
        updatedAt: existing.updatedAt.toISOString(),
        updatedById: existing.updatedById,
      };
    }
    const env = getEnv();
    const created = await this.prisma.aiSetting.create({
      data: {
        id: 'global',
        maxTokensPerUser: env.AI_MAX_TOKENS_PER_USER,
        temperature: env.AI_TEMPERATURE,
        usageLimitUsd: env.AI_USAGE_LIMIT_USD,
      },
    });
    return {
      maxTokensPerUser: created.maxTokensPerUser,
      temperature: created.temperature,
      usageLimitUsd: created.usageLimitUsd,
      updatedAt: created.updatedAt.toISOString(),
      updatedById: created.updatedById,
    };
  }

  async update(
    input: { maxTokensPerUser?: number; temperature?: number; usageLimitUsd?: number },
    adminId: string,
  ): Promise<AiSettings> {
    await this.get();
    const updated = await this.prisma.aiSetting.update({
      where: { id: 'global' },
      data: {
        maxTokensPerUser: input.maxTokensPerUser,
        temperature: input.temperature,
        usageLimitUsd: input.usageLimitUsd,
        updatedById: adminId,
      },
    });
    return {
      maxTokensPerUser: updated.maxTokensPerUser,
      temperature: updated.temperature,
      usageLimitUsd: updated.usageLimitUsd,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  monthStart(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  async usageForUser(userId: string): Promise<number> {
    const aggregate = await this.prisma.aiUsage.aggregate({
      where: { userId, createdAt: { gte: this.monthStart() } },
      _sum: { totalTokens: true },
    });
    return aggregate._sum.totalTokens ?? 0;
  }

  planForFeature(feature: AiFeature): string {
    return feature === 'AI_GUIDE' ? 'developer' : 'standard';
  }
}
