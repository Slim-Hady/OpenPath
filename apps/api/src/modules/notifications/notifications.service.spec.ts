import { NotificationsService } from './notifications.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { QueueService } from '../../infra/queue.service';

describe('NotificationsService frequency', () => {
  function setup(frequency: 'INSTANT' | 'DAILY' | 'WEEKLY') {
    const prisma = {
      notificationPreference: {
        findUnique: jest.fn().mockResolvedValue({
          userId: 'u1',
          channels: ['IN_APP', 'EMAIL'],
          frequency,
          eventTypes: {},
          updatedAt: new Date(),
        }),
      },
      notification: {
        create: jest.fn().mockResolvedValue({
          id: 'n1',
          userId: 'u1',
          type: 'SYSTEM',
          title: 'Title',
          body: 'Body',
          link: null,
          readAt: null,
          dedupeKey: 'key',
          createdAt: new Date(),
        }),
        findUnique: jest.fn(),
      },
    };
    const queue = { add: jest.fn().mockResolvedValue(true) };
    const service = new NotificationsService(
      prisma as unknown as PrismaService,
      queue as unknown as QueueService,
    );
    return { service, queue, prisma };
  }

  it('enqueues email immediately for INSTANT', async () => {
    const { service, queue } = setup('INSTANT');
    await service.create({ userId: 'u1', type: 'SYSTEM', title: 'Title', body: 'Body' });
    expect(queue.add).toHaveBeenCalledTimes(1);
  });

  it('does not enqueue immediate email for DAILY or WEEKLY', async () => {
    for (const frequency of ['DAILY', 'WEEKLY'] as const) {
      const { service, queue } = setup(frequency);
      await service.create({ userId: 'u1', type: 'SYSTEM', title: 'Title', body: 'Body' });
      expect(queue.add).not.toHaveBeenCalled();
    }
  });

  it('suppresses a disabled event type before insert', async () => {
    const { service, prisma } = setup('INSTANT');
    (prisma.notificationPreference.findUnique as jest.Mock).mockResolvedValue({
      userId: 'u1',
      channels: ['IN_APP'],
      frequency: 'INSTANT',
      eventTypes: { SYSTEM: false },
      updatedAt: new Date(),
    });
    const result = await service.create({
      userId: 'u1',
      type: 'SYSTEM',
      title: 'Title',
      body: 'Body',
    });
    expect(result).toBeNull();
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });
});
