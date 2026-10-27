import { Injectable } from '@nestjs/common';
import type { AdminMetrics, AdminUsers, AiFeature, AiSettings, AiUsageSummary } from '@osh/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../infra/redis.service';
import { AiSettingsService } from '../ai/ai-settings.service';
import { AiUsageService } from '../ai/ai-usage.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly aiSettings: AiSettingsService,
    private readonly aiUsage: AiUsageService,
  ) {}

  async metrics(from?: Date, to?: Date): Promise<AdminMetrics> {
    const cacheKey = `admin:metrics:${from?.toISOString() ?? 'all'}:${to?.toISOString() ?? 'now'}`;
    const cached = await this.redis.getJson<AdminMetrics>(cacheKey);
    if (cached) return cached;
    const since = from ?? new Date(Date.now() - 30 * 86_400_000);
    const until = to ?? new Date();
    const [registeredUsers, loggedInUsers, suggested, regenerated, statusRows, ignored] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { lastSeenAt: { gte: new Date(Date.now() - 30 * 86_400_000) } } }),
        this.prisma.suggestionEvent.count({ where: { kind: 'SUGGESTED', createdAt: { gte: since, lte: until } } }),
        this.prisma.suggestionEvent.count({ where: { kind: 'REGENERATED', createdAt: { gte: since, lte: until } } }),
        this.prisma.selection.groupBy({ by: ['status'], _count: { _all: true } }),
        this.prisma.ignoredIssue.count(),
      ]);
    const countFor = (status: string) =>
      statusRows.find((row) => row.status === status)?._count._all ?? 0;
    const metrics: AdminMetrics = {
      registeredUsers,
      loggedInUsers,
      issuesSuggested: suggested,
      issuesRegenerated: regenerated,
      statusCounts: {
        inProgress: countFor('IN_PROGRESS'),
        prOpen: countFor('PR_OPEN'),
        merged: countFor('MERGED'),
        ignored,
      },
      capturedAt: new Date().toISOString(),
      fresh: true,
    };
    await this.redis.setJson(cacheKey, metrics, 300);
    return metrics;
  }

  async users(): Promise<AdminUsers> {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { profile: true },
      }),
      this.prisma.user.count(),
    ]);
    return {
      items: items.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.profile?.experienceLevel ?? null,
        createdAt: user.createdAt.toISOString(),
      })),
      total,
    };
  }

  aiSettingsGet(): Promise<AiSettings> {
    return this.aiSettings.get();
  }

  aiSettingsUpdate(
    input: { maxTokensPerUser?: number; temperature?: number; usageLimitUsd?: number },
    adminId: string,
  ): Promise<AiSettings> {
    return this.aiSettings.update(input, adminId);
  }

  usage(periodStart: Date, periodEnd: Date, feature?: AiFeature): Promise<AiUsageSummary> {
    return this.aiUsage.summary(periodStart, periodEnd, feature);
  }

  async settingsAgainstUsage(): Promise<{ settings: AiSettings; usage: AiUsageSummary }> {
    const settings = await this.aiSettings.get();
    const end = new Date();
    const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
    const usage = await this.aiUsage.summary(start, end);
    return { settings, usage };
  }
}
