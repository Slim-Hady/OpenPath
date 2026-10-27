import { describe, expect, it } from 'vitest';
import { formatNumber, initials, relativeTime, truncate } from './utils';

describe('web utils', () => {
  it('builds initials from a name', () => {
    expect(initials('Amina Developer')).toBe('AD');
  });

  it('truncates only when needed', () => {
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('a long issue title', 8)).toBe('a long …');
  });

  it('formats relative times', () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60_000).toISOString();
    expect(relativeTime(twoMinutesAgo)).toBe('2m ago');
  });

  it('formats numbers without locale surprises in tests', () => {
    expect(formatNumber(12480)).toBe('12,480');
  });
});
