import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GithubService } from '../modules/github/github.service';
import { QueueService, QUEUES } from '../infra/queue.service';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { EmailService } from '../infra/email.service';
import { StorageService } from '../infra/storage.service';
import { AdminService } from '../modules/admin/admin.service';
import { getEnv } from '../config/env';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly github: GithubService,
    private readonly queue: QueueService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
    private readonly storage: StorageService,
    private readonly admin: AdminService,
  ) {}

  async syncProgress(userId?: string): Promise<{ checked: number; changed: number }> {
    const staleBefore = new Date(Date.now() - 5 * 60_000);
    const selections = await this.prisma.selection.findMany({
      where: {
        ...(userId ? { userId } : {}),
        status: { in: ['IN_PROGRESS', 'PR_OPEN'] },
        ...(userId
          ? {}
          : { OR: [{ lastSyncedAt: null }, { lastSyncedAt: { lt: staleBefore } }] }),
      },
      include: { issue: true, user: { select: { id: true, githubLogin: true } } },
      orderBy: { lastSyncedAt: 'asc' },
      take: 20,
    });
    let changed = 0;
    for (const selection of selections) {
      try {
        let prUrl = selection.prUrl;
        let pull = prUrl ? await this.github.pullStatus(selection.userId, prUrl).catch(() => null) : null;
        if (!pull && selection.user.githubLogin) {
          // Only attribute a linked PR when we know the developer's GitHub login.
          const linked = await this.github.findLinkedPullRequest(
            selection.userId,
            selection.issue.repoFullName,
            selection.issue.number,
            selection.user.githubLogin,
          );
          if (linked) {
            pull = linked;
            prUrl = linked.url;
          }
        }
        const nextStatus = pull
          ? pull.merged
            ? 'MERGED'
            : pull.state === 'open'
              ? 'PR_OPEN'
              : 'IN_PROGRESS'
          : selection.status === 'PR_OPEN' && !selection.prUrl
            ? 'IN_PROGRESS'
            : selection.status;
        const statusChanged = nextStatus !== selection.status;
        const prChanged = prUrl !== selection.prUrl;
        await this.prisma.selection.update({
          where: { id: selection.id },
          data: {
            status: nextStatus,
            prUrl,
            lastSyncedAt: new Date(),
          },
        });
        if (pull) {
          const since = selection.lastSyncedAt ?? selection.selectedAt;
          const activity = await this.github
            .pullActivity(selection.userId, prUrl ?? pull.url, since)
            .catch(() => []);
          for (const event of activity.slice(0, 5)) {
            if (event.author && event.author === selection.user.githubLogin) continue;
            await this.notifications
              .create({
                userId: selection.userId,
                type: 'PR_ACTIVITY',
                title:
                  event.type === 'review'
                    ? `New review from @${event.author}`
                    : `New comment from @${event.author}`,
                body: event.body.slice(0, 220) || 'Open the pull request to read it.',
                link: `/issues/${encodeURIComponent(selection.issue.id)}?tab=progress`,
                dedupeKey: `pr-activity:${selection.id}:${event.type}:${event.id}`,
              })
              .catch(() => null);
          }
        }
        if (statusChanged || prChanged) {
          changed += 1;
          const dedupeKey = `sync:${selection.id}:${nextStatus}:${prUrl ?? 'none'}`;
          const existing = await this.prisma.progressEvent.findUnique({ where: { dedupeKey } });
          if (!existing) {
            await this.prisma.progressEvent.create({
              data: {
                selectionId: selection.id,
                status: nextStatus,
                source: 'SYNC',
                prUrl,
                note: 'Synced from GitHub',
                dedupeKey,
              },
            });
          }
          if (nextStatus === 'MERGED') {
            await this.notifications
              .create({
                userId: selection.userId,
                type: 'PR_ACTIVITY',
                title: 'Your pull request was merged',
                body: `"${selection.issue.title}" is now merged. That is a real contribution.`,
                link: `/issues/${encodeURIComponent(selection.issue.id)}?tab=progress`,
                dedupeKey: `merged:${selection.id}`,
              })
              .catch(() => null);
            await this.queue.add(
              QUEUES.gamification,
              { userId: selection.userId },
              `badge:${selection.userId}:${selection.id}`,
            );
          } else if (nextStatus === 'PR_OPEN') {
            await this.queue.add(
              QUEUES.gamification,
              { userId: selection.userId },
              `badge:${selection.userId}:${selection.id}`,
            );
            await this.notifications
              .create({
                userId: selection.userId,
                type: 'PR_ACTIVITY',
                title: 'Your pull request is open',
                body: 'We found it on GitHub and moved the issue to PR Open.',
                link: `/issues/${encodeURIComponent(selection.issue.id)}?tab=progress`,
                dedupeKey: `pr-open:${selection.id}`,
              })
              .catch(() => null);
          }
        }
      } catch (error) {
        this.logger.warn(
          `progress sync failed for ${selection.id}: ${error instanceof Error ? error.message : 'unknown'}`,
        );
        await this.bumpSyncState('progress', error).catch(() => undefined);
      }
    }
    if (selections.length > 0) {
      await this.prisma.syncState.upsert({
        where: { scope: 'progress' },
        create: { scope: 'progress', lastRunAt: new Date() },
        update: { lastRunAt: new Date(), errors: 0 },
      });
    }
    return { checked: selections.length, changed };
  }

  async syncSaved(): Promise<{ checked: number; changed: number }> {
    const staleBefore = new Date(Date.now() - 15 * 60_000);
    const items = await this.prisma.savedItem.findMany({
      where: {
        issueId: { not: null },
        OR: [{ flaggedAt: null }, { flaggedAt: { lt: staleBefore } }],
      },
      include: { issue: true },
      take: 20,
    });
    let changed = 0;
    for (const item of items) {
      if (!item.issue) continue;
      try {
        const snapshot = await this.github.issueSnapshot(
          item.userId,
          item.issue.repoFullName,
          item.issue.number,
        );
        const nextState = snapshot.state !== 'open' ? 'CLOSED' : snapshot.assigned ? 'TAKEN' : 'OPEN';
        if (nextState !== item.state) {
          changed += 1;
          await this.prisma.savedItem.update({
            where: { id: item.id },
            data: { state: nextState, flaggedAt: nextState === 'OPEN' ? null : new Date() },
          });
          if (nextState === 'CLOSED' || nextState === 'TAKEN') {
            await this.notifications
              .create({
                userId: item.userId,
                type: 'SAVED_ISSUE_CLOSED',
                title: nextState === 'CLOSED' ? 'A saved issue was closed' : 'A saved issue was taken',
                body: `"${item.issue.title}" is no longer available.`,
                link: '/saved',
                dedupeKey: `saved:${item.id}:${nextState}`,
              })
              .catch(() => null);
          }
        }
      } catch (error) {
        this.logger.warn(
          `saved sync failed for ${item.id}: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }
    return { checked: items.length, changed };
  }

  async aggregateAdmin(): Promise<void> {
    const metrics = await this.admin.metrics();
    await this.prisma.adminSnapshot.create({ data: { data: metrics } });
    await this.prisma.adminSnapshot.deleteMany({
      where: { capturedAt: { lt: new Date(Date.now() - 30 * 86_400_000) } },
    });
  }

  async enqueueDigests(frequency: 'DAILY' | 'WEEKLY'): Promise<void> {
    const users = await this.prisma.notificationPreference.findMany({
      where: { frequency, channels: { has: 'EMAIL' } },
      select: { userId: true },
    });
    for (const user of users) {
      await this.queue.add(
        QUEUES.notificationDigest,
        { userId: user.userId },
        `digest:${frequency}:${user.userId}:${new Date().toISOString().slice(0, 10)}`,
      );
    }
  }

  async deliverNotification(notificationId: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: { select: { email: true } } },
    });
    if (!notification || notification.emailedAt) return;
    const preference = await this.prisma.notificationPreference.findUnique({
      where: { userId: notification.userId },
    });
    if (!preference?.channels.includes('EMAIL')) return;
    const sent = await this.email.send({
      to: notification.user.email,
      subject: notification.title,
      text: `${notification.body}\n\n${getEnv().NEXT_PUBLIC_APP_URL}${notification.link ?? ''}\n\nYou can change notification preferences in Settings.`,
    });
    if (sent) {
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { emailedAt: new Date() },
      });
    }
  }

  async deliverDigest(userId: string): Promise<void> {
    const preference = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
    if (!preference || preference.frequency === 'INSTANT') return;
    const unsent = await this.prisma.notification.findMany({
      where: { userId, emailedAt: null, createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { email: true } } },
    });
    if (unsent.length === 0) return;
    const first = unsent[0];
    if (!first) return;
    const sent = await this.email.send({
      to: first.user.email,
      subject: `${unsent.length} ${preference.frequency === 'WEEKLY' ? 'weekly' : 'daily'} updates from OpenSource-helper`,
      text: unsent.map((item) => `- ${item.title}: ${item.body}`).join('\n'),
    });
    if (sent) {
      await this.prisma.notification.updateMany({
        where: { id: { in: unsent.map((item) => item.id) } },
        data: { emailedAt: new Date() },
      });
    }
  }

  async deleteAccount(requestId: string): Promise<void> {
    const request = await this.prisma.deletionRequest.findUnique({
      where: { id: requestId },
      include: { user: { include: { cvFiles: true } } },
    });
    if (!request || request.completedAt) return;
    const user = request.user;
    for (const cv of user.cvFiles) await this.storage.remove(cv.storagePath).catch(() => undefined);
    const env = getEnv();
    try {
      await fetch(
        `${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${user.authId}`,
        {
          method: 'DELETE',
          headers: {
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          signal: AbortSignal.timeout(15_000),
        },
      );
    } catch {
      this.logger.warn(`supabase auth delete failed for user ${user.id}`);
    }
    await this.prisma.user.delete({ where: { id: user.id } });
  }

  private async bumpSyncState(scope: string, error: unknown): Promise<void> {
    await this.prisma.syncState.upsert({
      where: { scope },
      create: { scope, errors: 1, lastRunAt: new Date(), cursor: null },
      update: { errors: { increment: 1 }, cursor: error instanceof Error ? error.message.slice(0, 240) : 'unknown' },
    });
  }
}
