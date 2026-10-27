import { Injectable, Logger } from '@nestjs/common';
import type {
  NotificationDto,
  NotificationList,
  NotificationPreferences,
  NotificationType,
  UpdateNotificationPreferences,
} from '@osh/contracts';
import type { Prisma, Notification } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService, QUEUES } from '../../infra/queue.service';
import { AppError } from '../../common/errors';

const ALL_TYPES: NotificationType[] = [
  'NEW_MATCH',
  'PR_ACTIVITY',
  'SAVED_ISSUE_CLOSED',
  'BADGE_EARNED',
  'OUTREACH_REQUEST',
  'OUTREACH_ACCEPTED',
  'OUTREACH_MESSAGE',
  'SYSTEM',
];

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  dedupeKey?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
  ) {}

  async list(userId: string, page = 1, perPage = 20): Promise<NotificationList> {
    const [rows, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return {
      items: rows.map(toDto),
      unreadCount: unread,
      page,
      perPage,
      total,
    };
  }

  async unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markRead(userId: string, id: string): Promise<NotificationDto> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw AppError.notFound('Notification not found');
    if (notification.userId !== userId) throw AppError.notFound('Notification not found');
    const updated =
      notification.readAt
        ? notification
        : await this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
    return toDto(updated);
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  async preferences(userId: string): Promise<NotificationPreferences> {
    const existing = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (existing) {
      const events = (existing.eventTypes as Record<string, boolean> | null) ?? {};
      return {
        channels: existing.channels as NotificationPreferences['channels'],
        frequency: existing.frequency as NotificationPreferences['frequency'],
        eventTypes: Object.fromEntries(
          ALL_TYPES.map((type) => [type, events[type] !== false]),
        ) as Record<NotificationType, boolean>,
        updatedAt: existing.updatedAt.toISOString(),
      };
    }
    const created = await this.prisma.notificationPreference.create({
      data: {
        userId,
        channels: ['IN_APP'],
        frequency: 'INSTANT',
        eventTypes: Object.fromEntries(ALL_TYPES.map((type) => [type, true])),
      },
    });
    return {
      channels: ['IN_APP'],
      frequency: 'INSTANT',
      eventTypes: Object.fromEntries(ALL_TYPES.map((type) => [type, true])) as Record<
        NotificationType,
        boolean
      >,
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async updatePreferences(
    userId: string,
    input: UpdateNotificationPreferences,
  ): Promise<NotificationPreferences> {
    const current = await this.preferences(userId);
    const mergedEvents = { ...current.eventTypes, ...(input.eventTypes ?? {}) };
    await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        channels: input.channels ?? current.channels,
        frequency: input.frequency ?? current.frequency,
        eventTypes: mergedEvents,
      },
      update: {
        channels: input.channels ?? current.channels,
        frequency: input.frequency ?? current.frequency,
        eventTypes: mergedEvents,
      },
    });
    return this.preferences(userId);
  }

  async create(input: CreateNotificationInput): Promise<NotificationDto | null> {
    const preferences = await this.preferences(input.userId);
    if (preferences.eventTypes[input.type] === false) return null;
    const data: Prisma.NotificationUncheckedCreateInput = {
      userId: input.userId,
      type: input.type,
      title: input.title.slice(0, 140),
      body: input.body.slice(0, 600),
      link: input.link ?? null,
      dedupeKey: input.dedupeKey,
    };
    let notification: Notification;
    try {
      notification = await this.prisma.notification.create({ data });
    } catch (error) {
      if (isUniqueError(error)) {
        const existing = input.dedupeKey
          ? await this.prisma.notification.findUnique({
              where: { userId_dedupeKey: { userId: input.userId, dedupeKey: input.dedupeKey } },
            })
          : null;
        return existing ? toDto(existing) : null;
      }
      throw error;
    }
    if (preferences.channels.includes('EMAIL') && preferences.frequency === 'INSTANT') {
      const queued = await this.queue.add(
        QUEUES.notifications,
        { notificationId: notification.id },
        `notification:${notification.id}:email`,
      );
      if (!queued) this.logger.warn(`notification ${notification.id} email not queued`);
    }
    return toDto(notification);
  }
}

function toDto(notification: Notification): NotificationDto {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    read: Boolean(notification.readAt),
    createdAt: notification.createdAt.toISOString(),
  };
}

function isUniqueError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2002';
}
