import { AchievementsService } from './achievements.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { NotificationsService } from '../notifications/notifications.service';

describe('AchievementsService', () => {
  it('awards FIRST_PR when an open PR exists, without waiting for a merge', async () => {
    const prisma = {
      badge: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'b1',
            code: 'FIRST_PR',
            name: 'First pull request',
            description: 'First PR',
            requirement: 'Open a PR',
            target: 1,
          },
        ]),
      },
      userBadge: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
      selection: {
        count: jest
          .fn()
          .mockResolvedValueOnce(1) // pr: one open PR
          .mockResolvedValueOnce(0) // merged
          .mockResolvedValueOnce(1), // selected
      },
      progressEvent: { findMany: jest.fn().mockResolvedValue([]) },
      streak: { upsert: jest.fn().mockResolvedValue({}) },
    };
    const notifications = { create: jest.fn().mockResolvedValue(null) };
    const service = new AchievementsService(
      prisma as unknown as PrismaService,
      notifications as unknown as NotificationsService,
    );
    await service.evaluate('u1');
    expect(prisma.userBadge.create).toHaveBeenCalledWith({
      data: { userId: 'u1', badgeId: 'b1' },
    });
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'BADGE_EARNED', dedupeKey: 'badge:u1:FIRST_PR' }),
    );
  });
});
