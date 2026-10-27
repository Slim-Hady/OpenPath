import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AccountHistorySchema, AdminMetricsSchema, MeSchema, ProfileSchema, SelectionSchema } from '@osh/contracts';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService, QUEUES } from '../infra/queue.service';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { AchievementsService } from '../modules/achievements/achievements.service';

jest.setTimeout(60_000);

describe('API integration (local Postgres)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let devToken: string;
  let adminToken: string;
  let otherUserId: string;
  let devUserId: string;
  let otherToken: string;
  const queueMock = {
    add: jest.fn().mockResolvedValue(true),
    addOrFail: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(QueueService)
      .useValue(queueMock)
      .compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    await app.init();
    prisma = app.get(PrismaService);

    await prisma.$executeRaw`TRUNCATE TABLE
      "User", "Skill", "Language", "GithubIssue", "Recommendation", "SuggestionEvent",
      "Selection", "ProgressEvent", "IgnoredIssue", "SavedList", "SavedItem",
      "RepositoryOnboarding", "IssueOnboarding", "ChatConversation", "ChatMessage",
      "Notification", "NotificationPreference", "Badge", "UserBadge", "Streak",
      "PublicProfile", "OutreachRequest", "OutreachConversation", "OutreachMessage",
      "BlockedUser", "LearningResource", "AdminSnapshot", "JobRun", "DeletionRequest",
      "SyncState", "AiSetting", "AiUsage", "AiUsageDaily", "DeveloperProfile"
      CASCADE`;

    otherUserId = await createUser('other@test.dev', 'Other User', 'other', 'DEVELOPER');
    devUserId = await createUser('dev@test.dev', 'Dev User', 'dev-user', 'DEVELOPER');
    await createUser('admin@test.dev', 'Admin User', 'admin-user', 'ADMIN');
    await prisma.publicProfile.upsert({
      where: { userId: otherUserId },
      create: { userId: otherUserId, handle: 'other-user', published: true, mentorOptIn: true },
      update: { published: true, mentorOptIn: true },
    });
    devToken = 'dev:dev@test.dev';
    otherToken = 'dev:other@test.dev';
    adminToken = 'dev:admin@test.dev';
  });

  afterAll(async () => {
    await app.close();
  });

  async function createUser(
    email: string,
    name: string,
    username: string,
    role: 'DEVELOPER' | 'MAINTAINER' | 'ADMIN',
  ): Promise<string> {
    const user = await prisma.user.create({
      data: {
        authId: `auth-${username}`,
        email,
        name,
        username,
        role,
        profile: { create: { experienceLevel: 'BEGINNER' } },
        notificationPrefs: {
          create: { channels: ['IN_APP'], frequency: 'INSTANT', eventTypes: {} },
        },
      },
    });
    const skill = await prisma.skill.upsert({
      where: { name: 'TypeScript' },
      create: { name: 'TypeScript' },
      update: {},
    });
    await prisma.userSkill.create({ data: { userId: user.id, skillId: skill.id } });
    const language = await prisma.language.upsert({
      where: { name: 'TypeScript' },
      create: { name: 'TypeScript' },
      update: {},
    });
    await prisma.userLanguage.create({ data: { userId: user.id, languageId: language.id } });
    return user.id;
  }

  async function createIssue(id: string, number: number) {
    await prisma.githubIssue.upsert({
      where: { id },
      create: {
        id,
        number,
        repoFullName: 'test/repo',
        organization: 'test',
        title: 'Add keyboard navigation to the docs search',
        body: 'The docs search cannot be used with the keyboard.',
        url: `https://github.com/test/repo/issues/${number}`,
        state: 'open',
        labels: ['good first issue', 'documentation'],
        language: 'TypeScript',
        level: 'BEGINNER',
        repoDescription: 'A test repository',
        stars: 100,
        activityAt: new Date(),
      },
      update: {},
    });
  }

  it('rejects a missing token on a protected endpoint', async () => {
    const response = await request(app.getHttpServer()).get('/me');
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  it('returns and contract-parses the current user', async () => {
    const response = await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${devToken}`);
    expect(response.status).toBe(200);
    const parsed = MeSchema.parse(response.body);
    expect(parsed.role).toBe('DEVELOPER');
    expect(parsed.email).toBe('dev@test.dev');
  });

  it('returns a complete profile and validates the response', async () => {
    const response = await request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${devToken}`);
    expect(response.status).toBe(200);
    const parsed = ProfileSchema.parse(response.body);
    expect(parsed.complete).toBe(true);
    expect(parsed.completeness).toBe(80);
  });

  it('rejects an invalid experience level with 400', async () => {
    const response = await request(app.getHttpServer())
      .put('/profile')
      .set('Authorization', `Bearer ${devToken}`)
      .send({ experienceLevel: 'EXPERT' });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.details?.[0]?.field).toContain('experienceLevel');
  });

  it('rejects a Developer on an Admin endpoint with 403', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/metrics')
      .set('Authorization', `Bearer ${devToken}`);
    expect(response.status).toBe(403);
  });

  it('lets an Admin read metrics and contract-parses them', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    const parsed = AdminMetricsSchema.parse(response.body);
    expect(parsed.registeredUsers).toBeGreaterThanOrEqual(3);
  });

  it('selects an issue exactly once and records the side effect', async () => {
    await createIssue('test/repo#10', 10);
    const response = await request(app.getHttpServer())
      .post('/selection')
      .set('Authorization', `Bearer ${devToken}`)
      .send({ issueId: 'test/repo#10', confirmed: true });
    expect(response.status).toBe(201);
    const parsed = SelectionSchema.parse(response.body);
    expect(parsed.status).toBe('IN_PROGRESS');
    const events = await prisma.progressEvent.findMany({
      where: { selectionId: parsed.id },
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.source).toBe('MANUAL');

    const duplicate = await request(app.getHttpServer())
      .post('/selection')
      .set('Authorization', `Bearer ${devToken}`)
      .send({ issueId: 'test/repo#10', confirmed: true });
    expect(duplicate.status).toBe(409);
  });

  it('persists exactly one notification for a repeated dedupe key', async () => {
    const notifications = app.get(NotificationsService);
    await notifications.create({
      userId: devUserId,
      type: 'SYSTEM',
      title: 'Dedupe',
      body: 'One row only',
      dedupeKey: 'test:dedupe',
    });
    await notifications.create({
      userId: devUserId,
      type: 'SYSTEM',
      title: 'Dedupe',
      body: 'One row only',
      dedupeKey: 'test:dedupe',
    });
    const count = await prisma.notification.count({
      where: { userId: devUserId, dedupeKey: 'test:dedupe' },
    });
    expect(count).toBe(1);
  });

  it('awards FIRST_PR on PR_OPEN and serves owner history', async () => {
    const selection = await prisma.selection.findFirstOrThrow({
      where: { userId: devUserId, issueId: 'test/repo#10' },
    });
    queueMock.add.mockClear();
    const updated = await request(app.getHttpServer())
      .patch(`/progress/${selection.id}`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        status: 'PR_OPEN',
        prUrl: 'https://github.com/test/repo/pull/10',
      });
    expect(updated.status).toBe(200);
    expect(queueMock.add).toHaveBeenCalledWith(
      QUEUES.gamification,
      { userId: devUserId },
      `badge:${devUserId}:${selection.id}`,
    );
    await prisma.badge.upsert({
      where: { code: 'FIRST_PR' },
      create: {
        code: 'FIRST_PR',
        name: 'First pull request',
        description: 'First PR',
        requirement: 'Open a PR',
        target: 1,
      },
      update: {},
    });
    await app.get(AchievementsService).evaluate(devUserId);
    const badges = await prisma.userBadge.findMany({
      where: { userId: devUserId },
      include: { badge: true },
    });
    expect(badges.some((row) => row.badge.code === 'FIRST_PR')).toBe(true);

    const history = await request(app.getHttpServer())
      .get('/me/history')
      .set('Authorization', `Bearer ${devToken}`);
    expect(history.status).toBe(200);
    const parsed = AccountHistorySchema.parse(history.body);
    expect(parsed.stats.selected).toBeGreaterThanOrEqual(1);
    expect(parsed.items[0]?.issueId).toBe('test/repo#10');
  });

  it('returns 404 for another user’s progress history', async () => {
    await createIssue('test/repo#11', 11);
    const selection = await prisma.selection.create({
      data: { userId: otherUserId, issueId: 'test/repo#11' },
    });
    const response = await request(app.getHttpServer())
      .get(`/progress/${selection.id}/history`)
      .set('Authorization', `Bearer ${devToken}`);
    expect(response.status).toBe(404);
  });

  it('enforces a unique sync dedupe key for a replayed job', async () => {
    const selection = await prisma.selection.findFirstOrThrow({
      where: { userId: devUserId, issueId: 'test/repo#10' },
    });
    await prisma.progressEvent.create({
      data: {
        selectionId: selection.id,
        status: 'PR_OPEN',
        source: 'SYNC',
        dedupeKey: 'test:sync:dedupe',
      },
    });
    await expect(
      prisma.progressEvent.create({
        data: {
          selectionId: selection.id,
          status: 'PR_OPEN',
          source: 'SYNC',
          dedupeKey: 'test:sync:dedupe',
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('runs the outreach lifecycle and enforces a block', async () => {
    const created = await request(app.getHttpServer())
      .post('/outreach')
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        recipientId: otherUserId,
        type: 'MENTORSHIP',
        message: 'Would you mentor me on this first contribution?',
      });
    expect(created.status).toBe(201);
    const requestId = created.body.id as string;

    const accepted = await request(app.getHttpServer())
      .patch(`/outreach/${requestId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ action: 'ACCEPT' });
    expect(accepted.status).toBe(200);
    expect(accepted.body.status).toBe('ACCEPTED');

    const message = await request(app.getHttpServer())
      .post(`/outreach/${requestId}/conversation/messages`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ body: 'Happy to help. What have you tried?' });
    expect(message.status).toBe(201);
    expect(message.body.messages.length).toBe(1);

    const second = await request(app.getHttpServer())
      .post('/outreach')
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        recipientId: otherUserId,
        type: 'RECRUITMENT',
        message: 'A second request should be blocked after the first is answered.',
      });
    expect(second.status).toBe(201);
    const blocked = await request(app.getHttpServer())
      .patch(`/outreach/${second.body.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ action: 'BLOCK' });
    expect(blocked.status).toBe(200);

    const denied = await request(app.getHttpServer())
      .post('/outreach')
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        recipientId: otherUserId,
        type: 'MENTORSHIP',
        message: 'This must be rejected because the recipient blocked me.',
      });
    expect(denied.status).toBe(403);
  });

  it('returns 404 when marking another user’s notification read', async () => {
    const notification = await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'SYSTEM',
        title: 'Other user notification',
        body: 'private',
      },
    });
    const response = await request(app.getHttpServer())
      .patch(`/notifications/${notification.id}/read`)
      .set('Authorization', `Bearer ${devToken}`);
    expect(response.status).toBe(404);
  });
});
