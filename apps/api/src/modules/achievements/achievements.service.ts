import { Injectable, Logger } from '@nestjs/common';
import type { Achievements } from '@osh/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '../../common/errors';
import { NotificationsService } from '../notifications/notifications.service';

const RULES: Record<string, { target: number; metric: 'pr' | 'merged' | 'selected' }> = {
  FIRST_PR: { target: 1, metric: 'pr' },
  FIRST_MERGE: { target: 1, metric: 'merged' },
  FIVE_CONTRIBUTIONS: { target: 5, metric: 'merged' },
};

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async get(userId: string): Promise<Achievements> {
    const [badges, userBadges, streak, profile, metrics] = await Promise.all([
      this.prisma.badge.findMany({ orderBy: { target: 'asc' } }),
      this.prisma.userBadge.findMany({ where: { userId } }),
      this.prisma.streak.findUnique({ where: { userId } }),
      this.prisma.publicProfile.findUnique({ where: { userId } }),
      this.metrics(userId),
    ]);
    const earned = new Map(userBadges.map((row) => [row.badgeId, row]));
    return {
      badges: badges.map((badge) => {
        const row = earned.get(badge.id);
        const rule = RULES[badge.code];
        const progress = rule ? metrics[rule.metric] : row ? 1 : 0;
        return {
          code: badge.code,
          name: badge.name,
          description: badge.description,
          requirement: badge.requirement,
          earned: Boolean(row),
          earnedAt: row?.awardedAt.toISOString() ?? null,
          publicVisible: row?.publicVisible ?? true,
          progress: Math.min(progress, badge.target),
          target: badge.target,
        };
      }),
      streak: {
        current: streak?.current ?? 0,
        longest: streak?.longest ?? 0,
        lastActivityOn: streak?.lastActivityOn?.toISOString().slice(0, 10) ?? null,
      },
      profilePublished: profile?.published ?? false,
    };
  }

  async updateVisibility(userId: string, badgeCode: string, publicVisible: boolean) {
    const badge = await this.prisma.badge.findUnique({ where: { code: badgeCode } });
    if (!badge) throw AppError.notFound('Badge not found');
    const existing = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });
    if (!existing) throw AppError.conflict('BADGE_NOT_EARNED', 'Earn the badge before showing it');
    await this.prisma.userBadge.update({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      data: { publicVisible },
    });
    return { ok: true as const };
  }

  async evaluate(userId: string): Promise<void> {
    const metrics = await this.metrics(userId);
    const badges = await this.prisma.badge.findMany();
    for (const badge of badges) {
      const rule = RULES[badge.code];
      if (!rule) continue;
      if (metrics[rule.metric] < rule.target) continue;
      const existing = await this.prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });
      if (existing) continue;
      await this.prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      await this.notifications
        .create({
          userId,
          type: 'BADGE_EARNED',
          title: `Badge earned: ${badge.name}`,
          body: badge.description,
          link: '/achievements',
          dedupeKey: `badge:${userId}:${badge.code}`,
        })
        .catch(() => null);
    }
    await this.updateStreak(userId);
  }

  private async metrics(userId: string): Promise<{ pr: number; merged: number; selected: number }> {
    const [pr, merged, selected] = await Promise.all([
      this.prisma.selection.count({ where: { userId, status: 'PR_OPEN' } }),
      this.prisma.selection.count({ where: { userId, status: 'MERGED' } }),
      this.prisma.selection.count({ where: { userId } }),
    ]);
    return { pr, merged, selected };
  }

  private async updateStreak(userId: string): Promise<void> {
    const events = await this.prisma.progressEvent.findMany({
      where: {
        selection: { userId },
        status: { in: ['IN_PROGRESS', 'PR_OPEN', 'MERGED'] },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const days = [...new Set(events.map((event) => event.createdAt.toISOString().slice(0, 10)))].sort();
    if (days.length === 0) return;
    let longest = 1;
    let run = 1;
    for (let index = 1; index < days.length; index += 1) {
      const previous = new Date(`${days[index - 1]}T00:00:00.000Z`).getTime();
      const current = new Date(`${days[index]}T00:00:00.000Z`).getTime();
      if (current - previous === 86_400_000) {
        run += 1;
        longest = Math.max(longest, run);
      } else if (current !== previous) {
        run = 1;
      }
    }
    const today = new Date().toISOString().slice(0, 10);
    const latest = days.at(-1) ?? today;
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const current = latest === today || latest === yesterday ? run : 0;
    await this.prisma.streak.upsert({
      where: { userId },
      create: {
        userId,
        current,
        longest,
        lastActivityOn: new Date(`${latest}T00:00:00.000Z`),
      },
      update: {
        current,
        longest: { set: Math.max(longest, current) },
        lastActivityOn: new Date(`${latest}T00:00:00.000Z`),
      },
    });
  }
}
