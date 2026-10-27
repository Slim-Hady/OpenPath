import { AppError } from '../../common/errors';
import { DiscoveryService } from './discovery.service';

const candidates = [1, 2, 3].map((n) => ({
  id: `test/repo#${n}`,
  number: n,
  repoFullName: 'test/repo',
  organization: 'test',
  title: `Issue ${n}`,
  url: `https://github.com/test/repo/issues/${n}`,
  labels: ['good first issue'],
  language: 'TypeScript',
  level: 'BEGINNER' as const,
  repoDescription: 'test',
  stars: 10,
  updatedAt: new Date().toISOString(),
  activityDays: 1,
  assigned: false,
  state: 'open',
}));

describe('DiscoveryService AI limits', () => {
  it('propagates a token-limit 429 instead of returning a rules fallback', async () => {
    const profile = {
      requireComplete: jest.fn().mockResolvedValue({
        experienceLevel: 'BEGINNER',
        languages: ['TypeScript'],
        skills: [],
        description: null,
      }),
    };
    const github = {
      searchIssues: jest.fn().mockResolvedValue({
        items: candidates,
        total: 3,
        cached: false,
        stale: false,
        fetchedAt: new Date().toISOString(),
        rateLimitedUntil: null,
      }),
    };
    const aiUsage = {
      assertAllowed: jest
        .fn()
        .mockRejectedValue(new AppError('AI_TOKEN_LIMIT', 'Monthly limit reached', 429)),
    };
    const service = new DiscoveryService(
      {} as never,
      profile as never,
      github as never,
      aiUsage as never,
      {} as never,
      { create: jest.fn() } as never,
    );
    await expect(
      service.recommend('u1', { language: 'TypeScript', label: 'good first issue' }, false),
    ).rejects.toMatchObject({ code: 'AI_TOKEN_LIMIT', status: 429 });
  });
});
