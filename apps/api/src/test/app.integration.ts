import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AdminMetricsSchema, MeSchema, ProfileSchema, SelectionSchema } from '@osh/contracts';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

jest.setTimeout(60_000);

describe('API integration (local Postgres)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let devToken: string;
  let adminToken: string;
  let otherUserId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
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
    await createUser('dev@test.dev', 'Dev User', 'dev-user', 'DEVELOPER');
    await createUser('admin@test.dev', 'Admin User', 'admin-user', 'ADMIN');
    devToken = 'dev:dev@test.dev';
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
