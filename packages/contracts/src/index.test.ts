import { describe, expect, it } from 'vitest';
import {
  CV_MAX_BYTES,
  DiscoveryQuerySchema,
  RecommendationResponseSchema,
  UpdateAiSettingsSchema,
  UpdateProfileSchema,
} from './index.js';

describe('contracts', () => {
  it('coerces discovery pagination and trims filters', () => {
    const parsed = DiscoveryQuerySchema.parse({ page: '2', perPage: '10', language: 'TypeScript' });
    expect(parsed.page).toBe(2);
    expect(parsed.language).toBe('TypeScript');
  });

  it('rejects an invalid repo filter', () => {
    expect(() => DiscoveryQuerySchema.parse({ repo: 'not-a-repo' })).toThrow();
  });

  it('caps profile languages and skills', () => {
    expect(() =>
      UpdateProfileSchema.parse({ languages: Array.from({ length: 9 }, (_, i) => `l${i}`) }),
    ).toThrow();
  });

  it('rejects an out-of-range temperature', () => {
    expect(() => UpdateAiSettingsSchema.parse({ temperature: 1.4 })).toThrow();
  });

  it('requires exactly three recommendations', () => {
    expect(() =>
      RecommendationResponseSchema.parse({
        batchId: 'b1',
        recommendations: [],
        fallback: false,
        fallbackReason: null,
        generatedAt: new Date().toISOString(),
        remainingTokens: 10,
      }),
    ).toThrow();
  });

  it('documents the CV limit as 5 MB', () => {
    expect(CV_MAX_BYTES).toBe(5 * 1024 * 1024);
  });
});
