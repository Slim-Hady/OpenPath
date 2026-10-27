import { Injectable, Logger } from '@nestjs/common';
import type { AiFeature, AiSettings, AiUsageSummary } from '@osh/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '../../common/errors';
import { AiSettingsService } from './ai-settings.service';

export interface UsageRecord {
  userId: string;
  feature: AiFeature;
  model: string;
  promptTokens: number;
  completionTokens: number;
  requestId?: string;
}

const BLENDED_COST_PER_MILLION = 0.1;

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: AiSettingsService,
  ) {}

  async assertAllowed(
    userId: string,
    feature: AiFeature,
    estimatedTokens = 1500,
  ): Promise<{ settings: AiSettings; usedTokens: number; usedCostUsd: number }> {
    const settings = await this.settings.get();
    const since = this.settings.monthStart();
    const [userAgg, globalAgg] = await Promise.all([
      this.prisma.aiUsage.aggregate({
        where: { userId, createdAt: { gte: since } },
        _sum: { totalTokens: true },
      }),
      this.prisma.aiUsage.aggregate({
        where: { createdAt: { gte: since } },
        _sum: { costUsd: true },
      }),
    ]);
    const usedTokens = userAgg._sum.totalTokens ?? 0;
    const usedCostUsd = globalAgg._sum.costUsd ?? 0;

    if (usedTokens + estimatedTokens > settings.maxTokensPerUser) {
      throw AppError.limitReached(
        `You have reached your monthly AI limit of ${settings.maxTokensPerUser.toLocaleString()} tokens. It resets on the 1st.`,
        'AI_TOKEN_LIMIT',
      );
    }
    if (usedCostUsd >= settings.usageLimitUsd) {
      throw AppError.limitReached(
        'The platform AI budget for this month has been reached. Try again next month.',
        'AI_USAGE_LIMIT',
      );
    }
    return { settings, usedTokens, usedCostUsd };
  }

  async record(input: UsageRecord): Promise<{ totalTokens: number; costUsd: number }> {
    const totalTokens = input.promptTokens + input.completionTokens;
    const costUsd = (totalTokens / 1_000_000) * BLENDED_COST_PER_MILLION;
    await this.prisma.aiUsage.create({
      data: {
        userId: input.userId,
        feature: input.feature,
        model: input.model,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
        totalTokens,
        costUsd,
        requestId: input.requestId,
      },
    });
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    await this.prisma.aiUsageDaily.upsert({
      where: { day_feature: { day, feature: input.feature } },
      create: {
        day,
        feature: input.feature,
        requests: 1,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
        totalTokens,
        costUsd,
      },
      update: {
        requests: { increment: 1 },
        promptTokens: { increment: input.promptTokens },
        completionTokens: { increment: input.completionTokens },
        totalTokens: { increment: totalTokens },
        costUsd: { increment: costUsd },
      },
    });
    return { totalTokens, costUsd };
  }

  async summary(periodStart: Date, periodEnd: Date, feature?: AiFeature): Promise<AiUsageSummary> {
    const settings = await this.settings.get();
    const rows = await this.prisma.aiUsage.groupBy({
      by: ['feature'],
      where: { createdAt: { gte: periodStart, lte: periodEnd }, ...(feature ? { feature } : {}) },
      _count: { _all: true },
      _sum: { promptTokens: true, completionTokens: true, totalTokens: true, costUsd: true },
    });
    const byFeature = rows.map((row) => ({
      feature: row.feature,
      requests: row._count._all,
      promptTokens: row._sum.promptTokens ?? 0,
      completionTokens: row._sum.completionTokens ?? 0,
      totalTokens: row._sum.totalTokens ?? 0,
      costUsd: Number((row._sum.costUsd ?? 0).toFixed(4)),
    }));
    const totalTokens = byFeature.reduce((sum, row) => sum + row.totalTokens, 0);
    const costUsd = byFeature.reduce((sum, row) => sum + row.costUsd, 0);
    return {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      requests: byFeature.reduce((sum, row) => sum + row.requests, 0),
      totalTokens,
      costUsd: Number(costUsd.toFixed(4)),
      maxTokensPerUser: settings.maxTokensPerUser,
      usageLimitUsd: settings.usageLimitUsd,
      percentOfLimit:
        settings.usageLimitUsd > 0
          ? Math.min(100, Math.round((costUsd / settings.usageLimitUsd) * 100))
          : 100,
      byFeature,
      capturedAt: new Date().toISOString(),
    };
  }
}
