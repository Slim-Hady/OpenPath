import type { ExperienceLevel } from '@osh/contracts';

export const LANGUAGES = [
  'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C#', 'C++', 'C', 'PHP',
  'Ruby', 'Kotlin', 'Swift', 'Dart', 'Elixir', 'Scala', 'HTML', 'CSS', 'SQL', 'Shell', 'R', 'Lua',
];

export const SKILL_SUGGESTIONS = [
  'React', 'Next.js', 'Node.js', 'NestJS', 'Vue', 'Svelte', 'FastAPI', 'Django', 'Flask',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Git', 'GraphQL',
  'REST', 'Tailwind', 'Prisma', 'Supabase', 'Testing', 'CI/CD', 'Accessibility',
];

export const LEVELS: Array<{ value: ExperienceLevel; label: string; help: string }> = [
  { value: 'BEGINNER', label: 'Beginner', help: 'You have read code but have not shipped a PR.' },
  { value: 'INTERMEDIATE', label: 'Intermediate', help: 'You have shipped a few pull requests.' },
  { value: 'ADVANCED', label: 'Advanced', help: 'You review, maintain or mentor.' },
];

export const LEVEL_LABEL: Record<ExperienceLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export const PLATFORM_LINKS = [
  { href: '/learn/git-basics', label: 'Git basics' },
  { href: '/learn/pull-requests', label: 'Pull requests' },
];
